import { createDotOrbController } from './dot-orb-controller.js';
import { createInteractionController } from './interaction-controller.js';
import { createPageHeadingController } from './page-heading-controller.js';
import { createPageRouter } from './page-router.js';
import { createPointerController } from './pointer-controller.js';
import { createSceneController } from './scene-controller.js';
import { createSiteMenuController } from './site-menu.js';
import { createSoundController } from './sound-controller.js';
import { createStageListController } from './stage-list-controller.js';
import { createPageTransitionController } from './transition-controller.js';

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

root.classList.add('js');

const dotOrbController = createDotOrbController({ reducedMotion });
const interactionController = createInteractionController({ reducedMotion });
const menuController = createSiteMenuController({ reducedMotion });
const pageHeadingController = createPageHeadingController({ reducedMotion });
const pointerController = createPointerController({ reducedMotion });
const sceneController = createSceneController();
const soundController = createSoundController({ finePointer });
const stageListController = createStageListController();
const transitionController = createPageTransitionController({ reducedMotion });

menuController.initialize();
soundController.initialize();
interactionController.initialize();
pointerController.initialize();
pageHeadingController.initialize();
dotOrbController.initialize();
sceneController.initialize();
stageListController.initialize();
createPageRouter({ soundController, transitionController });

window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => root.classList.add('is-ready'));
});
