<section class="kinetic-index" aria-labelledby="landing-title">
    {{-- A press on the plain sphere shows the next figure of the statement. --}}
    <div class="dot-orb" data-dot-orb-stage data-dot-orb-presses="{{ implode(' ', array_column($content['home']['summary_figures'], 'figure')) }}"></div>
    <header class="kinetic-index__masthead">
        <h1 id="landing-title" class="kinetic-index__heading">
            <span class="kinetic-index__name figure-word" data-dot-orb-figure="mark">Jeremy Läderach<em>.</em></span>
        </h1>

        <p class="kinetic-index__summary">
            <x-figure-text :text="$content['home']['summary']" :figures="$content['home']['summary_figures']" />
        </p>
    </header>
</section>
