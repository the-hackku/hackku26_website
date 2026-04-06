# HackKU Management System

## Overview

The **HackKU Management System** manages hackathon logistics for HackKU 2026, from participant registration to event check-ins. It provides organizers and admins with tools to manage users, events, and real-time attendance through a web interface.

## Features

- **User Registration & Login**: Sign in using email magic links or OAuth (Google, GitHub, Discord).
- **QR Code Check-Ins**: Participants receive QR codes to check into events.
- **Admin Dashboard**: Full control over users, events, and check-in stats.
- **Real-time Tracking**: Track attendance and check-ins in real time.
- **Data Export**: Back up registration data to Google Sheets; download resume PDFs.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js server actions, Prisma ORM, PostgreSQL
- **Auth**: NextAuth v4 — email magic links + Google / GitHub / Discord OAuth
- **Storage**: Vercel Blob (resume PDFs)
- **Email**: Mailgun (via `MAILGUN_EMAIL_SERVER`)
- **Deployment**: Vercel

## Development Setup

> **Node version**: Use Node 18 or 20. Most webpack/library issues are caused by a mismatched Node version.

### 1. Clone and install

```bash
git clone https://github.com/the-hackku/hackku26-website
cd hackku26-website
npm install
```

### 2. Configure environment variables

Copy the example file and fill in values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Full URL of the app (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Random secret for NextAuth (generate with `openssl rand -base64 32`) |
| `MAILGUN_EMAIL_SERVER` | SMTP connection string for Mailgun |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth app credentials |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth app credentials |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | Discord OAuth app credentials |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | JSON key for Google Sheets export (base64 or raw) |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Google API key (public, used client-side) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for resume uploads |

### 3. Start the database

A Docker Compose file is included for local Postgres:

```bash
npm run db:up
```

This starts a `postgres:16` container on port `5432` with:
- User: `hackku`, Password: `hackku`, Database: `hackku_dev`

Set `DATABASE_URL` accordingly:

```
DATABASE_URL="postgresql://hackku:hackku@localhost:5432/hackku_dev"
```

### 4. Run database migrations

```bash
npx prisma migrate dev
```

This applies all migrations and regenerates the Prisma client. Re-run this after any schema changes.

### 5. Start the development server

```bash
npm run dev
```

Visit `http://localhost:3000`.

### Other useful commands

```bash
npm run build          # Production build
npm run lint           # Run ESLint
npm run db:down        # Stop the local Postgres container
npx prisma studio      # Browse the database in a GUI
```

## Important Files

### `constants.ts` (root)

**The primary file to update when preparing for a new hackathon year.** Contains site-wide values used across pages, emails, and registration logic:

```ts
const constants = {
  hackathonName: "HackKU26",
  dates: "April 17th - 19th, 2026",
  location: "The University of Kansas",
  discordInvite: "https://discord.gg/...",
  instagramUrl: "https://instagram.com/hackku",
  supportEmail: "hack@ku.edu",
  cutoffDate: "2026-04-17T00:00:00.000Z",   // registration closes
  startDate: "2026-04-17T22:00:00.000Z",    // check-in opens (5 PM CDT Friday)
  endDate: "2026-04-19T20:00:00.000Z",      // closing ceremony ends (3 PM CDT Sunday)
};
```

### `lib/authoptions.ts`

NextAuth configuration: providers, session callbacks, and the role enrichment logic. Update the `from` email address here if the sending domain changes.

### `prisma/schema.prisma`

Database schema. After edits, run `npx prisma migrate dev` to apply changes and regenerate the client.

### `app/actions/`

Server actions called directly from client components. Key actions:
- `register.ts` — creates `ParticipantInfo`, exports row to Google Sheets
- `checkin.ts` — validates QR codes and records `Scan` / `Checkin` entries

### `middlewares/`

`isAdmin()` and `isAdminOrVolunteer()` helpers that guard server actions and admin pages.
