@props([
    'copy',
    'label',
])

<div
    {{ $attributes->class('project-visual client-hub-visual') }}
    role="img"
    aria-label="{{ $label }}"
>
    <aside class="client-hub-visual__sidebar">
        <span class="client-hub-visual__brand">
            <img src="{{ asset('assets/work/jay-jay-mark.svg') }}" alt="" width="24" height="28">
            <span><strong>Jay-Jay</strong><small>Client Hub</small></span>
        </span>

        <span class="client-hub-visual__badge"><i></i>{{ $copy['badge'] }}</span>

        <span class="client-hub-visual__navigation">
            @foreach ($copy['navigation'] as $item)
                <span @class(['is-active' => $loop->first])>{{ $item }}</span>
            @endforeach
        </span>

        <span class="client-hub-visual__customer">
            <b>{{ $copy['customer']['initials'] }}</b>
            <span>{{ $copy['customer']['name'] }}<small>{{ $copy['customer']['company'] }}</small></span>
        </span>
    </aside>

    <section class="client-hub-visual__workspace">
        <span class="client-hub-visual__eyebrow">{{ $copy['eyebrow'] }}</span>
        <strong class="client-hub-visual__heading">{{ $copy['heading'] }}</strong>
        <p>{{ $copy['body'] }}</p>

        <span class="client-hub-visual__cards">
            @foreach ($copy['cards'] as $card)
                <span>
                    <small>{{ $card['label'] }}</small>
                    <strong>{{ $card['value'] }}</strong>
                    <em>{{ $card['meta'] }}</em>
                </span>
            @endforeach
        </span>
    </section>
</div>
