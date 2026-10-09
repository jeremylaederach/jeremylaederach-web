<?php

return [
    'default_locale' => 'en',

    'locales' => [
        'en' => [
            'label' => 'EN',
            'name' => 'English',
        ],
        'de' => [
            'label' => 'DE',
            'name' => 'Deutsch',
        ],
    ],

    'socials' => [
        'email' => [
            'label' => 'Email',
            'display' => 'info@jeremylaederach.ch',
            'url' => 'mailto:info@jeremylaederach.ch',
        ],
        'github' => [
            'label' => 'GitHub',
            'display' => 'github.com/jeremylaederach',
            'url' => 'https://github.com/jeremylaederach',
        ],
        'linkedin' => [
            'label' => 'LinkedIn',
            'display' => 'Jeremy Läderach',
            'url' => 'https://www.linkedin.com/in/jeremy-l%C3%A4derach-816ab5326/',
        ],
    ],

    // What the sphere shows for each scene of a page, by the scene's id: its figures, one after the
    // other (see dot-orb-figures.js), and the color of the dots where it is not the page's accent.
    // The overview of a project also stands for its row on the projects page.
    'scenes' => [
        'about' => [
            'me' => ['figures' => ['about']],
            'dotnet' => ['figures' => ['dotnet'], 'color' => '#8b5cf6'],
            'laravel' => ['figures' => ['laravel'], 'color' => '#ff2d20'],
            'interfaces' => ['figures' => ['angular', 'typescript', 'tailwindcss'], 'color' => '#dd0031'],
            'data' => ['figures' => ['postgresql', 'githubactions'], 'color' => '#4169e1'],
        ],
        'quantified' => [
            'overview' => ['figures' => ['quantified', 'trend', 'ring', 'calendar']],
            'sources' => ['figures' => ['converge']],
            'life' => ['figures' => ['timeline']],
            'finances' => ['figures' => ['ledger']],
            'goals' => ['figures' => ['target']],
        ],
        'jay-jay' => [
            'overview' => ['figures' => ['jay-jay', 'globe', 'cloud', 'contact']],
            'web' => ['figures' => ['globe']],
            'clients' => ['figures' => ['leaf']],
            'hosting' => ['figures' => ['cloud']],
            'client-hub' => ['figures' => ['sheet', 'checklist']],
            'stack' => ['figures' => ['laravel', 'tailwindcss', 'githubactions']],
            'state' => ['figures' => ['checklist']],
        ],
    ],

    // Tools that have a mark for the sphere (see dot-orb-figures.js), by their name among the tags
    // of a scene: hovered, the tag gives the sphere that mark, in its color where one is named.
    'technology_marks' => [
        '.NET 10 / C#' => ['figure' => 'dotnet', 'color' => '#8b5cf6'],
        '.NET 10' => ['figure' => 'dotnet', 'color' => '#8b5cf6'],
        'ASP.NET Core' => ['figure' => 'dotnet', 'color' => '#8b5cf6'],
        'WinUI 3' => ['figure' => 'windows'],
        'Laravel 13' => ['figure' => 'laravel', 'color' => '#ff2d20'],
        'Vite' => ['figure' => 'vite', 'color' => '#9135ff'],
        'Angular' => ['figure' => 'angular', 'color' => '#dd0031'],
        'Angular 22' => ['figure' => 'angular', 'color' => '#dd0031'],
        'TypeScript' => ['figure' => 'typescript', 'color' => '#3178c6'],
        'Tailwind CSS' => ['figure' => 'tailwindcss', 'color' => '#06b6d4'],
        'Tailwind CSS 4' => ['figure' => 'tailwindcss', 'color' => '#06b6d4'],
        'PostgreSQL' => ['figure' => 'postgresql', 'color' => '#4169e1'],
        'PostgreSQL 18' => ['figure' => 'postgresql', 'color' => '#4169e1'],
        'Google APIs' => ['figure' => 'google', 'color' => '#4285f4'],
        'GitHub Actions' => ['figure' => 'githubactions', 'color' => '#2088ff'],
    ],

    'content' => [
        'en' => [
            'meta' => [
                'title' => 'Jeremy Läderach',
                'description' => 'Personal portfolio of Jeremy Läderach, a software engineer building practical web systems with Laravel, .NET, and Angular.',
            ],
            'ui' => [
                'skip' => 'Skip to content',
                'language' => 'Language',
                'menu' => 'Primary navigation',
                'brand' => 'Jeremy Läderach home',
                'open' => 'Open',
                'legal_navigation' => 'Legal and external links',
                'sound_mute' => 'Mute interface sounds',
                'sound_enable' => 'Enable interface sounds',
                'next_project' => 'Next project',
                'next_scene' => 'Next',
                'scenes' => 'Scenes of this page',
            ],
            'nav' => [
                ['label' => 'Home', 'route' => 'home', 'icon' => 'home'],
                ['label' => 'Projects', 'route' => 'projects', 'icon' => 'folder'],
                ['label' => 'About', 'route' => 'about', 'icon' => 'user'],
                ['label' => 'Contact', 'route' => 'contact', 'icon' => 'mail'],
            ],
            'home' => [
                'summary' => 'Data platforms, web services, native apps. Built from the database to the last pixel.',
                // Words of the summary that morph the sphere into a figure while they are hovered.
                'summary_figures' => [
                    ['words' => 'Data platforms', 'figure' => 'quantified'],
                    ['words' => 'web services', 'figure' => 'jay-jay'],
                    ['words' => 'native apps', 'figure' => 'windows'],
                    ['words' => 'database', 'figure' => 'backend'],
                    ['words' => 'pixel', 'figure' => 'interface'],
                ],
            ],
            'about_page' => [
                'heading' => 'About me',
                'scenes' => [
                    [
                        'id' => 'me',
                        'label' => 'Me',
                        'text' => 'I\'m Jeremy, a software developer from Zurich. I build whole products: database, API, interface and deployment.',
                    ],
                    [
                        'id' => 'dotnet',
                        'label' => '.NET & C#',
                        'text' => 'My primary stack for APIs, domain logic, and native Windows tools.',
                        'tags' => ['.NET 10 / C#', 'ASP.NET Core', 'EF Core', 'WinUI 3'],
                    ],
                    [
                        'id' => 'laravel',
                        'label' => 'Laravel',
                        'text' => 'Websites and client systems with clear server-side structure and static builds where they fit.',
                        'tags' => ['Laravel 13', 'Blade', 'PHPUnit / Pest', 'Vite'],
                    ],
                    [
                        'id' => 'interfaces',
                        'label' => 'Interfaces',
                        'text' => 'Angular product views, Blade pages, and native UI with focused interaction.',
                        'tags' => ['Angular', 'TypeScript', 'Tailwind CSS', 'MVVM'],
                    ],
                    [
                        'id' => 'data',
                        'label' => 'Data & hosting',
                        'text' => 'From PostgreSQL and Google integrations to tested builds and Plesk in production.',
                        'tags' => ['PostgreSQL', 'Google APIs', 'GitHub Actions', 'Herd / Plesk'],
                    ],
                ],
            ],
            'projects_page' => [
                'heading' => 'Projects',
                'intro' => 'A product of my own and a business of my own.',
                'items' => [
                    [
                        'slug' => 'quantified',
                        'name' => 'Quantified',
                        'type' => 'Personal analytics',
                        'description' => 'My time, my health and my money in one place, as dashboards and timelines.',
                        'tags' => ['Angular', '.NET / C#', 'PostgreSQL'],
                        'detail_route' => 'quantified',
                    ],
                    [
                        'slug' => 'jay-jay',
                        'name' => 'Jay-Jay',
                        'type' => 'My web business',
                        'description' => 'Websites, hosting and support for small organizations. It runs on software I wrote: jay-jay.ch, and a Client Hub in the making.',
                        'tags' => ['Business', 'Laravel 13', 'Product design'],
                        'detail_route' => 'jay-jay',
                    ],
                ],
            ],
            'quantified_page' => [
                'slug' => 'quantified',
                'meta_description' => 'Quantified is Jeremy Läderach\'s full-stack personal analytics platform built with Angular, ASP.NET Core, PostgreSQL, and Google Calendar.',
                'back' => 'All projects',
                'heading' => 'Quantified',
                'kind' => 'Product · Active build',
                'scenes' => [
                    [
                        'id' => 'overview',
                        'label' => 'Overview',
                        'text' => 'Quantified shows me where my time, my health and my money go.',
                        'detail' => 'A personal analytics app. It turns records I already produce into dashboards and timelines.',
                        'facts' => [
                            ['label' => 'Stack', 'tags' => ['Angular 22', 'ASP.NET Core', 'PostgreSQL 18']],
                            ['label' => 'State', 'text' => 'In active development. A private instance runs for me.'],
                            ['label' => 'Role', 'text' => 'Product design and full-stack engineering.'],
                        ],
                    ],
                    [
                        'id' => 'sources',
                        'label' => 'Sources',
                        'text' => 'Google Calendar delivers my time. Apple Health delivers running, nutrition and weight.',
                        'detail' => 'The calendar connects through Google sign-in. Health data comes in as an export that I import by hand.',
                    ],
                    [
                        'id' => 'life',
                        'label' => 'Life',
                        'text' => 'Every day becomes a timeline: time, health, work, social life and trackers I define myself.',
                        'detail' => 'The overview shows time by area, with charts and heatmaps.',
                    ],
                    [
                        'id' => 'finances',
                        'label' => 'Finances',
                        'text' => 'A ledger of my own: accounts, transfers, credit cards and monthly templates for income and expenses.',
                        'detail' => 'The finance data lives in PostgreSQL, with commands for backup and restore.',
                    ],
                    [
                        'id' => 'goals',
                        'label' => 'Goals',
                        'text' => 'Monthly targets across health, work, social life and finances.',
                        'detail' => 'Health and time measure themselves; the rest I tick off by hand. Long-term directions link to the monthly goals.',
                    ],
                ],
            ],
            'jay_jay_page' => [
                'slug' => 'jay-jay',
                'meta_description' => 'Jay-Jay is Jeremy Läderach\'s digital service business, supported by a bilingual Laravel website and an evolving customer portal.',
                'back' => 'All projects',
                'heading' => 'Jay-Jay',
                'kind' => 'Business · Live',
                'scenes' => [
                    [
                        'id' => 'overview',
                        'label' => 'Overview',
                        'text' => 'Jay-Jay is my business for websites, hosting, domains, email and support.',
                        'detail' => 'For small Swiss organizations, with direct technical support. The software behind it is mine too.',
                    ],
                    [
                        'id' => 'web',
                        'label' => 'jay-jay.ch',
                        'text' => 'jay-jay.ch presents the offer and takes the contact requests.',
                        'detail' => 'The source is a bilingual Laravel app. The server gets a static export and one small endpoint for the contact form.',
                        'link' => ['label' => 'Visit Jay-Jay', 'url' => 'https://jay-jay.ch/en/'],
                    ],
                    [
                        'id' => 'clients',
                        'label' => 'Client work',
                        'text' => 'Websites for clients, built the same way.',
                        'detail' => 'For example the website of Scherer Gartengestaltung & Pflege AG in Dällikon: Laravel and Blade as the source, a static export in production.',
                        'link' => ['label' => 'Visit the website', 'url' => 'https://scherergartengestaltung.ch/'],
                    ],
                    [
                        'id' => 'hosting',
                        'label' => 'Hosting',
                        'text' => 'Hosting, domains and email from one place, with direct technical support.',
                    ],
                    [
                        'id' => 'client-hub',
                        'label' => 'Client Hub',
                        'text' => 'A portal for customers: boards, tickets, documents, invoices and requests.',
                        'detail' => 'A separate Laravel app with its own database, login and private document storage. It runs on demo data and is not ready for real customers yet.',
                    ],
                    [
                        'id' => 'stack',
                        'label' => 'Stack',
                        'text' => 'Laravel and Blade, styled with Tailwind CSS, checked by GitHub Actions and shipped to Plesk as a static build.',
                        'tags' => ['Laravel 13', 'Blade', 'Tailwind CSS 4', 'Pest', 'Larastan', 'GitHub Actions', 'Plesk'],
                    ],
                    [
                        'id' => 'state',
                        'label' => 'State',
                        'text' => 'The business is running and the website is live. The Client Hub is in development.',
                        'detail' => 'Role: founder, product designer and developer.',
                    ],
                ],
            ],
            'contact_page' => [
                'heading' => 'Contact',
                'intro' => 'A project, a role or a question? Write to me.',
                'context_label' => 'A useful first note',
                'context' => 'A few sentences are enough: what you need, by when, and a link if there is one.',
            ],
            'not_found' => [
                'heading' => 'Page not found',
                'intro' => 'Nothing lives at this address. Everything else is where it should be.',
                'action' => 'Back to home',
            ],
            'imprint' => [
                'title' => 'Legal notice',
                'intro' => 'Ownership and contact details for this personal portfolio.',
                'sections' => [
                    [
                        'title' => 'Site operator',
                        'body' => ['Jeremy Läderach operates this personal portfolio from Switzerland and is responsible for its editorial content.'],
                    ],
                    [
                        'title' => 'Contact',
                        'body' => ['For questions about this website or its content, use the email address below.'],
                        'links' => [['label' => 'info@jeremylaederach.ch', 'url' => 'mailto:info@jeremylaederach.ch']],
                    ],
                    [
                        'title' => 'Content and copyright',
                        'body' => ['Unless stated otherwise, the text, code, visual identity, and original presentation on this website belong to Jeremy Läderach. Product names, trademarks, and third-party materials remain the property of their respective owners.'],
                    ],
                    [
                        'title' => 'External links',
                        'body' => ['Links to external websites are reviewed when published. Their operators remain responsible for their content and data-processing practices.'],
                    ],
                ],
            ],
            'privacy' => [
                'title' => 'Privacy notice',
                'intro' => 'A concise account of the limited data this portfolio processes and why.',
                'updated' => 'Last updated: July 16, 2026',
                'sections' => [
                    [
                        'title' => 'Who is responsible',
                        'body' => ['Jeremy Läderach, Switzerland, is responsible for data processing connected with this website.'],
                        'links' => [['label' => 'info@jeremylaederach.ch', 'url' => 'mailto:info@jeremylaederach.ch']],
                    ],
                    [
                        'title' => 'Technical access data',
                        'body' => [
                            'When this website is requested, the hosting infrastructure may process technical data such as the IP address, timestamp, requested page, browser information, and referring address.',
                            'This data is used only to deliver, secure, and troubleshoot the website. It is retained only for as long as operational and security purposes require.',
                        ],
                    ],
                    [
                        'title' => 'Local preference',
                        'body' => [
                            'The sound control stores one mute preference in your browser\'s local storage. It remains on your device and is not used to identify or track you.',
                            'The deployed portfolio is a static website and does not set application, analytics, advertising, or marketing cookies. It also does not use trackers or externally hosted fonts.',
                        ],
                    ],
                    [
                        'title' => 'Contact and external services',
                        'body' => [
                            'If you contact me by email, I process the information you provide to answer your message and continue the conversation. It is kept only while needed for that purpose or applicable obligations.',
                            'GitHub and LinkedIn receive data only when you choose to follow an external link. Their own privacy terms then apply, and processing may take place outside Switzerland.',
                        ],
                    ],
                    [
                        'title' => 'Your rights',
                        'body' => ['Subject to applicable Swiss data-protection law, you may request information, correction, deletion, restriction, or the release of your personal data. Contact me by email to exercise these rights.'],
                        'links' => [['label' => 'Federal Data Protection and Information Commissioner', 'url' => 'https://www.edoeb.admin.ch/en']],
                    ],
                ],
            ],
        ],

        'de' => [
            'meta' => [
                'title' => 'Jeremy Läderach',
                'description' => 'Persönliches Portfolio von Jeremy Läderach, einem Softwareentwickler mit Fokus auf praktische Websysteme mit Laravel, .NET und Angular.',
            ],
            'ui' => [
                'skip' => 'Zum Inhalt springen',
                'language' => 'Sprache',
                'menu' => 'Hauptnavigation',
                'brand' => 'Jeremy Läderach Startseite',
                'open' => 'Öffnen',
                'legal_navigation' => 'Rechtliches und externe Links',
                'sound_mute' => 'Interface-Töne ausschalten',
                'sound_enable' => 'Interface-Töne einschalten',
                'next_project' => 'Nächstes Projekt',
                'next_scene' => 'Weiter',
                'scenes' => 'Szenen dieser Seite',
            ],
            'nav' => [
                ['label' => 'Start', 'route' => 'home', 'icon' => 'home'],
                ['label' => 'Projekte', 'route' => 'projects', 'icon' => 'folder'],
                ['label' => 'Profil', 'route' => 'about', 'icon' => 'user'],
                ['label' => 'Kontakt', 'route' => 'contact', 'icon' => 'mail'],
            ],
            'home' => [
                'summary' => 'Datenplattformen, Webservices, native Apps. Gebaut von der Datenbank bis zum letzten Pixel.',
                'summary_figures' => [
                    ['words' => 'Datenplattformen', 'figure' => 'quantified'],
                    ['words' => 'Webservices', 'figure' => 'jay-jay'],
                    ['words' => 'native Apps', 'figure' => 'windows'],
                    ['words' => 'Datenbank', 'figure' => 'backend'],
                    ['words' => 'Pixel', 'figure' => 'interface'],
                ],
            ],
            'about_page' => [
                'heading' => 'Über mich',
                'scenes' => [
                    [
                        'id' => 'me',
                        'label' => 'Ich',
                        'text' => 'Ich bin Jeremy, Softwareentwickler aus Zürich. Ich baue ganze Produkte: Datenbank, API, Oberfläche und Deployment.',
                    ],
                    [
                        'id' => 'dotnet',
                        'label' => '.NET & C#',
                        'text' => 'Mein Haupt-Stack für APIs, Domänenlogik und native Windows-Tools.',
                        'tags' => ['.NET 10 / C#', 'ASP.NET Core', 'EF Core', 'WinUI 3'],
                    ],
                    [
                        'id' => 'laravel',
                        'label' => 'Laravel',
                        'text' => 'Websites und Kundensysteme mit klarer Serverstruktur und statischen Builds, wo sie sinnvoll sind.',
                        'tags' => ['Laravel 13', 'Blade', 'PHPUnit / Pest', 'Vite'],
                    ],
                    [
                        'id' => 'interfaces',
                        'label' => 'Interfaces',
                        'text' => 'Angular-Produktoberflächen, Blade-Seiten und native UI mit fokussierter Interaktion.',
                        'tags' => ['Angular', 'TypeScript', 'Tailwind CSS', 'MVVM'],
                    ],
                    [
                        'id' => 'data',
                        'label' => 'Daten & Hosting',
                        'text' => 'Von PostgreSQL und Google-Integrationen bis zu getesteten Builds und Plesk in Produktion.',
                        'tags' => ['PostgreSQL', 'Google APIs', 'GitHub Actions', 'Herd / Plesk'],
                    ],
                ],
            ],
            'projects_page' => [
                'heading' => 'Projekte',
                'intro' => 'Ein eigenes Produkt und ein eigenes Unternehmen.',
                'items' => [
                    [
                        'slug' => 'quantified',
                        'name' => 'Quantified',
                        'type' => 'Persönliche Analyse',
                        'description' => 'Meine Zeit, meine Gesundheit und mein Geld an einem Ort, als Dashboards und Timelines.',
                        'tags' => ['Angular', '.NET / C#', 'PostgreSQL'],
                        'detail_route' => 'quantified',
                    ],
                    [
                        'slug' => 'jay-jay',
                        'name' => 'Jay-Jay',
                        'type' => 'Mein Webunternehmen',
                        'description' => 'Websites, Hosting und Betreuung für kleine Organisationen. Es läuft auf eigener Software: jay-jay.ch und ein Client Hub in Arbeit.',
                        'tags' => ['Unternehmen', 'Laravel 13', 'Product Design'],
                        'detail_route' => 'jay-jay',
                    ],
                ],
            ],
            'quantified_page' => [
                'slug' => 'quantified',
                'meta_description' => 'Quantified ist Jeremy Läderachs persönliche Full-Stack-Analytics-Plattform mit Angular, ASP.NET Core, PostgreSQL und Google Calendar.',
                'back' => 'Alle Projekte',
                'heading' => 'Quantified',
                'kind' => 'Produkt · In Entwicklung',
                'scenes' => [
                    [
                        'id' => 'overview',
                        'label' => 'Überblick',
                        'text' => 'Quantified zeigt mir, wohin meine Zeit, meine Gesundheit und mein Geld gehen.',
                        'detail' => 'Eine persönliche Analyse-App. Sie macht aus Daten, die ohnehin anfallen, Dashboards und Timelines.',
                        'facts' => [
                            ['label' => 'Stack', 'tags' => ['Angular 22', 'ASP.NET Core', 'PostgreSQL 18']],
                            ['label' => 'Stand', 'text' => 'In aktiver Entwicklung. Eine private Instanz läuft für mich.'],
                            ['label' => 'Rolle', 'text' => 'Product Design und Full-Stack-Entwicklung.'],
                        ],
                    ],
                    [
                        'id' => 'sources',
                        'label' => 'Quellen',
                        'text' => 'Google Calendar liefert meine Zeit. Apple Health liefert Laufen, Ernährung und Gewicht.',
                        'detail' => 'Der Kalender ist über die Google-Anmeldung verbunden. Gesundheitsdaten kommen als Export, den ich von Hand importiere.',
                    ],
                    [
                        'id' => 'life',
                        'label' => 'Life',
                        'text' => 'Jeder Tag wird zur Timeline: Zeit, Gesundheit, Arbeit, Soziales und eigene Tracker.',
                        'detail' => 'Die Übersicht zeigt die Zeit pro Bereich, mit Diagrammen und Heatmaps.',
                    ],
                    [
                        'id' => 'finances',
                        'label' => 'Finanzen',
                        'text' => 'Ein eigenes Kassenbuch: Konten, Überträge, Kreditkarten und Monatsvorlagen für Einnahmen und Ausgaben.',
                        'detail' => 'Die Finanzdaten liegen in PostgreSQL, mit Befehlen für Backup und Wiederherstellung.',
                    ],
                    [
                        'id' => 'goals',
                        'label' => 'Ziele',
                        'text' => 'Monatsziele über Gesundheit, Arbeit, Soziales und Finanzen.',
                        'detail' => 'Gesundheit und Zeit messen sich selbst; den Rest hake ich von Hand ab. Langfristige Richtungen hängen an den Monatszielen.',
                    ],
                ],
            ],
            'jay_jay_page' => [
                'slug' => 'jay-jay',
                'meta_description' => 'Jay-Jay ist Jeremy Läderachs digitales Dienstleistungsunternehmen mit einer zweisprachigen Laravel-Website und einem wachsenden Kundenportal.',
                'back' => 'Alle Projekte',
                'heading' => 'Jay-Jay',
                'kind' => 'Unternehmen · Live',
                'scenes' => [
                    [
                        'id' => 'overview',
                        'label' => 'Überblick',
                        'text' => 'Jay-Jay ist mein Unternehmen für Websites, Hosting, Domains, E-Mail und Betreuung.',
                        'detail' => 'Für kleine Schweizer Organisationen, mit direktem technischem Support. Die Software dahinter ist auch von mir.',
                    ],
                    [
                        'id' => 'web',
                        'label' => 'jay-jay.ch',
                        'text' => 'jay-jay.ch stellt das Angebot vor und nimmt die Kontaktanfragen entgegen.',
                        'detail' => 'Die Quelle ist eine zweisprachige Laravel-App. Auf den Server kommen ein statischer Export und ein kleiner Endpunkt für das Kontaktformular.',
                        'link' => ['label' => 'Jay-Jay besuchen', 'url' => 'https://jay-jay.ch/de/'],
                    ],
                    [
                        'id' => 'clients',
                        'label' => 'Kundenprojekte',
                        'text' => 'Websites für Kunden, auf dieselbe Art gebaut.',
                        'detail' => 'Zum Beispiel die Website der Scherer Gartengestaltung & Pflege AG in Dällikon: Laravel und Blade als Quelle, ein statischer Export in Produktion.',
                        'link' => ['label' => 'Website ansehen', 'url' => 'https://scherergartengestaltung.ch/'],
                    ],
                    [
                        'id' => 'hosting',
                        'label' => 'Hosting',
                        'text' => 'Hosting, Domains und E-Mail aus einer Hand, mit direktem technischem Support.',
                    ],
                    [
                        'id' => 'client-hub',
                        'label' => 'Client Hub',
                        'text' => 'Ein Portal für Kunden: Boards, Tickets, Dokumente, Rechnungen und Anfragen.',
                        'detail' => 'Eine eigene Laravel-App mit Datenbank, Login und geschützter Dokumentenablage. Sie läuft mit Demo-Daten und ist noch nicht bereit für echte Kunden.',
                    ],
                    [
                        'id' => 'stack',
                        'label' => 'Stack',
                        'text' => 'Laravel und Blade, gestaltet mit Tailwind CSS, geprüft durch GitHub Actions und als statischer Build auf Plesk.',
                        'tags' => ['Laravel 13', 'Blade', 'Tailwind CSS 4', 'Pest', 'Larastan', 'GitHub Actions', 'Plesk'],
                    ],
                    [
                        'id' => 'state',
                        'label' => 'Stand',
                        'text' => 'Das Unternehmen läuft, die Website ist live. Der Client Hub ist in Entwicklung.',
                        'detail' => 'Rolle: Gründer, Product Designer und Entwickler.',
                    ],
                ],
            ],
            'contact_page' => [
                'heading' => 'Kontakt',
                'intro' => 'Ein Projekt, eine Stelle oder eine Frage? Schreib mir.',
                'context_label' => 'Für einen guten Start',
                'context' => 'Ein paar Sätze reichen: was du brauchst, bis wann, und ein Link, falls es einen gibt.',
            ],
            'not_found' => [
                'heading' => 'Seite nicht gefunden',
                'intro' => 'Unter dieser Adresse wohnt nichts. Alles andere ist dort, wo es hingehört.',
                'action' => 'Zurück zur Startseite',
            ],
            'imprint' => [
                'title' => 'Impressum',
                'intro' => 'Angaben zur Verantwortung und Kontaktmöglichkeit für dieses persönliche Portfolio.',
                'sections' => [
                    [
                        'title' => 'Betreiber',
                        'body' => ['Jeremy Läderach betreibt dieses persönliche Portfolio aus der Schweiz und ist für die redaktionellen Inhalte verantwortlich.'],
                    ],
                    [
                        'title' => 'Kontakt',
                        'body' => ['Für Fragen zu dieser Website oder ihren Inhalten steht die folgende E-Mail-Adresse zur Verfügung.'],
                        'links' => [['label' => 'info@jeremylaederach.ch', 'url' => 'mailto:info@jeremylaederach.ch']],
                    ],
                    [
                        'title' => 'Inhalte und Urheberrecht',
                        'body' => ['Sofern nicht anders angegeben, stammen Texte, Code, visuelle Identität und die eigenständige Präsentation dieser Website von Jeremy Läderach. Produktnamen, Marken und Inhalte Dritter bleiben Eigentum ihrer jeweiligen Rechteinhaber.'],
                    ],
                    [
                        'title' => 'Externe Links',
                        'body' => ['Verlinkte externe Websites werden bei der Veröffentlichung geprüft. Für deren Inhalte und Datenbearbeitung bleiben die jeweiligen Betreiber verantwortlich.'],
                    ],
                ],
            ],
            'privacy' => [
                'title' => 'Datenschutzerklärung',
                'intro' => 'Eine kompakte Übersicht darüber, welche wenigen Daten dieses Portfolio bearbeitet und weshalb.',
                'updated' => 'Stand: 16. Juli 2026',
                'sections' => [
                    [
                        'title' => 'Verantwortliche Person',
                        'body' => ['Jeremy Läderach, Schweiz, ist für die Datenbearbeitung im Zusammenhang mit dieser Website verantwortlich.'],
                        'links' => [['label' => 'info@jeremylaederach.ch', 'url' => 'mailto:info@jeremylaederach.ch']],
                    ],
                    [
                        'title' => 'Technische Zugriffsdaten',
                        'body' => [
                            'Beim Aufruf dieser Website kann die Hosting-Infrastruktur technische Daten wie IP-Adresse, Zeitpunkt, aufgerufene Seite, Browserinformationen und verweisende Adresse bearbeiten.',
                            'Diese Daten dienen ausschliesslich der Auslieferung, Sicherheit und Fehleranalyse. Sie werden nur so lange aufbewahrt, wie es für den Betrieb und die Sicherheit erforderlich ist.',
                        ],
                    ],
                    [
                        'title' => 'Lokale Einstellung',
                        'body' => [
                            'Die Tonsteuerung speichert eine einzige Stummschaltungs-Einstellung im lokalen Speicher deines Browsers. Sie bleibt auf deinem Gerät und dient weder der Identifikation noch dem Tracking.',
                            'Das veröffentlichte Portfolio ist eine statische Website und setzt keine Anwendungs-, Analyse-, Werbe- oder Marketing-Cookies. Es verwendet zudem keine Tracker oder extern eingebundenen Schriftarten.',
                        ],
                    ],
                    [
                        'title' => 'Kontakt und externe Dienste',
                        'body' => [
                            'Wenn du mich per E-Mail kontaktierst, bearbeite ich deine Angaben, um deine Nachricht zu beantworten und die Kommunikation fortzuführen. Die Daten bleiben nur so lange gespeichert, wie es dafür oder für geltende Pflichten erforderlich ist.',
                            'GitHub und LinkedIn erhalten erst Daten, wenn du einen externen Link aufrufst. Danach gelten die Datenschutzbestimmungen des jeweiligen Anbieters; eine Bearbeitung ausserhalb der Schweiz ist möglich.',
                        ],
                    ],
                    [
                        'title' => 'Deine Rechte',
                        'body' => ['Im Rahmen des anwendbaren Schweizer Datenschutzrechts kannst du Auskunft, Berichtigung, Löschung, Einschränkung oder Herausgabe deiner Personendaten verlangen. Wende dich dafür per E-Mail an mich.'],
                        'links' => [['label' => 'Eidgenössischer Datenschutz- und Öffentlichkeitsbeauftragter', 'url' => 'https://www.edoeb.admin.ch/de']],
                    ],
                ],
            ],
        ],
    ],
];
