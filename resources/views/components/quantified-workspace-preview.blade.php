@props([
    'view',
    'label',
])

@php
    $navigation = [
        'overview' => 'Overview',
        'calendar' => 'QCalendar',
        'insights' => 'QInsights',
        'finances' => 'QFinances',
        'settings' => 'Settings',
    ];
@endphp

<div
    {{ $attributes->class([
        'quantified-app',
        'quantified-app--'.$view,
    ]) }}
    role="img"
    aria-label="{{ $label }}"
>
    <header class="quantified-app__navigation">
        <span class="quantified-app__brand">
            <img src="{{ asset('assets/work/quantified-mark.png') }}" alt="" width="32" height="32">
            <strong>Quantified</strong>
        </span>

        <span class="quantified-app__links">
            @foreach ($navigation as $route => $name)
                <span @class(['is-active' => $route === $view])>{{ $name }}</span>
            @endforeach
        </span>
    </header>

    <section class="quantified-app__workspace">
        <header class="quantified-app__toolbar">
            <span>
                @if ($view === 'overview')
                    Personal analytics
                @elseif ($view === 'calendar')
                    Calendar timeline
                @else
                    Finance workspace
                @endif
            </span>
            <small><i></i>Data connected</small>
        </header>

        @if ($view === 'overview')
            <div class="quantified-app__overview">
                <span class="quantified-app__eyebrow">Your personal data, connected</span>
                <h3>What would you like to understand?</h3>
                <p>Start with Health or explore a pattern across your life.</p>

                <div class="quantified-app__questions">
                    <span>How has my sleep changed?</span>
                    <span>What needs my attention?</span>
                    <span>How am I spending my time?</span>
                </div>

                <span class="quantified-app__composer">
                    <small>Ask Quantified anything...</small>
                    <i>5 life areas ready</i>
                    <b>&uarr;</b>
                </span>
            </div>
        @elseif ($view === 'calendar')
            <div class="quantified-app__calendar">
                <header>
                    <span><small>QCalendar</small><strong>July overview</strong></span>
                    <em>Week 29</em>
                </header>

                <div class="quantified-app__calendar-metrics">
                    <span><small>Tracked</small><strong>42h 30m</strong></span>
                    <span><small>Events</small><strong>38</strong></span>
                    <span><small>Focus</small><strong>74%</strong></span>
                </div>

                <div class="quantified-app__timeline">
                    @foreach ([
                        ['MON', 'Health', 'Movement and recovery', 68],
                        ['TUE', 'Business', 'Client work', 84],
                        ['WED', 'Productivity', 'Deep work', 76],
                        ['THU', 'Social', 'People and connection', 58],
                    ] as [$day, $area, $event, $width])
                        <span>
                            <small>{{ $day }}</small>
                            <i style="--event-width: {{ $width }}%">
                                <b>{{ $area }}</b>
                                <em>{{ $event }}</em>
                            </i>
                        </span>
                    @endforeach
                </div>
            </div>
        @else
            <div class="quantified-app__finances">
                <header>
                    <span><small>QFinances</small><strong>Financial overview</strong></span>
                    <em>July 2026</em>
                </header>

                <div class="quantified-app__finance-metrics">
                    <span><small>Balance</small><strong>CHF 8,420</strong><em>+8.4%</em></span>
                    <span><small>Income</small><strong>CHF 4,800</strong><em>3 entries</em></span>
                    <span><small>Expenses</small><strong>CHF 2,130</strong><em>18 entries</em></span>
                </div>

                <div class="quantified-app__finance-chart" aria-hidden="true">
                    @foreach ([36, 48, 43, 62, 58, 72, 69, 82, 76, 91, 84, 96] as $height)
                        <i style="--bar-height: {{ $height }}%"></i>
                    @endforeach
                </div>

                <span class="quantified-app__finance-legend">
                    <small>May</small><small>June</small><small>July</small>
                </span>
            </div>
        @endif
    </section>
</div>
