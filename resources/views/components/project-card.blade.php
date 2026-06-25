@props(['project'])

<article class="project-card interactive-surface reveal" data-tilt>
    <div class="project-card__visual">
        @if (! empty($project['image']))
            <img src="{{ asset($project['image']) }}" alt="" loading="lazy">
        @else
            <div class="generated-visual generated-visual--{{ $project['visual'] ?? 'portfolio' }}" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
            </div>
        @endif
    </div>

    <div class="project-card__body">
        <div>
            <p class="project-card__type">{{ $project['type'] }}</p>
            <h3>{{ $project['name'] }}</h3>
        </div>

        <p>{{ $project['description'] }}</p>

        <x-tag-list :items="$project['tags']" :label="$project['name'].' stack'" />
    </div>
</article>
