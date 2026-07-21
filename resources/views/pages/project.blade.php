@extends('layouts.app')

@section('content')
    <article class="portfolio-page case-study-page project-detail project-detail--{{ $project['slug'] }}">
        <header class="case-study-hero" data-pointer-surface data-reveal>
            <a
                class="case-study-back"
                href="{{ route('projects', ['locale' => $locale]) }}#{{ $project['slug'] }}"
                data-route="projects"
                data-route-transition
                data-transition-label="{{ $content['projects_page']['heading'] }}"
                data-interface-sound
                data-sound-tone="navigation"
            >
                <x-nav-icon name="arrow-right" />
                <span>{{ $project['back'] }}</span>
            </a>

            <div class="case-study-hero__index">
                <span>{{ str_pad((string) $projectNumber, 2, '0', STR_PAD_LEFT) }}</span>
                <span>{{ $project['eyebrow'] }}</span>
            </div>

            <div class="case-study-hero__title">
                <x-animated-page-heading :text="$project['heading']" />
            </div>

            <div class="case-study-hero__intro">
                <p>{{ $project['intro'] }}</p>
                <dl>
                    <div>
                        <dt>{{ $project['status_label'] }}</dt>
                        <dd>{{ $project['status'] }}</dd>
                    </div>
                    <div>
                        <dt>{{ $project['role_label'] }}</dt>
                        <dd>{{ $project['role'] }}</dd>
                    </div>
                </dl>
            </div>

            <a class="scroll-cue" href="#product" data-interface-sound data-sound-tone="action">
                <span>{{ $project['product']['label'] }}</span>
                <x-nav-icon name="arrow-down" />
            </a>
        </header>

        <section
            id="product"
            class="case-study-product"
            aria-labelledby="product-title"
            data-reveal
        >
            @if ($project['slug'] === 'jay-jay')
                <span id="client-hub" class="case-study-anchor" aria-hidden="true"></span>
            @endif

            <p class="section-label case-study-section-label">
                <span>01</span>
                <span aria-hidden="true">/</span>
                <span>{{ $project['product']['label'] }}</span>
            </p>

            <div class="case-study-product__lead">
                <h2 id="product-title">{{ $project['product']['heading'] }}</h2>
            </div>

            <div class="case-study-product__body">
                <p>{{ $project['product']['body'] }}</p>
            </div>

            <div class="case-study-product__showcase">
                <x-project-reel
                    class="case-study-product__reel"
                    :project="$project"
                    :ui="$content['ui']"
                    mode="detail"
                />

                <div class="case-study-product__aside">
                    <dl class="case-study-product__notes">
                        @foreach ($project['product']['notes'] as $note)
                            <div>
                                <dt>{{ $note['label'] }}</dt>
                                <dd>{{ $note['value'] }}</dd>
                            </div>
                        @endforeach
                    </dl>

                    @isset($project['external_url'])
                        <a
                            class="case-study-external"
                            href="{{ $project['external_url'] }}"
                            target="_blank"
                            rel="noreferrer"
                            data-interface-sound
                            data-sound-tone="action"
                        >
                            <span>{{ $project['external_label'] }}</span>
                            <x-nav-icon name="arrow-up-right" />
                        </a>
                    @endisset
                </div>
            </div>
        </section>

        <section id="stack" class="case-study-stack" aria-labelledby="project-stack-title" data-reveal>
            <header class="case-study-section-heading">
                <p class="section-label case-study-section-label">
                    <span>02</span>
                    <span aria-hidden="true">/</span>
                    <span>{{ $project['stack']['label'] }}</span>
                </p>
                <div class="case-study-section-heading__content">
                    <h2 id="project-stack-title">{{ $project['stack']['heading'] }}</h2>
                    <p>{{ $project['stack']['intro'] }}</p>
                </div>
            </header>

            <x-technology-groups
                class="project-technology-groups"
                :groups="$project['stack']['groups']"
            />
        </section>

        <x-contact-cta :content="$content" :locale="$locale" />
    </article>
@endsection
