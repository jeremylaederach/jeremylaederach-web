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
        <link rel="apple-touch-icon" href="{{ asset('brand/apple-touch-icon.png') }}">
        <link rel="manifest" href="{{ asset('site.webmanifest') }}">

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body>
        <a class="skip-link" href="#main">{{ $content['ui']['skip'] }}</a>
        <div class="site-background" aria-hidden="true"></div>

        <header class="site-header">
            <div class="site-header__inner">
                <a class="brand-lockup" href="{{ route('home', ['locale' => $locale]) }}" aria-label="{{ $content['ui']['brand'] }}">
                    <x-brand-mark class="brand-lockup__mark" size="96" />
                    <span>
                        <strong>Jeremy Läderach</strong>
                        <small>Software Developer</small>
                    </span>
                </a>

                <nav class="primary-nav" aria-label="{{ $content['ui']['menu'] }}">
                    @foreach ($content['nav'] as $item)
                        @php
                            $href = isset($item['route'])
                                ? route($item['route'], ['locale' => $locale])
                                : route('home', ['locale' => $locale]).$item['anchor'];
                        @endphp
                        <a href="{{ $href }}">{{ $item['label'] }}</a>
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
