# Doctor Tracker — Frontend Clinical Admin Portal

Standalone Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS v4, TanStack Query, Recharts) client application for the Doctor Tracker clinical administrative portal.

## Features

- **Protected Portal Routes**: Next.js Edge Middleware + `HttpOnly` JWT session cookies via BFF API routes (`/api/auth/*`, `/api/proxy/*`).
- **Clinical Analytics Dashboard**: Interactive KPI cards and Recharts visualizations (admissions timeline, patients per doctor, condition donut, departmental coverage).
- **Doctors & Patients Directories**: Debounced search, date-range and multi-select filtering synchronized with URL search params, pagination, and full CRUD modals.

## Local Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

App runs on `http://localhost:3002`.

## Build & Type-Check

```bash
npm run typecheck
npm run build
npm start
```
