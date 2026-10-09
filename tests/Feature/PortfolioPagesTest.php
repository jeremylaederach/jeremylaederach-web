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
            ->assertSeeText('Data platforms, web services, and native apps – built from the backend to the interface.')
            ->assertSee('<span class="sr-only">Data platforms, web services, and native apps – built from the backend to the interface.</span>', false)
            ->assertSee('<span class="figure-word" data-dot-orb-figure="quantified"><span class="figure-word__letter" style="--letter-index: 0">D</span>', false)
            ->assertSee('class="kinetic-index"', false)
            ->assertSee('class="kinetic-index__heading"', false)
            ->assertDontSee('class="kinetic-index__number"', false)
            ->assertSee('class="kinetic-index__name figure-word" data-dot-orb-figure="mark"', false)
            ->assertDontSee('class="kinetic-index__eyebrow"', false)
            ->assertSee('class="index-navigation"', false)
            ->assertSee('data-index-panel', false)
            ->assertSee('data-sound-toggle', false)
            ->assertSee('brand/jeremy-cat-256.png', false)
            ->assertSee('class="brand-mark brand-lockup__mark"', false)
            ->assertSee("--brand-mark: url('http://localhost/brand/jeremy-cat-256.png')", false)
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
        $this->assertSame(13, substr_count($response->content(), 'data-dot-orb-figure='));

        // The letters of the words that name a figure are numbered through, so the light runs
        // from the first word to the last: "Data platforms" has 13 letters, "web" follows.
        $response
            ->assertSee('style="--letter-index: 12">s</span></span>', false)
            ->assertSee('<span class="figure-word__letter" style="--letter-index: 13">w</span>', false);
        $this->assertFileExists(public_path('brand/jeremy-cat-256.png'));
        $this->assertFileExists(public_path('brand/icons/icon-192.png'));
        $this->assertFileExists(public_path('brand/icons/icon-512.png'));

        $this->get('/de')
            ->assertOk()
            ->assertSeeText('Datenplattformen, Webservices und native Apps – vom Backend bis zur Oberfläche.')
            ->assertSee('Profil')
            ->assertSee('Projekte');

        $this->assertFileDoesNotExist(public_path('brand/liquid/liquid-projects.png'));
        $this->assertFileDoesNotExist(public_path('brand/liquid/liquid-about.png'));
        $this->assertFileDoesNotExist(public_path('brand/liquid/liquid-contact.png'));
        $this->assertFileDoesNotExist(public_path('brand/cats/main/cat-loaf-classic-256.png'));
    }

    public function test_every_word_that_names_a_figure_occurs_in_the_summary(): void
    {
        foreach (array_keys(config('portfolio.locales')) as $locale) {
            $home = config("portfolio.content.{$locale}.home");

            $this->assertNotEmpty($home['summary_figures']);

            foreach ($home['summary_figures'] as $entry) {
                $this->assertStringContainsString($entry['words'], $home['summary']);
            }
        }
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
            ->assertSee('class="about-story"', false)
            ->assertSee('Stack')
            ->assertSee('.NET 10 / C#')
            ->assertSee('ASP.NET Core')
            ->assertSee('Laravel 13')
            ->assertSee('PostgreSQL')
            ->assertSee('GitHub Actions')
            ->assertSee('Herd / Plesk')
            ->assertDontSee('In brief.')
            ->assertDontSee('Career path')
            ->assertDontSee('playground', false)
            ->assertDontSee('page-stage', false)
            ->assertDontSee('data-project-stage', false);

        $aboutHtml = $about->content();

        // Two chapters, each with a figure for the sphere; the first one is current at the start.
        $this->assertSame(2, preg_match_all('/\sdata-chapter\s/', $aboutHtml));
        $this->assertSame(1, substr_count($aboutHtml, 'data-dot-orb-resting'));
        $this->assertMatchesRegularExpression('/data-chapter\s+data-dot-orb-figure="about"\s+data-dot-orb-resting/', $aboutHtml);
        $this->assertMatchesRegularExpression('/data-chapter\s+data-dot-orb-figure="stack"/', $aboutHtml);

        // Every group and every tool answers a hover: four groups in their colors and sixteen
        // tools, of which those with a mark of their own show it, the others their group's.
        $this->assertSame(20, substr_count($aboutHtml, 'class="figure-word"'));
        $this->assertSame(4, substr_count($aboutHtml, 'class="about-row" style="--dot-orb-rgb: '));
        $this->assertSame(1, substr_count($aboutHtml, '<canvas data-dot-orb'));
        $this->assertMatchesRegularExpression('/data-dot-orb-figure="typescript"\s+style="--dot-orb-rgb: 49, 120, 198"\s*>TypeScript</', $aboutHtml);
        $this->assertMatchesRegularExpression('/data-dot-orb-figure="laravel"\s*>Blade</', $aboutHtml);
        $this->assertMatchesRegularExpression('/data-dot-orb-figure="windows"\s*>WinUI 3</', $aboutHtml);

        $this->get('/de/about')
            ->assertOk()
            ->assertSee('aria-label="Über mich."', false)
            ->assertSee('Stack')
            ->assertSee('data-dot-orb-figure="tailwindcss"', false);

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
            ->assertSee('class="legal-row"', false)
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
            ->assertSee('data-dot-orb-figure="not-found"', false)
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
