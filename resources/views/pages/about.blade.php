@extends('layouts.app')

@section('content')
    <section class="page-scene page-scene--about" aria-labelledby="about-title">
        <div class="page-scene__shell about-layout">
            <header class="page-heading page-heading--about">
                <span>02 / {{ $content['about_page']['eyebrow'] }}</span>
                <h1 id="about-title">{{ $content['about_page']['heading'] }}</h1>
                <p>{{ $content['about_page']['intro'] }}</p>
            </header>

            <div class="about-narrative">
                @foreach ($content['about_page']['body'] as $paragraph)
                    <p>{{ $paragraph }}</p>
                @endforeach
            </div>

            <section class="technology-index" id="stack" aria-labelledby="technology-title">
                <p id="technology-title">{{ $content['about_page']['technology_heading'] }}</p>
                <ol>
                    @foreach ($content['about_page']['technology_list'] as $technology)
                        <li>
                            <span>0{{ $loop->iteration }}</span>
                            <strong>{{ $technology }}</strong>
                        </li>
                    @endforeach
                </ol>
            </section>
        </div>

        <p class="scene-index"><span>03</span>{{ $content['about_page']['heading'] }}</p>
    </section>
@endsection
