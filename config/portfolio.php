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
                        'description' => 'How I work, what I value, and the stack behind it.',
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
                'body' => [
                    'My path started with an EFZ apprenticeship in application development. Since then, I have continued building experience across backend systems, structured frontend applications, APIs, databases, and practical web delivery.',
                    'I enjoy analyzing complex requirements and turning them into purposeful, user-centered solutions. Clean architecture, maintainability, and thoughtful design guide the entire development process.',
                ],
                'technology_heading' => 'Tools I work with',
                'technology_list' => ['.NET / C#', 'ASP.NET Core', 'Angular', 'TypeScript / JavaScript', 'PostgreSQL / SQL', 'REST APIs', 'Git'],
                'principles_heading' => 'How I work',
                'principles' => [
                    ['title' => 'Understand the problem', 'body' => 'Analyze the requirements and the people behind them before deciding what to build.'],
                    ['title' => 'Build for change', 'body' => 'Use clear architecture and understandable code so the system can evolve with confidence.'],
                    ['title' => 'Deliver usable software', 'body' => 'Connect data, logic, and interface into something that works in real-world scenarios.'],
                ],
                'facts_heading' => 'At a glance',
                'facts' => [
                    ['value' => 'EFZ', 'label' => 'Application development foundation'],
                    ['value' => '08 / 2024', 'label' => 'Working as a software developer'],
                    ['value' => '09 / 2026', 'label' => 'Business Informatics at OST'],
                ],
                'career_heading' => 'Career path',
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
                'context_label' => 'A useful first note',
                'context' => 'A short outline of the goal, timing, and relevant links is enough to get started.',
                'form_heading' => 'Or leave a note',
                'form' => [
                    'name' => 'Name',
                    'email' => 'Email',
                    'message' => 'Message',
                    'submit' => 'Send message',
                ],
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
                'description' => 'Persönliches Portfolio von Jeremy Läderach, Software Engineer mit Fokus auf praktische Websysteme mit Laravel, .NET und Angular.',
            ],
            'ui' => [
                'skip' => 'Zum Inhalt springen',
                'language' => 'Sprache',
                'menu' => 'Hauptnavigation',
                'brand' => 'Jeremy Läderach Startseite',
                'role' => 'Software Engineer',
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
                        'description' => 'Wie ich arbeite, was mir wichtig ist und mein Stack.',
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
                'intro' => 'Ich bin Softwareentwickler mit einer fundierten Basis in der Applikationsentwicklung und einem Fokus auf Fullstack-Systeme, die Technologie mit echten Geschäftsanforderungen verbinden.',
                'body' => [
                    'Mein Weg begann mit einer EFZ-Lehre in Applikationsentwicklung. Seither sammle ich Erfahrung mit Backend-Systemen, strukturierten Frontend-Anwendungen, APIs, Datenbanken und praktischer Web-Delivery.',
                    'Ich analysiere gerne komplexe Anforderungen und übersetze sie in zielgerichtete, nutzerorientierte Lösungen. Klare Architektur, Wartbarkeit und durchdachtes Design begleiten den gesamten Entwicklungsprozess.',
                ],
                'technology_heading' => 'Tools, mit denen ich arbeite',
                'technology_list' => ['.NET / C#', 'ASP.NET Core', 'Angular', 'TypeScript / JavaScript', 'PostgreSQL / SQL', 'REST APIs', 'Git'],
                'principles_heading' => 'Wie ich arbeite',
                'principles' => [
                    ['title' => 'Das Problem verstehen', 'body' => 'Anforderungen und die Menschen dahinter analysieren, bevor die Umsetzung beginnt.'],
                    ['title' => 'Für Veränderung bauen', 'body' => 'Klare Architektur und verständlicher Code schaffen Sicherheit für die Weiterentwicklung.'],
                    ['title' => 'Nutzbare Software liefern', 'body' => 'Daten, Logik und Oberfläche zu einer Lösung verbinden, die im Alltag funktioniert.'],
                ],
                'facts_heading' => 'Auf einen Blick',
                'facts' => [
                    ['value' => 'EFZ', 'label' => 'Fundament in Applikationsentwicklung'],
                    ['value' => '08 / 2024', 'label' => 'Als Softwareentwickler tätig'],
                    ['value' => '09 / 2026', 'label' => 'Wirtschaftsinformatik an der OST'],
                ],
                'career_heading' => 'Werdegang',
                'career' => [
                    [
                        'period' => '08 / 2019 – 08 / 2023',
                        'title' => 'Applikationsentwickler EFZ',
                        'body' => 'Lehre in Applikationsentwicklung bei der EcoLogic AG in Zürich.',
                    ],
                    [
                        'period' => '08 / 2023 – 08 / 2024',
                        'title' => 'BMS',
                        'body' => 'Berufsmaturität mit Fokus auf Wirtschaft und betriebswirtschaftliche Grundlagen in Zürich.',
                    ],
                    [
                        'period' => '08 / 2024 – Heute',
                        'title' => 'Softwareentwickler',
                        'body' => 'Berufserfahrung in der Softwareentwicklung sowie eigene Weblösungen und Softwareprojekte.',
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
                'eyebrow' => 'Gespräch beginnen',
                'heading' => 'Kontakt',
                'intro' => 'E-Mail ist der beste erste Schritt. Schick das grobe Ziel, Links, Rahmenbedingungen und wie ein gutes Resultat wirken soll.',
                'direct_label' => 'Direkt schreiben',
                'context_label' => 'Eine hilfreiche erste Nachricht',
                'context' => 'Ein kurzer Überblick über Ziel, Zeitrahmen und relevante Links reicht für den Einstieg.',
                'form_heading' => 'Oder eine Nachricht hinterlassen',
                'form' => [
                    'name' => 'Name',
                    'email' => 'E-Mail',
                    'message' => 'Nachricht',
                    'submit' => 'Nachricht senden',
                ],
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
                    ['title' => 'Hinweis', 'body' => ['Dieser Laravel-Prototyp hält die rechtliche Seite bewusst kompakt. Weitere Geschäftsadresse- oder Datenschutzangaben können vor dem Produktionslaunch ergänzt werden.']],
                ],
            ],
        ],
    ],
];
