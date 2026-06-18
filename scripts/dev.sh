#!/bin/sh
set -eu

repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

cleanup() {
  if [ -n "${api_pid:-}" ] && kill -0 "$api_pid" 2>/dev/null; then
    kill "$api_pid" 2>/dev/null || true
  fi
}

trap cleanup INT TERM EXIT

cd "$repo_root/api"
npm run start &
api_pid=$!

cd "$repo_root/prototype"
npm run dev
