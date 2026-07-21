@props([
    'copy',
    'label',
    'view' => 'overview',
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
            @foreach ($copy['navigation'] as $route => $item)
                <span @class(['is-active' => $route === $view])>{{ $item }}</span>
            @endforeach
        </span>

        <span class="client-hub-visual__customer">
            <b>{{ $copy['customer']['initials'] }}</b>
            <span>{{ $copy['customer']['name'] }}<small>{{ $copy['customer']['company'] }}</small></span>
        </span>
    </aside>

    <section @class([
        'client-hub-visual__workspace',
        'client-hub-visual__workspace--board' => $view === 'board',
    ])>
        @if ($view === 'board')
            <span class="client-hub-visual__board-head">
                <span>
                    <small>{{ $copy['board']['reference'] }}</small>
                    <strong>{{ $copy['board']['heading'] }}</strong>
                    <em>{{ $copy['board']['body'] }}</em>
                </span>
                <b>{{ $copy['board']['status'] }}</b>
            </span>

            <span class="client-hub-visual__board-columns">
                @foreach ($copy['board']['columns'] as $column)
                    <span>
                        <i @class(['is-current' => $column['current'] ?? false])></i>
                        <strong>{{ $column['label'] }}</strong>
                        <small>{{ $column['state'] }}</small>
                    </span>
                @endforeach
            </span>

            <span class="client-hub-visual__ticket">
                <small>{{ $copy['board']['ticket_label'] }}</small>
                <strong>{{ $copy['board']['ticket'] }}</strong>
            </span>
        @else
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
        @endif
    </section>
</div>
