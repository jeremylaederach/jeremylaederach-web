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
        <meta name="theme-color" content="#05010D">

        <title>{{ $pageTitle }}</title>

        <link rel="icon" href="{{ asset('favicon.png') }}" type="image/png">
        <link rel="apple-touch-icon" href="{{ asset('brand/icons/apple-touch-icon.png') }}">
        <link rel="manifest" href="{{ asset('site.webmanifest') }}">

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="route-{{ $currentRoute }}">
        <a class="skip-link" href="#main">{{ $content['ui']['skip'] }}</a>
        <div class="site-background" aria-hidden="true"></div>

        <header class="site-header">
            <div class="site-header__inner">
                <a class="brand-lockup" href="{{ route('home', ['locale' => $locale]) }}" aria-label="{{ $content['ui']['brand'] }}">
                    <x-brand-mark class="brand-lockup__mark" size="96" />
                    <span>
                        <strong>Jeremy Läderach</strong>
                        <small>{{ $content['ui']['role'] }}</small>
                    </span>
                </a>

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
                        <span></span>
                    </button>

                    <div id="site-menu-panel" class="site-menu__panel" data-menu-panel aria-hidden="true" hidden>
                        <nav class="primary-nav" aria-label="{{ $content['ui']['menu'] }}">
                            @foreach ($content['nav'] as $item)
                                @php
                                    $navCount = count($content['nav']);
                                    $href = route($item['route'], ['locale' => $locale]);
                                    $isActive = $currentRoute === $item['route'];
                                    $reverseIndex = $navCount - $loop->iteration + 1;
                                @endphp
                                <a
                                    @class(['is-active' => $isActive])
                                    href="{{ $href }}"
                                    aria-label="{{ $item['label'] }}"
                                    @if ($isActive) aria-current="page" @endif
                                    data-menu-label="{{ $item['label'] }}"
                                    style="--menu-index: {{ $loop->index }}; --menu-reverse-index: {{ $reverseIndex }}"
                                >
                                    <x-nav-icon :name="$item['icon']" />
                                    <span class="sr-only">{{ $item['label'] }}</span>
                                </a>
                            @endforeach
                        </nav>

                        <div class="site-menu__divider" style="--menu-index: {{ count($content['nav']) }}; --menu-reverse-index: 0" aria-hidden="true"></div>

                        <nav class="language-switcher" aria-label="{{ $content['ui']['language'] }}" style="--menu-index: {{ count($content['nav']) + 1 }}; --menu-reverse-index: 0">
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
        </header>

        <main id="main">
            @yield('content')
        </main>

        <footer class="site-footer">
            <div class="section-shell site-footer__inner">
                <div>
                    <a class="brand-lockup brand-lockup--footer" href="{{ route('home', ['locale' => $locale]) }}">
                        <x-brand-mark class="brand-lockup__mark" size="96" />
                        <span>
                            <strong>Jeremy Läderach</strong>
                            <small>{{ $content['ui']['footer_note'] }}</small>
                        </span>
                    </a>
                </div>

                <div class="footer-links">
                    <a href="{{ config('portfolio.socials.email.url') }}">{{ config('portfolio.socials.email.display') }}</a>
                    <a href="{{ config('portfolio.socials.github.url') }}" rel="noreferrer">GitHub</a>
                    <a href="{{ route('imprint', ['locale' => $locale]) }}">{{ $content['imprint']['title'] }}</a>
                </div>
            </div>
        </footer>
    </body>
</html>
