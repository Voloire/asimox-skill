param(
  [string]$Key = "",
  [string]$Repo = "Voloire/asimox-skill",
  [string]$Ref = "main"
)
$ErrorActionPreference = "Stop"
$restore = $ProgressPreference
$ProgressPreference = "SilentlyContinue"
$home = $env:USERPROFILE
$tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("asimox-skill-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
try {
  $arch = Join-Path $tmp "repo.tar.gz"
  $url = "https://codeload.github.com/$Repo/archive/refs/heads/$Ref.tar.gz"
  Invoke-WebRequest -Uri $url -OutFile $arch
  tar -xzf $arch -C $tmp
  $dir = (Get-ChildItem -Directory $tmp | Select-Object -First 1).FullName

  foreach ($d in @((Join-Path $home ".claude\skills\asimox"), (Join-Path $home ".codex\skills\asimox"))) {
    New-Item -ItemType Directory -Force -Path $d | Out-Null
    Copy-Item -Recurse -Force -Path (Join-Path $dir "SKILL.md") -Destination (Join-Path $d "SKILL.md")
    Copy-Item -Recurse -Force -Path (Join-Path $dir "agents") -Destination $d
    Copy-Item -Recurse -Force -Path (Join-Path $dir "scripts") -Destination $d
  }

  if ($Key) {
    $cfgDir = Join-Path $home ".asimox"
    New-Item -ItemType Directory -Force -Path $cfgDir | Out-Null
    $json = @{ api_key = $Key } | ConvertTo-Json
    [System.IO.File]::WriteAllText((Join-Path $cfgDir "config.json"), $json, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "asimoX skill installed for Claude Code and Codex. Key saved to $cfgDir\config.json"
  } else {
    Write-Host "asimoX skill installed for Claude Code and Codex."
    Write-Host "No key saved. Buy credits on voloirex.com or re-run with -Key <token>."
  }
} finally {
  Remove-Item -Recurse -Force -Path $tmp -ErrorAction SilentlyContinue
  $ProgressPreference = $restore
}