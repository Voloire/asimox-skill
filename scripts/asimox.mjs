#!/usr/bin/env node
// asimox review client — drives the deployed asimoX MCP endpoint.
// Key resolution order: ASIMOX_API_KEY env, then ~/.asimox/config.json { api_key }.
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

function localConfig() {
  try {
    const path = join(homedir(), ".asimox", "config.json");
    if (!existsSync(path)) return {};
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return {};
  }
}

const conf = localConfig();
const TOKEN = process.env.ASIMOX_API_KEY || conf.api_key || "";
const ENDPOINT = process.env.ASIMOX_ENDPOINT || conf.endpoint || "https://mcp.voloirex.com/mcp/asimox";

if (!TOKEN) {
  console.error('ASIMOX_API_KEY is required. Set it, or run the installer with --key, or create ~/.asimox/config.json with {"api_key": "..."}.');
  process.exit(2);
}

let seq = 0;
async function rpc(method, params, hasId = true) {
  const payload = { jsonrpc: "2.0", method };
  if (hasId) payload.id = ++seq;
  if (params !== undefined) payload.params = params;
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (res.status === 202 || res.status === 204 || text === "") return { ok: true, notification: true };
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }
  if (!res.ok) {
    const msg = parsed?.error?.message || parsed?.raw || text;
    return { ok: false, status: res.status, error: msg };
  }
  return { ok: true, result: parsed.result, error: parsed.error };
}

function toolValue(result) {
  if (result?.structuredContent && Object.keys(result.structuredContent).length) return result.structuredContent;
  if (Array.isArray(result?.content)) {
    for (const c of result.content) {
      if (c.type === "text") {
        try { return JSON.parse(c.text); } catch { return { text: c.text }; }
      }
    }
  }
  return result ?? {};
}

async function call(name, args) {
  const r = await rpc("tools/call", { name, arguments: args });
  if (!r.ok) throw new Error(`${name}: ${r.error}`);
  if (r.notification) throw new Error(`${name}: unexpected empty response`);
  const v = toolValue(r.result);
  if (v?.error) throw new Error(`${name}: ${JSON.stringify(v.error)}`);
  return v;
}

function parseEvidence(cli) {
  const evidence = [];
  for (const spec of cli) {
    const [name, path] = spec.split("=");
    if (!name || !path) throw new Error(`invalid evidence "${spec}": use name=path`);
    evidence.push({ name, content: readFileSync(path, "utf8") });
  }
  return evidence;
}

async function main() {
  const args = process.argv.slice(2);
  let profile = "C";
  let architecture = null;
  let file = null;
  const evidence = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--profile") { profile = args[++i]; }
    else if (a === "--file") { file = args[++i]; }
    else if (a === "--evidence") { evidence.push(...parseEvidence(args[++i].split(" "))); }
    else if (a === "review") { /* command */ }
    else if (!architecture) { architecture = a; }
    else { evidence.push(...parseEvidence([a])); }
  }
  if (!architecture && file) architecture = readFileSync(file, "utf8");
  if (!architecture) {
    console.error("Usage: node asimox.mjs review \"architecture text\" --profile L|C|D|A [--evidence name=path ...]");
    process.exit(2);
  }

  await rpc("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "asimox-cli", version: "0.1.0" },
  });
  await rpc("notifications/initialized", undefined, false);

  const started = await call("start_review", { architecture, profile, evidence });
  const jobId = started.job_id;
  console.error(`job ${jobId} started (reserved ${started.reserved_credits} credits)`);

  for (;;) {
    await new Promise((r) => setTimeout(r, 4000));
    const s = await call("review_status", { job_id: jobId });
    if (s.status === "completed" || s.status === "incomplete" || s.status === "failed") break;
  }
  const report = await call("get_report", { job_id: jobId, format: "markdown" });
  process.stdout.write(report.markdown || report.text || JSON.stringify(report, null, 2));
}

main().catch((e) => { console.error("asimox error:", e.message); process.exit(1); });