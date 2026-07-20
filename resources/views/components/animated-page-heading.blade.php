@props(['text'])

@php
    $letters = mb_str_split($text);
@endphp

<h1
    {{ $attributes->class(['page-heading-wordmark'])->merge([
        'aria-label' => $text.'.',
        'data-page-heading-signal' => '',
    ]) }}
>
    <span class="page-heading-wordmark__text" aria-hidden="true">
        @foreach ($letters as $letter)
            @if ($letter === ' ')
                <span class="page-heading-wordmark__space">&nbsp;</span>
            @else
                <span
                    class="page-heading-wordmark__letter"
                    style="--letter-index: {{ $loop->index }}"
                ><span class="page-heading-wordmark__glyph">{{ $letter }}</span></span>
            @endif
        @endforeach

        <span
            class="page-heading-wordmark__letter accent-dot"
            style="--letter-index: {{ count($letters) }}"
        ><span class="page-heading-wordmark__glyph">.</span></span>
    </span>
</h1>
