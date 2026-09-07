"use client";

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

export function playCriticalAlert() {
  const audio = getCtx();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();
  const t0 = audio.currentTime;
  beep(t0, 880, 0.14, audio);
  beep(t0 + 0.18, 660, 0.18, audio);
}
