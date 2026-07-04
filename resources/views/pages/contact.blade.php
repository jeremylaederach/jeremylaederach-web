@extends('layouts.app')

@section('content')
    <section class="page-stage section-shell">
        <div class="page-stage__backdrop" aria-hidden="true">{{ $content['contact_page']['backdrop'] }}</div>

        <div class="contact-layout">
            <div class="page-stage__intro">
                <p class="eyebrow">{{ $content['contact_page']['kicker'] }}</p>
                <h1>{{ $content['contact_page']['title'] }}</h1>
                <p>{{ $content['contact_page']['intro'] }}</p>
            </div>

            <div class="contact-panel interactive-surface reveal">
                <x-social-links large />
            </div>
        </div>

        <div class="reason-list reason-list--wide reveal">
            @foreach ($content['contact_page']['reasons'] as $reason)
                <div>
                    <span></span>
                    <p>{{ $reason }}</p>
                </div>
            @endforeach
        </div>
    </section>
@endsection
