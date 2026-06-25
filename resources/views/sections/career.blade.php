<section id="career" class="content-section section-shell">
    <x-section-heading :kicker="$content['career']['kicker']" :title="$content['career']['title']" wide />

    <div class="timeline">
        @foreach ($content['career']['items'] as $item)
            <article class="timeline-item reveal">
                <time>{{ $item['period'] }}</time>
                <div>
                    <h3>{{ $item['title'] }}</h3>
                    <p>{{ $item['description'] }}</p>
                </div>
            </article>
        @endforeach
    </div>
</section>
