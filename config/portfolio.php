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
                'title' => 'Jeremy Läderach - Software Developer',
                'description' => 'Personal portfolio of Jeremy Läderach, a software developer building Laravel, .NET, Angular, and business web projects.',
            ],
            'ui' => [
                'skip' => 'Skip to content',
                'language' => 'Language',
                'menu' => 'Primary navigation',
                'brand' => 'Jeremy Läderach home',
                'footer_note' => 'Built with Laravel, Blade, TailwindCSS, and a small purple cat.',
            ],
            'nav' => [
                ['label' => 'About', 'anchor' => '#about'],
                ['label' => 'Projects', 'anchor' => '#projects'],
                ['label' => 'Stack', 'anchor' => '#stack'],
                ['label' => 'CV', 'anchor' => '#career'],
                ['label' => 'Contact', 'route' => 'contact'],
            ],
            'hero' => [
                'title' => 'Sharp software, calmly built.',
                'lede' => 'I turn messy requirements into maintainable web applications, business websites, and systems people can actually use.',
                'proof' => [
                    'label' => 'Portfolio proof map',
                    'orbit_label' => 'Portfolio capabilities',
                    'signals' => [
                        ['label' => 'Laravel', 'class' => 'laravel', 'track' => 'outer'],
                        ['label' => 'Clients', 'class' => 'client', 'track' => 'outer'],
                        ['label' => 'Angular', 'class' => 'angular', 'track' => 'middle'],
                        ['label' => '.NET APIs', 'class' => 'dotnet', 'track' => 'middle'],
                        ['label' => 'Hosting', 'class' => 'hosting', 'track' => 'inner'],
                        ['label' => 'GitHub', 'class' => 'github', 'track' => 'inner'],
                    ],
                ],
            ],
            'about' => [
                'kicker' => 'About',
                'title' => 'A practical developer profile with room for ambition.',
                'body' => [
                    'I completed application-development training at EcoLogic AG in Zurich and continue to build on that foundation through professional software work, independent web projects, and product-minded full-stack experiments.',
                    'My strongest interest is the point where clean code, structured data, thoughtful UI, and business value meet. I like turning broad requirements into small, reliable systems that people can actually use.',
                    'Next, I plan to study Business Informatics at OST from September 2026 to deepen the connection between software engineering and business thinking.',
                ],
                'highlights' => [
                    ['label' => 'Development style', 'value' => 'Clear structure, maintainability, real deployment constraints.'],
                    ['label' => 'Current direction', 'value' => 'Laravel portfolios, WordPress-to-Laravel migrations, .NET and Angular apps.'],
                    ['label' => 'Useful edge', 'value' => 'Comfortable moving between code, hosting, domains, and small-business needs.'],
                ],
            ],
            'projects' => [
                'kicker' => 'Projects',
                'title' => 'Real proof of work, not filler.',
                'intro' => 'A focused selection of projects that show client work, personal product thinking, full-stack practice, and this new portfolio foundation.',
                'items' => [
                    [
                        'name' => 'Quantified',
                        'type' => 'Personal full-stack project',
                        'description' => 'A personal assistant and life-tracking dashboard for finances, time, activities, and life areas. The current focus is clean architecture, structured data handling, and practical insight over vanity metrics.',
                        'tags' => ['.NET', 'Angular', 'PostgreSQL', 'REST APIs'],
                        'image' => 'assets/projects/personal-assistant-icon.png',
                    ],
                    [
                        'name' => 'Jay-Jay',
                        'type' => 'Web solutions business',
                        'description' => 'A personal web business focused on building and maintaining websites for small-business use cases, from hosting and domains to clean implementation and contact/newsletter integrations.',
                        'tags' => ['Websites', 'Hosting', 'WordPress', 'Plesk'],
                        'image' => 'assets/projects/jay-jay-icon.png',
                    ],
                    [
                        'name' => 'Scherer Gartengestaltung',
                        'type' => 'Client/business website',
                        'description' => 'A practical business web presence for Scherer Gartengestaltung & Pflege, shaped around clear contact paths, local service information, and a maintainable small-business setup.',
                        'tags' => ['Client work', 'WordPress', 'Hosting', 'Local business'],
                        'visual' => 'garden',
                    ],
                    [
                        'name' => 'jeremylaederach-web',
                        'type' => 'This Laravel portfolio',
                        'description' => 'A WordPress-to-Laravel portfolio rebuild with Blade components, TailwindCSS, simple EN/DE routing, and an asset structure ready for iterative refinement.',
                        'tags' => ['Laravel', 'Blade', 'TailwindCSS', 'i18n'],
                        'visual' => 'portfolio',
                    ],
                ],
            ],
            'stack' => [
                'kicker' => 'Stack',
                'title' => 'Tools I use to get from idea to deployed website.',
                'groups' => [
                    [
                        'name' => 'Laravel web',
                        'items' => ['Laravel', 'Blade', 'TailwindCSS', 'PHP', 'JavaScript'],
                    ],
                    [
                        'name' => 'Application development',
                        'items' => ['C#', 'ASP.NET Core', 'Angular', 'TypeScript', 'SQL', 'REST APIs'],
                    ],
                    [
                        'name' => 'Delivery',
                        'items' => ['Git', 'GitHub', 'Hosttech/Plesk', 'Domains', 'WordPress migrations'],
                    ],
                ],
            ],
            'career' => [
                'kicker' => 'Career',
                'title' => 'A compact CV overview.',
                'items' => [
                    [
                        'period' => '08/2019 - 08/2023',
                        'title' => 'Apprenticeship',
                        'description' => 'Computer Scientist EFZ specializing in application development at EcoLogic AG, Zurich.',
                    ],
                    [
                        'period' => '08/2023 - 08/2024',
                        'title' => 'BMS',
                        'description' => 'BMS with a focus on economics and business fundamentals in Zurich.',
                    ],
                    [
                        'period' => '08/2024 - now',
                        'title' => 'Software Developer',
                        'description' => 'Professional software development experience plus independent web solutions and practical software projects.',
                    ],
                    [
                        'period' => '09/2026 - 09/2030',
                        'title' => 'Business Informatics (BSc)',
                        'description' => 'Planned studies at OST to connect software development with business thinking.',
                    ],
                ],
            ],
            'contact' => [
                'kicker' => 'Contact',
                'title' => 'Have a project, role, or technical idea worth making real?',
                'intro' => 'Email is the best first step. I am especially interested in Laravel foundations, .NET/Angular work, portfolio rebuilds, and small-business web systems.',
                'cards' => [
                    ['label' => 'Best for', 'value' => 'Software engineering roles, focused web builds, migrations, and practical product ideas.'],
                    ['label' => 'Response path', 'value' => 'Send context, links, and the rough goal. I will take it from there.'],
                ],
            ],
            'contact_page' => [
                'title' => 'Contact',
                'intro' => 'The contact form can come later. For this first version, direct links keep the path simple and reliable.',
                'reasons' => ['Software engineering opportunities', 'Laravel or .NET project work', 'WordPress-to-Laravel migrations', 'Small-business websites and hosting setup'],
            ],
            'imprint' => [
                'title' => 'Imprint',
                'intro' => 'Legal and ownership details for this personal portfolio.',
                'sections' => [
                    ['title' => 'Responsible for content', 'body' => ['Jeremy Läderach', 'Switzerland']],
                    ['title' => 'Contact', 'body' => ['info@jeremylaederach.ch']],
                    ['title' => 'Note', 'body' => ['This first Laravel version keeps the legal page intentionally compact. Additional business address or privacy details can be added before production launch.']],
                ],
            ],
        ],

        'de' => [
            'meta' => [
                'title' => 'Jeremy Läderach - Software Developer',
                'description' => 'Persönliches Portfolio von Jeremy Läderach, Software Developer mit Laravel, .NET, Angular und Business-Webprojekten.',
            ],
            'ui' => [
                'skip' => 'Zum Inhalt springen',
                'language' => 'Sprache',
                'menu' => 'Hauptnavigation',
                'brand' => 'Jeremy Läderach Startseite',
                'footer_note' => 'Gebaut mit Laravel, Blade, TailwindCSS und einer kleinen violetten Katze.',
            ],
            'nav' => [
                ['label' => 'Profil', 'anchor' => '#about'],
                ['label' => 'Projekte', 'anchor' => '#projects'],
                ['label' => 'Stack', 'anchor' => '#stack'],
                ['label' => 'CV', 'anchor' => '#career'],
                ['label' => 'Kontakt', 'route' => 'contact'],
            ],
            'hero' => [
                'title' => 'Scharfe Software, ruhig gebaut.',
                'lede' => 'Ich übersetze unklare Anforderungen in wartbare Webanwendungen, Business-Websites und Systeme, die Menschen wirklich nutzen können.',
                'proof' => [
                    'label' => 'Portfolio Proof Map',
                    'orbit_label' => 'Portfolio-Felder',
                    'signals' => [
                        ['label' => 'Laravel', 'class' => 'laravel', 'track' => 'outer'],
                        ['label' => 'Kunden', 'class' => 'client', 'track' => 'outer'],
                        ['label' => 'Angular', 'class' => 'angular', 'track' => 'middle'],
                        ['label' => '.NET APIs', 'class' => 'dotnet', 'track' => 'middle'],
                        ['label' => 'Hosting', 'class' => 'hosting', 'track' => 'inner'],
                        ['label' => 'GitHub', 'class' => 'github', 'track' => 'inner'],
                    ],
                ],
            ],
            'about' => [
                'kicker' => 'Profil',
                'title' => 'Ein praktisches Entwicklerprofil mit Ambition.',
                'body' => [
                    'Ich habe meine Ausbildung in Applikationsentwicklung bei der EcoLogic AG in Zürich abgeschlossen und baue darauf mit professioneller Softwarearbeit, eigenen Webprojekten und produktorientierten Fullstack-Experimenten auf.',
                    'Mich interessiert besonders der Punkt, an dem sauberer Code, strukturierte Daten, durchdachte Oberflächen und Business-Nutzen zusammenkommen. Ich übersetze breite Anforderungen gerne in kleine, verlässliche Systeme.',
                    'Ab September 2026 plane ich das Studium Wirtschaftsinformatik an der OST, um Softwareentwicklung und Business-Denken noch stärker zu verbinden.',
                ],
                'highlights' => [
                    ['label' => 'Arbeitsweise', 'value' => 'Klare Struktur, Wartbarkeit und realistische Deployment-Anforderungen.'],
                    ['label' => 'Aktueller Fokus', 'value' => 'Laravel-Portfolios, WordPress-zu-Laravel-Migrationen, .NET- und Angular-Apps.'],
                    ['label' => 'Praktischer Vorteil', 'value' => 'Ich bewege mich sicher zwischen Code, Hosting, Domains und KMU-Anforderungen.'],
                ],
            ],
            'projects' => [
                'kicker' => 'Projekte',
                'title' => 'Echte Arbeit statt Platzhalter.',
                'intro' => 'Eine fokussierte Auswahl aus Kundenarbeit, persönlichen Produkten, Fullstack-Praxis und diesem neuen Portfolio-Fundament.',
                'items' => [
                    [
                        'name' => 'Quantified',
                        'type' => 'Persönliches Fullstack-Projekt',
                        'description' => 'Ein Personal-Assistant- und Life-Tracking-Dashboard für Finanzen, Zeit, Aktivitäten und Lebensbereiche. Aktuell liegt der Fokus auf sauberer Architektur, strukturierten Daten und nützlichen Erkenntnissen.',
                        'tags' => ['.NET', 'Angular', 'PostgreSQL', 'REST APIs'],
                        'image' => 'assets/projects/personal-assistant-icon.png',
                    ],
                    [
                        'name' => 'Jay-Jay',
                        'type' => 'Web-Solutions-Business',
                        'description' => 'Ein eigenes Web-Business für kleine Unternehmen: Hosting, Domains, saubere Umsetzung und Integrationen wie Kontakt- oder Newsletter-Systeme.',
                        'tags' => ['Websites', 'Hosting', 'WordPress', 'Plesk'],
                        'image' => 'assets/projects/jay-jay-icon.png',
                    ],
                    [
                        'name' => 'Scherer Gartengestaltung',
                        'type' => 'Kunden-/Business-Website',
                        'description' => 'Ein pragmatischer Webauftritt für Scherer Gartengestaltung & Pflege mit klaren Kontaktwegen, lokalen Service-Informationen und wartbarem Setup.',
                        'tags' => ['Kundenarbeit', 'WordPress', 'Hosting', 'Lokales Business'],
                        'visual' => 'garden',
                    ],
                    [
                        'name' => 'jeremylaederach-web',
                        'type' => 'Dieses Laravel-Portfolio',
                        'description' => 'Ein Portfolio-Rebuild von WordPress zu Laravel mit Blade-Komponenten, TailwindCSS, einfachem EN/DE-Routing und austauschbarer Asset-Struktur.',
                        'tags' => ['Laravel', 'Blade', 'TailwindCSS', 'i18n'],
                        'visual' => 'portfolio',
                    ],
                ],
            ],
            'stack' => [
                'kicker' => 'Stack',
                'title' => 'Werkzeuge vom Konzept bis zur deployten Website.',
                'groups' => [
                    [
                        'name' => 'Laravel Web',
                        'items' => ['Laravel', 'Blade', 'TailwindCSS', 'PHP', 'JavaScript'],
                    ],
                    [
                        'name' => 'Applikationsentwicklung',
                        'items' => ['C#', 'ASP.NET Core', 'Angular', 'TypeScript', 'SQL', 'REST APIs'],
                    ],
                    [
                        'name' => 'Delivery',
                        'items' => ['Git', 'GitHub', 'Hosttech/Plesk', 'Domains', 'WordPress-Migrationen'],
                    ],
                ],
            ],
            'career' => [
                'kicker' => 'Career',
                'title' => 'Ein kompakter CV-Überblick.',
                'items' => [
                    [
                        'period' => '08/2019 - 08/2023',
                        'title' => 'Lehre',
                        'description' => 'Applikationsentwicklung bei der EcoLogic AG, Zürich.',
                    ],
                    [
                        'period' => '08/2023 - 08/2024',
                        'title' => 'BMS',
                        'description' => 'BMS mit Fokus auf Wirtschaft und Business-Grundlagen in Zürich.',
                    ],
                    [
                        'period' => '08/2024 - heute',
                        'title' => 'Software Developer',
                        'description' => 'Professionelle Softwareentwicklung plus eigene Weblösungen und praktische Softwareprojekte.',
                    ],
                    [
                        'period' => '09/2026 - 09/2030',
                        'title' => 'Wirtschaftsinformatik (BSc)',
                        'description' => 'Geplantes Studium an der OST, um Softwareentwicklung und Business-Denken zu verbinden.',
                    ],
                ],
            ],
            'contact' => [
                'kicker' => 'Kontakt',
                'title' => 'Ein Projekt, eine Rolle oder eine technische Idee?',
                'intro' => 'E-Mail ist der beste erste Schritt. Besonders spannend sind Laravel-Fundamente, .NET/Angular-Arbeit, Portfolio-Rebuilds und Websysteme für kleine Unternehmen.',
                'cards' => [
                    ['label' => 'Passt gut für', 'value' => 'Software-Engineering-Rollen, fokussierte Web-Builds, Migrationen und praktische Produktideen.'],
                    ['label' => 'Kontaktweg', 'value' => 'Schick Kontext, Links und das grobe Ziel. Ich kümmere mich um den nächsten Schritt.'],
                ],
            ],
            'contact_page' => [
                'title' => 'Kontakt',
                'intro' => 'Ein Kontaktformular kann später dazukommen. Für diese erste Version bleiben direkte Links einfach und zuverlässig.',
                'reasons' => ['Software-Engineering-Rollen', 'Laravel- oder .NET-Projektarbeit', 'WordPress-zu-Laravel-Migrationen', 'KMU-Websites und Hosting-Setup'],
            ],
            'imprint' => [
                'title' => 'Impressum',
                'intro' => 'Rechtliche Angaben zu diesem persönlichen Portfolio.',
                'sections' => [
                    ['title' => 'Verantwortlich für den Inhalt', 'body' => ['Jeremy Läderach', 'Schweiz']],
                    ['title' => 'Kontakt', 'body' => ['info@jeremylaederach.ch']],
                    ['title' => 'Hinweis', 'body' => ['Diese erste Laravel-Version hält die rechtliche Seite bewusst kompakt. Weitere Geschäftsadresse- oder Datenschutzangaben können vor dem Produktionslaunch ergänzt werden.']],
                ],
            ],
        ],
    ],
];
