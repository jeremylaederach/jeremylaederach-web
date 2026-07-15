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
        <img src="{{ asset('assets/work/quantified-mark.png') }}" alt="" width="33" height="36">
        <span>Quantified</span>
        <span>Overview</span>
    </div>

    <div class="quantified-visual__metrics">
        @foreach ($copy as $metric)
            <div>
                <span>{{ $metric['label'] }}</span>
                <strong>{{ $metric['value'] }}</strong>
            </div>
        @endforeach
    </div>

    <div class="quantified-visual__chart" aria-hidden="true">
        @foreach ([38, 55, 44, 71, 63, 82, 76, 92, 68, 88] as $height)
            <span style="--bar-height: {{ $height }}%"></span>
        @endforeach
    </div>
</div>
