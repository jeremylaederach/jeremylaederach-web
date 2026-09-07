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
        'aria-roledescription' => $ui['carousel'],
        'aria-label' => $project['preview_label'],
    ];

    if ($isDetail) {
        $reelAttributes['tabindex'] = '0';
    } else {
        throw_unless(
            $href && $routeName && $transitionTheme && $transitionLabel && $openLabel,
            LogicException::class,
        );
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
    data-transition-origin="compact"
>
    <div class="project-reel__frame">
        <div class="project-reel__chrome">
            <span data-reel-kind>{{ $slides[0]['type'] === 'jay-jay-web' ? $ui['media_screenshot'] : $ui['media_preview'] }}</span>
            @if ($isDetail)
                <button type="button" class="project-reel__expand" data-reel-action="expand">
                    <span>{{ $ui['media_expand'] }}</span>
                    <x-nav-icon name="expand" />
                </button>
            @endif
        </div>
        @if ($isDetail)
            <div class="project-reel__viewport">
        @else
            <a
                class="project-reel__viewport"
                href="{{ $href }}"
                aria-label="{{ $openLabel }}"
                data-reel-open
                data-transition-origin="compact"
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
                    data-state="{{ $loop->first ? 'active' : 'inactive' }}"
                    data-kind="{{ $slide['type'] === 'jay-jay-web' ? $ui['media_screenshot'] : $ui['media_preview'] }}"
                    aria-hidden="{{ $loop->first ? 'false' : 'true' }}"
                    @if (! $loop->first) inert @endif
                >
                    @switch($slide['type'])
                        @case('quantified-workspace')
                            <x-quantified-workspace-preview
                                class="project-reel__surface"
                                :label="$slide['description'] ?? $slide['label']"
                                :view="$slide['view']"
                            />
                            @break

                        @case('jay-jay-web')
                            <figure class="project-reel__surface project-reel__browser">
                                <img
                                    src="{{ asset('assets/work/jay-jay-home.png') }}"
                                    alt="{{ $slide['description'] ?? $slide['label'] }}"
                                    loading="{{ $isDetail ? 'eager' : 'lazy' }}"
                                    decoding="async"
                                >
                            </figure>
                            @break

                        @case('jay-jay-hub')
                            <x-client-hub-preview
                                class="project-reel__surface project-reel__client-hub"
                                :copy="$project['preview']['hub']"
                                :label="$slide['description'] ?? $slide['label']"
                                :view="$slide['view']"
                            />
                            @break

                        @case('sessiondeck-overview')
                        @case('sessiondeck-editor')
                        @case('sessiondeck-result')
                            <x-sessiondeck-preview
                                class="project-reel__surface"
                                :label="$slide['description'] ?? $slide['label']"
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
        @if ($isDetail)
            </div>
        @else
            </a>
        @endif
    </div>

    <div class="project-reel__footer">
        <div class="project-reel__captions" aria-live="polite" aria-atomic="true">
            @foreach ($slides as $slide)
                <p data-reel-caption aria-hidden="{{ $loop->first ? 'false' : 'true' }}">
                    <strong>{{ $slide['label'] }}</strong>
                    @if ($isDetail)
                        <span>{{ $slide['description'] }}</span>
                    @endif
                </p>
            @endforeach
        </div>

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

            <span class="project-reel__counter" aria-hidden="true">
                <b data-reel-current>01</b>
                <span>/</span>
                <span>{{ str_pad((string) count($slides), 2, '0', STR_PAD_LEFT) }}</span>
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

    @if ($isDetail)
        <dialog class="project-reel__dialog" data-reel-dialog aria-label="{{ $project['heading'] }} · {{ $ui['project_media'] }}">
            <div class="project-reel__dialog-heading">
                <strong>{{ $project['heading'] }}</strong>
                <button type="button" data-reel-action="close" aria-label="{{ $ui['media_close'] }}" autofocus>
                    <x-nav-icon name="close" />
                </button>
            </div>
            <div data-reel-expanded></div>
        </dialog>
    @endif
</div>
