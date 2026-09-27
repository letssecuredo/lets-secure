# Let-S Secure — Frontend (Private CA Web Interface)

Static, framework-free frontend for the Let-S Secure Private Certificate Authority. Built with vanilla HTML, CSS, and JavaScript — no build step, no dependencies. Hosted on GitHub Pages.

> ⚠️ **Private CA only.** Certificates issued through this interface are valid only on systems that have installed the Let-S Secure Root CA.

[![Live](https://img.shields.io/badge/live-GitHub%20Pages-1f6feb?style=flat-square)](https://letssecuredo.github.io/lets-secure/)
[![Backend](https://img.shields.io/badge/backend-Render-46e3b7?style=flat-square)](https://lets-secure-ca.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-7c3aed?style=flat-square)](#license)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Live Site](#-live-site)
- [Features](#-features)
- [Pages](#-pages)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Client-Side Crypto](#-client-side-crypto)
- [Advanced Error Handling](#-advanced-error-handling)
- [Supported DNS Providers](#-supported-dns-providers)
- [Troubleshooting](#-troubleshooting)
- [Design Notes](#-design-notes)
- [Changelog](#-changelog)
- [License](#license)

---

## 📖 Overview

This is the **frontend** for Let-S Secure. It's a fully static site (no server-side rendering) that talks to the backend API over HTTPS.

**Backend repo:** https://github.com/letssecuredo/lets-secure-ca

**Zero dependencies** — pure HTML/CSS/JS. Deployable to any static host (GitHub Pages, Netlify, Cloudflare Pages, S3).

---

## 🌐 Live Site

| Resource | URL |
|---|---|
| **Frontend** | https://letssecuredo.github.io/lets-secure/ |
| **Setup Guide** | https://letssecuredo.github.io/lets-secure/setup.html |
| **Backend API** | https://lets-secure-ca.onrender.com |

---

## ✨ Features

### User-Facing
- **Certificate request** — issue X.509 certificates via 3 verification methods
- **Domain verification** — DNS-01, HTTP-01, TLS-ALPN-01 challenge flows
- **Private key display** — key shown once with download + copy
- **Fullchain download** — Nginx/Apache-ready bundle
- **Certificate verification** — validate by ID or domain
- **Lifecycle status** — timeline from request to expiry
- **Root CA download** — public trust anchor

### Admin
- **JWT login** — email + password
- **Certificate management** — list, revoke, delete
- **Private key recovery** — download encrypted leaf keys
- **Pre-verified domains** — whitelist patterns (`*.company.internal`)
- **Root CA management** — create, view info, download
- **Audit log viewer** — filter by action, actor, target

### Setup Guide
- **3 verification methods** — tabbed interface
- **22+ DNS providers** — visual UI mockups with highlighted fields
- **Copy buttons** — one-click token / path copying
- **Terminal commands** — ready-to-run snippets
- **Troubleshooting** — 6 common issues with fixes

### Design
- **Dark glassmorphism** theme
- **Mobile-first** responsive layout
- **Inline SVG icons** — no icon library
- **Smooth animations** — reveal on scroll, hover effects
- **Toast notifications** — user feedback
- **Advanced error panels** — classified codes with fix hints

---

## 📄 Pages

| Page | Purpose |
|---|---|
| **`index.html`** | Landing, hero, request form, Root CA download, features |
| **`verify.html`** | Verify certificate by ID or domain |
| **`status.html`** | Lifecycle timeline for any certificate |
| **`download.html`** | Download PEM / Fullchain / CRT, copy to clipboard |
| **`admin.html`** | Admin dashboard (login, certs, Root CA, whitelist, logs) |
| **`setup.html`** | Visual DNS setup guide for 22+ providers |
| **`merchant/*.html`** | Merchant platform pages (optional) |
| **`checkout/*.html`** | Hosted checkout for customer payments |

---

## 📁 Project Structure

```
lets-secure/
│
├── index.html              Home page
├── verify.html             Verify certificate
├── status.html             Lifecycle status
├── download.html           Download options
├── admin.html              Admin panel
├── setup.html              DNS setup guide
├── README.md               This file
│
├── merchant/               Merchant platform (optional)
│   ├── apply.html
│   ├── dashboard.html
│   ├── payment-links.html
│   ├── invoices.html
│   ├── payments.html
│   ├── refunds.html
│   ├── customers.html
│   ├── api-keys.html
│   ├── webhooks.html
│   ├── analytics.html
│   └── settlements.html
│
├── checkout/               Hosted checkout
│   ├── index.html
│   ├── success.html
│   └── failed.html
│
└── assets/
    ├── style.css           All styles (shared across pages)
    ├── app.js              Shared JS (config, API, errors, helpers)
    └── qrcode.js           QR code generator (optional)
```

---

## 🚀 Quick Start

### Prerequisites
- A modern browser
- The backend API running (see [backend repo](https://github.com/letssecuredo/lets-secure-ca))
- A static file server (or GitHub Pages)

### 1. Clone

```bash
git clone https://github.com/letssecuredo/lets-secure.git
cd lets-secure
```

### 2. Serve locally

Any static server works:

```bash
# Python 3
python3 -m http.server 5173

# Node.js
npx serve -p 5173

# PHP
php -S localhost:5173
```

Open `http://localhost:5173`.

### 3. Point at your backend

Edit `assets/app.js`:

```javascript
LS.API_BASE = "https://your-backend-url.onrender.com";
```

Also update `CORS_ORIGINS` on your backend to include `http://localhost:5173`.

---

## ⚙️ Configuration

All configuration lives in **`assets/app.js`**:

```javascript
window.LS = window.LS || {};
LS.API_BASE = "https://lets-secure-ca.onrender.com";

LS.API = {
  requestCert:     () => `${LS.API_BASE}/api/request-cert`,
  challenge:       (id) => `${LS.API_BASE}/api/challenge/${id}`,
  verifyChallenge: (id) => `${LS.API_BASE}/api/verify-challenge/${id}`,
  status:          (id) => `${LS.API_BASE}/api/status/${id}`,
  download:        (id) => `${LS.API_BASE}/api/cert/${id}`,
  fullchain:       (id) => `${LS.API_BASE}/api/cert/${id}/fullchain`,
  key:             (id) => `${LS.API_BASE}/api/cert/${id}/key`,
  rootCaPem:       () => `${LS.API_BASE}/api/root-ca.pem`,
  adminLogin:      () => `${LS.API_BASE}/api/admin/login`,
  // ... etc
};
```

### To point at a different backend

1. Edit `LS.API_BASE` in `assets/app.js`
2. Update `CORS_ORIGINS` on the backend
3. Redeploy both

---

## 🚀 Deployment

### GitHub Pages (recommended)

1. Push to GitHub
2. **Settings** → **Pages**
3. **Source:** `main` branch, `/ (root)`
4. Wait ~1 minute
5. Site live at `https://<username>.github.io/<repo>/`

### Other static hosts

**Netlify:**
```
Build command: (none)
Publish directory: .
```

**Cloudflare Pages:**
```
Build command: (none)
Output directory: /
```

**Vercel:**
```
Framework preset: Other
Build command: (none)
Output directory: .
```

---

## 🔐 Client-Side Crypto

The frontend never sees private keys in plaintext beyond the initial display.

### Key Display Flow

```
1. POST /api/request-cert (or /api/verify-challenge/:id)
        ↓
2. Backend returns { certificate, privateKeyPem }
        ↓
3. Frontend displays privateKeyPem in a prominent amber panel
        ↓
4. User has THREE options:
   a. Download as .key.pem
   b. Copy to clipboard
   c. Confirm "I have saved it" checkbox
        ↓
5. Panel disappears after leaving the page (never stored in localStorage)
```

**Important:** The private key is **never** written to `localStorage`, `sessionStorage`, or any cookie. It lives only in the DOM until the page is unloaded.

### What's stored in localStorage

Only UI cache — safe to clear:

| Key | Value |
|---|---|
| `ls_admin_token` | JWT for admin (expires in 12h) |
| `ls_admin_email` | Admin's email |
| `ls_cert_ids_v1` | Recent cert IDs (max 50, for prefill) |

**No private keys. No passwords. No secrets.**

---

## 🛡️ Advanced Error Handling

Every error is classified into a specific code with fix hints.

### Example Classifications

| Trigger | Title | Code | Hints |
|---|---|---|---|
| `fetch failed` | Cannot reach CA server | `NETWORK_ERROR` | Check connection, wait 30s, open `/healthz` |
| HTTP 502/503/504 | Server starting up | `SERVER_503` | Wait 30-60s, retry |
| "Root CA not initialized" | Root CA not initialized | `NO_ROOT_CA` | Go to Admin → Create Root CA |
| "No TXT record found" | DNS TXT record not found | `DNS_NOT_FOUND` | Add TXT, wait 5-30 min, use `nslookup` |
| "Token mismatch" | TXT record value mismatch | `DNS_MISMATCH` | Copy exact value, no quotes |
| "Could not fetch" | Cannot reach HTTP file | `HTTP_FETCH_FAILED` | Port 80, public access |
| "challenge expired" | Challenge expired | `CHALLENGE_EXPIRED` | Request new cert |
| "Certificate revoked" | Certificate has been revoked | `CERT_REVOKED` | No longer trusted |
| "Private key not available" | Private key not available | `NO_PRIVATE_KEY` | Request new cert |

Each error panel shows:
- **Title** with error code badge
- **Full message**
- **"How to fix this"** — numbered hints
- **Retry button** (if retryable)

---

## 🌍 Supported DNS Providers

The [Setup Guide](setup.html) includes visual UI mockups for:

**Registrars & DNS:**
Cloudflare · Namecheap · GoDaddy · Hostinger · FreeDNS · Google Cloud DNS · AWS Route 53 · DigitalOcean · cPanel · Vercel · Netlify · Render · Railway · Firebase Hosting · Porkbun · Squarespace Domains · Azure DNS · Alibaba Cloud · Hetzner · Vultr · Linode/Akamai · Njalla

Each provider card shows:
- Step-by-step numbered list
- **Visual mockup** of the provider's UI (CSS-drawn)
- **Highlighted target fields** with pulse animation
- Provider-specific tips (e.g., "Cloudflare requires DNS-only mode")
- Copy buttons for tokens

---

## 🐛 Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| **CORS error in console** | Origin not in backend allowlist | Add to `CORS_ORIGINS` on Render |
| **Blank page** | JS error | Open DevTools → Console |
| **"Cannot reach CA server"** | Backend cold-starting | Wait 30s, retry |
| **API URL wrong** | Wrong `LS.API_BASE` | Edit `assets/app.js` |
| **Private key panel missing** | Old version cached | Hard refresh (Ctrl+Shift+R) |
| **Admin login 401** | Wrong credentials | Check `ADMIN_EMAIL` / `ADMIN_PASSWORD` on backend |
| **Toast not showing** | Popup blocker | Allow notifications for site |
| **Icons not visible** | SVG sprite not injected | Check `LS.injectIcons()` runs |

---

## 🧠 Design Notes

### Why vanilla HTML/CSS/JS?

- **No build step** — just edit and push
- **No dependencies** — no `npm install`, no supply chain risk
- **Fast** — no framework overhead, ~50 KB total
- **GitHub Pages ready** — no configuration needed
- **Easy to audit** — everything is plain text

### Why glassmorphism?

- **Modern** SaaS aesthetic
- **Dark theme** aligns with developer tools
- **Backdrop blur** gives depth without heavy graphics
- **Lightweight** — pure CSS, no images

### Why no client-side state library?

- Each page is independent
- `localStorage` covers persistence needs
- URL parameters handle cross-page state (e.g., `?id=LS-XXXXXXXX`)

### Why inline SVG sprite?

- **Zero network requests** — sprite is injected at page load
- **Cacheable** — one sprite for all icons
- **Customizable** — `currentColor` inherits text color
- **Icon support** — 30+ icons, all vector

### Why the setup guide?

The biggest source of user errors is DNS setup. The guide:
- Shows **exact buttons to click** per provider
- **Highlights target fields** with animation
- Provides **terminal commands** to verify
- Includes **troubleshooting** for common issues

This drastically reduces support burden.

---

## 📝 Changelog

### v1.2.0 — Private key display + admin key download
- **NEW:** Private key panel shown once after issuance
- **NEW:** Download / copy / confirm checkbox
- **NEW:** Admin "Key" button for encrypted key recovery
- **NEW:** Fullchain download on all pages
- **NEW:** `download.html` with revoked cert warnings
- **NEW:** `setup.html` with 22 provider guides
- **FIXED:** Wildcard domains accepted (`*.example.com`)
- **IMPROVED:** Advanced error panel with fix hints

### v1.1.0 — Domain verification UI
- **NEW:** 3-method MCQ-style verification picker
- **NEW:** Challenge panel with timer
- **NEW:** Copy DNS name/value buttons
- **NEW:** TLS-ALPN provisioning file download

### v1.0.0 — Initial release
- Home, verify, status, download, admin pages
- Dark glassmorphism theme
- API client with error handling

---

## 📄 License

MIT © 2025 Manojit Majumdar

---

## 📞 Support

- **Backend Repo:** https://github.com/letssecuredo/lets-secure-ca
- **Issues:** https://github.com/letssecuredo/lets-secure/issues
- **Email:** gamingmanojit14@gmail.com

---

## ⚠️ Important Notes

1. **Private keys are shown once.** Save them immediately.
2. **No secrets in localStorage.** Only JWT + email + cert ID cache.
3. **Wildcard requires DNS-01.** HTTP-01 and TLS-ALPN-01 don't support it.
4. **Browser won't trust certs** until you install the Root CA.
5. **Cache may hide updates.** Hard refresh (`Ctrl+Shift+R`) after deployments.

---

**Built with ❤️ for secure, private infrastructure.**
