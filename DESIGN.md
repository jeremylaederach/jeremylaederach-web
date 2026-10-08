# Design

This file describes what the code does. It changes in the same commit as the code; it holds no
plans and no taste rules. Working rules are in `AGENTS.md`, the current state in `docs/handoff.md`.

## Part 1: Craft standard

- **Tokens first.** Colors, the shell width and the two easing curves are custom properties in
  `resources/css/foundation.css`. Components use them instead of literals; a tint is built from the
  `-rgb` companion of a color (`rgba(var(--accent-rgb), 0.16)`).
- **Layers.** Stylesheets are layered (`base`, `components`), one file per page in
  `resources/css/pages`. `responsive.css` is unlayered and ordered by breakpoint (1280, 960, 720,
  420, 380 and 340px wide, plus a block for desktop windows up to 780px high), so its rules
  override the component styles.
- **Input.** Hover effects apply only under `.has-mouse-input`, which the interaction controller
  sets from the pointer type of the last event. Every hover state has a `:focus-visible`
  counterpart. Touch gets the resting state.
- **Motion.** Timing belongs to CSS. Under `prefers-reduced-motion` transitions and animations
  collapse to 1ms, page navigation skips the cover, and canvas animation draws one still frame.
- **Stability.** Pages reveal with opacity and transform only, and animated regions keep their
  size, so nothing shifts the layout after the first paint.
- **Performance.** No third-party scripts, fonts or embeds (the exported CSP allows `'self'`
  only). One variable font file. Canvas work stops while it is off screen or the tab is hidden.

## Part 2: This site

### Identity

- **Mark.** The cat, in mint since 8 October 2026, as favicon, app icons, link preview and in the
  footer. The header carries no mark: on the sub-pages it shows the name as the link home, on the
  home page nothing, because the large name is the brand there and the sphere forms the mark.
- **Header controls.** The languages and the sound toggle are boxes of the same size without
  borders, the current language and a hovered control in the accent.
- **Colors.** Background `#07070a`, ink `#f4f1ea`, muted text `#aaa6af`, hairlines at 13% ink.
  The home page's accent is mint `#7df0c9`, the color of the mark and the sphere. The sub-pages
  each have their own: pastel blue `#7ec8ff` for projects, lavender `#a978ff` for about, coral
  `#ff8eaa` for contact; the home page does not use them. The body class `route-*` sets
  `--route-accent` for the page. The footer sets it to mint on every page.
- **Type.** Instrument Sans, self-hosted, weights 400 to 700. Display sizes are set at weight 430
  with a line height of 0.94.
- **Interaction system.** A pointer made of a dot and a ring that wraps small controls, in the
  accent of what it points at and without glow; page transitions that grow from the clicked
  element; optional interface sounds. No surface lights up under the pointer: a hovered link or
  card answers with its accent, a rule drawn in the accent or a small movement.

### Home page

The home page is one screen. From 961px it is a stage: the name on two lines, the summary and a
compact list of the three destinations keep to a column on the left, and the right belongs to the
sphere. The list is the navigation there, so the header shows only the languages and the sound
toggle. The destinations stand side by side under one rule, each a number, a title and a line of
description; hovered or focused, a destination turns mint, draws its part of the rule in mint and
dims the others. The name is set large on two lines without animation, as an outline that fills with mint under
the pointer. Text on the home page cannot be selected, because a held press moves the sphere. The sphere is its main feedback, so there are no arrows, no glow
and no color per destination. Up to 960px the earlier layout of full-width rows remains and is not
worked out for the sphere yet.

A sphere of 1200 dots (`resources/js/dot-orb-controller.js`, `resources/css/orb.css`) is the main
element: a generative particle animation on a 2D canvas that covers the section and sits behind
the text.

- **Idle motion.** The dots sit on a Fibonacci lattice. The sphere turns once in 52 seconds, bulges
  in slow overlapping waves and wanders around the middle of the stage. A mask dims the canvas to
  25% behind the text column, so the dots never compete with the text.
- **Pointer.** The sphere leans towards the pointer, and dots within reach of it give way.
  A click sends a ring outwards through the dots from where it happened; several rings travel at
  once. A held press gathers the dots around the pointer and lets go with a stronger ring.
- **Buds.** Like a lava lamp it sheds buds: a quarter of the dots is the core and always stays;
  the other three quarters each leave on their own slow cycle (41, 53 and 67 seconds), form a
  smaller sphere of their own size beside the main one, rise and sink over the height of the
  canvas and return. The main sphere shrinks by what has left.
- **Color.** The dots take the page accent, lighter towards the viewer in eight steps and fading
  with depth. There is no glow, so the far side stays readable.
- **Figures.** Hovering or focusing an element that names a figure (`data-dot-orb-figure`) morphs
  every dot into that shape within about a quarter of a second, and leaving releases them into the
  sphere again. A figure has volume: it is inflated from its outline, thickest in the middle, with
  dots on its front and its back, and it sways from side to side and leans with the pointer. Each destination has its own: a window for projects, a head and shoulders
  for about, an envelope for contact (`resources/js/dot-orb-figures.js`, drawn with canvas paths).
  The name and the mark in the header give the mark itself, sampled from its image with the eyes
  left open. Moving from one element to the next, the dots glide from shape to shape.
- **Timing.** Every value eases towards its target independently of the frame rate, on the
  sphere's own clock, which pauses while the canvas is off screen or the tab is hidden.
- **Size.** The sphere's box follows the canvas: its height or 70% of its width, at most 1040px.
  Up to 720px wide the canvas is shown at 60% opacity without the mask.
- **Sub-pages.** The projects, about and contact pages show the same sphere behind their page
  hero, in the page's accent and without figures. A case study shows it in the project's color
  behind the gallery of its hero. On the 404 page it stands behind the large number, moved to the
  left from 721px. The legal pages have no sphere.
- **Fallbacks.** Touch input never morphs it. Under reduced motion it is one still
  sphere.

### Footer

Every page except the home page ends with the footer, in mint whatever the page's accent: the mark
with the name as the link home, the three destinations and a link back to the top. The destinations
repeat the home page's list: a number and a title under the footer's rule; hovered or focused, a
destination turns mint, draws its part of the rule in mint and dims the others. Below a second rule
stand the year, the profiles and the legal pages. Every link is at least 44px tall.
