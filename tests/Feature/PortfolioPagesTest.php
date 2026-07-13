<?php

namespace Tests\Feature;

use Tests\TestCase;

class PortfolioPagesTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_root_redirects_to_default_locale(): void
    {
        $this->get('/')
            ->assertRedirect('/en');
    }

    public function test_landing_page_renders_the_liquid_navigation_scene(): void
    {
        $response = $this->get('/en');

        $response
            ->assertOk()
            ->assertSee('<title>Jeremy', false)
            ->assertSee('Jeremy')
            ->assertSee('Software Engineer')
            ->assertSee('About me')
            ->assertSee('Projects')
            ->assertSee('Contact')
            ->assertSee('useful digital systems.')
            ->assertSee('class="landing-page"', false)
            ->assertSee('data-liquid-stage', false)
            ->assertSee('class="liquid-navigation"', false)
            ->assertSee('data-liquid-canvas', false)
            ->assertSee('class="liquid-stage__fallback"', false)
            ->assertSee('data-sound-toggle', false)
            ->assertSee('data-page-main', false)
            ->assertDontSee('brand/liquid/', false)
            ->assertDontSee('data-motion-chip', false)
            ->assertDontSee('data-portfolio-chat', false)
            ->assertDontSee('Quantified')
            ->assertSee('href="http://localhost/en/about"', false)
            ->assertSee('href="http://localhost/en/projects"', false);

        $this->assertSame(3, substr_count($response->getContent(), 'data-liquid-route'));

        $this->get('/de')
            ->assertOk()
            ->assertSee('Software Engineer')
            ->assertSee('nützliche digitale Systeme.')
            ->assertSee('Profil')
            ->assertSee('Projekte');

        $this->assertFileDoesNotExist(public_path('brand/liquid/liquid-projects.png'));
        $this->assertFileDoesNotExist(public_path('brand/liquid/liquid-about.png'));
        $this->assertFileDoesNotExist(public_path('brand/liquid/liquid-contact.png'));
    }

    public function test_about_and_projects_pages_render_per_locale(): void
    {
        $this->get('/en/about')
            ->assertOk()
            ->assertSee('aria-current="page"', false)
            ->assertSee('page-scene--about', false)
            ->assertSee('aria-hidden="true"', false)
            ->assertSee('data-scene="about"', false)
            ->assertSee('Tech I work with')
            ->assertSee('Laravel')
            ->assertSee('PostgreSQL')
            ->assertDontSee('page-stage', false);

        $this->get('/de/projects')
            ->assertOk()
            ->assertSee('page-scene--projects', false)
            ->assertSee('data-scene="projects"', false)
            ->assertSee('Projekte')
            ->assertSee('Hauptprojekt')
            ->assertSee('Quantified')
            ->assertSee('Jay-Jay Web')
            ->assertSee('Scherer Garten');
    }

    public function test_contact_and_imprint_pages_render_per_locale(): void
    {
        $this->get('/en/contact')
            ->assertOk()
            ->assertSee('<title>Jeremy', false)
            ->assertSee('page-scene--contact', false)
            ->assertSee('data-scene="contact"', false)
            ->assertSee('Send message')
            ->assertSee('name="message"', false)
            ->assertSee('info@jeremylaederach.ch')
            ->assertSee('GitHub');

        $this->get('/de/imprint')
            ->assertOk()
            ->assertSee('Impressum')
            ->assertSee('Verantwortlich');
    }

    public function test_unsupported_locale_returns_not_found(): void
    {
        $this->get('/fr')
            ->assertNotFound();
    }
}
