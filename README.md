This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Documentation

- [Architecture](docs/architecture.md)
- [Writing rules](docs/writing-rules.md)

## Getting Started

Start PostgreSQL for local development:

```bash
cp .env.example .env
docker compose up -d
```

Fill in the required values in `.env`, then apply the schema:

```bash
npx prisma migrate deploy
# or in development:
# npx prisma migrate dev
```

The current schema supports Better Auth and stores user roles as the Prisma `Role` enum (`USER` or `ADMIN`).

Better Auth's Admin plugin manages these roles using the same uppercase values.
Apply migrations with `npx prisma migrate deploy` before starting the app after
updating. An existing `ADMIN` can list users, assign either `USER` or `ADMIN`
with `authClient.admin.setRole({ userId, role: "ADMIN" })`, update only a user's
name with `authClient.admin.updateUser`, ban or unban with
`authClient.admin.banUser` / `authClient.admin.unbanUser`, and permanently delete
another user with `authClient.admin.removeUser`. Regular users cannot perform
these operations, and public signup always creates a `USER`. The first admin
must be promoted with the explicit seed command below; never expose that step
through public signup. The plugin does not grant email or image edits,
impersonation, or password changes. Deleting a user also removes their sessions,
accounts, and game history through the database's cascade relations.

To bootstrap the first admin, register the intended account normally, set
`INITIAL_ADMIN_EMAIL` in `.env` to that account's email, then run:

```bash
npm run seed:admin
```

The seed does not create an account. It is safe to rerun for the same admin,
but refuses to promote a different user once an admin exists. Run this command
only against the intended database; it is not part of migrations or app startup.


Set `NEXT_PUBLIC_API_URL` to the API base URL, for example
`http://localhost:3000/api`. API route constants append their endpoint paths
to this value.

## Google sign-in

Create a Google OAuth client of type **Web application** and set the authorized
redirect URI to `http://localhost:3000/api/auth/callback/google` for local
development (use your deployed domain for production). Set `GOOGLE_CLIENT_ID`
and `GOOGLE_CLIENT_SECRET` in `.env`, and set `BETTER_AUTH_URL` to the app origin,
for example `http://localhost:3000`. The Google button on `/login` uses Better
Auth's OAuth flow. Without both credentials, Google sign-in is unavailable;
email/password sign-in still works.

## Cloudflare R2 image storage

Image upload and deletion use a Cloudflare R2 bucket through the server-side
`POST /api/images` and `DELETE /api/images` endpoints. Set `R2_ACCOUNT_ID`,
`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and
`R2_PUBLIC_URL` in `.env`. `R2_PUBLIC_URL` must be the public custom domain or
R2 development URL for the bucket, without exposing the access credentials to
the browser. Both endpoints require an authenticated `ADMIN` user.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Run the full test suite with `npm test`. Install the Playwright browser once with
`npx playwright install chromium`, or run only the browser tests with
`npm run test:e2e`. The signup/login E2E tests in `e2e/` mock Auth API responses,
so they do not require a running database.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
