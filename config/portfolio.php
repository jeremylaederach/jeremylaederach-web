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
                'role' => 'Software Engineer',
                'open' => 'Open',
                'footer_note' => 'Personal Laravel portfolio.',
            ],
            'nav' => [
                ['label' => 'Home', 'route' => 'home', 'icon' => 'home'],
                ['label' => 'About', 'route' => 'about', 'icon' => 'user'],
                ['label' => 'Projects', 'route' => 'projects', 'icon' => 'folder'],
                ['label' => 'Contact', 'route' => 'contact', 'icon' => 'mail'],
            ],
            'home' => [
                'backdrop' => ['Software', 'Engineer'],
                'kicker' => 'Jeremy Läderach',
                'title' => 'Software Engineer',
                'intro' => 'I build maintainable web applications with a focus on clean systems, careful delivery, and useful interfaces.',
                'status' => 'Open to focused software engineering work',
                'chips' => ['Laravel', '.NET', 'Angular', 'Migrations'],
                'entries' => [
                    [
                        'index' => '01',
                        'label' => 'About me',
                        'description' => 'Who I am, how I work, and the stack I use.',
                        'route' => 'about',
                        'icon' => 'user',
                    ],
                    [
                        'index' => '02',
                        'label' => 'Projects',
                        'description' => 'Selected builds, migrations, and product work.',
                        'route' => 'projects',
                        'icon' => 'folder',
                    ],
                    [
                        'index' => '03',
                        'label' => 'Contact',
                        'description' => 'Roles, project ideas, and focused collaboration.',
                        'route' => 'contact',
                        'icon' => 'mail',
                    ],
                ],
            ],
            'about_page' => [
                'backdrop' => 'About',
                'kicker' => 'About me',
                'title' => 'A practical developer with a business edge.',
                'intro' => 'I like systems that are quiet, useful, and maintainable: clear code, deliberate interfaces, and software that survives real deployment constraints.',
                'body' => [
                    'My work sits between application development, web delivery, hosting/domain work, and a growing interest in business informatics. That mix helps me think past individual screens and keep the whole system in view.',
                    'I am especially interested in Laravel foundations, .NET backends, Angular frontends, and migrations where the result needs to feel simpler than the system it replaced.',
                ],
                'facts' => [
                    ['label' => 'Current role', 'value' => 'Software Developer'],
                    ['label' => 'Planning', 'value' => 'Business Informatics BSc from 09/2026'],
                    ['label' => 'Focus', 'value' => 'Maintainable web applications'],
                ],
                'stack' => [
                    [
                        'name' => 'Web foundations',
                        'items' => ['Laravel', 'Blade', 'TailwindCSS', 'PHP', 'JavaScript'],
                    ],
                    [
                        'name' => 'Applications',
                        'items' => ['C#', 'ASP.NET Core', 'Angular', 'TypeScript', 'SQL'],
                    ],
                    [
                        'name' => 'Delivery',
                        'items' => ['Git', 'GitHub', 'Hosting', 'Domains', 'WordPress migrations'],
                    ],
                ],
            ],
            'projects_page' => [
                'backdrop' => 'Projects',
                'kicker' => 'Selected work',
                'title' => 'Proof of work, kept focused.',
                'intro' => 'A few projects that show the direction: personal products, client-facing web delivery, and this Laravel rebuild.',
                'items' => [
                    [
                        'name' => 'Quantified',
                        'type' => 'Personal full-stack product',
                        'description' => 'A personal assistant and life-tracking dashboard for finances, time, activities, and life areas.',
                        'tags' => ['.NET', 'Angular', 'PostgreSQL'],
                    ],
                    [
                        'name' => 'Jay-Jay',
                        'type' => 'Web solutions business',
                        'description' => 'A practical web business covering websites, hosting, domains, and maintenance for small organizations.',
                        'tags' => ['Websites', 'Hosting', 'WordPress'],
                    ],
                    [
                        'name' => 'jeremylaederach-web',
                        'type' => 'This Laravel portfolio',
                        'description' => 'A WordPress-to-Laravel rebuild with localized routes, a custom identity, and a maintainable Blade/CSS structure.',
                        'tags' => ['Laravel', 'Blade', 'i18n'],
                    ],
                ],
            ],
            'contact_page' => [
                'backdrop' => 'Contact',
                'kicker' => 'Contact',
                'title' => 'Send context. I will connect the dots.',
                'intro' => 'Email is the best first step. Send the rough goal, links, constraints, and what a good outcome should feel like.',
                'reasons' => [
                    'Software engineering opportunities',
                    'Laravel or .NET project work',
                    'WordPress-to-Laravel migrations',
                    'Small-business websites and hosting setup',
                ],
            ],
            'imprint' => [
                'title' => 'Imprint',
                'intro' => 'Legal and ownership details for this personal portfolio.',
                'sections' => [
                    ['title' => 'Responsible for content', 'body' => ['Jeremy Läderach', 'Switzerland']],
                    ['title' => 'Contact', 'body' => ['info@jeremylaederach.ch']],
                    ['title' => 'Note', 'body' => ['This Laravel prototype keeps the legal page intentionally compact. Additional business address or privacy details can be added before production launch.']],
                ],
            ],
        ],

        'de' => [
            'meta' => [
                'title' => 'Jeremy Läderach',
                'description' => 'Persönliches Portfolio von Jeremy Läderach, Software Engineer mit Fokus auf praktische Websysteme mit Laravel, .NET und Angular.',
            ],
            'ui' => [
                'skip' => 'Zum Inhalt springen',
                'language' => 'Sprache',
                'menu' => 'Hauptnavigation',
                'brand' => 'Jeremy Läderach Startseite',
                'role' => 'Software Engineer',
                'open' => 'Öffnen',
                'footer_note' => 'Persönliches Laravel-Portfolio.',
            ],
            'nav' => [
                ['label' => 'Start', 'route' => 'home', 'icon' => 'home'],
                ['label' => 'Profil', 'route' => 'about', 'icon' => 'user'],
                ['label' => 'Projekte', 'route' => 'projects', 'icon' => 'folder'],
                ['label' => 'Kontakt', 'route' => 'contact', 'icon' => 'mail'],
            ],
            'home' => [
                'backdrop' => ['Software', 'Engineer'],
                'kicker' => 'Jeremy Läderach',
                'title' => 'Software Engineer',
                'intro' => 'Ich baue wartbare Webanwendungen mit Fokus auf klare Systeme, saubere Delivery und nützliche Oberflächen.',
                'status' => 'Offen für fokussierte Software-Engineering-Arbeit',
                'chips' => ['Laravel', '.NET', 'Angular', 'Migrationen'],
                'entries' => [
                    [
                        'index' => '01',
                        'label' => 'Profil',
                        'description' => 'Wer ich bin, wie ich arbeite und welchen Stack ich nutze.',
                        'route' => 'about',
                        'icon' => 'user',
                    ],
                    [
                        'index' => '02',
                        'label' => 'Projekte',
                        'description' => 'Ausgewählte Builds, Migrationen und Produktarbeit.',
                        'route' => 'projects',
                        'icon' => 'folder',
                    ],
                    [
                        'index' => '03',
                        'label' => 'Kontakt',
                        'description' => 'Rollen, Projektideen und fokussierte Zusammenarbeit.',
                        'route' => 'contact',
                        'icon' => 'mail',
                    ],
                ],
            ],
            'about_page' => [
                'backdrop' => 'Profil',
                'kicker' => 'Über mich',
                'title' => 'Ein praktischer Entwickler mit Business-Blick.',
                'intro' => 'Ich mag Systeme, die ruhig, nützlich und wartbar sind: klarer Code, bewusste Oberflächen und Software, die reale Deployment-Bedingungen übersteht.',
                'body' => [
                    'Meine Arbeit verbindet Applikationsentwicklung, Web-Delivery, Hosting-/Domain-Themen und ein wachsendes Interesse an Wirtschaftsinformatik. Diese Mischung hilft mir, über einzelne Screens hinaus das ganze System zu sehen.',
                    'Besonders spannend finde ich Laravel-Fundamente, .NET-Backends, Angular-Frontends und Migrationen, bei denen das Ergebnis einfacher wirken soll als das System, das es ersetzt.',
                ],
                'facts' => [
                    ['label' => 'Aktuell', 'value' => 'Software Developer'],
                    ['label' => 'Planung', 'value' => 'Wirtschaftsinformatik BSc ab 09/2026'],
                    ['label' => 'Fokus', 'value' => 'Wartbare Webanwendungen'],
                ],
                'stack' => [
                    [
                        'name' => 'Web-Fundament',
                        'items' => ['Laravel', 'Blade', 'TailwindCSS', 'PHP', 'JavaScript'],
                    ],
                    [
                        'name' => 'Applikationen',
                        'items' => ['C#', 'ASP.NET Core', 'Angular', 'TypeScript', 'SQL'],
                    ],
                    [
                        'name' => 'Delivery',
                        'items' => ['Git', 'GitHub', 'Hosting', 'Domains', 'WordPress-Migrationen'],
                    ],
                ],
            ],
            'projects_page' => [
                'backdrop' => 'Projekte',
                'kicker' => 'Ausgewählte Arbeit',
                'title' => 'Proof of Work, fokussiert gehalten.',
                'intro' => 'Ein paar Projekte, die die Richtung zeigen: persönliche Produkte, Web-Delivery und dieser Laravel-Rebuild.',
                'items' => [
                    [
                        'name' => 'Quantified',
                        'type' => 'Persönliches Fullstack-Produkt',
                        'description' => 'Ein Personal-Assistant- und Life-Tracking-Dashboard für Finanzen, Zeit, Aktivitäten und Lebensbereiche.',
                        'tags' => ['.NET', 'Angular', 'PostgreSQL'],
                    ],
                    [
                        'name' => 'Jay-Jay',
                        'type' => 'Web-Solutions-Business',
                        'description' => 'Ein praktisches Web-Business für Websites, Hosting, Domains und Wartung kleiner Organisationen.',
                        'tags' => ['Websites', 'Hosting', 'WordPress'],
                    ],
                    [
                        'name' => 'jeremylaederach-web',
                        'type' => 'Dieses Laravel-Portfolio',
                        'description' => 'Ein WordPress-zu-Laravel-Rebuild mit lokalisierten Routen, eigener Identität und wartbarer Blade/CSS-Struktur.',
                        'tags' => ['Laravel', 'Blade', 'i18n'],
                    ],
                ],
            ],
            'contact_page' => [
                'backdrop' => 'Kontakt',
                'kicker' => 'Kontakt',
                'title' => 'Schick Kontext. Ich verbinde die Punkte.',
                'intro' => 'E-Mail ist der beste erste Schritt. Schick das grobe Ziel, Links, Rahmenbedingungen und wie ein gutes Resultat wirken soll.',
                'reasons' => [
                    'Software-Engineering-Rollen',
                    'Laravel- oder .NET-Projektarbeit',
                    'WordPress-zu-Laravel-Migrationen',
                    'KMU-Websites und Hosting-Setup',
                ],
            ],
            'imprint' => [
                'title' => 'Impressum',
                'intro' => 'Rechtliche Angaben zu diesem persönlichen Portfolio.',
                'sections' => [
                    ['title' => 'Verantwortlich für den Inhalt', 'body' => ['Jeremy Läderach', 'Schweiz']],
                    ['title' => 'Kontakt', 'body' => ['info@jeremylaederach.ch']],
                    ['title' => 'Hinweis', 'body' => ['Dieser Laravel-Prototyp hält die rechtliche Seite bewusst kompakt. Weitere Geschäftsadresse- oder Datenschutzangaben können vor dem Produktionslaunch ergänzt werden.']],
                ],
            ],
        ],
    ],
];
