{{--
    Text in which certain words name a figure for the dot sphere: hovering them morphs the sphere
    into it. `figures` lists those words with their figure (see dot-orb-figures.js):
    [['words' => ..., 'figure' => ...], ...].

    Those words are set letter by letter, each with its place among their letters, so a light can
    run through them. Assistive technology reads the plain text instead.
--}}
@props([
    'text',
    'figures' => [],
])

@php
    // Longer words come first, so words that contain other ones are matched whole.
    $figureOf = collect($figures)
        ->pluck('figure', 'words')
        ->sortKeysUsing(fn (string $first, string $second): int => strlen($second) <=> strlen($first));
    $pattern = '/('.$figureOf->keys()->map(fn (string $words): string => preg_quote($words, '/'))->implode('|').')/u';
    $parts = $figureOf->isEmpty() ? [$text] : preg_split($pattern, $text, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
    $place = 0;

    // Built as one string, so no space of the template comes between a word and its comma.
    $html = collect($parts)->map(function (string $part) use ($figureOf, &$place): string {
        if (! $figureOf->has($part)) {
            return e($part);
        }

        $letters = collect(mb_str_split($part))
            ->map(function (string $letter) use (&$place): string {
                return $letter === ' '
                    ? ' '
                    : '<span class="figure-word__letter" style="--letter-index: '.$place++.'">'.e($letter).'</span>';
            })
            ->implode('');

        return '<span class="figure-word" data-dot-orb-figure="'.e($figureOf[$part]).'">'.$letters.'</span>';
    })->implode('');
@endphp

<span class="figure-text"><span class="sr-only">{{ $text }}</span><span aria-hidden="true">{!! $html !!}</span></span>
