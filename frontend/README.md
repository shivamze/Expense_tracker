# Trackr Frontend

Next.js (App Router) client for Trackr. See the [project README](../README.md) for the full overview and deployment notes.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS v4, TanStack Query v5, Axios, Recharts, js-cookie.

## Requirements

Node.js 20.9 or newer.

## Run locally

```bash
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Open http://localhost:3000. The backend must be running for login and data to work.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL used by the browser. Defaults to `http://localhost:8000` |

This value is embedded at build time. After changing it, rebuild (or redeploy on Vercel).

## Structure

```text
src/
├── app/
│   ├── page.tsx              # login
│   ├── register/
│   ├── dashboard/
│   ├── expense/
│   ├── savings/
│   └── components/           # forms, tables, modal, charts, header
├── context/AuthContext.tsx   # current user, login state, logout
├── hooks/                    # one TanStack Query hook per operation
├── lib/api.ts                # Axios instance and token refresh
├── providers/                # React Query provider
├── types/                    # shared TypeScript types and enums
└── middleware.ts             # redirects based on the session cookie
```

## Key patterns

- **Data fetching:** each read or write has its own hook (`useExpenses`, `useCreateExpense`, and so on). Mutations invalidate the related query keys so lists and dashboard totals refresh.
- **Auth:** `lib/api.ts` attaches the access token to every request. On a 401 it performs a single shared refresh and retries the original request.
- **Route guard:** `middleware.ts` redirects visitors without a session cookie away from protected pages, and logged-in users away from the login and register pages. Real authorization is enforced by the backend.
- **Forms:** form components prepare the API payload and hand it to the parent, which decides whether to create or update.

## Docker

The `Dockerfile` is a multi-stage build (dependencies, build, runtime). Pass the API URL as a build argument:

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 -t trackr-frontend .
```
