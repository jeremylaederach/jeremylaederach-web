@extends('layouts.app')

@section('content')
    <article class="portfolio-page projects-page">
        <header class="page-hero page-hero--projects" data-pointer-surface data-reveal>
            <div class="page-hero__index">
                <span>01</span>
                <span>{{ $content['projects_page']['eyebrow'] }}</span>
            </div>

            <div class="page-hero__title">
                <h1>{{ $content['projects_page']['heading'] }}<span class="accent-dot">.</span></h1>
            </div>

            <p>{{ $content['projects_page']['intro'] }}</p>

            <a class="scroll-cue" href="#selected-work" data-interface-sound data-sound-tone="action">
                <span>{{ $content['projects_page']['featured_label'] }}</span>
                <x-nav-icon name="arrow-down" />
            </a>
        </header>

        <section id="selected-work" class="project-cases" aria-label="{{ $content['projects_page']['heading'] }}">
            @foreach ($content['projects_page']['items'] as $project)
                @php
                    $detailContentKey = match ($project['detail_route']) {
                        'jay-jay' => 'jay_jay_page',
                        'session-deck' => 'sessiondeck_page',
                        default => $project['detail_route'].'_page',
                    };
                    $detailProject = $content[$detailContentKey];
                @endphp

                <article
                    id="{{ $project['slug'] }}"
                    class="project-case project-case--{{ $loop->iteration }} project-case--{{ $project['slug'] }}"
                    data-reveal
                    data-pointer-surface
                >
                    <a
                        class="project-case__link"
                        href="{{ route($project['detail_route'], ['locale' => $locale]) }}"
                        aria-label="{{ $content['ui']['open'] }} {{ $project['name'] }}"
                        data-interface-sound
                        data-sound-tone="panel"
                        data-route="projects"
                        data-route-transition
                        data-transition-label="{{ $project['name'] }}"
                        data-transition-theme="{{ $project['transition_theme'] }}"
                        data-pointer-route="{{ $project['transition_theme'] }}"
                    >
                        <div class="project-case__content">
                            <header class="project-case__header">
                                <span>0{{ $loop->iteration }}</span>
                                <p>{{ $project['type'] }}</p>
                                <h2>{{ $project['name'] }}</h2>
                            </header>

                            <div class="project-case__details">
                                <p>{{ $project['description'] }}</p>
                                <ul aria-label="{{ $project['name'] }} technologies">
                                    @foreach ($project['tags'] as $tag)
                                        <li>{{ $tag }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        </div>

                        <x-project-reel
                            :project="$detailProject"
                            :ui="$content['ui']"
                            mode="teaser"
                            data-transition-origin
                        />
                    </a>
                </article>
            @endforeach
        </section>

        <x-contact-cta :content="$content" :locale="$locale" />
    </article>
@endsection
