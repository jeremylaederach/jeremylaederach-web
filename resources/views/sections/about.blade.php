<section id="about" class="content-section section-shell section-grid">
    <x-section-heading :kicker="$content['about']['kicker']" :title="$content['about']['title']" />

    <div class="section-copy reveal">
        @foreach ($content['about']['body'] as $paragraph)
            <p>{{ $paragraph }}</p>
        @endforeach

        <div class="highlight-grid">
            @foreach ($content['about']['highlights'] as $highlight)
                <article class="mini-card">
                    <span>{{ $highlight['label'] }}</span>
                    <p>{{ $highlight['value'] }}</p>
                </article>
            @endforeach
        </div>
    </div>
</section>
