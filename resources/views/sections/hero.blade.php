<section class="hero-section">
    <div class="hero-section__copy reveal">
        <h1>{{ $content['hero']['title'] }}</h1>
        <p class="hero-lede">{{ $content['hero']['lede'] }}</p>
    </div>

    <aside class="hero-visual reveal" aria-label="{{ $content['hero']['proof']['label'] }}">
        <div class="hero-atom">
            <div class="hero-atom__viewport">
                <div class="atom-scene" aria-label="{{ $content['hero']['proof']['orbit_label'] }}">
                    <span class="atom-orbit atom-orbit--outer"></span>
                    <span class="atom-orbit atom-orbit--middle"></span>
                    <span class="atom-orbit atom-orbit--inner"></span>
                    <span class="atom-orbit atom-orbit--dashed"></span>
                    <span class="atom-orbit atom-orbit--core"></span>

                    @foreach (['outer', 'middle', 'inner'] as $track)
                        <div class="atom-track atom-track--{{ $track }}">
                            @foreach (array_filter($content['hero']['proof']['signals'], fn ($signal) => $signal['track'] === $track) as $signal)
                                <div class="atom-chip atom-chip--{{ $signal['class'] }}">
                                    <span class="atom-chip__content">
                                        <span class="atom-chip__signal" aria-hidden="true"></span>
                                        {{ $signal['label'] }}
                                    </span>
                                </div>
                            @endforeach
                        </div>
                    @endforeach
                </div>

                <div class="hero-logo-core">
                    <x-brand-mark class="hero-logo-core__mark" />
                </div>
            </div>
        </div>
    </aside>
</section>
