@extends('layouts.app')

@section('content')
    <section class="page-hero section-shell">
        <div class="section-heading section-heading--wide reveal">
            <p class="eyebrow">Legal</p>
            <h1>{{ $content['imprint']['title'] }}</h1>
            <p>{{ $content['imprint']['intro'] }}</p>
        </div>
    </section>

    <section class="content-section section-shell imprint-grid">
        @foreach ($content['imprint']['sections'] as $section)
            <article class="mini-card reveal">
                <span>{{ $section['title'] }}</span>
                @foreach ($section['body'] as $line)
                    <p>{{ $line }}</p>
                @endforeach
            </article>
        @endforeach
    </section>
@endsection
