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
npx prisma db push
```

The current schema stores user roles as the Prisma `Role` enum (`USER` or
`ADMIN`). If upgrading a database that still has the old `roles` table, reset
the development database once with `npx prisma db push --force-reset`; this
removes existing development data.

Set `NEXT_PUBLIC_API_URL` to the API base URL, for example
`http://localhost:3000/api`. API route constants append their endpoint paths
to this value.

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

Run the test suite with `npm test`; its unit and route-handler integration tests do not require a running database.

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
