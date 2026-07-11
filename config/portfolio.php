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
                'greeting' => 'Hello',
                'kicker' => 'Jeremy Läderach',
                'title' => 'I build',
                'title_accent' => 'useful digital systems.',
                'intro' => 'Focused on building clean, meaningful products with thoughtful user experiences.',
                'explore' => 'Explore my work',
                'location' => 'Based in Switzerland',
                'footer_prompt' => "Let's build something great.",
                'routes' => [
                    [
                        'label' => 'Projects',
                        'description' => 'View work',
                        'route' => 'projects',
                    ],
                    [
                        'label' => 'About me',
                        'description' => 'Learn more',
                        'route' => 'about',
                    ],
                    [
                        'label' => 'Contact',
                        'description' => 'Get in touch',
                        'route' => 'contact',
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
                'intro' => 'A few projects that show the range: product engineering, client delivery, and maintainable web foundations.',
                'items' => [
                    [
                        'name' => 'Quantified',
                        'type' => 'Personal full-stack product',
                        'description' => 'A personal dashboard for tracking finances, time, habits, and the areas that matter.',
                        'tags' => ['.NET', 'Angular', 'PostgreSQL'],
                    ],
                    [
                        'name' => 'Scherer Garten',
                        'type' => 'Client website and delivery',
                        'description' => 'A modern website and dependable hosting setup for a Swiss gardening and landscaping company.',
                        'tags' => ['Web design', 'WordPress', 'Hosting'],
                    ],
                    [
                        'name' => 'Jay-Jay',
                        'type' => 'Web solutions business',
                        'description' => 'A calm web platform for websites, hosting, domains, and maintenance services.',
                        'tags' => ['Websites', 'Hosting', 'WordPress'],
                    ],
                    [
                        'name' => 'jeremylaederach-web',
                        'type' => 'This Laravel portfolio',
                        'description' => 'A Laravel rebuild focused on identity, localization, and maintainable frontend structure.',
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
                'greeting' => 'Hallo',
                'kicker' => 'Jeremy Läderach',
                'title' => 'Ich entwickle',
                'title_accent' => 'nützliche digitale Systeme.',
                'intro' => 'Fokussiert auf klare, sinnvolle Produkte mit durchdachten Nutzererlebnissen.',
                'explore' => 'Arbeit entdecken',
                'location' => 'In der Schweiz zuhause',
                'footer_prompt' => 'Lass uns etwas Grossartiges bauen.',
                'routes' => [
                    [
                        'label' => 'Projekte',
                        'description' => 'Arbeiten ansehen',
                        'route' => 'projects',
                    ],
                    [
                        'label' => 'Über mich',
                        'description' => 'Mehr erfahren',
                        'route' => 'about',
                    ],
                    [
                        'label' => 'Kontakt',
                        'description' => 'Kontakt aufnehmen',
                        'route' => 'contact',
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
                'intro' => 'Ein paar Projekte, die die Bandbreite zeigen: Product Engineering, Kundenarbeit und wartbare Web-Fundamente.',
                'items' => [
                    [
                        'name' => 'Quantified',
                        'type' => 'Persönliches Fullstack-Produkt',
                        'description' => 'Ein persönliches Dashboard für Finanzen, Zeit, Gewohnheiten und wichtige Lebensbereiche.',
                        'tags' => ['.NET', 'Angular', 'PostgreSQL'],
                    ],
                    [
                        'name' => 'Scherer Garten',
                        'type' => 'Kundenwebsite und Delivery',
                        'description' => 'Eine moderne Website mit verlässlichem Hosting für einen Schweizer Garten- und Landschaftsbaubetrieb.',
                        'tags' => ['Webdesign', 'WordPress', 'Hosting'],
                    ],
                    [
                        'name' => 'Jay-Jay',
                        'type' => 'Web-Solutions-Business',
                        'description' => 'Eine ruhige Web-Plattform für Websites, Hosting, Domains und Betreuung.',
                        'tags' => ['Websites', 'Hosting', 'WordPress'],
                    ],
                    [
                        'name' => 'jeremylaederach-web',
                        'type' => 'Dieses Laravel-Portfolio',
                        'description' => 'Ein Laravel-Rebuild mit Fokus auf Identität, Lokalisierung und wartbare Frontend-Struktur.',
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
