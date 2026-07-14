@extends('layouts.app')

@section('content')
    <article class="portfolio-page projects-page">
        <header class="page-hero page-hero--projects" data-reveal>
            <div class="page-hero__index">
                <span>01</span>
                <span>{{ $content['projects_page']['eyebrow'] }}</span>
            </div>

            <div class="page-hero__title">
                <h1>{{ $content['projects_page']['heading'] }}<span class="accent-dot">.</span></h1>
            </div>

            <p>{{ $content['projects_page']['intro'] }}</p>

            <a class="scroll-cue" href="#selected-work" data-interface-sound>
                <span>{{ $content['projects_page']['featured_label'] }}</span>
                <x-nav-icon name="arrow-down" />
            </a>
        </header>

        <section id="selected-work" class="project-cases" aria-label="{{ $content['projects_page']['heading'] }}">
            @foreach ($content['projects_page']['items'] as $project)
                @php
                    $slug = \Illuminate\Support\Str::slug($project['name']);
                @endphp

                <article
                    id="{{ $slug }}"
                    class="project-case project-case--{{ $loop->iteration }}"
                    data-reveal
                    data-pointer-surface
                >
                    <header class="project-case__header">
                        <span>0{{ $loop->iteration }}</span>
                        <p>{{ $project['type'] }}</p>
                        <h2>{{ $project['name'] }}</h2>
                    </header>

                    <div class="project-case__details">
                        <p>{{ $project['description'] }}</p>
                        <ul aria-label="{{ $project['name'] }} technologies">
                            @foreach ($project['tags'] as $tag)
                                <li>{{ $tag }}</li>
                            @endforeach
                        </ul>
                    </div>

                    @if ($loop->first)
                        <div class="project-visual quantified-visual" aria-label="Quantified interface study">
                            <div class="quantified-visual__topbar">
                                <img src="{{ asset('assets/work/quantified-mark.png') }}" alt="" width="33" height="36">
                                <span>Quantified</span>
                                <span>Overview</span>
                            </div>
                            <div class="quantified-visual__metrics">
                                <div><span>Focus</span><strong>76%</strong></div>
                                <div><span>Goals</span><strong>12</strong></div>
                                <div><span>Areas</span><strong>06</strong></div>
                            </div>
                            <div class="quantified-visual__chart" aria-hidden="true">
                                @foreach ([38, 55, 44, 71, 63, 82, 76, 92, 68, 88] as $height)
                                    <span style="--bar-height: {{ $height }}%"></span>
                                @endforeach
                            </div>
                        </div>
                    @elseif ($loop->iteration === 2)
                        <figure class="project-visual project-visual--image project-visual--jay-jay">
                            <img
                                src="{{ asset('assets/work/jay-jay-home.jpg') }}"
                                alt="Jay-Jay website landing page"
                                loading="lazy"
                                decoding="async"
                            >
                        </figure>
                    @else
                        <figure class="project-visual project-visual--image project-visual--garden">
                            <img
                                src="{{ asset('assets/work/scherer-garten.jpg') }}"
                                alt="Garden and pool project by Scherer Gartengestaltung"
                                loading="lazy"
                                decoding="async"
                            >
                        </figure>
                    @endif
                </article>
            @endforeach
        </section>
    </article>
@endsection
