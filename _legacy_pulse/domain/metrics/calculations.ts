import type {
  ConfidenceLevel,
  TrendDirection,
  PulseZone,
  PulseMetric,
  DailyPulse,
  DayState,
  WeekState,
  DataMaturity,
} from './types'

/**
 * Zone thresholds
 * Maps numeric averages to semantic zones
 */
const ZONE_THRESHOLDS = {
  under_pressure: { min: 1.0, max: 2.4 },
  mixed_signals: { min: 2.5, max: 3.4 },
  steady_state: { min: 3.5, max: 4.0 },
  high_confidence: { min: 4.1, max: 5.0 },
} as const

/**
 * Participation thresholds for confidence
 */
const CONFIDENCE_THRESHOLDS = {
  low: 0.3,      // < 30%
  moderate: 0.6, // 30-60%
  // high: > 60%
}

/**
 * Trend threshold (minimum change to count as rising/declining)
 */
const TREND_THRESHOLD = 0.3

/**
 * Convert numeric value to zone
 */
export function valueToZone(value: number | null): PulseZone | null {
  if (value === null) return null

  if (value <= ZONE_THRESHOLDS.under_pressure.max) return 'under_pressure'
  if (value <= ZONE_THRESHOLDS.mixed_signals.max) return 'mixed_signals'
  if (value <= ZONE_THRESHOLDS.steady_state.max) return 'steady_state'
  return 'high_confidence'
}

/**
 * Get zone display label
 */
export function getZoneLabel(zone: PulseZone | null, lang: 'nl' | 'en' = 'en'): string {
  if (!zone) return lang === 'nl' ? 'Geen data' : 'No data'

  const labels = {
    nl: {
      under_pressure: 'Onder druk',
      mixed_signals: 'Gemengde signalen',
      steady_state: 'Stabiel',
      high_confidence: 'Sterk',
    },
    en: {
      under_pressure: 'Under pressure',
      mixed_signals: 'Mixed signals',
      steady_state: 'Steady state',
      high_confidence: 'High confidence',
    },
  }

  return labels[lang][zone]
}

/**
 * Get zone color class for styling
 */
export function getZoneColor(zone: PulseZone | null): string {
  switch (zone) {
    case 'under_pressure':
      return 'text-amber-600 bg-amber-50'
    case 'mixed_signals':
      return 'text-stone-600 bg-stone-100'
    case 'steady_state':
      return 'text-cyan-600 bg-cyan-50'
    case 'high_confidence':
      return 'text-emerald-600 bg-emerald-50'
    default:
      return 'text-stone-400 bg-stone-50'
  }
}

/**
 * Calculate confidence level based on participation
 */
export function calculateConfidence(
  entryCount: number,
  participantCount: number
): ConfidenceLevel {
  if (participantCount === 0) return 'low'

  const rate = entryCount / participantCount

  if (rate < CONFIDENCE_THRESHOLDS.low) return 'low'
  if (rate < CONFIDENCE_THRESHOLDS.moderate) return 'moderate'
  return 'high'
}

/**
 * Calculate trend direction from delta
 */
export function calculateTrend(delta: number): TrendDirection {
  if (delta >= TREND_THRESHOLD) return 'rising'
  if (delta <= -TREND_THRESHOLD) return 'declining'
  return 'stable'
}

/**
 * Get trend arrow symbol
 */
export function getTrendArrow(trend: TrendDirection): string {
  switch (trend) {
    case 'rising':
      return '↑'
    case 'declining':
      return '↓'
    default:
      return '→'
  }
}

/**
 * Get trend color class
 */
export function getTrendColor(trend: TrendDirection): string {
  switch (trend) {
    case 'rising':
      return 'text-emerald-600'
    case 'declining':
      return 'text-amber-600'
    default:
      return 'text-stone-500'
  }
}

/**
 * Calculate average from daily data
 */
export function calculateAverage(data: DailyPulse[]): number | null {
  if (data.length === 0) return null

  const totalWeighted = data.reduce((sum, d) => sum + d.average * d.count, 0)
  const totalCount = data.reduce((sum, d) => sum + d.count, 0)

  if (totalCount === 0) return null
  return totalWeighted / totalCount
}

/**
 * Build a PulseMetric from raw data
 */
export function buildPulseMetric(
  currentData: DailyPulse[],
  previousData: DailyPulse[],
  participantCount: number
): PulseMetric {
  const currentAvg = calculateAverage(currentData)
  const previousAvg = calculateAverage(previousData)
  const entryCount = currentData.reduce((sum, d) => sum + d.count, 0)

  const delta = currentAvg !== null && previousAvg !== null
    ? currentAvg - previousAvg
    : 0

  return {
    value: currentAvg,
    zone: valueToZone(currentAvg),
    trend: calculateTrend(delta),
    delta: Math.round(delta * 10) / 10, // Round to 1 decimal
    entryCount,
    participantCount,
    confidence: calculateConfidence(entryCount, participantCount),
  }
}

/**
 * Calculate momentum from historical data
 */
export function calculateMomentum(
  dailyData: DailyPulse[]
): { direction: TrendDirection; velocity: 'slow' | 'moderate' | 'fast'; daysTrending: number } {
  if (dailyData.length < 2) {
    return { direction: 'stable', velocity: 'slow', daysTrending: 0 }
  }

  // Calculate day-over-day changes
  const changes: number[] = []
  for (let i = 1; i < dailyData.length; i++) {
    changes.push(dailyData[i].average - dailyData[i - 1].average)
  }

  // Count consecutive days in same direction
  let daysTrending = 0
  let lastDirection: TrendDirection | null = null

  for (let i = changes.length - 1; i >= 0; i--) {
    const direction = calculateTrend(changes[i])

    if (lastDirection === null) {
      lastDirection = direction
      if (direction !== 'stable') daysTrending = 1
    } else if (direction === lastDirection && direction !== 'stable') {
      daysTrending++
    } else if (direction !== 'stable') {
      break
    }
  }

  // Calculate overall direction from recent changes
  const recentChanges = changes.slice(-3)
  const avgChange = recentChanges.reduce((a, b) => a + b, 0) / recentChanges.length
  const direction = calculateTrend(avgChange)

  // Velocity based on magnitude of change
  const absChange = Math.abs(avgChange)
  const velocity = absChange > 0.5 ? 'fast' : absChange > 0.3 ? 'moderate' : 'slow'

  return { direction: lastDirection || direction, velocity, daysTrending }
}

/**
 * Check if there's enough data to show metrics
 */
export function hasMinimumData(entryCount: number): boolean {
  return entryCount >= 3 // Minimum 3 entries to show aggregates
}

/**
 * Format participation rate as percentage
 */
export function formatParticipationRate(entries: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((entries / total) * 100)}%`
}

/**
 * Get confidence label for display
 */
export function getConfidenceLabel(confidence: ConfidenceLevel, lang: 'nl' | 'en' = 'en'): string {
  const labels = {
    nl: {
      low: 'Beperkte data',
      moderate: 'Voldoende data',
      high: 'Betrouwbaar',
    },
    en: {
      low: 'Limited data',
      moderate: 'Sufficient data',
      high: 'Reliable',
    },
  }

  return labels[lang][confidence]
}

// =============================================================================
// DAY & WEEK STATE - Creates tension, rhythm, and closure
// =============================================================================

/**
 * Calculate current day state based on participation
 * Creates sense of "day forming" → "day complete"
 */
export function calculateDayState(participationRate: number): DayState {
  if (participationRate >= 60) return 'day_complete'
  if (participationRate >= 30) return 'signal_emerging'
  return 'day_forming'
}

/**
 * Get day state label for display
 */
export function getDayStateLabel(state: DayState, lang: 'nl' | 'en' = 'en'): string {
  const labels = {
    nl: {
      day_forming: 'Dag start...',
      signal_emerging: 'Signaal vormt...',
      day_complete: 'Dag compleet',
    },
    en: {
      day_forming: 'Day forming...',
      signal_emerging: 'Signal emerging...',
      day_complete: 'Day complete',
    },
  }
  return labels[lang][state]
}

/**
 * Calculate current week state
 * Creates anticipation through the week
 */
export function calculateWeekState(daysWithData: number, isEndOfWeek: boolean): WeekState {
  if (isEndOfWeek && daysWithData >= 4) return 'week_complete'
  if (daysWithData >= 3) return 'signal_forming'
  return 'week_building'
}

/**
 * Get week state label for display
 */
export function getWeekStateLabel(state: WeekState, lang: 'nl' | 'en' = 'en'): string {
  const labels = {
    nl: {
      week_building: 'Week bouwt op...',
      signal_forming: 'Patroon vormt...',
      week_complete: 'Week compleet',
    },
    en: {
      week_building: 'Week building...',
      signal_forming: 'Pattern forming...',
      week_complete: 'Week complete',
    },
  }
  return labels[lang][state]
}

// =============================================================================
// DATA MATURITY - Progression without badges
// =============================================================================

/**
 * Calculate data maturity level
 * Professional progression model based on measurement history
 */
export function calculateDataMaturity(
  totalDaysWithData: number,
  consistencyRate: number // % of days with 30%+ participation
): DataMaturity {
  // Reliable signal: 30+ days with good consistency
  if (totalDaysWithData >= 30 && consistencyRate >= 70) {
    return 'reliable_signal'
  }
  // Pattern forming: 14-30 days
  if (totalDaysWithData >= 14) {
    return 'pattern_forming'
  }
  // Establishing baseline: 7-14 days
  if (totalDaysWithData >= 7) {
    return 'establishing_baseline'
  }
  // Calibrating: < 7 days
  return 'calibrating'
}

/**
 * Get maturity label for display
 */
export function getMaturityLabel(maturity: DataMaturity, lang: 'nl' | 'en' = 'en'): string {
  const labels = {
    nl: {
      calibrating: 'Kalibreren',
      establishing_baseline: 'Baseline vormen',
      pattern_forming: 'Patroon vormt',
      reliable_signal: 'Betrouwbaar signaal',
    },
    en: {
      calibrating: 'Calibrating',
      establishing_baseline: 'Establishing baseline',
      pattern_forming: 'Pattern forming',
      reliable_signal: 'Reliable signal',
    },
  }
  return labels[lang][maturity]
}

/**
 * Get maturity description for context
 */
export function getMaturityDescription(maturity: DataMaturity, daysOfData: number, lang: 'nl' | 'en' = 'en'): string {
  const templates = {
    nl: {
      calibrating: `Dag ${daysOfData} van 7 — systeem kalibreert`,
      establishing_baseline: `Dag ${daysOfData} — baseline vormt zich`,
      pattern_forming: `${daysOfData} dagen data — patronen zichtbaar`,
      reliable_signal: `${daysOfData} dagen consistente data`,
    },
    en: {
      calibrating: `Day ${daysOfData} of 7 — system calibrating`,
      establishing_baseline: `Day ${daysOfData} — establishing baseline`,
      pattern_forming: `${daysOfData} days of data — patterns emerging`,
      reliable_signal: `${daysOfData} days of consistent data`,
    },
  }
  return templates[lang][maturity]
}

/**
 * Get maturity color for styling
 */
export function getMaturityColor(maturity: DataMaturity): string {
  switch (maturity) {
    case 'calibrating':
      return 'text-stone-400 bg-stone-100'
    case 'establishing_baseline':
      return 'text-amber-600 bg-amber-50'
    case 'pattern_forming':
      return 'text-cyan-600 bg-cyan-50'
    case 'reliable_signal':
      return 'text-emerald-600 bg-emerald-50'
  }
}
