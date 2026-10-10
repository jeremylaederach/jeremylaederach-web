# Design

This file describes what the code does. It changes in the same commit as the code; it holds no
plans and no taste rules. Working rules are in `AGENTS.md`, the current state in `docs/handoff.md`.

## Part 1: Craft standard

- **Tokens first.** Colors, the shell width and the two easing curves are custom properties in
  `resources/css/foundation.css`. Components use them instead of literals; a tint is built from the
  `-rgb` companion of a color (`rgba(var(--accent-rgb), 0.16)`).
- **Layers.** Stylesheets are layered (`base`, `components`): shared components in
  `resources/css`, what only one kind of page needs in `resources/css/pages`. Every page
  carries its own breakpoints, written from the small window up with the stage starting at
  961px. `responsive.css` is unlayered, so its rules override the layered ones; it holds what is
  left of the earlier breakpoints, the header up to 960 and 720px, and the reduced-motion rules.
- **Input.** Hover effects apply only under `.has-mouse-input`, which the interaction controller
  sets from the pointer type of the last event. Every hover state has a `:focus-visible`
  counterpart. Touch gets the resting state. Text cannot be selected, because a press or a drag
  belongs to the sphere; the two legal pages, which have no sphere, allow it.
- **Motion.** Timing belongs to CSS. Under `prefers-reduced-motion` transitions and animations
  collapse to 1ms, page navigation swaps without a transition, and canvas animation draws one
  still frame.
- **Stability.** Pages reveal with opacity and transform only, and animated regions keep their
  size, so nothing shifts the layout after the first paint.
- **Performance.** No third-party scripts, fonts or embeds (the exported CSP allows `'self'`
  only). One variable font file. Canvas work stops while it is off screen or the tab is hidden.

## Part 2: This site

### Identity

- **Mark.** The cat, in mint since 8 October 2026. It is drawn once, in `public/brand/mark.svg`:
  one outline of sixteen nodes with two pills for the eyes, filled with a gradient from a
  lighter tone at the top left to a deeper one at the bottom right. That file is the favicon and
  the picture the sphere samples for its figure; `npm run brand:render` renders the PNG favicon,
  the app icons and the link preview from it. In the header it is the link home, cut out of the
  page's accent with the drawing as the mask
  (`resources/views/components/brand-mark.blade.php`), lighter at the top left and deeper at the
  bottom right, so it takes a project's color with the rest of the header. It is 38px large;
  hovered or focused it grows a little.
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
  accent, and the pointer's ring wraps the hovered one. They fade by how far they are lit, not
  by their color, so they keep step with the accent while it blends to another page's. On a page with a sphere a hovered
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
  and 0.46 seconds (`resources/js/transition-controller.js`). The sphere stays: it is the one
  thing that does not fade, and it travels from where it stood to its place on the new page
  while its dots flow into that page's figure. The header answers the click at once, with the
  destination as the current one, and the accent blends to the new page's. Nothing covers the
  page. Reduced motion swaps the page without a transition.
- **Hover.** No surface lights up under the pointer: a hovered link or card answers with its
  accent, a rule drawn in the accent or a small movement. Optional interface sounds.
- **Page end.** Every page ends with one quiet line in the middle: the profiles and the legal
  pages, each link at least 44px tall. The main region leaves room for it, so a short page and
  the line fill one screen. The home page, one screen from 961px, ends without it there.

### Home page

The home page is one screen at every size, a stage of the name, the statement and the sphere. The
name stands small above the summary, which is the statement of the page and its largest text. The
header carries the navigation. From 961px the content keeps to a column on the left, at most half of the
width, and the right belongs to the sphere. Up to 960px the sphere has the upper 68% of the
screen, where its stage ends and the dots fade out, and the text stands below it; the line that
ends the page closes the screen.

A sphere of 1200 dots (`resources/js/dot-orb-controller.js`, `resources/css/orb.css`) is the main
element: a generative particle animation on a 2D canvas behind the text. There is one canvas for
the whole site, in the layout: it lies over the first screen of every page and scrolls away with
it. A page marks where the sphere stands with a stage (`data-dot-orb-stage`); on the home page
the stage is the whole section.

- **Idle motion.** The dots sit on a Fibonacci lattice. The sphere turns once in 52 seconds, bulges
  in slow overlapping waves and wanders around the middle of the stage. On the home page a mask dims the dots to 20% behind
  the text column, so they never compete with the text; it fades in and out with a page change.
- **What the dots answer to** is the same on every page, so a visitor learns it once:
  - *The pointer near them:* the sphere leans towards it, and dots within reach give way.
  - *Hovering or focusing something that names a figure:* the dots take that figure, and
    leaving gives them back (see "Figures").
  - *A press on the dots:* they move on to the next shape. Where several figures follow each
    other, that is the next figure. Where there is one figure, it is the plain sphere behind
    it, and behind the plain sphere of the home page it is the mark; that other side stays for
    8 seconds or until the next press.
  - *A press anywhere:* a ring travels outwards through the dots from where it happened;
    several rings travel at once.
  - *A held press:* gathers the dots around the pointer and lets go with a stronger ring.
  - *A tap* on the dots moves on like a press. Nothing else follows a finger.
- **What the sphere notices** of the visitor without being asked, and only a little
  (`resources/js/dot-orb-attention.js`):
  - *Where the pointer is heading:* the sphere looks a fifth of a second along the pointer's
    way, so it turns towards where the pointer will be, not only where it is.
  - *How fast the page scrolls:* on a page told in scenes the sphere sways a little with the
    scrolling, and the brisker the visitor goes through the scenes, the faster the dots flow
    into the next figure.
  - *That somebody is back:* after twenty seconds without a pointer, a key or a scroll, the
    first sign of the visitor is answered with one soft ring from the middle of the sphere.
- **Buds.** Like a lava lamp it sheds buds: a quarter of the dots is the core and always stays;
  three buds each take another quarter on their own slow cycle (41, 53 and 67 seconds), form a
  smaller sphere of their own size beside the main one, rise and sink over the height of the
  stage and return. The main sphere shrinks by what has left. A bud starts in the middle of
  the sphere and returns there, and where two blobs are close their surfaces join
  (`resources/js/dot-orb-lamp.js`): the sphere bulges, the bud grows out on a neck that thins
  and parts, and on its way back the two touch, grow a neck and become one body again.
- **Which dots a bud takes.** The ones beside it (`resources/js/dot-orb-buds.js`): the quarter
  of the dots nearest to where it leaves, the tip of that cap first. The dots that stay close
  over the place, each moving a little towards it, so the sphere is evenly covered again while
  the bud is out. On its way back the bud lands where it reaches the sphere at that moment,
  and the dots there make room. No dot crosses the sphere.
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
- **Several figures.** An element can name several figures. The sphere then shows one after the
  other, each for 8 seconds; a press on the dots moves on sooner. The sequence starts
  with the first figure whenever the sphere turns to the element, and it runs on the sphere's
  clock, so it pauses with it.
- **Lava lamp.** From one figure to the next the dots flow instead of jumping: every dot has a
  pace of its own, so a shape melts into the next. The flow is quick when the pointer moves on
  to another element, slower when the element the sphere rests with changes, and slowest, about
  two seconds, when a sequence steps by itself.
- **Words that name a figure.** Words of a text can name a figure
  (`resources/views/components/figure-text.blade.php`, `.figure-word`); the content lists them
  beside the text. Hovered, they light up in the color of their figure, the accent unless they
  or their row name another. In a text those words are set letter by letter, and the light of
  the page headings runs through them every three seconds, from the first of their letters to
  the last, so the text shows which of its words answer. In the statement of the home page the
  three kinds of work give the bars of Quantified, the brackets of Jay-Jay and four panes, the
  word for the database gives one, the last pixel the arrow of a pointer, and the name gives the mark;
  everything stays in the accent.
- **Place.** On a stage that is not fitted the sphere wanders around a point at 68% of the
  stage's width and half its height.
- **Timing.** Every value eases towards its target independently of the frame rate, on the
  sphere's own clock, which pauses while the stage is off screen or the tab is hidden.
- **Size.** The sphere's box follows the stage: its height or 70% of its width, at most 1040px.
- **Resting figure and color.** While nothing that names a figure is hovered or focused, the
  element marked `data-dot-orb-resting` holds its figure. An element can give its figure a color
  with `--dot-orb-rgb`; the dots blend to it and back to the page accent.
- **Fitted stage.** A stage marked `data-dot-orb-fit` is a square: the sphere stands still in
  its middle, and a figure, which is drawn within the middle 80% of its square, fills the
  smaller side. The canvas is as large as the window, so dots that a press pulls out of the
  figure or a ring pushes away are not cut off at the square's edge. A stage that stays in the
  window while its page scrolls (`data-dot-orb-stage="pinned"`, the scenes) pins the canvas
  too.
- **Sub-pages.** The about page and the case studies are told in scenes beside the sphere (see
  "Scenes: about and the case studies"). The 404 page is a stage for it (see "404 and legal
  pages"). The legal pages have no sphere.
- **Page change.** The sphere travels to the stage of the next page: its place and its size
  ease there within about a second while the dots flow into the new figure. On a page without
  a stage, the legal pages, the dots scatter away from the middle and fade, and the next stage
  gathers them again.
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
current row's name takes the accent like its icon.

Between 961 and 1180px the introduction stands below the heading. In a window up to 760px high
the stage is set tighter (lower rows, smaller names, a description of two lines), so it still
fills one screen with the page end on a laptop. Up to 960px the square of the sphere stands in
the middle above the heading, at most 40% of the window's height, and the rows follow each other
with their texts; a compact row then has its short text below its name. Touch never changes the
current row, so the sphere shows the first row's figure.

- **Projects overview.** The rows are the projects of the content, Quantified and Jay-Jay. A row
  brings its project's color, which is then the accent of the page, and its figures (those of
  the overview of its case study, `scenes` in the content), which the sphere goes through
  while the row is current: for Quantified the bars of a chart, a line chart, a ring and a
  calendar; for Jay-Jay the brackets of a tag, a globe, a cloud and an envelope. The current
  row holds the project's kind, description and technologies.
- **Contact.** The stage is mirrored and compact, the sphere on the left and the heading as the
  largest text. The rows are the channels, each
  with its address at the end of the row: an envelope for email, GitHub's mark for GitHub, a head
  and shoulders for LinkedIn. Below the list stands a note on what to write.

### Scenes: about and the case studies

The about page and the two case studies are told in scenes
(`resources/views/components/scene-stage.blade.php`, `resources/css/scene-stage.css`,
`resources/js/scene-controller.js`). One screen stays in place while the page scrolls, and what
changes is its content: the statement and the figure of the sphere, together. No page of the site
shows a screenshot.

- **Scene.** A short label, one statement as the largest text of the page, and below it at most
  a sentence or two, a few tags or one link. A scene can also list facts, each a name and what
  it stands for, so that a first scene says what there is to know at one glance; up to 960px
  they take the place of its sentence. The sphere shows the scene's figures (`scenes` in the
  content), in the page's accent or in the color the scene names.
- **Scrolling.** Behind the screen runs a track of steps, one for each scene and 70% of the
  window high. The step that crosses the middle of the window shows its scene: the old statement
  fades out as it sinks, the new one fades in, and the dots flow into the new figure. Nothing
  takes over the scroll; the page is simply as long as its steps.
- **Steps.** The names of the scenes are a row of tabs below the heading: the current one
  stands in full ink on a line in the accent, which grows in from the left. Each is a link to
  its step, so a scene has an address (`/en/jay-jay#client-hub`). On a narrow screen the row
  scrolls sideways and keeps the current step in sight. From 961px a link at the lower edge of
  the screen leads on: it names the next scene and is gone on the last.
- **From 961px.** A stage like the projects overview: the head of the page with the steps, the
  scene and the way on stand on the left, and on the right a square for the sphere, as high as
  the stage allows and at most five of the twelve columns wide. Up to 960px the head with the
  steps, the stage of the sphere and the scene follow each other in one column. There the scenes
  are as tall as the tallest of them needs and the stage takes what is left of the screen, at
  most 44% of its height: the figure fills the smaller side of that room, so a long scene makes
  the figure smaller instead of running out of the window.
- **About.** Six scenes (`resources/views/pages/about.blade.php`): who he is, with a head and
  shoulders and three facts (his apprenticeship, his studies, what he builds); four
  technologies, each with its mark in its color (.NET, Laravel, Angular, PostgreSQL) and its
  tools as tags; and a last one that leads on to the contact page, with the envelope. A tag
  with a mark of its own answers a hover (`technology_marks` in the content); the paths come
  from the `simple-icons` package.
- **Case study.** One template for Quantified and Jay-Jay
  (`resources/views/pages/project.blade.php`, `resources/css/pages/project.css`), in the
  project's color. The head holds the way back, the name and the kind of project. The scenes
  say what the project is and does, each with a rough picture. Each project has five: the first
  lists the stack, the state and the role as facts. The others show, for Quantified, sources
  that lead into one place, a timeline, a ledger and a target, and for Jay-Jay a globe, a leaf
  for the client's garden business, a cloud and a document. The last scene stands for the next project: its name, one sentence and the way
  there, and while it is shown the page and the dots already take that project's color.
- **Without scripts** the scenes follow each other as plain sections. **Reduced motion** keeps
  the screen in place and changes the statement at once; the sphere is one still sphere.
- **Focus.** A scene that is not shown still holds its links. When one of them receives the
  focus, the page scrolls to its step.

### 404 and legal pages

- **404.** One centred stage (`resources/views/errors/404.blade.php`,
  `resources/css/pages/not-found.css`): the sphere rests in the figure of the number, 404 in
  tall, narrow numerals, on a fitted square of at most 52% of the window's height, and the
  heading, one sentence and the link home stand below it, a clear step away from the
  numerals. With the line that ends the page it fills one screen; in a low window the square
  gets smaller so the message keeps its room.
- **Legal notice and privacy notice.** Text only (`resources/views/pages/legal.blade.php`,
  `resources/css/pages/legal.css`): the title, the introduction and, on the privacy notice, the
  date; then one row between hairlines for every section. From 961px the titles of the sections
  stand in a column on the left and their text in one on the right, where the introduction
  begins too. Up to 960px title and text follow each other. A link in the text is underlined in
  the accent and at least 44px tall.
