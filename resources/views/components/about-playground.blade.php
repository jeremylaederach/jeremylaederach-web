@php
    $playground = $content['about_page']['playground'];
    $defaultSort = array_key_first($playground['sorting']['algorithms']);
    $defaultDigit = $playground['network']['default'];
    $defaultPathStrategy = array_key_first($playground['pathfinding']['strategies']);
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
                <output aria-live="off">
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
                <p
                    class="playground-demo__description"
                    aria-live="polite"
                    data-sorting-description
                >{{ $playground['sorting']['algorithms'][$defaultSort]['description'] }}</p>
                <p class="playground-demo__complexity">
                    <span data-sorting-complexity>
                        {{ $playground['sorting']['algorithms'][$defaultSort]['complexity'] }}
                    </span>
                    <span>{{ $playground['sorting']['scale'] }}</span>
                </p>
                <div
                    class="playground-demo__options"
                    role="group"
                    aria-label="{{ $playground['sorting']['title'] }}"
                >
                    @foreach ($playground['sorting']['algorithms'] as $key => $algorithm)
                        <button
                            type="button"
                            aria-pressed="{{ $loop->first ? 'true' : 'false' }}"
                            data-sorting-algorithm="{{ $key }}"
                            data-sorting-description="{{ $algorithm['description'] }}"
                            data-sorting-complexity="{{ $algorithm['complexity'] }}"
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
                <span
                    class="sr-only"
                    aria-live="polite"
                    data-sorting-status
                    data-complete-label="{{ $playground['sorting']['complete'] }}"
                ></span>
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

            <div
                class="playground-demo__stage neural-stage"
                data-network-stage
                data-network-empty="{{ $playground['network']['empty'] }}"
            >
                <div class="neural-stage__input">
                    <span class="playground-stage-label">{{ $playground['network']['visual']['input'] }}</span>
                    <div
                        class="neural-pixels"
                        role="grid"
                        aria-multiselectable="true"
                        aria-label="{{ $playground['network']['description'] }}"
                        aria-describedby="network-instructions"
                        data-network-pixels
                        data-network-pixel-label="{{ $playground['network']['visual']['pixel'] }}"
                        data-network-on-label="{{ $playground['network']['visual']['on'] }}"
                        data-network-off-label="{{ $playground['network']['visual']['off'] }}"
                    ></div>
                </div>

                <div class="neural-stage__bridge" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <div class="neural-stage__output" aria-hidden="true">
                    <span class="playground-stage-label">{{ $playground['network']['visual']['output'] }}</span>
                    <div class="neural-results">
                        @foreach ($playground['network']['presets'] as $digit => $preset)
                            <span class="neural-result" data-network-result="{{ $digit }}">
                                <strong>{{ $preset['label'] }}</strong>
                                <i><span></span></i>
                                <small>0%</small>
                            </span>
                        @endforeach
                    </div>
                </div>
            </div>

            <footer>
                <p id="network-instructions" class="sr-only">
                    {{ $playground['network']['keyboard_note'] }}
                </p>
                <p class="playground-demo__description">{{ $playground['network']['description'] }}</p>
                <div
                    class="playground-demo__options"
                    role="group"
                    aria-label="{{ $playground['network']['title'] }}"
                >
                    @foreach ($playground['network']['presets'] as $digit => $preset)
                        <button
                            type="button"
                            aria-pressed="{{ (string) $digit === (string) $defaultDigit ? 'true' : 'false' }}"
                            data-network-preset="{{ $digit }}"
                            data-interface-sound
                            data-sound-tone="control"
                        >{{ $preset['label'] }}</button>
                    @endforeach
                </div>
                <div class="playground-demo__actions">
                    <button type="button" data-network-run data-interface-sound data-sound-tone="action">
                        {{ $playground['network']['run'] }}
                    </button>
                    <button type="button" data-network-clear data-interface-sound data-sound-tone="control">
                        {{ $playground['network']['reset'] }}
                    </button>
                </div>
            </footer>
        </article>

        <article class="playground-demo" data-pathfinding-demo>
            <header>
                <h3>{{ $playground['pathfinding']['title'] }}</h3>
                <output aria-live="off">
                    <small>{{ $playground['pathfinding']['metric'] }}</small>
                    <span data-pathfinding-output>—</span>
                </output>
            </header>

            <div class="playground-demo__stage path-stage">
                <div
                    class="path-grid"
                    role="grid"
                    aria-multiselectable="true"
                    aria-label="{{ $playground['pathfinding']['description'] }}"
                    aria-describedby="pathfinder-instructions"
                    data-pathfinding-grid
                    data-pathfinding-no-path-label="{{ $playground['pathfinding']['no_path'] }}"
                    data-pathfinding-cell-label="{{ $playground['pathfinding']['visual']['cell'] }}"
                    data-pathfinding-blocked-label="{{ $playground['pathfinding']['visual']['blocked'] }}"
                    data-pathfinding-open-label="{{ $playground['pathfinding']['visual']['open'] }}"
                    data-pathfinding-start-label="{{ $playground['pathfinding']['visual']['start'] }}"
                    data-pathfinding-goal-label="{{ $playground['pathfinding']['visual']['goal'] }}"
                    data-pathfinding-fixed-label="{{ $playground['pathfinding']['visual']['fixed'] }}"
                    data-pathfinding-checked-label="{{ $playground['pathfinding']['visual']['checked'] }}"
                    data-pathfinding-steps-label="{{ $playground['pathfinding']['visual']['steps'] }}"
                    data-pathfinding-turns-label="{{ $playground['pathfinding']['visual']['turns'] }}"
                ></div>
            </div>
            <span class="sr-only" aria-live="polite" data-pathfinding-status></span>

            <footer>
                <p id="pathfinder-instructions" class="sr-only">
                    {{ $playground['pathfinding']['keyboard_note'] }}
                </p>
                <p
                    class="playground-demo__description"
                    aria-live="polite"
                    data-pathfinding-description
                >{{ $playground['pathfinding']['strategies'][$defaultPathStrategy]['description'] }}</p>
                <div
                    class="playground-demo__options"
                    role="group"
                    aria-label="{{ $playground['pathfinding']['title'] }}"
                >
                    @foreach ($playground['pathfinding']['strategies'] as $key => $strategy)
                        <button
                            type="button"
                            aria-pressed="{{ $loop->first ? 'true' : 'false' }}"
                            data-pathfinding-strategy="{{ $key }}"
                            data-pathfinding-description="{{ $strategy['description'] }}"
                            data-interface-sound
                            data-sound-tone="control"
                        >{{ $strategy['label'] }}</button>
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
            </footer>
        </article>
    </div>
</section>
