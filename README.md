# asimoX skill

A design review for your AI agent before it goes live. Install once, then run asimoX from
Claude Code or Codex against the twelve asimoX Pact controls.

## Install

Buy credits on voloirex.com. The checkout returns a one-shot install command with your key
embedded. Or install manually and add the key afterwards.

Windows (PowerShell):

```powershell
irm https://raw.githubusercontent.com/Voloire/asimox-skill/main/install/install.ps1 -OutFile $env:TEMP\asimox-install.ps1; & $env:TEMP\asimox-install.ps1 -Key '<TOKEN>'
```

macOS / Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/Voloire/asimox-skill/main/install/install.sh -o /tmp/asimox-install.sh && ASIMOX_API_KEY='<TOKEN>' bash /tmp/asimox-install.sh
```

The installer copies the skill into `~/.claude/skills/asimox` and `~/.codex/skills/asimox`,
and saves the key to `~/.asimox/config.json`.

## Run

```bash
node ~/.claude/skills/asimox/scripts/asimox.mjs review --file design.md --profile C
```

Profiles: `L` read/analyze · `C` shared-code dev · `D` supervised delegated action ·
`A` bounded automation. The client uses `ASIMOX_API_KEY` when set, else the saved config file.

## Layout

- `SKILL.md` — loaded by Claude Code and Codex.
- `agents/openai.yaml` — Codex UI metadata.
- `scripts/asimox.mjs` — the review client (Node 22+, no dependencies).
- `install/` — platform installers.