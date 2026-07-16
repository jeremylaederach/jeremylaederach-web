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
            ->assertSee('class="kinetic-index__heading" aria-label="Jeremy Läderach."', false)
            ->assertSee('class="kinetic-index__wordmark"', false)
            ->assertDontSee('class="kinetic-index__eyebrow"', false)
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
            ->assertSee('SessionDeck')
            ->assertSee('href="http://localhost/en/about"', false)
            ->assertSee('href="http://localhost/en/projects"', false);

        $this->assertSame(3, substr_count($response->getContent(), 'data-index-panel'));
        $this->assertSame(15, substr_count($response->getContent(), 'class="kinetic-index__letter kinetic-index__letter--tone-'));

        $this->get('/de')
            ->assertOk()
            ->assertSee('Softwareentwickler')
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
            ->assertSee('class="section-label about-section-label"', false)
            ->assertSee('class="career-list"', false)
            ->assertSee('class="technology-grid"', false)
            ->assertSee('Software with purpose, built from real requirements.')
            ->assertDontSee('class="about-facts"', false)
            ->assertDontSee('class="principles-list"', false)
            ->assertDontSee('How I work')
            ->assertSee('Tools I work with')
            ->assertSee('Experience')
            ->assertSee('Toolkit')
            ->assertSee('Application Developer EFZ')
            ->assertSee('Business Informatics BSc')
            ->assertSee('ASP.NET Core')
            ->assertSee('REST APIs')
            ->assertSee('PostgreSQL')
            ->assertDontSee('page-stage', false)
            ->assertDontSee('data-project-stage', false);

        $this->assertSame(5, substr_count($about->getContent(), 'data-technology-icon='));
        $this->assertSame(3, substr_count($about->getContent(), 'class="section-label about-section-label"'));

        $this->get('/de/about')
            ->assertOk()
            ->assertSee('Erfahrung')
            ->assertSee('Tools')
            ->assertSee('Technologien, mit denen ich arbeite')
            ->assertDontSee('Stationen');

        $projects = $this->get('/de/projects');

        $projects
            ->assertOk()
            ->assertSee('class="portfolio-page projects-page"', false)
            ->assertSee('class="project-cases"', false)
            ->assertSee('assets/work/jay-jay-home.png', false)
            ->assertSee('assets/work/sessiondeck-main.png', false)
            ->assertSee('Projekte')
            ->assertSee('Hauptprojekt')
            ->assertSee('Quantified')
            ->assertSee('Persönliches Analyseprodukt')
            ->assertSee('Jay-Jay Web')
            ->assertSee('Zweisprachige Service-Website')
            ->assertSee('Laravel 13')
            ->assertSee('SessionDeck')
            ->assertSee('Nativer Workspace-Launcher')
            ->assertSee('WinUI 3')
            ->assertSee('href="http://localhost/de/quantified"', false)
            ->assertSee('href="http://localhost/de/jay-jay"', false)
            ->assertSee('href="http://localhost/de/session-deck"', false)
            ->assertSee('data-transition-theme="quantified"', false)
            ->assertSee('data-transition-theme="jay-jay"', false)
            ->assertSee('data-transition-theme="session-deck"', false)
            ->assertSee('data-pointer-route="quantified"', false)
            ->assertSee('data-pointer-route="jay-jay"', false)
            ->assertSee('data-pointer-route="session-deck"', false)
            ->assertDontSee('project-case__action', false);

        $this->assertSame(3, substr_count($projects->getContent(), 'class="project-case project-case--'));
    }

    public function test_quantified_case_study_renders_in_both_locales(): void
    {
        $this->get('/quantified')
            ->assertRedirect('/en/quantified');

        $english = $this->get('/en/quantified');

        $english
            ->assertOk()
            ->assertSee('<title>Quantified', false)
            ->assertSee('data-page="projects"', false)
            ->assertSee('aria-current="page"', false)
            ->assertSee('class="portfolio-page case-study-page project-detail project-detail--quantified"', false)
            ->assertSee('Calendar activity, turned into personal context.')
            ->assertSee('What would you like to understand?')
            ->assertSee('How has my sleep changed?')
            ->assertSee('Google Calendar')
            ->assertSee('ASP.NET Core')
            ->assertSee('PostgreSQL')
            ->assertSee('Angular')
            ->assertSee('Start a conversation')
            ->assertDontSee('quantified-visual__chart', false)
            ->assertSee('href="http://localhost/de/quantified"', false);

        $this->get('/de/quantified')
            ->assertOk()
            ->assertSee('Kalenderaktivität wird zu persönlichem Kontext.')
            ->assertSee('Aktiv in Entwicklung')
            ->assertSee('Gespräch beginnen')
            ->assertSee('href="http://localhost/en/quantified"', false);
    }

    public function test_jay_jay_case_study_renders_in_both_locales(): void
    {
        $this->get('/jay-jay')
            ->assertRedirect('/en/jay-jay');

        $this->get('/en/jay-jay')
            ->assertOk()
            ->assertSee('<title>Jay-Jay Web', false)
            ->assertSee('data-page="projects"', false)
            ->assertSee('aria-current="page"', false)
            ->assertSee('project-detail--jay-jay-web', false)
            ->assertSee('Laravel 13')
            ->assertSee('Static export')
            ->assertSee('Plesk delivery')
            ->assertSee('assets/work/jay-jay-home.png', false)
            ->assertSee('class="page-cta page-cta--contact"', false)
            ->assertSee('href="http://localhost/de/jay-jay"', false);

        $this->get('/de/jay-jay')
            ->assertOk()
            ->assertSee('wartbare Quellanwendung')
            ->assertSee('Live-Website besuchen')
            ->assertSee('href="http://localhost/en/jay-jay"', false);
    }

    public function test_sessiondeck_case_study_renders_in_both_locales(): void
    {
        $this->get('/session-deck')
            ->assertRedirect('/en/session-deck');

        $this->get('/en/session-deck')
            ->assertOk()
            ->assertSee('<title>SessionDeck', false)
            ->assertSee('data-page="projects"', false)
            ->assertSee('aria-current="page"', false)
            ->assertSee('project-detail--sessiondeck', false)
            ->assertSee('WinUI 3')
            ->assertSee('Functional source-build MVP')
            ->assertSee('Conservative ownership')
            ->assertSee('assets/work/sessiondeck-main.png', false)
            ->assertSee('class="page-cta page-cta--contact"', false)
            ->assertSee('href="http://localhost/de/session-deck"', false);

        $this->get('/de/session-deck')
            ->assertOk()
            ->assertSee('Windows-spezifisches Verhalten')
            ->assertSee('GitHub-Repository ansehen')
            ->assertSee('href="http://localhost/en/session-deck"', false);
    }

    public function test_contact_and_imprint_pages_render_per_locale(): void
    {
        $this->get('/en/contact')
            ->assertOk()
            ->assertSee('<title>Jeremy', false)
            ->assertSee('class="portfolio-page contact-page"', false)
            ->assertSee('class="contact-workspace"', false)
            ->assertSee('class="contact-email"', false)
            ->assertSee('class="contact-channels"', false)
            ->assertSee('Tell me what you want to build.')
            ->assertDontSee('class="contact-form"', false)
            ->assertDontSee('<form', false)
            ->assertSee('info@jeremylaederach.ch')
            ->assertSee('GitHub')
            ->assertSee('LinkedIn');

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
