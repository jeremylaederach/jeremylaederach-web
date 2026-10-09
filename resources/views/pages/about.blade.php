@extends('layouts.app')

@php
    // The last scene leads on to the contact page, in that page's own words and with its figure.
    $sphere = [...config('portfolio.scenes.about'), 'contact' => ['figures' => ['contact']]];
    $scenes = [...$content['about_page']['scenes'], [
        'id' => 'contact',
        'label' => $content['contact_page']['heading'],
        'text' => $content['contact_page']['intro'],
        'link' => [
            'label' => $content['contact_page']['heading'],
            'url' => route('contact', ['locale' => $locale]),
            'route' => 'contact',
        ],
    ]];
@endphp

@section('content')
    <article class="portfolio-page scene-page about-page">
        <x-scene-stage
            :scenes="$scenes"
            :sphere="$sphere"
            :label="$content['ui']['scenes']"
            :next="$content['ui']['next_scene']"
        >
            <x-animated-page-heading :text="$content['about_page']['heading']" />
        </x-scene-stage>
    </article>
@endsection
