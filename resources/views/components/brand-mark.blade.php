{{-- The mark as a shape cut out of the page's accent; its drawing supplies the outline. --}}
<span
    {{ $attributes->class('brand-mark') }}
    style="--brand-mark: url('{{ asset('brand/mark.svg') }}')"
    aria-hidden="true"
></span>
