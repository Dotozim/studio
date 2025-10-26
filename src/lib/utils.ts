import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (totalSeconds < 3600) {
    return `${minutes}m${seconds > 0 ? ` ${seconds}s` : ''}`;
  }
  const hours = Math.floor(totalSeconds / 3600);
  const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`;
}
