@extends('layouts.app')

@section('content')
    <article class="portfolio-page contact-page">
        <header class="page-hero page-hero--contact" data-pointer-surface data-reveal>
            <div class="page-hero__index">
                <span>03</span>
                <span>{{ $content['contact_page']['eyebrow'] }}</span>
            </div>

            <div class="page-hero__title">
                <h1>{{ $content['contact_page']['heading'] }}<span class="accent-dot">.</span></h1>
            </div>

            <p>{{ $content['contact_page']['intro'] }}</p>

            <a class="scroll-cue" href="#contact-workspace" data-interface-sound data-sound-tone="action">
                <span>{{ $content['contact_page']['direct_label'] }}</span>
                <x-nav-icon name="arrow-down" />
            </a>
        </header>

        <section id="contact-workspace" class="contact-workspace" data-reveal>
            <header class="contact-workspace__header">
                <p class="section-label contact-workspace__label">
                    <span>01</span>
                    <span aria-hidden="true">/</span>
                    <span>{{ $content['contact_page']['direct_label'] }}</span>
                </p>
                <h2>{{ $content['contact_page']['direct_heading'] }}</h2>
            </header>

            <a
                class="contact-email"
                href="{{ config('portfolio.socials.email.url') }}"
                data-interface-sound
                data-sound-tone="action"
                data-pointer-surface
            >
                <span>{{ config('portfolio.socials.email.label') }}</span>
                <strong>{{ config('portfolio.socials.email.display') }}</strong>
                <x-nav-icon name="arrow-up-right" />
            </a>

            <div class="contact-workspace__details">
                <div class="contact-note">
                    <p class="section-label">{{ $content['contact_page']['context_label'] }}</p>
                    <p>{{ $content['contact_page']['context'] }}</p>
                </div>

                <nav class="contact-channels" aria-label="{{ $content['contact_page']['channels_label'] }}">
                    <p class="section-label">{{ $content['contact_page']['channels_label'] }}</p>
                    <div>
                        @foreach (config('portfolio.socials') as $key => $social)
                            @continue($key === 'email')

                            <a
                                href="{{ $social['url'] }}"
                                rel="noopener noreferrer"
                                data-interface-sound
                                data-sound-tone="action"
                                data-pointer-surface
                            >
                                <span>{{ $social['label'] }}</span>
                                <strong>{{ $social['display'] }}</strong>
                                <x-nav-icon name="arrow-up-right" />
                            </a>
                        @endforeach
                    </div>
                </nav>
            </div>
        </section>
    </article>
@endsection
