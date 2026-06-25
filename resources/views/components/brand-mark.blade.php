@props([
    'class' => '',
    'size' => '1024',
    'variant' => 'cat-loaf',
])

@php
    $variants = [
        'cat-loaf' => 'brand/cats/main/cat-loaf.png',
    ];

    $src = $variants[$variant] ?? $variants['cat-loaf'];
@endphp

<img
    {{ $attributes->merge([
        'class' => $class,
        'src' => asset($src),
        'alt' => '',
        'width' => $size,
        'height' => $size,
        'aria-hidden' => 'true',
        'decoding' => 'async',
    ]) }}
>
