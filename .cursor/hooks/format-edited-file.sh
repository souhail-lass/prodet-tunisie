#!/usr/bin/env bash
# Auto-format agent-edited files with the same Prettier CI uses.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

payload="$(cat)"
file="$(
  printf '%s' "$payload" | node -e '
    let d = "";
    process.stdin.on("data", (c) => (d += c));
    process.stdin.on("end", () => {
      try {
        const j = JSON.parse(d);
        process.stdout.write(String(j.file_path || ""));
      } catch {
        process.stdout.write("");
      }
    });
  '
)"

[[ -z "$file" || ! -f "$file" ]] && exit 0

case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.json|*.css|*.md|*.yml|*.yaml|*.html)
    ;;
  *)
    exit 0
    ;;
esac

# Prefer local prettier; never fail the edit hook.
if [[ -x "$ROOT/node_modules/.bin/prettier" ]]; then
  "$ROOT/node_modules/.bin/prettier" --write "$file" >/dev/null 2>&1 || true
elif command -v pnpm >/dev/null 2>&1; then
  pnpm exec prettier --write "$file" >/dev/null 2>&1 || true
fi

exit 0
