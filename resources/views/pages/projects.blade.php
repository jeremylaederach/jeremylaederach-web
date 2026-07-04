@extends('layouts.app')

@section('content')
    <section class="page-stage section-shell">
        <div class="page-stage__backdrop" aria-hidden="true">{{ $content['projects_page']['backdrop'] }}</div>

        <div class="page-stage__intro page-stage__intro--split">
            <div>
                <p class="eyebrow">{{ $content['projects_page']['kicker'] }}</p>
                <h1>{{ $content['projects_page']['title'] }}</h1>
            </div>
            <p>{{ $content['projects_page']['intro'] }}</p>
        </div>

        <div class="project-list">
            @foreach ($content['projects_page']['items'] as $project)
                <article class="project-row reveal">
                    <span class="project-row__number">{{ str_pad((string) $loop->iteration, 2, '0', STR_PAD_LEFT) }}</span>
                    <div class="project-row__content">
                        <span>{{ $project['type'] }}</span>
                        <h2>{{ $project['name'] }}</h2>
                        <p>{{ $project['description'] }}</p>
                    </div>
                    <ul class="project-row__tags">
                        @foreach ($project['tags'] as $tag)
                            <li>{{ $tag }}</li>
                        @endforeach
                    </ul>
                </article>
            @endforeach
        </div>
    </section>
@endsection
