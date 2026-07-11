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

    public function test_landing_page_renders_the_liquid_metal_navigation_scene(): void
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
            ->assertDontSee('useful digital systems.')
            ->assertDontSee('Explore my work')
            ->assertDontSee('fetchpriority="high"', false)
            ->assertSee('data-liquid-home', false)
            ->assertSee('data-liquid-canvas', false)
            ->assertSee('data-liquid-bodies', false)
            ->assertSee('data-liquid-navigation', false)
            ->assertDontSee('data-lava-index', false)
            ->assertDontSee('data-liquid-svg', false)
            ->assertDontSee('<animate', false)
            ->assertDontSee('data-motion-chip', false)
            ->assertDontSee('Quantified')
            ->assertDontSee('data-portfolio-chat', false)
            ->assertSee('href="http://localhost/en/about"', false)
            ->assertSee('href="http://localhost/en/projects"', false)
            ->assertDontSee('Developer work with a practical business edge');

        $this->assertSame(3, substr_count($response->getContent(), 'data-liquid-navigation'));
        $this->assertSame(3, substr_count($response->getContent(), 'data-body-index='));

        $this->get('/de')
            ->assertOk()
            ->assertSee('Software Engineer')
            ->assertDontSee('Arbeit entdecken')
            ->assertSee('Profil')
            ->assertSee('Projekte');
    }

    public function test_about_and_projects_pages_render_per_locale(): void
    {
        $this->get('/en/about')
            ->assertOk()
            ->assertSee('aria-current="page"', false)
            ->assertSee('A practical developer with a business edge')
            ->assertSee('Business Informatics BSc from 09/2026')
            ->assertSee('Laravel');

        $this->get('/de/projects')
            ->assertOk()
            ->assertSee('Proof of Work')
            ->assertSee('Quantified')
            ->assertSee('Jay-Jay');
    }

    public function test_contact_and_imprint_pages_render_per_locale(): void
    {
        $this->get('/en/contact')
            ->assertOk()
            ->assertSee('<title>Jeremy', false)
            ->assertSee('Send context')
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
