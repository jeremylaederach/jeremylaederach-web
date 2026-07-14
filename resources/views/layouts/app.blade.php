@php
    $pageTitle = $title ?? $content['meta']['title'];
    $description = $description ?? $content['meta']['description'];
    $currentRoute = request()->route()?->getName() ?? 'home';
    $currentParams = request()->route()?->parameters() ?? [];
@endphp

<!DOCTYPE html>
<html lang="{{ $locale }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="{{ $description }}">
        <meta name="theme-color" content="#07070a">

        <title>{{ $pageTitle }}</title>

        <link rel="icon" href="{{ asset('favicon.png') }}" type="image/png">
        <link rel="apple-touch-icon" href="{{ asset('brand/icons/apple-touch-icon.png') }}">
        <link rel="manifest" href="{{ asset('site.webmanifest') }}">

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="route-{{ $currentRoute }}" data-page="{{ $currentRoute }}">
        <a class="skip-link" href="#main">{{ $content['ui']['skip'] }}</a>
        <div class="site-background" aria-hidden="true"></div>
        <div class="site-pointer" data-site-pointer aria-hidden="true">
            <span class="site-pointer__trail site-pointer__trail--1" data-pointer-trail></span>
            <span class="site-pointer__trail site-pointer__trail--2" data-pointer-trail></span>
            <span class="site-pointer__trail site-pointer__trail--3" data-pointer-trail></span>
            <span class="site-pointer__trail site-pointer__trail--4" data-pointer-trail></span>
            <span class="site-pointer__ring"></span>
            <span class="site-pointer__dot"></span>
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
                >
                    <x-brand-mark class="brand-lockup__mark" size="96" />
                    <span>
                        <strong>Jeremy Läderach</strong>
                        <small>{{ $content['ui']['role'] }}</small>
                    </span>
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
                                @if ($isActive) aria-current="page" @endif
                            >
                                <span class="site-header__nav-index">0{{ $loop->index }}</span>
                                <span class="site-header__nav-label">{{ $item['label'] }}</span>
                            </a>
                        @endforeach

                        <div class="site-header__languages" aria-label="{{ $content['ui']['language'] }}">
                            @foreach (config('portfolio.locales') as $code => $localeMeta)
                                @php
                                    $targetParams = array_merge($currentParams, ['locale' => $code]);
                                    $targetUrl = route($currentRoute, $targetParams);
                                @endphp
                                <a @class(['is-active' => $code === $locale]) href="{{ $targetUrl }}" hreflang="{{ $code }}">
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
                                        $targetParams = array_merge($currentParams, ['locale' => $code]);
                                        $targetUrl = route($currentRoute, $targetParams);
                                    @endphp
                                    <a @class(['is-active' => $code === $locale]) href="{{ $targetUrl }}" hreflang="{{ $code }}">
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
                <p>© {{ date('Y') }} Jeremy Läderach</p>
                <div class="footer-links">
                    <a href="{{ config('portfolio.socials.email.url') }}">{{ config('portfolio.socials.email.display') }}</a>
                    <a href="{{ config('portfolio.socials.github.url') }}" rel="noreferrer">GitHub</a>
                    <a href="{{ route('imprint', ['locale' => $locale]) }}">{{ $content['imprint']['title'] }}</a>
                </div>
            </div>
        </footer>
    </body>
</html>
