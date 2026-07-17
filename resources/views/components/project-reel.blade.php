@props([
    'project',
    'ui',
    'mode' => 'teaser',
    'href' => null,
    'routeName' => null,
    'transitionTheme' => null,
    'transitionLabel' => null,
    'openLabel' => null,
])

@php
    $slides = $project['media'];
    $isDetail = $mode === 'detail';
    $reelAttributes = [
        'role' => 'region',
        'aria-roledescription' => 'carousel',
        'aria-label' => $project['preview_label'],
    ];

    if ($isDetail) {
        $reelAttributes['tabindex'] = '0';
    } else {
        throw_unless(
            $href && $routeName && $transitionTheme && $transitionLabel && $openLabel,
            LogicException::class,
        );
        $reelAttributes['data-reel-autoplay'] = 'true';
    }
@endphp

<div
    {{ $attributes->class([
        'project-visual',
        'project-reel',
        'project-reel--'.$project['slug'],
        'project-reel--detail' => $isDetail,
        'project-reel--teaser' => ! $isDetail,
    ])->merge($reelAttributes) }}
    data-project-reel
>
    @if ($isDetail)
        <div class="project-reel__viewport">
    @else
        <a
            class="project-reel__viewport"
            href="{{ $href }}"
            aria-label="{{ $openLabel }}"
            data-reel-open
            data-interface-sound
            data-sound-tone="panel"
            data-route="{{ $routeName }}"
            data-route-transition
            data-transition-label="{{ $transitionLabel }}"
            data-transition-theme="{{ $transitionTheme }}"
            data-pointer-route="{{ $transitionTheme }}"
        >
    @endif
        @foreach ($slides as $slide)
            <div
                class="project-reel__slide"
                data-reel-slide
                data-state="{{ $loop->first ? 'active' : 'after' }}"
                data-label="{{ $slide['label'] }}"
                aria-hidden="{{ $loop->first ? 'false' : 'true' }}"
            >
                @switch($slide['type'])
                    @case('quantified-workspace')
                        <x-quantified-workspace-preview
                            class="project-reel__surface"
                            :label="$project['preview_label']"
                            :view="$slide['view']"
                        />
                        @break

                    @case('jay-jay-web')
                        <figure class="project-reel__surface project-reel__browser">
                            <img
                                src="{{ asset('assets/work/jay-jay-home.png') }}"
                                alt="{{ $slide['label'] }}"
                                loading="{{ $isDetail ? 'eager' : 'lazy' }}"
                                decoding="async"
                            >
                        </figure>
                        @break

                    @case('jay-jay-hub')
                        <x-client-hub-preview
                            class="project-reel__surface project-reel__client-hub"
                            :copy="$project['preview']['hub']"
                            :label="$slide['label']"
                            :view="$slide['view']"
                        />
                        @break

                    @case('sessiondeck-overview')
                    @case('sessiondeck-editor')
                    @case('sessiondeck-result')
                        <x-sessiondeck-preview
                            class="project-reel__surface"
                            :label="$slide['label']"
                            :view="str_replace('sessiondeck-', '', $slide['type'])"
                        />
                        @break

                    @default
                        @php
                            throw new LogicException("Unknown project media type [{$slide['type']}].");
                        @endphp
                @endswitch
            </div>
        @endforeach

        <span class="project-reel__sheen" aria-hidden="true"></span>
        <span class="project-reel__counter" aria-hidden="true">
            <b data-reel-current>01</b>
            <i></i>
            <span>{{ str_pad((string) count($slides), 2, '0', STR_PAD_LEFT) }}</span>
        </span>
    @if ($isDetail)
        </div>
    @else
        </a>
    @endif

    <div class="project-reel__footer">
        <p>
            <strong data-reel-label>{{ $slides[0]['label'] }}</strong>
        </p>

        <div
            @class([
                'project-reel__controls',
                'project-reel__controls--compact' => ! $isDetail,
            ])
            role="group"
            aria-label="{{ $ui['project_media'] }}"
        >
            <button
                type="button"
                aria-label="{{ $ui['media_previous'] }}"
                data-reel-action="previous"
                data-interface-sound
                data-sound-tone="control"
            >
                <x-nav-icon name="arrow-right" />
            </button>

            <span class="project-reel__pagination">
                @foreach ($slides as $slide)
                    <button
                        type="button"
                        aria-label="{{ $ui['media_view'] }} {{ $loop->iteration }}: {{ $slide['label'] }}"
                        aria-current="{{ $loop->first ? 'true' : 'false' }}"
                        data-reel-action="go"
                        data-reel-index="{{ $loop->index }}"
                        data-interface-sound
                        data-sound-tone="control"
                    ></button>
                @endforeach
            </span>

            <button
                type="button"
                aria-label="{{ $ui['media_next'] }}"
                data-reel-action="next"
                data-interface-sound
                data-sound-tone="control"
            >
                <x-nav-icon name="arrow-right" />
            </button>
        </div>
    </div>
</div>
