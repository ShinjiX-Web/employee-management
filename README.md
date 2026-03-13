# Employee Management System

This project is a full rewrite of the employee management system using `Next.js`, `shadcn/ui`, `Tailwind CSS`, and `Supabase Postgres`. It manages departments, positions, employees, attendance, leave requests, projects, and employee-project assignments in one app-router based interface.

## Tech Stack

- Next.js 16
- React 19
- shadcn/ui
- Tailwind CSS 4
- Supabase Postgres
- `pg` for the runtime database client
- `pg-mem` for local automated tests

## Features

- Dashboard with employee-focused summaries
- CRUD for departments
- CRUD for positions
- CRUD for leave types
- CRUD for projects
- CRUD for employees
- CRUD for attendance
- CRUD for leave requests
- CRUD for employee-project assignments
- SQL reports page with:
  - 3 simple queries
  - 4 moderate queries
  - 3 difficult queries
- Copy-to-clipboard button for SQL code blocks
- Light and dark mode

## Environment Setup

Create a `.env.local` file and add your Supabase Postgres connection string:

```env
DATABASE_URL=postgresql://postgres.your-project:your-password@aws-0-region.pooler.supabase.com:6543/postgres?sslmode=require
```

Use the transaction pooler connection string from Supabase for Vercel deployment.

## How to Run

1. Open a terminal inside this folder.
2. Install dependencies:

```powershell
npm install
```

3. Initialize the database schema and seed data:

```powershell
npm run db:setup
```

4. Start the development server:

```powershell
npm run dev
```

5. Open your browser and go to:

```text
http://localhost:3000
```

## Production Build

```powershell
npm run build
npm run start
```

## Database

- Schema file: `database/schema.sql`
- Seed data: `database/seed.sql`
- Environment variable: `DATABASE_URL`

## Vercel Deployment

1. Create a Supabase project.
2. Copy the Supabase Postgres transaction pooler string into `DATABASE_URL`.
3. Add the same `DATABASE_URL` value to your Vercel project environment variables.
4. Deploy the Next.js app to Vercel.

If you use the Supabase integration in Vercel, the environment variables can be synced automatically.

## School Submission Files

- Midterm write-up: `docs/midterm_report.md`
- Manual form: `docs/manual-form.html`
- Finals checklist: `docs/finals_submission.md`
- SQL codes: `docs/sql_codes.sql`

## Tests

Run the project tests with:

```powershell
npm run test
```

## Suggested Screenshot Pages

- Dashboard
- Departments
- Positions
- Employees
- Attendance
- Leave Types
- Leave Requests
- Projects
- Assignments
- SQL Reports
