# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run db:up        # Start PostgreSQL via Docker Compose
npm run db:down      # Stop PostgreSQL via Docker Compose
```

After adding/modifying Prisma schema: `npx prisma migrate dev` to apply migrations and regenerate the client.

## Architecture

This is a **Next.js 14 App Router** hackathon management system for HackKU 2026, using TypeScript, Tailwind CSS, and shadcn/ui components. The database is PostgreSQL via **Prisma ORM**, auth is handled by **NextAuth v4** (email magic links + Google/GitHub/Discord OAuth), and files are stored in **Vercel Blob**.

NOTE: This project works best on Node < 25. Most issues with webpack and libraries breaking can be solved by checking the current node version.

### Directory layout

- `app/` — Pages, layouts, and server actions. Actions live in `app/actions/` and are called directly from client components.
- `app/admin/` — Role-restricted admin dashboard (check-ins, user management, analytics, data export).
- `components/` — Reusable components. `components/ui/` is shadcn/ui; `components/admin/` and `components/forms/` are app-specific.
- `lib/` — Prisma client singleton (`lib/prisma.ts`), NextAuth config (`lib/authoptions.ts`), and utilities.
- `middlewares/` — `isAdmin()` / `isAdminOrVolunteer()` helpers used to guard server actions and pages.
- `prisma/` — Schema and migrations.
- `scripts/` — One-off data export scripts (Google Sheets, resumes).

### Auth & roles

Users have a `role` field: `HACKER`, `VOLUNTEER`, or `ADMIN`. The session is enriched with this role in the NextAuth callbacks (`lib/authoptions.ts`). Admin routes call `isAdmin()` or `isAdminOrVolunteer()` from `middlewares/` at the top of server actions/pages.

### Registration flow

`/register` → `app/actions/register.ts#registerUser` → creates `ParticipantInfo` record → exports row to Google Sheets. Resume PDFs are uploaded to Vercel Blob via `POST /api/upload` before form submission.

### Check-in / QR flow

Each registered user has a QR code encoding their user ID. Volunteers scan it → `validateQrCode` server action → creates a `Scan` record and a `Checkin` record in the database.

### Key data models

`User` → `ParticipantInfo` (1:1 registration), `Checkin` (1:many attendance), `TravelReimbursement` (1:1). `Event` → `Checkin` and `Scan` (1:many).

### External integrations

- **Google Sheets** — Registration backup on every sign-up and via admin "Backup" button.
- **Mailgun** — Email delivery (configured via `MAILGUN_EMAIL_SERVER` env var).
- **Vercel Blob** — Resume storage.
- **Notion** — `/api/notion` renders Notion blocks in-app.
