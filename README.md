# Jeremy Läderach Portfolio

[![CI](https://github.com/jeremylaederach/jeremylaederach-web/actions/workflows/quality.yml/badge.svg)](https://github.com/jeremylaederach/jeremylaederach-web/actions/workflows/quality.yml)

The bilingual personal portfolio of [Jeremy Läderach](https://jeremylaederach.ch). It presents selected software projects through a custom Laravel and Blade experience, then exports the complete site as static files for straightforward Plesk hosting.

## Highlights

- English and German routes with matching content
- Custom client-side navigation and coordinated page transitions
- Accessible keyboard navigation, reduced-motion support and responsive layouts
- A custom pointer and original interface sounds
- A generative sphere of dots on the home page that morphs into a figure for each destination
- Detailed case studies for Quantified, Jay-Jay and SessionDeck
- Static production export with localized 404 pages and hardened response headers
- PHPUnit feature coverage, JavaScript interaction tests, PHPStan analysis and Laravel Pint formatting checks

## Stack

- PHP 8.3 or newer
- Laravel 13
- Blade
- Tailwind CSS 4
- Vite 8
- Vanilla JavaScript
- PHPUnit 12

No authentication, production PHP runtime or application database is required.

## Local Development

Requirements: [Laravel Herd](https://herd.laravel.com/) and Node.js 22.22.2+ or 24.15+ with npm. Herd provides the local PHP and web-server environment.

```powershell
git clone git@github.com:jeremylaederach/jeremylaederach-web.git
cd jeremylaederach-web
composer setup
herd link jeremylaederach-web --isolate=8.4 --update-env
herd init
npm run dev
```

The link command is required only once per machine. Herd then serves the application at `http://jeremylaederach-web.test`, while Vite watches the frontend assets. Open the English homepage at `http://jeremylaederach-web.test/en/`.

Herd is the recommended local workflow, but it is not a production dependency. Without Herd, run `php artisan serve` and `npm run dev` in two terminals and open `http://127.0.0.1:8000/en/`.

## Project Structure

```text
app/Console/Commands/    Static export command
app/Http/Controllers/   Localized portfolio controller
config/portfolio.php    English and German content
resources/views/        Blade pages and reusable components
resources/css/          Foundation, layout, one stylesheet per page in pages/, responsive rules
resources/fonts/        Self-hosted Instrument Sans (variable, SIL Open Font License)
resources/js/           Navigation, pointer, interaction, sound and transition controllers
tests/Feature/           Public-page and export coverage
tests/JavaScript/        Controller and DOM interaction tests
scripts/deploy_static.py Restricted FTPS upload and live verification
scripts/render-brand.mjs Favicon, app icons and link preview, rendered from public/brand/mark.svg
tests/deployment/        Deployment safeguards (Python standard library)
AGENTS.md                Working rules for coding agents
DESIGN.md                What the interface does: craft standard, identity, the pages
docs/handoff.md          Current state, open decisions and audit findings
```

Project galleries share one Blade component, interaction controller and stylesheet (`project-reel.css`). The gallery distinguishes screenshots from HTML interface previews; previews use illustrative data and are not live product embeds. All galleries use manual navigation with previous/next buttons, arrow keys and touch swipes; images never advance automatically. The optional enlarged view uses a native dialog and moves the same gallery into it, preserving the selected slide without duplicating markup or carousel state. Closing restores keyboard focus and the original layout.

A page change has two phases, leaving and entering. The router waits for the main region's CSS animations to finish before swapping content, then lets the new page enter. The page's timing belongs to CSS; the sphere, which scatters and gathers in step, is drawn on a canvas with its own clock. Reduced-motion navigation swaps without a transition.

## Quality Checks

Run the same checks used by GitHub Actions:

```powershell
npm run build
npm test
composer test
python -B -m unittest discover -s tests/deployment -v
npm run export:static
python -B scripts/deploy_static.py --check-only dist-static
composer audit --locked
npm audit
```

The mark is drawn once, in `public/brand/mark.svg`. After changing it, `npm run brand:render` renders the PNG favicon, the app icons and the link preview again; it needs Edge, Chrome or Chromium on the machine (`BROWSER_PATH` names another location) and is not part of CI.

The production package can be generated in one command:

```powershell
npm run build:static
```

## Static Plesk Deployment

Laravel remains the maintainable source project. Production receives only generated HTML, CSS, JavaScript and public media.

GitHub Actions builds and retains a **hosttech-<commit>** artifact after tests, dependency audits and static export succeed. Artifacts remain available for 14 days and include the required `.htaccess` files. The deployment job uploads that same checked package through explicit FTPS; it does not rebuild the site. Production changes only from the separate **Deploy** workflow, started manually on `main`; it runs the CI checks first. The site holds no data: any release can be rebuilt from its tag. Pushes, pull requests, other branches and tags never deploy.

### First-time setup

1. Back up this website's document root and confirm how to restore it. Restore only the portfolio files, not unrelated subscription data.
2. In Hosttech/Plesk hosting 117, create a separate FTP user **jeremylaederach-deploy** restricted to this domain's `httpdocs`. The account's FTP `/` must contain the existing portfolio's `de/index.html` and must not allow access to Jay-Jay or other sites. The uploader checks the existing portfolio URL before writing. Do not reuse the master login or Jay-Jay's deployment credential.
3. In this repository's GitHub settings, create the **production** environment and restrict deployment branches to `main`. Add environment secrets **DEPLOY_FTP_USERNAME** (`jeremylaederach-deploy`) and **DEPLOY_FTP_PASSWORD**. Store the credential in your password manager, never in Git. The endpoint is `117.hosttech.eu:21`; both control and data connections use TLS with certificate verification. No production PHP handler or database is needed.
4. Commit and push the reviewed changes; the push runs CI only. Start **Actions → Deploy → Run workflow** on `main`.
5. Wait for both jobs to succeed, then review EN/DE, project galleries, mobile layout, direct page loads, localized 404s and browser back/forward navigation on the live website. The job reads every uploaded file back over FTPS, then compares the published HTML, CSS and JavaScript with the package. The public comparison is repeated twice before it fails, because the host's bot protection can answer a runner with a challenge page; the error then states what the server returned, and re-running the deploy job repeats the check. None of this replaces a visual review.
6. Create the release tag on the uploaded commit once the live result is accepted. Every later release repeats steps 4 to 6.

The upload installs root dot-file protection first, then assets, then HTML. Files are transferred under temporary names and renamed only after transfer completes. Active production runs are not cancelled by another push. The uploader never mirror-deletes server files or old hashed assets, preserving `.well-known` and existing server-managed content. The portfolio package rejects every PHP file.

The whole release is **not atomic**, and there is no automatic rollback or tag creation. If an upload or live comparison fails, inspect the live state and either restore the targeted website backup or revert the faulty change on `main` and deploy the checked revert. Previous hashed assets are retained deliberately; any later cleanup should be limited to known unused build files. Environment restrictions and deployment concurrency follow [GitHub's deployment controls](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments).

Python is used only for deployment and its tests, with no third-party packages. GitHub's Ubuntu runner already provides it; local deployment tests require Python 3.

### Manual fallback

The successful workflow's artifact can still be downloaded and uploaded manually. Local `npm run build:static` also remains available for previews and emergency uploads.

In the Plesk file manager for `jeremylaederach.ch`, back up the existing website, upload the ZIP into the domain's `httpdocs/` directory, and extract it there with replacement enabled. `index.html`, `.htaccess`, `en/`, `de/` and `build/` must sit directly inside `httpdocs/`, without an extra `dist-static/` folder. Preserve `.well-known/` and other Plesk-managed files, remove the uploaded ZIP afterwards, and verify the pages as described below.

To build the same package locally:

1. Run `npm run build:static` from a clean checkout.
2. Preserve Plesk-managed content such as `httpdocs/.well-known/`.
3. Replace the remaining contents of `httpdocs/` with the **contents** of `dist-static/`.
4. Confirm that `https://jeremylaederach.ch/en/` and `https://jeremylaederach.ch/de/` load correctly.
5. Verify direct page loads, the localized 404 page and browser back/forward navigation.

The generated `.htaccess` provides the security headers and static error handling used by the production site. Never upload the source repository, `.env`, `vendor/`, `node_modules/`, `public/hot` or `public/index.php` to `httpdocs`.

Exports are prepared in `storage/app/static-export` and replace `dist-static` only after every page has rendered successfully. A failed build leaves the last successful package untouched; do not upload it as a new release. The package includes a sitemap, absolute canonical URLs and matching English/German alternate links for `jeremylaederach.ch`.

## Security

Please report suspected vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## License

This repository is published for portfolio and code-review purposes. No open-source license is granted. The source code, visual identity, cat mark, writing and project media remain protected unless explicitly stated otherwise.
