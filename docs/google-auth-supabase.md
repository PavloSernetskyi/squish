# Google OAuth with Supabase — setup guide

This document is a reusable checklist for adding **“Sign in with Google”** to a web app backed by **Supabase Auth**, including **localhost**, **production (e.g. Vercel)**, and the difference between **Google’s redirect URI** and **your app’s callback URL**.

It reflects common patterns used in Next.js apps with `@supabase/ssr` and PKCE (what Supabase’s browser client uses by default).

---

## Concepts (quick)

### What is an “auth provider”?

An **auth provider** is the system that verifies identity. **Supabase Auth** is your auth backend; **Google** is an **OAuth 2.0 identity provider**. Your app does not talk to Google’s token endpoint directly in the browser for the full flow—Supabase orchestrates the redirect to Google and back.

### What is a “callback” / “redirect”?

In OAuth you will see several URLs; confusing them is the main source of misconfiguration.

1. **Your app route** (e.g. `https://yourapp.com/auth/callback`)  
   - After Google + Supabase finish, the user lands here with query parameters (often `?code=...` for PKCE).  
   - Your frontend should call `supabase.auth.exchangeCodeForSession(...)` with the **full current URL** so the PKCE verifier stored in the browser matches.

2. **Supabase Auth callback** (fixed URL on Supabase’s project)  
   - `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`  
   - This is what you register in **Google Cloud Console** as an **Authorized redirect URI** for the OAuth client. Google redirects **here** first; Supabase then forwards the user to **your** `redirectTo` URL (your `/auth/callback`).

3. **“Site URL” vs “Redirect URLs” in Supabase**  
   - **Site URL**: default origin when a redirect isn’t specified or for email templates.  
   - **Redirect URLs**: allowlist of URLs Supabase may send users to **after** auth. Your app’s `https://.../auth/callback` entries must appear here.

**Rule of thumb:**  
- **Google OAuth client** → redirect URI = **Supabase** `.../auth/v1/callback`  
- **Supabase Dashboard** → allowlist → **your app** `.../auth/callback`  
- **Your code** → `signInWithOAuth({ options: { redirectTo: `${origin}/auth/callback` } })`

### Why PKCE / `exchangeCodeForSession`?

Supabase’s browser client uses **PKCE**. The one-time `code` in the URL must be exchanged **in the same browser context** that started login, using `exchangeCodeForSession` (or equivalent helpers). Skipping that or using a raw HTTP OTP call without the client can break sign-in.

### In-app browsers (Instagram, Telegram, etc.)

Embedded WebViews sometimes break OAuth or cookies. A **non-destructive** UX pattern is to **detect when possible**, show guidance (“copy link, open in Safari/Chrome”), and **avoid auto-redirect loops** on `/auth/callback` that reload before `exchangeCodeForSession` runs—those loops were a real failure mode on mobile.

---

## Prerequisites

- A **Supabase** project (`Project URL` and `anon` key available).
- A **Google Cloud** project where you can create OAuth credentials.
- Your app has a **dedicated route** for the OAuth return, e.g. `/auth/callback`.

---

## Part A — Google Cloud Console

### 1. Create OAuth consent screen

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. **APIs & Services** → **OAuth consent screen**.
3. Choose **External** (or Internal for Workspace-only).
4. Fill **App name**, **User support email**, **Developer contact**.
5. **Scopes**: for basic Google sign-in, Supabase typically needs OpenID email/profile (often pre-selected when you enable the provider in Supabase).
6. **Test users**: If the app is in **Testing**, only listed test users can sign in until you publish / verify as required.

### 2. Create OAuth client (Web application)

1. **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**.
2. Application type: **Web application**.
3. **Authorized JavaScript origins** (optional for many Supabase flows; add if Google asks or if you use browser-based flows that require it):
   - `http://localhost:3000`
   - `https://your-production-domain.vercel.app` (and/or custom domain)
4. **Authorized redirect URIs** — this is the critical list:

   Add **exactly** (replace project ref):

   ```
   https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback
   ```

   Do **not** put your Vercel app URL here as the OAuth redirect unless you are doing a custom integration without Supabase’s callback. For standard Supabase Google auth, **only** the Supabase callback URL belongs in this field.

5. Save. Copy the **Client ID** and **Client secret**.

---

## Part B — Supabase Dashboard

### 1. Enable Google provider

1. **Authentication** → **Providers** → **Google**.
2. Enable **Google**.
3. Paste **Client ID** and **Client secret** from Google Cloud.
4. Save.

### 2. URL configuration

1. **Authentication** → **URL Configuration**.

**Site URL**

- Production: `https://your-production-domain.com`  
- For local-only testing you can temporarily set Site URL to `http://localhost:3000`, or keep production Site URL and rely on Redirect URLs (both are valid approaches; pick one team convention).

**Redirect URLs** (allowlist)

Add every origin you use, with the **same path** your app passes to `redirectTo`, e.g.:

```
http://localhost:3000/auth/callback
https://your-app.vercel.app/auth/callback
https://your-custom-domain.com/auth/callback
```

If you use **Vercel preview deployments**, add patterns Supabase supports, for example:

```
https://*.vercel.app/auth/callback
```

(Confirm in Supabase docs for your project; wildcard rules evolve.)

Save changes.

---

## Part C — Application code (typical Next.js + `@supabase/ssr`)

### 1. Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://<YOUR_PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
```

### 2. Start Google sign-in

Use the **Supabase browser client** (not raw `fetch` to `/auth/v1/otp` for OAuth/PKCE flows):

```ts
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: { prompt: "select_account" }, // optional
  },
});
```

Then navigate to `data.url` if returned, or let the client handle redirects per your setup.

### 3. Callback route: exchange code for session

On `/auth/callback`, when `?code=` is present:

```ts
await supabase.auth.exchangeCodeForSession(window.location.href);
```

Then `getSession()` and redirect the user into the app. Do **not** implement aggressive “open in Safari” redirects on this page before the exchange completes—that can cause **redirect loops** or blank tabs on mobile.

---

## Local vs production checklist

| Item | Localhost | Production (e.g. Vercel) |
|------|-----------|---------------------------|
| App URL | `http://localhost:3000` | `https://your-app.vercel.app` or custom domain |
| Supabase **Redirect URLs** | Include `http://localhost:3000/auth/callback` | Include `https://.../auth/callback` |
| Google **Authorized redirect URIs** | Same Supabase callback URL (not localhost-specific) | Same Supabase callback URL |
| **Site URL** | Often production URL; ensure localhost is in Redirect URLs | Production origin |

**Remember:** Google’s redirect URI field always points at **Supabase**, not at `localhost` or Vercel directly.

---

## Public repos & secrets (reminder)

When you configure Supabase, Google OAuth, and other API keys, keep **real values out of git**, especially on **public** repositories. Store them in **hosting env vars** (e.g. Vercel), **Supabase Dashboard** (provider secrets), or a **local `.env`** that is **gitignored**.

### What must never be in a public repo

- **Google OAuth Client Secret** — belongs only in **Supabase** (Google provider fields) and/or **server-side** environment config, **not** in committed files.
- **`SUPABASE_SERVICE_ROLE_KEY`** — bypasses Row Level Security; treat it like a **root password** for your project. **Server-only** env; never expose to the client or commit it.
- **Database URLs with passwords**, **private keys** (e.g. `.pem` files), **API keys for paid or privileged services**, and any other secrets that grant full or billing access.

### Related (usually OK in public code, but know the tradeoff)

- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** and **`NEXT_PUBLIC_SUPABASE_URL`** are **designed** to ship to the browser. Security still depends on **RLS and policies** in Supabase—not on hiding the anon key.

### Habits

- Keep **`.env` / `.env.local`** out of git (verify `.gitignore` includes `.env*`).
- Use **`env.example`** with placeholders only.
- Never **`git add -f`** a secret file “just once.”

---

## Troubleshooting

| Symptom | Things to verify |
|--------|-------------------|
| `redirect_uri_mismatch` | Google client’s redirect URI must be `https://<ref>.supabase.co/auth/v1/callback` exactly. |
| Redirect after login goes nowhere / blocked | Your final `https://app.../auth/callback` must be in Supabase **Redirect URLs**. |
| `exchangeCodeForSession` fails | Must run on the **same browser profile** that started login; avoid stripping query params before exchange. |
| Works on desktop, fails in Instagram/Telegram | In-app browser limitations; use copy-link UX, avoid callback redirect loops. |
| “Access blocked” for other users | Google OAuth app in **Testing** → add **Test users**, or move to **In production** when ready (may need verification for sensitive scopes). |

---

## Reuse in a new project

1. New Supabase project → note `PROJECT_REF`.
2. New Google OAuth client → redirect URI = `https://<PROJECT_REF>.supabase.co/auth/v1/callback`.
3. Supabase → enable Google → paste client id/secret.
4. Supabase → Redirect URLs → add every app URL + `/auth/callback`.
5. App → `signInWithOAuth` with `redirectTo` matching those URLs.
6. App → `/auth/callback` → `exchangeCodeForSession` then session check.

This file is intentionally generic; adjust paths (`/auth/callback`) and env names to match your framework.
