<section class="landing-stage" aria-labelledby="landing-title">
    <div class="landing-stage__inner">
        <div class="landing-frame">
            <div class="landing-copy">
                <p class="landing-copy__eyebrow">{{ $content['home']['greeting'] }}</p>
                <h1 id="landing-title">{{ $content['home']['title'] }}</h1>
                <p>{{ $content['home']['intro'] }}</p>
            </div>

            <div class="landing-scene">
                <div class="landing-scene__blob" aria-hidden="true">
                    <span class="landing-scene__light landing-scene__light--top"></span>
                    <span class="landing-scene__light landing-scene__light--bottom"></span>
                </div>

                <x-brand-mark variant="cat-loaf-main" class="landing-scene__cat" size="720" />

                <nav class="landing-cards" aria-label="{{ $content['ui']['menu'] }}">
                    @foreach ($content['home']['entries'] as $entry)
                        <a
                            href="{{ route($entry['route'], ['locale' => $locale]) }}"
                            class="landing-card landing-card--{{ $entry['route'] }}"
                            aria-label="{{ $entry['label'] }}: {{ $entry['description'] }}"
                            data-landing-card
                        >
                            <span class="landing-card__content">
                                <span class="landing-card__icon">
                                    <x-nav-icon :name="$entry['icon']" />
                                </span>
                                <span class="landing-card__text">
                                    <strong>{{ $entry['label'] }}</strong>
                                    <span>{{ $entry['description'] }}</span>
                                </span>
                                <span class="landing-card__action" aria-hidden="true">
                                    <x-nav-icon name="arrow-right" />
                                </span>
                            </span>
                        </a>
                    @endforeach
                </nav>
            </div>
        </div>
    </div>
</section>
