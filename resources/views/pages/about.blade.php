@extends('layouts.app')

@section('content')
    <section class="detail-page detail-page--about" aria-labelledby="about-title">
        <div class="detail-page__inner about-layout">
            <header class="detail-page__intro">
                <span>02</span>
                <h1 id="about-title">{{ $content['about_page']['heading'] }}</h1>
                <p>{{ $content['about_page']['intro'] }}</p>

                <div class="about-copy">
                    @foreach ($content['about_page']['body'] as $paragraph)
                        <p>{{ $paragraph }}</p>
                    @endforeach
                </div>
            </header>

            <section class="technology-list" id="stack" aria-labelledby="technology-title">
                <p id="technology-title">{{ $content['about_page']['technology_heading'] }}</p>
                <ul>
                    @foreach ($content['about_page']['technology_list'] as $technology)
                        <li>{{ $technology }}</li>
                    @endforeach
                </ul>
            </section>
        </div>

        <p class="scene-index"><span>03</span>{{ $content['about_page']['heading'] }}</p>
    </section>
@endsection
