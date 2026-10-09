<?php

namespace Tests\Feature;

use Illuminate\Routing\Route as RoutingRoute;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Tests\TestCase;

class PageMetadataTest extends TestCase
{
    private const PAGES = ['home', 'about', 'projects', 'quantified', 'jay-jay', 'session-deck', 'contact', 'imprint', 'privacy'];

    public function test_the_named_locale_routes_are_exactly_the_public_pages(): void
    {
        $namedRoutes = collect(Route::getRoutes()->getRoutesByName())
            ->filter(fn (RoutingRoute $route): bool => in_array('locale', $route->parameterNames(), true))
            ->keys()
            ->all();

        $this->assertSame(self::PAGES, $namedRoutes);
    }

    public function test_about_page_uses_only_its_localized_heading_as_the_tab_title(): void
    {
        $this->withoutVite();

        foreach (['en' => 'About me', 'de' => 'Über mich'] as $locale => $title) {
            $this->get("/{$locale}/about")
                ->assertOk()
                ->assertSee('<title>'.$title.'</title>', false)
                ->assertSee('property="og:title" content="'.$title.'"', false);
        }
    }

    public function test_each_localized_page_has_a_distinct_title_and_matching_language_links(): void
    {
        $this->withoutVite();

        foreach (array_keys(config('portfolio.locales')) as $locale) {
            $titles = [];

            foreach (self::PAGES as $page) {
                $url = route($page, ['locale' => $locale]);
                $html = $this->get($url)->assertOk()->content();
                $title = Str::match('/<title>(.*?)<\/title>/', $html);
                $titles[] = $title;

                if ($page === 'home') {
                    $this->assertSame('Jeremy Läderach', $title);
                } else {
                    $this->assertNotSame('', $title);
                    $this->assertStringNotContainsString('Jeremy', $title);
                }
                $this->assertStringContainsString('property="og:title" content="'.$title.'"', $html);

                $this->assertStringContainsString('rel="canonical" href="'.$url.'/"', $html);
                $this->assertStringContainsString('property="og:url" content="'.$url.'/"', $html);
                $this->assertStringContainsString('property="og:image" content="'.asset('brand/link-preview.png').'"', $html);
                $this->assertStringContainsString('name="twitter:card" content="summary_large_image"', $html);
                $this->assertStringNotContainsString('name="robots" content="noindex"', $html);

                foreach (['en', 'de'] as $language) {
                    $alternate = route($page, ['locale' => $language]).'/';
                    $this->assertStringContainsString('rel="alternate" hreflang="'.$language.'" href="'.$alternate.'"', $html);
                }
            }

            $this->assertCount(count(self::PAGES), array_unique($titles));
        }
    }

    public function test_missing_pages_are_not_indexed_or_canonicalized_to_the_homepage(): void
    {
        $this->withoutVite();

        foreach (['en', 'de'] as $locale) {
            $this->get("/{$locale}/missing")
                ->assertNotFound()
                ->assertSee('<title>'.config("portfolio.content.{$locale}.not_found.heading").'</title>', false)
                ->assertSee('name="robots" content="noindex"', false)
                ->assertDontSee('rel="canonical"', false)
                ->assertDontSee('rel="alternate"', false)
                ->assertDontSee('property="og:image"', false);
        }
    }
}
