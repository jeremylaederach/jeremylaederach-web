<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\App;

class PortfolioController extends Controller
{
    public function home(string $locale): View
    {
        return $this->render('pages.home', $locale);
    }

    public function contact(string $locale): View
    {
        $content = $this->contentFor($locale);

        return $this->render('pages.contact', $locale, [
            'title' => $content['contact_page']['title'].' - Jeremy Läderach',
        ]);
    }

    public function imprint(string $locale): View
    {
        $content = $this->contentFor($locale);

        return $this->render('pages.imprint', $locale, [
            'title' => $content['imprint']['title'].' - Jeremy Läderach',
        ]);
    }

    private function render(string $view, string $locale, array $data = []): View
    {
        return view($view, [
            'locale' => $locale,
            'content' => $this->contentFor($locale),
            ...$data,
        ]);
    }

    private function contentFor(string $locale): array
    {
        App::setLocale($locale);

        return config("portfolio.content.{$locale}");
    }
}
