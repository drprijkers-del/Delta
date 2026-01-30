/**
 * Feedback Backlog Data
 *
 * Manually curated list of feedback items.
 * This is intentionally a static file, not a database table.
 * The product team updates this directly.
 */

export type BacklogCategory = 'ux' | 'statements' | 'analytics' | 'integration'
export type BacklogStatus = 'review' | 'exploring' | 'decided'
export type BacklogDecision = 'building' | 'not_doing'

export interface BacklogItem {
  id: string
  title: {
    nl: string
    en: string
  }
  category: BacklogCategory
  status: BacklogStatus
  decision?: BacklogDecision
  reviewedAt: string // YYYY-MM
  decidedAt?: string // YYYY-MM
  source: {
    nl: string
    en: string
  }
  ourTake: {
    nl: string
    en: string
  }
  rationale?: {
    nl: string
    en: string
  }
}

export const backlogItems: BacklogItem[] = [
  // Under Review
  {
    id: 'dark-mode-admin',
    title: {
      nl: 'Dark mode voor admin omgeving',
      en: 'Dark mode for admin environment',
    },
    category: 'ux',
    status: 'review',
    reviewedAt: '2026-01',
    source: {
      nl: 'Feedback formulier',
      en: 'Feedback form',
    },
    ourTake: {
      nl: 'We evalueren of dark mode de leesbaarheid van resultaten verbetert. De participatie-view is al donker om focus te creëren.',
      en: 'We\'re evaluating whether dark mode improves result readability. The participation view is already dark to create focus.',
    },
  },
  {
    id: 'custom-statements',
    title: {
      nl: 'Eigen stellingen toevoegen',
      en: 'Add custom statements',
    },
    category: 'statements',
    status: 'review',
    reviewedAt: '2026-01',
    source: {
      nl: 'Coach interviews',
      en: 'Coach interviews',
    },
    ourTake: {
      nl: 'We onderzoeken of custom stellingen de kwaliteit van Delta-sessies verbeteren of juist verwateren. Standaardisatie is een kernprincipe.',
      en: 'We\'re investigating whether custom statements improve or dilute Delta session quality. Standardization is a core principle.',
    },
  },

  // Exploring
  {
    id: 'pdf-export',
    title: {
      nl: 'Sessie resultaten exporteren naar PDF',
      en: 'Export session results to PDF',
    },
    category: 'analytics',
    status: 'exploring',
    reviewedAt: '2025-12',
    source: {
      nl: 'Meerdere feedback inzendingen',
      en: 'Multiple feedback submissions',
    },
    ourTake: {
      nl: 'We zien de waarde voor coaches die resultaten moeten delen met stakeholders. We verkennen formaten die het "één focus, één experiment" principe behouden.',
      en: 'We see the value for coaches who need to share results with stakeholders. We\'re exploring formats that preserve the "one focus, one experiment" principle.',
    },
  },
  {
    id: 'team-trends',
    title: {
      nl: 'Trendlijn over meerdere sessies',
      en: 'Trend line across sessions',
    },
    category: 'analytics',
    status: 'exploring',
    reviewedAt: '2025-11',
    source: {
      nl: 'Feedback formulier',
      en: 'Feedback form',
    },
    ourTake: {
      nl: 'We onderzoeken hoe we trends kunnen tonen zonder dat coaches gaan "sturen op cijfers". Delta meet geen performance — het identificeert blokkades.',
      en: 'We\'re investigating how to show trends without coaches "managing by numbers". Delta doesn\'t measure performance — it identifies blockers.',
    },
  },

  // Decided - Building
  {
    id: 'devops-angle',
    title: {
      nl: 'DevOps / Platform team invalshoek',
      en: 'DevOps / Platform team angle',
    },
    category: 'statements',
    status: 'decided',
    decision: 'building',
    reviewedAt: '2025-11',
    decidedAt: '2026-01',
    source: {
      nl: 'Coach interviews + feedback',
      en: 'Coach interviews + feedback',
    },
    ourTake: {
      nl: 'Platform teams hebben unieke dynamieken rond deployment, monitoring en incident response.',
      en: 'Platform teams have distinct dynamics around deployment, monitoring, and incident response.',
    },
    rationale: {
      nl: 'Wordt toegevoegd. We schrijven stellingen die voldoen aan Delta\'s scherpe, observeerbare principes.',
      en: 'Adding. We\'re writing statements that follow Delta\'s sharp, observable principles.',
    },
  },

  // Decided - Not Doing
  {
    id: 'jira-integration',
    title: {
      nl: 'Jira integratie',
      en: 'Jira integration',
    },
    category: 'integration',
    status: 'decided',
    decision: 'not_doing',
    reviewedAt: '2025-10',
    decidedAt: '2025-12',
    source: {
      nl: 'Feedback formulier (3 verzoeken)',
      en: 'Feedback form (3 requests)',
    },
    ourTake: {
      nl: 'Delta is ontworpen als een op zichzelf staand diagnostisch moment — geen workflow extensie.',
      en: 'Delta is designed as a standalone diagnostic moment — not a workflow extension.',
    },
    rationale: {
      nl: 'Niet doen. Integratie met Jira zou de focus verschuiven van "scherpe interventie" naar "taakbeheer". We raden aan focus areas handmatig te exporteren naar bestaande tools.',
      en: 'Not pursuing. Integrating with Jira would shift focus from "sharp intervention" to "task management". We recommend exporting focus areas manually to existing tools.',
    },
  },
  {
    id: 'voting-system',
    title: {
      nl: 'Stemmen op stellingen tijdens sessie',
      en: 'Voting on statements during session',
    },
    category: 'ux',
    status: 'decided',
    decision: 'not_doing',
    reviewedAt: '2025-09',
    decidedAt: '2025-11',
    source: {
      nl: 'Feedback formulier',
      en: 'Feedback form',
    },
    ourTake: {
      nl: 'Stemmen introduceert groepsdruk en beïnvloedt anonimiteit.',
      en: 'Voting introduces peer pressure and compromises anonymity.',
    },
    rationale: {
      nl: 'Niet doen. Delta\'s kracht zit in individuele, anonieme input. Als teamleden elkaars keuzes zien, verandert het de dynamiek fundamenteel.',
      en: 'Not pursuing. Delta\'s strength is in individual, anonymous input. If team members see each other\'s choices, it fundamentally changes the dynamic.',
    },
  },
  {
    id: 'slack-notifications',
    title: {
      nl: 'Slack notificaties bij nieuwe reacties',
      en: 'Slack notifications for new responses',
    },
    category: 'integration',
    status: 'decided',
    decision: 'not_doing',
    reviewedAt: '2025-10',
    decidedAt: '2025-12',
    source: {
      nl: 'Feedback formulier',
      en: 'Feedback form',
    },
    ourTake: {
      nl: 'Real-time notificaties creëren druk om snel te reageren.',
      en: 'Real-time notifications create pressure to respond quickly.',
    },
    rationale: {
      nl: 'Niet doen. Delta werkt het beste wanneer teamleden in hun eigen tempo reageren. Notificaties zouden de "check wie er al heeft gereageerd" dynamiek introduceren.',
      en: 'Not pursuing. Delta works best when team members respond at their own pace. Notifications would introduce "checking who responded" dynamics.',
    },
  },
]

/**
 * Get items filtered by status
 */
export function getBacklogByStatus(status: BacklogStatus): BacklogItem[] {
  return backlogItems.filter(item => item.status === status)
}

/**
 * Get items filtered by category
 */
export function getBacklogByCategory(category: BacklogCategory): BacklogItem[] {
  return backlogItems.filter(item => item.category === category)
}

/**
 * Get all unique categories that have items
 */
export function getActiveCategories(): BacklogCategory[] {
  return [...new Set(backlogItems.map(item => item.category))]
}
