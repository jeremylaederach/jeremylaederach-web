@props([
    'content',
    'locale',
    'currentRoute',
])

@php
    $isLanding = $currentRoute === 'home';
@endphp

<div
    class="liquid-stage"
    data-liquid-stage
    data-scene="{{ $currentRoute }}"
    data-phase="idle"
>
    <canvas class="liquid-stage__canvas" data-liquid-canvas aria-hidden="true"></canvas>

    <svg
        class="liquid-stage__fallback"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
    >
        <defs>
            <radialGradient id="liquid-fallback-fill" cx="62%" cy="32%" r="82%">
                <stop offset="0" stop-color="#2d176b" />
                <stop offset="0.56" stop-color="#10052f" />
                <stop offset="1" stop-color="#03010c" />
            </radialGradient>
            <linearGradient id="liquid-fallback-stroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#746eff" />
                <stop offset="0.52" stop-color="#b56cff" />
                <stop offset="1" stop-color="#ff6fcf" />
            </linearGradient>
        </defs>
        <path class="liquid-stage__fallback-body liquid-stage__fallback-body--projects" d="M394 172C510 83 760 84 918 134c151 47 239 172 180 287-47 91-171 129-302 116-109-11-167 24-264-9-119-40-214-123-201-218 8-58 17-99 63-138Z" />
        <path class="liquid-stage__fallback-body liquid-stage__fallback-body--about" d="M129 514c59-92 197-125 316-79 95 37 158 138 116 228-43 93-182 149-310 101-123-46-180-160-122-250Z" />
        <path class="liquid-stage__fallback-body liquid-stage__fallback-body--contact" d="M778 523c57-105 202-142 328-82 116 55 168 177 103 270-68 98-229 119-342 44-96-64-140-138-89-232Z" />
    </svg>

    <nav
        class="liquid-navigation"
        aria-label="{{ $content['ui']['menu'] }}"
        aria-hidden="{{ $isLanding ? 'false' : 'true' }}"
        data-liquid-navigation
        @if (! $isLanding) inert @endif
    >
        @foreach ($content['home']['routes'] as $route)
            <a
                class="liquid-navigation__link liquid-navigation__link--{{ $route['route'] }}"
                href="{{ route($route['route'], ['locale' => $locale]) }}"
                aria-label="{{ $route['label'] }}: {{ $route['description'] }}"
                data-liquid-route
                data-route="{{ $route['route'] }}"
                data-route-transition
            >
                <span class="liquid-navigation__label">
                    <small>0{{ $loop->iteration }}</small>
                    <strong>{{ $route['label'] }}</strong>
                    <span>
                        {{ $route['description'] }}
                        <x-nav-icon name="arrow-right" />
                    </span>
                </span>
            </a>
        @endforeach
    </nav>

    <p class="sr-only" aria-live="polite" data-liquid-status></p>
</div>
