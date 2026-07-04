@extends('layouts.app')

@section('content')
    <section class="page-stage section-shell">
        <div class="page-stage__backdrop" aria-hidden="true">{{ $content['about_page']['backdrop'] }}</div>

        <div class="page-stage__intro">
            <p class="eyebrow">{{ $content['about_page']['kicker'] }}</p>
            <h1>{{ $content['about_page']['title'] }}</h1>
            <p>{{ $content['about_page']['intro'] }}</p>
        </div>

        <div class="profile-layout">
            <div class="profile-layout__copy reveal">
                @foreach ($content['about_page']['body'] as $paragraph)
                    <p>{{ $paragraph }}</p>
                @endforeach
            </div>

            <aside class="profile-facts reveal" aria-label="{{ $content['about_page']['kicker'] }}">
                @foreach ($content['about_page']['facts'] as $fact)
                    <article>
                        <span>{{ $fact['label'] }}</span>
                        <strong>{{ $fact['value'] }}</strong>
                    </article>
                @endforeach
            </aside>
        </div>

        <div class="stack-grid">
            @foreach ($content['about_page']['stack'] as $group)
                <article class="stack-card reveal">
                    <h2>{{ $group['name'] }}</h2>
                    <ul>
                        @foreach ($group['items'] as $item)
                            <li>{{ $item }}</li>
                        @endforeach
                    </ul>
                </article>
            @endforeach
        </div>
    </section>
@endsection
