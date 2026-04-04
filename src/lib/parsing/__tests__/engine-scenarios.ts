/**
 * Engine integration test scenarios.
 *
 * Each scenario models the file structure of a well-known open-source repository.
 * Run with:  npx tsx src/lib/parsing/__tests__/engine-scenarios.ts
 *
 * References:
 *  - jasontaylordev/CleanArchitecture  (ASP.NET Core)
 *  - gin-gonic/gin examples            (Go/Gin)
 *  - rails/rails petstore example      (Ruby/Rails)
 *  - spring-projects/spring-petclinic  (Java/Spring Boot)
 *  - withastro/astro examples          (Astro)
 *  - sveltejs/kit examples             (SvelteKit)
 *  - remix-run/remix examples          (Remix)
 *  - nuxt/starter                      (Nuxt)
 *  - tiangolo/full-stack-fastapi       (FastAPI)
 *  - tokio-rs/axum examples            (Rust/Axum)
 *  - laravel/laravel                   (PHP/Laravel)
 *  - vercel/next.js examples           (Next.js)
 *  - expressjs/express examples        (Express)
 */

import { classifyRepository } from "@/lib/classification/classify-repository";
import { matchArchetypes } from "@/lib/archetypes/match-archetypes";
import { scorePlatforms } from "@/lib/scoring/engine";
import { scanRepositoryFiles } from "@/lib/parsing/scan-repository";
import type { RepositoryFileMap } from "@/lib/parsing/shared";

interface Scenario {
  name: string;
  description: string;
  files: RepositoryFileMap;
  expect: {
    framework: string;
    repoClass: string;
    topPlatform?: string;
  };
}

const scenarios: Scenario[] = [
  // ── ASP.NET Core (jasontaylordev/CleanArchitecture) ─────────────────────────
  {
    name: "ASP.NET Core Clean Architecture",
    description: "jasontaylordev/CleanArchitecture — .sln + multiple .csproj + appsettings",
    files: {
      "CleanArchitecture.sln": `Microsoft Visual Studio Solution File, Format Version 12.00
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "WebAPI", "src/WebAPI/WebAPI.csproj", "{AAA}"`,
      "src/WebAPI/WebAPI.csproj": `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
</Project>`,
      "src/WebAPI/Program.cs": `var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
var app = builder.Build();
app.MapControllers();
app.Run();`,
      "src/WebAPI/appsettings.json": `{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=CleanArchitectureDb;"
  }
}`,
      "src/Application/Application.csproj": `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup><TargetFramework>net8.0</TargetFramework></PropertyGroup>
</Project>`,
      ".env.example": "DATABASE_URL=\nASPNETCORE_ENVIRONMENT=Production",
      ".github/workflows/ci.yml": "name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest"
    },
    expect: { framework: "csharp", repoClass: "service_app", topPlatform: "Render" }
  },

  // ── Go / Gin (gin-gonic/gin) ─────────────────────────────────────────────────
  {
    name: "Go Gin web service",
    description: "gin-gonic/gin — go.mod + main.go",
    files: {
      "go.mod": `module github.com/gin-gonic/examples

go 1.21

require (
  github.com/gin-gonic/gin v1.9.1
)`,
      "main.go": `package main

import "github.com/gin-gonic/gin"

func main() {
  r := gin.Default()
  r.GET("/ping", func(c *gin.Context) {
    c.JSON(200, gin.H{"message": "pong"})
  })
  r.Run()
}`,
      ".github/workflows/test.yml": "name: Test\non: [push]",
      ".env.example": "PORT=8080\nDATABASE_URL="
    },
    expect: { framework: "go", repoClass: "service_app" }
  },

  // ── Ruby on Rails ────────────────────────────────────────────────────────────
  {
    name: "Ruby on Rails app",
    description: "rails/rails style — Gemfile + config.ru + config/routes.rb",
    files: {
      "Gemfile": `source 'https://rubygems.org'
gem 'rails', '~> 7.1.0'
gem 'pg', '~> 1.1'
gem 'puma', '~> 6.0'`,
      "config.ru": `require_relative "config/environment"
run Rails.application
Rails.application.load_server`,
      "config/routes.rb": `Rails.application.routes.draw do
  resources :articles
  root "articles#index"
end`,
      ".env.example": "DATABASE_URL=\nRAILS_MASTER_KEY=",
      Dockerfile: "FROM ruby:3.2-slim\nWORKDIR /app\nCOPY . .\nRUN bundle install\nCMD [\"bundle\", \"exec\", \"puma\"]"
    },
    expect: { framework: "ruby", repoClass: "service_app" }
  },

  // ── Java Spring Boot (spring-petclinic) ─────────────────────────────────────
  {
    name: "Java Spring Boot",
    description: "spring-projects/spring-petclinic — pom.xml + Spring Boot",
    files: {
      "pom.xml": `<?xml version="1.0" encoding="UTF-8"?>
<project>
  <groupId>org.springframework.samples</groupId>
  <artifactId>spring-petclinic</artifactId>
  <version>3.2.0</version>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
  </parent>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
  </dependencies>
</project>`,
      "src/main/java/PetClinicApplication.java": `@SpringBootApplication
public class PetClinicApplication {
  public static void main(String[] args) {
    SpringApplication.run(PetClinicApplication.class, args);
  }
}`,
      ".env.example": "DATABASE_URL=\nSERVER_PORT=8080",
      Dockerfile: "FROM eclipse-temurin:21-jre\nCOPY target/*.jar app.jar\nENTRYPOINT [\"java\",\"-jar\",\"/app.jar\"]"
    },
    expect: { framework: "java", repoClass: "service_app" }
  },

  // ── Astro (withastro/astro) ──────────────────────────────────────────────────
  {
    name: "Astro static site",
    description: "withastro/astro starter — package.json with astro",
    files: {
      "package.json": JSON.stringify({
        name: "my-astro-site",
        dependencies: { astro: "^4.0.0" },
        scripts: { build: "astro build", dev: "astro dev", start: "astro preview" }
      }),
      "astro.config.mjs": `import { defineConfig } from 'astro/config';
export default defineConfig({});`,
      "src/pages/index.astro": "<html><body><h1>Hello</h1></body></html>"
    },
    expect: { framework: "astro", repoClass: "deployable_web_app", topPlatform: "Vercel" }
  },

  // ── SvelteKit ────────────────────────────────────────────────────────────────
  {
    name: "SvelteKit app",
    description: "sveltejs/kit — package.json with @sveltejs/kit",
    files: {
      "package.json": JSON.stringify({
        name: "my-sveltekit-app",
        dependencies: { "@sveltejs/kit": "^2.0.0", svelte: "^4.0.0" },
        devDependencies: { "@sveltejs/adapter-vercel": "^3.0.0" },
        scripts: { build: "vite build", dev: "vite dev" }
      }),
      "svelte.config.js": `import adapter from '@sveltejs/adapter-vercel';
export default { kit: { adapter: adapter() } };`,
      "vercel.json": `{ "framework": "sveltekit" }`
    },
    expect: { framework: "sveltekit", repoClass: "deployable_web_app", topPlatform: "Vercel" }
  },

  // ── Remix ────────────────────────────────────────────────────────────────────
  {
    name: "Remix app",
    description: "remix-run/remix — package.json with @remix-run/node",
    files: {
      "package.json": JSON.stringify({
        name: "my-remix-app",
        dependencies: {
          "@remix-run/node": "^2.0.0",
          "@remix-run/react": "^2.0.0",
          "@remix-run/serve": "^2.0.0",
          react: "^18.0.0"
        },
        scripts: { build: "remix build", start: "remix-serve build/index.js" }
      }),
      "remix.config.js": `/** @type {import('@remix-run/dev').AppConfig} */
module.exports = { serverBuildTarget: "node-cjs" };`,
      ".env.example": "SESSION_SECRET=\nDATABASE_URL="
    },
    expect: { framework: "remix", repoClass: "deployable_web_app" }
  },

  // ── Nuxt ─────────────────────────────────────────────────────────────────────
  {
    name: "Nuxt app",
    description: "nuxt/nuxt starter — package.json with nuxt",
    files: {
      "package.json": JSON.stringify({
        name: "my-nuxt-app",
        dependencies: { nuxt: "^3.9.0" },
        scripts: { build: "nuxt build", dev: "nuxt dev", start: "node .output/server/index.mjs" }
      }),
      "nuxt.config.ts": `export default defineNuxtConfig({ ssr: true })`,
      "app.vue": "<template><NuxtPage /></template>"
    },
    expect: { framework: "nuxt", repoClass: "deployable_web_app" }
  },

  // ── FastAPI ──────────────────────────────────────────────────────────────────
  {
    name: "FastAPI service",
    description: "tiangolo/fastapi example — requirements.txt + main.py with FastAPI",
    files: {
      "requirements.txt": "fastapi>=0.109.0\nuvicorn[standard]>=0.27.0\nsqlalchemy>=2.0.0",
      "main.py": `from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}`,
      ".env.example": "DATABASE_URL=\nSECRET_KEY=",
      Dockerfile: "FROM python:3.12-slim\nWORKDIR /app\nCOPY . .\nRUN pip install -r requirements.txt\nCMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\"]"
    },
    expect: { framework: "python", repoClass: "python_service", topPlatform: "Railway" }
  },

  // ── Rust / Axum ─────────────────────────────────────────────────────────────
  {
    name: "Rust Axum service",
    description: "tokio-rs/axum examples — Cargo.toml with axum",
    files: {
      "Cargo.toml": `[package]
name = "axum-example"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7"
tokio = { version = "1.0", features = ["full"] }
tower = "0.4"`,
      "src/main.rs": `use axum::{routing::get, Router};

#[tokio::main]
async fn main() {
    let app = Router::new().route("/", get(|| async { "Hello, World!" }));
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}`,
      Dockerfile: "FROM rust:1.75 as builder\nWORKDIR /app\nCOPY . .\nRUN cargo build --release\nFROM debian:bookworm-slim\nCOPY --from=builder /app/target/release/axum-example /usr/local/bin/\nCMD [\"axum-example\"]"
    },
    expect: { framework: "rust", repoClass: "service_app" }
  },

  // ── PHP / Laravel ────────────────────────────────────────────────────────────
  {
    name: "PHP Laravel app",
    description: "laravel/laravel — composer.json with laravel/framework",
    files: {
      "composer.json": JSON.stringify({
        name: "laravel/laravel",
        require: { "laravel/framework": "^11.0", php: "^8.2" }
      }),
      artisan: `#!/usr/bin/env php
<?php
define('LARAVEL_START', microtime(true));
require __DIR__.'/vendor/autoload.php';`,
      ".env.example": "APP_KEY=\nDB_CONNECTION=mysql\nDB_DATABASE=laravel",
      Dockerfile: "FROM php:8.2-fpm\nWORKDIR /var/www\nCOPY . .\nRUN composer install --no-dev\nCMD [\"php-fpm\"]"
    },
    expect: { framework: "php", repoClass: "service_app" }
  },

  // ── Next.js (standard, no custom server) ─────────────────────────────────────
  {
    name: "Next.js standard app",
    description: "vercel/next.js — package.json with next, no custom server",
    files: {
      "package.json": JSON.stringify({
        dependencies: { next: "^15.0.0", react: "^19.0.0", "react-dom": "^19.0.0" },
        scripts: { build: "next build", start: "next start", dev: "next dev" }
      }),
      "next.config.js": "/** @type {import('next').NextConfig} */\nmodule.exports = {}",
      ".env.example": "NEXTAUTH_SECRET=\nNEXT_PUBLIC_API_URL="
    },
    expect: { framework: "nextjs", repoClass: "deployable_web_app", topPlatform: "Vercel" }
  },

  // ── Express + Postgres ────────────────────────────────────────────────────────
  {
    name: "Express + Postgres API",
    description: "expressjs/express — package.json with express, DATABASE_URL env",
    files: {
      "package.json": JSON.stringify({
        dependencies: { express: "^4.18.0", pg: "^8.11.0" },
        scripts: { start: "node server.js", build: "echo ok" }
      }),
      "server.js": `const express = require('express');
const app = express();
app.get('/health', (req, res) => res.json({ ok: true }));
app.listen(process.env.PORT || 3000);`,
      ".env.example": "DATABASE_URL=postgresql://user:pass@localhost/db\nPORT=3000",
      Dockerfile: "FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nRUN npm ci --production\nCMD [\"node\", \"server.js\"]"
    },
    expect: { framework: "express", repoClass: "service_app", topPlatform: "Railway" }
  }
];

// ── Runner ───────────────────────────────────────────────────────────────────

function runScenario(scenario: Scenario) {
  const { signals, findings, evidence } = scanRepositoryFiles(scenario.files);
  const classification = classifyRepository(signals);
  const archetypes = matchArchetypes({ signals, classification, evidence });
  const recommendations = scorePlatforms({ signals, classification, archetypes, evidence });
  const topRec = recommendations[0];

  const frameworkMatch = signals.framework === scenario.expect.framework;
  const classMatch = classification.repoClass === scenario.expect.repoClass;
  const platformMatch = !scenario.expect.topPlatform || topRec?.platform === scenario.expect.topPlatform;
  const pass = frameworkMatch && classMatch && platformMatch;

  const status = pass ? "PASS" : "FAIL";
  const icon = pass ? "✓" : "✗";

  console.log(`\n${icon} [${status}] ${scenario.name}`);
  console.log(`   ${scenario.description}`);
  console.log(`   Framework : ${signals.framework} (expected: ${scenario.expect.framework}) ${frameworkMatch ? "✓" : "✗"}`);
  console.log(`   RepoClass : ${classification.repoClass} (expected: ${scenario.expect.repoClass}) ${classMatch ? "✓" : "✗"}`);
  console.log(`   Confidence: ${Math.round(classification.confidence * 100)}%`);
  if (topRec) {
    const platformLabel = scenario.expect.topPlatform ? ` (expected: ${scenario.expect.topPlatform}) ${platformMatch ? "✓" : "✗"}` : "";
    console.log(`   Top Platform: ${topRec.platform} · ${topRec.score}/100 · ${topRec.verdict}${platformLabel}`);
  }
  const topArchetype = archetypes[0];
  if (topArchetype) {
    console.log(`   Top Archetype: ${topArchetype.archetype} · ${Math.round(topArchetype.confidence * 100)}%`);
  }
  const blockers = findings.filter((f) => f.severity === "blocker");
  const warnings = findings.filter((f) => f.severity === "warning");
  if (blockers.length) console.log(`   Blockers: ${blockers.map((f) => f.title).join(", ")}`);
  if (warnings.length) console.log(`   Warnings: ${warnings.map((f) => f.title).join(", ")}`);
  console.log(`   Evidence (${evidence.length}): ${evidence.map((e) => `${e.kind}:${e.value}`).slice(0, 6).join(", ")}`);

  return pass;
}

console.log("═══════════════════════════════════════════════════════════════");
console.log("  Shipd Engine — Framework Detection Integration Tests");
console.log("═══════════════════════════════════════════════════════════════");

let passed = 0;
let failed = 0;

for (const scenario of scenarios) {
  const ok = runScenario(scenario);
  if (ok) passed++;
  else failed++;
}

console.log("\n═══════════════════════════════════════════════════════════════");
console.log(`  Results: ${passed} passed, ${failed} failed out of ${scenarios.length} scenarios`);
console.log("═══════════════════════════════════════════════════════════════\n");

if (failed > 0) {
  process.exit(1);
}
