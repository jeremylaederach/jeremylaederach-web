@extends('layouts.app')

@section('content')
    <article class="portfolio-page about-page">
        <header class="page-hero page-hero--about" data-reveal>
            <div class="page-hero__index">
                <span>02</span>
                <span>{{ $content['about_page']['eyebrow'] }}</span>
            </div>

            <div class="page-hero__title">
                <h1>{{ $content['about_page']['heading'] }}<span class="accent-dot">.</span></h1>
            </div>

            <p>{{ $content['about_page']['intro'] }}</p>

            <a class="scroll-cue" href="#story" data-interface-sound>
                <span>{{ $content['about_page']['principles_heading'] }}</span>
                <x-nav-icon name="arrow-down" />
            </a>
        </header>

        <section id="story" class="about-story" data-reveal>
            <p class="section-label">01 / {{ $content['about_page']['facts_heading'] }}</p>

            <div class="about-story__lead">
                <p>{{ $content['about_page']['body'][0] }}</p>
            </div>

            <div class="about-story__body">
                <p>{{ $content['about_page']['body'][1] }}</p>
            </div>

            <dl class="about-facts">
                @foreach ($content['about_page']['facts'] as $fact)
                    <div>
                        <dt>{{ $fact['label'] }}</dt>
                        <dd>{{ $fact['value'] }}</dd>
                    </div>
                @endforeach
            </dl>
        </section>

        <section class="principles-section" aria-labelledby="principles-title" data-reveal>
            <header>
                <p class="section-label">02</p>
                <h2 id="principles-title">{{ $content['about_page']['principles_heading'] }}</h2>
            </header>

            <ol class="principles-list">
                @foreach ($content['about_page']['principles'] as $principle)
                    <li data-pointer-surface>
                        <span>0{{ $loop->iteration }}</span>
                        <h3>{{ $principle['title'] }}</h3>
                        <p>{{ $principle['body'] }}</p>
                    </li>
                @endforeach
            </ol>
        </section>

        <section id="stack" class="stack-section" aria-labelledby="stack-title" data-reveal>
            <header>
                <p class="section-label">03</p>
                <h2 id="stack-title">{{ $content['about_page']['technology_heading'] }}</h2>
            </header>

            <ol>
                @foreach ($content['about_page']['technology_list'] as $technology)
                    <li data-pointer-surface>
                        <span>0{{ $loop->iteration }}</span>
                        <strong>{{ $technology }}</strong>
                        <x-nav-icon name="arrow-right" />
                    </li>
                @endforeach
            </ol>
        </section>

        <a
            class="page-cta page-cta--about"
            href="{{ route('contact', ['locale' => $locale]) }}"
            data-route="contact"
            data-route-transition
            data-transition-label="{{ $content['contact_page']['heading'] }}"
            data-interface-sound
            data-pointer-surface
            data-reveal
        >
            <span>{{ $content['contact_page']['eyebrow'] }}</span>
            <strong>{{ $content['contact_page']['heading'] }}</strong>
            <x-nav-icon name="arrow-right" />
        </a>
    </article>
@endsection
