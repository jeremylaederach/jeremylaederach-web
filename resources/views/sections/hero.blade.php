@php
    $stageHrefs = [
        'work' => config('portfolio.socials.github.url'),
        'about' => route('home', ['locale' => $locale]).'#stage-about',
        'stack' => route('home', ['locale' => $locale]).'#stage-stack',
        'contact' => config('portfolio.socials.email.url'),
    ];
@endphp

<section class="loaf-stage" data-cat-stage>
    <div class="loaf-stage__word" aria-hidden="true">
        @foreach ($content['hero']['backdrop'] as $word)
            <span>{{ $word }}</span>
        @endforeach
    </div>

    <div class="loaf-stage__scene" aria-label="{{ $content['ui']['menu'] }}">
        @foreach ($content['hero']['stage'] as $prop)
            @php($href = $stageHrefs[$prop['key']] ?? '#')
            @php($isExternal = str_starts_with($href, 'http') && ! str_starts_with($href, url('/')))
            <a
                id="stage-{{ $prop['key'] }}"
                class="stage-prop stage-prop--{{ $prop['key'] }}"
                href="{{ $href }}"
                @if ($isExternal) rel="noreferrer" @endif
                data-cat-message="{{ $prop['message'] }}"
            >
                <span>{{ $prop['label'] }}</span>
            </a>
        @endforeach

        <div class="loaf-stage__bubble" aria-live="polite" data-cat-bubble>
            {{ $content['hero']['bubble'] }}
        </div>

        <x-cat-loaf-character class="loaf-stage__cat" data-cat-character />
        <div class="loaf-stage__floor"></div>
    </div>
</section>
