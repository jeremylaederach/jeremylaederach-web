@extends('layouts.app')

@section('content')
    <article class="portfolio-page scene-page about-page">
        <x-scene-stage
            :scenes="$content['about_page']['scenes']"
            :sphere="config('portfolio.scenes.about')"
            :label="$content['ui']['scenes']"
        >
            <x-animated-page-heading :text="$content['about_page']['heading']" />
        </x-scene-stage>
    </article>
@endsection
