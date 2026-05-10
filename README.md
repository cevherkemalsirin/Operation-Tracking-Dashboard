# Operation Tracking Dashboard

React + Vite frontend with a Node.js, Express, and PostgreSQL backend.

## Main Pages

- `/` home entry page
- `/login` login and signup page
- `/welcome` welcome page with quick links
- `/dashboard` ticket dashboard
- `/tickets` ticket management
- `/tickets/:id` ticket detail with SLA, history, and work notes
- `/statistics` analytics charts
- `/users` admin-only user management

## Run Frontend

```bash
npm install
npm run dev
```

## Run Backend

```bash
cd server
npm install
npm run dev
```

## Recreate Demo Database

Run this after pulling new changes if the database needs the same demo users and tickets:

```bash
npm run seed
```

Or from inside the server folder:

```bash
cd server
npm run seed
```

The seed script recreates the schema, clears old demo data, and inserts demo users, 200 tickets, SLA values, history, and work notes.

Main demo logins:

- `admin@nokia.com` / `admin1234`
- `cevher@nokia.com` / `cevher1234`
- `vlad@nokia.com` / `vlad1234`
- `viewer@example.com` / `viewer1234`

Important: `npm run seed` resets the database tables. Do not run it against production data.
