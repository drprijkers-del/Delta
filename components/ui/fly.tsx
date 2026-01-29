'use client'

import { useMemo } from 'react'

export type FlyFrequency = 'none' | 'rare' | 'medium' | 'high'

interface FlyProps {
  frequency?: FlyFrequency
}

/**
 * The Fly - Breaking Bad S03E10 Easter Egg
 *
 * Behavior changes based on team/user state:
 * - rare: calm, slow fly (healthy state)
 * - medium: moderate activity (some concern)
 * - high: erratic, fast fly (under pressure)
 * - none: no fly
 */
export function Fly({ frequency = 'rare' }: FlyProps) {
  // Calculate animation parameters based on frequency
  const animationConfig = useMemo(() => {
    switch (frequency) {
      case 'none':
        return null
      case 'high':
        return {
          duration: '8s',      // Fast
          wobble: 45,          // More erratic movement
          opacity: 0.4,        // More visible
          verticalRange: 50,   // Larger vertical swings
        }
      case 'medium':
        return {
          duration: '15s',
          wobble: 25,
          opacity: 0.3,
          verticalRange: 35,
        }
      case 'rare':
      default:
        return {
          duration: '25s',     // Slow, calm
          wobble: 15,          // Gentle movement
          opacity: 0.2,        // Subtle
          verticalRange: 20,   // Small movements
        }
    }
  }, [frequency])

  if (!animationConfig) return null

  const { duration, wobble, opacity, verticalRange } = animationConfig

  // Generate keyframe percentages for erratic movement
  const keyframes = `
    @keyframes flyAcross {
      0% {
        left: -20px;
        transform: translateY(0px) rotate(0deg);
      }
      10% {
        transform: translateY(-${verticalRange}px) rotate(${wobble * 0.5}deg);
      }
      20% {
        transform: translateY(${verticalRange * 0.7}px) rotate(-${wobble * 0.3}deg);
      }
      30% {
        transform: translateY(-${verticalRange * 0.5}px) rotate(${wobble * 0.2}deg);
      }
      40% {
        transform: translateY(${verticalRange * 0.8}px) rotate(-${wobble * 0.5}deg);
      }
      50% {
        transform: translateY(-${verticalRange * 0.3}px) rotate(${wobble * 0.3}deg);
      }
      60% {
        transform: translateY(${verticalRange}px) rotate(-${wobble * 0.2}deg);
      }
      70% {
        transform: translateY(-${verticalRange * 0.6}px) rotate(${wobble * 0.5}deg);
      }
      80% {
        transform: translateY(${verticalRange * 0.5}px) rotate(-${wobble * 0.3}deg);
      }
      90% {
        transform: translateY(-${verticalRange * 0.8}px) rotate(${wobble * 0.2}deg);
      }
      100% {
        left: calc(100% + 20px);
        transform: translateY(0px) rotate(0deg);
      }
    }
  `

  return (
    <>
      <div
        className="absolute top-1/2 text-lg pointer-events-none z-50"
        style={{
          animation: `flyAcross ${duration} linear infinite`,
          opacity,
        }}
        aria-hidden="true"
      >
        🪰
      </div>
      <style jsx>{keyframes}</style>
    </>
  )
}

/**
 * Convert a mood signal (1-5) to fly frequency
 * Lower signals = more active fly
 */
export function signalToFlyFrequency(signal: number | null): FlyFrequency {
  if (signal === null) return 'rare'
  if (signal <= 2) return 'high'
  if (signal === 3) return 'medium'
  return 'rare'
}
