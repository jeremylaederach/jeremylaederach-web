@props([
    'class' => '',
])

<svg
    {{ $attributes->merge([
        'class' => trim('cat-loaf-character '.$class),
        'viewBox' => '0 0 360 260',
        'role' => 'img',
        'aria-label' => 'Purple cat loaf mascot',
    ]) }}
>
    <defs>
        <linearGradient id="catLoafGradient" x1="72" x2="282" y1="40" y2="236" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F07BFF" />
            <stop offset="0.58" stop-color="#B56CFF" />
            <stop offset="1" stop-color="#7A42FF" />
        </linearGradient>
    </defs>

    <g class="cat-loaf-character__tail">
        <path d="M270 117c35-45 13-86-15-93-17-4-31 14-18 28 29 31 21 55-3 77" />
    </g>

    <g class="cat-loaf-character__body">
        <path d="M70 150c0-31 21-54 45-70 2-28 11-58 25-58 14 0 31 20 43 43 14-2 30-2 44 0 13-24 31-43 45-43s24 31 25 61c22 15 37 37 37 67 0 48-38 76-91 76H160c-53 0-90-28-90-76z" />
    </g>

    <g class="cat-loaf-character__face">
        <rect x="135" y="128" width="17" height="45" rx="9" />
        <rect x="213" y="128" width="17" height="45" rx="9" />
        <path class="cat-loaf-character__blink cat-loaf-character__blink--left" d="M132 151h24" />
        <path class="cat-loaf-character__blink cat-loaf-character__blink--right" d="M210 151h24" />
        <path class="cat-loaf-character__mouth" d="M172 178c10 12 24 12 34 0" />
    </g>

    <g class="cat-loaf-character__paw">
        <path d="M92 149c-36 4-49 27-40 44 9 18 38 16 55-6" />
        <circle cx="45" cy="180" r="8" />
        <circle cx="61" cy="165" r="8" />
        <circle cx="78" cy="162" r="8" />
        <path d="M57 192c9-20 34-18 39 2" />
    </g>
</svg>
