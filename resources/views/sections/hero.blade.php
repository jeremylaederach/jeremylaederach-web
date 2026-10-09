<section class="kinetic-index" aria-labelledby="landing-title">
    <div class="dot-orb" aria-hidden="true">
        <canvas data-dot-orb data-mark="{{ asset('brand/mark.svg') }}"></canvas>
    </div>
    <header class="kinetic-index__masthead">
        <h1 id="landing-title" class="kinetic-index__heading">
            <span class="kinetic-index__name figure-word" data-dot-orb-figure="mark">Jeremy Läderach<em>.</em></span>
        </h1>

        <p class="kinetic-index__summary">
            <x-figure-text :text="$content['home']['summary']" :figures="$content['home']['summary_figures']" />
        </p>
    </header>

    <nav class="index-navigation" aria-label="{{ $content['ui']['menu'] }}">
        @foreach ($content['home']['routes'] as $route)
            <a
                class="index-panel"
                href="{{ route($route['route'], ['locale' => $locale]) }}"
                data-index-panel
                data-dot-orb-figure="{{ $route['route'] }}"
                data-route="{{ $route['route'] }}"
                data-route-transition
                data-interface-sound
                data-sound-tone="panel"
            >
                <span class="index-panel__number">0{{ $loop->iteration }}</span>

                <span class="index-panel__title">{{ $route['label'] }}</span>

                <span class="index-panel__description">{{ $route['description'] }}</span>
            </a>
        @endforeach
    </nav>
</section>
