---
name: asimox
description: Run an asimoX design review of an agentic system against the twelve controls of the asimoX Pact. Use when the user wants to review an agent/architecture before it goes live, or says "asimoX review", "review my agent", "check this design", "rivedi l'agente".
---

# asimoX

Review the design of an agentic system against the twelve asimoX Pact controls and return a
per-control report.

## What you need

- An asimoX API key. Buy credits on voloirex.com; the checkout returns a one-shot install
  command that places the key in `~/.asimox/config.json`.
- Node 22+. The client has no dependencies.
- A description of the agent's architecture (Markdown or plain text).
- A declared operating profile: `L` (read/analyze), `C` (shared-code dev), `D` (supervised
  delegated action), or `A` (bounded automation).

## How to run it

Use the bundled client `scripts/asimox.mjs`:

```
node scripts/asimox.mjs review "architecture text" --profile C
```

Or from a file, with evidence attached:

```
node scripts/asimox.mjs review --file design.md --profile D \
  --evidence infra=path/main.tf config=path/config.json
```

The client resolves the key from `ASIMOX_API_KEY`, then from `~/.asimox/config.json`. It calls
`start_review`, polls `review_status`, then prints the Markdown report (`get_report`). It never
charges twice for the same request.

## Notes

- A description alone never yields `Verified`: a control holds only with evidence, so pass real
  configs/logs/tests via `--evidence` when possible.
- Reviews cost credits (a fixed fee plus model cost); failures on the service side cost nothing.