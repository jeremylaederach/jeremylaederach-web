{{--
    Text in which certain words name a figure for the dot sphere: hovering them morphs the sphere
    into it, while at rest they look like the text around them. `figures` lists those words with
    their figure (see dot-orb-figures.js) and, for the color of a project, its slug:
    [['words' => ..., 'figure' => ..., 'project' => ...], ...].
--}}
@props([
    'text',
    'figures' => [],
])

@php
    // Longer words come first, so words that contain other ones are matched whole.
    $entryOf = collect($figures)
        ->keyBy(fn (array $entry): string => e($entry['words']))
        ->sortKeysUsing(fn (string $first, string $second): int => strlen($second) <=> strlen($first));
    $pattern = '/'.$entryOf->keys()->map(fn (string $words): string => preg_quote($words, '/'))->implode('|').'/u';
    $word = function (array $match) use ($entryOf): string {
        $entry = $entryOf[$match[0]];
        $project = isset($entry['project']) ? ' data-project="'.e($entry['project']).'"' : '';

        return '<span class="figure-word" data-dot-orb-figure="'.e($entry['figure']).'"'.$project.'>'.$match[0].'</span>';
    };
    $html = $entryOf->isEmpty() ? e($text) : preg_replace_callback($pattern, $word, e($text));
@endphp

{!! $html !!}
