{{--
    A page as a stage: a heading, a list of large rows and the dot sphere, which rests in the
    figure of the current row. A row is one link. Each item is an array:

    id       anchor of the row
    name     the large text of the row
    label    accessible name of the link
    href     where the link leads
    figure   the figure the sphere takes (see dot-orb-figures.js)
    icon     name of the icon at the end of the row's first line
    route    name of the page's route, for a page of this site
    project  slug of the project the row stands for, which brings that project's color
    value    short text at the end of the row's first line
    detail   ['kind' => ..., 'text' => ..., 'tags' => [...]], which the row holds while it is current

    The slot is a note that stands below the list. The class `stage-list--mirrored` puts the sphere
    on the left and the list on the right.
--}}
@props([
    'headingId',
    'heading',
    'intro',
    'items',
])

<section {{ $attributes->class('stage-list') }} aria-labelledby="{{ $headingId }}" data-reveal>
    <div class="dot-orb" aria-hidden="true">
        <canvas data-dot-orb data-dot-orb-fit></canvas>
    </div>

    <header class="stage-list__header">
        <x-animated-page-heading :id="$headingId" :text="$heading" />

        <p>{{ $intro }}</p>
    </header>

    <ol class="stage-list__rows">
        @foreach ($items as $item)
            <li
                id="{{ $item['id'] }}"
                class="stage-list__item"
                data-stage-item
                @isset($item['project']) data-project="{{ $item['project'] }}" @endisset
                @if ($loop->first) data-current @endif
            >
                <a
                    class="stage-list__link"
                    href="{{ $item['href'] }}"
                    aria-label="{{ $item['label'] }}"
                    @isset($item['detail']) aria-describedby="{{ $item['id'] }}-detail" @endisset
                    @isset($item['route'])
                        data-route="{{ $item['route'] }}"
                        data-route-transition
                    @elseif (str_starts_with($item['href'], 'http'))
                        rel="noopener noreferrer"
                    @endisset
                    data-dot-orb-figure="{{ $item['figure'] }}"
                    @if ($loop->first) data-dot-orb-resting @endif
                    data-pointer-wrap
                    data-interface-sound
                    data-sound-tone="panel"
                >
                    <span class="stage-list__title">
                        <span class="stage-list__name">{{ $item['name'] }}</span>
                        @isset($item['value'])
                            <span class="stage-list__value">{{ $item['value'] }}</span>
                        @endisset
                        <x-nav-icon :name="$item['icon']" />
                    </span>

                    @isset($item['detail'])
                        <div id="{{ $item['id'] }}-detail" class="stage-list__detail">
                            <p class="stage-list__kind">{{ $item['detail']['kind'] }}</p>
                            <p class="stage-list__text">{{ $item['detail']['text'] }}</p>
                            <ul class="stage-list__tags">
                                @foreach ($item['detail']['tags'] as $tag)
                                    <li>{{ $tag }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endisset
                </a>
            </li>
        @endforeach
    </ol>

    @if ($slot->isNotEmpty())
        <div class="stage-list__note">{{ $slot }}</div>
    @endif
</section>
