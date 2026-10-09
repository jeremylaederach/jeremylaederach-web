@props([
    'name',
])

@php
    $icons = [
        'arrow-right' => '<path d="M5 12h14" /><path d="m13 6 6 6-6 6" />',
        'arrow-down' => '<path d="M12 5v14" /><path d="m6 13 6 6 6-6" />',
        'arrow-up-right' => '<path d="M7 17 17 7" /><path d="M8 7h9v9" />',
        'sound-on' => '<path d="M5 10v4h3l4 3V7L8 10H5Z" /><path d="M15 9.5a4 4 0 0 1 0 5" /><path d="M17.5 7a7.4 7.4 0 0 1 0 10" />',
        'sound-off' => '<path d="M5 10v4h3l4 3V7L8 10H5Z" /><path d="m16 10 5 5" /><path d="m21 10-5 5" />',
    ];
@endphp

<svg
    {{ $attributes->merge([
        'class' => 'nav-icon',
        'viewBox' => '0 0 24 24',
        'fill' => 'none',
        'aria-hidden' => 'true',
    ]) }}
>
    {!! $icons[$name] !!}
</svg>
