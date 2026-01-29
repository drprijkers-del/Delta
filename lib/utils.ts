import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function getMoodEmoji(mood: number): string {
  const emojis: Record<number, string> = {
    1: '😢',
    2: '😕',
    3: '😐',
    4: '🙂',
    5: '😄',
  }
  return emojis[mood] || '😐'
}

export function getMoodLabel(mood: number): string {
  const labels: Record<number, string> = {
    1: 'Heel slecht',
    2: 'Niet zo goed',
    3: 'Oké',
    4: 'Goed',
    5: 'Geweldig!',
  }
  return labels[mood] || 'Oké'
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(date))
}
