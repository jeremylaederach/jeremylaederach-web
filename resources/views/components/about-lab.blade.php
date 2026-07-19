<section class="about-lab" aria-labelledby="lab-title" data-reveal>
    <header class="about-section-heading">
        <p class="section-label about-section-label">
            <span>04</span>
            <span aria-hidden="true">/</span>
            <span>{{ $content['about_page']['lab_label'] }}</span>
        </p>
        <div class="about-section-heading__content">
            <h2 id="lab-title">{{ $content['about_page']['lab_heading'] }}</h2>
            <p>{{ $content['about_page']['lab_intro'] }}</p>
        </div>
    </header>

    <div class="about-lab__shell" data-about-lab>
        <header class="about-lab__toolbar">
            <span class="about-lab__file">
                <i aria-hidden="true"></i>
                {{ $content['about_page']['lab_file'] }}
            </span>
            <span class="about-lab__status">
                <i aria-hidden="true"></i>
                {{ $content['about_page']['lab_status'] }}
            </span>
        </header>

        <div class="about-lab__tabs" role="tablist" aria-label="{{ $content['about_page']['lab_label'] }}">
            @foreach ($content['about_page']['lab_demos'] as $demo)
                <button
                    id="lab-tab-{{ $demo['key'] }}"
                    type="button"
                    role="tab"
                    aria-controls="lab-panel-{{ $demo['key'] }}"
                    aria-selected="{{ $loop->first ? 'true' : 'false' }}"
                    tabindex="{{ $loop->first ? '0' : '-1' }}"
                    data-lab-tab="{{ $demo['key'] }}"
                    data-interface-sound
                    data-sound-tone="control"
                >
                    <small>0{{ $loop->iteration }}</small>
                    <span>{{ $demo['label'] }}</span>
                </button>
            @endforeach
        </div>

        <div class="about-lab__panels">
            @foreach ($content['about_page']['lab_demos'] as $demo)
                <article
                    id="lab-panel-{{ $demo['key'] }}"
                    class="about-lab__panel"
                    role="tabpanel"
                    aria-labelledby="lab-tab-{{ $demo['key'] }}"
                    data-lab-panel="{{ $demo['key'] }}"
                    @if (! $loop->first) hidden @endif
                >
                    <header class="about-lab__copy">
                        <span>{{ $demo['file'] }}</span>
                        <h3>{{ $demo['title'] }}</h3>
                        <p>{{ $demo['body'] }}</p>
                    </header>

                    <div class="about-lab__stage about-lab__stage--{{ $demo['key'] }}">
                        @switch($demo['key'])
                            @case('backend')
                                <pre class="about-lab__snippet" aria-hidden="true"><code><b>for</b> (var pass = 0; pass &lt; values.Length; pass++)
    <b>if</b> (values[i] &gt; values[i + 1])
        Swap(values, i, i + 1);</code></pre>
                                <div class="about-lab__sorter" data-lab-sorter aria-hidden="true">
                                    @foreach ([62, 28, 86, 44, 70, 36] as $value)
                                        <span data-sort-value="{{ $value }}" style="--sort-value: {{ $value }}">
                                            <i>{{ $value }}</i>
                                        </span>
                                    @endforeach
                                </div>
                                @break

                            @case('interfaces')
                                <div
                                    class="about-lab__layout"
                                    data-lab-layout
                                    data-layout-index="0"
                                    data-layout-states="{{ implode('|', $demo['states']) }}"
                                    aria-hidden="true"
                                >
                                    <header><i></i><i></i><i></i></header>
                                    <aside><span></span><span></span><span></span></aside>
                                    <main>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </main>
                                </div>
                                @break

                            @case('data')
                                <div class="about-lab__query" data-lab-query aria-hidden="true">
                                    <div class="about-lab__rows">
                                        <span><i>09:00</i><b>Work</b><em>90m</em></span>
                                        <span><i>11:00</i><b>Focus</b><em>60m</em></span>
                                        <span><i>14:00</i><b>Work</b><em>45m</em></span>
                                        <span><i>17:30</i><b>Health</b><em>50m</em></span>
                                        <span><i>20:00</i><b>Focus</b><em>30m</em></span>
                                    </div>
                                    <span class="about-lab__query-arrow">→</span>
                                    <div class="about-lab__groups">
                                        <span style="--group-size: 100%"><b>Work</b><em>135m</em></span>
                                        <span style="--group-size: 67%"><b>Focus</b><em>90m</em></span>
                                        <span style="--group-size: 37%"><b>Health</b><em>50m</em></span>
                                    </div>
                                </div>
                                @break

                            @case('delivery')
                                <div
                                    class="about-lab__pipeline"
                                    data-lab-pipeline
                                    data-complete-label="{{ $demo['complete'] }}"
                                    aria-hidden="true"
                                >
                                    @foreach (['test', 'build', 'export', 'ready'] as $step)
                                        <span data-pipeline-step>
                                            <i></i>
                                            <b>{{ $step }}</b>
                                        </span>
                                    @endforeach
                                </div>
                                @break
                        @endswitch
                    </div>

                    <footer class="about-lab__footer">
                        <span>
                            <small>{{ $demo['output_label'] }}</small>
                            <strong data-lab-output aria-live="polite">
                                @switch($demo['key'])
                                    @case('interfaces')
                                        {{ $demo['states'][0] }}
                                        @break
                                    @case('data')
                                        5 → 3
                                        @break
                                    @case('delivery')
                                        —
                                        @break
                                    @default
                                        0
                                @endswitch
                            </strong>
                        </span>
                        <button
                            type="button"
                            data-lab-action="{{ $demo['key'] }}"
                            data-interface-sound
                            data-sound-tone="action"
                        >
                            <span>{{ $demo['action'] }}</span>
                            <i aria-hidden="true">↻</i>
                        </button>
                    </footer>
                </article>
            @endforeach
        </div>
    </div>
</section>
