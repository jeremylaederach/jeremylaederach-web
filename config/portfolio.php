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
                'footer_navigation' => 'Explore',
                'back_to_top' => 'Back to top',
                'sound_mute' => 'Mute interface sounds',
                'sound_enable' => 'Enable interface sounds',
            ],
            'nav' => [
                ['label' => 'Home', 'route' => 'home', 'icon' => 'home'],
                ['label' => 'Projects', 'route' => 'projects', 'icon' => 'folder'],
                ['label' => 'About', 'route' => 'about', 'icon' => 'user'],
                ['label' => 'Contact', 'route' => 'contact', 'icon' => 'mail'],
            ],
            'home' => [
                'statement' => 'I build',
                'statement_accent' => 'useful digital systems.',
                'summary' => 'I build useful digital systems and thoughtful web experiences.',
                'explore' => 'Explore projects',
                'index_label' => 'Landing',
                'routes' => [
                    [
                        'label' => 'Projects',
                        'description' => 'Products, migrations, and client work.',
                        'route' => 'projects',
                    ],
                    [
                        'label' => 'About me',
                        'description' => 'Background, experience, and the tools behind my work.',
                        'route' => 'about',
                    ],
                    [
                        'label' => 'Contact',
                        'description' => 'A direct line for focused collaboration.',
                        'route' => 'contact',
                    ],
                ],
            ],
            'about_page' => [
                'eyebrow' => 'Profile',
                'heading' => 'About me',
                'intro' => 'I am a software engineer with a foundation in application development and a focus on full-stack systems that connect technology with real business needs.',
                'story_link' => 'My background',
                'story_heading' => 'Software with purpose, built from real requirements.',
                'body' => [
                    'As a passionate software engineer with a solid foundation gained through my apprenticeship as an Application Developer EFZ, I am focused on advancing my full-stack skills and bridging technology with business needs.',
                    'I enjoy analyzing complex requirements and turning them into purposeful, user-centered solutions. Clean architecture, maintainability, and thoughtful design guide the entire development process.',
                    'Looking ahead, I plan to study Business Informatics to deepen my understanding of how software can create real strategic value in business environments.',
                ],
                'technology_heading' => 'Tools I work with',
                'technology_label' => 'Toolkit',
                'technology_intro' => 'A focused toolkit for backend systems, structured interfaces, data, and dependable delivery.',
                'technology_list' => [
                    ['name' => '.NET / C#', 'detail' => 'ASP.NET Core · REST APIs', 'icon' => 'dotnet', 'fallback' => '.N', 'color' => '#8b5cf6'],
                    ['name' => 'Angular', 'detail' => 'Structured frontend applications', 'icon' => 'angular', 'fallback' => 'A', 'color' => '#dd0031'],
                    ['name' => 'TypeScript', 'detail' => 'Typed interface logic', 'icon' => 'typescript', 'fallback' => 'TS', 'color' => '#3178c6'],
                    ['name' => 'PostgreSQL', 'detail' => 'Relational data modelling', 'icon' => 'postgresql', 'fallback' => 'PG', 'color' => '#4169e1'],
                    ['name' => 'Git', 'detail' => 'Version control and delivery', 'icon' => 'git', 'fallback' => 'G', 'color' => '#f05032'],
                ],
                'career_heading' => 'Career path',
                'career_label' => 'Experience',
                'career' => [
                    [
                        'period' => '08 / 2019 – 08 / 2023',
                        'title' => 'Application Developer EFZ',
                        'body' => 'Apprenticeship in application development at EcoLogic AG in Zurich.',
                    ],
                    [
                        'period' => '08 / 2023 – 08 / 2024',
                        'title' => 'BMS',
                        'body' => 'Vocational baccalaureate with a focus on economics and business fundamentals in Zurich.',
                    ],
                    [
                        'period' => '08 / 2024 – Now',
                        'title' => 'Software Developer',
                        'body' => 'Professional software development experience alongside independent web solutions and software projects.',
                    ],
                    [
                        'period' => '09 / 2026 – 09 / 2030',
                        'title' => 'Business Informatics BSc',
                        'body' => 'Planned studies at OST to connect software engineering with business thinking and strategic value.',
                    ],
                ],
            ],
            'projects_page' => [
                'eyebrow' => 'Selected work',
                'featured_label' => 'Featured build',
                'secondary_label' => 'Additional work',
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
                'eyebrow' => 'Start a conversation',
                'heading' => 'Contact',
                'intro' => 'Email is the best first step. Send the rough goal, links, constraints, and what a good outcome should feel like.',
                'direct_label' => 'Write directly',
                'direct_heading' => 'Tell me what you want to build.',
                'context_label' => 'A useful first note',
                'context' => 'A short outline of the goal, timing, and relevant links is enough. I will reply with the next useful steps.',
                'channels_label' => 'Elsewhere',
            ],
            'not_found' => [
                'eyebrow' => 'Lost route',
                'heading' => 'Page not found',
                'intro' => 'The address does not lead anywhere, but the rest of the portfolio is right where it should be.',
                'action' => 'Back to home',
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
                'description' => 'Persönliches Portfolio von Jeremy Läderach, einem Softwareentwickler mit Fokus auf praktische Websysteme mit Laravel, .NET und Angular.',
            ],
            'ui' => [
                'skip' => 'Zum Inhalt springen',
                'language' => 'Sprache',
                'menu' => 'Hauptnavigation',
                'brand' => 'Jeremy Läderach Startseite',
                'role' => 'Softwareentwickler',
                'open' => 'Öffnen',
                'footer_navigation' => 'Entdecken',
                'back_to_top' => 'Nach oben',
                'sound_mute' => 'Interface-Töne ausschalten',
                'sound_enable' => 'Interface-Töne einschalten',
            ],
            'nav' => [
                ['label' => 'Start', 'route' => 'home', 'icon' => 'home'],
                ['label' => 'Projekte', 'route' => 'projects', 'icon' => 'folder'],
                ['label' => 'Profil', 'route' => 'about', 'icon' => 'user'],
                ['label' => 'Kontakt', 'route' => 'contact', 'icon' => 'mail'],
            ],
            'home' => [
                'statement' => 'Ich entwickle',
                'statement_accent' => 'nützliche digitale Systeme.',
                'summary' => 'Ich entwickle nützliche digitale Systeme und durchdachte Web-Erlebnisse.',
                'explore' => 'Projekte entdecken',
                'index_label' => 'Start',
                'routes' => [
                    [
                        'label' => 'Projekte',
                        'description' => 'Produkte, Migrationen und Kundenprojekte.',
                        'route' => 'projects',
                    ],
                    [
                        'label' => 'Über mich',
                        'description' => 'Hintergrund, Erfahrung und die Technologien hinter meiner Arbeit.',
                        'route' => 'about',
                    ],
                    [
                        'label' => 'Kontakt',
                        'description' => 'Der direkte Weg für eine fokussierte Zusammenarbeit.',
                        'route' => 'contact',
                    ],
                ],
            ],
            'about_page' => [
                'eyebrow' => 'Profil',
                'heading' => 'Über mich',
                'intro' => 'Ich bin Softwareentwickler mit fundierter Ausbildung in der Applikationsentwicklung. Mein Fokus liegt auf Full-Stack-Systemen, die technische Möglichkeiten mit konkreten Geschäftsanforderungen verbinden.',
                'story_link' => 'Mein Weg',
                'story_heading' => 'Software mit klarem Zweck, entwickelt aus konkreten Anforderungen.',
                'body' => [
                    'Durch meine EFZ-Lehre als Applikationsentwickler habe ich eine solide technische Grundlage aufgebaut. Heute vertiefe ich meine Full-Stack-Kompetenzen und verbinde Softwareentwicklung mit wirtschaftlichem Verständnis.',
                    'Komplexe Anforderungen zerlege ich in klare, nutzerorientierte Lösungen. Saubere Architektur, Wartbarkeit und durchdachtes Design prägen dabei den gesamten Entwicklungsprozess.',
                    'Als Nächstes plane ich ein Studium in Wirtschaftsinformatik, um technische Entscheidungen noch stärker mit strategischem Mehrwert für Unternehmen zu verbinden.',
                ],
                'technology_heading' => 'Technologien, mit denen ich arbeite',
                'technology_label' => 'Werkzeuge',
                'technology_intro' => 'Eine fokussierte Auswahl für Backend-Systeme, strukturierte Oberflächen, Daten und zuverlässige Auslieferung.',
                'technology_list' => [
                    ['name' => '.NET / C#', 'detail' => 'ASP.NET Core · REST APIs', 'icon' => 'dotnet', 'fallback' => '.N', 'color' => '#8b5cf6'],
                    ['name' => 'Angular', 'detail' => 'Strukturierte Frontend-Anwendungen', 'icon' => 'angular', 'fallback' => 'A', 'color' => '#dd0031'],
                    ['name' => 'TypeScript', 'detail' => 'Typsichere Frontend-Logik', 'icon' => 'typescript', 'fallback' => 'TS', 'color' => '#3178c6'],
                    ['name' => 'PostgreSQL', 'detail' => 'Relationale Datenmodellierung', 'icon' => 'postgresql', 'fallback' => 'PG', 'color' => '#4169e1'],
                    ['name' => 'Git', 'detail' => 'Versionskontrolle und Auslieferung', 'icon' => 'git', 'fallback' => 'G', 'color' => '#f05032'],
                ],
                'career_heading' => 'Werdegang',
                'career_label' => 'Erfahrung',
                'career' => [
                    [
                        'period' => '08 / 2019 – 08 / 2023',
                        'title' => 'Applikationsentwickler EFZ',
                        'body' => 'Lehre in Applikationsentwicklung bei der EcoLogic AG in Zürich.',
                    ],
                    [
                        'period' => '08 / 2023 – 08 / 2024',
                        'title' => 'BMS',
                        'body' => 'Berufsmaturität mit Schwerpunkt Wirtschaft in Zürich.',
                    ],
                    [
                        'period' => '08 / 2024 – Heute',
                        'title' => 'Softwareentwickler',
                        'body' => 'Berufserfahrung in der Softwareentwicklung sowie Arbeit an eigenen Weblösungen und Softwareprojekten.',
                    ],
                    [
                        'period' => '09 / 2026 – 09 / 2030',
                        'title' => 'BSc Wirtschaftsinformatik',
                        'body' => 'Geplantes Studium an der OST, um Softwareentwicklung mit wirtschaftlichem Denken und strategischem Nutzen zu verbinden.',
                    ],
                ],
            ],
            'projects_page' => [
                'eyebrow' => 'Ausgewählte Arbeiten',
                'featured_label' => 'Hauptprojekt',
                'secondary_label' => 'Weitere Arbeiten',
                'heading' => 'Projekte',
                'intro' => 'Drei Projekte aus eigener Produktentwicklung, Kundenarbeit und wartbaren Weblösungen.',
                'items' => [
                    [
                        'name' => 'Quantified',
                        'type' => 'Eigenes Full-Stack-Produkt',
                        'description' => 'Ein persönliches Dashboard für Finanzen, Zeit, Gewohnheiten und wichtige Lebensbereiche.',
                        'tags' => ['.NET', 'Angular', 'PostgreSQL'],
                    ],
                    [
                        'name' => 'Jay-Jay Web',
                        'type' => 'Webdienstleistungen',
                        'description' => 'Eine ruhige Web-Plattform für Websites, Hosting, Domains und Betreuung.',
                        'tags' => ['Websites', 'Hosting', 'WordPress'],
                    ],
                    [
                        'name' => 'Scherer Garten',
                        'type' => 'Kundenwebsite und Betreuung',
                        'description' => 'Eine moderne Website mit verlässlichem Hosting für einen Schweizer Garten- und Landschaftsbaubetrieb.',
                        'tags' => ['Webdesign', 'WordPress', 'Hosting'],
                    ],
                ],
            ],
            'contact_page' => [
                'eyebrow' => 'Gespräch beginnen',
                'heading' => 'Kontakt',
                'intro' => 'E-Mail ist der beste erste Schritt. Schick mir dein Ziel, relevante Links und die wichtigsten Rahmenbedingungen.',
                'direct_label' => 'Direkt schreiben',
                'direct_heading' => 'Erzähl mir, was du umsetzen möchtest.',
                'context_label' => 'Für einen guten Start',
                'context' => 'Ein kurzer Überblick über Ziel, Zeitrahmen und relevante Links reicht. Ich melde mich mit den nächsten sinnvollen Schritten.',
                'channels_label' => 'Weitere Profile',
            ],
            'not_found' => [
                'eyebrow' => 'Falscher Weg',
                'heading' => 'Seite nicht gefunden',
                'intro' => 'Diese Adresse führt nirgendwohin. Der Rest des Portfolios ist aber genau dort, wo er sein soll.',
                'action' => 'Zurück zur Startseite',
            ],
            'imprint' => [
                'title' => 'Impressum',
                'intro' => 'Rechtliche Angaben zu diesem persönlichen Portfolio.',
                'sections' => [
                    ['title' => 'Verantwortlich für den Inhalt', 'body' => ['Jeremy Läderach', 'Schweiz']],
                    ['title' => 'Kontakt', 'body' => ['info@jeremylaederach.ch']],
                    ['title' => 'Hinweis', 'body' => ['Dieser Laravel-Prototyp hält die rechtliche Seite bewusst kompakt. Angaben zur Geschäftsadresse und zum Datenschutz können vor dem Produktionsstart ergänzt werden.']],
                ],
            ],
        ],
    ],
];
