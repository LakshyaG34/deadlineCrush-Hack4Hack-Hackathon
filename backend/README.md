# Deadline Crush backend

Express API for team submissions. Large files travel directly from the browser to private S3 multipart uploads; the API handles authorization, signed part URLs, deadline timestamps, version records, and queueing.

## Architecture & Modular Structure

The backend is organized into clean, single-responsibility modules:

```
backend/
├── src/
│   ├── app.js                      # Express application setup, CORS, and routing
│   ├── config/
│   │   └── index.js                # Centralized environment configuration and constants
│   ├── lib/
│   │   ├── db.js                   # MongoDB connection & in-memory fallback stores
│   │   ├── queue.js                # BullMQ queue management and worker factory
│   │   └── s3.js                   # AWS S3 client and presigned multipart operations
│   ├── middlewares/
│   │   └── auth.js                 # Participant (JWT / dev teamId) and organizer auth
│   ├── services/
│   │   ├── submissionService.js    # Submissions CRUD, versioning, CSV export, summary
│   │   ├── uploadService.js        # Multipart upload lifecycle, validation & intents
│   │   └── validationService.js    # SSRF-safe link verification & ZIP bomb inspection
│   ├── controllers/
│   │   ├── healthController.js     # System health endpoint handler
│   │   ├── uploadController.js     # Upload multipart endpoint handlers
│   │   ├── submissionController.js # Team submission handlers
│   │   └── organizerController.js  # Organizer metrics, export, and list handlers
│   ├── routes/
│   │   ├── index.js                # Root API router (/api)
│   │   ├── healthRoutes.js         # /api/health
│   │   ├── uploadRoutes.js         # /api/uploads/multipart/*
│   │   ├── submissionRoutes.js     # /api/submissions/*
│   │   └── organizerRoutes.js      # /api/organizer/*
│   └── worker/
│       └── processor.js            # BullMQ background job processor
├── test/
│   └── modular.test.js             # Automated integration and unit tests
├── server.js                       # Server bootstrapper & graceful shutdown
├── worker.js                       # Worker runner & lifecycle management
└── package.json
```

## Run locally

1. Copy `.env.example` to `.env` and configure AWS S3 credentials and bucket.
2. Set `SUBMISSION_DEADLINE` with an explicit UTC offset. `SUBMISSION_GRACE_MINUTES` defaults to 5.
3. From this folder run `npm install`, then `npm run dev`.
4. In another terminal run `npm run worker` after setting `MONGODB_URI` and `REDIS_URL`.
5. Run tests with `npm test`.

MongoDB and Redis are needed for durable submissions and background processing. Without them, the API uses in-memory records for local UI work and does not run a durable queue. Production should set `NODE_ENV=production`, MongoDB, Redis, AWS S3, `JWT_SECRET`, and `ORGANIZER_API_KEY`. Participant requests then require a bearer JWT with `teamId`, `team_id`, or `sub` claim. The local `x-team-id` header is accepted only outside production. Organizer API requests use `x-organizer-key`.

## S3 bucket CORS

Configure the bucket for the frontend origin. For example:

```json
[
  {
    "AllowedOrigins": ["http://localhost:5173"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Keep the bucket private and enable block-public-access. The API sets server-side encryption for each multipart upload. Provide user file downloads through authenticated, short lived presigned GET URLs; do not make the bucket public.

## Deadline rule

The server records upload initiation time. New uploads must be initiated by `SUBMISSION_DEADLINE`; a valid initiated upload can finish through the configured grace period. The server rejects expired multipart sessions and checks S3 completion before creating an immutable version record. Browser clock values are not trusted.

## Routes

- `POST /api/uploads/multipart/initiate`
- `GET /api/uploads/multipart/:uploadId/part-url?key=...&partNumber=...`
- `GET /api/uploads/multipart/:uploadId/parts?key=...`
- `POST /api/uploads/multipart/complete`
- `GET /api/submissions/mine`
- `GET /api/organizer/summary`
- `GET /api/organizer/submissions`
- `GET /api/organizer/submissions.csv`
- `GET /api/health`

Background workers use BullMQ at-least-once delivery with a unique job ID, conditional MongoDB claims, leases, retryable status transitions, and final state updates. ZIP entries are inspected for path traversal, size, entry count, and expansion ratio. File contents are checked by signature, not filename extension.
