<section class="kinetic-index" aria-labelledby="landing-title">
    <div class="dot-orb" aria-hidden="true">
        <canvas data-dot-orb data-mark="{{ asset('brand/jeremy-cat-256.png') }}"></canvas>
    </div>
    <header class="kinetic-index__masthead">
        <div class="kinetic-index__title">
            <h1 id="landing-title" class="kinetic-index__heading" data-dot-orb-figure="mark">
                <span class="kinetic-index__name">Jeremy</span>
                <span class="kinetic-index__name">Läderach<em>.</em></span>
            </h1>
        </div>

        <div class="kinetic-index__intro">
            <p class="kinetic-index__summary">{{ $content['home']['summary'] }}</p>
        </div>
    </header>

    <nav class="index-navigation" aria-label="{{ $content['ui']['menu'] }}">
        @foreach ($content['home']['routes'] as $route)
            <a
                class="index-panel"
                href="{{ route($route['route'], ['locale' => $locale]) }}"
                data-index-panel
                data-dot-orb-figure="{{ $route['route'] }}"
                data-route="{{ $route['route'] }}"
                data-pointer-wrap
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
