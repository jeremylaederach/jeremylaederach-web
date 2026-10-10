{{--
    A page told in scenes: one screen that stays in place while the page scrolls. Each scene is a
    short statement beside the dot sphere, which takes the scene's figures; scrolling on changes
    the statement and the figure together. The slot is the head of the stage: the page's heading.

    scenes  the texts, each an array:
            id      anchor of the scene's step
            label   its name in the list of steps, also shown above its statement
            text    the statement, the largest text
            detail  a sentence or two below it (optional)
            facts   what there is to know at one glance, each ['label' => ..., 'text' => ...]
                    or ['label' => ..., 'tags' => [...]] (optional)
            tags    short entries below, such as tools (see the scene-tags component) (optional)
            link    ['label' => ..., 'url' => ..., 'route' => name of the page's route for a page
                    of this site] (optional)
            links   several such links side by side, instead of one (optional)
            project slug of the project the scene stands for, which brings that project's color
    sphere  what the sphere shows for each scene, by its id: ['figures' => [...], 'color' => '#...']
    label   accessible name of the list of steps
    next    the word before the name of the next scene, on the link that leads on
--}}
@props([
    'scenes',
    'sphere',
    'label',
    'next',
])

@php
    // A color as the three numbers the sphere takes.
    $channels = fn (string $hex): string => implode(', ', sscanf($hex, '#%02x%02x%02x'));
@endphp

<div {{ $attributes->class('scene-stage') }} style="--scenes: {{ count($scenes) }}">
    <div class="scene-stage__view">
        <div class="dot-orb" data-dot-orb-stage="pinned" data-dot-orb-fit></div>

        <header class="scene-stage__header" data-reveal>
            {{ $slot }}

            {{-- The steps: the names of the scenes as a row of tabs below the heading. --}}
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

                    @isset($scene['facts'])
                        <dl class="scene__facts">
                            @foreach ($scene['facts'] as $fact)
                                <div>
                                    <dt>{{ $fact['label'] }}</dt>
                                    <dd>
                                        @isset($fact['tags'])
                                            <x-scene-tags :tags="$fact['tags']" />
                                        @else
                                            {{ $fact['text'] }}
                                        @endisset
                                    </dd>
                                </div>
                            @endforeach
                        </dl>
                    @endisset

                    @isset($scene['tags'])
                        <x-scene-tags :tags="$scene['tags']" />
                    @endisset

                    @php
                        $links = $scene['links'] ?? (isset($scene['link']) ? [$scene['link']] : []);
                    @endphp

                    @if ($links)
                        <p class="scene__links">
                            @foreach ($links as $link)
                                <a
                                    class="scene__link directional-link directional-link--forward"
                                    href="{{ $link['url'] }}"
                                    @isset($link['route'])
                                        data-route="{{ $link['route'] }}"
                                        data-route-transition
                                    @else
                                        rel="noopener noreferrer"
                                    @endisset
                                    data-interface-sound
                                    data-sound-tone="action"
                                >
                                    <span>{{ $link['label'] }}</span>
                                    <x-nav-icon :name="isset($link['route']) ? 'arrow-right' : 'arrow-up-right'" />
                                </a>
                            @endforeach
                        </p>
                    @endif
                </li>
            @endforeach
        </ol>

        {{-- The way on: the next scene, one press away. The scene controller keeps it in step. --}}
        @if (count($scenes) > 1)
            <a
                class="scene-stage__next"
                href="#{{ $scenes[1]['id'] }}"
                data-scene-next
                data-interface-sound
                data-sound-tone="control"
            >
                <span class="scene-stage__next-label">{{ $next }}</span>
                <span data-scene-next-name>{{ $scenes[1]['label'] }}</span>
                <x-nav-icon name="arrow-down" />
            </a>
        @endif
    </div>

    {{-- The steps the page scrolls through behind the screen, one for each scene. --}}
    <div class="scene-stage__track" aria-hidden="true">
        @foreach ($scenes as $scene)
            <div id="{{ $scene['id'] }}" class="scene-stage__step" data-scene-step="{{ $scene['id'] }}-scene"></div>
        @endforeach
    </div>
</div>
