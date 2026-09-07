@props([
    'name',
])

@php
    $icons = [
        'home' => '<path d="M3 10.8 12 3l9 7.8" /><path d="M5.5 9.2V21h13V9.2" /><path d="M9.5 21v-6h5v6" />',
        'user' => '<circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" />',
        'folder' => '<path d="M3.5 6.5h6l2 2h9v10.5a2 2 0 0 1-2 2h-15z" /><path d="M3.5 6.5v14.5" />',
        'mail' => '<rect x="3.5" y="6" width="17" height="12" rx="2" /><path d="m5 8 7 5 7-5" />',
        'arrow-right' => '<path d="M5 12h14" /><path d="m13 6 6 6-6 6" />',
        'arrow-down' => '<path d="M12 5v14" /><path d="m6 13 6 6 6-6" />',
        'arrow-up-right' => '<path d="M7 17 17 7" /><path d="M8 7h9v9" />',
        'plus' => '<path d="M12 5v14" /><path d="M5 12h14" />',
        'expand' => '<path d="M14 4h6v6M10 20H4v-6M20 4l-6 6M4 20l6-6" />',
        'close' => '<path d="m6 6 12 12M6 18 18 6" />',
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
    {!! $icons[$name] ?? $icons['home'] !!}
</svg>
