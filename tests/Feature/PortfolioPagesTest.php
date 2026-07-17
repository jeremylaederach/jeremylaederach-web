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
            ->assertSee('About')
            ->assertSee('Projects')
            ->assertSee('Contact')
            ->assertSee('Architecting and engineering software that makes complex ideas feel simple.')
            ->assertSee('class="kinetic-index"', false)
            ->assertSee('class="kinetic-index__heading" aria-label="Jeremy Läderach."', false)
            ->assertSee('class="kinetic-index__wordmark"', false)
            ->assertDontSee('class="kinetic-index__eyebrow"', false)
            ->assertSee('class="index-navigation"', false)
            ->assertSee('data-index-panel', false)
            ->assertSee('data-page-transition', false)
            ->assertSee('data-sound-toggle', false)
            ->assertSee('brand/icons/apple-touch-icon.png', false)
            ->assertSee('data-page-main', false)
            ->assertDontSee('data-project-stage', false)
            ->assertDontSee('data-project-canvas', false)
            ->assertDontSee('brand/liquid/', false)
            ->assertDontSee('data-motion-chip', false)
            ->assertDontSee('data-portfolio-chat', false)
            ->assertSee('Quantified')
            ->assertSee('Jay-Jay')
            ->assertSee('SessionDeck')
            ->assertSee('href="http://localhost/en/about"', false)
            ->assertSee('href="http://localhost/en/projects"', false);

        $this->assertSame(3, substr_count($response->getContent(), 'data-index-panel'));
        $this->assertSame(15, substr_count($response->getContent(), 'class="kinetic-index__letter kinetic-index__letter--tone-'));

        $this->get('/de')
            ->assertOk()
            ->assertSee('Ich konzipiere und entwickle Software, die komplexe Ideen einfach macht.')
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
            ->assertSee('class="page-hero__index"', false)
            ->assertSee('<span>02</span>', false)
            ->assertSee('class="about-story"', false)
            ->assertSee('class="section-label about-section-label"', false)
            ->assertSee('class="career-list"', false)
            ->assertSee('class="technology-groups"', false)
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
            ->assertSee('GitHub Actions')
            ->assertDontSee('page-stage', false)
            ->assertDontSee('data-project-stage', false);

        $this->assertSame(4, substr_count($about->getContent(), 'class="technology-group"'));
        $this->assertSame(4, substr_count($about->getContent(), 'data-technology-icon='));
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
            ->assertSee('assets/work/jay-jay-mark.svg', false)
            ->assertSee('Projekte')
            ->assertSee('Hauptprojekt')
            ->assertSee('Quantified')
            ->assertSee('Persönliches Analyseprodukt')
            ->assertSee('Jay-Jay')
            ->assertSee('Digitales Dienstleistungsunternehmen')
            ->assertSee('Laravel 13')
            ->assertSee('Client Hub')
            ->assertSee('SessionDeck')
            ->assertSee('Nativer Workspace-Launcher')
            ->assertSee('WinUI 3')
            ->assertSee('.NET / C#')
            ->assertSee('Interaktiver Prototyp')
            ->assertSee('href="http://localhost/de/quantified"', false)
            ->assertSee('href="http://localhost/de/session-deck"', false)
            ->assertSee('href="http://localhost/de/jay-jay"', false)
            ->assertSee('data-transition-theme="quantified"', false)
            ->assertSee('data-transition-theme="session-deck"', false)
            ->assertSee('data-transition-theme="jay-jay"', false)
            ->assertSee('data-pointer-route="quantified"', false)
            ->assertSee('data-pointer-route="session-deck"', false)
            ->assertSee('data-pointer-route="jay-jay"', false)
            ->assertSee('class="project-visual project-reel project-reel--quantified project-reel--teaser"', false)
            ->assertSee('class="project-visual project-reel project-reel--jay-jay project-reel--teaser"', false)
            ->assertSee('class="project-visual project-reel project-reel--sessiondeck project-reel--teaser"', false)
            ->assertSee('class="project-case__content project-case__content-link"', false)
            ->assertSee('data-transition-origin-id="project-reel-quantified"', false)
            ->assertDontSee('data-reel-caption', false)
            ->assertDontSee('PostgreSQL-basierter Finanzprototyp')
            ->assertDontSee('project-reel__browser-bar', false)
            ->assertDontSee('project-case__action', false);

        $projectHtml = $projects->getContent();

        $this->assertSame(3, substr_count($projectHtml, 'class="project-case project-case--'));
        $this->assertSame(3, substr_count($projectHtml, 'data-reel-autoplay="true"'));
        $this->assertSame(3, substr_count($projectHtml, 'data-project-reel'));
        $this->assertSame(3, substr_count($projectHtml, 'aria-label="Projektansichten"'));
        $this->assertSame(3, substr_count($projectHtml, 'data-reel-open'));
        $this->assertSame(9, substr_count($projectHtml, 'data-reel-action="go"'));
        $this->assertLessThan(strpos($projectHtml, 'id="jay-jay"'), strpos($projectHtml, 'id="quantified"'));
        $this->assertLessThan(strpos($projectHtml, 'id="sessiondeck"'), strpos($projectHtml, 'id="jay-jay"'));
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
            ->assertSee('QCalendar')
            ->assertSee('QFinances')
            ->assertSee('class="quantified-app__navigation"', false)
            ->assertDontSee('quantified-app__profile', false)
            ->assertSee('aria-roledescription="carousel"', false)
            ->assertSee('aria-label="Next view"', false)
            ->assertSee('aria-label="View 3: QFinances"', false)
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
            ->assertSee('<title>Jay-Jay', false)
            ->assertSee('data-page="projects"', false)
            ->assertSee('aria-current="page"', false)
            ->assertSee('project-detail--jay-jay', false)
            ->assertSee('One business, two connected customer experiences.')
            ->assertSee('Jay-Jay Web')
            ->assertSee('Client Hub')
            ->assertSee('Interactive prototype')
            ->assertSee('class="project-visual project-reel project-reel--jay-jay project-reel--detail case-study-hero__visual"', false)
            ->assertSee('aria-label="View 2: Client Hub"', false)
            ->assertSee('aria-label="View 3: Project workspace"', false)
            ->assertSee('assets/work/jay-jay-home.png', false)
            ->assertSee('assets/work/jay-jay-mark.svg', false)
            ->assertDontSee('project-reel__browser-bar', false)
            ->assertSee('class="page-cta page-cta--contact"', false)
            ->assertSee('href="http://localhost/de/jay-jay"', false);

        $this->get('/de/jay-jay')
            ->assertOk()
            ->assertSee('Ein Unternehmen, zwei verbundene Kundenerlebnisse.')
            ->assertSee('Produktökosystem')
            ->assertSee('Jay-Jay besuchen')
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
            ->assertSee('class="project-visual project-reel project-reel--sessiondeck project-reel--detail case-study-hero__visual"', false)
            ->assertSee('aria-label="View 2: Profile editor"', false)
            ->assertSee('aria-label="View 3: Session result"', false)
            ->assertSee('class="page-cta page-cta--contact"', false)
            ->assertSee('href="http://localhost/de/session-deck"', false);

        $this->get('/de/session-deck')
            ->assertOk()
            ->assertSee('Windows-spezifisches Verhalten')
            ->assertSee('GitHub-Repository ansehen')
            ->assertSee('href="http://localhost/en/session-deck"', false);
    }

    public function test_legacy_client_hub_routes_redirect_to_the_jay_jay_case_study(): void
    {
        $this->get('/jay-jay-client-hub')
            ->assertRedirect('/en/jay-jay#client-hub');

        $this->get('/en/jay-jay-client-hub')
            ->assertMovedPermanently()
            ->assertRedirect('/en/jay-jay#client-hub');

        $this->get('/de/jay-jay-client-hub')
            ->assertMovedPermanently()
            ->assertRedirect('/de/jay-jay#client-hub');
    }

    public function test_contact_footer_and_legal_pages_render_per_locale(): void
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
            ->assertSee('LinkedIn')
            ->assertSee('class="site-footer__main"', false)
            ->assertSee('class="site-footer__base"', false)
            ->assertSee('href="http://localhost/en/imprint"', false)
            ->assertSee('href="http://localhost/en/privacy"', false);

        $this->get('/de/imprint')
            ->assertOk()
            ->assertSee('Impressum')
            ->assertSee('Betreiber')
            ->assertSee('Inhalte und Urheberrecht')
            ->assertDontSee('Laravel-Prototyp')
            ->assertSee('href="http://localhost/en/imprint"', false);

        $this->get('/en/privacy')
            ->assertOk()
            ->assertSee('Privacy notice')
            ->assertSee('Technical access data')
            ->assertSee('local storage')
            ->assertSee('static website')
            ->assertSee('does not set application')
            ->assertSee('does not use trackers')
            ->assertSee('href="http://localhost/de/privacy"', false);

        $this->get('/de/privacy')
            ->assertOk()
            ->assertSee('Datenschutzerklärung')
            ->assertSee('Technische Zugriffsdaten')
            ->assertSee('lokalen Speicher')
            ->assertSee('statische Website')
            ->assertSee('keine Anwendungs-')
            ->assertSee('keine Tracker')
            ->assertSee('Eidgenössischer Datenschutz- und Öffentlichkeitsbeauftragter');
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
