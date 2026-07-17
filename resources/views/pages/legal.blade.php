@extends('layouts.app')

@section('content')
    <article class="legal-page">
        <header class="legal-page__header">
            <p class="legal-page__eyebrow">{{ $legal['eyebrow'] }}</p>
            <h1>{{ $legal['title'] }}</h1>
            <p>{{ $legal['intro'] }}</p>

            @isset($legal['updated'])
                <small>{{ $legal['updated'] }}</small>
            @endisset
        </header>

        <div class="legal-page__sections">
            @foreach ($legal['sections'] as $section)
                <section class="legal-section reveal">
                    <span class="legal-section__number">{{ str_pad((string) $loop->iteration, 2, '0', STR_PAD_LEFT) }}</span>

                    <div class="legal-section__content">
                        <h2>{{ $section['title'] }}</h2>

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
