"use client";

// Lightweight WebAudio alert tone — no external audio file needed, which
// keeps this safe to ship to older Smart TV browsers with no network
// access to fetch an mp3. Two short high-low beeps read as "attention"
// without being a full siren.
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

function beep(startAt: number, freq: number, durationSec: number, audio: AudioContext) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "square";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(0.12, startAt + 0.015);
  gain.gain.linearRampToValueAtTime(0, startAt + durationSec);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(startAt);
  osc.stop(startAt + durationSec);
}

/** Plays a short two-tone alert beep. Call only in response to a real
 *  new critical event — browsers may block audio before any user
 *  interaction has happened on the page, which is fine: the visual
 *  alert still fires either way. */
export function playCriticalAlert() {
  const audio = getCtx();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();
  const t0 = audio.currentTime;
  beep(t0, 880, 0.14, audio);
  beep(t0 + 0.18, 660, 0.18, audio);
}
