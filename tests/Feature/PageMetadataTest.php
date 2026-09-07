<?php

namespace Tests\Feature;

use Tests\TestCase;

class PageMetadataTest extends TestCase
{
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
        $pages = ['home', 'about', 'projects', 'quantified', 'jay-jay', 'session-deck', 'contact', 'imprint', 'privacy'];

        foreach (array_keys(config('portfolio.locales')) as $locale) {
            $titles = [];

            foreach ($pages as $page) {
                $url = route($page, ['locale' => $locale]);
                $html = $this->get($url)->assertOk()->getContent();
                preg_match('/<title>(.*?)<\/title>/', $html, $matches);
                $titles[] = $matches[1];

                $this->assertStringContainsString('rel="canonical" href="'.$url.'/"', $html);
                $this->assertStringContainsString('property="og:url" content="'.$url.'/"', $html);
                $this->assertStringNotContainsString('name="robots" content="noindex"', $html);

                foreach (['en', 'de'] as $language) {
                    $alternate = route($page, ['locale' => $language]).'/';
                    $this->assertStringContainsString('rel="alternate" hreflang="'.$language.'" href="'.$alternate.'"', $html);
                }
            }

            $this->assertCount(count($pages), array_unique($titles));
        }
    }

    public function test_missing_pages_are_not_indexed_or_canonicalized_to_the_homepage(): void
    {
        $this->withoutVite();

        foreach (['en', 'de'] as $locale) {
            $this->get("/{$locale}/missing")
                ->assertNotFound()
                ->assertSee(config("portfolio.content.{$locale}.not_found.heading").' · Jeremy Läderach')
                ->assertSee('name="robots" content="noindex"', false)
                ->assertDontSee('rel="canonical"', false)
                ->assertDontSee('rel="alternate"', false);
        }
    }
}
