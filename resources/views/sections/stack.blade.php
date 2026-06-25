<section id="stack" class="content-section section-shell section-grid">
    <x-section-heading :kicker="$content['stack']['kicker']" :title="$content['stack']['title']" />

    <div class="stack-groups">
        @foreach ($content['stack']['groups'] as $group)
            <article class="stack-group reveal">
                <h3>{{ $group['name'] }}</h3>
                <x-tag-list :items="$group['items']" />
            </article>
        @endforeach
    </div>
</section>
