# LVAEP Tutor Reporting

A small Next.js application for logging tutoring sessions and generating monthly reports. Shared data is stored in Supabase; reports and CSV exports are always derived from session records.

## Supabase setup

1. Create a Supabase project.
2. In the Supabase SQL Editor, run every file in [`supabase/migrations`](supabase/migrations) in filename order. Each file is applied once. Existing projects that already ran the earlier files only need to run migrations added afterward.
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

This take-home intentionally has no authentication. Row Level Security is enabled, with explicit anonymous policies for reading demo data, creating and deleting sessions, and toggling goal completion. Goal updates are additionally limited to the `status` and `completed_at` columns.

Because every visitor uses the same anonymous database role, session creation and deletion cannot be attributed or restricted to an individual tutor, and any visitor can toggle any goal. Use only fictional, non-sensitive data. Production use requires authentication and user-specific authorization policies.

## Commands

```bash
npm run dev
npm test
npm run lint
npx tsc --noEmit
npx next build --webpack
```
