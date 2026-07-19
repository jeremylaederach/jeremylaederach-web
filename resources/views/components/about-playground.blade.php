@php
    $playground = $content['about_page']['playground'];
    $defaultSort = array_key_first($playground['sorting']['algorithms']);
@endphp

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

            <div
                class="playground-demo__stage sorting-stage"
                data-sorting-stage
                role="img"
                aria-label="{{ $playground['sorting']['title'] }}"
            >
                <div class="sorting-stage__plot" data-sorting-plot></div>
            </div>

            <footer>
                <p class="playground-demo__description" data-sorting-description>
                    {{ $playground['sorting']['algorithms'][$defaultSort]['description'] }}
                </p>
                <div class="playground-demo__options" aria-label="{{ $playground['sorting']['title'] }}">
                    @foreach ($playground['sorting']['algorithms'] as $key => $algorithm)
                        <button
                            type="button"
                            aria-pressed="{{ $loop->first ? 'true' : 'false' }}"
                            data-sorting-algorithm="{{ $key }}"
                            data-sorting-description="{{ $algorithm['description'] }}"
                            data-interface-sound
                            data-sound-tone="control"
                        >{{ $algorithm['label'] }}</button>
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
                aria-label="{{ $playground['network']['description'] }}"
            ></canvas>

            <footer>
                <p class="playground-demo__description">
                    {{ $playground['network']['description'] }}
                </p>
                <div class="playground-demo__options" aria-label="{{ $playground['network']['title'] }}">
                    @foreach ($playground['network']['signals'] as $key => $signal)
                        <button
                            type="button"
                            aria-pressed="{{ $loop->first ? 'true' : 'false' }}"
                            data-network-signal="{{ $key }}"
                            data-interface-sound
                            data-sound-tone="control"
                        >{{ $signal['label'] }}</button>
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
                tabindex="0"
                role="img"
                aria-label="{{ $playground['pathfinding']['description'] }} {{ $playground['pathfinding']['keyboard_hint'] }}"
            ></canvas>

            <footer>
                <p class="playground-demo__description">
                    {{ $playground['pathfinding']['description'] }}
                </p>
                <div class="playground-demo__actions">
                    <button type="button" data-pathfinding-run data-interface-sound data-sound-tone="action">
                        {{ $playground['pathfinding']['run'] }}
                    </button>
                    <button type="button" data-pathfinding-reset data-interface-sound data-sound-tone="control">
                        {{ $playground['pathfinding']['reset'] }}
                    </button>
                </div>
            </footer>
        </article>
    </div>
</section>
