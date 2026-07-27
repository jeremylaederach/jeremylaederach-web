@extends('layouts.app')

@section('content')
    <article class="portfolio-page case-study-page project-detail project-detail--{{ $project['slug'] }}">
        <header class="case-study-hero" data-pointer-surface data-reveal>
            <a
                class="case-study-back directional-link directional-link--back"
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

            <p class="case-study-hero__summary">{{ $project['intro'] }}</p>

            <div id="views" class="case-study-hero__showcase">
                @if ($project['slug'] === 'jay-jay')
                    <span id="client-hub" class="case-study-anchor" aria-hidden="true"></span>
                @endif

                <x-project-reel
                    class="case-study-hero__reel"
                    :project="$project"
                    :ui="$content['ui']"
                    mode="detail"
                />
            </div>

            <dl class="case-study-hero__meta">
                <div>
                    <dt>{{ $project['status_label'] }}</dt>
                    <dd>{{ $project['status'] }}</dd>
                </div>
                <div>
                    <dt>{{ $project['role_label'] }}</dt>
                    <dd>{{ $project['role'] }}</dd>
                </div>
            </dl>

            <a
                class="scroll-cue directional-link directional-link--down"
                href="#product"
                data-interface-sound
                data-sound-tone="action"
            >
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
            <p class="section-label case-study-section-label">
                <span>01</span>
                <span aria-hidden="true">/</span>
                <span>{{ $project['product']['label'] }}</span>
            </p>

            <div class="case-study-product__lead">
                <h2 id="product-title">
                    @foreach ($project['product']['heading_lines'] as $line)
                        <span>{{ $line }}</span>
                    @endforeach
                </h2>
            </div>

            <div class="case-study-product__body">
                <p>{{ $project['product']['body'] }}</p>
            </div>

            <div class="case-study-product__details">
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

        <nav
            class="case-study-next-nav"
            aria-label="{{ $content['ui']['next_project'] }}"
            data-reveal
        >
            <a
                class="case-study-next case-study-next--{{ $nextProject['slug'] }} directional-link directional-link--forward"
                href="{{ route($nextProject['detail_route'], ['locale' => $locale]) }}"
                aria-label="{{ $content['ui']['next_project'] }}: {{ $nextProject['name'] }}"
                data-route="projects"
                data-route-transition
                data-transition-label="{{ $nextProject['name'] }}"
                data-transition-theme="{{ $nextProject['transition_theme'] }}"
                data-pointer-route="{{ $nextProject['transition_theme'] }}"
                data-interface-sound
                data-sound-tone="navigation"
            >
                <span>{{ $content['ui']['next_project'] }}</span>
                <x-nav-icon name="arrow-right" />
            </a>
        </nav>

        <x-contact-cta :content="$content" :locale="$locale" />
    </article>
@endsection
