@extends('layouts.app')

@section('content')
    <article class="legal-page">
        <header class="legal-page__header" data-reveal>
            <h1>{{ $legal['title'] }}<span class="accent-dot">.</span></h1>

            <div class="legal-page__summary">
                <p>{{ $legal['intro'] }}</p>

                @isset($legal['updated'])
                    <small>{{ $legal['updated'] }}</small>
                @endisset
            </div>
        </header>

        {{-- Every section is a row between hairlines: its title, then its text. --}}
        <div class="legal-rows">
            @foreach ($legal['sections'] as $section)
                <section class="legal-row">
                    <h2>{{ $section['title'] }}</h2>

                    <div class="legal-row__text">
                        @foreach ($section['body'] as $paragraph)
                            <p>{{ $paragraph }}</p>
                        @endforeach

                        @foreach ($section['links'] ?? [] as $link)
                            <a
                                href="{{ $link['url'] }}"
                                @if (str_starts_with($link['url'], 'http')) rel="noopener noreferrer" @endif
                                data-interface-sound
                                data-sound-tone="control"
                            >{{ $link['label'] }}</a>
                        @endforeach
                    </div>
                </section>
            @endforeach
        </div>
    </article>
@endsection
