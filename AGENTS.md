# Working on the Jeremy Läderach Portfolio

Read `README.md` and `docs/handoff.md` before changing anything. The README describes the
architecture, checks and deployment. The handoff records the latest decisions, the verified state
and the open items; its dated observations about the live site, GitHub or hosting must be checked
again before relying on them. Inspect implementation and tests before proposing changes.

- Inspect the current branch, working tree, recent commits and tags first. `main` is the
  production branch and the only branch. The owner expects a clean maintenance checkout: do not
  leave rejected experiments, prototype branches or scratch files behind, and never reset, revert,
  stash, clean or discard work without his explicit approval.
- Make coherent, verified commits for completed work and push them to `main`. Write English
  messages in the existing `type(scope): summary` style: one commit per outcome, no bursts of
  small ones. List the hashes and their purpose. Before a deploy run, verify that the live
  release can be restored: its package is still retained as a workflow artifact or rebuilds from
  its tag. A change to the look that the owner has not asked for waits for his review before it
  is deployed. Force-pushing and rewriting history need his explicit word each time.
- This repository is the owner's public showcase: clean, idiomatic code, a meaningful history, no
  dead code and no unexplained workarounds. Work happens on `main` only, without extra branches.
  Report in plain terms what changed, and keep the local setup and the deployment working.
- This repository is public. Everything committed is published, this file and the handoff
  included. No credentials, private records or unpublished plans belong here, and project media
  must be publishable: the Quantified previews show illustrative data, never real calendar, health
  or finance records.
- Laravel and Blade are the source; production receives only the static export. The export
  command and the uploader both reject every PHP file. Do not add authentication, a database, a
  form backend, server-rendered features or other runtime dependencies. The exported `.htaccess`
  sets a strict CSP (`'self'` only): no third-party scripts, fonts or embeds unless that policy is
  changed deliberately.
- `DESIGN.md` describes the interface as built. The site is built around the dot sphere: the
  pointer, the navigation, hover styles and page transitions may change for it; the typeface,
  the dark ground and the interface sounds stay. Propose a small scope before a redesign or a
  new section, start with one contained, reviewable change, and distinguish confirmed defects
  from preferences and ideas. Look for interface problems (hierarchy, spacing, dividers,
  selected states, color consistency) and solve them within the shared components and
  stylesheets instead of adding one-off rules.
  Page styles live in `resources/css/pages` and carry their own breakpoints. `responsive.css` is
  unlayered, so its rules override the layered ones; it only holds the header's breakpoints and
  the reduced-motion rules. Do not add page rules to it.
- All content lives in `config/portfolio.php`, in English and German with the same structure.
  English is the default locale; German uses Swiss spelling (`ss`, never `ß`). Keep both languages
  in step. Career, education, dates, skills, project claims and legal text come from the owner:
  never invent or reword them unasked.
- JavaScript stays vanilla: one small controller per concern, created in `resources/js/app.js`.
  Transition timing belongs to CSS, and reduced-motion preferences are respected (see README).
- A public page is a named route in `routes/web.php`; the export, the sitemap and the uploader's
  completeness check follow from it. Adding, renaming or removing a page also touches
  `PortfolioController`, the navigation in `config/portfolio.php` for both locales, the page list
  in `PageMetadataTest` and, for an old address, the redirects in the exported `.htaccess`. The
  uploader never deletes: a removed page stays online until a release cleans it up explicitly.
- Run the checks from the README that fit the change. Build the Vite assets before `composer test`;
  its export test rewrites the ignored `dist-static/` folder. Add focused tests for meaningful
  behavior. Review rendered changes in English and German, on desktop and at 375px: overflow,
  images and the console. Preview the export from a copy outside `dist-static/`, because the
  export replaces that folder by renaming it. Finish with `git diff --check`.
- Report verified results separately from what was not checked. Owner review, a real phone and the
  live host are not covered by local tests or CI.
- Check the live site with a few targeted requests. The host runs a bot protection; do not send
  scripted bursts or probe protected paths.
- A push to `main` runs the checks only. Production changes only through **Actions → Deploy →
  Run workflow** on `main`, started or explicitly authorized by the owner; that workflow runs
  CI before it uploads. No ad-hoc FTP uploads. Do not weaken the deployment safeguards (target
  verification, PHP rejection, no mirror deletion) to make a run pass. Tag only the exact commit
  that was uploaded and checked.
- Plesk, DNS and GitHub settings are the owner's to change. Credentials live in the GitHub
  `production` environment and his password manager, never in Git, the handoff or a chat. The
  deployment account is dedicated to this site; do not reuse another project's hosting access.
- Dependency updates are planned maintenance, not incidental changes.

Keep the documentation current. At the end of every work batch, update `docs/handoff.md`, this
file, the README and any other affected documentation as part of that batch. Correct or delete
outdated statements instead of adding new text beside them; Git history keeps superseded
narratives. Date observations that can change. Do not maintain a second plan or status file beside
the handoff. The handoff holds the state and the next steps, written as a developer's notes: what
is released, what waits and what is open. No quotations, no account of who decided what, and
nothing about a single machine.

A fresh task must obtain machine state and project context from the checkout and available tools.
Do not invent the contents of an unavailable earlier task or assume that credentials, `.env` or
installed runtimes arrived with a clone.
