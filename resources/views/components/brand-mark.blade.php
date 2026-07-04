@props([
    'class' => '',
    'size' => '1024',
    'variant' => 'cat-loaf',
    'alt' => '',
])

@php
    $variants = [
        'cat-loaf' => 'brand/cats/main/cat-loaf.png',
    ];

    $src = $variants[$variant] ?? $variants['cat-loaf'];
    $imageAttributes = [
        'class' => $class,
        'src' => asset($src),
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
