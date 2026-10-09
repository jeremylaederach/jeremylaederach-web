@extends('layouts.app')

@php
    $about = $content['about_page'];
    $marks = config('portfolio.technology_marks');
    // A color as the three numbers the sphere takes.
    $channels = fn (string $hex): string => implode(', ', sscanf($hex, '#%02x%02x%02x'));
@endphp

@section('content')
    <article class="portfolio-page about-page">
        {{--
            The page is told in two chapters beside the sphere: the opening and the technologies.
            The chapter that crosses the middle of the window is the current one: the sphere rests
            in its figure and, from 961px, stands level with it where its text leaves room.
        --}}
        <div class="about-story">
            <div class="about-story__orb">
                <div class="dot-orb" aria-hidden="true">
                    <canvas data-dot-orb></canvas>
                </div>
            </div>

            <header
                class="about-chapter about-chapter--opening"
                data-chapter
                data-dot-orb-figure="about"
                data-dot-orb-resting
            >
                <div class="about-chapter__text" data-reveal>
                    <x-animated-page-heading :text="$about['heading']" />
                </div>

                <p class="about-chapter__lead" data-reveal>{{ $about['intro'] }}</p>
            </header>

            <section
                id="stack"
                class="about-chapter"
                aria-labelledby="stack-title"
                data-chapter
                data-dot-orb-figure="stack"
            >
                <div class="about-chapter__text" data-reveal>
                    <h2 id="stack-title">{{ $about['technology_heading'] }}</h2>
                    <p class="about-chapter__intro">{{ $about['technology_intro'] }}</p>

                    {{--
                        Every name answers a hover: a group gives the sphere its mark in its color,
                        and so does a tool that has a mark of its own; the other tools show their
                        group's.
                    --}}
                    <ul class="about-rows">
                        @foreach ($about['technology_groups'] as $group)
                            <li class="about-row" style="--dot-orb-rgb: {{ $channels($group['color']) }}">
                                <h3 class="about-row__title">
                                    <span class="figure-word" data-dot-orb-figure="{{ $group['icon'] }}">{{ $group['title'] }}</span>
                                </h3>

                                <ul class="about-row__tools" aria-label="{{ $group['title'] }}">
                                    @foreach ($group['tools'] as $tool)
                                        @php
                                            $mark = $marks[$tool] ?? null;
                                        @endphp
                                        <li>
                                            <span
                                                class="figure-word"
                                                data-dot-orb-figure="{{ $mark['figure'] ?? $group['icon'] }}"
                                                @isset($mark['color']) style="--dot-orb-rgb: {{ $channels($mark['color']) }}" @endisset
                                            >{{ $tool }}</span>
                                        </li>
                                    @endforeach
                                </ul>
                            </li>
                        @endforeach
                    </ul>
                </div>
            </section>
        </div>
    </article>
@endsection
