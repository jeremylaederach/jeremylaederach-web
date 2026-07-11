@php
    $bodyIndexes = [
        'projects' => 0,
        'about' => 1,
        'contact' => 2,
    ];
@endphp

<section class="liquid-home" aria-labelledby="landing-title" data-liquid-home>
    <canvas class="liquid-home__canvas" data-liquid-canvas aria-hidden="true"></canvas>
    <div class="liquid-home__fallback" aria-hidden="true"></div>

    <div class="home-shell liquid-home__frame">
        <nav class="liquid-home__top-nav" aria-label="{{ $content['ui']['menu'] }}">
            @foreach ($content['home']['routes'] as $route)
                <a href="{{ route($route['route'], ['locale' => $locale]) }}">
                    {{ $route['label'] }}
                </a>
            @endforeach
            <span aria-hidden="true"></span>
        </nav>

        <header class="liquid-home__intro">
            <p class="liquid-home__eyebrow">
                <span aria-hidden="true"></span>
                {{ $content['home']['greeting'] }}
            </p>
            <h1 id="landing-title">
                {{ $content['home']['title'] }}
                <strong>{{ $content['home']['title_accent'] }}</strong>
            </h1>
            <p class="liquid-home__summary">{{ $content['home']['intro'] }}</p>
            <a class="liquid-home__explore" href="{{ route('projects', ['locale' => $locale]) }}">
                {{ $content['home']['explore'] }}
                <x-nav-icon name="arrow-right" />
            </a>
        </header>

        <nav class="liquid-bodies" aria-label="{{ $content['ui']['menu'] }}" data-liquid-bodies>
            @foreach ($content['home']['routes'] as $route)
                <div
                    class="liquid-body liquid-body--{{ $route['route'] }}"
                    data-liquid-body
                    data-body-index="{{ $bodyIndexes[$route['route']] }}"
                    data-route="{{ $route['route'] }}"
                >
                    <a
                        class="liquid-body__link"
                        href="{{ route($route['route'], ['locale' => $locale]) }}"
                        data-liquid-navigation
                        data-route="{{ $route['route'] }}"
                    >
                        <span class="liquid-body__copy">
                            <strong>{{ $route['label'] }}</strong>
                            <small>
                                {{ $route['description'] }}
                                <x-nav-icon name="arrow-right" />
                            </small>
                        </span>

                        <span class="liquid-body__arrow">
                            <x-nav-icon name="arrow-right" />
                        </span>
                    </a>
                </div>
            @endforeach
        </nav>

        <footer class="liquid-home__footer">
            <p>
                <span>&copy; {{ now()->year }} Jeremy Läderach</span>
                <i aria-hidden="true"></i>
                <span>{{ $content['home']['location'] }}</span>
            </p>
            <p>
                <span>{{ $content['home']['footer_prompt'] }}</span>
                <i aria-hidden="true"></i>
            </p>
        </footer>
    </div>
</section>
