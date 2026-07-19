@extends('layouts.app')

@section('content')
    <article class="portfolio-page about-page">
        <header class="page-hero page-hero--about" data-pointer-surface data-reveal>
            <div class="page-hero__index">
                <span>02</span>
                <span>{{ $content['about_page']['eyebrow'] }}</span>
            </div>

            <div class="page-hero__title">
                <h1>{{ $content['about_page']['heading'] }}<span class="accent-dot">.</span></h1>
            </div>

            <p>{{ $content['about_page']['intro'] }}</p>

            <a class="scroll-cue" href="#story" data-interface-sound data-sound-tone="action">
                <span>{{ $content['about_page']['story_link'] }}</span>
                <x-nav-icon name="arrow-down" />
            </a>
        </header>

        <section id="story" class="about-story" data-reveal>
            <p class="section-label about-section-label">
                <span>01</span>
                <span aria-hidden="true">/</span>
                <span>{{ $content['about_page']['eyebrow'] }}</span>
            </p>

            <div class="about-story__lead">
                <h2>{{ $content['about_page']['story_heading'] }}</h2>
            </div>

            <div class="about-story__body">
                @foreach ($content['about_page']['body'] as $paragraph)
                    <p>{{ $paragraph }}</p>
                @endforeach
            </div>
        </section>

        <section class="career-section" aria-labelledby="career-title" data-reveal>
            <header class="about-section-heading">
                <p class="section-label about-section-label">
                    <span>02</span>
                    <span aria-hidden="true">/</span>
                    <span>{{ $content['about_page']['career_label'] }}</span>
                </p>
                <div class="about-section-heading__content">
                    <h2 id="career-title">{{ $content['about_page']['career_heading'] }}</h2>
                </div>
            </header>

            <ol class="career-list">
                @foreach ($content['about_page']['career'] as $step)
                    <li @class(['career-list__current' => isset($step['status'])]) data-pointer-surface>
                        <span>0{{ $loop->iteration }}</span>
                        <time>{{ $step['period'] }}</time>
                        <h3>
                            {{ $step['title'] }}
                            @isset($step['status'])
                                <span class="career-list__status">
                                    <i aria-hidden="true"></i>
                                    {{ $step['status'] }}
                                </span>
                            @endisset
                        </h3>
                        <p>{{ $step['body'] }}</p>
                    </li>
                @endforeach
            </ol>
        </section>

        <section id="stack" class="stack-section" aria-labelledby="stack-title" data-reveal>
            <header class="about-section-heading">
                <p class="section-label about-section-label">
                    <span>03</span>
                    <span aria-hidden="true">/</span>
                    <span>{{ $content['about_page']['technology_label'] }}</span>
                </p>
                <div class="about-section-heading__content">
                    <h2 id="stack-title">{{ $content['about_page']['technology_heading'] }}</h2>
                    <p>{{ $content['about_page']['technology_intro'] }}</p>
                </div>
            </header>

            <ul class="technology-groups">
                @foreach ($content['about_page']['technology_groups'] as $group)
                    <li
                        class="technology-group"
                        style="--technology-color: {{ $group['color'] }}"
                        data-pointer-surface
                    >
                        <div class="technology-group__visual" aria-hidden="true">
                            <span
                                class="technology-group__mark"
                                data-technology-icon="{{ $group['icon'] }}"
                            >
                                <span>{{ $group['fallback'] }}</span>
                            </span>
                            <i></i>
                            <i></i>
                        </div>

                        <div class="technology-group__copy">
                            <span class="technology-group__index">0{{ $loop->iteration }}</span>
                            <h3>{{ $group['title'] }}</h3>
                            <p>{{ $group['body'] }}</p>
                        </div>

                        <ul class="technology-group__tools" aria-label="{{ $group['title'] }}">
                            @foreach ($group['tools'] as $tool)
                                <li>{{ $tool }}</li>
                            @endforeach
                        </ul>
                    </li>
                @endforeach
            </ul>
        </section>

        <x-about-lab :content="$content" />

        <x-contact-cta :content="$content" :locale="$locale" />
    </article>
@endsection
