@props([
    'copy',
    'label',
    'expanded' => false,
])

<div
    {{ $attributes->class([
        'project-visual',
        'quantified-visual',
        'quantified-visual--expanded' => $expanded,
    ]) }}
    role="img"
    aria-label="{{ $label }}"
>
    <div class="quantified-visual__topbar">
        <span class="quantified-visual__lockup">
            <img src="{{ asset('assets/work/quantified-mark.png') }}" alt="" width="36" height="36">
            <strong>Quantified</strong>
        </span>
        <span class="quantified-visual__status"><i></i>{{ $copy['status'] }}</span>
    </div>

    <div class="quantified-visual__stage">
        <span class="quantified-visual__avatar">
            <img src="{{ asset('assets/work/quantified-mark.png') }}" alt="" width="48" height="48">
        </span>

        <div class="quantified-visual__copy">
            <span>{{ $copy['eyebrow'] }}</span>
            <strong>{{ $copy['heading'] }}</strong>
            <p>{{ $copy['body'] }}</p>
        </div>

        <div class="quantified-visual__questions">
            @foreach ($copy['questions'] as $question)
                <span>{{ $question }}</span>
            @endforeach
        </div>
    </div>

    <div class="quantified-visual__composer">
        <span>{{ $copy['composer'] }}</span>
        <small><i></i>5 life areas ready</small>
        <b>&uarr;</b>
    </div>
</div>
