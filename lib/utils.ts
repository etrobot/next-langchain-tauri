import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { customAlphabet } from 'nanoid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
) // 7-character random string

export function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function getRandomGradient(dark: boolean): string {
  const randomHue = (): number => Math.floor(Math.random() * 360);
  const randomSaturation = (): number => Math.floor(Math.random() * 100);
  const fixedLightness = dark ? 60 : 96;

  const color1 = `hsl(${randomHue()}, ${randomSaturation()}%, ${fixedLightness}%)`;
  const color2 = `hsl(${randomHue()}, ${randomSaturation()}%, ${fixedLightness}%)`;
  const color3 = `hsl(${randomHue()}, ${randomSaturation()}%, ${fixedLightness}%)`;

  const angle = Math.floor(Math.random() * 360);

  const gradientType = Math.random() < 0.5 ? 'linear' : 'radial';

  if (gradientType === 'linear') {
    return `linear-gradient(${angle}deg, ${color1}, ${color2}, ${color3})`;
  } else {
    const centerX = Math.floor(Math.random() * 100);
    const centerY = Math.floor(Math.random() * 100);
    return `radial-gradient(circle at ${centerX}% ${centerY}%, ${color1}, ${color2}, ${color3})`;
  }
}