@php($playground = $content['about_page']['playground'])

<section class="about-playground" aria-labelledby="playground-title" data-reveal>
    <header class="about-section-heading">
        <p class="section-label about-section-label">
            <span>04</span>
            <span aria-hidden="true">/</span>
            <span>{{ $content['about_page']['playground_label'] }}</span>
        </p>
        <div class="about-section-heading__content">
            <h2 id="playground-title">{{ $content['about_page']['playground_heading'] }}</h2>
            <p>{{ $content['about_page']['playground_intro'] }}</p>
        </div>
    </header>

    <div class="playground-grid" data-about-playground>
        <article class="playground-demo" data-sorting-demo>
            <header>
                <h3>{{ $playground['sorting']['title'] }}</h3>
                <output aria-live="polite">
                    <small>{{ $playground['sorting']['metric'] }}</small>
                    <span data-sorting-output>0</span>
                </output>
            </header>

            <canvas
                width="640"
                height="360"
                data-sorting-canvas
                role="img"
                aria-label="{{ $playground['sorting']['title'] }}"
            ></canvas>

            <footer>
                <div class="playground-demo__options" aria-label="{{ $playground['sorting']['title'] }}">
                    @foreach (['quick' => 'Quick', 'merge' => 'Merge', 'bubble' => 'Bubble'] as $key => $label)
                        <button
                            type="button"
                            aria-pressed="{{ $loop->first ? 'true' : 'false' }}"
                            data-sorting-algorithm="{{ $key }}"
                            data-interface-sound
                            data-sound-tone="control"
                        >{{ $label }}</button>
                    @endforeach
                </div>
                <div class="playground-demo__actions">
                    <button type="button" data-sorting-run data-interface-sound data-sound-tone="action">
                        {{ $playground['sorting']['run'] }}
                    </button>
                    <button type="button" data-sorting-shuffle data-interface-sound data-sound-tone="control">
                        {{ $playground['sorting']['shuffle'] }}
                    </button>
                </div>
            </footer>
        </article>

        <article class="playground-demo" data-network-demo>
            <header>
                <h3>{{ $playground['network']['title'] }}</h3>
                <output aria-live="polite">
                    <small>{{ $playground['network']['metric'] }}</small>
                    <span data-network-output>—</span>
                </output>
            </header>

            <canvas
                width="640"
                height="360"
                data-network-canvas
                role="img"
                aria-label="{{ $playground['network']['title'] }}"
            ></canvas>

            <footer>
                <div class="playground-demo__options" aria-label="{{ $playground['network']['title'] }}">
                    @foreach (['relu' => 'ReLU', 'sigmoid' => 'Sigmoid'] as $key => $label)
                        <button
                            type="button"
                            aria-pressed="{{ $loop->first ? 'true' : 'false' }}"
                            data-network-activation="{{ $key }}"
                            data-interface-sound
                            data-sound-tone="control"
                        >{{ $label }}</button>
                    @endforeach
                </div>
                <div class="playground-demo__actions">
                    <button type="button" data-network-run data-interface-sound data-sound-tone="action">
                        {{ $playground['network']['run'] }}
                    </button>
                    <button type="button" data-network-reset data-interface-sound data-sound-tone="control">
                        {{ $playground['network']['reset'] }}
                    </button>
                </div>
            </footer>
        </article>

        <article class="playground-demo" data-pathfinding-demo>
            <header>
                <h3>{{ $playground['pathfinding']['title'] }}</h3>
                <output aria-live="polite">
                    <small>{{ $playground['pathfinding']['metric'] }}</small>
                    <span data-pathfinding-output>0</span>
                </output>
            </header>

            <canvas
                width="640"
                height="360"
                data-pathfinding-canvas
                role="img"
                aria-label="{{ $playground['pathfinding']['title'] }}"
            ></canvas>

            <footer>
                <div class="playground-demo__options" aria-label="{{ $playground['pathfinding']['title'] }}">
                    @foreach (['astar' => 'A*', 'dijkstra' => 'Dijkstra'] as $key => $label)
                        <button
                            type="button"
                            aria-pressed="{{ $loop->first ? 'true' : 'false' }}"
                            data-pathfinding-algorithm="{{ $key }}"
                            data-interface-sound
                            data-sound-tone="control"
                        >{{ $label }}</button>
                    @endforeach
                </div>
                <div class="playground-demo__actions">
                    <button type="button" data-pathfinding-run data-interface-sound data-sound-tone="action">
                        {{ $playground['pathfinding']['run'] }}
                    </button>
                    <button type="button" data-pathfinding-reset data-interface-sound data-sound-tone="control">
                        {{ $playground['pathfinding']['reset'] }}
                    </button>
                </div>
                <p>{{ $playground['pathfinding']['hint'] }}</p>
            </footer>
        </article>
    </div>
</section>
