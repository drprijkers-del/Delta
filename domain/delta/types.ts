/**
 * Delta Types
 *
 * Core types for the Delta intervention tool.
 */

// Available angles for Delta sessions
export type DeltaAngle =
  | 'scrum'
  | 'flow'
  | 'ownership'
  | 'collaboration'
  | 'technical_excellence'
  | 'refinement'
  | 'planning'
  | 'retro'
  | 'demo'

// Session lifecycle status
export type DeltaStatus = 'draft' | 'active' | 'closed'

// A single statement that team members respond to
export interface Statement {
  id: string
  text: string
  angle: DeltaAngle
}

// Team member's answers: statement_id -> score (1-5)
export type ResponseAnswers = Record<string, number>

// Delta session entity
export interface DeltaSession {
  id: string
  team_id: string
  session_code: string
  angle: DeltaAngle
  title: string | null
  status: DeltaStatus

  // Outcome (populated when closed)
  focus_area: string | null
  experiment: string | null
  experiment_owner: string | null
  followup_date: string | null  // ISO date string

  // Metadata
  created_by: string | null
  created_at: string
  closed_at: string | null
}

// Delta session with additional computed fields
export interface DeltaSessionWithStats extends DeltaSession {
  response_count: number
  team_name?: string
}

// Individual response (anonymous)
export interface DeltaResponse {
  id: string
  session_id: string
  answers: ResponseAnswers
  device_id: string
  created_at: string
}

// Score distribution (how many 1s, 2s, 3s, 4s, 5s)
export type ScoreDistribution = [number, number, number, number, number]

// Statement score after aggregation
export interface StatementScore {
  statement: Statement
  score: number              // Average score (1-5)
  response_count: number     // How many answered this statement
  distribution: ScoreDistribution  // [count of 1s, 2s, 3s, 4s, 5s]
  variance: number           // Standard deviation (0 = agreement, >1 = disagreement)
}

// Synthesis output
export interface SynthesisResult {
  strengths: StatementScore[]   // Top 2 highest scoring
  tensions: StatementScore[]    // Top 2 lowest scoring
  all_scores: StatementScore[]  // All statements, sorted by score (high to low)
  overall_score: number         // Average across all answers (1-5)
  disagreement_count: number    // How many statements have high variance
  focus_area: string            // Derived from lowest cluster
  suggested_experiment: string  // Rule-based suggestion
  response_count: number        // Total responses
}

// Angle metadata for UI
export interface AngleInfo {
  id: DeltaAngle
  label: string
  description: string
}

// Available angles with metadata
export const ANGLES: AngleInfo[] = [
  {
    id: 'scrum',
    label: 'Scrum',
    description: 'Are events useful? Is the framework helping?'
  },
  {
    id: 'flow',
    label: 'Flow',
    description: 'Is work moving? Are we finishing what we start?'
  },
  {
    id: 'ownership',
    label: 'Ownership',
    description: 'Does the team own it? Can we act without asking?'
  },
  {
    id: 'collaboration',
    label: 'Collaboration',
    description: 'Are we working together? Is knowledge shared?'
  },
  {
    id: 'technical_excellence',
    label: 'Technical Excellence',
    description: 'Is the code getting better? Are we building quality in?'
  },
  {
    id: 'refinement',
    label: 'Refinement',
    description: 'Are stories ready? Is the backlog actionable?'
  },
  {
    id: 'planning',
    label: 'Planning',
    description: 'Is commitment realistic? Is the Sprint Goal clear?'
  },
  {
    id: 'retro',
    label: 'Retro',
    description: 'Are we improving? Do actions lead to change?'
  },
  {
    id: 'demo',
    label: 'Demo',
    description: 'Are stakeholders engaged? Is feedback valuable?'
  }
]

// Helper to get angle info
export function getAngleInfo(angle: DeltaAngle): AngleInfo {
  return ANGLES.find(a => a.id === angle) || ANGLES[0]
}
