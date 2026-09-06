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
        return $this->render('pages.about', $locale, 'about_page');
    }

    public function projects(string $locale): View
    {
        return $this->render('pages.projects', $locale, 'projects_page');
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
        return $this->render('pages.contact', $locale, 'contact_page');
    }

    public function imprint(string $locale): View
    {
        return $this->renderLegalPage($locale, 'imprint');
    }

    public function privacy(string $locale): View
    {
        return $this->renderLegalPage($locale, 'privacy');
    }

    private function render(string $view, string $locale, ?string $contentKey = null): View
    {
        $content = $this->contentFor($locale);
        $page = $contentKey === null ? null : $content[$contentKey];

        return view($view, [
            'locale' => $locale,
            'content' => $content,
            'title' => $page === null ? $content['meta']['title'] : "{$page['heading']} · Jeremy Läderach",
            'description' => $page['intro'] ?? $content['meta']['description'],
        ]);
    }

    private function renderProject(string $locale, string $contentKey): View
    {
        $content = $this->contentFor($locale);
        $project = $content[$contentKey];
        $projectItems = $content['projects_page']['items'];
        $projectSlugs = array_column($projectItems, 'slug');
        $projectIndex = array_search($project['slug'], $projectSlugs, true);
        $resolvedProjectIndex = $projectIndex === false ? 0 : $projectIndex;
        $nextProject = $projectItems[($resolvedProjectIndex + 1) % count($projectItems)];

        return view('pages.project', [
            'locale' => $locale,
            'content' => $content,
            'project' => $project,
            'projectNumber' => $resolvedProjectIndex + 1,
            'nextProject' => $nextProject,
            'scene' => 'projects',
            'title' => "{$project['heading']} · Jeremy Läderach",
            'description' => $project['meta_description'],
        ]);
    }

    private function renderLegalPage(string $locale, string $contentKey): View
    {
        $content = $this->contentFor($locale);

        return view('pages.legal', [
            'locale' => $locale,
            'content' => $content,
            'legal' => $content[$contentKey],
            'title' => "{$content[$contentKey]['title']} · Jeremy Läderach",
            'description' => $content[$contentKey]['intro'],
        ]);
    }

    private function contentFor(string $locale): array
    {
        App::setLocale($locale);

        return config("portfolio.content.{$locale}");
    }
}
