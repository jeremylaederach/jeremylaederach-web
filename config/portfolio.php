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
                'description' => 'Personal portfolio of Jeremy Läderach, a software developer building practical web systems with Laravel, .NET, and Angular.',
            ],
            'ui' => [
                'skip' => 'Skip to content',
                'language' => 'Language',
                'menu' => 'Primary navigation',
                'brand' => 'Jeremy Läderach home',
                'footer_note' => 'Built with Laravel, Blade, and a small purple cat.',
            ],
            'nav' => [
                ['label' => 'Home', 'route' => 'home', 'icon' => 'home'],
                ['label' => 'About', 'anchor' => '#stage-about', 'icon' => 'user'],
                ['label' => 'Work', 'anchor' => '#stage-work', 'icon' => 'folder'],
                ['label' => 'Contact', 'route' => 'contact', 'icon' => 'mail'],
            ],
            'hero' => [
                'backdrop' => ['SOFTWARE', 'ENGINEER'],
                'bubble' => 'Pick a prop.',
                'stage' => [
                    [
                        'key' => 'work',
                        'label' => 'Work',
                        'message' => 'Proof of work first: selected builds, client work, and product experiments.',
                    ],
                    [
                        'key' => 'about',
                        'label' => 'About',
                        'message' => 'Short version: calm systems, useful UI, maintainable code.',
                    ],
                    [
                        'key' => 'stack',
                        'label' => 'Stack',
                        'message' => 'Laravel, .NET, Angular, and the boring bits that make software ship.',
                    ],
                    [
                        'key' => 'contact',
                        'label' => 'Contact',
                        'message' => 'Email is the cleanest first step. Send context and the goal.',
                    ],
                ],
            ],
            'contact' => [
                'kicker' => 'Contact',
            ],
            'contact_page' => [
                'title' => 'Contact',
                'intro' => 'The contact form can come later. For this prototype, direct links keep the path simple and reliable.',
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
                'description' => 'Persönliches Portfolio von Jeremy Läderach, Software Developer mit Fokus auf praktische Websysteme mit Laravel, .NET und Angular.',
            ],
            'ui' => [
                'skip' => 'Zum Inhalt springen',
                'language' => 'Sprache',
                'menu' => 'Hauptnavigation',
                'brand' => 'Jeremy Läderach Startseite',
                'footer_note' => 'Gebaut mit Laravel, Blade und einer kleinen violetten Katze.',
            ],
            'nav' => [
                ['label' => 'Start', 'route' => 'home', 'icon' => 'home'],
                ['label' => 'Profil', 'anchor' => '#stage-about', 'icon' => 'user'],
                ['label' => 'Arbeit', 'anchor' => '#stage-work', 'icon' => 'folder'],
                ['label' => 'Kontakt', 'route' => 'contact', 'icon' => 'mail'],
            ],
            'hero' => [
                'backdrop' => ['SOFTWARE', 'ENGINEER'],
                'bubble' => 'Wähl ein Prop.',
                'stage' => [
                    [
                        'key' => 'work',
                        'label' => 'Arbeit',
                        'message' => 'Proof of Work zuerst: Builds, Kundenarbeit und Produkt-Experimente.',
                    ],
                    [
                        'key' => 'about',
                        'label' => 'Profil',
                        'message' => 'Kurz gesagt: ruhige Systeme, nützliche UI, wartbarer Code.',
                    ],
                    [
                        'key' => 'stack',
                        'label' => 'Stack',
                        'message' => 'Laravel, .NET, Angular und die soliden Details, die Software lieferbar machen.',
                    ],
                    [
                        'key' => 'contact',
                        'label' => 'Kontakt',
                        'message' => 'E-Mail ist der sauberste erste Schritt. Schick Kontext und Ziel.',
                    ],
                ],
            ],
            'contact' => [
                'kicker' => 'Kontakt',
            ],
            'contact_page' => [
                'title' => 'Kontakt',
                'intro' => 'Ein Kontaktformular kann später dazukommen. Für diesen Prototyp bleiben direkte Links einfach und zuverlässig.',
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
