@extends('layouts.app', [
    'title' => $content['not_found']['heading'],
    'description' => $content['not_found']['intro'],
])

@section('content')
    {{-- A stage: the message beside the sphere, which rests in the figure of the number. --}}
    <section
        class="not-found-page"
        aria-labelledby="not-found-title"
        data-dot-orb-figure="not-found"
        data-dot-orb-resting
    >
        <div class="dot-orb" data-dot-orb-stage data-dot-orb-fit></div>

        <div class="not-found-page__message" data-reveal>
            <h1 id="not-found-title">
                {{ $content['not_found']['heading'] }}<span class="accent-dot">.</span>
            </h1>
            <p>{{ $content['not_found']['intro'] }}</p>

            <a
                class="directional-link directional-link--forward"
                href="{{ route('home', ['locale' => $locale]) }}"
                data-route="home"
                data-route-transition
                data-interface-sound
                data-sound-tone="action"
            >
                <span>{{ $content['not_found']['action'] }}</span>
                <x-nav-icon name="arrow-right" />
            </a>
        </div>
    </section>
@endsection
