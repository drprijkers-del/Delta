/**
 * Delta Statements
 *
 * Sharp, observable statements for each angle.
 *
 * Design principles:
 * 1. Sharp, not soft - No "Do you feel..." language
 * 2. Observable behaviors - Things you can see, not feel
 * 3. Binary provable - Could be verified by observation
 * 4. No escape hatch - Avoid "sometimes" or "usually"
 * 5. Present tense - About now, not aspirational
 */

import { Statement, DeltaAngle } from './types'

// Scrum statements
const scrumStatements: Statement[] = [
  { id: 'scrum_1', angle: 'scrum', text: 'The Sprint Goal was achieved last Sprint' },
  { id: 'scrum_2', angle: 'scrum', text: 'The Daily Scrum takes less than 15 minutes' },
  { id: 'scrum_3', angle: 'scrum', text: 'The Product Owner was available for questions last Sprint' },
  { id: 'scrum_4', angle: 'scrum', text: 'Sprint scope did not change after Sprint Planning' },
  { id: 'scrum_5', angle: 'scrum', text: 'The Retrospective produced at least one concrete action' },
  { id: 'scrum_6', angle: 'scrum', text: 'That Retro action was actually implemented' },
  { id: 'scrum_7', angle: 'scrum', text: 'I understand why the current Sprint Goal matters' },
  { id: 'scrum_8', angle: 'scrum', text: 'Stakeholders only see work during Sprint Review' },
  { id: 'scrum_9', angle: 'scrum', text: 'The team decides how to do the work, not the PO' },
  { id: 'scrum_10', angle: 'scrum', text: 'Unplanned work was rejected or negotiated last Sprint' },
]

// Flow statements
const flowStatements: Statement[] = [
  { id: 'flow_1', angle: 'flow', text: 'I worked on only one item at a time last week' },
  { id: 'flow_2', angle: 'flow', text: 'Items move from In Progress to Done within 3 days' },
  { id: 'flow_3', angle: 'flow', text: 'Code reviews happen within 4 hours' },
  { id: 'flow_4', angle: 'flow', text: 'I know exactly what I should work on next' },
  { id: 'flow_5', angle: 'flow', text: 'There are no items blocked for more than 2 days' },
  { id: 'flow_6', angle: 'flow', text: 'WIP limits are enforced, not ignored' },
  { id: 'flow_7', angle: 'flow', text: 'Deployments happen at least weekly' },
  { id: 'flow_8', angle: 'flow', text: 'I was not waiting on someone else for more than half a day last week' },
  { id: 'flow_9', angle: 'flow', text: 'The board reflects reality right now' },
  { id: 'flow_10', angle: 'flow', text: 'Meetings do not interrupt my focus time' },
]

// Ownership statements
const ownershipStatements: Statement[] = [
  { id: 'own_1', angle: 'ownership', text: 'I can deploy my code to production without asking permission' },
  { id: 'own_2', angle: 'ownership', text: 'I fixed a bug last week without being assigned to it' },
  { id: 'own_3', angle: 'ownership', text: 'The team decided on technical approach, not a lead or architect' },
  { id: 'own_4', angle: 'ownership', text: 'I know who is on-call and how to reach them' },
  { id: 'own_5', angle: 'ownership', text: 'I have access to production logs' },
  { id: 'own_6', angle: 'ownership', text: 'I participated in an incident review this quarter' },
  { id: 'own_7', angle: 'ownership', text: 'I can create a new service without filing a ticket' },
  { id: 'own_8', angle: 'ownership', text: 'The team owns the backlog prioritization, not just the PO' },
  { id: 'own_9', angle: 'ownership', text: 'I refactored code this month that I did not originally write' },
  { id: 'own_10', angle: 'ownership', text: 'When something breaks, we fix it first and blame never' },
]

// Collaboration statements
const collaborationStatements: Statement[] = [
  { id: 'collab_1', angle: 'collaboration', text: 'I paired with a teammate on a task this week' },
  { id: 'collab_2', angle: 'collaboration', text: 'I received specific feedback on my work this week' },
  { id: 'collab_3', angle: 'collaboration', text: 'I asked for help when I was stuck' },
  { id: 'collab_4', angle: 'collaboration', text: 'Someone asked me for help this week' },
  { id: 'collab_5', angle: 'collaboration', text: 'Knowledge is documented, not just in people\'s heads' },
  { id: 'collab_6', angle: 'collaboration', text: 'New team members can contribute within their first week' },
  { id: 'collab_7', angle: 'collaboration', text: 'Disagreements are discussed openly, not avoided' },
  { id: 'collab_8', angle: 'collaboration', text: 'In the last Retro, everyone spoke at least once' },
  { id: 'collab_9', angle: 'collaboration', text: 'I know what my teammates are working on right now' },
  { id: 'collab_10', angle: 'collaboration', text: 'We celebrate wins together, not just individually' },
]

// Technical Excellence statements
const technicalExcellenceStatements: Statement[] = [
  { id: 'tech_1', angle: 'technical_excellence', text: 'All code changes have automated tests' },
  { id: 'tech_2', angle: 'technical_excellence', text: 'The test suite runs in under 10 minutes' },
  { id: 'tech_3', angle: 'technical_excellence', text: 'I refactored something this week without being asked' },
  { id: 'tech_4', angle: 'technical_excellence', text: 'Technical debt is tracked and prioritized' },
  { id: 'tech_5', angle: 'technical_excellence', text: 'We have clear coding standards that we follow' },
  { id: 'tech_6', angle: 'technical_excellence', text: 'I can run the full system locally' },
  { id: 'tech_7', angle: 'technical_excellence', text: 'Deployments are boring, not scary' },
  { id: 'tech_8', angle: 'technical_excellence', text: 'We can roll back a bad deploy in under 5 minutes' },
  { id: 'tech_9', angle: 'technical_excellence', text: 'Documentation is updated when code changes' },
  { id: 'tech_10', angle: 'technical_excellence', text: 'We review architecture decisions as a team' },
]

// Refinement statements
const refinementStatements: Statement[] = [
  { id: 'ref_1', angle: 'refinement', text: 'Stories have clear acceptance criteria before entering the Sprint' },
  { id: 'ref_2', angle: 'refinement', text: 'The team understands the "why" behind each story' },
  { id: 'ref_3', angle: 'refinement', text: 'Stories are small enough to complete in 2-3 days' },
  { id: 'ref_4', angle: 'refinement', text: 'Technical dependencies are identified before Sprint Planning' },
  { id: 'ref_5', angle: 'refinement', text: 'The PO prioritizes based on value, not gut feeling' },
  { id: 'ref_6', angle: 'refinement', text: 'Refinement sessions are timeboxed and productive' },
  { id: 'ref_7', angle: 'refinement', text: 'Edge cases are discussed during refinement, not during development' },
  { id: 'ref_8', angle: 'refinement', text: 'The backlog has at least 2 Sprints worth of ready items' },
  { id: 'ref_9', angle: 'refinement', text: 'Developers ask clarifying questions during refinement' },
  { id: 'ref_10', angle: 'refinement', text: 'Stories are estimated by the whole team, not one person' },
]

// Planning statements
const planningStatements: Statement[] = [
  { id: 'plan_1', angle: 'planning', text: 'The Sprint Goal is clear and achievable' },
  { id: 'plan_2', angle: 'planning', text: 'The team committed to scope they believe in' },
  { id: 'plan_3', angle: 'planning', text: 'Capacity for planned absences was accounted for' },
  { id: 'plan_4', angle: 'planning', text: 'Sprint Planning ends with a shared plan, not assigned tasks' },
  { id: 'plan_5', angle: 'planning', text: 'The Sprint Goal connects to a business outcome' },
  { id: 'plan_6', angle: 'planning', text: 'We discussed how we will achieve the goal, not just what' },
  { id: 'plan_7', angle: 'planning', text: 'Planning took less than 2 hours' },
  { id: 'plan_8', angle: 'planning', text: 'Everyone in the team participated in planning discussions' },
  { id: 'plan_9', angle: 'planning', text: 'Dependencies on other teams were identified and addressed' },
  { id: 'plan_10', angle: 'planning', text: 'The Sprint Backlog is realistic, not aspirational' },
]

// Retro statements
const retroStatements: Statement[] = [
  { id: 'retro_1', angle: 'retro', text: 'The last Retro produced at least one concrete action' },
  { id: 'retro_2', angle: 'retro', text: 'Retro actions from last Sprint were completed' },
  { id: 'retro_3', angle: 'retro', text: 'Everyone felt safe to speak up in the Retro' },
  { id: 'retro_4', angle: 'retro', text: 'We discussed root causes, not just symptoms' },
  { id: 'retro_5', angle: 'retro', text: 'The Retro format varies to keep it fresh' },
  { id: 'retro_6', angle: 'retro', text: 'Positive things were celebrated, not just problems' },
  { id: 'retro_7', angle: 'retro', text: 'Retro actions have clear owners' },
  { id: 'retro_8', angle: 'retro', text: 'The Scrum Master facilitates, not dominates' },
  { id: 'retro_9', angle: 'retro', text: 'We learn from what went well, not just what went wrong' },
  { id: 'retro_10', angle: 'retro', text: 'The team decided on actions, not the Scrum Master' },
]

// Demo statements
const demoStatements: Statement[] = [
  { id: 'demo_1', angle: 'demo', text: 'Stakeholders attended the last Sprint Review' },
  { id: 'demo_2', angle: 'demo', text: 'Stakeholder feedback was captured and added to the backlog' },
  { id: 'demo_3', angle: 'demo', text: 'The demo showed working software, not slides' },
  { id: 'demo_4', angle: 'demo', text: 'The Sprint Goal was clearly demonstrated' },
  { id: 'demo_5', angle: 'demo', text: 'Developers presented their own work' },
  { id: 'demo_6', angle: 'demo', text: 'Stakeholders asked questions during the demo' },
  { id: 'demo_7', angle: 'demo', text: 'The PO confirmed whether the Sprint Goal was met' },
  { id: 'demo_8', angle: 'demo', text: 'Future direction was discussed based on what was learned' },
  { id: 'demo_9', angle: 'demo', text: 'The demo was timeboxed and focused' },
  { id: 'demo_10', angle: 'demo', text: 'Incomplete work was shown transparently, not hidden' },
]

// All statements indexed by angle
const statementsByAngle: Record<DeltaAngle, Statement[]> = {
  scrum: scrumStatements,
  flow: flowStatements,
  ownership: ownershipStatements,
  collaboration: collaborationStatements,
  technical_excellence: technicalExcellenceStatements,
  refinement: refinementStatements,
  planning: planningStatements,
  retro: retroStatements,
  demo: demoStatements,
}

/**
 * Get statements for a specific angle
 */
export function getStatements(angle: DeltaAngle): Statement[] {
  return statementsByAngle[angle] || []
}

/**
 * Get a single statement by ID
 */
export function getStatementById(id: string): Statement | null {
  for (const statements of Object.values(statementsByAngle)) {
    const found = statements.find(s => s.id === id)
    if (found) return found
  }
  return null
}

/**
 * Get all statements (for validation)
 */
export function getAllStatements(): Statement[] {
  return Object.values(statementsByAngle).flat()
}
