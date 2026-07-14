@extends('layouts.app')

@section('content')
    <article class="portfolio-page contact-page">
        <header class="page-hero page-hero--contact" data-reveal>
            <div class="page-hero__index">
                <span>03</span>
                <span>{{ $content['contact_page']['eyebrow'] }}</span>
            </div>

            <div class="page-hero__title">
                <h1>{{ $content['contact_page']['heading'] }}<span class="accent-dot">.</span></h1>
            </div>

            <p>{{ $content['contact_page']['intro'] }}</p>

            <a class="scroll-cue" href="#contact-workspace" data-interface-sound>
                <span>{{ $content['contact_page']['direct_label'] }}</span>
                <x-nav-icon name="arrow-down" />
            </a>
        </header>

        <section id="contact-workspace" class="contact-workspace" data-reveal>
            <div class="contact-direct">
                <p class="section-label">01 / {{ $content['contact_page']['direct_label'] }}</p>
                <a href="{{ config('portfolio.socials.email.url') }}" data-interface-sound>
                    <span>{{ config('portfolio.socials.email.display') }}</span>
                    <x-nav-icon name="arrow-up-right" />
                </a>
                <x-social-links />
            </div>

            <form
                class="contact-form"
                action="{{ config('portfolio.socials.email.url') }}"
                method="post"
                enctype="text/plain"
            >
                <h2>{{ $content['contact_page']['form_heading'] }}</h2>

                <label>
                    <span>{{ $content['contact_page']['form']['name'] }}</span>
                    <input type="text" name="name" autocomplete="name" required>
                </label>

                <label>
                    <span>{{ $content['contact_page']['form']['email'] }}</span>
                    <input type="email" name="email" autocomplete="email" required>
                </label>

                <label>
                    <span>{{ $content['contact_page']['form']['message'] }}</span>
                    <textarea name="message" rows="5" required></textarea>
                </label>

                <button type="submit" data-interface-sound>
                    {{ $content['contact_page']['form']['submit'] }}
                    <x-nav-icon name="arrow-right" />
                </button>
            </form>
        </section>
    </article>
@endsection
