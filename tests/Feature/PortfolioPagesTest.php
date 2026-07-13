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

    public function test_landing_page_renders_the_liquid_glass_navigation_scene(): void
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
            ->assertDontSee('fetchpriority="high"', false)
            ->assertSee('class="landing-scene"', false)
            ->assertSee('data-liquid-stage', false)
            ->assertSee('class="landing-liquid-nav"', false)
            ->assertSee('data-page-main', false)
            ->assertSee('brand/liquid/liquid-projects.png', false)
            ->assertSee('brand/liquid/liquid-about.png', false)
            ->assertSee('brand/liquid/liquid-contact.png', false)
            ->assertDontSee('data-liquid-canvas', false)
            ->assertDontSee('data-motion-chip', false)
            ->assertDontSee('Quantified')
            ->assertDontSee('data-portfolio-chat', false)
            ->assertSee('href="http://localhost/en/about"', false)
            ->assertSee('href="http://localhost/en/projects"', false)
            ->assertDontSee('Developer work with a practical business edge');

        $this->assertSame(3, substr_count($response->getContent(), 'data-liquid-route'));

        $this->get('/de')
            ->assertOk()
            ->assertSee('Software Engineer')
            ->assertSee('nützliche digitale Systeme.')
            ->assertSee('Profil')
            ->assertSee('Projekte');
    }

    public function test_about_and_projects_pages_render_per_locale(): void
    {
        $this->get('/en/about')
            ->assertOk()
            ->assertSee('aria-current="page"', false)
            ->assertSee('detail-page--about', false)
            ->assertSee('brand/liquid/liquid-about.png', false)
            ->assertSee('data-scene="about"', false)
            ->assertSee('Tech I work with')
            ->assertSee('Laravel')
            ->assertSee('PostgreSQL')
            ->assertDontSee('page-stage', false);

        $this->get('/de/projects')
            ->assertOk()
            ->assertSee('detail-page--projects', false)
            ->assertSee('brand/liquid/liquid-projects.png', false)
            ->assertSee('data-scene="projects"', false)
            ->assertSee('Projekte')
            ->assertSee('Quantified')
            ->assertSee('Jay-Jay Web')
            ->assertSee('Scherer Garten');
    }

    public function test_contact_and_imprint_pages_render_per_locale(): void
    {
        $this->get('/en/contact')
            ->assertOk()
            ->assertSee('<title>Jeremy', false)
            ->assertSee('detail-page--contact', false)
            ->assertSee('brand/liquid/liquid-contact.png', false)
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
