// Sounds for the trackers and the chaos bag.

import { BASE } from './investigators';

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

const samples = new Map<string, HTMLAudioElement>();

function playSample(file: string) {
  try {
    let audio = samples.get(file);
    if (!audio) {
      audio = new Audio(`${BASE}snd/${file}`);
      samples.set(file, audio);
    }
    audio.currentTime = 0;
    void audio.play();
  } catch {
    // Audio is a nicety; never let it break a tap.
  }
}

/** The losing horn, for drawing the auto-fail token. */
export const playHorn = () => playSample('losing-horn.mp3');

/** A rising power-up, for drawing the elder sign. */
export const playElderSign = () => playSample('elder-sign.wav');

let noise: AudioBuffer | null = null;

function noiseBuffer(audio: AudioContext): AudioBuffer {
  if (!noise) {
    noise = audio.createBuffer(1, audio.sampleRate * 0.4, audio.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noise;
}

/**
 * Pulling a token: a short rustle of cloth with a soft thud, so it is obvious which action
 * made the sound.
 */
export function playDraw() {
  try {
    const audio = context();
    if (!audio) return;
    const t = audio.currentTime;

    // Rustle: filtered noise sweeping downwards.
    const src = audio.createBufferSource();
    src.buffer = noiseBuffer(audio);
    const band = audio.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = 0.9;
    band.frequency.setValueAtTime(2600, t);
    band.frequency.exponentialRampToValueAtTime(700, t + 0.26);
    const rustle = audio.createGain();
    rustle.gain.setValueAtTime(0.0001, t);
    rustle.gain.exponentialRampToValueAtTime(0.13, t + 0.05);
    rustle.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    src.connect(band).connect(rustle).connect(audio.destination);
    src.start(t);
    src.stop(t + 0.32);

    // Thud: the token landing.
    const thud = audio.createOscillator();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(190, t + 0.12);
    thud.frequency.exponentialRampToValueAtTime(85, t + 0.3);
    const thudGain = audio.createGain();
    thudGain.gain.setValueAtTime(0.0001, t + 0.12);
    thudGain.gain.exponentialRampToValueAtTime(0.2, t + 0.16);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    thud.connect(thudGain).connect(audio.destination);
    thud.start(t + 0.12);
    thud.stop(t + 0.36);
  } catch {
    // Audio is a nicety; never let it break a tap.
  }
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
