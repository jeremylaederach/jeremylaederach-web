@props([
    'project',
])

<div {{ $attributes->class(['project-showcase', 'project-showcase--'.$project['slug']]) }}>
    <div class="project-showcase__bar" aria-hidden="true">
        <span class="project-showcase__status"><i></i>{{ $project['visual_kicker'] }}</span>
        <span>{{ $project['visual_caption'] }}</span>
    </div>

    <figure class="project-showcase__media">
        <img
            src="{{ asset($project['visual_image']) }}"
            alt="{{ $project['preview_label'] }}"
            loading="eager"
            decoding="async"
        >
    </figure>
</div>
