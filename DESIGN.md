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
  the link home at the left of the header. In the header it is cut out of the page's accent with
  its image as the mask (`resources/views/components/brand-mark.blade.php`), lighter at the top
  left and deeper at the bottom right as in the image, so it takes a project's color with the
  rest of the header. It is 38px large; hovered or focused it grows a little.
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
  second; a larger control asks for it with `data-pointer-wrap`, and the ring then lies still on
  its edges and follows them when the control changes its size. Over any control the dot grows and
  both take the accent that applies to that control
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
  pages, each link at least 44px tall. The main region leaves room for it, so a short page and
  the line fill one screen. The home page, one screen from 961px, ends without it there.

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
- **Words that name a figure.** Words of a text can name a figure
  (`resources/views/components/figure-text.blade.php`, `.figure-word`); the content lists them
  beside the text. Hovered, they light up in the color of their figure, the accent unless they
  or their row name another. In a text those words are set letter by letter, and the light of
  the page headings runs through them every three seconds, from the first of their letters to
  the last, so the text shows which of its words answer. In the statement of the home page the
  three kinds of work give the bars of Quantified, the brackets of Jay-Jay and four panes, the
  backend gives a database, the interface the arrow of a pointer, and the name gives the mark;
  everything stays in the accent.
- **Place.** On a canvas that is not fitted the sphere wanders around a point at 68% of the
  canvas' width and half its height. The element it rests with can name another share of the
  width (`--dot-orb-x`): the sphere glides there in about a second, keeps level with the middle
  of that element while the page scrolls and wanders much less.
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
- **Sub-pages.** The about page is told in chapters beside the sphere (see "About"). A case
  study shows it in the project's color behind the gallery of its hero. The 404 page is a stage
  for it (see "404 and legal pages"). The legal pages have no sphere.
- **Page change.** When a navigation starts the dots scatter away from the middle of the sphere
  and fade; the sphere of the next page gathers from the scattered state.
- **Fallbacks.** Touch input never morphs it. Under reduced motion it is one still
  sphere.

### Stage list: projects overview and contact

Both pages are one component (`resources/views/components/stage-list.blade.php`,
`resources/css/stage-list.css`, `resources/js/stage-list-controller.js`): a heading with the
introduction on one line, a list of large rows and the sphere. Hairlines separate the rows. One
row is always current, the first at the start and after that the one last hovered or focused. The
current one stands in full ink and shows an icon, the others recede, and the pointer's ring lies
on the edges of a hovered row. Each row is one link.

From 961px the section and the line that ends the page fill one screen. The right belongs to a
square as high as the stage and at most five of the twelve columns wide, flush with the right
edge: it holds the sphere, which rests in the current row's figure. The list keeps to the left.
Every row has one height; a row with a description is taller by a slot of 164px while it is
current and shows the description there, inside the ring. The slot opens and closes in 0.52
seconds, and one row gives exactly the height the other takes: the list keeps its size, and a row
that becomes current keeps one edge in place and moves the other outwards, so it never slips from
under the pointer. The slot holds three lines of description; longer text is cut with an
ellipsis. A mirrored stage (`stage-list--mirrored`) swaps the sides: the square stands flush with
the left edge, and the list keeps to the right. A compact stage (`stage-list--compact`) has lower
rows whose names stand a step below the heading, for plain entries. There the figure is the
larger part: the square takes what the header and the page end leave of the height, up to 52% of
the width, and the content and the square both stand in the middle of the stage's height; the
current row's name takes the accent like its icon. Up to 960px the rows follow each other with their
texts, and the sphere stays behind the page.

- **Projects overview.** The rows are the projects marked as featured in the content, Quantified
  and Jay-Jay; a project without the mark keeps its case study and its place in the sequence of
  case studies. A row brings its project's color, which is then the accent of the page, and its
  figure: the bars of a chart for Quantified, the brackets of a tag for Jay-Jay. The current row
  holds the project's kind, description and technologies. The overview carries no
  screenshots; those belong to the case studies.
- **Contact.** The stage is mirrored and compact, the sphere on the left and the heading as the
  largest text. The rows are the channels, each
  with its address at the end of the row: an envelope for email, GitHub's mark for GitHub, a head
  and shoulders for LinkedIn. Below the list stands a note on what to write.

### About

The about page is told in two chapters beside the sphere (`resources/views/pages/about.blade.php`,
`resources/css/pages/about.css`, `resources/js/chapter-controller.js`): the opening with the
heading and the introduction, and the technologies. It stays light, the figure the larger part.

- **Chapters.** The sphere's canvas covers the window and stays there while the chapters scroll
  over it. The chapter that crosses the middle of the window is the current one: the sphere rests
  in its figure and keeps level with it, so it scrolls with its chapter like a picture beside the
  text. From 961px the opening fills the first window with the heading left of the sphere and the
  introduction right of it; the technologies keep to a column of at most 560px on the left, the
  sphere at 72% of the width, where it glides in about a second. A chapter is at least as high
  as a figure.
- **Figures.** The opening gives a head and shoulders, the technologies three layers. A chapter
  names its figure only for the time it is current; hovering its text changes nothing.
- **Technologies.** Four rows between hairlines, each the name of a group and its tools. Every
  name answers a hover: a group morphs the sphere into its mark in its color (.NET, Laravel,
  Angular, PostgreSQL), and so does a tool with a mark of its own (TypeScript, Tailwind CSS,
  Vite, GitHub Actions, Google, four panes for WinUI); the other tools show their group's. The
  paths come from the `simple-icons` package, as GitHub's does; the content lists which tool has
  which mark (`technology_marks`).
- **Fallbacks.** Up to 960px the chapters follow each other across the whole width, and the
  sphere stands in the middle behind them at 30% opacity. Under reduced motion it is one still
  sphere that stays with the opening.

### 404 and legal pages

- **404.** A stage (`resources/views/errors/404.blade.php`, `resources/css/pages/not-found.css`):
  the heading, one sentence and the link home on the left, and on the right a square as high as
  the stage and at most 46% of its width. The sphere rests there in the figure of the number,
  404 in tall, narrow numerals, on a fitted canvas. From 961px the page and the line that ends
  it fill one screen; up to 960px the square stands above the message, at most 42% of the
  window's height.
- **Legal notice and privacy notice.** Text only (`resources/views/pages/legal.blade.php`,
  `resources/css/pages/legal.css`): the title, the introduction and, on the privacy notice, the
  date; then one row between hairlines for every section. From 961px the titles of the sections
  stand in a column on the left and their text in one on the right, where the introduction
  begins too. Up to 960px title and text follow each other. A link in the text is underlined in
  the accent and at least 44px tall.
