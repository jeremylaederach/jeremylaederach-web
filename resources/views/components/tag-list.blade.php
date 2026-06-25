@props([
    'items',
    'label' => null,
])

<ul {{ $attributes->class('tag-list') }} @if ($label) aria-label="{{ $label }}" @endif>
    @foreach ($items as $item)
        <li>{{ $item }}</li>
    @endforeach
</ul>
