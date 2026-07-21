@props(['groups'])

<ul {{ $attributes->class('technology-groups') }}>
    @foreach ($groups as $group)
        <li
            class="technology-group"
            style="--technology-color: {{ $group['color'] }}"
            data-pointer-surface
        >
            <div class="technology-group__visual" aria-hidden="true">
                <span
                    class="technology-group__mark"
                    data-technology-icon="{{ $group['icon'] }}"
                >
                    <span>{{ $group['fallback'] }}</span>
                </span>
                <i></i>
                <i></i>
            </div>

            <div class="technology-group__copy">
                <span class="technology-group__index">0{{ $loop->iteration }}</span>
                <h3>{{ $group['title'] }}</h3>
                <p>{{ $group['body'] }}</p>
            </div>

            <ul class="technology-group__tools" aria-label="{{ $group['title'] }}">
                @foreach ($group['tools'] as $tool)
                    <li>{{ $tool }}</li>
                @endforeach
            </ul>
        </li>
    @endforeach
</ul>
