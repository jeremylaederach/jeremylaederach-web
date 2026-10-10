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
        return redirect()->to(route('jay-jay', ['locale' => $locale]).'#details', 301);
    }

    public function sessionDeck(string $locale): RedirectResponse
    {
        return redirect()->to(route('projects', ['locale' => $locale]), 301);
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

    /**
     * @param  view-string  $view
     */
    private function render(string $view, string $locale, ?string $contentKey = null): View
    {
        $content = $this->contentFor($locale);
        $page = $contentKey === null ? null : $content[$contentKey];

        return view($view, [
            'locale' => $locale,
            'content' => $content,
            'title' => $page['heading'] ?? $content['meta']['title'],
            'description' => $page['intro'] ?? $page['scenes'][0]['text'] ?? $content['meta']['description'],
        ]);
    }

    private function renderProject(string $locale, string $contentKey): View
    {
        $content = $this->contentFor($locale);
        $project = $content[$contentKey];
        $projectItems = $content['projects_page']['items'];
        $projectIndex = (int) array_search($project['slug'], array_column($projectItems, 'slug'), true);
        $nextProject = $projectItems[($projectIndex + 1) % count($projectItems)];
        $sphere = config('portfolio.scenes');

        return view('pages.project', [
            'locale' => $locale,
            'content' => $content,
            'project' => $project,
            'nextProject' => $nextProject,
            // What the sphere shows for each scene; the last one shows the next project.
            'sphere' => [...$sphere[$project['slug']], 'next' => $sphere[$nextProject['slug']]['overview']],
            'scene' => 'projects',
            'title' => $project['heading'],
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
            'title' => $content[$contentKey]['title'],
            'description' => $content[$contentKey]['intro'],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function contentFor(string $locale): array
    {
        App::setLocale($locale);

        return config("portfolio.content.{$locale}");
    }
}
