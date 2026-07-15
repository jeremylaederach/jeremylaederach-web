@php
    $pageTitle = $title ?? $content['meta']['title'];
    $description = $description ?? $content['meta']['description'];
    $currentRoute = $routeName ?? request()->route()?->getName() ?? 'not-found';
    $currentParams = request()->route()?->parameters() ?? [];
    $languageRoute = \Illuminate\Support\Facades\Route::has($currentRoute) ? $currentRoute : 'home';
    $languageParams = $languageRoute === $currentRoute ? $currentParams : [];
@endphp

<!DOCTYPE html>
<html lang="{{ $locale }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="{{ $description }}">
        <meta name="theme-color" content="#07070a">

        <title>{{ $pageTitle }}</title>

        <link rel="icon" href="{{ asset('brand/cats/main/cat-loaf-classic-256.png') }}" type="image/png">
        <link rel="apple-touch-icon" href="{{ asset('brand/cats/main/cat-loaf-classic-256.png') }}">
        <link rel="manifest" href="{{ asset('site.webmanifest') }}">

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="route-{{ $currentRoute }}" data-page="{{ $currentRoute }}">
        <a class="skip-link" href="#main">{{ $content['ui']['skip'] }}</a>
        <div class="site-background" aria-hidden="true"></div>
        <div class="site-pointer-layer" data-site-pointer-layer aria-hidden="true">
            <svg class="site-pointer-trail" focusable="false">
                <defs>
                    <linearGradient id="pointer-trail-outer" gradientUnits="userSpaceOnUse" data-pointer-gradient="outer">
                        <stop class="site-pointer-trail__stop--accent" offset="0" stop-opacity="0" />
                        <stop class="site-pointer-trail__stop--accent" offset="0.64" stop-opacity="0.08" />
                        <stop class="site-pointer-trail__stop--accent" offset="1" stop-opacity="0.32" />
                    </linearGradient>
                    <linearGradient id="pointer-trail-core" gradientUnits="userSpaceOnUse" data-pointer-gradient="core">
                        <stop class="site-pointer-trail__stop--accent" offset="0" stop-opacity="0" />
                        <stop class="site-pointer-trail__stop--accent" offset="0.58" stop-opacity="0.24" />
                        <stop class="site-pointer-trail__stop--accent" offset="1" stop-opacity="0.72" />
                    </linearGradient>
                    <linearGradient id="pointer-trail-highlight" gradientUnits="userSpaceOnUse" data-pointer-gradient="highlight">
                        <stop class="site-pointer-trail__stop--highlight" offset="0" stop-opacity="0" />
                        <stop class="site-pointer-trail__stop--highlight" offset="1" stop-opacity="0.84" />
                    </linearGradient>
                </defs>
                <path class="site-pointer-trail__path site-pointer-trail__path--outer" data-pointer-path="outer" stroke="url(#pointer-trail-outer)" />
                <path class="site-pointer-trail__path site-pointer-trail__path--core" data-pointer-path="core" stroke="url(#pointer-trail-core)" />
                <path class="site-pointer-trail__path site-pointer-trail__path--highlight" data-pointer-path="highlight" stroke="url(#pointer-trail-highlight)" />
            </svg>
            <div class="site-pointer" data-site-pointer>
                <span class="site-pointer__ring"></span>
                <span class="site-pointer__dot"></span>
            </div>
        </div>

        <header class="site-header" data-page-header>
            <div class="site-header__inner">
                <a
                    class="brand-lockup"
                    href="{{ route('home', ['locale' => $locale]) }}"
                    aria-label="{{ $content['ui']['brand'] }}"
                    data-route="home"
                    data-route-transition
                    data-transition-label="{{ $content['nav'][0]['label'] }}"
                    data-interface-sound
                    data-sound-tone="brand"
                >
                    <x-brand-mark class="brand-lockup__mark" size="96" />
                    <strong>Jeremy Läderach</strong>
                </a>

                <div class="site-header__controls">
                    <nav class="site-header__nav" aria-label="{{ $content['ui']['menu'] }}">
                        @foreach ($content['nav'] as $item)
                            @continue($item['route'] === 'home')

                            @php
                                $isActive = $currentRoute === $item['route'];
                            @endphp

                            <a
                                class="site-header__nav-link site-header__nav-link--{{ $item['route'] }}{{ $isActive ? ' is-active' : '' }}"
                                href="{{ route($item['route'], ['locale' => $locale]) }}"
                                data-page-route="{{ $item['route'] }}"
                                data-route="{{ $item['route'] }}"
                                data-route-transition
                                data-transition-label="{{ $item['label'] }}"
                                data-interface-sound
                                data-sound-tone="navigation"
                                @if ($isActive) aria-current="page" @endif
                            >
                                <span class="site-header__nav-index">0{{ $loop->index }}</span>
                                <span class="site-header__nav-label">{{ $item['label'] }}</span>
                            </a>
                        @endforeach

                        <div class="site-header__languages" aria-label="{{ $content['ui']['language'] }}">
                            @foreach (config('portfolio.locales') as $code => $localeMeta)
                                @php
                                    $targetParams = array_merge($languageParams, ['locale' => $code]);
                                    $targetUrl = route($languageRoute, $targetParams);
                                @endphp
                                <a
                                    @class(['is-active' => $code === $locale])
                                    href="{{ $targetUrl }}"
                                    hreflang="{{ $code }}"
                                    data-interface-sound
                                    data-sound-tone="control"
                                >
                                    {{ $localeMeta['label'] }}
                                </a>
                            @endforeach
                        </div>
                    </nav>

                    <button
                        class="sound-toggle"
                        type="button"
                        aria-label="{{ $content['ui']['sound_mute'] }}"
                        aria-pressed="false"
                        title="{{ $content['ui']['sound_mute'] }}"
                        data-sound-toggle
                        data-interface-sound
                        data-sound-tone="control"
                        data-label-muted="{{ $content['ui']['sound_enable'] }}"
                        data-label-playing="{{ $content['ui']['sound_mute'] }}"
                    >
                        <span class="sound-toggle__on"><x-nav-icon name="sound-on" /></span>
                        <span class="sound-toggle__off"><x-nav-icon name="sound-off" /></span>
                    </button>

                    <div class="site-menu">
                        <button
                            class="site-menu__toggle"
                            type="button"
                            aria-label="{{ $content['ui']['menu'] }}"
                            aria-expanded="false"
                            aria-controls="site-menu-panel"
                            data-menu-toggle
                            data-interface-sound
                            data-sound-tone="control"
                        >
                            <span></span>
                            <span></span>
                        </button>

                        <div id="site-menu-panel" class="site-menu__panel" data-menu-panel aria-hidden="true" hidden>
                            <nav class="primary-nav" aria-label="{{ $content['ui']['menu'] }}">
                                @foreach ($content['nav'] as $item)
                                    @php
                                        $href = route($item['route'], ['locale' => $locale]);
                                        $isActive = $currentRoute === $item['route'];
                                    @endphp
                                    <a
                                        @class(['is-active' => $isActive])
                                        href="{{ $href }}"
                                        @if ($isActive) aria-current="page" @endif
                                        data-page-route="{{ $item['route'] }}"
                                        data-route="{{ $item['route'] }}"
                                        data-route-transition
                                        data-transition-label="{{ $item['label'] }}"
                                        data-interface-sound
                                        data-sound-tone="navigation"
                                        style="--menu-index: {{ $loop->index }}"
                                    >
                                        <span>0{{ $loop->iteration }}</span>
                                        <strong>{{ $item['label'] }}</strong>
                                        <x-nav-icon name="arrow-right" />
                                    </a>
                                @endforeach
                            </nav>

                            <nav class="language-switcher" aria-label="{{ $content['ui']['language'] }}">
                                @foreach (config('portfolio.locales') as $code => $localeMeta)
                                    @php
                                        $targetParams = array_merge($languageParams, ['locale' => $code]);
                                        $targetUrl = route($languageRoute, $targetParams);
                                    @endphp
                                    <a
                                        @class(['is-active' => $code === $locale])
                                        href="{{ $targetUrl }}"
                                        hreflang="{{ $code }}"
                                        data-interface-sound
                                        data-sound-tone="control"
                                    >
                                        {{ $localeMeta['label'] }}
                                    </a>
                                @endforeach
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <div class="page-transition" data-page-transition data-phase="idle" aria-hidden="true">
            <div class="page-transition__surface" data-transition-surface>
                <span>Jeremy Läderach</span>
                <strong data-transition-label></strong>
            </div>
        </div>

        <main id="main" data-page-main>
            @yield('content')
        </main>

        <footer class="site-footer" data-page-footer>
            <div class="site-footer__inner">
                <div class="site-footer__identity">
                    <x-brand-mark class="site-footer__mark" size="40" />
                    <span>
                        <strong>Jeremy Läderach</strong>
                        <small>© {{ date('Y') }} · {{ $content['ui']['role'] }}</small>
                    </span>
                </div>

                <nav class="site-footer__nav" aria-label="{{ $content['ui']['footer_navigation'] }}">
                    @foreach (array_slice($content['nav'], 1) as $item)
                        <a
                            href="{{ route($item['route'], ['locale' => $locale]) }}"
                            data-route="{{ $item['route'] }}"
                            data-route-transition
                            data-transition-label="{{ $item['label'] }}"
                            data-interface-sound
                            data-sound-tone="navigation"
                        >
                            {{ $item['label'] }}
                        </a>
                    @endforeach
                </nav>

                <div class="site-footer__meta">
                    <a
                        href="{{ config('portfolio.socials.github.url') }}"
                        rel="noopener noreferrer"
                        data-interface-sound
                        data-sound-tone="action"
                    >GitHub</a>
                    <a
                        href="{{ route('imprint', ['locale' => $locale]) }}"
                        data-interface-sound
                        data-sound-tone="control"
                    >{{ $content['imprint']['title'] }}</a>
                    <a
                        class="site-footer__top"
                        href="#main"
                        data-interface-sound
                        data-sound-tone="control"
                    >
                        <span>{{ $content['ui']['back_to_top'] }}</span>
                        <x-nav-icon name="arrow-down" />
                    </a>
                </div>
            </div>
        </footer>
    </body>
</html>
