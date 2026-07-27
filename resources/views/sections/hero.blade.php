<section class="kinetic-index" aria-labelledby="landing-title" data-index-navigation>
    <header class="kinetic-index__masthead">
        <div class="kinetic-index__title">
            <h1
                id="landing-title"
                class="kinetic-index__heading"
                aria-label="Jeremy Läderach."
                data-page-heading-signal
            >
                <span class="kinetic-index__wordmark" aria-hidden="true">
                    @foreach (mb_str_split('Jeremy Läderach') as $letter)
                        @if ($letter === ' ')
                            <span class="kinetic-index__letter-space">&nbsp;</span>
                        @else
                            <span
                                class="kinetic-index__letter kinetic-index__letter--tone-{{ (($loop->iteration - 1) % 4) + 1 }}"
                                style="--letter-index: {{ $loop->index }}"
                            ><span class="kinetic-index__letter-glyph">{{ $letter }}</span></span>
                        @endif
                    @endforeach
                    <em
                        class="kinetic-index__letter kinetic-index__letter--tone-1"
                        style="--letter-index: {{ mb_strlen('Jeremy Läderach') }}"
                    ><span class="kinetic-index__letter-glyph">.</span></em>
                </span>
            </h1>
        </div>

        <div class="kinetic-index__intro">
            <p class="kinetic-index__summary">{{ $content['home']['summary'] }}</p>
        </div>
    </header>

    <nav class="index-navigation" aria-label="{{ $content['ui']['menu'] }}">
        @foreach ($content['home']['routes'] as $route)
            <a
                class="index-panel index-panel--{{ $route['route'] }}"
                href="{{ route($route['route'], ['locale' => $locale]) }}"
                data-index-panel
                data-pointer-surface
                data-route="{{ $route['route'] }}"
                data-route-transition
                data-transition-label="{{ $route['label'] }}"
                data-interface-sound
                data-sound-tone="panel"
            >
                <span class="index-panel__number">0{{ $loop->iteration }}</span>

                <span class="index-panel__title">{{ $route['label'] }}</span>

                <span class="index-panel__description">{{ $route['description'] }}</span>

                <span class="index-panel__preview" aria-hidden="true">
                    @if ($route['route'] === 'projects')
                        @foreach ($content['projects_page']['items'] as $project)
                            <span>{{ $project['name'] }}</span>
                        @endforeach
                    @elseif ($route['route'] === 'about')
                        @foreach (array_slice($content['about_page']['technology_groups'], 0, 3) as $group)
                            <span>{{ $group['title'] }}</span>
                        @endforeach
                    @else
                        <span>{{ config('portfolio.socials.email.display') }}</span>
                    @endif
                </span>

                <span class="index-panel__arrow" aria-hidden="true">
                    <x-nav-icon name="arrow-right" />
                </span>
            </a>
        @endforeach
    </nav>
</section>
