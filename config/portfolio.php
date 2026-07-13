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
                'statement' => 'I build',
                'statement_accent' => 'useful digital systems.',
                'index_label' => 'Landing',
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
                'heading' => 'About me',
                'intro' => 'I like systems that are quiet, useful, and maintainable: clear code, deliberate interfaces, and software that survives real deployment constraints.',
                'body' => [
                    'My work sits between application development, web delivery, hosting/domain work, and a growing interest in business informatics. That mix helps me think past individual screens and keep the whole system in view.',
                    'I am especially interested in Laravel foundations, .NET backends, Angular frontends, and migrations where the result needs to feel simpler than the system it replaced.',
                ],
                'technology_heading' => 'Tech I work with',
                'technology_list' => ['.NET / C#', 'Angular', 'TypeScript', 'Laravel', 'PostgreSQL'],
            ],
            'projects_page' => [
                'heading' => 'Projects',
                'intro' => 'A few projects that show the range: product engineering, client delivery, and maintainable web foundations.',
                'items' => [
                    [
                        'name' => 'Quantified',
                        'type' => 'Personal full-stack product',
                        'description' => 'A personal dashboard for tracking finances, time, habits, and the areas that matter.',
                        'tags' => ['.NET', 'Angular', 'PostgreSQL'],
                    ],
                    [
                        'name' => 'Jay-Jay Web',
                        'type' => 'Web solutions business',
                        'description' => 'A calm web platform for websites, hosting, domains, and maintenance services.',
                        'tags' => ['Websites', 'Hosting', 'WordPress'],
                    ],
                    [
                        'name' => 'Scherer Garten',
                        'type' => 'Client website and delivery',
                        'description' => 'A modern website and dependable hosting setup for a Swiss gardening and landscaping company.',
                        'tags' => ['Web design', 'WordPress', 'Hosting'],
                    ],
                ],
            ],
            'contact_page' => [
                'heading' => 'Contact',
                'intro' => 'Email is the best first step. Send the rough goal, links, constraints, and what a good outcome should feel like.',
                'form' => [
                    'name' => 'Name',
                    'email' => 'Email',
                    'message' => 'Message',
                    'submit' => 'Send message',
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
                'statement' => 'Ich entwickle',
                'statement_accent' => 'nützliche digitale Systeme.',
                'index_label' => 'Start',
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
                'heading' => 'Über mich',
                'intro' => 'Ich mag Systeme, die ruhig, nützlich und wartbar sind: klarer Code, bewusste Oberflächen und Software, die reale Deployment-Bedingungen übersteht.',
                'body' => [
                    'Meine Arbeit verbindet Applikationsentwicklung, Web-Delivery, Hosting-/Domain-Themen und ein wachsendes Interesse an Wirtschaftsinformatik. Diese Mischung hilft mir, über einzelne Screens hinaus das ganze System zu sehen.',
                    'Besonders spannend finde ich Laravel-Fundamente, .NET-Backends, Angular-Frontends und Migrationen, bei denen das Ergebnis einfacher wirken soll als das System, das es ersetzt.',
                ],
                'technology_heading' => 'Technologien',
                'technology_list' => ['.NET / C#', 'Angular', 'TypeScript', 'Laravel', 'PostgreSQL'],
            ],
            'projects_page' => [
                'heading' => 'Projekte',
                'intro' => 'Ein paar Projekte, die die Bandbreite zeigen: Product Engineering, Kundenarbeit und wartbare Web-Fundamente.',
                'items' => [
                    [
                        'name' => 'Quantified',
                        'type' => 'Persönliches Fullstack-Produkt',
                        'description' => 'Ein persönliches Dashboard für Finanzen, Zeit, Gewohnheiten und wichtige Lebensbereiche.',
                        'tags' => ['.NET', 'Angular', 'PostgreSQL'],
                    ],
                    [
                        'name' => 'Jay-Jay Web',
                        'type' => 'Web-Solutions-Business',
                        'description' => 'Eine ruhige Web-Plattform für Websites, Hosting, Domains und Betreuung.',
                        'tags' => ['Websites', 'Hosting', 'WordPress'],
                    ],
                    [
                        'name' => 'Scherer Garten',
                        'type' => 'Kundenwebsite und Delivery',
                        'description' => 'Eine moderne Website mit verlässlichem Hosting für einen Schweizer Garten- und Landschaftsbaubetrieb.',
                        'tags' => ['Webdesign', 'WordPress', 'Hosting'],
                    ],
                ],
            ],
            'contact_page' => [
                'heading' => 'Kontakt',
                'intro' => 'E-Mail ist der beste erste Schritt. Schick das grobe Ziel, Links, Rahmenbedingungen und wie ein gutes Resultat wirken soll.',
                'form' => [
                    'name' => 'Name',
                    'email' => 'E-Mail',
                    'message' => 'Nachricht',
                    'submit' => 'Nachricht senden',
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
