<section class="liquid-index" aria-labelledby="landing-title" data-liquid-index>
    <div class="liquid-index__light" aria-hidden="true"></div>

    <div class="home-shell liquid-index__inner">
        <div class="liquid-index__copy">
            <p class="liquid-index__eyebrow">{{ $content['home']['greeting'] }}</p>
            <h1 id="landing-title">
                <span>Software</span>
                <span>Engineer</span>
            </h1>
            <p class="liquid-index__intro">{{ $content['home']['intro'] }}</p>
        </div>

        <div class="liquid-stage" data-liquid-stage aria-hidden="true">
            <svg
                class="liquid-stage__svg"
                data-liquid-svg
                viewBox="0 0 1000 800"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="liquid-body-gradient" x1="140" y1="100" x2="860" y2="730" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#120923" />
                        <stop offset="0.34" stop-color="#32105F" />
                        <stop offset="0.68" stop-color="#8E3FE0" />
                        <stop offset="1" stop-color="#251044" />
                        <animate
                            attributeName="x1"
                            dur="18s"
                            repeatCount="indefinite"
                            values="140;220;140"
                            calcMode="spline"
                            keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
                        />
                    </linearGradient>

                    <radialGradient id="liquid-sheen-gradient" cx="0" cy="0" r="1" gradientTransform="translate(410 220) rotate(53) scale(500 580)" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#F5F2FF" stop-opacity="0.22" />
                        <stop offset="0.34" stop-color="#D99BFF" stop-opacity="0.08" />
                        <stop offset="0.74" stop-color="#05010D" stop-opacity="0" />
                    </radialGradient>

                    <linearGradient id="liquid-satellite-gradient" x1="760" y1="70" x2="910" y2="250" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#D99BFF" />
                        <stop offset="0.52" stop-color="#8C38DE" />
                        <stop offset="1" stop-color="#31105F" />
                    </linearGradient>
                </defs>

                <path
                    class="liquid-stage__aura"
                    d="M160 150C270 65 430 90 520 145C625 205 760 125 850 220C940 315 890 455 810 520C720 594 720 720 590 748C450 778 370 676 252 675C132 674 62 570 95 460C124 365 72 236 160 150Z"
                >
                    <animate
                        attributeName="d"
                        dur="20s"
                        repeatCount="indefinite"
                        values="M160 150C270 65 430 90 520 145C625 205 760 125 850 220C940 315 890 455 810 520C720 594 720 720 590 748C450 778 370 676 252 675C132 674 62 570 95 460C124 365 72 236 160 150Z;M145 180C240 82 406 60 525 130C644 200 766 160 844 244C924 332 914 470 798 532C682 594 738 706 588 755C438 804 342 704 240 654C138 604 82 540 105 430C128 320 54 276 145 180Z;M182 132C298 48 430 112 548 154C666 196 786 118 862 238C938 358 856 444 824 548C792 652 700 748 570 735C440 722 360 646 238 688C116 730 54 574 112 458C170 342 66 216 182 132Z;M160 150C270 65 430 90 520 145C625 205 760 125 850 220C940 315 890 455 810 520C720 594 720 720 590 748C450 778 370 676 252 675C132 674 62 570 95 460C124 365 72 236 160 150Z"
                        calcMode="spline"
                        keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"
                    />
                </path>

                <path
                    class="liquid-stage__body"
                    d="M160 150C270 65 430 90 520 145C625 205 760 125 850 220C940 315 890 455 810 520C720 594 720 720 590 748C450 778 370 676 252 675C132 674 62 570 95 460C124 365 72 236 160 150Z"
                    fill="url(#liquid-body-gradient)"
                >
                    <animate
                        attributeName="d"
                        dur="20s"
                        repeatCount="indefinite"
                        values="M160 150C270 65 430 90 520 145C625 205 760 125 850 220C940 315 890 455 810 520C720 594 720 720 590 748C450 778 370 676 252 675C132 674 62 570 95 460C124 365 72 236 160 150Z;M145 180C240 82 406 60 525 130C644 200 766 160 844 244C924 332 914 470 798 532C682 594 738 706 588 755C438 804 342 704 240 654C138 604 82 540 105 430C128 320 54 276 145 180Z;M182 132C298 48 430 112 548 154C666 196 786 118 862 238C938 358 856 444 824 548C792 652 700 748 570 735C440 722 360 646 238 688C116 730 54 574 112 458C170 342 66 216 182 132Z;M160 150C270 65 430 90 520 145C625 205 760 125 850 220C940 315 890 455 810 520C720 594 720 720 590 748C450 778 370 676 252 675C132 674 62 570 95 460C124 365 72 236 160 150Z"
                        calcMode="spline"
                        keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"
                    />
                </path>

                <path
                    class="liquid-stage__sheen"
                    d="M160 150C270 65 430 90 520 145C625 205 760 125 850 220C940 315 890 455 810 520C720 594 720 720 590 748C450 778 370 676 252 675C132 674 62 570 95 460C124 365 72 236 160 150Z"
                    fill="url(#liquid-sheen-gradient)"
                >
                    <animate
                        attributeName="d"
                        dur="20s"
                        repeatCount="indefinite"
                        values="M160 150C270 65 430 90 520 145C625 205 760 125 850 220C940 315 890 455 810 520C720 594 720 720 590 748C450 778 370 676 252 675C132 674 62 570 95 460C124 365 72 236 160 150Z;M145 180C240 82 406 60 525 130C644 200 766 160 844 244C924 332 914 470 798 532C682 594 738 706 588 755C438 804 342 704 240 654C138 604 82 540 105 430C128 320 54 276 145 180Z;M182 132C298 48 430 112 548 154C666 196 786 118 862 238C938 358 856 444 824 548C792 652 700 748 570 735C440 722 360 646 238 688C116 730 54 574 112 458C170 342 66 216 182 132Z;M160 150C270 65 430 90 520 145C625 205 760 125 850 220C940 315 890 455 810 520C720 594 720 720 590 748C450 778 370 676 252 675C132 674 62 570 95 460C124 365 72 236 160 150Z"
                        calcMode="spline"
                        keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"
                    />
                </path>

                <path class="liquid-stage__contour liquid-stage__contour--one" d="M144 392C288 298 424 378 528 330C638 279 731 220 855 273" />
                <path class="liquid-stage__contour liquid-stage__contour--two" d="M121 525C260 451 397 537 521 476C655 410 728 404 842 443" />

                <path
                    class="liquid-stage__satellite"
                    d="M790 96C830 55 895 76 911 129C927 182 886 231 839 218C792 205 750 137 790 96Z"
                    fill="url(#liquid-satellite-gradient)"
                >
                    <animate
                        attributeName="d"
                        dur="13s"
                        repeatCount="indefinite"
                        values="M790 96C830 55 895 76 911 129C927 182 886 231 839 218C792 205 750 137 790 96Z;M805 83C851 51 904 89 908 144C912 199 866 231 821 205C776 179 759 115 805 83Z;M790 96C830 55 895 76 911 129C927 182 886 231 839 218C792 205 750 137 790 96Z"
                        calcMode="spline"
                        keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
                    />
                </path>
            </svg>
        </div>

        <nav class="liquid-routes" aria-label="{{ $content['ui']['menu'] }}" data-liquid-routes>
            @foreach ($content['home']['routes'] as $route)
                <a
                    class="liquid-route"
                    href="{{ route($route['route'], ['locale' => $locale]) }}"
                    data-liquid-route="{{ $route['route'] }}"
                    data-liquid-navigation
                    style="--route-index: {{ $loop->index }}"
                >
                    <span>
                        <strong>{{ $route['label'] }}</strong>
                        <small>{{ $route['description'] }}</small>
                    </span>
                    <x-nav-icon name="arrow-right" />
                </a>
            @endforeach
        </nav>
    </div>
</section>
