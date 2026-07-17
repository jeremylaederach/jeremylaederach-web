const storageKey = 'portfolio:interface-sound-muted';
const masterLevel = 0.9;

const hoverProfiles = {
    action: { frequency: 560, endFrequency: 390, overtone: 930 },
    brand: { frequency: 470, endFrequency: 330, overtone: 820 },
    control: { frequency: 430, endFrequency: 310, overtone: 760 },
    navigation: { frequency: 500, endFrequency: 350, overtone: 870 },
    panel: { frequency: 590, endFrequency: 360, overtone: 980 },
};

const readMutedPreference = () => {
    try {
        return window.localStorage.getItem(storageKey) === 'true';
    } catch {
        return false;
    }
};

const storeMutedPreference = (muted) => {
    try {
        window.localStorage.setItem(storageKey, String(muted));
    } catch {
        // Storage may be unavailable in private browsing; sound still works for this session.
    }
};

export const createSoundController = ({ finePointer }) => {
    let context;
    let masterGain;
    let activated = false;
    let muted = readMutedPreference();
    let lastHoverAt = 0;

    const controls = () => [...document.querySelectorAll('[data-sound-toggle]')];

    const updateControls = () => {
        controls().forEach((control) => {
            const label = muted ? control.dataset.labelMuted : control.dataset.labelPlaying;

            control.setAttribute('aria-label', label);
            control.setAttribute('aria-pressed', String(muted));
            control.setAttribute('title', label);
        });
    };

    const ensureContext = async () => {
        if (!context) {
            const AudioContext = window.AudioContext ?? window.webkitAudioContext;

            if (!AudioContext) {
                return false;
            }

            context = new AudioContext();
            masterGain = context.createGain();
            masterGain.gain.value = muted ? 0 : masterLevel;
            masterGain.connect(context.destination);
        }

        if (context.state === 'suspended') {
            await context.resume();
        }

        activated = true;
        return true;
    };

    const tone = async ({ delay = 0, duration, endFrequency, frequency, gain, type = 'sine' }) => {
        if (muted || !await ensureContext()) {
            return;
        }

        const start = context.currentTime + delay;
        const oscillator = context.createOscillator();
        const envelope = context.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, start);
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
        envelope.gain.setValueAtTime(0.0001, start);
        envelope.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.018, duration * 0.25));
        envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        oscillator.connect(envelope);
        envelope.connect(masterGain);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.02);
    };

    const hover = (event) => {
        const now = performance.now();

        if (!finePointer || muted || !activated || now - lastHoverAt < 110) {
            return;
        }

        const profile = hoverProfiles[event.detail?.tone] ?? hoverProfiles.control;

        lastHoverAt = now;
        tone({
            duration: 0.09,
            endFrequency: profile.endFrequency,
            frequency: profile.frequency,
            gain: 0.022,
        });
        tone({
            delay: 0.008,
            duration: 0.065,
            endFrequency: profile.overtone * 0.82,
            frequency: profile.overtone,
            gain: 0.0055,
            type: 'triangle',
        });
    };

    const select = () => {
        if (muted) {
            return;
        }

        tone({ duration: 0.16, endFrequency: 68, frequency: 116, gain: 0.032 });
        tone({ delay: 0.012, duration: 0.12, endFrequency: 128, frequency: 206, gain: 0.010, type: 'triangle' });
    };

    const complete = () => {
        if (muted) {
            return;
        }

        tone({ duration: 0.14, endFrequency: 182, frequency: 162, gain: 0.012 });
        tone({ delay: 0.048, duration: 0.18, endFrequency: 286, frequency: 244, gain: 0.009, type: 'triangle' });
    };

    const toggle = async () => {
        muted = !muted;
        storeMutedPreference(muted);
        updateControls();

        if (!muted) {
            await ensureContext();
            masterGain?.gain.setTargetAtTime(masterLevel, context.currentTime, 0.015);
            complete();
            return;
        }

        masterGain?.gain.setTargetAtTime(0, context.currentTime, 0.012);
    };

    const initialize = () => {
        updateControls();

        document.addEventListener('pointerdown', () => ensureContext(), { once: true, passive: true });
        document.addEventListener('keydown', () => ensureContext(), { once: true });
        document.addEventListener('interface-hover', hover);
        document.addEventListener('click', (event) => {
            const control = event.target instanceof Element
                ? event.target.closest('[data-sound-toggle]')
                : null;

            if (control) {
                toggle();
            }
        });
        document.addEventListener('visibilitychange', () => {
            if (!context) {
                return;
            }

            if (document.hidden) {
                context.suspend();
                return;
            }

            if (activated && !muted) {
                context.resume();
            }
        });
    };

    return {
        complete,
        initialize,
        select,
    };
};
