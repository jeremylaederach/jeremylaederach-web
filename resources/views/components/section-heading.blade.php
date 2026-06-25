@props([
    'kicker',
    'title',
    'lead' => null,
    'wide' => false,
])

<div {{ $attributes->class(['section-heading', 'section-heading--wide' => $wide, 'reveal']) }}>
    <p class="eyebrow">{{ $kicker }}</p>
    <h2>{{ $title }}</h2>

    @if ($lead)
        <p>{{ $lead }}</p>
    @endif
</div>
