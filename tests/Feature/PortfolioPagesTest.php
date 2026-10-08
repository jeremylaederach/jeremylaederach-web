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

    public function test_about_copy_reflects_the_confirmed_study_start_in_both_locales(): void
    {
        $this->get('/en/about')
            ->assertOk()
            ->assertSee('Since September 2026')
            ->assertSee('I study Business Informatics at OST.')
            ->assertDontSee('I start the BSc');

        $this->get('/de/about')
            ->assertOk()
            ->assertSee('Seit September 2026')
            ->assertSee('studiere ich Wirtschaftsinformatik an der OST.')
            ->assertDontSee('Ich starte den BSc');
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
            ->assertSee('Web products, client websites, and Windows tools – built from the backend to the interface.')
            ->assertSee('class="kinetic-index"', false)
            ->assertSee('class="kinetic-index__heading"', false)
            ->assertDontSee('class="kinetic-index__number"', false)
            ->assertSee('class="kinetic-index__name"', false)
            ->assertDontSee('class="kinetic-index__eyebrow"', false)
            ->assertSee('class="index-navigation"', false)
            ->assertSee('data-index-panel', false)
            ->assertSee('data-sound-toggle', false)
            ->assertSee('brand/jeremy-cat-256.png', false)
            ->assertSee('brand/icons/apple-touch-icon.png', false)
            ->assertSee('data-page-main', false)
            ->assertDontSee('data-project-stage', false)
            ->assertDontSee('data-project-canvas', false)
            ->assertDontSee('brand/liquid/', false)
            ->assertDontSee('data-motion-chip', false)
            ->assertDontSee('data-portfolio-chat', false)
            ->assertSee('data-dot-orb', false)
            ->assertDontSee('class="index-panel__preview"', false)
            ->assertSee('href="http://localhost/en/about"', false)
            ->assertSee('href="http://localhost/en/projects"', false);

        $this->assertSame(3, substr_count($response->content(), 'data-index-panel'));
        $this->assertSame(8, substr_count($response->content(), 'data-dot-orb-figure='));
        $this->assertFileExists(public_path('brand/jeremy-cat-256.png'));
        $this->assertFileExists(public_path('brand/icons/icon-192.png'));
        $this->assertFileExists(public_path('brand/icons/icon-512.png'));

        $this->get('/de')
            ->assertOk()
            ->assertSee('Webprodukte, Kundenwebsites und Windows-Tools – vom Backend bis zur Oberfläche.')
            ->assertSee('Profil')
            ->assertSee('Projekte');

        $this->assertFileDoesNotExist(public_path('brand/liquid/liquid-projects.png'));
        $this->assertFileDoesNotExist(public_path('brand/liquid/liquid-about.png'));
        $this->assertFileDoesNotExist(public_path('brand/liquid/liquid-contact.png'));
        $this->assertFileDoesNotExist(public_path('brand/cats/main/cat-loaf-classic-256.png'));
    }

    public function test_brand_assets_use_the_expected_png_dimensions(): void
    {
        $assets = [
            'favicon.png' => [64, 64],
            'brand/jeremy-cat-256.png' => [256, 256],
            'brand/icons/apple-touch-icon.png' => [180, 180],
            'brand/icons/icon-192.png' => [192, 192],
            'brand/icons/icon-512.png' => [512, 512],
            'brand/social-preview.png' => [1200, 630],
        ];

        foreach ($assets as $relativePath => $expectedDimensions) {
            $imageInfo = getimagesize(public_path($relativePath));

            $this->assertNotFalse($imageInfo, "Unable to read {$relativePath}.");
            $this->assertSame($expectedDimensions, [$imageInfo[0], $imageInfo[1]]);
            $this->assertSame(IMAGETYPE_PNG, $imageInfo[2]);
        }
    }

    public function test_about_and_projects_pages_render_per_locale(): void
    {
        $about = $this->get('/en/about');

        $about
            ->assertOk()
            ->assertSee('aria-current="page"', false)
            ->assertSee('class="portfolio-page about-page"', false)
            ->assertSee('class="page-heading-wordmark"', false)
            ->assertSee('data-page-heading-signal', false)
            ->assertSee('aria-label="About me."', false)
            ->assertSee('<span>02</span>', false)
            ->assertSee('class="about-story"', false)
            ->assertSee('class="about-playground"', false)
            ->assertSee('data-about-playground', false)
            ->assertSee('data-sorting-demo', false)
            ->assertSee('data-network-demo', false)
            ->assertSee('data-pathfinding-demo', false)
            ->assertSee('data-network-preset', false)
            ->assertSee('data-pathfinding-cell-label', false)
            ->assertSee('aria-live="polite"', false)
            ->assertSee('data-pathfinding-status', false)
            ->assertSee('class="section-label about-section-label"', false)
            ->assertSee('class="career-list"', false)
            ->assertDontSee('class="career-list__current"', false)
            ->assertDontSee('class="career-list__status"', false)
            ->assertDontSee('data-career-state', false)
            ->assertSee('class="technology-groups"', false)
            ->assertSee('In brief.')
            ->assertSee('Foundation')
            ->assertSee('Since September 2026')
            ->assertSee('Playground.')
            ->assertSee('Sorting')
            ->assertSee('It repeats that split until every group is in order.')
            ->assertSee('Comparisons')
            ->assertDontSee('Typical effort')
            ->assertDontSee('O notation')
            ->assertSee('Insertion')
            ->assertSee('Selection')
            ->assertSee('Neural Network')
            ->assertSee('Draw a 0, 1 or 2')
            ->assertSee('it does not learn from your drawings')
            ->assertSee('Use the arrow keys to move through the pixels')
            ->assertSee('Recognize')
            ->assertSee('Guess')
            ->assertSee('Pathfinder')
            ->assertSee('Edit the walls')
            ->assertSee('Shortest')
            ->assertSee('Fewer checks')
            ->assertSee('Fewer turns')
            ->assertSee('Use the arrow keys to move across the grid')
            ->assertSee('Find path')
            ->assertSee('Since Aug 2024')
            ->assertDontSee('Street routing')
            ->assertDontSee('Fastest')
            ->assertDontSee('Low traffic')
            ->assertDontSee('class="about-lab"', false)
            ->assertDontSee('data-about-lab', false)
            ->assertDontSee('class="about-facts"', false)
            ->assertDontSee('class="principles-list"', false)
            ->assertDontSee('class="about-system"', false)
            ->assertSee('Stack')
            ->assertSee('Experience')
            ->assertSee('Tools')
            ->assertSee('Application Developer EFZ')
            ->assertSee('Business Informatics BSc')
            ->assertSee('.NET 10 / C#')
            ->assertSee('ASP.NET Core')
            ->assertSee('Laravel 13')
            ->assertSee('PostgreSQL')
            ->assertSee('GitHub Actions')
            ->assertSee('Herd / Plesk')
            ->assertSee('data-technology-icon="laravel"', false)
            ->assertDontSee('page-stage', false)
            ->assertDontSee('data-project-stage', false);

        $this->assertSame(4, substr_count($about->content(), 'class="technology-group"'));
        $this->assertSame(4, substr_count($about->content(), 'data-technology-icon='));
        $this->assertSame(4, substr_count($about->content(), 'class="section-label about-section-label"'));
        $this->assertSame(3, substr_count($about->content(), '<article class="playground-demo'));
        // The only canvas is the sphere behind the page hero; the demos are built from elements.
        $this->assertSame(1, substr_count($about->content(), '<canvas data-dot-orb'));
        $about->assertSee('<canvas data-dot-orb>', false);
        $this->assertSame(5, substr_count($about->content(), 'data-sorting-algorithm='));
        $this->assertSame(5, substr_count($about->content(), 'data-sorting-description='));
        $this->assertSame(0, substr_count($about->content(), 'data-sorting-complexity='));
        $this->assertSame(3, substr_count($about->content(), 'data-network-preset='));
        $this->assertSame(3, substr_count($about->content(), 'data-pathfinding-strategy='));
        $this->assertSame(3, substr_count($about->content(), 'data-pathfinding-description='));
        $this->assertSame(2, substr_count($about->content(), 'aria-multiselectable="true"'));
        $this->assertStringNotContainsString('playground-demo__title', $about->content());
        $aboutHtml = $about->content();

        $this->assertLessThan(strpos($aboutHtml, 'id="career-title"'), strpos($aboutHtml, 'id="story"'));
        $this->assertLessThan(strpos($aboutHtml, 'id="stack-title"'), strpos($aboutHtml, 'id="career-title"'));
        $this->assertLessThan(strpos($aboutHtml, 'id="playground-title"'), strpos($aboutHtml, 'id="stack-title"'));

        $this->get('/de/about')
            ->assertOk()
            ->assertSee('Erfahrung')
            ->assertSee('Tools')
            ->assertSee('Kurzprofil.')
            ->assertSee('Grundlage')
            ->assertSee('Playground.')
            ->assertSee('Sorting')
            ->assertSee('Diese Aufteilung wiederholt sich, bis jede Gruppe sortiert ist.')
            ->assertSee('Vergleiche')
            ->assertDontSee('Typischer Aufwand')
            ->assertDontSee('O-Notation')
            ->assertSee('Insertion')
            ->assertSee('Selection')
            ->assertSee('Neural Network')
            ->assertSee('Zeichne eine 0, 1 oder 2')
            ->assertSee('sie lernt nicht aus deinen Zeichnungen')
            ->assertSee('Mit den Pfeiltasten durch die Pixel navigieren')
            ->assertSee('Erkennen')
            ->assertSee('Pathfinder')
            ->assertSee('Wände bearbeiten')
            ->assertSee('Kürzester Weg')
            ->assertSee('Weniger prüfen')
            ->assertSee('Weniger Kurven')
            ->assertSee('Mit den Pfeiltasten durch das Raster navigieren')
            ->assertSee('Weg finden')
            ->assertSee('Stack')
            ->assertSee('Seit Aug. 2024')
            ->assertDontSee('Strassen-Routing')
            ->assertDontSee('Schnellste');

        $projects = $this->get('/de/projects');

        $projects
            ->assertOk()
            ->assertSee('class="portfolio-page projects-page"', false)
            ->assertSee('class="page-heading-wordmark"', false)
            ->assertSee('aria-label="Projekte."', false)
            ->assertSee('class="stage-list__rows"', false)
            ->assertSee('Projekte')
            ->assertSee('Quantified')
            ->assertSee('Persönliches Analyseprodukt')
            ->assertSee('Jay-Jay')
            ->assertSee('Digitales Dienstleistungsunternehmen')
            ->assertSee('Laravel 13')
            ->assertSee('.NET / C#')
            ->assertSee('href="http://localhost/de/quantified"', false)
            ->assertSee('href="http://localhost/de/jay-jay"', false)
            ->assertSee('data-dot-orb-figure="quantified"', false)
            ->assertSee('data-dot-orb-figure="jay-jay"', false)
            ->assertDontSee('Nativer Workspace-Launcher')
            ->assertSee('aria-describedby="quantified-detail"', false)
            ->assertSee('data-project="quantified"', false)
            ->assertDontSee('PostgreSQL-basierter Finanzprototyp')
            ->assertDontSee('data-project-reel', false);

        $projectHtml = $projects->content();

        $this->assertSame(2, substr_count($projectHtml, 'data-stage-item'));
        $this->assertSame(1, substr_count($projectHtml, ' data-current'));
        $this->assertSame(1, substr_count($projectHtml, 'data-dot-orb-resting'));
        $this->assertLessThan(strpos($projectHtml, 'id="jay-jay"'), strpos($projectHtml, 'id="quantified"'));

        // A row is one link that holds its description, so the pointer's ring frames both.
        $this->assertMatchesRegularExpression(
            '/<a\b[^>]*aria-describedby="jay-jay-detail"(?:(?!<\/a>).)*id="jay-jay-detail"/s',
            $projectHtml,
        );
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
            ->assertSee('class="scroll-cue directional-link directional-link--down"', false)
            ->assertSee('href="#product"', false)
            ->assertSee('class="case-study-product__details"', false)
            ->assertSee('Quantified brings calendar, finance, coding, and local system data into dashboards')
            ->assertSee('All my data,')
            ->assertSee('made visible.')
            ->assertSee('Current inputs')
            ->assertSee('Your data, one local workspace.')
            ->assertSee('Home workspace')
            ->assertSee('QCalendar')
            ->assertSee('QFinances')
            ->assertSee('class="quantified-app__navigation"', false)
            ->assertSee('class="project-visual project-reel project-reel--quantified project-reel--detail case-study-hero__reel"', false)
            ->assertDontSee('quantified-app__profile', false)
            ->assertDontSee('What would you like to understand?')
            ->assertDontSee('QInsights')
            ->assertSee('aria-roledescription="carousel"', false)
            ->assertSee('aria-label="Next view"', false)
            ->assertSee('<strong>QFinances</strong>', false)
            ->assertSee('Google Calendar')
            ->assertSee('ASP.NET Core')
            ->assertSee('PostgreSQL')
            ->assertSee('Angular')
            ->assertSee('Data &amp; integrations', false)
            ->assertSee('Next project')
            ->assertSee('class="case-study-next case-study-next--jay-jay directional-link directional-link--forward"', false)
            ->assertSee('href="http://localhost/en/jay-jay"', false)
            ->assertDontSee('Current scope')
            ->assertDontSee('quantified-visual__chart', false)
            ->assertSee('href="http://localhost/de/quantified"', false);

        $englishHtml = $english->content();
        $viewsPosition = strpos($englishHtml, 'id="views"');
        $productPosition = strpos($englishHtml, 'id="product"');
        $stackPosition = strpos($englishHtml, 'id="stack"');

        $this->assertSame(3, substr_count($englishHtml, 'class="technology-group"'));
        $this->assertNotFalse($viewsPosition);
        $this->assertNotFalse($productPosition);
        $this->assertNotFalse($stackPosition);
        $this->assertLessThan($productPosition, $viewsPosition);
        $this->assertLessThan($stackPosition, $productPosition);
        $this->assertStringNotContainsString('id="presentation"', $englishHtml);

        $this->get('/de/quantified')
            ->assertOk()
            ->assertSee('Quantified bringt Kalender-, Finanz-, Coding- und lokale Systemdaten in Dashboards und Timelines zusammen.')
            ->assertSee('Alle meine Daten,')
            ->assertSee('sichtbar gemacht.')
            ->assertSee('Angular + .NET.')
            ->assertSee('Weitere Datenquellen anbinden und Entwicklungen über längere Zeit vergleichen.')
            ->assertSee('Aktiv in Entwicklung')
            ->assertSee('href="http://localhost/de/jay-jay"', false)
            ->assertSee('href="http://localhost/en/quantified"', false);
    }

    public function test_jay_jay_case_study_renders_in_both_locales(): void
    {
        $this->get('/jay-jay')
            ->assertRedirect('/en/jay-jay');

        $english = $this->get('/en/jay-jay');

        $english
            ->assertOk()
            ->assertSee('<title>Jay-Jay', false)
            ->assertSee('data-page="projects"', false)
            ->assertSee('aria-current="page"', false)
            ->assertSee('project-detail--jay-jay', false)
            ->assertSee('A small service business with its own software.')
            ->assertSee('Two Laravel apps.')
            ->assertSee('jay-jay.ch')
            ->assertSee('Client Hub')
            ->assertSee('Development build')
            ->assertSee('class="project-visual project-reel project-reel--jay-jay project-reel--detail case-study-hero__reel"', false)
            ->assertSee('<strong>Customer overview</strong>', false)
            ->assertSee('<strong>Work board</strong>', false)
            ->assertSee('id="client-hub"', false)
            ->assertSee('<span class="is-active">Boards</span>', false)
            ->assertSee('<i class="is-current"></i>', false)
            ->assertSee('assets/work/jay-jay-home.png', false)
            ->assertSee('assets/work/jay-jay-mark.svg', false)
            ->assertDontSee('tested contact delivery')
            ->assertDontSee('Current scope')
            ->assertDontSee('project-reel__browser-bar', false)
            ->assertSee('Next project')
            ->assertSee('class="case-study-next case-study-next--sessiondeck directional-link directional-link--forward"', false)
            ->assertSee('aria-label="Next project: SessionDeck"', false)
            ->assertSee('href="http://localhost/en/session-deck"', false)
            ->assertSee('href="http://localhost/de/jay-jay"', false);

        $this->assertSame(3, substr_count($english->content(), 'class="technology-group"'));

        $this->get('/de/jay-jay')
            ->assertOk()
            ->assertSee('Ein kleines Unternehmen mit eigener Software.')
            ->assertSee('Zwei Laravel-Apps.')
            ->assertSee('Jay-Jay besuchen')
            ->assertSee('href="http://localhost/de/session-deck"', false)
            ->assertSee('href="http://localhost/en/jay-jay"', false);
    }

    public function test_sessiondeck_case_study_renders_in_both_locales(): void
    {
        $this->get('/session-deck')
            ->assertRedirect('/en/session-deck');

        $english = $this->get('/en/session-deck');

        $english
            ->assertOk()
            ->assertSee('<title>SessionDeck', false)
            ->assertSee('data-page="projects"', false)
            ->assertSee('aria-current="page"', false)
            ->assertSee('project-detail--sessiondeck', false)
            ->assertSee('WinUI 3')
            ->assertSee('Working prototype · Build from source')
            ->assertSee('Save the setup.')
            ->assertSee('Start it as one session.')
            ->assertSee('Process control')
            ->assertSee('class="project-visual project-reel project-reel--sessiondeck project-reel--detail case-study-hero__reel"', false)
            ->assertSee('<strong>Profile editor</strong>', false)
            ->assertSee('<strong>Session result</strong>', false)
            ->assertDontSee('Current scope')
            ->assertSee('Next project')
            ->assertSee('class="case-study-next case-study-next--quantified directional-link directional-link--forward"', false)
            ->assertSee('href="http://localhost/en/quantified"', false)
            ->assertSee('href="http://localhost/de/session-deck"', false);

        $this->assertSame(3, substr_count($english->content(), 'class="technology-group"'));

        $this->get('/de/session-deck')
            ->assertOk()
            ->assertSee('Setup speichern.')
            ->assertSee('Als Session starten.')
            ->assertSee('WinUI 3 + .NET.')
            ->assertSee('GitHub-Repository ansehen')
            ->assertSee('href="http://localhost/de/quantified"', false)
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
            ->assertSee('<title>Contact</title>', false)
            ->assertSee('class="portfolio-page contact-page"', false)
            ->assertSee('class="page-heading-wordmark"', false)
            ->assertSee('aria-label="Contact."', false)
            ->assertSee('class="stage-list__rows"', false)
            ->assertSee('href="mailto:info@jeremylaederach.ch"', false)
            ->assertSee('data-dot-orb-figure="github"', false)
            ->assertSee('A few sentences are enough.')
            ->assertDontSee('class="contact-form"', false)
            ->assertDontSee('<form', false)
            ->assertSee('info@jeremylaederach.ch')
            ->assertSee('GitHub')
            ->assertSee('LinkedIn')
            ->assertSee('class="site-colophon"', false)
            ->assertSee('href="http://localhost/en/imprint"', false)
            ->assertSee('href="http://localhost/en/privacy"', false);

        $this->get('/de/imprint')
            ->assertOk()
            ->assertSee('Impressum')
            ->assertSee('Betreiber')
            ->assertSee('Inhalte und Urheberrecht')
            ->assertDontSee('Laravel-Prototyp')
            ->assertSee('href="http://localhost/en/imprint"', false);

        $this->get('/en/imprint')
            ->assertOk()
            ->assertSee('Legal notice')
            ->assertDontSee('>Imprint<', false);

        $this->get('/en/privacy')
            ->assertOk()
            ->assertSee('Privacy notice')
            ->assertSee('class="legal-page__summary"', false)
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
