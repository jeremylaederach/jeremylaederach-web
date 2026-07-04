<section class="landing-stage" aria-labelledby="landing-title">
    <div class="landing-stage__halo" aria-hidden="true"></div>

    <div class="landing-stage__inner">
        <h1 id="landing-title" class="sr-only">{{ $content['home']['title'] }}</h1>

        <div class="landing-stage__experience">
            <nav class="landing-nav" aria-label="{{ $content['ui']['menu'] }}">
                @foreach ($content['home']['entries'] as $entry)
                    <a
                        href="{{ route($entry['route'], ['locale' => $locale]) }}"
                        class="landing-nav__item"
                        aria-label="{{ $entry['label'] }}: {{ $entry['description'] }}"
                        data-landing-card
                    >
                        <span class="landing-nav__icon">
                            <x-nav-icon :name="$entry['icon']" />
                        </span>
                        <span class="landing-nav__text">
                            <strong>{{ $entry['label'] }}</strong>
                            <span>{{ $entry['description'] }}</span>
                        </span>
                        <span class="landing-nav__action">
                            {{ $content['ui']['open'] }}
                            <span aria-hidden="true">&rarr;</span>
                        </span>
                    </a>
                @endforeach
            </nav>
        </div>
    </div>
</section>
