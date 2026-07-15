@extends('layouts.app')

@section('content')
    <article class="portfolio-page case-study-page quantified-page">
        <header class="case-study-hero" data-reveal>
            <a
                class="case-study-back"
                href="{{ route('projects', ['locale' => $locale]) }}#quantified"
                data-route="projects"
                data-route-transition
                data-transition-label="{{ $content['projects_page']['heading'] }}"
                data-interface-sound
                data-sound-tone="navigation"
            >
                <x-nav-icon name="arrow-right" />
                <span>{{ $project['back'] }}</span>
            </a>

            <div class="case-study-hero__index">
                <span>01</span>
                <span>{{ $project['eyebrow'] }}</span>
            </div>

            <h1>{{ $project['heading'] }}<span class="accent-dot">.</span></h1>

            <div class="case-study-hero__intro">
                <p>{{ $project['intro'] }}</p>
                <dl>
                    <div>
                        <dt>{{ $project['status_label'] }}</dt>
                        <dd>{{ $project['status'] }}</dd>
                    </div>
                    <div>
                        <dt>{{ $project['role_label'] }}</dt>
                        <dd>{{ $project['role'] }}</dd>
                    </div>
                </dl>
            </div>

            <x-quantified-preview
                class="case-study-hero__visual"
                :copy="$project['preview']"
                :label="$project['preview_label']"
                :expanded="true"
            />
        </header>

        <section class="case-study-section case-study-overview" data-reveal>
            <p class="section-label">{{ $project['overview']['label'] }}</p>
            <h2>{{ $project['overview']['heading'] }}</h2>
            <div class="case-study-copy">
                @foreach ($project['overview']['body'] as $paragraph)
                    <p>{{ $paragraph }}</p>
                @endforeach
            </div>
        </section>

        <section class="case-study-section case-study-system" data-reveal>
            <header>
                <p class="section-label">{{ $project['architecture']['label'] }}</p>
                <h2>{{ $project['architecture']['heading'] }}</h2>
            </header>

            <ol class="system-flow">
                @foreach ($project['architecture']['items'] as $item)
                    <li>
                        <span>0{{ $loop->iteration }}</span>
                        <h3>{{ $item['title'] }}</h3>
                        <p>{{ $item['body'] }}</p>
                    </li>
                @endforeach
            </ol>
        </section>

        <section class="case-study-section case-study-scope" data-reveal>
            <header>
                <p class="section-label">{{ $project['scope']['label'] }}</p>
                <h2>{{ $project['scope']['heading'] }}</h2>
                <p>{{ $project['scope']['intro'] }}</p>
            </header>

            <ol class="scope-list">
                @foreach ($project['scope']['items'] as $item)
                    <li>
                        <span>0{{ $loop->iteration }}</span>
                        <h3>{{ $item['title'] }}</h3>
                        <p>{{ $item['body'] }}</p>
                    </li>
                @endforeach
            </ol>
        </section>

        <a
            class="case-study-next"
            href="{{ route('contact', ['locale' => $locale]) }}"
            data-route="contact"
            data-route-transition
            data-transition-label="{{ $content['contact_page']['heading'] }}"
            data-interface-sound
            data-sound-tone="panel"
            data-pointer-surface
            data-reveal
        >
            <span>{{ $project['next_label'] }}</span>
            <strong>{{ $project['next'] }}</strong>
            <x-nav-icon name="arrow-right" />
        </a>
    </article>
@endsection
