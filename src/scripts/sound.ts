// A short synthesized click for the tracker arrows. No audio file, so nothing to load.

type Ctor = typeof AudioContext;
const AudioCtx: Ctor | undefined =
  typeof window === 'undefined' ? undefined : window.AudioContext ?? (window as any).webkitAudioContext;

let ctx: AudioContext | null = null;

/** iPad only allows audio to start from a user gesture, which is exactly when this is called. */
function context(): AudioContext | null {
  if (!AudioCtx) return null;
  ctx ??= new AudioCtx();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** `up` raises the pitch slightly so increases and decreases sound different. */
export function playClick(up: boolean) {
  try {
    const audio = context();
    if (!audio) return;
    const t = audio.currentTime;

    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    gain.connect(audio.destination);

    // A quick blip through a band-pass gives a dry, woody tick rather than a beep.
    const osc = audio.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(up ? 1500 : 1150, t);
    osc.frequency.exponentialRampToValueAtTime(up ? 760 : 560, t + 0.055);

    const filter = audio.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = up ? 1700 : 1350;
    filter.Q.value = 1.4;

    osc.connect(filter).connect(gain);
    osc.start(t);
    osc.stop(t + 0.07);
  } catch {
    // Audio is a nicety; never let it break a tap.
  }
}
