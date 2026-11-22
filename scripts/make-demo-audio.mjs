#!/usr/bin/env node
// Generates public/demo-beat.wav (6s, mono, 22.05kHz): a kick drum + bass melody,
// used to demo the AudioWave template without any copyrighted music.
import { mkdirSync, writeFileSync } from "node:fs";

const rate = 22050;
const seconds = 6;
const n = rate * seconds;
const data = Buffer.alloc(n * 2);
const notes = [55, 55, 65.4, 73.4, 55, 82.4, 73.4, 65.4];

for (let i = 0; i < n; i++) {
  const t = i / rate;
  const beat = t % 0.5;
  const kick = Math.sin(2 * Math.PI * (50 + 120 * Math.exp(-beat * 30)) * beat) * Math.exp(-beat * 9);
  const note = notes[Math.floor(t / 0.75) % notes.length];
  const bass = 0.35 * Math.sin(2 * Math.PI * note * 2 * t) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 4 * t));
  const hat = (t % 0.25) < 0.02 ? (Math.random() * 2 - 1) * 0.15 * (1 - (t % 0.25) / 0.02) : 0;
  const s = Math.max(-1, Math.min(1, 0.6 * kick + bass + hat));
  data.writeInt16LE(Math.round(s * 32000), i * 2);
}

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(1, 22); // mono
header.writeUInt32LE(rate, 24);
header.writeUInt32LE(rate * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(data.length, 40);

mkdirSync("public", { recursive: true });
writeFileSync("public/demo-beat.wav", Buffer.concat([header, data]));
console.log("✔ public/demo-beat.wav");
