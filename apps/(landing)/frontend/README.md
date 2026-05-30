# IntellMeet Frontend

Frontend application for IntellMeet — an AI-powered smart meeting workspace.

Built using Next.js with a premium SaaS product experience focused on meetings, AI summaries, collaboration, and live intelligence.

---

# Core Product Experience

IntellMeet is not just a meeting app.

It is a meeting intelligence platform.

Frontend responsibilities include:

* landing page and onboarding
* Google OAuth flow
* dashboard and workspace UI
* live meeting room
* recording controls
* live transcript panel
* rolling AI summaries
* contextual AI chat
* analytics and insights

---

# Authentication Strategy

## Google OAuth Only

No separate login/register forms.

### User Flow

```text
Landing Page
↓
Sign Up with Google
↓
Existing User → Dashboard
↓
New User → Onboarding
```

### Onboarding Includes

* auto-fetched name
* email
* Google profile image
* phone number
* visible face image upload
* workspace setup

This creates a faster and cleaner onboarding experience.

---

# Tech Stack

* Next.js
* TypeScript
* React
* Tailwind CSS
* ShadCN UI
* Socket.io Client
* WebRTC
* MediaRecorder API
* Google OAuth
* Axios
* next-themes

---

# Main UI Areas

## Landing Page

* hero section
* product explanation
* AI summary preview
* features showcase
* pricing preview
* Sign Up with Google CTA

## Dashboard

* recent meetings
* upcoming meetings
* action items
* rolling summaries
* workspace overview

## Live Meeting Room

Most important screen:

* participant grid
* screen share
* meeting controls
* recording controls
* live transcript
* rolling summary
* action items
* contextual AI assistant

## Workspace + Analytics

* members
* teams
* permissions
* meeting analytics
* productivity charts

---

# Folder Structure

```text
src/
│
├── app/
├── components/
├── hooks/
├── providers/
├── state/
├── lib/
├── config/
│
├── middleware.ts
└── instrumentation.ts
```

---

# Important Client Logic

## useWebRTC

Handles:

* live meeting connections
* media streams
* participant communication

## useRecording

Handles:

* host-side recording
* MediaRecorder flow
* recording status

## useChunkUpload

Handles:

* continuous 30-second upload flow

## useTranscript

Handles:

* live transcript rendering
* rolling summary updates

---

# Development

## Run frontend

```bash
pnpm --filter frontend dev
```

## Build frontend

```bash
pnpm --filter frontend build
```

---

# UI Philosophy

We optimize for:

* clarity
* speed
* trust
* low friction
* decision making

Design inspiration:

Linear + Notion + Slack + Loom + Google Meet

Clean, premium, enterprise-grade.

---

# Engineering Rule

Frontend handles:

UI + state + interaction

Backend handles:

business logic + truth

This keeps the system maintainable and scalable.
