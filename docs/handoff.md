# State and next steps

Updated **10 October 2026**. The README covers the architecture, the checks and the deployment,
`DESIGN.md` the interface as built. This file holds what neither says: what is released, what
waits, and what is open. Observations about the live site, GitHub and the host carry a date;
check them again before relying on them.

## State

- **Live:** `v1.5.1`, deployed on 6 October. On 10 October `/en/` answered 200 with that
  release's stylesheet (`app-CGp-U82v.css`), and the page and the stylesheet carried the
  security headers of the exported `.htaccess`.
- **On `main`, not deployed:** the rework of every page around one element, a generative sphere
  of dots. It replaces the look of `v1.5.1` and goes out as one release after a review of the
  whole site.
- **Checked on 10 October:** `npm test` with 73 tests; `composer test` with Pint, PHPStan and
  19 tests (508 assertions, the static export included); CI passed on `main`. Earlier that
  day, before the last changes to the sphere: ten pages of the exported site under its own
  Content-Security-Policy without a violation, page changes included.
- **Seen as stills from a headless browser:** every page in English or German at 1440 by 900,
  1024 by 768 and 375px width, the pages told in scenes also at 1280 by 720, 375 by 664 and
  360 by 640; a bud leaving, a bud carried by a dragged press, morphs and page changes
  frame by frame.
- **Not covered:** motion judged by eye, Firefox, Safari, a slow laptop, a real phone and
  touch. The JavaScript tests run in jsdom; no test loads a page in a real browser.

## Since `v1.5.1`

`DESIGN.md` describes the result. In short:

- One canvas with a sphere of 1200 dots lies in the layout and stays through a page change.
  A page marks a stage for it, and elements name the figures the dots take.
- The home page is one screen. The projects overview and the contact page share one stage
  list. The about page and the two case studies are told in scenes. The 404 page shows its
  number in dots, and the legal pages are plain rows.
- One accent, mint; a project's color replaces it on that project's pages. The mark is one
  SVG, and `npm run brand:render` renders the icons and the link preview from it.
- Removed: the galleries with their screenshots and interface previews, and the SessionDeck
  case study, whose addresses redirect to the projects. Both are still in `v1.5.1`.

## To settle in the review

Built, and each a matter of one value or one rule:

- **Page change.** The pace at which the sphere travels to the next page (`journey.rate` in
  `dot-orb-controller.js`), and how far its dots string out on the way (`journey.stretch`; 0
  lets it travel as one body). From the projects to the contact page the dots cross the next
  page's text for a moment.
- **What the sphere notices** (`notice` in the controller, `dot-orb-attention.js`): it looks
  ahead along the pointer's way, sways with the scrolling of a page told in scenes and answers
  a return after twenty seconds with one ring. Each may be too much or too little.
- **Division.** The sphere divides along the axis it turns around, into at most two buds; a
  press parts one more, a held press draws them together, and a held press that is dragged
  takes the bud along (`carry`). A bud leaves in one motion and slows down before the edge
  of its stage (`bud.parted`, `bud.drifting`). A third bud would need a second axis.
- **The eyes of the mark** look where the pointer is and blink (`dot-orb-eyes.js`): how far
  they look and how often they blink are numbers there. Their place follows the drawing of
  the mark; a test fails when the two differ.
- **Morphs.** Each dot takes the nearest point of the next figure. Measured against the
  earlier fixed pairing: a third of the way, and at most 49 of 1200 dots change sides instead
  of about 500.
- **Frame cost.** About 0.4ms of script per frame on the home page, 1.5ms with the processor
  slowed down four times. Slowed down like that, a run of four morphs leaves one slow frame
  on the home page and one on the projects overview. The graphics card was not measured; a
  headless browser does not use it.
- **Text selection** is off wherever the sphere is; the two legal pages keep it.
- **Phones.** A long scene shrinks the figure instead of running out of the window. Known and
  left: a phone held sideways is too low for a page told in scenes.

Content to confirm:

- The three facts in the first scene of the about page. They were shortened from the earlier
  about page: Application Developer EFZ at EcoLogic AG, 2019 to 2023, and Business Informatics
  at OST since 2026.
- The texts in both languages need proofreading. The home statement still names native apps;
  SessionDeck, the one native project, is no longer on the site.
- What the shorter pages no longer say: TypeScript, .NET 10 and EF Core for Quantified;
  Blade, Pest, Larastan and Plesk for Jay-Jay; a sentence on each of the four technologies
  of the about page.

## Next steps

1. Review of the whole site on a desktop and on a real phone, Firefox and Safari included,
   and the changes that follow from it.
2. The case studies: three steps each, overview, stack and details, and a way to show
   where a project is heading. The texts for that are still to be written.
3. The content above: facts, texts, tool lists.
4. `dot-orb-controller.js` has grown past 1,000 lines. Once the behaviour is settled, the
   presses with the carried bud and the journey between stages become modules of their own.
5. Release (see below).

Open, without a date:

- **Pictures for the case studies.** They need screens of the running apps with illustrative
  data, never real records.
- **Ideas:** a click on the email row copies the address; the contact figure goes through the
  channels by itself; small side projects on the about page; a way for visitors to play with
  the accent color.

## Release

1. Confirm that `v1.5.1` can be restored: its package rebuilds from the tag
   (`npm run build:static`).
2. **Actions → Deploy → Run workflow** on `main`. It runs CI first, and it is the first run
   of the Deploy workflow since it was split from the checks on 6 October.
3. A few targeted requests to the live site, then the tag on the deployed commit. The change
   of concept suggests `v2.0.0`.
4. Not checked since the new mark: the favicon in Safari and Firefox, and the link preview in
   LinkedIn's Post Inspector.
5. The uploader never deletes, so files of the old site stay on the server until they are
   removed in Plesk's file manager: `favicon.png`, `brand/jeremy-cat-256.png`,
   `brand/social-preview.png`, `brand/icons/apple-touch-icon.png`, `brand/icons/icon-192.png`,
   `brand/icons/icon-512.png`, `en/session-deck/` and `de/session-deck/`, the images under
   `assets/work/` and the older files under `build/assets/`. The list follows from the
   routes and files of `v1.5.1`, not from a look at the server. Nothing links to these files.

## Open: two HSTS headers

Observed on 10 October with `curl -sI`: every response carries `Strict-Transport-Security`
twice, one year from the exported `.htaccess` and half a year with `includeSubDomains` from
the server. One of them should go: the line in the export or the HSTS setting in Plesk. The
other headers of the `.htaccess` (CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`,
`Permissions-Policy`, COOP, CORP) arrive once, on pages and assets.

## Tried and dropped

Not to be rebuilt without a new reason:

- The large name on the home page; numbers before destinations, projects or sections; "Home"
  as a text link; a tilt of the mark on a hover.
- A glow under the pointer; dots that cover the window on a page change; project colors, beads
  under words and a fast light on the home page; figures that change fast.
- On the about page: the short profile, the career with its figures, a rail of ticks, the
  playground with its three demos, and cards of any kind.
- The contact page as a copy of the projects overview; a projects overview with index cards.
- Case studies as long pages of chapters beside the sphere: the text went unread.
- Buds that are dealt single dots, and buds whose surfaces join with the sphere's: too many
  dots in flight, and bodies that reach around each other. The division along the axis
  replaced both.
- A prompt for the visitor, or typing to the dots.

## Scope and limits

- Public pages under `/en` and `/de`: home, about, projects, the case studies Quantified and
  Jay-Jay, contact, legal notice and privacy, with localized 404 pages. `/` leads to `/en/`.
  The former Client Hub address redirects to the Jay-Jay case study, the former SessionDeck
  address to the projects.
- Page titles are the bare localized heading; a test pins it.
- Larastan runs at level 8. Level 9 would need typed access to the content array.
- In development the framework still registers a route for a local storage disk
  (`storage/{path}`). It is not exported.
- The repository variable `DEPLOY_AUTOMATIC` is unused since `v1.5.1` and can be deleted in the
  GitHub settings.
