#!/usr/bin/env bash
# Installs the asimoX skill into Claude Code and Codex, and optionally saves the API key.
set -euo pipefail

REPO=${REPO:-Voloire/asimox-skill}
REF=${REF:-main}
KEY="${ASIMOX_API_KEY:-${1:-}}"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

curl -fsSL "https://codeload.github.com/${REPO}/archive/refs/heads/${REF}.tar.gz" -o "$TMP/repo.tar.gz"
tar -xzf "$TMP/repo.tar.gz" -C "$TMP"
SRC="$(find "$TMP" -mindepth 1 -maxdepth 1 -type d | head -n 1)"

for d in "$HOME/.claude/skills/asimox" "$HOME/.codex/skills/asimox"; do
  mkdir -p "$d"
  cp -f "$SRC/SKILL.md" "$d/SKILL.md"
  cp -Rf "$SRC/agents" "$d/" 2>/dev/null || true
  cp -Rf "$SRC/scripts" "$d/"
done

if [ -n "$KEY" ]; then
  mkdir -p "$HOME/.asimox"
  printf '{"api_key":"%s"}\n' "$KEY" > "$HOME/.asimox/config.json"
  chmod 600 "$HOME/.asimox/config.json"
  echo "asimoX skill installed for Claude Code and Codex. Key saved to $HOME/.asimox/config.json"
else
  echo "asimoX skill installed for Claude Code and Codex."
  echo "No key saved. Buy credits on voloirex.com or set ASIMOX_API_KEY and re-run."
fi