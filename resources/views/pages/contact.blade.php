@extends('layouts.app')

@section('content')
    <section class="page-scene page-scene--contact" aria-labelledby="contact-title">
        <div class="page-scene__shell contact-layout">
            <header class="page-heading page-heading--contact">
                <span>03 / {{ $content['contact_page']['eyebrow'] }}</span>
                <h1 id="contact-title">{{ $content['contact_page']['heading'] }}</h1>
                <p>{{ $content['contact_page']['intro'] }}</p>
                <x-social-links />
            </header>

            <form
                class="contact-form"
                action="{{ config('portfolio.socials.email.url') }}"
                method="post"
                enctype="text/plain"
            >
                <label>
                    <span>{{ $content['contact_page']['form']['name'] }}</span>
                    <input type="text" name="name" placeholder="{{ $content['contact_page']['form']['name'] }}" autocomplete="name" required>
                </label>

                <label>
                    <span>{{ $content['contact_page']['form']['email'] }}</span>
                    <input type="email" name="email" placeholder="{{ $content['contact_page']['form']['email'] }}" autocomplete="email" required>
                </label>

                <label>
                    <span>{{ $content['contact_page']['form']['message'] }}</span>
                    <textarea name="message" placeholder="{{ $content['contact_page']['form']['message'] }}" rows="5" required></textarea>
                </label>

                <button type="submit">
                    {{ $content['contact_page']['form']['submit'] }}
                    <x-nav-icon name="arrow-right" />
                </button>
            </form>
        </div>

        <p class="scene-index"><span>04</span>{{ $content['contact_page']['heading'] }}</p>
    </section>
@endsection
