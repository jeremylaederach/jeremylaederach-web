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

    public function test_localized_home_pages_render_the_cat_stage(): void
    {
        $this->get('/en')
            ->assertOk()
            ->assertSee('<title>Jeremy Läderach</title>', false)
            ->assertSee('SOFTWARE')
            ->assertSee('ENGINEER')
            ->assertSee('Work')
            ->assertSee('Stack')
            ->assertSee('Pick a prop')
            ->assertDontSee('Useful web software');

        $this->get('/de')
            ->assertOk()
            ->assertSee('SOFTWARE')
            ->assertSee('ENGINEER')
            ->assertSee('Stack');
    }

    public function test_contact_and_imprint_pages_render_per_locale(): void
    {
        $this->get('/en/contact')
            ->assertOk()
            ->assertSee('<title>Jeremy Läderach</title>', false)
            ->assertSee('The contact form can come later')
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
