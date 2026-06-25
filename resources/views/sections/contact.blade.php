<section id="contact" class="content-section section-shell contact-band">
    <div class="contact-band__copy reveal">
        <p class="eyebrow">{{ $content['contact']['kicker'] }}</p>
        <h2>{{ $content['contact']['title'] }}</h2>
        <p>{{ $content['contact']['intro'] }}</p>
    </div>

    <div class="contact-panel interactive-surface reveal">
        <x-social-links />

        <div class="contact-panel__notes">
            @foreach ($content['contact']['cards'] as $card)
                <article>
                    <span>{{ $card['label'] }}</span>
                    <p>{{ $card['value'] }}</p>
                </article>
            @endforeach
        </div>
    </div>
</section>
