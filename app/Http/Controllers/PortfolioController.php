<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
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
        return $this->renderProject($locale, 'quantified_page');
    }

    public function jayJay(string $locale): View
    {
        return $this->renderProject($locale, 'jay_jay_page');
    }

    public function jayJayClientHub(string $locale): RedirectResponse
    {
        return redirect()->to(route('jay-jay', ['locale' => $locale]).'#client-hub', 301);
    }

    public function sessionDeck(string $locale): View
    {
        return $this->renderProject($locale, 'sessiondeck_page');
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

    private function renderProject(string $locale, string $contentKey): View
    {
        $content = $this->contentFor($locale);
        $project = $content[$contentKey];
        $projectSlugs = array_column($content['projects_page']['items'], 'slug');
        $projectIndex = array_search($project['slug'], $projectSlugs, true);

        return view('pages.project', [
            'locale' => $locale,
            'content' => $content,
            'project' => $project,
            'projectNumber' => $projectIndex === false ? 1 : $projectIndex + 1,
            'scene' => 'projects',
            'title' => "{$project['heading']} · Jeremy Läderach",
            'description' => $project['meta_description'],
        ]);
    }

    private function contentFor(string $locale): array
    {
        App::setLocale($locale);

        return config("portfolio.content.{$locale}");
    }
}
