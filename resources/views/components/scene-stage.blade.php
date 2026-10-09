{{--
    A page told in scenes: one screen that stays in place while the page scrolls. Each scene is a
    short statement beside the dot sphere, which takes the scene's figures; scrolling on changes
    the statement and the figure together. The slot is the head of the stage: the page's heading.

    scenes  the texts, each an array:
            id      anchor of the scene's step
            label   its name in the list of steps, also shown above its statement
            text    the statement, the largest text
            detail  a sentence or two below it (optional)
            tags    short entries below, such as tools; one with a mark of its own answers a
                    hover (`technology_marks` in the content) (optional)
            link    ['label' => ..., 'url' => ..., 'route' => name of the page's route for a page
                    of this site] (optional)
            project slug of the project the scene stands for, which brings that project's color
    sphere  what the sphere shows for each scene, by its id: ['figures' => [...], 'color' => '#...']
    label   accessible name of the list of steps
--}}
@props([
    'scenes',
    'sphere',
    'label',
])

@php
    $marks = config('portfolio.technology_marks');
    // A color as the three numbers the sphere takes.
    $channels = fn (string $hex): string => implode(', ', sscanf($hex, '#%02x%02x%02x'));
@endphp

<div {{ $attributes->class('scene-stage') }} style="--scenes: {{ count($scenes) }}">
    <div class="scene-stage__view">
        <div class="dot-orb" aria-hidden="true">
            <canvas data-dot-orb data-dot-orb-fit></canvas>
        </div>

        <header class="scene-stage__header" data-reveal>
            {{ $slot }}
        </header>

        <ol class="scene-stage__scenes">
            @foreach ($scenes as $scene)
                @php
                    $shown = $sphere[$scene['id']];
                @endphp
                <li
                    id="{{ $scene['id'] }}-scene"
                    class="scene"
                    data-scene
                    data-dot-orb-figure="{{ implode(' ', $shown['figures']) }}"
                    @isset($scene['project']) data-project="{{ $scene['project'] }}" @endisset
                    @isset($shown['color']) style="--dot-orb-rgb: {{ $channels($shown['color']) }}" @endisset
                    @if ($loop->first) data-active data-dot-orb-resting @endif
                >
                    <h2 class="scene__label">{{ $scene['label'] }}</h2>
                    <p class="scene__text">{{ $scene['text'] }}</p>

                    @isset($scene['detail'])
                        <p class="scene__detail">{{ $scene['detail'] }}</p>
                    @endisset

                    @isset($scene['tags'])
                        <ul class="scene__tags">
                            @foreach ($scene['tags'] as $tag)
                                @php
                                    $mark = $marks[$tag] ?? null;
                                @endphp
                                <li>
                                    @if ($mark)
                                        <span
                                            class="figure-word"
                                            data-dot-orb-figure="{{ $mark['figure'] }}"
                                            @isset($mark['color']) style="--dot-orb-rgb: {{ $channels($mark['color']) }}" @endisset
                                        >{{ $tag }}</span>
                                    @else
                                        {{ $tag }}
                                    @endif
                                </li>
                            @endforeach
                        </ul>
                    @endisset

                    @isset($scene['link'])
                        <a
                            class="scene__link directional-link directional-link--forward"
                            href="{{ $scene['link']['url'] }}"
                            @isset($scene['link']['route'])
                                data-route="{{ $scene['link']['route'] }}"
                                data-route-transition
                            @else
                                rel="noopener noreferrer"
                            @endisset
                            data-interface-sound
                            data-sound-tone="action"
                        >
                            <span>{{ $scene['link']['label'] }}</span>
                            <x-nav-icon :name="isset($scene['link']['route']) ? 'arrow-right' : 'arrow-up-right'" />
                        </a>
                    @endisset
                </li>
            @endforeach
        </ol>

        <nav class="scene-stage__steps" aria-label="{{ $label }}">
            @foreach ($scenes as $scene)
                <a
                    href="#{{ $scene['id'] }}"
                    @if ($loop->first) aria-current="step" @endif
                    data-interface-sound
                    data-sound-tone="control"
                >{{ $scene['label'] }}</a>
            @endforeach
        </nav>
    </div>

    {{-- The steps the page scrolls through behind the screen, one for each scene. --}}
    <div class="scene-stage__track" aria-hidden="true">
        @foreach ($scenes as $scene)
            <div id="{{ $scene['id'] }}" class="scene-stage__step" data-scene-step="{{ $scene['id'] }}-scene"></div>
        @endforeach
    </div>
</div>
