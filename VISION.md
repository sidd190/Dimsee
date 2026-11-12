# Dimsee Vision and Roadmap

Status: draft for review. Not yet the public story until approved.

## What Dimsee is

Dimsee is the auth library that uses your database properly and is secure by
default for every kind of app. It is an opinionated, self-hosted library (not a
hosted service, not a boilerplate dump): a configurable Express backend plus a
themeable React frontend, wired together so you add real authentication in
minutes.

## Why Dimsee exists

The JavaScript auth field consolidated onto a single SQL-first stack in 2025-26
(Auth.js folded into Better Auth, which Vercel acquired; Lucia became a tutorial;
Passport went unmaintained). That left two lanes open, and both are Dimsee's home
turf:

1. Nobody treats MongoDB as a first-class citizen. The incumbents bolt Mongo on as
   a shallow, lowest-common-denominator adapter that cannot even populate a
   Mongoose ref. Dimsee uses the database the way it is actually meant to be used.
2. "Secure by default" is talked about but rarely true. ~30% of AI-generated auth
   code ships insecure, and the most common complaints in the field are
   misconfiguration footguns. Dimsee makes the insecure path unreachable, not just
   discouraged.

## Principles

- Deep integration, not lowest-common-denominator. We integrate a database the way
  its own ecosystem expects (real Mongoose refs, transactions, migrations), rather
  than a thin CRUD shim. Start with MongoDB; expand only to databases we can do
  this well.
- Secure by default, insecure by exception. The default configuration is safe; an
  insecure configuration is either unreachable or loudly flagged.
- Pick a tier, not twenty flags. Presets keyed to your deployment scale do the
  correct wiring for you (see Presets).
- Batteries included, still yours. One-call backend, drop-in UI, MIT, no lock-in.
- Honest scope. We would rather do a few databases and methods excellently than
  many of them badly.

## Scope and non-goals

In scope now:
- MongoDB / Mongoose as the single, deep, first-class datastore.
- A thin storage-adapter seam underneath, so additional databases can be added
  later without rewrites. We ship one adapter (Mongoose) and do it right first.

Non-goals (deliberate):
- Not trying to be framework-agnostic across every stack on day one. That is the
  incumbent's strength and a maintenance treadmill for a small project.
- Not a code stamper or a learn-to-build-your-own reference. That is a separate
  project (Sedim); Dimsee stays a library.
- Not supporting many databases shallowly. Breadth-via-shallow-adapters is the
  exact weakness we are exploiting in others.

## Presets (keyed to deployment scale)

A preset is a named, coherent bundle of correct settings, so a developer (or an AI
assistant writing the integration) selects a scale tier instead of assembling
options by hand. Draft set, to be refined:

- prototype: fastest path, minimal setup, in-process defaults. Loud warnings that
  it is not for production.
- production: secure defaults, refresh-token rotation, rate limiting, a proper
  persistent session store, breach-aware passwords, insecure-default refusal.
- scale: everything in production, plus multi-instance safety, a distributed
  session store and distributed rate limiting, and observability hooks.

`auth.audit()` reports when a running configuration has drifted from the tier it
claims, turning posture into something you can see.

## Roadmap (milestones)

- 0.7.0 Secure by default: the self-posture audit and presets, plus the security
  hardening already tracked (rate limiting on the real API, distinct refresh
  secret, insecure-default refusal, cookie hardening, account-enumeration fix).
- 0.8.0 Deep Mongo and core methods: first-class Mongoose integration (refs,
  transactions, migrations), refresh-rotation hardening, and the baseline modern
  methods (passkeys, TOTP/MFA, magic link).
- 0.9.0 Teams and types: organizations, roles, and the start of the TypeScript
  move.
- 1.0.0 Stable and typed: full TypeScript with inferred session types, OAuth moved
  off the unmaintained Passport to a maintained primitive, CI and tests green, a
  stable public API.
- Later (post-1.0): agent-era support (MCP resource-server mode, token exchange,
  step-up auth, device grant), a self-hosted auth observability dashboard, a
  lazy-migration shim off managed providers, and additional deep database adapters.

## How we work

Direction is set in the open. Big bets get an RFC discussion before implementation.
The contributor ladder (good first issue through complex) stays the on-ramp.
