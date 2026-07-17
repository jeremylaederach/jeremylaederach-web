@props([
    'class' => '',
    'size' => '1024',
    'alt' => '',
])

@php
    $imageAttributes = [
        'class' => $class,
        'src' => asset('brand/cats/main/cat-loaf-classic-256.png'),
        'alt' => $alt,
        'width' => $size,
        'height' => $size,
        'decoding' => 'async',
    ];

    if ($alt === '') {
        $imageAttributes['aria-hidden'] = 'true';
    }
@endphp

<img
    {{ $attributes->merge($imageAttributes) }}
>
