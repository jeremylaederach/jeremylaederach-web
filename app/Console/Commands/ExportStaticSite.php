<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\URL;
use RuntimeException;
use SimpleXMLElement;

class ExportStaticSite extends Command
{
    protected $signature = 'site:export-static';

    protected $description = 'Export the portfolio as a static Plesk deployment package';

    /**
     * @var array<int, string>
     */
    private array $pages = [
        '/en',
        '/en/about',
        '/en/projects',
        '/en/quantified',
        '/en/jay-jay',
        '/en/session-deck',
        '/en/contact',
        '/en/imprint',
        '/en/privacy',
        '/de',
        '/de/about',
        '/de/projects',
        '/de/quantified',
        '/de/jay-jay',
        '/de/session-deck',
        '/de/contact',
        '/de/imprint',
        '/de/privacy',
    ];

    public function handle(Kernel $kernel): int
    {
        $hotFile = public_path('hot');
        $hotFileContents = File::exists($hotFile) ? File::get($hotFile) : null;
        $stagingDirectory = storage_path('app/static-export');

        File::delete($hotFile);

        try {
            if (! File::isFile(public_path('build/manifest.json'))) {
                $this->components->error('Build assets first with npm run build:static.');

                return self::FAILURE;
            }

            File::deleteDirectory($stagingDirectory);

            if ($this->exportSite($kernel, $stagingDirectory) !== self::SUCCESS) {
                return self::FAILURE;
            }

            // Windows file watchers can briefly keep renamed directories locked.
            retry(3, fn () => $this->publishExport($stagingDirectory), 100);
            $this->components->info('Static portfolio exported to dist-static/.');

            return self::SUCCESS;
        } finally {
            File::deleteDirectory($stagingDirectory);
            URL::forceRootUrl(config('app.url'));
            URL::forceScheme(null);

            if ($hotFileContents !== null) {
                File::put($hotFile, $hotFileContents);
            }
        }
    }

    private function exportSite(Kernel $kernel, string $outputDirectory): int
    {
        $siteUrl = 'https://jeremylaederach.ch';

        if (! File::copyDirectory(public_path(), $outputDirectory)) {
            throw new RuntimeException('Could not copy public assets into the static export.');
        }
        File::delete([
            $outputDirectory.'/index.php',
            $outputDirectory.'/hot',
            $outputDirectory.'/fonts-manifest.dev.json',
        ]);

        if (! $this->containsNoPhpFiles($outputDirectory)) {
            return self::FAILURE;
        }

        URL::forceRootUrl($siteUrl);
        URL::forceScheme('https');

        foreach ($this->pages as $page) {
            if (! $this->exportPage($kernel, $siteUrl, $outputDirectory, $page)) {
                return self::FAILURE;
            }
        }

        foreach (['en', 'de'] as $locale) {
            if (! $this->exportPage($kernel, $siteUrl, $outputDirectory, "/{$locale}/404", 404)) {
                return self::FAILURE;
            }
        }

        File::copy($outputDirectory.'/en/404/index.html', $outputDirectory.'/404.html');
        File::put($outputDirectory.'/.htaccess', $this->rootHtaccess());
        File::put($outputDirectory.'/en/.htaccess', "ErrorDocument 404 /en/404/index.html\n");
        File::put($outputDirectory.'/de/.htaccess', "ErrorDocument 404 /de/404/index.html\n");
        File::put($outputDirectory.'/index.html', $this->rootRedirect());
        $sitemap = new SimpleXMLElement('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');

        foreach ($this->pages as $page) {
            $sitemap->addChild('url')->addChild('loc', $siteUrl.$page.'/');
        }

        File::put($outputDirectory.'/sitemap.xml', $sitemap->asXML());

        return self::SUCCESS;
    }

    private function publishExport(string $stagingDirectory): void
    {
        $outputDirectory = base_path('dist-static');
        $backupDirectory = storage_path('app/static-export.previous');

        if (File::exists($backupDirectory)) {
            throw new RuntimeException('A previous export backup exists in storage/app/static-export.previous; inspect it before rebuilding.');
        }

        if (File::exists($outputDirectory) && ! File::moveDirectory($outputDirectory, $backupDirectory)) {
            throw new RuntimeException('Could not preserve the previous static export.');
        }

        if (! File::moveDirectory($stagingDirectory, $outputDirectory)) {
            if (File::exists($backupDirectory)) {
                File::moveDirectory($backupDirectory, $outputDirectory);
            }

            throw new RuntimeException('Could not publish the static export.');
        }

        File::deleteDirectory($backupDirectory);
    }

    private function containsNoPhpFiles(string $outputDirectory): bool
    {
        $phpFiles = collect(File::allFiles($outputDirectory))
            ->filter(fn ($file): bool => strtolower($file->getExtension()) === 'php')
            ->map(fn ($file): string => str_replace('\\', '/', $file->getRelativePathname()))
            ->sort()
            ->values()
            ->all();

        if ($phpFiles === []) {
            return true;
        }

        $this->components->error('Static export aborted: PHP files were found in the deployment output.');

        return false;
    }

    private function rootHtaccess(): string
    {
        return <<<'HTACCESS'
Options -Indexes -MultiViews
ServerSignature Off
DirectoryIndex index.html
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^quantified/?$ /en/quantified/ [R=301,L]
    RewriteRule ^jay-jay/?$ /en/jay-jay/ [R=301,L]
    RewriteRule ^session-deck/?$ /en/session-deck/ [R=301,L]
    RewriteRule ^jay-jay-client-hub/?$ /en/jay-jay/#client-hub [R=301,L,NE]
    RewriteRule ^(en|de)/jay-jay-client-hub/?$ /$1/jay-jay/#client-hub [R=301,L,NE]
</IfModule>

<IfModule mod_headers.c>
    Header always set Content-Security-Policy "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self' data:; form-action 'self'; frame-ancestors 'none'; frame-src 'none'; img-src 'self' data:; media-src 'self'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; worker-src 'none'; upgrade-insecure-requests"
    Header always set Cross-Origin-Opener-Policy "same-origin"
    Header always set Cross-Origin-Resource-Policy "same-origin"
    Header always set Permissions-Policy "camera=(), geolocation=(), microphone=(), payment=(), usb=()"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Strict-Transport-Security "max-age=31536000"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
</IfModule>

<FilesMatch "(^\.|^\.env(?:\..*)?$|^artisan$|^composer\.(?:json|lock)$|^package(?:-lock)?\.json$|^phpunit\.xml$|^vite\.config\..*$)">
    Require all denied
</FilesMatch>
HTACCESS;
    }

    private function rootRedirect(): string
    {
        return <<<'HTML'
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=/en/"><link rel="canonical" href="/en/"></head><body></body></html>
HTML;
    }

    private function exportPage(
        Kernel $kernel,
        string $siteUrl,
        string $outputDirectory,
        string $page,
        int $expectedStatus = 200,
    ): bool {
        $request = Request::create($siteUrl.$page, 'GET');
        $response = $kernel->handle($request);

        if ($response->getStatusCode() !== $expectedStatus) {
            $this->components->error("Could not export {$page} (HTTP {$response->getStatusCode()}).");

            return false;
        }

        $content = $response->getContent();

        if ($content === false) {
            $this->components->error("Could not export {$page}: the response did not contain HTML.");

            return false;
        }

        if (
            str_contains($content, '/@vite/client')
            || str_contains($content, 'localhost')
            || str_contains($content, '[::1]')
        ) {
            $this->components->error("Could not export {$page}: development asset URLs were detected.");

            return false;
        }

        $outputPath = $outputDirectory.$page.'/index.html';

        File::ensureDirectoryExists(dirname($outputPath));
        // Navigation and assets work in local previews; discovery metadata stays absolute.
        $content = preg_replace_callback(
            '/<(?:a|link|img|script)\b[^>]*>/i',
            fn (array $tag): string => str_contains($tag[0], 'data-page-meta')
                ? $tag[0]
                : str_replace($siteUrl, '', $tag[0]),
            $content,
        );

        File::put($outputPath, $content);
        $kernel->terminate($request, $response);

        return true;
    }
}
