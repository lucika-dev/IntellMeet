# wraithorg

wraithorg is a unified platform ecosystem focused on authentication infrastructure, intelligent systems, realtime collaboration, developer tooling, and scalable application architecture.

The repository powers both the Wraith platform and the underlying infrastructure exposed to developers through reusable services, SDKs, UI systems, and platform APIs.

---

## Platform Architecture

The workspace is organized into three primary layers:

```txt id="q5m2vp"
apps/
packages/
services/
```

### apps

Applications are separated into two categories:

```txt id="r8v1xn"
apps/
  dashboard/
  landing/
```

#### `apps/landing`

Public-facing landing platforms built with Astro.

These applications focus on:

* SEO
* performance
* static rendering
* marketing systems
* product onboarding

#### `apps/dashboard`

Authenticated application platforms built with Vite + React.

These applications handle:

* realtime systems
* authenticated user flows
* platform management
* dashboards
* collaborative environments

---

## Platform Services

wraithorg is designed as a platform-first ecosystem where core infrastructure is exposed through reusable packages and managed backend systems.

Developers integrate services through SDKs while infrastructure, storage, authentication, and synchronization remain managed by the platform.

---

## Wraith Auth

`wraith-auth` is a centralized authentication infrastructure designed as a plug-and-use identity platform.

The system is intended to provide:

* hosted authentication flows
* account management
* OAuth providers
* callback handling
* session management
* profile synchronization
* secure backend-managed identity storage

Authentication flows are designed around hosted routes similar to:

```txt id="u4p7zr"
https://auth.wraithorg.com/...
```

Applications integrating Wraith Auth will be able to:

* launch authentication flows through SDK functions
* receive automatic callback handling
* synchronize authenticated sessions
* manage users without building backend auth infrastructure

The goal is to expose authentication through minimal integration APIs such as:

```ts id="h2x9wc"
login()
signup()
logout()
deleteAccount()
updateProfile()
```

while backend infrastructure, storage, and session management remain fully managed by Wraith infrastructure.

---

## Wraith Themes

`wraith-themes` is being designed as a centralized theme synchronization platform.

Instead of distributing static theme files, themes are intended to be:

* account-linked
* remotely synchronized
* dynamically resolved
* shared across applications

Applications integrating:

* Wraith Auth
* Wraith Themes
* Theme Picker components

will be able to synchronize user theme preferences automatically across supported platforms.

---

## Wraith UI

`wraith-ui` is a reusable UI platform inspired by composable system architectures.

The goal is to provide:

* production-ready components
* complete reusable sections
* platform-aware generators
* installation tooling
* design-consistent systems

The platform is intended to support installation flows similar to:

```bash id="d7m3kr"
pnpm add wraith-ui
```

with tooling capable of:

* detecting project environments
* adapting to platform configuration
* generating compatible components
* integrating automatically into existing projects

Supported environments may include:

* React
* Vite
* Next.js
* Astro
* Node-based ecosystems

---

## Engineering Principles

The platform is built around:

* modular infrastructure
* centralized platform services
* strongly typed systems
* reusable architecture
* secure-by-default design
* scalable backend systems
* realtime-first applications
* reproducible builds
* developer-focused workflows

---

## Technology Stack

| Layer            | Technologies                |
| ---------------- | --------------------------- |
| Frontend         | React, Astro, Vite          |
| Backend          | Node.js, Express            |
| Styling          | Tailwind CSS                |
| State Management | Zustand, React Query        |
| Realtime         | Socket.IO                   |
| Infrastructure   | Supabase                    |
| Tooling          | Turborepo, pnpm, TypeScript |

---

## Development

Install dependencies:

```bash id="p4v8qt"
pnpm install
```

Start development:

```bash id="m9x2wc"
turbo dev
```

Build the workspace:

```bash id="k6n1zr"
turbo build
```

Run validation:

```bash id="r3p7vx"
turbo lint
turbo check-types
```

---

## Security

Security, authentication integrity, infrastructure protection, and controlled platform access are core requirements across the ecosystem.

See:

* `SECURITY.md`

---

## Status

Active development.
