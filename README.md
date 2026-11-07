# Deadline Crush — Hackathon Submission Platform

A resilient, scalable hackathon submission platform built with React, Vite, Node.js Express, AWS S3 direct multipart uploads, MongoDB, Redis, and BullMQ background workers.

## Project Structure

The project has been modularized into clean, decoupled layers across both backend and frontend:

```
.
├── backend/
│   ├── src/
│   │   ├── config/             # Centralized environment configuration
│   │   ├── lib/                # Database (Mongo & in-memory), Redis/Queue, and S3 clients
│   │   ├── middlewares/        # JWT participant & organizer key authentication
│   │   ├── services/           # Business logic: submissions, uploads, SSRF/ZIP validators
│   │   ├── controllers/        # Express route controllers (Health, Upload, Submission, Organizer)
│   │   ├── routes/             # Modular Express routers mounted at /api
│   │   ├── worker/             # Background job processor (content-type, zip bombs, link check)
│   │   └── app.js              # Express app definition and middleware chain
│   ├── test/                   # Automated modular backend test suite
│   ├── server.js               # API server startup & graceful shutdown
│   ├── worker.js               # Background worker runner
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Shared UI components (Icon)
│   │   │   ├── layout/         # Sidebar, Topbar, Footer
│   │   │   ├── overview/       # WelcomeBanner, DeadlineCard, StatsGrid
│   │   │   ├── submission/     # SubmissionForm, FileDropzone, VersionHistory
│   │   │   ├── activity/       # ActivityTable
│   │   │   └── panels/         # LatestSubmissionPanel, ProTipPanel, QueueStatusPanel
│   │   ├── constants/          # Mock data, defaults, configuration
│   │   ├── hooks/              # Custom hooks: useCountdown, useMultipartUpload
│   │   ├── services/           # API client and multipart S3 direct upload helpers
│   │   ├── utils/              # CSV export utilities
│   │   ├── App.jsx             # Main dashboard view orchestrator
│   │   ├── App.css             # Stylesheet
│   │   └── main.jsx            # React root mount
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## Getting Started

### 1. Backend

```bash
cd backend
npm install
npm test          # Run automated unit/integration tests
npm run dev       # Start API in dev mode (listening on port 4000)
npm run worker    # Start background worker (requires MONGODB_URI and REDIS_URL)
```

### 2. Frontend

```bash
cd frontend
npm install
npm run lint      # Run ESLint (zero errors/warnings)
npm run build     # Build production bundle
npm run dev       # Start Vite dev server (http://localhost:5173)
```
