@props([
    'content',
    'locale',
])

<a
    {{ $attributes->class(['page-cta', 'page-cta--contact']) }}
    href="{{ route('contact', ['locale' => $locale]) }}"
    data-route="contact"
    data-route-transition
    data-transition-label="{{ $content['contact_page']['heading'] }}"
    data-interface-sound
    data-sound-tone="panel"
    data-pointer-surface
    data-reveal
>
    <span>{{ $content['contact_page']['eyebrow'] }}</span>
    <strong>{{ $content['contact_page']['heading'] }}</strong>
    <x-nav-icon name="arrow-right" />
</a>
