@extends('layouts.app')

@php
    $featuredProject = $content['projects_page']['items'][0];
    $secondaryProjects = array_slice($content['projects_page']['items'], 1);
@endphp

@section('content')
    <section class="page-scene page-scene--projects" aria-labelledby="projects-title">
        <div class="page-scene__shell projects-layout">
            <header class="page-heading page-heading--projects">
                <span>01 / {{ $content['projects_page']['eyebrow'] }}</span>
                <h1 id="projects-title">{{ $content['projects_page']['heading'] }}</h1>
                <p>{{ $content['projects_page']['intro'] }}</p>
            </header>

            <div class="projects-showcase">
                <article class="project-feature" aria-labelledby="project-feature-title">
                    <div class="project-feature__meta">
                        <span>{{ $content['projects_page']['featured_label'] }}</span>
                        <span>01</span>
                    </div>
                    <div class="project-feature__body">
                        <p>{{ $featuredProject['type'] }}</p>
                        <h2 id="project-feature-title">{{ $featuredProject['name'] }}</h2>
                        <p>{{ $featuredProject['description'] }}</p>
                    </div>
                    <ul aria-label="{{ $featuredProject['name'] }} technologies">
                        @foreach ($featuredProject['tags'] as $tag)
                            <li>{{ $tag }}</li>
                        @endforeach
                    </ul>
                </article>

                <div class="project-list" aria-label="{{ $content['projects_page']['secondary_label'] }}">
                    @foreach ($secondaryProjects as $project)
                        <article class="project-row">
                            <span>0{{ $loop->iteration + 1 }}</span>
                            <div>
                                <p>{{ $project['type'] }}</p>
                                <h2>{{ $project['name'] }}</h2>
                            </div>
                            <p>{{ $project['description'] }}</p>
                            <ul aria-label="{{ $project['name'] }} technologies">
                                @foreach ($project['tags'] as $tag)
                                    <li>{{ $tag }}</li>
                                @endforeach
                            </ul>
                        </article>
                    @endforeach
                </div>
            </div>
        </div>

        <p class="scene-index"><span>02</span>{{ $content['projects_page']['heading'] }}</p>
    </section>
@endsection
