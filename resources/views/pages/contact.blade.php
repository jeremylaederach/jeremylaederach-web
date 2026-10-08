@extends('layouts.app')

@php
    // The figure the sphere takes for each channel.
    $figures = ['email' => 'contact', 'github' => 'github', 'linkedin' => 'about'];
    $items = [];

    foreach (config('portfolio.socials') as $key => $social) {
        $items[] = [
            'id' => $key,
            'name' => $social['label'],
            'label' => $social['label'].': '.$social['display'],
            'href' => $social['url'],
            'value' => $social['display'],
            'figure' => $figures[$key],
            'icon' => 'arrow-up-right',
        ];
    }
@endphp

@section('content')
    <article class="portfolio-page contact-page">
        <x-stage-list
            heading-id="contact-title"
            :heading="$content['contact_page']['heading']"
            :intro="$content['contact_page']['intro']"
            :items="$items"
        >
            <p class="stage-list__kind">{{ $content['contact_page']['context_label'] }}</p>
            <p class="stage-list__text">{{ $content['contact_page']['context'] }}</p>
        </x-stage-list>
    </article>
@endsection
