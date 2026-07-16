@props([
    'copy',
    'expanded' => false,
    'label',
])

<div
    {{ $attributes->class([
        'project-visual jay-jay-ecosystem',
        'jay-jay-ecosystem--expanded' => $expanded,
    ]) }}
    role="group"
    aria-label="{{ $label }}"
>
    <section class="jay-jay-ecosystem__surface jay-jay-ecosystem__surface--web">
        <header class="jay-jay-ecosystem__surface-header">
            <span>
                <img src="{{ asset('assets/work/jay-jay-mark.svg') }}" alt="" width="18" height="22">
                <strong>{{ $copy['web_label'] }}</strong>
            </span>
            <small><i></i>{{ $copy['web_status'] }}</small>
        </header>

        <div class="jay-jay-ecosystem__web-media">
            <img
                src="{{ asset('assets/work/jay-jay-home.png') }}"
                alt=""
                loading="lazy"
                decoding="async"
            >
        </div>
    </section>

    <section id="client-hub" class="jay-jay-ecosystem__surface jay-jay-ecosystem__surface--hub">
        <header class="jay-jay-ecosystem__surface-header">
            <span>
                <img src="{{ asset('assets/work/jay-jay-mark.svg') }}" alt="" width="18" height="22">
                <strong>{{ $copy['hub_label'] }}</strong>
            </span>
            <small><i></i>{{ $copy['hub_status'] }}</small>
        </header>

        <x-client-hub-preview
            class="jay-jay-ecosystem__hub-preview"
            :copy="$copy['hub']"
            :label="$copy['hub_label']"
        />
    </section>
</div>
