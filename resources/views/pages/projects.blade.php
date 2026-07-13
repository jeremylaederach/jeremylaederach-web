@extends('layouts.app')

@section('content')
    <section class="detail-page detail-page--projects" aria-labelledby="projects-title">
        <div class="detail-page__inner">
            <header class="detail-page__intro">
                <span>01</span>
                <h1 id="projects-title">{{ $content['projects_page']['heading'] }}</h1>
                <p>{{ $content['projects_page']['intro'] }}</p>
            </header>

            <div class="project-grid">
                @foreach ($content['projects_page']['items'] as $project)
                    <article @class(['project-card', 'project-card--featured' => $loop->first])>
                        <div>
                            <span>{{ $project['type'] }}</span>
                            <h2>{{ $project['name'] }}</h2>
                            <p>{{ $project['description'] }}</p>
                        </div>

                        <ul aria-label="{{ $project['name'] }} technologies">
                            @foreach (array_slice($project['tags'], 0, 4) as $tag)
                                <li>{{ $tag }}</li>
                            @endforeach
                        </ul>
                    </article>
                @endforeach
            </div>
        </div>

        <p class="scene-index"><span>02</span>{{ $content['projects_page']['heading'] }}</p>
    </section>
@endsection
