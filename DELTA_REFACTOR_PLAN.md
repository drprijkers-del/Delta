# DELTA REFACTOR PLAN
## Pulse → Delta Transformation

---

## STEP 1: CODEBASE TRIAGE

### A. INFRASTRUCTURE (KEEP AS-IS)

These files are product-agnostic and must be preserved:

```
lib/
├── auth/
│   ├── admin.ts           ✅ KEEP - Admin auth helpers
│   ├── password.ts        ✅ KEEP - Password session logic
│   └── super-admin.ts     ✅ KEEP - Super admin auth
├── supabase/
│   ├── client.ts          ✅ KEEP - Browser Supabase client
│   ├── middleware.ts      ✅ KEEP - Session refresh logic
│   └── server.ts          ✅ KEEP - Server Supabase clients
├── tenant/
│   └── context.ts         ⚠️  ADAPT - Token/device logic (reusable for sessionCode)
├── i18n/
│   ├── context.tsx        ✅ KEEP - Language provider
│   └── translations.ts    🔄 REPLACE - New Delta translations
└── utils.ts               ✅ KEEP - generateSlug, cn, etc.

app/
├── layout.tsx             ✅ KEEP - Root layout with providers
├── globals.css            ✅ KEEP - Tailwind base styles
├── api/auth/              ✅ KEEP - All auth endpoints
│   ├── callback/route.ts
│   ├── login-password/route.ts
│   ├── super-admin/login/route.ts
│   └── super-admin/logout/route.ts

components/ui/
├── button.tsx             ✅ KEEP
├── card.tsx               ✅ KEEP
├── input.tsx              ✅ KEEP
├── modal.tsx              ✅ KEEP
├── language-toggle.tsx    ✅ KEEP
└── fly.tsx                🗑️ DELETE - Pulse Easter egg

middleware.ts              ⚠️  ADAPT - Update route patterns
```

### B. PULSE DOMAIN (MOVE TO /_legacy_pulse/)

These files contain Pulse-specific logic and must be isolated:

```
MOVE TO /_legacy_pulse/:

domain/
├── moods/
│   └── actions.ts         → /_legacy_pulse/domain/moods/actions.ts
├── metrics/
│   ├── actions.ts         → /_legacy_pulse/domain/metrics/actions.ts
│   ├── calculations.ts    → /_legacy_pulse/domain/metrics/calculations.ts
│   ├── types.ts           → /_legacy_pulse/domain/metrics/types.ts
│   └── index.ts           → /_legacy_pulse/domain/metrics/index.ts

components/
├── admin/
│   ├── pulse-metrics.tsx  → /_legacy_pulse/components/pulse-metrics.tsx
│   ├── team-stats.tsx     → /_legacy_pulse/components/team-stats.tsx (mood-specific stats)
├── team/
│   ├── team-checkin.tsx   → /_legacy_pulse/components/team-checkin.tsx
│   ├── checkin-success.tsx→ /_legacy_pulse/components/checkin-success.tsx
│   ├── already-checked-in.tsx → /_legacy_pulse/components/already-checked-in.tsx

app/
├── t/[slug]/page.tsx      → /_legacy_pulse/app/t/[slug]/page.tsx (mood check-in route)
```

### C. PULSE DOMAIN (DELETE OR REPLACE)

These will be replaced entirely with Delta equivalents:

```
DELETE (rebuild for Delta):

app/
├── page.tsx               🔄 REPLACE - New Delta landing page
├── admin/
│   ├── teams/[id]/page.tsx 🔄 REPLACE - Team detail → Delta session list
│   ├── teams/page.tsx      🔄 REPLACE - Teams list (keep structure, remove mood refs)
│   └── teams/new/page.tsx  🔄 REPLACE - Create team (simplify)

components/admin/
├── team-detail-content.tsx 🔄 REPLACE - Remove pulse metrics, add Delta sessions
├── share-link-section.tsx  ⚠️  ADAPT - Reuse for session share links
├── team-card.tsx           ⚠️  ADAPT - Remove mood stats display
├── team-actions.tsx        ✅ KEEP - Generic team actions

components/home/
└── home-content.tsx        🔄 REPLACE - Delta landing page content
```

---

## STEP 2: DELTA DATA MODEL

### New Tables (add to schema.sql)

```sql
-- ============================================
-- DELTA SCHEMA
-- ============================================

-- Delta session angles (pre-defined)
CREATE TYPE delta_angle AS ENUM (
  'scrum',
  'flow',
  'ownership',
  'collaboration',
  'technical_excellence'
);

-- Delta session status
CREATE TYPE delta_status AS ENUM (
  'draft',      -- Created but not started
  'active',     -- Accepting responses
  'closed'      -- Completed, synthesized
);

-- Delta sessions (one per intervention)
CREATE TABLE IF NOT EXISTS delta_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  -- Session identity
  session_code TEXT UNIQUE NOT NULL,  -- Short code for public link: /d/[code]
  angle delta_angle NOT NULL,
  title TEXT,                          -- Optional custom title

  -- Status tracking
  status delta_status NOT NULL DEFAULT 'draft',

  -- Outcome (set when closed)
  focus_area TEXT,                     -- The ONE thing to focus on
  experiment TEXT,                     -- The ONE experiment to run
  experiment_owner TEXT,               -- Who owns it
  followup_date DATE,                  -- When to check back

  -- Metadata
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_closure CHECK (
    status != 'closed' OR (focus_area IS NOT NULL AND experiment IS NOT NULL)
  )
);

-- Delta responses (anonymous team input)
CREATE TABLE IF NOT EXISTS delta_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES delta_sessions(id) ON DELETE CASCADE,

  -- Response data
  answers JSONB NOT NULL,              -- { "statement_id": score, ... }
  device_id TEXT NOT NULL,             -- Anonymous tracking

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One response per device per session
  UNIQUE(session_id, device_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_delta_sessions_team_id ON delta_sessions(team_id);
CREATE INDEX IF NOT EXISTS idx_delta_sessions_code ON delta_sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_delta_sessions_status ON delta_sessions(status);
CREATE INDEX IF NOT EXISTS idx_delta_responses_session_id ON delta_responses(session_id);

-- RLS policies
ALTER TABLE delta_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE delta_responses ENABLE ROW LEVEL SECURITY;

-- Session policies (same pattern as teams)
CREATE POLICY "Admins can manage their delta_sessions"
  ON delta_sessions FOR ALL
  TO authenticated
  USING (
    is_super_admin()
    OR EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = delta_sessions.team_id
      AND teams.owner_id = get_admin_user_id()
    )
  );

CREATE POLICY "Public can read active delta_sessions by code"
  ON delta_sessions FOR SELECT
  TO anon
  USING (status = 'active');

-- Response policies
CREATE POLICY "Admins can view their delta_responses"
  ON delta_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM delta_sessions ds
      JOIN teams t ON t.id = ds.team_id
      WHERE ds.id = delta_responses.session_id
      AND (is_super_admin() OR t.owner_id = get_admin_user_id())
    )
  );

CREATE POLICY "Public can insert delta_responses"
  ON delta_responses FOR INSERT
  TO anon
  WITH CHECK (TRUE);
```

### Tables to Keep (reuse from Pulse)

```sql
-- KEEP AS-IS:
admin_users      -- Auth still works
teams            -- Team entity is reusable

-- REMOVE (Pulse-specific):
-- Can keep tables but ignore them. Or drop:
-- participants   -- Delta uses device_id directly
-- mood_entries   -- Replaced by delta_responses
-- invite_links   -- Replaced by session_code
```

---

## STEP 3: ROUTING & PAGE RESPONSIBILITIES

### Route Structure

```
PUBLIC (no auth):
/                           → Delta landing page
/login                      → Email input for magic link
/api/auth/callback          → Magic link handler (existing)

PROTECTED (logged-in consultant):
/app                        → Redirect to /app/teams
/app/teams                  → Teams list
/app/teams/new              → Create team form
/app/teams/[id]             → Team detail + Delta session list
/app/teams/[id]/delta/new   → Create Delta session (select angle)
/app/delta/[sessionId]      → Delta session view (responses + synthesis)

TEAM PARTICIPATION (no login):
/d/[sessionCode]            → Answer statements (public access)
```

### Route Mapping (file structure)

```
app/
├── page.tsx                     → Delta landing
├── login/
│   └── page.tsx                 → Admin login (move from /admin/login)
├── app/
│   ├── layout.tsx               → Protected layout (auth check)
│   ├── page.tsx                 → Redirect to /app/teams
│   ├── teams/
│   │   ├── page.tsx             → Teams list
│   │   ├── new/
│   │   │   └── page.tsx         → Create team
│   │   └── [id]/
│   │       ├── page.tsx         → Team detail + sessions
│   │       └── delta/
│   │           └── new/
│   │               └── page.tsx → Create Delta session
│   └── delta/
│       └── [sessionId]/
│           └── page.tsx         → Session detail + synthesis
└── d/
    └── [sessionCode]/
        └── page.tsx             → Public participation page
```

### Page Responsibilities

| Route | Purpose | Key Actions |
|-------|---------|-------------|
| `/` | Delta landing | Explain product, CTA to login |
| `/login` | Auth entry | Email input, trigger magic link |
| `/app/teams` | Team list | Show teams, create new |
| `/app/teams/[id]` | Team detail | List Delta sessions, create new session |
| `/app/teams/[id]/delta/new` | Create session | Select angle, start session |
| `/app/delta/[sessionId]` | Session control | View responses, synthesize output, close session |
| `/d/[code]` | Participate | Answer statements, submit anonymously |

---

## STEP 4: DELTA CORE FLOW

### Flow Diagram

```
1. CONSULTANT CREATES TEAM
   /app/teams/new → Create team (name, optional description)

2. CONSULTANT CREATES DELTA SESSION
   /app/teams/[id]/delta/new
   → Select ONE angle (Scrum / Flow / Ownership / etc.)
   → System generates session_code
   → Status: 'active'

3. CONSULTANT SHARES LINK
   /app/delta/[sessionId]
   → Copy link: /d/[sessionCode]
   → Share with team (Slack, email, whatever)

4. TEAM MEMBERS RESPOND
   /d/[sessionCode]
   → 10-15 sharp statements
   → Agree/Disagree scale (1-5)
   → One submission per device
   → Anonymous

5. CONSULTANT VIEWS RESULTS
   /app/delta/[sessionId]
   → Real-time response count
   → When ready: "Synthesize"

6. SYNTHESIS (automatic)
   → Calculate scores per statement
   → Identify top 2 strengths (highest scores)
   → Identify top 2 tensions (lowest scores)
   → Generate focus area (lowest cluster)
   → Suggest experiment (rule-based)

7. CONSULTANT CLOSES SESSION
   → Confirm focus area
   → Confirm/edit experiment
   → Assign owner
   → Set follow-up date
   → Status: 'closed'

8. NO HISTORY
   → Session is done
   → No dashboards
   → No comparisons
   → Move on
```

### Synthesis Logic (v1 - Rule-Based)

```typescript
interface SynthesisInput {
  responses: DeltaResponse[]
  statements: Statement[]
}

interface SynthesisOutput {
  strengths: { statement: Statement; score: number }[]     // Top 2
  tensions: { statement: Statement; score: number }[]      // Bottom 2
  focusArea: string                                         // Derived from lowest cluster
  suggestedExperiment: string                               // Rule-based suggestion
}

function synthesize(input: SynthesisInput): SynthesisOutput {
  // 1. Calculate average score per statement
  const scores = calculateStatementScores(input.responses, input.statements)

  // 2. Sort by score
  const sorted = scores.sort((a, b) => b.score - a.score)

  // 3. Extract strengths (top 2) and tensions (bottom 2)
  const strengths = sorted.slice(0, 2)
  const tensions = sorted.slice(-2).reverse()  // Lowest first

  // 4. Derive focus area from lowest tension
  const focusArea = deriveFocusArea(tensions[0])

  // 5. Generate experiment suggestion
  const suggestedExperiment = generateExperiment(focusArea, tensions[0])

  return { strengths, tensions, focusArea, suggestedExperiment }
}
```

---

## STEP 5: STATEMENTS & OUTPUT LOGIC

### Statement Design Principles

1. **Sharp, not soft** - No "Do you feel..." language
2. **Observable behaviors** - Things you can see, not feel
3. **Binary provable** - Could be verified by observation
4. **No escape hatch** - Avoid "sometimes" or "usually"
5. **Present tense** - About now, not aspirational

### Bad vs Good Statements

```
❌ BAD: "Team members feel comfortable speaking up"
✅ GOOD: "In the last Sprint, everyone spoke in the Retro"

❌ BAD: "We usually deliver on our commitments"
✅ GOOD: "The Sprint Goal was achieved last Sprint"

❌ BAD: "There's a culture of feedback"
✅ GOOD: "I received specific feedback on my work this week"
```

### Example Statements by Angle

#### SCRUM (10 statements)

```typescript
const scrumStatements = [
  { id: 'scrum_1', text: 'The Sprint Goal was achieved last Sprint' },
  { id: 'scrum_2', text: 'The Daily Scrum takes less than 15 minutes' },
  { id: 'scrum_3', text: 'The Product Owner was available for questions last Sprint' },
  { id: 'scrum_4', text: 'Sprint scope did not change after Sprint Planning' },
  { id: 'scrum_5', text: 'The Retrospective produced at least one concrete action' },
  { id: 'scrum_6', text: 'That action was actually implemented' },
  { id: 'scrum_7', text: 'I understand why the current Sprint Goal matters' },
  { id: 'scrum_8', text: 'Stakeholders only see work during Sprint Review' },
  { id: 'scrum_9', text: 'The team decides how to do the work, not the PO' },
  { id: 'scrum_10', text: 'Unplanned work was rejected or negotiated last Sprint' },
]
```

#### FLOW (10 statements)

```typescript
const flowStatements = [
  { id: 'flow_1', text: 'I worked on only one item at a time last week' },
  { id: 'flow_2', text: 'Items move from "In Progress" to "Done" within 3 days' },
  { id: 'flow_3', text: 'Code reviews happen within 4 hours' },
  { id: 'flow_4', text: 'I know exactly what I should work on next' },
  { id: 'flow_5', text: 'There are no items blocked for more than 2 days' },
  { id: 'flow_6', text: 'WIP limits are enforced, not ignored' },
  { id: 'flow_7', text: 'Deployments happen at least weekly' },
  { id: 'flow_8', text: 'I was not waiting on someone else for more than half a day' },
  { id: 'flow_9', text: 'The board reflects reality right now' },
  { id: 'flow_10', text: 'Meetings do not interrupt my focus time' },
]
```

#### OWNERSHIP (10 statements)

```typescript
const ownershipStatements = [
  { id: 'own_1', text: 'I can deploy my code to production without asking permission' },
  { id: 'own_2', text: 'I fixed a bug last week without being assigned to it' },
  { id: 'own_3', text: 'The team decided on technical approach, not a lead or architect' },
  { id: 'own_4', text: 'I know who is on-call and how to reach them' },
  { id: 'own_5', text: 'I have access to production logs' },
  { id: 'own_6', text: 'I participated in an incident review this quarter' },
  { id: 'own_7', text: 'I can create a new service without filing a ticket' },
  { id: 'own_8', text: 'The team owns the backlog prioritization, not just the PO' },
  { id: 'own_9', text: 'I refactored code this month that I did not originally write' },
  { id: 'own_10', text: 'When something breaks, we fix it first and blame never' },
]
```

### Experiment Templates (by focus area)

```typescript
const experimentTemplates = {
  'sprint_goal_miss': {
    focus: 'Sprint Goal achievement',
    experiments: [
      'For the next Sprint, define the Sprint Goal before selecting any items',
      'The Scrum Master will check in on Sprint Goal progress daily',
      'If scope is added, something of equal size is removed immediately',
    ]
  },
  'wip_overload': {
    focus: 'Work in Progress',
    experiments: [
      'Enforce a WIP limit of 1 per person for 2 weeks',
      'Before starting new work, help finish something already started',
      'Track and visualize wait times on the board',
    ]
  },
  'review_bottleneck': {
    focus: 'Code review speed',
    experiments: [
      'All PRs must be reviewed within 4 hours during work hours',
      'If a PR is not reviewed in time, it becomes priority 1',
      'Pair on reviews for 1 week to reduce review time',
    ]
  },
  // ... more templates per pattern
}
```

---

## STEP 6: UX & TONE

### Visual Design

- **Primary color**: Keep cyan (#00D4FF) from Pulse
- **Background**: Dark, focused (existing dark theme)
- **Typography**: System fonts, large text, minimal UI
- **Layout**: Single-column, no sidebar noise

### Writing Rules

1. Short sentences
2. No soft language ("might", "perhaps", "consider")
3. No HR tone ("we value", "we believe")
4. Direct questions, not suggestions
5. Numbers over words ("3 days" not "a few days")

### Tone Examples

```
❌ "We noticed some areas that might benefit from attention"
✅ "Two things need work"

❌ "Consider having a conversation about..."
✅ "Talk about this in the next Retro"

❌ "The team shows strong collaboration skills"
✅ "People help each other. Keep it."
```

### Screen Copy Examples

**Landing page:**
```
Delta

One session. One focus. One experiment.

Not a dashboard. Not a maturity model.
A time-boxed intervention for teams who want to improve.

[Start a Delta session]
```

**Session creation:**
```
Pick an angle.
Just one.

○ Scrum — Are events useful?
○ Flow — Is work moving?
○ Ownership — Does the team own it?
○ Collaboration — Are we working together?
○ Technical Excellence — Is the code getting better?

[Start session]
```

**Team participation:**
```
Delta Session: [Team Name]
Angle: Scrum

10 statements. Be honest. It's anonymous.

[Statement 1 of 10]
"The Sprint Goal was achieved last Sprint"

Disagree ○ ○ ○ ○ ○ Agree
   1   2   3   4   5

[Next →]
```

**Synthesis output:**
```
Delta Complete.

STRENGTHS
━━━━━━━━━
✓ Sprint Reviews include real feedback (4.2)
✓ The team decides how work is done (4.0)

TENSIONS
━━━━━━━━━
✗ Sprint scope changed mid-Sprint (1.8)
✗ Retro actions were not implemented (2.1)

FOCUS AREA
━━━━━━━━━━
Sprint scope stability

EXPERIMENT
━━━━━━━━━━
"For the next 2 Sprints, if scope is added after Planning,
something of equal size must be removed in the same conversation."

Owner: ____________
Follow-up: [Date picker - default 2 weeks]

[Close Session]
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Isolation (Day 1)

- [ ] Create `/_legacy_pulse/` directory
- [ ] Move Pulse domain files to legacy
- [ ] Move Pulse components to legacy
- [ ] Move Pulse routes to legacy
- [ ] Verify app still builds (will have broken imports)

### Phase 2: Schema (Day 1)

- [ ] Add Delta tables to `schema.sql`
- [ ] Add Delta RLS policies
- [ ] Add Delta RPC functions
- [ ] Run migration in Supabase

### Phase 3: Domain Layer (Day 2)

- [ ] Create `domain/delta/types.ts`
- [ ] Create `domain/delta/statements.ts`
- [ ] Create `domain/delta/actions.ts` (CRUD for sessions)
- [ ] Create `domain/delta/synthesis.ts`
- [ ] Update `domain/teams/actions.ts` (remove mood refs)

### Phase 4: Routes (Day 2-3)

- [ ] Update `/` landing page
- [ ] Create `/login` page (move from /admin/login)
- [ ] Create `/app/layout.tsx` (protected)
- [ ] Create `/app/teams/page.tsx`
- [ ] Create `/app/teams/new/page.tsx`
- [ ] Create `/app/teams/[id]/page.tsx`
- [ ] Create `/app/teams/[id]/delta/new/page.tsx`
- [ ] Create `/app/delta/[sessionId]/page.tsx`
- [ ] Create `/d/[sessionCode]/page.tsx`

### Phase 5: Components (Day 3)

- [ ] Create `components/delta/session-form.tsx`
- [ ] Create `components/delta/statement-input.tsx`
- [ ] Create `components/delta/synthesis-view.tsx`
- [ ] Create `components/delta/session-close-form.tsx`
- [ ] Update admin components (remove mood refs)

### Phase 6: Translations (Day 3)

- [ ] Replace `lib/i18n/translations.ts` with Delta copy
- [ ] Both NL and EN

### Phase 7: Cleanup (Day 4)

- [ ] Update middleware.ts route patterns
- [ ] Update package.json name
- [ ] Update README.md
- [ ] Delete `/_legacy_pulse/` if not needed
- [ ] Final build test
- [ ] Deploy

---

## VALIDATION CHECKLIST

After each phase, verify:

- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] Auth flow still works
- [ ] Protected routes redirect to login
- [ ] Database operations work

Final validation:

- [ ] Can create team
- [ ] Can create Delta session
- [ ] Can share session link
- [ ] Team can submit responses
- [ ] Synthesis generates output
- [ ] Can close session with outcome
- [ ] Session link stops working after close

---

## NON-GOALS (EXPLICIT)

Do NOT build:
- History views
- Session comparisons
- Trend dashboards
- Scoring over time
- Team benchmarks
- Export functionality
- Email notifications
- Slack integration

If it's not in this document, it's not in scope.
