@extends('layouts.app')

@php
    $featured = array_filter(
        $content['projects_page']['items'],
        fn (array $project): bool => $project['featured'] ?? true,
    );
    $items = array_map(fn (array $project): array => [
        'id' => $project['slug'],
        'name' => $project['name'],
        'label' => $content['ui']['open'].' '.$project['name'],
        'href' => route($project['detail_route'], ['locale' => $locale]),
        'route' => 'projects',
        'project' => $project['slug'],
        'figure' => implode(' ', config('portfolio.project_figures')[$project['slug']]),
        'icon' => 'arrow-right',
        'detail' => [
            'kind' => $project['type'],
            'text' => $project['description'],
            'tags' => $project['tags'],
        ],
    ], array_values($featured));
@endphp

@section('content')
    <article class="portfolio-page projects-page">
        <x-stage-list
            heading-id="projects-title"
            :heading="$content['projects_page']['heading']"
            :intro="$content['projects_page']['intro']"
            :items="$items"
        />
    </article>
@endsection
