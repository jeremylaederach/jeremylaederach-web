import { createLiquidStageController } from './liquid-stage.js';
import { createPageRouter } from './page-router.js';
import { createSiteMenuController } from './site-menu.js';

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

root.classList.add('js');

const stageController = createLiquidStageController({ finePointer, reducedMotion });
const menuController = createSiteMenuController({ reducedMotion });

menuController.initialize();
createPageRouter({ menuController, reducedMotion, stageController });

window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => root.classList.add('is-ready'));
});
