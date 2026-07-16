# Dev / beta — turn off at launch

Staging helpers for testers. Keep this list updated when you add “temporary” beta UX.  
**At public launch, work through the checklist below.**

Live preview today: `https://dimela-mx.ro-88c.workers.dev`

---

## What’s on in staging (now)

| Feature | Where | How it’s enabled |
|---------|--------|------------------|
| **Dev menu** (Brand, Entrar) | Header hamburger → “Dev” | Always rendered in `src/components/Header.astro` (`betaLinks`) |
| **Beta demo login** | `/entrar/` + `GET /api/auth/beta` | `BETA_LOGIN = "true"` in `wrangler.toml` `[vars]` |
| **Magic link in UI** | `/cuenta/`, `/editar/` | When Email Sending isn’t configured, API returns `verifyUrl` in JSON (local always; remote also when send fails). Optional: `DEV_MAGIC_LINKS=true` forces expose even if email sent |
| **Brand playground** | `/brand/` | Public route; linked from Dev menu |
| **UI prototypes** | `/path/`, `/labeled/`, `/trail/`, `/bar/` | Public routes (not in Dev menu) |
| **Demo accounts** | D1 seed | `db/seed-auth.sql` + `shared/demoAccounts.js` |

Related code:

- `src/components/Header.astro` — Dev menu
- `src/pages/entrar/index.astro` — demo login UI
- `worker/auth.js` — `betaLoginAllowed()`, `exposeMagicLinkInResponse()`
- `wrangler.toml` — `[vars] BETA_LOGIN`
- `.env.example` — operator notes for secrets

---

## Launch checklist (turn off)

### 1. Worker flags (`wrangler.toml` and/or secrets)

```toml
# Remove or set false before public launch:
[vars]
BETA_LOGIN = "true"   # ← delete this line, or set "false"
```

Optional secrets (if you ever set them):

```bash
# Remove if present:
npx wrangler secret delete BETA_LOGIN
npx wrangler secret delete BETA_LOGIN_SECRET
npx wrangler secret delete DEV_MAGIC_LINKS
```

After Email Sending works on Workers Paid, require real email:

```bash
npx wrangler secret put FORCE_EMAIL_ONLY   # value: true
```

That stops returning `verifyUrl` when mail isn’t sent.

### 2. Header Dev menu

In `src/components/Header.astro`:

- Remove the **Dev** block (`betaLinks` / Brand + Entrar), **or**
- Gate it again with `import.meta.env.DEV` (local only)

Also remove unused `betaLinks` if nothing else uses it.

### 3. Beta login page

- Stop linking to `/entrar/` from the menu
- Optionally redirect `/entrar/` → `/cuenta/` (client or Worker)
- Optionally delete or 404 `/entrar/` once unused
- Keep `GET /api/auth/beta` disabled via `BETA_LOGIN` (already 403 when off)

### 4. Prototype / playground routes (optional)

Decide whether to keep for internal use or remove from the public build:

| Route | Notes |
|-------|--------|
| `/brand/` | Design playground |
| `/path/`, `/labeled/`, `/trail/` | Filter UI prototypes |
| `/bar/` | Redirects to `/` |

### 5. Demo seed data (optional harden)

- Rotate or remove shared demo passwords/emails if any become public
- Consider unpublishing or releasing ownership on demo profiles you don’t want in the live directory
- Admin can still invite real owners via `invite_email`

### 6. Deploy

```bash
npm run deploy
```

Verify:

- [ ] Hamburger has no **Dev** section
- [ ] `/entrar/` redirects or 404s / is unlinked
- [ ] `GET /api/auth/beta?demo=romina` → 403
- [ ] Magic link flow uses email only (no visible verify URL) once `FORCE_EMAIL_ONLY` + Email Sending are live
- [ ] `/cuenta/` is the only public entry for members

---

## Quick re-enable (staging only)

```toml
# wrangler.toml
[vars]
BETA_LOGIN = "true"
```

Restore Dev menu in `Header.astro`, then `npm run deploy`.

With optional shared key:

```bash
npx wrangler secret put BETA_LOGIN_SECRET
# Testers: https://HOST/entrar/?key=YOUR_SECRET
```

---

## Don’t confuse with product features

These stay for launch (not “beta toggles”):

- `/cuenta/` magic-link login (real email when configured)
- `/editar/`, `/admin/`, claim via `invite_email`
- Location scopes **Sólo México** / **Todas las ubicaciones**
- Pro tier, galleries, custom CSS/fonts
