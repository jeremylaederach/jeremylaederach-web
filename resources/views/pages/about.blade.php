@extends('layouts.app')

@section('content')
    <article class="portfolio-page about-page">
        <header class="page-hero page-hero--about" data-pointer-surface data-reveal>
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
                    <li data-pointer-surface>
                        <span>0{{ $loop->iteration }}</span>
                        <time>{{ $step['period'] }}</time>
                        <h3>{{ $step['title'] }}</h3>
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

            <ul class="technology-grid">
                @foreach ($content['about_page']['technology_list'] as $technology)
                    <li style="--technology-color: {{ $technology['color'] }}">
                        <span
                            class="technology-grid__mark"
                            data-technology-icon="{{ $technology['icon'] }}"
                            aria-hidden="true"
                        >
                            <span>{{ $technology['fallback'] }}</span>
                        </span>
                        <span class="technology-grid__index">0{{ $loop->iteration }}</span>
                        <strong>{{ $technology['name'] }}</strong>
                        <small>{{ $technology['detail'] }}</small>
                    </li>
                @endforeach
            </ul>
        </section>

        <a
            class="page-cta page-cta--contact"
            href="{{ route('contact', ['locale' => $locale]) }}"
            data-route="contact"
            data-route-transition
            data-transition-label="{{ $content['contact_page']['heading'] }}"
            data-interface-sound
            data-sound-tone="panel"
            data-pointer-surface
            data-reveal
        >
            <span>{{ $content['contact_page']['eyebrow'] }}</span>
            <strong>{{ $content['contact_page']['heading'] }}</strong>
            <x-nav-icon name="arrow-right" />
        </a>
    </article>
@endsection
