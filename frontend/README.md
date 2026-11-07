# Deadline Crush Frontend

React + Vite frontend for the Deadline Crush hackathon submission platform.

## Architecture & Modular Structure

The frontend is organized cleanly into modular components, custom hooks, services, and utilities:

```
frontend/src/
├── components/
│   ├── common/
│   │   └── Icon.jsx                    # Reusable SVG icon component
│   ├── layout/
│   │   ├── Sidebar.jsx                 # Workspace navigation, event card, user profile
│   │   ├── Topbar.jsx                  # Breadcrumb, system status tag, avatar
│   │   └── Footer.jsx                  # Footer branding and links
│   ├── overview/
│   │   ├── WelcomeBanner.jsx           # Welcome headline and date banner
│   │   ├── DeadlineCard.jsx            # Countdown timer and submission status card
│   │   └── StatsGrid.jsx               # Submission metrics and sparklines
│   ├── submission/
│   │   ├── FileDropzone.jsx            # Drag & drop file selection and validation
│   │   ├── SubmissionForm.jsx          # Project metadata form and upload progress
│   │   └── VersionHistory.jsx          # Version timeline and iteration records
│   ├── activity/
│   │   └── ActivityTable.jsx           # Submission activity table and CSV download
│   └── panels/
│       ├── LatestSubmissionPanel.jsx   # Quick view of latest submission & verification
│       ├── ProTipPanel.jsx             # Hackathon advice card
│       └── QueueStatusPanel.jsx        # Background processing metrics
├── constants/
│   └── mockData.js                     # Mock rows, version history, and defaults
├── hooks/
│   ├── useCountdown.js                 # Countdown timer hook
│   └── useMultipartUpload.js           # S3 direct multipart upload state machine
├── services/
│   └── api.js                          # Backend API client
├── utils/
│   └── exportCsv.js                    # Client-side CSV generator & download trigger
├── App.jsx                             # View orchestrator
├── App.css                             # Application styling
├── index.css                           # Global resets & typography
└── main.jsx                            # React 19 entry point
```

## Scripts

- `npm run dev`: Start Vite development server
- `npm run build`: Production bundle build
- `npm run lint`: Run ESLint checks
- `npm run preview`: Preview production build
