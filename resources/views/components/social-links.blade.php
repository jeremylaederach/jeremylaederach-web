@props([
    'large' => false,
])

<div @class(['contact-links', 'contact-links--large' => $large])>
    @foreach (config('portfolio.socials') as $social)
        <a href="{{ $social['url'] }}" @if (str_starts_with($social['url'], 'http')) rel="noopener noreferrer" @endif>
            <span>{{ $social['label'] }}</span>
            <strong>{{ $social['display'] }}</strong>
        </a>
    @endforeach
</div>
