<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Tests\TestCase;

class StaticExportTest extends TestCase
{
    public function test_it_exports_a_hardened_static_plesk_package(): void
    {
        $hotFile = public_path('hot');
        $existingHotFile = File::exists($hotFile) ? File::get($hotFile) : null;
        $developmentUrl = 'http://[::1]:5175';

        File::put($hotFile, $developmentUrl);

        try {
            $this->artisan('site:export-static')->assertSuccessful();

            $englishHome = File::get(base_path('dist-static/en/index.html'));
            $germanHome = File::get(base_path('dist-static/de/index.html'));
            $rootHtaccess = File::get(base_path('dist-static/.htaccess'));
            $phpFiles = collect(File::allFiles(base_path('dist-static')))
                ->filter(fn ($file): bool => strtolower($file->getExtension()) === 'php')
                ->map(fn ($file): string => str_replace('\\', '/', $file->getRelativePathname()))
                ->sort()
                ->values()
                ->all();

            $this->assertSame($developmentUrl, File::get($hotFile));
            $this->assertFalse(File::exists(base_path('dist-static/hot')));
            $this->assertFalse(File::exists(base_path('dist-static/fonts-manifest.dev.json')));
            $this->assertFalse(File::exists(base_path('dist-static/index.php')));
            $this->assertFileExists(base_path('dist-static/404.html'));
            $this->assertFileExists(base_path('dist-static/en/404/index.html'));
            $this->assertFileExists(base_path('dist-static/de/404/index.html'));
            $this->assertFileExists(base_path('dist-static/en/quantified/index.html'));
            $this->assertFileExists(base_path('dist-static/de/session-deck/index.html'));
            $this->assertSame([], $phpFiles);
            $this->assertStringContainsString('Content-Security-Policy', $rootHtaccess);
            $this->assertStringContainsString('Strict-Transport-Security "max-age=31536000"', $rootHtaccess);
            $this->assertStringContainsString('X-Content-Type-Options "nosniff"', $rootHtaccess);
            $this->assertStringContainsString('X-Frame-Options "DENY"', $rootHtaccess);
            $this->assertStringNotContainsString('/@vite/client', $englishHome);
            $this->assertStringNotContainsString('localhost', $englishHome);
            $this->assertStringNotContainsString('[::1]', $englishHome);
            $this->assertStringContainsString('/build/assets/app-', $englishHome);
            $this->assertStringContainsString('Jeremy', $englishHome);
            $this->assertStringContainsString('Jeremy', $germanHome);
            $this->assertStringContainsString('rel="canonical" href="https://jeremylaederach.ch/en/"', $englishHome);
            $this->assertStringContainsString('hreflang="de" href="https://jeremylaederach.ch/de/"', $englishHome);
            $this->assertStringContainsString('href="/en/about"', $englishHome);
            $this->assertStringContainsString('Sitemap: https://jeremylaederach.ch/sitemap.xml', File::get(base_path('dist-static/robots.txt')));
            $sitemap = simplexml_load_file(base_path('dist-static/sitemap.xml'));
            $this->assertCount(18, $sitemap->url);
            $this->assertSame('https://jeremylaederach.ch/en/', (string) $sitemap->url[0]->loc);
            $this->assertDirectoryDoesNotExist(storage_path('app/static-export'));
            $this->assertDirectoryDoesNotExist(storage_path('app/static-export.previous'));
        } finally {
            if ($existingHotFile === null) {
                File::delete($hotFile);
            } else {
                File::put($hotFile, $existingHotFile);
            }
        }
    }

    public function test_a_failed_export_preserves_the_previous_package_and_restores_vite(): void
    {
        $this->artisan('site:export-static')->assertSuccessful();
        $previousHome = File::get(base_path('dist-static/en/index.html'));
        $probe = public_path('static-export-test.php');
        $hotFile = public_path('hot');
        $previousHotFile = File::exists($hotFile) ? File::get($hotFile) : null;
        $this->assertFileDoesNotExist($probe);

        File::put($probe, '<?php // Static exports must reject server-side files.');
        File::put($hotFile, 'http://localhost:5173');

        try {
            $this->artisan('site:export-static')->assertFailed();
            $this->assertSame($previousHome, File::get(base_path('dist-static/en/index.html')));
            $this->assertSame('http://localhost:5173', File::get($hotFile));
            $this->assertFileDoesNotExist(base_path('dist-static/static-export-test.php'));
            $this->assertDirectoryDoesNotExist(storage_path('app/static-export'));
        } finally {
            File::delete($probe);

            if ($previousHotFile === null) {
                File::delete($hotFile);
            } else {
                File::put($hotFile, $previousHotFile);
            }
        }
    }
}
