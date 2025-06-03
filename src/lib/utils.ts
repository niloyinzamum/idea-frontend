import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const adjectives = [
  "Happy",
  "Clever",
  "Brave",
  "Gentle",
  "Swift",
  "Bright",
  "Calm",
  "Kind",
  "Bold",
  "Wise",
  "Quick",
  "Fair",
];

const nouns = [
  "Fox",
  "Eagle",
  "Lion",
  "Dolphin",
  "Wolf",
  "Bear",
  "Tiger",
  "Hawk",
  "Deer",
  "Owl",
  "Puma",
  "Falcon",
];

export function generateRandomName(): string {
  const adjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective}${noun}`;
}
