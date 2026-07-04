<section class="landing-stage" aria-labelledby="landing-title">
    <div class="landing-stage__ambient" aria-hidden="true"></div>

    <div class="landing-stage__inner">
        <div class="landing-stage__copy">
            <p>{{ $content['home']['kicker'] }}</p>
            <h1 id="landing-title">{{ $content['home']['title'] }}</h1>
        </div>

        <nav class="landing-cards" aria-label="{{ $content['ui']['menu'] }}">
            @foreach ($content['home']['entries'] as $entry)
                <a
                    href="{{ route($entry['route'], ['locale' => $locale]) }}"
                    class="landing-card"
                    aria-label="{{ $entry['label'] }}: {{ $entry['description'] }}"
                    data-landing-card
                    style="--card-index: {{ $loop->index }}"
                >
                    <span class="landing-card__flow" aria-hidden="true"></span>
                    <span class="landing-card__content">
                        <span class="landing-card__icon">
                            <x-nav-icon :name="$entry['icon']" />
                        </span>
                        <span class="landing-card__text">
                            <strong>{{ $entry['label'] }}</strong>
                            <span>{{ $entry['description'] }}</span>
                        </span>
                        <span class="landing-card__action" aria-hidden="true">-&gt;</span>
                    </span>
                </a>
            @endforeach
        </nav>
    </div>
</section>
