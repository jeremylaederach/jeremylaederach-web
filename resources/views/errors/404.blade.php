@extends('layouts.app')

@section('content')
    <section class="not-found-page" aria-labelledby="not-found-title" data-pointer-surface data-reveal>
        <div class="not-found-page__index">
            <span>404</span>
            <span>{{ $content['not_found']['eyebrow'] }}</span>
        </div>

        <p class="not-found-page__code" aria-hidden="true">404<span>.</span></p>

        <div class="not-found-page__message">
            <h1 id="not-found-title">
                {{ $content['not_found']['heading'] }}<span class="accent-dot">.</span>
            </h1>
            <p>{{ $content['not_found']['intro'] }}</p>

            <a
                href="{{ route('home', ['locale' => $locale]) }}"
                data-route="home"
                data-route-transition
                data-transition-label="{{ $content['nav'][0]['label'] }}"
                data-interface-sound
                data-sound-tone="action"
            >
                <span>{{ $content['not_found']['action'] }}</span>
                <x-nav-icon name="arrow-right" />
            </a>
        </div>
    </section>
@endsection
