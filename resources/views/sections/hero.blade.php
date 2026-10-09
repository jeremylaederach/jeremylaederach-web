<section class="kinetic-index" aria-labelledby="landing-title">
    <div class="dot-orb" aria-hidden="true">
        <canvas data-dot-orb data-mark="{{ asset('brand/mark.svg') }}"></canvas>
    </div>
    <header class="kinetic-index__masthead">
        <h1 id="landing-title" class="kinetic-index__heading">
            <span class="kinetic-index__name figure-word" data-dot-orb-figure="mark">Jeremy Läderach<em>.</em></span>
        </h1>

        <p class="kinetic-index__summary">
            <x-figure-text :text="$content['home']['summary']" :figures="$content['home']['summary_figures']" />
        </p>
    </header>
</section>
