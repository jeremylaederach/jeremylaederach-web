@php
    $playground = $content['about_page']['playground'];
    $defaultSort = array_key_first($playground['sorting']['algorithms']);
    $defaultSignal = array_key_first($playground['network']['signals']);
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
                <div class="playground-demo__title">
                    <span>01</span>
                    <h3>{{ $playground['sorting']['title'] }}</h3>
                </div>
                <div class="playground-demo__metrics">
                    <span class="playground-demo__metric">
                        <small>{{ $playground['sorting']['complexity_label'] }}</small>
                        <strong data-sorting-complexity>
                            {{ $playground['sorting']['algorithms'][$defaultSort]['complexity'] }}
                        </strong>
                    </span>
                    <output>
                        <small>{{ $playground['sorting']['metric'] }}</small>
                        <span data-sorting-output>0</span>
                    </output>
                    <span
                        class="sr-only"
                        aria-live="polite"
                        data-sorting-status
                        data-complete-label="{{ $playground['sorting']['complete'] }}"
                    ></span>
                </div>
            </header>

            <div
                class="playground-demo__stage sorting-stage"
                data-sorting-stage
                role="img"
                aria-label="{{ $playground['sorting']['title'] }}. {{ $playground['sorting']['growth_note'] }}"
            >
                <div class="sorting-stage__plot" data-sorting-plot></div>
            </div>

            <footer>
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
                <p class="playground-demo__description" data-sorting-description>
                    {{ $playground['sorting']['algorithms'][$defaultSort]['description'] }}
                </p>
                <p class="playground-demo__note">
                    <span>n</span>
                    {{ $playground['sorting']['growth_note'] }}
                </p>
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
                <div class="playground-demo__title">
                    <span>02</span>
                    <h3>{{ $playground['network']['title'] }}</h3>
                </div>
                <output aria-live="polite">
                    <small>{{ $playground['network']['metric'] }}</small>
                    <span data-network-output>—</span>
                </output>
            </header>

            <canvas
                width="640"
                height="400"
                data-network-canvas
                data-network-layers="{{ implode('|', $playground['network']['visual']['layers']) }}"
                data-network-inputs="{{ implode('|', $playground['network']['visual']['inputs']) }}"
                data-network-classes="{{ implode('|', $playground['network']['visual']['classes']) }}"
                role="img"
                aria-label="{{ $playground['network']['description'] }} {{ $playground['network']['note'] }}"
            ></canvas>

            <footer>
                <div
                    class="playground-demo__options"
                    role="group"
                    aria-label="{{ $playground['network']['title'] }}"
                >
                    @foreach ($playground['network']['signals'] as $key => $signal)
                        <button
                            type="button"
                            aria-pressed="{{ $key === $defaultSignal ? 'true' : 'false' }}"
                            data-network-scenario="{{ $key }}"
                            data-interface-sound
                            data-sound-tone="control"
                        >{{ $signal['label'] }}</button>
                    @endforeach
                </div>
                <p class="playground-demo__description">
                    {{ $playground['network']['description'] }}
                    {{ $playground['network']['note'] }}
                </p>
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

        <article class="playground-demo playground-demo--pathfinding" data-pathfinding-demo>
            <header>
                <div class="playground-demo__title">
                    <span>03</span>
                    <h3>{{ $playground['pathfinding']['title'] }}</h3>
                </div>
                <output aria-live="polite">
                    <small>{{ $playground['pathfinding']['metric'] }}</small>
                    <span data-pathfinding-output>—</span>
                </output>
            </header>

            <canvas
                width="640"
                height="400"
                tabindex="0"
                data-pathfinding-canvas
                data-pathfinding-visited-label="{{ $playground['pathfinding']['visual']['checked'] }}"
                data-pathfinding-path-label="{{ $playground['pathfinding']['visual']['steps'] }}"
                data-pathfinding-no-path-label="{{ $playground['pathfinding']['no_path'] }}"
                data-pathfinding-cell-label="{{ $playground['pathfinding']['visual']['cell'] }}"
                data-pathfinding-blocked-label="{{ $playground['pathfinding']['visual']['blocked'] }}"
                data-pathfinding-open-label="{{ $playground['pathfinding']['visual']['open'] }}"
                data-pathfinding-start-label="{{ $playground['pathfinding']['visual']['start'] }}"
                data-pathfinding-goal-label="{{ $playground['pathfinding']['visual']['goal'] }}"
                data-pathfinding-fixed-label="{{ $playground['pathfinding']['visual']['fixed'] }}"
                role="application"
                aria-describedby="pathfinder-instructions"
                aria-label="{{ $playground['pathfinding']['description'] }} {{ $playground['pathfinding']['note'] }}"
            ></canvas>
            <span class="sr-only" aria-live="polite" data-pathfinding-status></span>

            <footer>
                <p id="pathfinder-instructions" class="sr-only">
                    {{ $playground['pathfinding']['keyboard_note'] }}
                </p>
                <p class="playground-demo__description">
                    {{ $playground['pathfinding']['description'] }}
                    {{ $playground['pathfinding']['note'] }}
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
