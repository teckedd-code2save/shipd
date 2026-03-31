# Shipd - Investor Memo

March 2026

## Summary

Shipd is the deployment decision layer for the AI-assisted era.

Coding agents now make implementation faster. Deployment decisions remain fragmented, platform-biased, and confusing for founders and small teams. Shipd sits between code generation and deployment execution: it reads a repository, compares realistic hosting options, scores fit, and produces a deployment plan with blockers, tradeoffs, and setup requirements.

**Short version:** Shipd helps teams decide where to deploy before they start changing code or touching infrastructure.

## Problem

AI coding tools have compressed the time it takes to build software. That has shifted pain downstream:

- more people can build production-intended apps without deep infrastructure knowledge
- platform choice now materially affects cost, scalability, architecture, and developer experience
- platform-native tooling is optimized to onboard users onto that platform, not to compare alternatives neutrally
- teams often discover deployment mismatch late, after code and environment assumptions are already baked in

Today, founders and small teams typically choose deployment platforms using:

- generic AI advice
- biased vendor content
- anecdotal recommendations
- trial and error

That creates wasted time, unnecessary rewrites, and avoidable re-platforming.

## Solution

Shipd connects to a GitHub repo, reads deployment-relevant files, and answers:

- where should this app be deployed?
- what are the top viable alternatives?
- why is one option better for this repo?
- what blockers must be resolved before launch?
- what platform-side setup is still required?

The output is an exportable deployment plan, not a code patch.

Shipd is intentionally read-only:

- no code changes
- no secret storage
- no autonomous deploys

That boundary makes the product safer to adopt early and keeps it complementary to coding agents instead of competitive with them.

## Why Now

Three shifts make this timely:

1. AI-assisted coding is mainstream.
Implementation is getting cheaper and faster. Decision quality matters more.

2. Platform complexity is still real.
Even simple web apps can choose between Vercel, Railway, Fly.io, Render, Netlify, and cloud-native options, all with different tradeoffs.

3. Neutral guidance is scarce.
Platform vendors can improve execution on their own stack, but they are structurally weaker at being trusted neutral comparators across competing platforms.

## Product

### Core product

A chat-first web app that:

- scans deployment-relevant repo files
- detects framework, runtime, infra signals, and blockers
- ranks hosting platforms by fit
- shows side-by-side tradeoffs
- generates a deployment plan with setup actions and warnings

### Follow-on product surface

An MCP server that exposes Shipd's planning intelligence inside coding environments.

That lets Codex, Claude, Cursor, and similar tools call Shipd for:

- repo scan results
- ranked platform recommendations
- platform scoring
- deployment plans
- comparison reports

Shipd becomes the planning layer. IDE agents remain the execution layer.

## Ideal Customer

The initial wedge is:

- AI-first founders
- small startup teams
- builders shipping modern JavaScript and TypeScript web apps

Best-fit workloads:

- Next.js apps
- Node and Express backends
- full-stack JavaScript apps
- Dockerized web apps

## Market Position

Shipd is not:

- a hosting platform
- a deployment orchestrator
- an autonomous DevOps agent
- a code-fixing tool

Shipd is:

- neutral
- repo-aware
- comparison-first
- read-only

The product competes on decision quality rather than deployment execution.

## Why It Can Win

### 1. Neutrality

Shipd can compare platforms without pushing users toward one house stack.

### 2. Repo-grounded analysis

The product does not rely on generic prompts alone. It uses actual repository signals from files like `Dockerfile`, `package.json`, workflow definitions, and environment references.

### 3. Cross-platform comparison

Most vendors go deep on themselves. Shipd goes wide across realistic choices and translates tradeoffs into plain language.

### 4. Distribution through MCP

Shipd does not need to live only as a standalone app. It can become embedded into the IDE and agent workflows where deployment decisions are already being made.

## Go-To-Market

### Phase 1

Standalone web product for:

- repo scan
- recommendation
- comparison
- exportable deployment plan

### Phase 2

MCP distribution into:

- Codex
- Claude Code
- Cursor
- other agentic IDE environments

### Phase 3

Team decision workflows:

- shared reports
- approval flows
- periodic re-scan
- cost and platform-change analysis

## Business Model

Early monetization paths:

- paid individual plan for more scans, exports, and saved reports
- team plan for shared comparison reports and collaboration
- MCP/IDE plan for embedded usage and workspace integrations

Potential pricing logic:

- free: limited scans and one-off reports
- pro: unlimited personal usage and exports
- team: shared workspaces, approvals, history, collaboration

## Key Risks

### Risk: platform vendors add similar recommendation UX

Response: Shipd stays neutral and compares multiple options credibly.

### Risk: users expect Shipd to fix code or deploy automatically

Response: keep the product boundary explicit and use partner workflows into IDE agents and platform tools.

### Risk: scoring quality is not trusted early

Response: lead with evidence-backed scan transparency and explain every major recommendation.

## Near-Term Milestones

1. Launch repo scan plus top-3 platform comparison for Vercel, Railway, and Fly.io.
2. Validate recommendation acceptance and export behavior.
3. Launch MCP server for planning workflows inside coding environments.
4. Add shared team reports and collaboration.

## The Bet

As coding becomes abundant, deployment judgment becomes more valuable.

Shipd is a bet that the winning product in this layer is not the one that writes the most code or runs the most commands. It is the one that helps builders choose correctly, earlier, and with more confidence.
