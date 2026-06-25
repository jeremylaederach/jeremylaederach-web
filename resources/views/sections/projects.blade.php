<section id="projects" class="content-section section-shell">
    <x-section-heading
        :kicker="$content['projects']['kicker']"
        :title="$content['projects']['title']"
        :lead="$content['projects']['intro']"
        wide
    />

    <div class="project-grid">
        @foreach ($content['projects']['items'] as $project)
            <x-project-card :project="$project" />
        @endforeach
    </div>
</section>
