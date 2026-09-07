import assert from 'node:assert/strict';
import test from 'node:test';
import { createProjectViewer } from '../../resources/js/project-viewer.js';
import { createDom } from './dom.js';

const setup = (t) => {
    const window = createDom(t, `<div data-project-reel>
        <div class="project-reel__frame">
            <button data-reel-action="expand">Enlarge</button>
            <div data-reel-slide data-state="active">Preview</div>
        </div>
        <div class="project-reel__footer">Controls</div>
        <dialog data-reel-dialog>
            <button autofocus>Close</button>
            <div data-reel-expanded></div>
        </dialog>
    </div>`);
    const reel = document.querySelector('[data-project-reel]');
    const dialog = reel.querySelector('dialog');
    const frame = reel.querySelector('.project-reel__frame');
    const opener = reel.querySelector('[data-reel-action="expand"]');
    reel.getBoundingClientRect = () => ({ height: 460 });
    dialog.showModal = () => { dialog.open = true; };
    dialog.close = () => {
        dialog.open = false;
        dialog.dispatchEvent(new window.Event('close'));
    };
    return { reel, dialog, frame, opener, viewer: createProjectViewer(reel) };
};

test('opening moves the existing gallery into a modal and reserves its page space', (t) => {
    const { reel, dialog, frame, viewer } = setup(t);
    viewer.open();
    viewer.open();
    assert.equal(dialog.open, true);
    assert.equal(reel.style.minHeight, '460px');
    assert.equal(dialog.querySelector('.project-reel__frame'), frame);
    assert.equal(reel.querySelectorAll('[data-reel-slide]').length, 1);
});

test('closing restores the gallery, its active view, original spacing and keyboard focus', (t) => {
    const { reel, dialog, frame, opener, viewer } = setup(t);
    reel.style.minHeight = '100px';
    viewer.open();
    frame.querySelector('[data-reel-slide]').dataset.state = 'changed';
    viewer.close();
    assert.equal(dialog.open, false);
    assert.equal(frame.parentElement, reel);
    assert.equal(reel.style.minHeight, '100px');
    assert.equal(frame.querySelector('[data-reel-slide]').dataset.state, 'changed');
    assert.equal(document.activeElement, opener);
    viewer.open();
    assert.equal(dialog.querySelector('.project-reel__frame'), frame);
});

test('native dismissal also restores the original gallery', (t) => {
    const { reel, dialog, frame, viewer } = setup(t);
    viewer.open();
    dialog.close();
    assert.equal(frame.parentElement, reel);
    assert.equal(reel.style.minHeight, '');
});

test('removing a page with an open viewer leaves no detached modal or layout state', (t) => {
    const { reel, dialog, frame, viewer } = setup(t);
    viewer.open();
    reel.remove();
    viewer.destroy();
    assert.equal(dialog.open, false);
    assert.equal(frame.parentElement, reel);
    assert.equal(reel.style.minHeight, '');
});
