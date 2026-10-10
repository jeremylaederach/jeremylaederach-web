{{--
    The bead of a link that leads somewhere: one dot in the accent, like those of the sphere.
    Hovered or focused, it draws out the way the link leads.

    to   forward (the default), back, down the page, or out of the site
--}}
@props([
    'to' => 'forward',
])

<span {{ $attributes->class(['link-bead', "link-bead--{$to}"]) }} aria-hidden="true"></span>
