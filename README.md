# Jeremy Läderach Portfolio

[![Quality checks](https://github.com/jeremylaederach/jeremylaederach-web/actions/workflows/quality.yml/badge.svg)](https://github.com/jeremylaederach/jeremylaederach-web/actions/workflows/quality.yml)

The bilingual personal portfolio of [Jeremy Läderach](https://jeremylaederach.ch). It presents selected software projects through a custom Laravel and Blade experience, then exports the complete site as static files for straightforward Plesk hosting.

## Highlights

- English and German routes with matching content
- Custom client-side navigation and coordinated page transitions
- Accessible keyboard navigation, reduced-motion support and responsive layouts
- Lightweight pointer, glow and original interface-sound systems
- Detailed case studies for Quantified, Jay-Jay and SessionDeck
- Static production export with localized 404 pages and hardened response headers
- PHPUnit feature coverage and Laravel Pint formatting checks

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

Requirements: [Laravel Herd](https://herd.laravel.com/) and Node.js 22 with npm. Herd provides the local PHP and web-server environment.

```powershell
git clone git@github.com:jeremylaederach/jeremylaederach-web.git
cd jeremylaederach-web
composer setup
herd link jeremylaederach-web --isolate=8.4 --update-env
herd init
npm run dev
```

The link command is required only once per machine. Herd then serves the application at `http://jeremylaederach-web.test`, while Vite watches the frontend assets. Open the English homepage at `http://jeremylaederach-web.test/en/`.

Herd is the recommended local workflow, but it is not a production dependency. Without Herd, `composer dev` starts Laravel's development server and Vite at `http://127.0.0.1:8000`.

## Project Structure

```text
app/Console/Commands/    Static export command
app/Http/Controllers/   Localized portfolio controller
config/portfolio.php    English and German content
resources/views/        Blade pages and reusable components
resources/css/          Foundation, layout and responsive styles
resources/js/           Navigation, interaction, sound and transition controllers
tests/Feature/           Public-page and export coverage
tests/JavaScript/        Deterministic Playground logic tests
```

## Quality Checks

Run the same checks used by GitHub Actions:

```powershell
npm run build
npm test
composer test
npm run export:static
```

The production package can be generated in one command:

```powershell
npm run build:static
```

## Static Plesk Deployment

Laravel remains the maintainable source project. Production receives only generated HTML, CSS, JavaScript and public media.

1. Run `npm run build:static` from a clean checkout.
2. Preserve Plesk-managed content such as `httpdocs/.well-known/`.
3. Replace the remaining contents of `httpdocs/` with the **contents** of `dist-static/`.
4. Confirm that `https://jeremylaederach.ch/en/` and `https://jeremylaederach.ch/de/` load correctly.
5. Verify direct page loads, the localized 404 page and browser back/forward navigation.

The generated `.htaccess` provides the security headers and static error handling used by the production site. Never upload the source repository, `.env`, `vendor/`, `node_modules/`, `public/hot` or `public/index.php` to `httpdocs`.

## Security

Please report suspected vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## License

This repository is published for portfolio and code-review purposes. No open-source license is granted. The source code, visual identity, cat mark, writing and project media remain protected unless explicitly stated otherwise.
