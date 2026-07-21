@props([
    'view',
    'label',
])

@php
    $navigation = [
        'home' => 'Home',
        'calendar' => 'QCalendar',
        'finances' => 'QFinances',
        'coding' => 'Coding',
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
                @if ($view === 'home')
                    Local workspace
                @elseif ($view === 'calendar')
                    Calendar timeline
                @else
                    Finance workspace
                @endif
            </span>
            <small><i></i>Data connected</small>
        </header>

        @if ($view === 'home')
            <div class="quantified-app__home">
                <header>
                    <span><small>Home</small><strong>Your data, one local workspace.</strong></span>
                    <em>July 2026</em>
                </header>

                <div class="quantified-app__home-metrics">
                    <span>
                        <small>Calendar</small>
                        <strong>42h 30m</strong>
                        <em>38 tracked events</em>
                    </span>
                    <span>
                        <small>Finance</small>
                        <strong>CHF 8,420</strong>
                        <em>36 transactions</em>
                    </span>
                    <span>
                        <small>Coding</small>
                        <strong>04 repos</strong>
                        <em>Local status</em>
                    </span>
                </div>

                <div class="quantified-app__home-context">
                    @foreach ([
                        ['Health', '12h', 54],
                        ['Business', '18h', 78],
                        ['Social', '7h', 34],
                    ] as [$area, $value, $width])
                        <span>
                            <small>{{ $area }}</small>
                            <i><b style="--context-width: {{ $width }}%"></b></i>
                            <em>{{ $value }}</em>
                        </span>
                    @endforeach
                </div>
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
