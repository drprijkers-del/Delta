# Pink Pollos Mood App

Een **Agile Team Mood App** als losse tool binnen de Pink Pollos Lab-omgeving. Track je team's dagelijkse mood en verbeter de teamdynamiek.

## Features

- **Dagelijkse check-ins** - 1 klik per dag met 5 mood levels
- **Anoniem** - Alleen geaggregeerde data wordt gedeeld
- **Multi-tenant** - Teams zien elkaar nooit
- **Streaks** - Gamification met persoonlijke streaks
- **Mobile-first** - Werkt perfect op elk apparaat

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Supabase** (Auth + Postgres)
- **Prisma** (ORM)
- **Tailwind CSS**
- **Vercel** (Deployment)

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/drprijkers-del/mood-app.git
cd mood-app
npm install
```

### 2. Supabase Setup

1. Maak een nieuw project aan op [supabase.com](https://supabase.com)
2. Ga naar **SQL Editor** en voer de inhoud van `supabase/schema.sql` uit
3. Ga naar **Settings > API** en kopieer je keys

### 3. Environment Variables

Kopieer `.env.example` naar `.env` en vul in:

```bash
cp .env.example .env
```

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (gebruik Supabase connection strings)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Admin User Aanmaken

1. Ga naar Supabase **Authentication > Users** en maak een user aan
2. Voeg deze user toe aan de `admin_users` tabel:

```sql
INSERT INTO admin_users (email) VALUES ('jouw@email.com');
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
mood-app/
├── app/
│   ├── admin/           # Admin pages
│   │   ├── login/
│   │   └── teams/
│   └── t/[slug]/        # Team check-in pages
├── components/
│   ├── admin/           # Admin components
│   ├── team/            # Team components
│   └── ui/              # Shared UI components
├── domain/
│   ├── moods/           # Mood actions
│   └── teams/           # Team actions
├── lib/
│   ├── auth/            # Auth helpers
│   ├── supabase/        # Supabase clients
│   └── tenant/          # Multi-tenant context
├── prisma/              # Prisma schema
└── supabase/            # SQL schema
```

## User Flows

### Admin Flow
1. Login op `/admin/login`
2. Maak teams aan op `/admin/teams`
3. Kopieer de share-link
4. Deel met je team

### Team Member Flow
1. Open share-link (bijv. `/t/marketing?k=abc123`)
2. Token wordt gevalideerd, sessie wordt gezet
3. Redirect naar clean URL `/t/marketing`
4. Kies je mood (1-5)
5. Optioneel: nickname en comment
6. Check-in!

## Deployment

De app is al gekoppeld aan Vercel. Om te deployen:

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

Of push naar GitHub - Vercel bouwt automatisch.

### Environment Variables in Vercel

Voeg dezelfde environment variables toe in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL` (je Vercel URL)

## Security

- Admin routes alleen toegankelijk voor admin users
- Team data altijd gefilterd op `team_id`
- Public inserts via Postgres RPC functions
- Invite tokens worden gehashed opgeslagen
- Row Level Security op alle tabellen

## License

MIT - Pink Pollos Lab
