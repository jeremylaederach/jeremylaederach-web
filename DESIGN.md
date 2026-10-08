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
  collapse to 1ms, page navigation swaps without a transition, and canvas animation draws one
  still frame.
- **Stability.** Pages reveal with opacity and transform only, and animated regions keep their
  size, so nothing shifts the layout after the first paint.
- **Performance.** No third-party scripts, fonts or embeds (the exported CSP allows `'self'`
  only). One variable font file. Canvas work stops while it is off screen or the tab is hidden.

## Part 2: This site

### Identity

- **Mark.** The cat, in mint since 8 October 2026, as favicon, app icons and link preview and as
  the link home at the left of the header.
- **Colors.** Background `#07070a`, ink `#f4f1ea`, muted text `#aaa6af`, hairlines at 13% ink.
  One accent, mint `#7df0c9`. Where a project is shown, in its case study or as the current one
  of the projects overview, its color replaces mint as the accent of the whole page, the header
  and the pointer included. A page names the accent it is heading for (`--route-accent-goal`);
  the accent in use (`--route-accent`, `--route-accent-rgb`) blends to it in 0.4 seconds.
- **Type.** Instrument Sans, self-hosted, weights 400 to 700. Display sizes are set at weight 430
  with a line height of 0.94.
- **Header.** The same on every page: the mark as the link home on the left, the three
  destinations in the middle with even gaps, the languages and the sound toggle on the right. The
  destinations behave like the languages: the current one and a hovered or focused one take the
  accent, and the pointer's ring wraps the hovered one. On a page with a sphere a hovered
  destination also morphs it into that destination's figure. Up to 960px a menu button replaces
  the destinations and the languages.
- **Pointer.** A dot at the mouse position and a ring of fine beads around it that travel slowly
  (`resources/js/pointer-controller.js`, `resources/css/pointer.css`). Over a control up to 240
  by 72 pixels the ring leaves the dot and wraps the control, easing there in about a quarter of a
  second; a larger control asks for it with `data-pointer-wrap`, and the ring then lies on its
  edges. Over any control the dot grows and both take the accent that applies to that control
  (`--control-accent-rgb`). Over the dots of a sphere the ring is as large as the opening the
  dots leave around the pointer. A press tightens the ring and shrinks the dot. No glow. Touch
  and pen input hide the pointer, and reduced motion keeps the native cursor.
- **Page change.** The old page fades out as it sinks and the new one fades in as it rises, 0.24
  and 0.46 seconds (`resources/js/transition-controller.js`); the sphere scatters and gathers in
  step, and the accent blends to the new page's. Nothing covers the page. Reduced motion swaps
  the page without a transition.
- **Hover.** No surface lights up under the pointer: a hovered link or card answers with its
  accent, a rule drawn in the accent or a small movement. Optional interface sounds.
- **Page end.** Every page ends with one quiet line in the middle: the profiles and the legal
  pages, each link at least 44px tall. The home page, one screen from 961px, ends without it
  there.

### Home page

The home page is one screen. From 961px it is a stage: the content keeps to a column on the left,
and the right belongs to the sphere. The name stands small above the summary, which is the
statement of the page and its largest text. The header carries the navigation. Text on the home
page cannot be selected, because a held press moves the sphere. Up to 960px the three destinations
follow below as full-width rows, not worked out for the sphere yet.

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
  dots on its front and its back, and it sways from side to side and leans with the pointer. Each
  destination in the header has its own: a window for projects, a head and shoulders for about, an
  envelope for contact (`resources/js/dot-orb-figures.js`, drawn with canvas paths). The name on
  the home page gives the mark itself, sampled from its image with the eyes left open.
  Moving from one element to the next, the dots glide from shape to shape.
- **Timing.** Every value eases towards its target independently of the frame rate, on the
  sphere's own clock, which pauses while the canvas is off screen or the tab is hidden.
- **Size.** The sphere's box follows the canvas: its height or 70% of its width, at most 1040px.
  Up to 720px wide the canvas is shown at 60% opacity without the mask.
- **Resting figure and color.** While nothing that names a figure is hovered or focused, the
  element marked `data-dot-orb-resting` holds its figure. An element can give its figure a color
  with `--dot-orb-rgb`; the dots blend to it and back to the page accent.
- **Fitted canvas.** On a canvas marked `data-dot-orb-fit` the sphere stands still in the middle,
  and a figure, which is drawn within the middle 80% of its square, fills the smaller side of the
  canvas.
- **Sub-pages.** The about and contact pages show the same sphere behind their page hero. A case
  study shows it in the project's color behind the gallery of its hero. On the 404 page it stands
  behind the large number, moved to the left from 721px. The legal pages have no sphere.
- **Page change.** When a navigation starts the dots scatter away from the middle of the sphere
  and fade; the sphere of the next page gathers from the scattered state.
- **Fallbacks.** Touch input never morphs it. Under reduced motion it is one still
  sphere.

### Projects overview

The overview lists the projects marked as featured in the content, Quantified and Jay-Jay; a
project without the mark keeps its case study and its place in the sequence of case studies. From
961px the overview and the line that ends the page fill one screen
(`resources/css/pages/project-index.css`). On the left stand the page heading and the introduction
on one line, below them the projects as a list of large names in rows of one height, and below the
list the current project's kind, description and technologies. One project is always current, the
first at the start and after that the one last hovered or focused
(`resources/js/project-index-controller.js`). The current one stands in full ink and shows an
arrow, the others recede, and the pointer's ring lies on the edges of a hovered row. The right
belongs to a square as high as the stage and at most five of the twelve columns wide, flush with
the right edge: it holds the sphere, which rests in the current project's figure and color, the
bars of a chart for Quantified and the brackets of a tag for Jay-Jay. The rows of the list never
move. Each row is the link to the case study. Up to 960px every
project shows its description under its name, and the sphere stays
behind the page. The overview carries no screenshots; those belong to the case studies.
