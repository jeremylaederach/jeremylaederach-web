import { createInteractionController } from './interaction-controller.js';
import { createPageRouter } from './page-router.js';
import { createSiteMenuController } from './site-menu.js';
import { createSoundController } from './sound-controller.js';
import { createPageTransitionController } from './transition-controller.js';

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

root.classList.add('js');

const interactionController = createInteractionController({ finePointer, reducedMotion });
const menuController = createSiteMenuController({ reducedMotion });
const soundController = createSoundController({ finePointer });
const transitionController = createPageTransitionController({ reducedMotion });

menuController.initialize();
soundController.initialize();
interactionController.initialize();
createPageRouter({ reducedMotion, soundController, transitionController });

window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => root.classList.add('is-ready'));
});
