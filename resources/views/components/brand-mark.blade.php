{{-- The mark as it is drawn in public/brand/mark.svg; the stylesheet gives its gradient the page's accent. --}}
<span {{ $attributes->class('brand-mark') }} aria-hidden="true">{!! file_get_contents(public_path('brand/mark.svg')) !!}</span>
