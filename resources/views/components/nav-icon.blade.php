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
