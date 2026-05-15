# Hosting Options

## Current preference

Start with:
- Vercel Hobby for the Next.js web app and API routes
- Neon Free or Supabase Free for hosted Postgres

This keeps the project free for low traffic while avoiding serverless filesystem persistence problems.

## Why not SQLite on the web host?

SQLite is still useful for local experiments, but most free serverless app hosts do not provide durable writable disk. The first hosted version should use a managed database so notes, users, devices, and print status survive deployments and function restarts.

## Option A: Vercel + Neon

Good fit when:
- We want a simple Next.js deployment path.
- We want Postgres without also adopting Supabase Auth.
- We are comfortable implementing login/session logic or adding Auth.js.

Tradeoffs:
- Neon Free scales to zero, so an idle database can have a cold start.
- We still need to wire auth, migrations, and backups thoughtfully.

## Option B: Vercel + Supabase

Good fit when:
- We want Postgres plus hosted auth in one place.
- We may eventually want row-level security policies.
- We prefer using Supabase's dashboard and APIs for admin tasks.

Tradeoffs:
- Free projects can pause after inactivity.
- Supabase Auth is another integration decision, not just a database.

## Option C: Render

Good fit when:
- We want a traditional long-running Node server instead of serverless routes.
- We want app and database hosting from one provider.

Tradeoffs:
- Free services have limitations and are better for hobby/testing than production.
- A sleeping web service can delay the first printer poll after idle time.

## Recommendation for this project

Use Vercel + Neon first. The firmware polls only once a minute, the browser traffic is tiny, and the API routes are short. If we decide hosted auth matters more than keeping the app code self-contained, switch the database/auth choice to Supabase before adding migrations.
