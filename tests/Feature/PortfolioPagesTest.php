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

    public function test_localized_home_pages_render_real_portfolio_content(): void
    {
        $this->get('/en')
            ->assertOk()
            ->assertSee('Jeremy Läderach')
            ->assertSee('Quantified')
            ->assertSee('Jay-Jay');

        $this->get('/de')
            ->assertOk()
            ->assertSee('Scharfe Software')
            ->assertSee('Scherer Gartengestaltung');
    }

    public function test_contact_and_imprint_pages_render_per_locale(): void
    {
        $this->get('/en/contact')
            ->assertOk()
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
