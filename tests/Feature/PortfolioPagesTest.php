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
            ->assertSeeText('Data platforms, web services, native apps. Built from the database to the last pixel.')
            ->assertSee('<span class="sr-only">Data platforms, web services, native apps. Built from the database to the last pixel.</span>', false)
            ->assertSee('<span class="figure-word" data-dot-orb-figure="quantified"><span class="figure-word__letter" style="--letter-index: 0">D</span>', false)
            ->assertSee('class="kinetic-index"', false)
            ->assertSee('class="kinetic-index__heading"', false)
            ->assertDontSee('class="kinetic-index__number"', false)
            ->assertSee('class="kinetic-index__name figure-word" data-dot-orb-figure="mark"', false)
            ->assertDontSee('class="kinetic-index__eyebrow"', false)
            ->assertDontSee('class="index-navigation"', false)
            ->assertSee('data-sound-toggle', false)
            ->assertSee('data-mark="http://localhost/brand/mark.svg"', false)
            ->assertSee('class="brand-mark brand-lockup__mark"', false)
            ->assertSee("--brand-mark: url('http://localhost/brand/mark.svg')", false)
            ->assertSee('href="http://localhost/brand/mark.svg" type="image/svg+xml"', false)
            ->assertSee('brand/icons/apple-touch-180.png', false)
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

        $this->assertSame(10, substr_count($response->content(), 'data-dot-orb-figure='));

        // The letters of the words that name a figure are numbered through, so the light runs
        // from the first word to the last: "Data platforms" has 13 letters, "web" follows.
        $response
            ->assertSee('style="--letter-index: 12">s</span></span>', false)
            ->assertSee('<span class="figure-word__letter" style="--letter-index: 13">w</span>', false);

        $this->get('/de')
            ->assertOk()
            ->assertSeeText('Datenplattformen, Webservices, native Apps. Gebaut von der Datenbank bis zum letzten Pixel.')
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
            'brand/icons/favicon-64.png' => [64, 64],
            'brand/icons/apple-touch-180.png' => [180, 180],
            'brand/icons/app-192.png' => [192, 192],
            'brand/icons/app-512.png' => [512, 512],
            'brand/link-preview.png' => [1200, 630],
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
            ->assertSee('class="portfolio-page scene-page about-page"', false)
            ->assertSee('class="page-heading-wordmark"', false)
            ->assertSee('data-page-heading-signal', false)
            ->assertSee('aria-label="About me."', false)
            ->assertSee('I&#039;m Jeremy, a software developer from Zurich.', false)
            ->assertSee('My primary stack for APIs, domain logic, and native Windows tools.')
            ->assertSee('.NET 10 / C#')
            ->assertSee('Laravel 13')
            ->assertSee('Herd / Plesk')
            ->assertSee('aria-label="Scenes of this page"', false)
            ->assertDontSee('Career path')
            ->assertDontSee('data-chapter', false);

        $aboutHtml = $about->content();

        // Six scenes on one stage: each has its step behind the screen and its link among the
        // steps, and the first is shown at the start. It lists three facts, and the last scene
        // leads on to the contact page in that page's own words.
        $this->assertSame(6, preg_match_all('/\sdata-scene\s/', $aboutHtml));
        $this->assertSame(6, substr_count($aboutHtml, 'data-scene-step="'));
        $this->assertSame(3, preg_match_all('/<dt>(Training|Studies|Projects)<\/dt>/', $aboutHtml));
        $this->assertMatchesRegularExpression('/id="contact-scene"\s+class="scene"\s+data-scene\s+data-dot-orb-figure="contact"/', $aboutHtml);
        $this->assertStringContainsString('A project, a role or a question? Write to me.', $aboutHtml);
        $this->assertMatchesRegularExpression('/href="http:\/\/localhost\/en\/contact"\s+data-route="contact"\s+data-route-transition/', $aboutHtml);
        $this->assertSame(1, substr_count($aboutHtml, 'data-active data-dot-orb-resting'));
        $this->assertSame(1, substr_count($aboutHtml, 'aria-current="step"'));
        // The layout holds the one canvas of the sphere, and the page marks its stage: a square
        // that stays in the window while the page scrolls.
        $this->assertSame(1, substr_count($aboutHtml, '<canvas data-dot-orb '));
        $this->assertSame(1, substr_count($aboutHtml, 'data-dot-orb-stage="pinned" data-dot-orb-fit'));
        $this->assertMatchesRegularExpression('/id="me-scene"\s+class="scene"\s+data-scene\s+data-dot-orb-figure="about"/', $aboutHtml);
        $this->assertStringContainsString('<div id="me" class="scene-stage__step" data-scene-step="me-scene"></div>', $aboutHtml);

        // A technology brings its color to the dots, and a tool with a mark answers a hover.
        $this->assertMatchesRegularExpression('/data-dot-orb-figure="laravel"\s+style="--dot-orb-rgb: 255, 45, 32"/', $aboutHtml);
        $this->assertMatchesRegularExpression('/data-dot-orb-figure="typescript"\s+style="--dot-orb-rgb: 49, 120, 198"\s*>TypeScript</', $aboutHtml);
        $this->assertMatchesRegularExpression('/data-dot-orb-figure="windows"\s*>WinUI 3</', $aboutHtml);

        $this->get('/de/about')
            ->assertOk()
            ->assertSee('aria-label="Über mich."', false)
            ->assertSee('Mein Haupt-Stack für APIs')
            ->assertSee('aria-label="Szenen dieser Seite"', false)
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
            ->assertSee('Persönliche Analyse')
            ->assertSee('Jay-Jay')
            ->assertSee('Mein Webunternehmen')
            ->assertSee('Laravel 13')
            ->assertSee('.NET / C#')
            ->assertSee('href="http://localhost/de/quantified"', false)
            ->assertSee('href="http://localhost/de/jay-jay"', false)
            ->assertSee('data-dot-orb-figure="jay-jay globe cloud contact"', false)
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
            ->assertSee('<title>Quantified</title>', false)
            ->assertSee('class="portfolio-page scene-page project-page project-detail project-detail--quantified"', false)
            ->assertSee('aria-label="Quantified."', false)
            ->assertSee('Product · Active build')
            ->assertSee('Quantified shows me where my time, my health and my money go.')
            ->assertSee('data-dot-orb-figure="quantified trend ring calendar"', false)
            ->assertSee('Apple Health delivers running, nutrition and weight.')
            ->assertSee('data-dot-orb-figure="ledger"', false)
            ->assertSee('PostgreSQL 18')
            ->assertSee('href="http://localhost/en/projects#quantified"', false)
            ->assertSee('href="http://localhost/de/quantified"', false)
            ->assertDontSee('<img', false);

        // Five scenes of its own and one that leads on to the next project, in that project's
        // color and with its figures.
        $html = $english->content();
        $this->assertSame(6, preg_match_all('/\sdata-scene\s/', $html));
        $this->assertSame(6, substr_count($html, 'data-scene-step="'));

        // The first scene says what the project is at one glance: its stack, whose entries name
        // their marks, its state and the role. The way on leads to the second scene.
        $this->assertSame(3, preg_match_all('/<dt>(Stack|State|Role)<\/dt>/', $html));
        $this->assertMatchesRegularExpression('/<dd>\s*<ul class="scene__tags">.*?data-dot-orb-figure="angular".*?<\/ul>\s*<\/dd>/s', $html);
        $this->assertMatchesRegularExpression('/class="scene-stage__next"\s+href="#sources"\s+data-scene-next/', $html);
        $this->assertStringContainsString('<span data-scene-next-name>Sources</span>', $html);
        $this->assertSame(1, substr_count($html, 'data-active data-dot-orb-resting'));
        $this->assertMatchesRegularExpression(
            '/id="next-scene"\s+class="scene"\s+data-scene\s+data-dot-orb-figure="jay-jay globe cloud contact"\s+data-project="jay-jay"/',
            $html,
        );
        $this->assertMatchesRegularExpression('/href="http:\/\/localhost\/en\/jay-jay"\s+data-route="projects"\s+data-route-transition/', $html);

        $this->get('/de/quantified')
            ->assertOk()
            ->assertSee('<title>Quantified</title>', false)
            ->assertSee('Produkt · In Entwicklung')
            ->assertSee('Quantified zeigt mir, wohin meine Zeit, meine Gesundheit und mein Geld gehen.')
            ->assertSee('Nächstes Projekt')
            ->assertSee('href="http://localhost/de/jay-jay"', false)
            ->assertSee('href="http://localhost/en/quantified"', false);
    }

    public function test_jay_jay_case_study_renders_in_both_locales(): void
    {
        $this->get('/jay-jay')
            ->assertRedirect('/en/jay-jay');

        $this->get('/en/jay-jay')
            ->assertOk()
            ->assertSee('<title>Jay-Jay</title>', false)
            ->assertSee('project-detail--jay-jay', false)
            ->assertSee('Jay-Jay is my business for websites, hosting, domains, email and support.')
            ->assertSee('<dt>Stack</dt>', false)
            ->assertSee('Founder, product designer and developer.')
            ->assertSee('<div id="client-hub" class="scene-stage__step" data-scene-step="client-hub-scene"></div>', false)
            ->assertSee('It runs on demo data')
            ->assertSee('Scherer Gartengestaltung &amp; Pflege AG', false)
            ->assertSee('href="https://scherergartengestaltung.ch/"', false)
            ->assertSee('href="https://jay-jay.ch/en/"', false)
            ->assertSee('rel="noopener noreferrer"', false)
            ->assertSee('data-dot-orb-figure="leaf"', false)
            ->assertSee('data-project="quantified"', false)
            ->assertSee('href="http://localhost/en/quantified"', false)
            ->assertSee('href="http://localhost/de/jay-jay"', false);

        $this->get('/de/jay-jay')
            ->assertOk()
            ->assertSee('Websites für Kunden, auf dieselbe Art gebaut.')
            ->assertSee('Ein Portal für Kunden')
            ->assertSee('href="https://jay-jay.ch/de/"', false)
            ->assertSee('href="http://localhost/de/quantified"', false)
            ->assertSee('href="http://localhost/en/jay-jay"', false);
    }

    public function test_the_former_sessiondeck_addresses_lead_to_the_projects(): void
    {
        $this->get('/session-deck')
            ->assertMovedPermanently()
            ->assertRedirect('/en/projects');

        $this->get('/de/session-deck')
            ->assertMovedPermanently()
            ->assertRedirect('/de/projects');

        $this->get('/en/projects')
            ->assertOk()
            ->assertDontSee('SessionDeck');
    }

    public function test_every_scene_names_what_the_sphere_shows_in_both_locales(): void
    {
        $sphere = config('portfolio.scenes');
        $pages = ['about_page' => 'about', 'quantified_page' => 'quantified', 'jay_jay_page' => 'jay-jay'];

        foreach (array_keys(config('portfolio.locales')) as $locale) {
            foreach ($pages as $page => $key) {
                $scenes = config("portfolio.content.{$locale}.{$page}.scenes");

                $this->assertSame(array_column($scenes, 'id'), array_keys($sphere[$key]), "{$locale}.{$page}");
            }
        }
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
            ->assertSee('A few sentences are enough:')
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
