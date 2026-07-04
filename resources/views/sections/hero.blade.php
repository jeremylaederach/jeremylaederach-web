<section class="landing-stage" aria-labelledby="landing-title">
    <div class="landing-stage__backdrop" aria-hidden="true">
        @foreach ($content['home']['backdrop'] as $word)
            <span>{{ $word }}</span>
        @endforeach
    </div>

    <div class="landing-stage__halo" aria-hidden="true"></div>

    <div class="landing-stage__inner">
        <div class="landing-stage__copy">
            <p class="landing-stage__kicker">{{ $content['home']['kicker'] }}</p>
            <h1 id="landing-title">{{ $content['home']['title'] }}</h1>
            <p>{{ $content['home']['intro'] }}</p>
        </div>

        <div class="landing-stage__brand-orbit" aria-hidden="true">
            <div class="landing-stage__status">
                <span></span>
                {{ $content['home']['status'] }}
            </div>

            <div class="landing-stage__cat-frame">
                <x-brand-mark class="landing-stage__cat" size="1024" fetchpriority="high" />
            </div>

            <div class="landing-stage__chips">
                @foreach ($content['home']['chips'] as $chip)
                    <span>{{ $chip }}</span>
                @endforeach
            </div>
        </div>

        <nav class="landing-nav" aria-label="{{ $content['ui']['menu'] }}">
            @foreach ($content['home']['entries'] as $entry)
                <a
                    href="{{ route($entry['route'], ['locale' => $locale]) }}"
                    class="landing-nav__item"
                    aria-label="{{ $entry['label'] }}: {{ $entry['description'] }}"
                    data-landing-card
                >
                    <span class="landing-nav__index">{{ $entry['index'] }}</span>
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
</section>
