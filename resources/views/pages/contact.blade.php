@extends('layouts.app')

@section('content')
    <section class="page-hero section-shell">
        <div class="section-heading section-heading--wide reveal">
            <p class="eyebrow">{{ $content['contact']['kicker'] }}</p>
            <h1>{{ $content['contact_page']['title'] }}</h1>
            <p>{{ $content['contact_page']['intro'] }}</p>
        </div>
    </section>

    <section class="content-section section-shell contact-page-grid">
        <div class="contact-panel interactive-surface reveal">
            <x-social-links large />
        </div>

        <aside class="reason-list reveal">
            @foreach ($content['contact_page']['reasons'] as $reason)
                <div>
                    <span></span>
                    <p>{{ $reason }}</p>
                </div>
            @endforeach
        </aside>
    </section>
@endsection
