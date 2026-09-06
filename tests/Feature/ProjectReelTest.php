<?php

namespace Tests\Feature;

use Tests\TestCase;

class ProjectReelTest extends TestCase
{
    public function test_project_galleries_have_localized_controls_and_one_accessible_initial_slide(): void
    {
        $this->withoutVite();

        foreach (['en', 'de'] as $locale) {
            $ui = config("portfolio.content.{$locale}.ui");

            foreach (['quantified', 'jay-jay', 'session-deck'] as $project) {
                $response = $this->get("/{$locale}/{$project}");
                $response->assertOk()
                    ->assertSee('class="project-reel__frame"', false)
                    ->assertSee($ui['media_preview'])
                    ->assertSee('aria-label="'.$ui['media_previous'].'"', false)
                    ->assertSee('aria-label="'.$ui['media_next'].'"', false)
                    ->assertDontSee('data-reel-autoplay', false);

                $html = $response->getContent();
                $this->assertSame(3, substr_count($html, 'data-reel-slide'));
                $this->assertSame(3, substr_count($html, 'data-reel-index='));
                $this->assertSame(1, substr_count($html, 'data-state="active"'));
                $this->assertSame(2, preg_match_all('/data-state="inactive"[^>]+\binert\b/s', $html));

                if ($project === 'jay-jay') {
                    $response->assertSee('data-reel-kind>Screenshot', false);
                } else {
                    $response->assertSee('data-reel-kind>'.$ui['media_preview'], false);
                }
            }
        }
    }
}
