@php
    $pageTitle = $title ?? $content['meta']['title'];
    $description = $description ?? $content['meta']['description'];
    $currentRoute = request()->route()?->getName() ?? 'not-found';
    $currentScene = $scene ?? $routeName ?? $currentRoute;
    $currentParams = request()->route()?->parameters() ?? [];
    $languageRoute = \Illuminate\Support\Facades\Route::has($currentRoute) ? $currentRoute : 'home';
    $languageParams = $languageRoute === $currentRoute ? $currentParams : [];
@endphp

<!DOCTYPE html>
<html lang="{{ $locale }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="{{ $description }}" data-page-meta>
        <meta name="theme-color" content="#07070a">

        <title>{{ $pageTitle }}</title>

        @if ($currentScene === 'not-found')
            <meta name="robots" content="noindex" data-page-meta>
        @else
            @php
                $canonicalUrl = rtrim(route($currentRoute, $currentParams), '/').'/';
            @endphp
            <link rel="canonical" href="{{ $canonicalUrl }}" data-page-meta>
            @foreach (config('portfolio.locales') as $code => $localeMeta)
                <link rel="alternate" hreflang="{{ $code }}" href="{{ rtrim(route($currentRoute, array_merge($currentParams, ['locale' => $code])), '/').'/' }}" data-page-meta>
            @endforeach
            <meta property="og:type" content="website" data-page-meta>
            <meta property="og:title" content="{{ $pageTitle }}" data-page-meta>
            <meta property="og:description" content="{{ $description }}" data-page-meta>
            <meta property="og:url" content="{{ $canonicalUrl }}" data-page-meta>
            <meta property="og:site_name" content="Jeremy Läderach" data-page-meta>
            <meta property="og:image" content="{{ asset('brand/social-preview.png') }}" data-page-meta>
            <meta property="og:image:width" content="1200" data-page-meta>
            <meta property="og:image:height" content="630" data-page-meta>
            <meta property="og:image:alt" content="Jeremy Läderach" data-page-meta>
            <meta name="twitter:card" content="summary_large_image" data-page-meta>
        @endif

        <link rel="icon" href="{{ asset('favicon.png') }}" type="image/png">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('brand/icons/apple-touch-icon.png') }}">
        <link rel="manifest" href="{{ asset('site.webmanifest') }}">

        @fonts
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="route-{{ $currentScene }}" data-page="{{ $currentScene }}">
        <a class="skip-link" href="#main">{{ $content['ui']['skip'] }}</a>
        <div class="site-background" aria-hidden="true"></div>
        <svg class="site-pointer" data-site-pointer aria-hidden="true" focusable="false">
            <rect class="site-pointer__ring" data-pointer-ring />
            <circle class="site-pointer__dot" data-pointer-dot r="3" />
        </svg>

        <header class="site-header" data-page-header>
            <div class="site-header__inner">
                <a
                    class="brand-lockup"
                    href="{{ route('home', ['locale' => $locale]) }}"
                    aria-label="{{ $content['ui']['brand'] }}"
                    data-route="home"
                    data-route-transition
                    data-interface-sound
                    data-sound-tone="brand"
                    data-dot-orb-figure="mark"
                >
                    <x-brand-mark class="brand-lockup__mark" size="30" />
                </a>

                <nav class="site-header__nav" aria-label="{{ $content['ui']['menu'] }}">
                    @foreach ($content['nav'] as $item)
                        @continue($item['route'] === 'home')

                        @php
                            $isActive = $currentScene === $item['route'];
                        @endphp

                        <a
                            @class(['site-header__nav-link', 'is-active' => $isActive])
                            href="{{ route($item['route'], ['locale' => $locale]) }}"
                            data-page-route="{{ $item['route'] }}"
                            data-route="{{ $item['route'] }}"
                            data-route-transition
                            data-interface-sound
                            data-sound-tone="navigation"
                            data-dot-orb-figure="{{ $item['route'] }}"
                            @if ($isActive) aria-current="page" @endif
                        >{{ $item['label'] }}</a>
                    @endforeach
                </nav>

                <div class="site-header__controls">
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

                        <div id="site-menu-panel" class="site-menu__panel" data-menu-panel aria-hidden="true" inert hidden>
                            <nav class="primary-nav" aria-label="{{ $content['ui']['menu'] }}">
                                @foreach ($content['nav'] as $item)
                                    @php
                                        $href = route($item['route'], ['locale' => $locale]);
                                        $isActive = $currentScene === $item['route'];
                                    @endphp
                                    <a
                                        @class(['is-active' => $isActive])
                                        href="{{ $href }}"
                                        @if ($isActive) aria-current="page" @endif
                                        data-page-route="{{ $item['route'] }}"
                                        data-route="{{ $item['route'] }}"
                                        data-route-transition
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

        <main id="main" data-page-main>
            @yield('content')
        </main>

        <footer class="site-colophon" data-page-footer>
            <nav class="site-colophon__links" aria-label="{{ $content['ui']['legal_navigation'] }}">
                <a
                    href="{{ config('portfolio.socials.github.url') }}"
                    rel="noopener noreferrer"
                    data-interface-sound
                    data-sound-tone="action"
                >GitHub</a>
                <a
                    href="{{ config('portfolio.socials.linkedin.url') }}"
                    rel="noopener noreferrer"
                    data-interface-sound
                    data-sound-tone="action"
                >LinkedIn</a>
                <a
                    href="{{ route('imprint', ['locale' => $locale]) }}"
                    data-route="imprint"
                    data-route-transition
                    data-interface-sound
                    data-sound-tone="control"
                >{{ $content['imprint']['title'] }}</a>
                <a
                    href="{{ route('privacy', ['locale' => $locale]) }}"
                    data-route="privacy"
                    data-route-transition
                    data-interface-sound
                    data-sound-tone="control"
                >{{ $content['privacy']['title'] }}</a>
            </nav>
        </footer>
    </body>
</html>
