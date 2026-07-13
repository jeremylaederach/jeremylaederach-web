import { createLiquidStageController } from './liquid-stage.js';
import { createPageRouter } from './page-router.js';
import { createSiteMenuController } from './site-menu.js';
import { createSoundController } from './sound-controller.js';

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

root.classList.add('js');

const stageController = createLiquidStageController({ finePointer, reducedMotion });
const menuController = createSiteMenuController({ reducedMotion });
const soundController = createSoundController({ finePointer });

menuController.initialize();
soundController.initialize();
createPageRouter({ reducedMotion, soundController, stageController });

window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => root.classList.add('is-ready'));
});
