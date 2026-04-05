---
id: intro
slug: /
title: What is Shipd?
sidebar_position: 1
---

# What is Shipd?

Shipd is a **repo-aware deployment planning tool** for AI-first founders and small teams.

It reads a GitHub repository, detects deployment signals across the codebase, scores hosting platforms, and produces a concrete plan with blockers, tradeoffs, and step-by-step setup — before you touch infrastructure or change a line of code.

## Core user flow

1. Sign in with GitHub
2. Pick a repository from your dashboard
3. Shipd scans deployment-relevant files
4. Get a recommended platform, comparison, and deployment plan
5. Chat with the AI for follow-up questions, blockers, and tradeoffs

## What Shipd detects

| Signal | Examples |
|---|---|
| Framework | Next.js, Express, Python/FastAPI, .NET, Go, Rust, Ruby, Java, PHP, SvelteKit |
| Runtime | Node 18/20, Bun, Python, .NET, Go, Java, Ruby, Rust |
| Topology | Single app, monorepo, .NET solution |
| Platform configs | `fly.toml`, `railway.toml`, `vercel.json`, `render.yaml`, `wrangler.toml` |
| CI/CD | GitHub Actions workflows |
| Env vars | `.env.example`, `.env.local`, `.env.development` |
| Infrastructure | Terraform, Docker Compose, Kubernetes |
| Container | `Dockerfile`, multi-stage builds |

## What Shipd does not do

- Modify source code
- Execute deployments
- Store secrets or credentials
- Open pull requests

## Platforms scored

Railway · Fly.io · Vercel · Render · Azure Container Apps · AWS App Runner · GCP Cloud Run · Heroku · DigitalOcean · Netlify · Docker + VPS
