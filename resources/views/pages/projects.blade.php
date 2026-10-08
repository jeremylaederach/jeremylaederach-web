@extends('layouts.app')

@section('content')
    <article class="portfolio-page projects-page">
        <section class="project-index" aria-labelledby="projects-title" data-reveal>
            <div class="dot-orb" aria-hidden="true">
                <canvas data-dot-orb data-dot-orb-fit></canvas>
            </div>

            <header class="project-index__header">
                <x-animated-page-heading id="projects-title" :text="$content['projects_page']['heading']" />

                <p>{{ $content['projects_page']['intro'] }}</p>
            </header>

            <ol class="project-index__list">
                @foreach (array_filter($content['projects_page']['items'], fn (array $project): bool => $project['featured'] ?? true) as $project)
                    <li
                        id="{{ $project['slug'] }}"
                        class="project-index__item project-index__item--{{ $project['slug'] }}"
                        data-project-index-item
                        @if ($loop->first) data-current @endif
                    >
                        <a
                            class="project-index__link"
                            href="{{ route($project['detail_route'], ['locale' => $locale]) }}"
                            aria-label="{{ $content['ui']['open'] }} {{ $project['name'] }}"
                            aria-describedby="project-detail-{{ $project['slug'] }}"
                            data-dot-orb-figure="{{ $project['slug'] }}"
                            data-pointer-wrap
                            @if ($loop->first) data-dot-orb-resting @endif
                            data-route="projects"
                            data-route-transition
                            data-interface-sound
                            data-sound-tone="panel"
                        >
                            <span class="project-index__name">{{ $project['name'] }}</span>
                            <x-nav-icon name="arrow-right" />
                        </a>

                        <div id="project-detail-{{ $project['slug'] }}" class="project-index__detail">
                            <p class="project-index__type">{{ $project['type'] }}</p>
                            <p class="project-index__description">{{ $project['description'] }}</p>
                            <ul class="project-index__tags">
                                @foreach ($project['tags'] as $tag)
                                    <li>{{ $tag }}</li>
                                @endforeach
                            </ul>
                        </div>
                    </li>
                @endforeach
            </ol>
        </section>
    </article>
@endsection
