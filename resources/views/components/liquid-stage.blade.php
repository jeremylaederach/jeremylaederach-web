@props([
    'content',
    'locale',
    'currentRoute',
])

@php
    $liquidArt = [
        'projects' => 'brand/liquid/liquid-projects.png',
        'about' => 'brand/liquid/liquid-about.png',
        'contact' => 'brand/liquid/liquid-contact.png',
    ];
    $isLanding = $currentRoute === 'home';
@endphp

<div
    class="liquid-stage"
    data-liquid-stage
    data-scene="{{ $currentRoute }}"
    aria-hidden="{{ $isLanding ? 'false' : 'true' }}"
>
    <svg class="liquid-stage__filters" aria-hidden="true" focusable="false">
        <filter id="liquid-alpha" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
            <feColorMatrix in="SourceGraphic" type="luminanceToAlpha" result="luminance" />
            <feComponentTransfer in="luminance" result="mask">
                <feFuncA type="linear" slope="28" intercept="-0.12" />
            </feComponentTransfer>
            <feComposite in="SourceGraphic" in2="mask" operator="in" />
        </filter>
    </svg>

    <div class="liquid-stage__field">
        <nav
            class="landing-liquid-nav"
            aria-label="{{ $content['ui']['menu'] }}"
            data-liquid-navigation
            @if (! $isLanding) inert @endif
        >
            @foreach ($content['home']['routes'] as $route)
                <a
                    class="landing-liquid-nav__body landing-liquid-nav__body--{{ $route['route'] }}"
                    href="{{ route($route['route'], ['locale' => $locale]) }}"
                    aria-label="{{ $route['label'] }}: {{ $route['description'] }}"
                    data-liquid-route
                    data-route="{{ $route['route'] }}"
                    data-route-transition
                    style="--liquid-mask: url('{{ asset($liquidArt[$route['route']]) }}')"
                >
                    <span class="landing-liquid-nav__idle">
                        <span class="landing-liquid-nav__pointer">
                            <span class="landing-liquid-nav__hover">
                                <span class="landing-liquid-nav__visual" aria-hidden="true">
                                    <img src="{{ asset($liquidArt[$route['route']]) }}" alt="">
                                    <span class="landing-liquid-nav__sheen"></span>
                                </span>

                                <span class="landing-liquid-nav__hit" aria-hidden="true"></span>

                                <span class="landing-liquid-nav__copy">
                                    <small>0{{ $loop->iteration }}</small>
                                    <strong>{{ $route['label'] }}</strong>
                                    <span>
                                        {{ $route['description'] }}
                                        <x-nav-icon name="arrow-right" />
                                    </span>
                                </span>
                            </span>
                        </span>
                    </span>
                </a>
            @endforeach
        </nav>
    </div>
</div>
