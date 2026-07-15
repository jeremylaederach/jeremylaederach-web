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

    public function test_landing_page_renders_the_kinetic_route_index(): void
    {
        $response = $this->get('/en');

        $response
            ->assertOk()
            ->assertSee('<title>Jeremy', false)
            ->assertSee('Jeremy')
            ->assertSee('Software Engineer')
            ->assertSee('About')
            ->assertSee('Projects')
            ->assertSee('Contact')
            ->assertSee('I build useful digital systems and thoughtful web experiences.')
            ->assertSee('class="kinetic-index"', false)
            ->assertSee('class="index-navigation"', false)
            ->assertSee('data-index-panel', false)
            ->assertSee('data-page-transition', false)
            ->assertSee('data-sound-toggle', false)
            ->assertSee('data-page-main', false)
            ->assertDontSee('data-project-stage', false)
            ->assertDontSee('data-project-canvas', false)
            ->assertDontSee('brand/liquid/', false)
            ->assertDontSee('data-motion-chip', false)
            ->assertDontSee('data-portfolio-chat', false)
            ->assertSee('Quantified')
            ->assertSee('Jay-Jay Web')
            ->assertSee('Scherer Garten')
            ->assertSee('href="http://localhost/en/about"', false)
            ->assertSee('href="http://localhost/en/projects"', false);

        $this->assertSame(3, substr_count($response->getContent(), 'data-index-panel'));

        $this->get('/de')
            ->assertOk()
            ->assertSee('Software Engineer')
            ->assertSee('nützliche digitale Systeme')
            ->assertSee('Profil')
            ->assertSee('Projekte');

        $this->assertFileDoesNotExist(public_path('brand/liquid/liquid-projects.png'));
        $this->assertFileDoesNotExist(public_path('brand/liquid/liquid-about.png'));
        $this->assertFileDoesNotExist(public_path('brand/liquid/liquid-contact.png'));
    }

    public function test_about_and_projects_pages_render_per_locale(): void
    {
        $about = $this->get('/en/about');

        $about
            ->assertOk()
            ->assertSee('aria-current="page"', false)
            ->assertSee('class="portfolio-page about-page"', false)
            ->assertSee('class="about-story"', false)
            ->assertSee('class="career-list"', false)
            ->assertSee('class="technology-grid"', false)
            ->assertSee('Software with purpose, built from real requirements.')
            ->assertDontSee('class="about-facts"', false)
            ->assertDontSee('class="principles-list"', false)
            ->assertDontSee('How I work')
            ->assertSee('Tools I work with')
            ->assertSee('Application Developer EFZ')
            ->assertSee('Business Informatics BSc')
            ->assertSee('ASP.NET Core')
            ->assertSee('REST APIs')
            ->assertSee('PostgreSQL')
            ->assertDontSee('page-stage', false)
            ->assertDontSee('data-project-stage', false);

        $this->assertSame(5, substr_count($about->getContent(), 'data-technology-icon='));

        $projects = $this->get('/de/projects');

        $projects
            ->assertOk()
            ->assertSee('class="portfolio-page projects-page"', false)
            ->assertSee('class="project-cases"', false)
            ->assertSee('assets/work/jay-jay-home.jpg', false)
            ->assertSee('assets/work/scherer-garten.jpg', false)
            ->assertSee('Projekte')
            ->assertSee('Hauptprojekt')
            ->assertSee('Quantified')
            ->assertSee('Jay-Jay Web')
            ->assertSee('Scherer Garten');

        $this->assertSame(3, substr_count($projects->getContent(), 'class="project-case project-case--'));
    }

    public function test_contact_and_imprint_pages_render_per_locale(): void
    {
        $this->get('/en/contact')
            ->assertOk()
            ->assertSee('<title>Jeremy', false)
            ->assertSee('class="portfolio-page contact-page"', false)
            ->assertSee('class="contact-workspace"', false)
            ->assertSee('class="contact-form"', false)
            ->assertSee('Send message')
            ->assertSee('name="name"', false)
            ->assertSee('name="email"', false)
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
            ->assertNotFound()
            ->assertSee('Page not found')
            ->assertSee('href="http://localhost/en"', false);
    }

    public function test_not_found_page_uses_the_requested_supported_locale(): void
    {
        $this->get('/en/does-not-exist')
            ->assertNotFound()
            ->assertSee('class="not-found-page"', false)
            ->assertSee('Page not found')
            ->assertSee('Back to home')
            ->assertSee('data-page="not-found"', false);

        $this->get('/de/gibt-es-nicht')
            ->assertNotFound()
            ->assertSee('Seite nicht gefunden')
            ->assertSee('Zurück zur Startseite')
            ->assertSee('href="http://localhost/de"', false);
    }
}
