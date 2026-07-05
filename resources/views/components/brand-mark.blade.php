@props([
    'class' => '',
    'size' => '1024',
    'variant' => 'cat-loaf',
    'alt' => '',
])

@php
    $variants = [
        'cat-loaf' => 'brand/cats/main/cat-loaf-main.png',
        'cat-loaf-main' => 'brand/cats/main/cat-loaf-main.png',
        'cat-loaf-classic' => 'brand/cats/main/cat-loaf-classic.png',
        'cat-loaf-legs' => 'brand/cats/main/cat-loaf-main.png',
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
