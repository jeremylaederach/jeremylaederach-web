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

    public function about(string $locale): View
    {
        return $this->render('pages.about', $locale);
    }

    public function projects(string $locale): View
    {
        return $this->render('pages.projects', $locale);
    }

    public function quantified(string $locale): View
    {
        $content = $this->contentFor($locale);

        return view('pages.quantified', [
            'locale' => $locale,
            'content' => $content,
            'project' => $content['quantified_page'],
            'scene' => 'projects',
            'title' => 'Quantified · Jeremy Läderach',
            'description' => $content['quantified_page']['meta_description'],
        ]);
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
