@extends('layouts.app')

@php
    // The last scene stands for the next project: its name, what it is and the way there.
    $scenes = [...$project['scenes'], [
        'id' => 'next',
        'label' => $content['ui']['next_project'],
        'text' => $nextProject['name'],
        'detail' => $nextProject['description'],
        'project' => $nextProject['slug'],
        'link' => [
            'label' => $content['ui']['open'].' '.$nextProject['name'],
            'url' => route($nextProject['detail_route'], ['locale' => $locale]),
            'route' => 'projects',
        ],
    ]];
@endphp

@section('content')
    <article class="portfolio-page scene-page project-page project-detail project-detail--{{ $project['slug'] }}">
        <x-scene-stage
            :scenes="$scenes"
            :sphere="$sphere"
            :label="$content['ui']['scenes']"
            :next="$content['ui']['next_scene']"
        >
            <a
                class="project-page__back directional-link directional-link--back"
                href="{{ route('projects', ['locale' => $locale]) }}#{{ $project['slug'] }}"
                data-route="projects"
                data-route-transition
                data-interface-sound
                data-sound-tone="navigation"
            >
                <x-nav-icon name="arrow-right" />
                <span>{{ $project['back'] }}</span>
            </a>

            <div class="project-page__title">
                <x-animated-page-heading :text="$project['heading']" />

                <p class="project-page__kind">{{ $project['kind'] }}</p>
            </div>
        </x-scene-stage>
    </article>
@endsection
