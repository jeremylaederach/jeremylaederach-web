@props([
    'content',
    'locale',
])

<a
    {{ $attributes->class(['page-cta', 'page-cta--contact']) }}
    href="{{ route('contact', ['locale' => $locale]) }}"
    data-route="contact"
    data-route-transition
    data-interface-sound
    data-sound-tone="panel"
    data-reveal
>
    <span>{{ $content['contact_page']['eyebrow'] }}</span>
    <strong>{{ $content['contact_page']['heading'] }}</strong>
    <x-nav-icon name="arrow-right" />
</a>
