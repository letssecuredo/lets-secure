# Let-S Secure — Private Certificate Authority

A modern, production-ready **private Certificate Authority (CA)** platform for issuing, verifying, and managing X.509 certificates for personal projects, internal APIs, chat apps, and private services.

> ⚠️ **This is NOT a publicly-trusted CA** like Let's Encrypt. Certificates issued here are only trusted by systems that have explicitly installed the Let-S Secure Root CA. It's designed for **private/internal use only**.

[![Deploy](https://img.shields.io/badge/backend-Render-46e3b7)](https://lets-secure-ca.onrender.com)
[![Frontend](https://img.shields.io/badge/frontend-GitHub%20Pages-1f6feb)](https://letssecuredo.github.io/lets-secure/)
[![License](https://img.shields.io/badge/license-MIT-7c3aed)](#license)

---

## 🌐 Live Deployments

| Component | URL |
|---|---|
| **Frontend (GitHub Pages)** | https://letssecuredo.github.io/lets-secure/ |
| **Backend API (Render)** | https://lets-secure-ca.onrender.com |
| **Health Check** | https://lets-secure-ca.onrender.com/healthz |
| **GitHub Repository** | https://github.com/letssecuredo/lets-secure |

---

## ✨ Features

### 🔐 Certificate Authority
- **Root CA lifecycle** — RSA-4096 self-signed root, AES-256-GCM encrypted at rest
- **Leaf certificates** — RSA-2048, SHA-256 signed, 365-day validity, SAN with wildcard
- **X.509 v3 compliant** — `basicConstraints`, `keyUsage`, `extKeyUsage`, `subjectAltName`, SKI/AKI
- **Real cryptography** — signed with `node-forge`, no simulated crypto

### 🎯 Domain Verification (RFC 8555-inspired)
Three verification methods so anyone can prove domain ownership:

| Method | Description | Best For |
|---|---|---|
| **DNS-01** | TXT record at `_letssecure-challenge.<domain>` | Any domain, supports wildcards |
| **HTTP-01** | Well-known file at `/.well-known/letssecure-challenge/` | Public servers, instant |
| **TLS-ALPN-01** | Temporary cert with ALPN `acme-tls/1` | Advanced setups |
| **Pre-verified** | Admin-trusted patterns (wildcards supported) | Fully-controlled domains |

### 📊 Management
- **Certificate lifecycle** — issue, verify, download, revoke, delete
- **Audit logging** — every action stored in Firestore
- **Admin panel** — JWT-protected dashboard
- **Root CA distribution** — public download endpoint
- **Pre-verified domains** — admin can whitelist `*.company.internal`
- **Advanced error handling** — classified error codes with fix instructions

### 🛡️ Security
- **Helmet** — HTTP security headers
- **Rate limiting** — global + auth + issuance limits
- **CORS allowlist** — origins strictly controlled
- **Input validation** — domains, emails, IDs, PEM blocks
- **scrypt password hashing** — timing-safe comparison
- **AES-256-GCM** — root CA private key encrypted at rest
- **JWT authentication** — 12-hour expiry
- **No hardcoded secrets** — all via environment variables

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     USER (Browser)                              │
│                                                                 │
│   Frontend (GitHub Pages)                                       │
│   ├── index.html        ← Home, request cert, root CA           │
│   ├── verify.html       ← Verify by ID or domain                │
│   ├── status.html       ← Lifecycle status                      │
│   ├── download.html     ← Download PEM/CRT                      │
│   ├── admin.html        ← Admin dashboard                       │
│   ├── setup.html        ← 22+ provider DNS setup guide          │
│   └── assets/                                                   │
│       ├── style.css                                             │
│       └── app.js                                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌────────────────────────────────────────────────────────────────┐
│              BACKEND API (Render · Node.js + Express)          │
│                                                                 │
│   server.js → routes → controllers → services → Firebase       │
│                                                                 │
│   ├── middleware/       ← auth, rate limit, validation          │
│   ├── services/         ← business logic                        │
│   ├── utils/            ← crypto, logger, helpers               │
│   ├── firebase/         ← Firestore client                      │
│   └── models/           ← schema definitions                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Firebase Admin SDK
                           ▼
┌────────────────────────────────────────────────────────────────┐
│                    FIREBASE FIRESTORE                          │
│                                                                 │
│   Collections:                                                  │
│   ├── certificates/     ← Leaf cert + PEM + metadata            │
│   ├── users/            ← Admin accounts (scrypt hashes)        │
│   ├── revocations/      ← Revoked certs                         │
│   ├── audit_logs/       ← Every action logged                   │
│   ├── challenges/       ← Pending domain verifications          │
│   ├── verified_domains/ ← Admin-whitelisted patterns            │
│   └── system/           ← Root CA (encrypted private key)       │
└────────────────────────────────────────────────────────────────┘
```

---

## 🧱 Tech Stack

### Backend
| Layer | Technology |
|---|---|
| **Runtime** | Node.js ≥ 18 |
| **Server** | Express 4 |
| **Database** | Firebase Firestore |
| **Crypto** | `node-forge` (X.509), `crypto` (AES-GCM, scrypt) |
| **Auth** | JWT (`jsonwebtoken`) |
| **Security** | Helmet, express-rate-limit, CORS |
| **Logging** | Morgan + custom structured logger |

### Frontend
| Layer | Technology |
|---|---|
| **Framework** | Vanilla HTML/CSS/JS |
| **Styling** | Custom CSS (glassmorphism) |
| **Icons** | Inline SVG sprites |
| **Hosting** | GitHub Pages |
| **State** | localStorage (cache only) |

---

## 📁 Project Structure

```
lets-secure/
│
├── index.html              Home page
├── verify.html             Verify certificate
├── status.html             Lifecycle status
├── download.html           Download PEM
├── admin.html              Admin dashboard
├── setup.html              DNS setup guide
├── README.md               This file
│
└── assets/
    ├── style.css           All styles
    └── app.js              Shared JS (config, API, error handling)
```

**Backend repository** (separate): https://github.com/letssecuredo/lets-secure-ca

```
lets-secure-ca/
├── server.js
├── package.json
├── .env.example
├── .gitignore
├── README.md
│
├── routes/
│   ├── index.js
│   ├── admin.routes.js
│   └── cert.routes.js
│
├── controllers/
│   ├── admin.controller.js
│   └── cert.controller.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── adminMiddleware.js
│   ├── errorMiddleware.js
│   ├── rateLimitMiddleware.js
│   └── validationMiddleware.js
│
├── services/
│   ├── authService.js
│   ├── caService.js
│   ├── certService.js
│   ├── challengeService.js
│   ├── verifiedDomainService.js
│   └── auditService.js
│
├── models/
│   └── schemas.js
│
├── utils/
│   ├── crypto.js
│   ├── helpers.js
│   └── logger.js
│
├── firebase/
│   └── firestore.js
│
├── certificates/.gitkeep
└── logs/.gitkeep
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- Firebase project (Firestore enabled)
- Render account (for backend)
- GitHub account (for frontend)

### 1. Clone the repositories

```bash
# Backend
git clone https://github.com/letssecuredo/lets-secure-ca.git
cd lets-secure-ca

# Frontend (separate folder)
git clone https://github.com/letssecuredo/lets-secure.git
cd lets-secure
```

### 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project (e.g., `lets-secure-ca`)
3. Enable **Firestore Database** (production mode)
4. Create a **composite index**:
   - Collection: `certificates`
   - Field: `issuedAt` (Descending)
5. Set **Firestore Rules**:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```
6. Go to **Project Settings → Service accounts → Generate new private key**
7. Save the JSON file — you'll need 3 values from it

### 3. Configure backend environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
# Server
PORT=10000
NODE_ENV=production
LOG_LEVEL=info

# CORS
CORS_ORIGINS=https://letssecuredo.github.io

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
AUTH_RATE_LIMIT_MAX=10
ISSUE_RATE_LIMIT_MAX=30

# JWT — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=<128 hex chars>
JWT_EXPIRES_IN=12h

# Encryption — generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
MASTER_ENCRYPTION_KEY=<64 hex chars>

# Admin bootstrap
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<strong-password-min-8-chars>

# Firebase
FIREBASE_PROJECT_ID=lets-secure-ca
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@lets-secure-ca.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Install and run

```bash
npm install
npm start
```

Server runs on `http://localhost:10000`.

### 5. Deploy

**Backend → Render:**
1. Push to GitHub
2. Create a new **Web Service** on [Render](https://dashboard.render.com)
3. Connect your repo
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/healthz`
5. Add all environment variables
6. Deploy

**Frontend → GitHub Pages:**
1. Push to GitHub
2. Go to **Settings → Pages**
3. Set **Source:** `main` branch, `/ (root)`
4. Save — site goes live in ~1 minute

---

## 📡 API Reference

### Base URL
```
https://lets-secure-ca.onrender.com
```

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Service metadata + endpoint index |
| `GET` | `/healthz` | Liveness probe |

### Domain Verification

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/request-cert` | Request certificate → returns challenge (or auto-issues if pre-verified) |
| `GET`  | `/api/challenge/:id` | Poll challenge status |
| `POST` | `/api/verify-challenge/:id` | Verify challenge → issue certificate |
| `GET`  | `/api/challenge/:id/provision-cert` | Download TLS-ALPN-01 cert |
| `GET`  | `/api/challenge/:id/provision-key` | Download TLS-ALPN-01 key |

### Certificates

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/verify-cert` | Verify by `certId` or `certPem` |
| `GET`  | `/api/status/:id` | Get certificate metadata |
| `GET`  | `/api/cert/:id` | Download PEM bundle |
| `GET`  | `/api/cert/:id/json` | Download JSON metadata |
| `GET`  | `/api/root-ca.pem` | Download Root CA (public) |

### Admin (JWT required)

| Method | Path | Description |
|---|---|---|
| `POST`   | `/api/admin/login` | Obtain JWT |
| `POST`   | `/api/admin/create-root-ca` | Generate Root CA (one-time) |
| `GET`    | `/api/admin/root-ca` | Root CA info |
| `GET`    | `/api/admin/certificates` | List all certificates |
| `POST`   | `/api/admin/revoke-cert` | Revoke a certificate |
| `DELETE` | `/api/admin/certificate/:id` | Delete a certificate |
| `GET`    | `/api/admin/verified-domains` | List pre-verified patterns |
| `POST`   | `/api/admin/verified-domains` | Add pre-verified pattern |
| `DELETE` | `/api/admin/verified-domains/:id` | Remove pattern |
| `GET`    | `/api/admin/audit-logs` | Paginated audit log |

---

## 🧪 Usage Examples

### 1. Admin login

```bash
curl -X POST https://lets-secure-ca.onrender.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

**Response:**
```json
{
  "valid": true,
  "token": "eyJhbGciOi...",
  "user": { "id": "...", "email": "...", "role": "admin" }
}
```

### 2. Create Root CA (one-time)

```bash
curl -X POST https://lets-secure-ca.onrender.com/api/admin/create-root-ca \
  -H "Authorization: Bearer YOUR_TOKEN"
```

> ⚠️ **4096-bit RSA generation takes 3–15 seconds.** If Render times out, retry once — the key may already be persisted.

### 3. Request a certificate (DNS-01)

```bash
curl -X POST https://lets-secure-ca.onrender.com/api/request-cert \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "Manojit Majumdar",
    "project": "Melodyfy",
    "domain": "api.example.com",
    "email": "security@example.com",
    "method": "dns-01"
  }'
```

**Response:**
```json
{
  "valid": true,
  "status": "challenge_pending",
  "challenge": {
    "id": "CH-4118E9875A0A",
    "method": "dns-01",
    "dns": {
      "type": "TXT",
      "name": "_letssecure-challenge.api.example.com",
      "value": "ls-verify-a3f8b2c9...",
      "ttl": 300
    },
    "expiresAt": "2025-01-15T11:30:00.000Z"
  }
}
```

### 4. Add the TXT record to DNS

See the [Setup Guide](https://letssecuredo.github.io/lets-secure/setup.html) for 22+ providers.

### 5. Verify the challenge

```bash
curl -X POST https://lets-secure-ca.onrender.com/api/verify-challenge/CH-4118E9875A0A
```

**Response:**
```json
{
  "valid": true,
  "status": "issued",
  "certificate": {
    "certId": "LS-5A3D8DE5",
    "domain": "api.example.com",
    "serialNumber": "...",
    "fingerprint": "...",
    "expiresAt": "2026-01-15T10:30:00.000Z"
  }
}
```

### 6. Download the PEM

```bash
curl -O -J https://lets-secure-ca.onrender.com/api/cert/LS-5A3D8DE5
```

### 7. Verify a certificate

```bash
curl -X POST https://lets-secure-ca.onrender.com/api/verify-cert \
  -H "Content-Type: application/json" \
  -d '{"certId":"LS-5A3D8DE5"}'
```

**Response:**
```json
{ "valid": true, "reason": "" }
```

### 8. Revoke

```bash
curl -X POST https://lets-secure-ca.onrender.com/api/admin/revoke-cert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"certId":"LS-5A3D8DE5","reason":"key compromise"}'
```

### 9. Add pre-verified domain (skip challenge)

```bash
curl -X POST https://lets-secure-ca.onrender.com/api/admin/verified-domains \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pattern":"*.company.internal"}'
```

Now any certificate request for `*.company.internal` issues instantly.

---

## 🔐 Security Model

### Root CA Private Key
- Generated server-side with `node-forge` (RSA-4096)
- **AES-256-GCM encrypted** with `MASTER_ENCRYPTION_KEY` before writing to Firestore
- **Never** exposed through any API
- Never written to disk in plaintext

### Passwords
- Hashed with **scrypt** (16-byte salt, 64-byte output)
- **Timing-safe** comparison via `crypto.timingSafeEqual`
- No bcrypt dependency needed

### JWT
- Signed with `JWT_SECRET` (128 hex chars)
- **12-hour expiry** by default
- Verified on every admin request

### Rate Limiting
| Endpoint | Limit |
|---|---|
| Global | 300 requests / 15 min |
| Auth (`/login`) | 10 attempts / 15 min |
| Issuance (`/request-cert`) | 30 requests / hour |

### CORS
- Strict allowlist via `CORS_ORIGINS`
- Credentials enabled
- Only `GET`, `POST`, `DELETE`, `OPTIONS` allowed

### Firestore
- **All client access blocked** — only the Admin SDK (backend) can read/write
- Rules: `allow read, write: if false`

---

## 📱 Frontend Pages

| Page | Purpose |
|---|---|
| **Home** | Hero, request form, root CA download, features |
| **Verify** | Verify certificate by ID or domain |
| **Status** | Lifecycle timeline (requested → issued → active → expired) |
| **Download** | Download PEM/CRT, copy to clipboard |
| **Admin** | Login, certificate management, root CA, pre-verified domains, audit logs |
| **Setup** | Visual DNS setup guide for 22+ providers |

---

## 🌍 Supported DNS Providers

The [Setup Guide](https://letssecuredo.github.io/lets-secure/setup.html) includes step-by-step instructions with visual UI mockups for:

**Registrars & DNS:**
Cloudflare · Namecheap · GoDaddy · Hostinger · FreeDNS · Google Cloud DNS · AWS Route 53 · DigitalOcean · cPanel · Vercel · Netlify · Render · Railway · Firebase Hosting · Porkbun · Squarespace Domains · Azure DNS · Alibaba Cloud · Hetzner · Vultr · Linode/Akamai · Njalla

---

## 🔄 Certificate Lifecycle

```
1. User submits request
        ↓
2. Is domain pre-verified?
   ├── YES → Issue immediately
   └── NO  → Create challenge
              ↓
3. User adds DNS TXT record
   (or HTTP file, or TLS-ALPN cert)
        ↓
4. User clicks "Verify Now"
        ↓
5. Server queries DNS / fetches HTTP / does TLS handshake
        ↓
6. Token matches?
   ├── YES → Generate RSA-2048 keypair
   │         → Sign with Root CA
   │         → Store in Firestore
   │         → Return certId
   └── NO  → Return error with fix hints
        ↓
7. User downloads PEM
8. User installs on server
9. Certificate valid for 365 days
```

### Revocation
```
Admin marks certificate as revoked
        ↓
Status changes from "active" to "revoked"
        ↓
Entry added to `revocations/` collection
        ↓
Verification endpoint returns { valid: false, reason: "Certificate revoked" }
```

---

## 🧠 Design Decisions

### Why Firestore-only (no Firebase Storage)?

- **PEM files are tiny** — a 2048-bit RSA leaf certificate is ~1.5–2 KB in PEM
- Firestore's **1 MB per-document limit** gives ~500× headroom
- **Atomic writes** — certificate metadata and its PEM are written in a single Firestore operation
- **Fewer moving parts** — one Firebase product, one set of rules, one billing source
- **Faster reads** — one document fetch instead of metadata + Storage download

### Why no email verification?

- **Domain verification is the authoritative proof** — DNS-01 is strongest
- Email is metadata for X.509 subject and contact info
- Adding email verification adds complexity without improving security
- Public CAs like Let's Encrypt **deprecated** WHOIS email verification

### Why is the Root CA private key encrypted?

Firestore encryption-at-rest is handled by Google, but operators with project access could read raw key material. Encrypting with a **separate** `MASTER_ENCRYPTION_KEY` (that lives only in Render's environment) ensures that compromising Firestore alone is not enough to forge certificates.

### Why no private key is returned to clients?

The Root CA private key and per-certificate private keys never leave the server. Only the public certificate (PEM) and public metadata (JSON) are returned. Clients receive a **signed certificate** — not a signing capability.

### Wildcard support

If the requested domain is `api.example.com`, the certificate includes SAN entries for both `api.example.com` and `*.api.example.com`. If you pass a wildcard directly (`*.example.com`), it's used verbatim. **Wildcards require DNS-01.**

---

## 🧪 Testing Checklist

After deployment, verify each feature:

### Backend
- [ ] `GET /healthz` returns `{"ok":true}`
- [ ] `GET /` returns endpoint index with `version: "1.1.0"`
- [ ] `POST /api/admin/login` returns JWT
- [ ] `POST /api/admin/create-root-ca` succeeds
- [ ] `GET /api/root-ca.pem` returns PEM
- [ ] `POST /api/request-cert` creates challenge
- [ ] `POST /api/verify-challenge/:id` verifies and issues

### Frontend
- [ ] Home page loads, hero + form visible
- [ ] Verification method shows 3 MCQ-style options
- [ ] "Need help" block below Reset with 3 links
- [ ] Admin login works
- [ ] Certificate request → challenge → verify flow works
- [ ] Setup guide shows 22+ providers with UI mockups
- [ ] Root CA download works

---

## 🐛 Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| **CORS error** | Origin not in `CORS_ORIGINS` | Add exact URL to Render env vars |
| **"Root CA not initialized"** | Admin hasn't run `create-root-ca` | Log in → Admin → Create Root CA |
| **"Cannot find module"** | File name typo | Verify filenames match `require()` calls |
| **"Server auth misconfigured"** | `JWT_SECRET` missing/wrong | Verify 128 hex chars |
| **"MASTER_ENCRYPTION_KEY not configured"** | Wrong length | Must be exactly 64 hex chars |
| **Firebase credential error** | `FIREBASE_PRIVATE_KEY` has real newlines | Re-copy with literal `\n` sequences |
| **Cold start delays** | Render free tier | Wait 30-60s, or upgrade to Starter |
| **"Challenge expired"** | > 1 hour old | Request a new certificate |
| **"Token mismatch"** | TXT record value wrong | Copy exactly, no extra spaces |

---

## 📚 Setup Guide Screenshots

The [Setup Guide](https://letssecuredo.github.io/lets-secure/setup.html) includes visual UI mockups for each provider. Example for Cloudflare:

```
┌────────────────────────────────────────┐
│  DNS Records          [+ Add record]   │
├────────────────────────────────────────┤
│  Type:    [TXT ▼]           (selected) │
│  Name:    [_letssecure-challenge]      │
│  Content: [ls-verify-a3f8b2c9…]        │
│  TTL:     [Auto ▼]                     │
│                     [Save]             │
└────────────────────────────────────────┘
```

Each mockup highlights the exact fields to fill in.

---

## 🔄 Updating Certificates

Certificates are valid for **365 days**. To renew:

1. Request a new certificate for the same domain
2. Complete verification (or use pre-verified patterns)
3. Download the new PEM
4. Replace the old cert on your server
5. Revoke the old cert (optional but recommended)

Wildcards reduce renewal frequency — `*.example.com` covers all subdomains.

---

## 🤝 Contributing

Contributions welcome! Areas of interest:

- Additional DNS provider guides
- ACME protocol compatibility (RFC 8555)
- Certificate expiration notifications
- OCSP responder
- Email notification service (optional)
- Multi-tenant admin support

### Development

```bash
git clone https://github.com/letssecuredo/lets-secure-ca.git
cd lets-secure-ca
npm install
npm run dev
```

---

## 📄 License

MIT © 2025 Manojit Majumdar

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

---

## 🙏 Acknowledgments

- [node-forge](https://github.com/digitalbazaar/forge) — Pure-JS X.509 implementation
- [Let's Encrypt](https://letsencrypt.org/) — ACME protocol inspiration
- [Render](https://render.com/) — Backend hosting
- [Firebase](https://firebase.google.com/) — Firestore database
- [GitHub Pages](https://pages.github.com/) — Frontend hosting

---

## 📞 Support

- **Setup Guide:** https://letssecuredo.github.io/lets-secure/setup.html
- **Issues:** https://github.com/letssecuredo/lets-secure/issues
- **Email:** gamingmanojit14@gmail.com

---

## ⚠️ Important Notes

1. **This is a private CA.** Browsers won't trust certificates issued by it unless you install the Root CA first.
2. **Never share the Root CA private key.** It's encrypted at rest and never exposed via API.
3. **Install the Root CA only on trusted devices.** It acts as a trust anchor — anyone with it can MITM traffic to those devices.
4. **Root CA is valid for 10 years.** Leaf certificates are valid for 1 year.
5. **Backup `MASTER_ENCRYPTION_KEY` securely.** If lost, all certificates become undecryptable.

---

**Built with ❤️ for secure, private infrastructure.**
