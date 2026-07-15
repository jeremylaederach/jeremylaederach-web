<section class="kinetic-index" aria-labelledby="landing-title" data-index-navigation>
    <header class="kinetic-index__masthead">
        <div class="kinetic-index__title">
            <span class="kinetic-index__number" aria-hidden="true">00</span>

            <div class="kinetic-index__identity">
                <p class="kinetic-index__eyebrow">{{ $content['ui']['role'] }}</p>
                <h1 id="landing-title" class="kinetic-index__heading">
                    <span>Jeremy</span>
                    <span>Läderach<em>.</em></span>
                </h1>
            </div>
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
                        @foreach (array_slice($content['about_page']['technology_list'], 0, 3) as $technology)
                            <span>{{ $technology }}</span>
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
