@props([
    'view',
    'label',
])

<div
    {{ $attributes->class([
        'sessiondeck-app',
        'sessiondeck-app--'.$view,
    ]) }}
    role="img"
    aria-label="{{ $label }}"
>
    <header class="sessiondeck-app__header">
        <span class="sessiondeck-app__brand">
            <i aria-hidden="true">SD</i>
            <span><strong>SessionDeck</strong><small>One action. Complete workspace.</small></span>
        </span>
        <span class="sessiondeck-app__status"><i></i>Profiles ready</span>
    </header>

    <div class="sessiondeck-app__body">
        <aside class="sessiondeck-app__profiles">
            <header><span>Session profiles</span><b>+</b></header>
            <span class="is-active"><strong>Quantified development</strong><small>4 launch items</small></span>
            <span><strong>Laravel workspace</strong><small>3 launch items</small></span>
            <span><strong>Focus session</strong><small>2 launch items</small></span>
        </aside>

        @if ($view === 'overview')
            <section class="sessiondeck-app__overview">
                <span class="sessiondeck-app__eyebrow">Selected profile</span>
                <h3>Quantified development</h3>
                <p>Applications, commands, URLs, and folders start from top to bottom.</p>

                <div class="sessiondeck-app__summary">
                    <span><small>Apps</small><strong>02</strong></span>
                    <span><small>Commands</small><strong>01</strong></span>
                    <span><small>URLs</small><strong>01</strong></span>
                </div>

                <span class="sessiondeck-app__primary">Start session <b>&rarr;</b></span>
            </section>
        @elseif ($view === 'editor')
            <section class="sessiondeck-app__editor">
                <header>
                    <span><small>Profile name</small><strong>Quantified development</strong></span>
                    <em>Order matters</em>
                </header>

                <div class="sessiondeck-app__launch-items">
                    @foreach ([
                        ['01', 'Visual Studio Code', 'Application', 'Ready'],
                        ['02', 'ASP.NET Core API', 'Command', 'Ready'],
                        ['03', 'Angular workspace', 'Command', 'Ready'],
                        ['04', 'Project board', 'URL', 'Ready'],
                    ] as [$index, $name, $type, $state])
                        <span>
                            <b>{{ $index }}</b>
                            <i><strong>{{ $name }}</strong><small>{{ $type }}</small></i>
                            <em>{{ $state }}</em>
                        </span>
                    @endforeach
                </div>
            </section>
        @else
            <section class="sessiondeck-app__result">
                <header>
                    <span><small>Session complete</small><strong>4 of 4 items started</strong></span>
                    <em>00:06</em>
                </header>

                <div class="sessiondeck-app__results">
                    @foreach ([
                        ['Visual Studio Code', 'Started', 'Process 18440'],
                        ['ASP.NET Core API', 'Started', 'Process 20916'],
                        ['Angular workspace', 'Started', 'Process 22108'],
                        ['Project board', 'Opened', 'Shell handled'],
                    ] as [$name, $state, $meta])
                        <span>
                            <i></i>
                            <strong>{{ $name }}</strong>
                            <small>{{ $meta }}</small>
                            <em>{{ $state }}</em>
                        </span>
                    @endforeach
                </div>

                <span class="sessiondeck-app__secondary">Stop tracked processes</span>
            </section>
        @endif
    </div>
</div>
