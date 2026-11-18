# Cloudflare R2 media storage

New payment proofs and expert profile images are stored as objects in Cloudflare R2. PostgreSQL stores only the object key, MIME type, owner, and timestamps. Existing database-backed images remain readable after the migration.

1. In Cloudflare, create an R2 bucket (for example, `broker-media`).
2. Create an R2 API token scoped to that bucket with **Object Read & Write** permission.
3. Add the four `CLOUDFLARE_R2_*` values from `.env.example` to the deployment environment.
4. Run `npm run db:deploy` before deploying the application code.

The bucket can remain private. The application serves private payment proofs only after checking the current user and serves expert images through the existing public image endpoint. Uploads fail closed with HTTP 503 if R2 credentials are missing; binary data is never silently written back into PostgreSQL.
