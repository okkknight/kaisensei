# Kaisensei VPS Runbook

This document describes how to publish and verify the current `kaisensei` deployment on the VPS.

## Live topology

- Public site: `https://boringmax.com/kaisensei/`
- Public API: `https://boringmax.com/kaisensei/api/*`
- Shared gateway: `boringapi` on `127.0.0.1:8091`
- Kaisensei API service: `127.0.0.1:3001`
- Static files: `/opt/boringmax/site/kaisensei`
- App source on VPS: `/opt/boringmax/kaisensei`

## What runs where

### 1) `kaisensei.service`

Runs the photo lesson API and Codex CLI provider.

Important files:

- `/etc/systemd/system/kaisensei.service`
- `/etc/kaisensei/kaisensei.env`
- `/opt/boringmax/kaisensei/api`

Current service settings:

- `User=shipnow`
- `WorkingDirectory=/opt/boringmax/kaisensei/api`
- `ExecStart=/usr/bin/node src/server.js`
- `PORT=3001`
- `CODEX_BINARY=/usr/bin/codex`
- `HOME=/var/lib/shipnow`
- `CODEX_HOME=/var/lib/shipnow/.codex`
- `TMPDIR=/opt/boringmax/workspace/kaisensei-tmp`

### 2) `boringapi.service`

Runs the shared gateway used by `snapspeak` and now `kaisensei`.

Important files:

- `/etc/systemd/system/boringapi.service`
- `/etc/boringapi/boringapi.env`

Relevant registry entry:

- `kaisensei -> http://127.0.0.1:3001`

### 3) Caddy

Caddy serves the public site and forwards `/kaisensei/api/*` to `boringapi`.

Relevant rule:

- `/kaisensei/api* -> 127.0.0.1:8091`

## Local build

From the repo root:

```bash
cd /Users/linpeiwen/knightspace/kaisensei
node --test api/test/codex-cli-provider.test.js api/test/lesson-jobs-route.test.js
cd prototype
VITE_KAISENSEI_BASE_PATH=/kaisensei/ VITE_KAISENSEI_API_BASE=/kaisensei/api npm run build
```

The Vite build must be produced with:

- `VITE_KAISENSEI_BASE_PATH=/kaisensei/`
- `VITE_KAISENSEI_API_BASE=/kaisensei/api`

That keeps the static asset URLs and API requests aligned with the live subpath.

## Publish to VPS

### 1) Sync source

```bash
rsync -a --delete \
  --exclude node_modules \
  --exclude dist \
  --exclude .git \
  --exclude .DS_Store \
  --exclude '.tmp-shot*' \
  --exclude '.npm-cache' \
  /Users/linpeiwen/knightspace/kaisensei/ \
  root@89.208.242.44:/opt/boringmax/kaisensei/
```

### 2) Build and sync static files

```bash
cd /Users/linpeiwen/knightspace/kaisensei/prototype
VITE_KAISENSEI_BASE_PATH=/kaisensei/ VITE_KAISENSEI_API_BASE=/kaisensei/api npm run build
rsync -a --delete dist/ root@89.208.242.44:/opt/boringmax/site/kaisensei/
```

### 3) Restart services

```bash
ssh root@89.208.242.44 'systemctl restart kaisensei.service boringapi.service caddy'
```

## Verification

### 1) Service health

```bash
ssh root@89.208.242.44 'systemctl --no-pager --full status kaisensei.service boringapi.service caddy.service'
```

### 2) Local API health

```bash
ssh root@89.208.242.44 'curl -fsS http://127.0.0.1:3001/healthz'
```

Expected output:

```json
{"ok":true}
```

### 3) Public site check

```bash
curl -I https://boringmax.com/kaisensei/
```

Expected:

- `200`
- HTML content type
- `Cache-Control: no-cache, max-age=0, must-revalidate`

### 4) Public API check

```bash
curl -fsS https://boringmax.com/kaisensei/api/healthz
```

Expected output:

```json
{"ok":true}
```

### 5) End-to-end lesson generation check

Use a real image file, for example `docs/image.png` from the repo or a new photo.

```bash
scp docs/image.png root@89.208.242.44:/tmp/kaisensei-test.png
ssh root@89.208.242.44 '
  job_json=$(curl -fsS -F image=@/tmp/kaisensei-test.png -F level=Normal https://boringmax.com/kaisensei/api/v1/lesson-jobs)
  echo "$job_json"
'
```

The response should include a `jobId` and `status: queued`.

Then poll the job:

```bash
ssh root@89.208.242.44 '
  job_id=job_xxx
  curl -fsS "https://boringmax.com/kaisensei/api/v1/lesson-jobs/$job_id"
'
```

Expected final state:

- `status: succeeded`
- `lesson.see.sentence` is present
- `lesson.learn.chunks` is present
- `lesson.build` and `lesson.use` are present

## Common failure modes

### 1) `/kaisensei/api/*` returns 404

Likely causes:

- Caddy route missing or stale
- `boringapi` registry missing `kaisensei`
- `kaisensei.service` is not running on `127.0.0.1:3001`

### 2) Upload returns 415

Likely cause:

- `boringapi` does not have multipart support enabled for the gateway path.

### 3) Upload returns 413

Likely cause:

- gateway or upstream body limit too small for the photo.

Current fix:

- `boringapi` body limit is set to 20 MB
- `kaisensei` API body limit is set to 10 MB

### 4) Upload returns 500 `fetch failed`

Likely cause:

- `kaisensei.service` is down or Codex CLI cannot be executed from the service environment.

Check:

```bash
ssh root@89.208.242.44 'systemctl status kaisensei.service --no-pager --full'
ssh root@89.208.242.44 'sudo -u shipnow /usr/bin/codex --version'
```

## Notes

- Keep the public app on `/kaisensei/`, not on the site root.
- Keep the API on `/kaisensei/api/*` so it stays inside the `boringapi` convention.
- Do not point the frontend at `/v1/*` directly in production.
- If the gateway registry changes, restart `boringapi` after editing `/etc/boringapi/boringapi.env`.
