# IntellMeet Backend

Backend service for IntellMeet — an AI-powered smart meeting workspace.

This service handles:

* authentication
* meeting creation and management
* browser recording chunk uploads
* transcript generation
* rolling summaries
* AI-generated action items
* contextual meeting intelligence
* Google Drive storage
* real-time Socket.io communication
* analytics and workspace operations

---

# Core Architecture

## Production MVP Strategy

### Host-side Browser Recording + 30s Chunk Upload

Only the host records the meeting.

We do not use heavy server-side recording infrastructure in phase 1.

This backend receives:

* recording chunks
* transcript jobs
* summary generation tasks
* contextual AI queries

This keeps the system:

* scalable
* affordable
* reliable
* production-upgradable later

---

# Tech Stack

* Node.js
* Express.js
* TypeScript
* MongoDB
* ioredis
* Socket.io
* Google Drive API
* NVIDIA NIM APIs
* OpenRouter APIs
* Axios
* Multer
* Cloudinary
* JWT
* Zod
* Helmet
* Express Rate Limit

---

# Folder Structure

```text
src/
│
├── config/
├── controllers/
├── routes/
├── models/
├── middleware/
├── services/
├── sockets/
├── validators/
├── utils/
├── jobs/
│
├── app.ts
└── server.ts
```

---

# Key Services

## recording.service.ts

Handles recording lifecycle:

* chunk uploads
* recording session state
* host recording flow

## chunkProcessor.service.ts

Processes uploaded chunks:

* storage
* queue handling
* transcript trigger

## transcript.service.ts

Creates:

* master transcript
* searchable meeting memory

## summary.service.ts

Maintains:

* rolling summaries
* key decisions
* action items

## googleDrive.service.ts

Stores:

* recordings
* transcript files
* summary files

## ai.service.ts

AI orchestration using:

* NVIDIA NIM
* OpenRouter

---

# Development

## Run backend

```bash
pnpm --filter backend dev
```

## Build backend

```bash
pnpm --filter backend build
```

---

# API Responsibilities

* Google OAuth authentication
* workspace creation
* meeting scheduling
* meeting room state
* recording uploads
* transcript generation
* AI summaries
* contextual AI chat
* analytics

---

# Engineering Rule

Backend owns business logic.

Frontend should stay thin.

This backend is the source of truth.
