#!/usr/bin/env bash
# Deny `git push` from the agent when format/lint/typecheck would fail CI.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

payload="$(cat)"
command="$(
  printf '%s' "$payload" | node -e '
    let d = "";
    process.stdin.on("data", (c) => (d += c));
    process.stdin.on("end", () => {
      try {
        const j = JSON.parse(d);
        process.stdout.write(String(j.command || ""));
      } catch {
        process.stdout.write("");
      }
    });
  '
)"

# Only gate pushes (not other git commands).
if ! [[ "$command" =~ (^|[[:space:];|&])git[[:space:]]+push ]]; then
  printf '%s\n' '{"permission":"allow"}'
  exit 0
fi

fail() {
  local msg="$1"
  node -e '
    const msg = process.argv[1];
    process.stdout.write(JSON.stringify({
      permission: "deny",
      user_message: msg,
      agent_message: msg + " Fix locally, then push again.",
    }));
  ' "$msg"
  exit 0
}

if ! pnpm format:check >/tmp/prodet-prepush-format.log 2>&1; then
  fail "Blocked git push: pnpm format:check failed (same gate as GitHub CI). Run pnpm format."
fi

if ! pnpm lint >/tmp/prodet-prepush-lint.log 2>&1; then
  fail "Blocked git push: pnpm lint failed. Fix lint errors before pushing."
fi

if ! pnpm typecheck >/tmp/prodet-prepush-typecheck.log 2>&1; then
  fail "Blocked git push: pnpm typecheck failed. Fix types before pushing."
fi

printf '%s\n' '{"permission":"allow"}'
exit 0
