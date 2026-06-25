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
        return $this->render('pages.contact', $locale);
    }

    public function imprint(string $locale): View
    {
        return $this->render('pages.imprint', $locale);
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
