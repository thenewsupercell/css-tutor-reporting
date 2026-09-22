# LVAEP Tutor Reporting

A small Next.js application for logging tutoring sessions and generating monthly reports. Shared data is stored in Supabase; reports and CSV exports are always derived from session records.

## Supabase setup

1. Create a Supabase project.
2. In the Supabase SQL Editor, run the files in [`supabase/migrations`](supabase/migrations) in filename order. Existing milestone 4 projects only need to apply the newer goal-status migration.
3. Run [`supabase/seed.sql`](supabase/seed.sql) once in the SQL Editor. The inserts are idempotent, so rerunning the file will not duplicate the fictional records.
4. Copy `.env.example` to `.env.local` and fill in the project URL and publishable key from the project's **Connect** dialog or **Settings → API Keys**:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
   ```

5. Install dependencies and start the application:

   ```bash
   npm install
   npm run dev
   ```

Add the same two environment variables to the Vercel project before deploying. Never place a Supabase secret key or service-role key in a `NEXT_PUBLIC_` variable.

If you already use the Supabase CLI, the committed migration and default `supabase/seed.sql` also support the standard local reset or linked-project migration workflow.

## Demo access assumption

This take-home intentionally has no authentication. The migration disables Row Level Security and grants the anonymous role read access to program data plus insert/delete access to sessions. Use only fictional, non-sensitive data. Before any real deployment, add authentication, enable RLS on every exposed table, and replace these anonymous grants with appropriate policies.

## Commands

```bash
npm run dev
npm test
npm run lint
npx tsc --noEmit
npx next build --webpack
```
