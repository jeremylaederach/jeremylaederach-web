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
        } finally {
            if ($existingHotFile === null) {
                File::delete($hotFile);
            } else {
                File::put($hotFile, $existingHotFile);
            }
        }
    }
}
