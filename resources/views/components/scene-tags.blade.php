{{--
    Short entries of a scene, such as tools. One with a mark of its own (`technology_marks` in the
    content) answers a hover: the sphere takes that mark, in its color where one is named.
--}}
@props(['tags'])

@php
    $marks = config('portfolio.technology_marks');
    // A color as the three numbers the sphere takes.
    $channels = fn (string $hex): string => implode(', ', sscanf($hex, '#%02x%02x%02x'));
@endphp

<ul {{ $attributes->class('scene__tags') }}>
    @foreach ($tags as $tag)
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
