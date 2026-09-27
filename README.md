# Let-S Secure — Private Certificate Authority

A modern, production-ready **private Certificate Authority (CA)** platform for issuing, verifying, downloading, and managing X.509 certificates for personal projects, internal APIs, chat applications, and private services.

> ⚠️ **This is NOT a publicly-trusted CA** like Let's Encrypt. Certificates issued here are only trusted by systems that have explicitly installed the Let-S Secure Root CA. It is designed for **private / internal use only**.

[![Backend](https://img.shields.io/badge/backend-Render-46e3b7?style=flat-square)](https://lets-secure-ca.onrender.com)
[![Frontend](https://img.shields.io/badge/frontend-GitHub%20Pages-1f6feb?style=flat-square)](https://letssecuredo.github.io/lets-secure/)
[![Database](https://img.shields.io/badge/database-Firestore-ffa000?style=flat-square)](https://firebase.google.com/docs/firestore)
[![License](https://img.shields.io/badge/license-MIT-7c3aed?style=flat-square)](#license)

---

## 📑 Table of Contents

- [Live Deployments](#-live-deployments)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Firebase Setup](#-firebase-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Certificate Lifecycle](#-certificate-lifecycle)
- [Private Key Handling](#-private-key-handling)
- [Domain Verification](#-domain-verification)
- [Merchant Platform](#-merchant-platform)
- [Security Model](#-security-model)
- [Frontend Pages](#-frontend-pages)
- [Supported DNS Providers](#-supported-dns-providers)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Design Decisions](#-design-decisions)
- [Changelog](#-changelog)
- [License](#-license)

---

## 🌐 Live Deployments

| Component | URL |
|---|---|
| **Frontend (GitHub Pages)** | https://letssecuredo.github.io/lets-secure/ |
| **Backend API (Render)** | https://lets-secure-ca.onrender.com |
| **Health Check** | https://lets-secure-ca.onrender.com/healthz |
| **Backend Repo** | https://github.com/letssecuredo/lets-secure-ca |
| **Frontend Repo** | https://github.com/letssecuredo/lets-secure |

---

## ✨ Features

### 🔐 Certificate Authority
- **Root CA lifecycle** — RSA-4096 self-signed root, AES-256-GCM encrypted at rest
- **Leaf certificates** — RSA-2048, SHA-256 signed, 365-day validity, SAN with wildcard
- **X.509 v3 compliant** — `basicConstraints`, `keyUsage`, `extKeyUsage`, `subjectAltName`, SKI/AKI
- **Real cryptography** — signed with `node-forge`; no simulated crypto
- **Private key encryption** — every leaf key AES-256-GCM encrypted with master key
- **Wildcard support** — `*.example.com` for DNS-01
- **Admin key recovery** — encrypted leaf keys downloadable by admin

### 🎯 Domain Verification (RFC 8555-inspired)
Four independent methods so any domain owner can prove ownership:

| Method | Description | Wildcard | Instant |
|---|---|---|---|
| **DNS-01** | TXT record at `_letssecure-challenge.<domain>` | ✅ | ❌ (5–30 min) |
| **HTTP-01** | Well-known file at `/.well-known/letssecure-challenge/` | ❌ | ✅ |
| **TLS-ALPN-01** | Temporary cert with ALPN `acme-tls/1` | ❌ | ✅ |
| **Pre-verified** | Admin-trusted patterns (`*.company.internal`) | ✅ | ✅ |

### 📊 Management
- **Certificate lifecycle** — issue, verify, download, revoke, delete
- **Immutable audit log** — every action stored with actor, IP, timestamp
- **Admin panel** — JWT-protected dashboard with tabs
- **Root CA distribution** — public download endpoint
- **Pre-verified domains** — admin whitelist for skipping challenges
- **Advanced error handling** — classified error codes with fix instructions
- **Fullchain download** — Nginx/Apache/Caddy-ready bundle

### 🛡️ Security
- **Helmet** — HTTP security headers
- **Multi-tier rate limiting** — global + auth + issuance + admin
- **CORS allowlist** — origins strictly controlled
- **Input validation & sanitization** — domains, emails, IDs, PEM blocks
- **scrypt password hashing** — timing-safe comparison
- **AES-256-GCM** — Root CA and leaf private keys encrypted at rest
- **JWT authentication** — 12-hour expiry, refresh rotation
- **No hardcoded secrets** — everything via environment variables
- **Firestore rules** — all client access blocked

### 🛒 Merchant Platform (Optional)
- **Payment links** — shareable URLs for instant payments
- **Invoices** — professional invoices with line items, tax, discount
- **API integration** — REST API with API keys + idempotency
- **Webhooks** — signed event delivery with retry
- **Customer management** — auto-built customer profiles
- **Analytics** — revenue charts, payment breakdowns
- **Settlements** — auto-settlement to merchant wallet
- **Refunds** — full and partial with approval workflow

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  USERS (Browser / Mobile)                     │
│                                                               │
│   Frontend (GitHub Pages · static HTML/CSS/JS)                │
│   ├── index.html        Home · request · Root CA download     │
│   ├── verify.html       Verify by ID or domain                │
│   ├── status.html       Lifecycle timeline                    │
│   ├── download.html     PEM / Fullchain / CRT export          │
│   ├── admin.html        Admin dashboard                       │
│   ├── setup.html        22+ provider DNS setup guide          │
│   ├── merchant/         Merchant platform pages               │
│   ├── checkout/         Hosted checkout for customers         │
│   └── assets/                                                 │
│       ├── style.css     All styles                            │
│       └── app.js        Shared JS (config, API, errors)       │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTPS
                           ▼
┌──────────────────────────────────────────────────────────────┐
│         BACKEND API (Render · Node.js + Express)              │
│                                                               │
│   server.js → routes → controllers → services → Firebase      │
│                                                               │
│   Middleware:                                                 │
│   ├── authMiddleware         JWT verification                 │
│   ├── adminMiddleware        Role check                       │
│   ├── merchantMiddleware     Merchant status                  │
│   ├── apiKeyMiddleware       Public API auth                  │
│   ├── rateLimitMiddleware    Multi-tier limits                │
│   ├── validationMiddleware   Input schemas                    │
│   ├── idempotencyMiddleware  Duplicate prevention             │
│   └── errorMiddleware        Centralized handling             │
│                                                               │
│   Services:                                                   │
│   ├── authService            Login, JWT, bootstrap            │
│   ├── caService              Root CA generation & storage     │
│   ├── certService            Leaf issuance, key encryption    │
│   ├── challengeService       DNS / HTTP / TLS-ALPN verify     │
│   ├── verifiedDomainService  Pre-verified patterns            │
│   ├── auditService           Immutable action log             │
│   ├── merchantService        Merchant accounts                │
│   ├── paymentService         Payment processing               │
│   ├── webhookService         Signed webhook delivery          │
│   └── settlementService      Auto-settlement                  │
└──────────────────────────┬───────────────────────────────────┘
                           │ Firebase Admin SDK
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    FIREBASE FIRESTORE                         │
│                                                               │
│   Collections:                                                │
│   ├── certificates/          Leaf cert + encrypted key        │
│   ├── users/                 Admin accounts (scrypt)          │
│   ├── revocations/           Revoked certs                    │
│   ├── audit_logs/            Immutable action log             │
│   ├── challenges/            Pending domain verifications     │
│   ├── verified_domains/      Admin whitelist                  │
│   ├── system/                Root CA (encrypted private key)  │
│   ├── merchants/             Merchant accounts                │
│   ├── payments/              Payment records                  │
│   ├── invoices/              Invoices                         │
│   ├── refunds/               Refunds                          │
│   ├── customers/             Customer profiles                │
│   ├── merchantApiKeys/       API keys (hashed)                │
│   └── merchantWebhookEvents/ Webhook delivery log             │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧱 Tech Stack

### Backend
| Layer | Technology |
|---|---|
| **Runtime** | Node.js ≥ 18 |
| **Server** | Express 4 |
| **Database** | Firebase Firestore (only) |
| **Crypto** | `node-forge` (X.509), Node `crypto` (AES-GCM, scrypt, Ed25519) |
| **Auth** | JWT (`jsonwebtoken`) |
| **Security** | Helmet, express-rate-limit, CORS |
| **Logging** | Morgan + custom structured logger |

### Frontend
| Layer | Technology |
|---|---|
| **Framework** | Vanilla HTML / CSS / JS (no build step) |
| **Styling** | Custom CSS (glassmorphism dark theme) |
| **Icons** | Inline SVG sprite |
| **Hosting** | GitHub Pages |
| **State** | localStorage (UI cache only) |

---

## 📁 Project Structure

### Backend (`lets-secure-ca`)

```
lets-secure-ca/
├── server.js
├── package.json
├── .env.example
├── .gitignore
├── README.md
│
├── firebase/
│   └── firestore.js
│
├── routes/
│   ├── index.js
│   ├── admin.routes.js
│   ├── cert.routes.js
│   ├── merchant/
│   │   ├── index.js
│   │   ├── onboarding.routes.js
│   │   ├── paymentLinks.routes.js
│   │   ├── invoices.routes.js
│   │   ├── payments.routes.js
│   │   ├── refunds.routes.js
│   │   ├── customers.routes.js
│   │   ├── apiKeys.routes.js
│   │   ├── webhooks.routes.js
│   │   ├── analytics.routes.js
│   │   └── settlements.routes.js
│   ├── public/
│   │   ├── checkout.routes.js
│   │   └── shortLink.routes.js
│   └── v1/
│       ├── index.js
│       ├── payments.routes.js
│       └── paymentLinks.routes.js
│
├── controllers/
│   ├── admin.controller.js
│   ├── cert.controller.js
│   ├── auth.controller.js
│   ├── wallet.controller.js
│   ├── merchant/
│   │   └── ...
│   └── public/
│       └── checkout.controller.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── adminMiddleware.js
│   ├── merchantMiddleware.js
│   ├── apiKeyMiddleware.js
│   ├── rateLimitMiddleware.js
│   ├── validationMiddleware.js
│   ├── idempotencyMiddleware.js
│   └── errorMiddleware.js
│
├── services/
│   ├── authService.js
│   ├── caService.js
│   ├── certService.js
│   ├── challengeService.js
│   ├── verifiedDomainService.js
│   ├── auditService.js
│   ├── merchantService.js
│   ├── paymentService.js
│   ├── paymentLinkService.js
│   ├── invoiceService.js
│   ├── refundService.js
│   ├── settlementService.js
│   ├── webhookService.js
│   ├── apiKeyService.js
│   ├── customerService.js
│   └── analyticsService.js
│
├── workers/
│   ├── webhookWorker.js
│   ├── settlementWorker.js
│   ├── subscriptionWorker.js
│   └── cleanupWorker.js
│
├── models/
│   └── schemas.js
│
├── utils/
│   ├── crypto.js
│   ├── helpers.js
│   └── logger.js
│
├── certificates/.gitkeep
└── logs/.gitkeep
```

### Frontend (`lets-secure`)

```
lets-secure/
├── index.html              Home page
├── verify.html             Verify certificate
├── status.html             Lifecycle status
├── download.html           Download PEM / Fullchain / CRT
├── admin.html              Admin dashboard
├── setup.html              DNS setup guide (22+ providers)
├── README.md               This file
│
├── merchant/
│   ├── apply.html          Merchant onboarding
│   ├── dashboard.html      Merchant overview
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
├── checkout/
│   ├── index.html          Hosted checkout
│   ├── success.html
│   └── failed.html
│
├── admin/
│   └── index.html          (alt admin path)
│
└── assets/
    ├── style.css           All styles
    ├── app.js              Shared JS (config, API, errors)
    └── qrcode.js           QR code generator (inline)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- Firebase project with Firestore enabled
- Render account (backend hosting)
- GitHub account (frontend hosting)

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

See the [Firebase Setup](#-firebase-setup) section.

### 3. Configure environment

```bash
cp .env.example .env
nano .env    # Fill in all values
```

### 4. Install and run

```bash
npm install
npm start
```

Server runs on `http://localhost:10000`.

### 5. Deploy

- **Backend** → [Render](https://dashboard.render.com) Web Service
- **Frontend** → GitHub Pages (Settings → Pages → main → `/`)

---

## 🔥 Firebase Setup

### 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project (e.g., `lets-secure-ca`)
3. Enable **Firestore** in production mode
4. **Do NOT** enable Firebase Storage (not used)

### 2. Generate a service account key

1. Project Settings → **Service accounts** → **Generate new private key**
2. Save the JSON file — you'll need 3 values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep literal `\n`)

### 3. Create Firestore composite indexes

| Collection | Fields | Order |
|---|---|---|
| `certificates` | `issuedAt` | Descending |
| `certificates` | `domain` | Ascending |
| `certificates` | `serialNumber` | Ascending |
| `audit_logs` | `timestamp` | Descending |
| `payments` | `merchantId`, `createdAt` | Asc / Desc |
| `payments` | `status`, `createdAt` | Asc / Desc |

> 🔔 Firestore will prompt you with a link to create any missing index when a query fails.

### 4. Set Firestore security rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

All client access is blocked. Only the Admin SDK (backend) can read/write.

### 5. Collections used

| Collection | Purpose |
|---|---|
| `certificates` | Leaf cert + **encrypted private key** + public metadata |
| `users` | Admin accounts (scrypt hashes) |
| `revocations` | Revoked certificate records |
| `audit_logs` | Immutable action log |
| `challenges` | Pending domain verification challenges |
| `verified_domains` | Admin-whitelisted patterns |
| `system` | Root CA (`root-ca` doc, AES-256-GCM encrypted key) |
| `merchants` | Merchant accounts |
| `payments` | Payment records |
| `invoices` | Invoices |
| `refunds` | Refunds |
| `customers` | Customer profiles |
| `merchantApiKeys` | API keys (SHA-256 hashed) |
| `merchantWebhookEvents` | Webhook delivery log |

---

## 🔐 Environment Variables

Create `.env` (never commit it) based on `.env.example`.

| Variable | Description |
|---|---|
| `PORT` | HTTP port (Render sets this) |
| `NODE_ENV` | `production` |
| `LOG_LEVEL` | `error` \| `warn` \| `info` \| `debug` |
| `CORS_ORIGINS` | Comma-separated allowlist of origins |
| `RATE_LIMIT_WINDOW_MS` | Global rate-limit window (ms) |
| `RATE_LIMIT_MAX` | Max requests per window (global) |
| `AUTH_RATE_LIMIT_MAX` | Max login attempts per 15 min |
| `ISSUE_RATE_LIMIT_MAX` | Max certificate issues per hour |
| `JWT_SECRET` | 128 hex chars |
| `JWT_EXPIRES_IN` | `12h` |
| `MASTER_ENCRYPTION_KEY` | 64 hex chars (encrypts Root CA **and** leaf private keys) |
| `ADMIN_EMAIL` | First admin's email (bootstrap) |
| `ADMIN_PASSWORD` | First admin's password (min 8 chars) |
| `FIREBASE_PROJECT_ID` | From service account JSON |
| `FIREBASE_CLIENT_EMAIL` | From service account JSON |
| `FIREBASE_PRIVATE_KEY` | From service account JSON (wrap in quotes, keep `\n` literal) |

Generate secrets:

```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# MASTER_ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

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

### Domain Verification Flow

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/request-cert` | Request certificate → returns challenge |
| `GET`  | `/api/challenge/:id` | Poll challenge status |
| `POST` | `/api/verify-challenge/:id` | Verify challenge → issue certificate |
| `GET`  | `/api/challenge/:id/provision-cert` | Download TLS-ALPN-01 cert |
| `GET`  | `/api/challenge/:id/provision-key` | Download TLS-ALPN-01 key |

### Certificate Operations

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/verify-cert` | Verify by `certId` or `certPem` |
| `GET`  | `/api/status/:id` | Get certificate metadata |
| `GET`  | `/api/cert/:id` | Download leaf PEM |
| `GET`  | `/api/cert/:id/fullchain` | Download fullchain (leaf + CA) |
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
| `GET`    | `/api/admin/certificate/:id/key` | **Download encrypted leaf key** |
| `GET`    | `/api/admin/verified-domains` | List pre-verified patterns |
| `POST`   | `/api/admin/verified-domains` | Add pre-verified pattern |
| `DELETE` | `/api/admin/verified-domains/:id` | Remove pattern |
| `GET`    | `/api/admin/audit-logs` | Paginated audit log |

---

## 🔄 Certificate Lifecycle

```
1. User submits request
        ↓
2. Is domain pre-verified?
   ├── YES → Issue immediately + return privateKeyPem (once)
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
   │         → Encrypt private key (AES-256-GCM)
   │         → Sign with Root CA
   │         → Persist { leafCertPem, encryptedPrivateKey, metadata }
   │         → Return { certificate, privateKeyPem } (once)
   └── NO  → Return error with fix hints
        ↓
7. User downloads:
   - Certificate (.pem)
   - Fullchain (.pem)
   - Private key (shown once)
        ↓
8. Install on server (Nginx / Apache / Caddy / Traefik)
        ↓
9. Certificate valid for 365 days
```

### Revocation

```
Admin marks certificate as revoked
        ↓
Status: active → revoked
        ↓
Entry added to revocations/ collection
        ↓
Verification endpoint returns { valid: false, reason: "Certificate revoked" }
```

---

## 🔑 Private Key Handling

**Private keys are handled with the same care as the Root CA.**

| Stage | What Happens |
|---|---|
| **Generation** | RSA-2048 keypair generated inside `issueCertificate()` |
| **Encryption** | Key encrypted with AES-256-GCM using `MASTER_ENCRYPTION_KEY` |
| **Storage** | Encrypted blob stored in `certificates/{certId}.encryptedPrivateKey` |
| **Response** | Plaintext PEM returned **exactly once** in the API response |
| **Download (user)** | User saves `.key.pem` from the browser |
| **Download (admin)** | Admin can decrypt + download via `/api/admin/certificate/:id/key` |
| **Audit** | Every key download logged with actor, IP, timestamp |
| **Deletion** | Encrypted key deleted with the certificate document |

### API response at issuance (contains key ONCE)

```json
{
  "valid": true,
  "status": "issued",
  "certificate": { "certId": "LS-5A3D8DE5", "domain": "api.example.com" },
  "privateKeyPem": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "warning": "Save the private key now. It will not be shown again.",
  "downloadUrl": "/api/cert/LS-5A3D8DE5",
  "fullchainUrl": "/api/cert/LS-5A3D8DE5/fullchain"
}
```

### Admin key retrieval (any time)

```bash
TOKEN=$(curl -s -X POST https://lets-secure-ca.onrender.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"..."}' | jq -r '.token')

curl -H "Authorization: Bearer $TOKEN" \
     -o LS-5A3D8DE5.key.pem \
     https://lets-secure-ca.onrender.com/api/admin/certificate/LS-5A3D8DE5/key
```

---

## 🎯 Domain Verification

### DNS-01

Request a certificate → server returns a TXT record value:

```json
{
  "challenge": {
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

Add the TXT record to your DNS provider, wait for propagation, then verify.

**Verify from terminal:**
```bash
nslookup -type=TXT _letssecure-challenge.api.example.com 1.1.1.1
```

### HTTP-01

Place a file at the exact path returned by the server:

```
http://example.com/.well-known/letssecure-challenge/<token>
```

Content must be exactly `<token>` with no trailing whitespace.

### TLS-ALPN-01

Download the provisioning cert and key, install on port 443 with ALPN protocol `acme-tls/1`, then verify.

Requires Caddy, Nginx Plus, or a custom TLS server. Stock Nginx/Apache **do not** support this.

### Pre-verified Domains (bypass)

Admin can whitelist patterns in the Admin panel:

```
*.company.internal
admin.example.com
*
```

Certificates for matching domains are issued **instantly** — no challenge required.

---

## 🛒 Merchant Platform

### Merchant Lifecycle

```
Apply → Auto-approve (project) → Payment link creation → Accept payments
   ↓
Operating wallet ← incoming payments
   ↓
Auto-settlement (daily / instant)
   ↓
Settlement wallet
```

### Payment Links

Create a link → get a short code → share URL:

```
https://yourdomain.com/p/abc123
```

Customer opens → checkout page → pays → merchant receives webhook.

### API Integration

```bash
curl -X POST https://lets-secure-ca.onrender.com/api/v1/payments \
  -H "Authorization: Bearer sk_live_abc123..." \
  -H "X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000000,
    "currency": "SCX",
    "description": "Order #12345",
    "customerEmail": "customer@example.com",
    "redirectUrl": "https://merchant.com/success",
    "metadata": { "orderId": "12345" }
  }'
```

Response:
```json
{
  "paymentId": "pay_xyz",
  "checkoutUrl": "https://yourdomain.com/checkout/pay_xyz",
  "expiresAt": "2025-01-15T11:00:00Z"
}
```

### Webhooks

Every payment event triggers a signed webhook:

```http
POST https://merchant.com/webhooks/securecoinx
Content-Type: application/json
X-SecureCoinX-Event: payment.succeeded
X-SecureCoinX-Signature: sha256=<HMAC-SHA256(rawBody, webhookSecret)>
X-SecureCoinX-Timestamp: 1705316400
X-SecureCoinX-Delivery-Id: evt_abc123
```

**Verify signature:**

```javascript
const crypto = require("crypto");

function verifyWebhook(rawBody, signature, secret) {
  const expected = "sha256=" + crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

**Retry policy** (automatic):
| Attempt | Delay |
|---|---|
| 1 | Immediate |
| 2 | 30 seconds |
| 3 | 5 minutes |
| 4 | 30 minutes |
| 5 | 2 hours |

After 5 failures, the event is marked `abandoned` and the merchant is notified.

---

## 🔒 Security Model

### Root CA Private Key
- Generated server-side with `node-forge` (RSA-4096)
- **AES-256-GCM encrypted** with `MASTER_ENCRYPTION_KEY`
- **Never** exposed through any API
- Never written to disk in plaintext

### Leaf Certificate Private Keys
- Generated inside `issueCertificate()` (RSA-2048)
- **AES-256-GCM encrypted** with the same master key
- Returned **once** in the API response
- Recoverable by admin via protected endpoint
- Audit-logged on every download

### Passwords
- Hashed with **scrypt** (16-byte salt, 64-byte output)
- **Timing-safe** comparison via `crypto.timingSafeEqual`

### JWT
- Signed with `JWT_SECRET` (128 hex chars)
- **12-hour expiry**
- Verified on every admin request

### Rate Limiting

| Endpoint | Limit |
|---|---|
| Global | 300 requests / 15 min |
| Auth (`/login`) | 10 attempts / 15 min |
| Issuance (`/request-cert`) | 30 requests / hour |
| Admin actions | 100 requests / hour |
| Public API | 100 requests / minute per key |

### CORS
- Strict allowlist via `CORS_ORIGINS`
- Credentials enabled
- Only `GET`, `POST`, `DELETE`, `OPTIONS` allowed
- `X-Request-Id` exposed for tracing

### Firestore
- **All client access blocked** — rules: `allow read, write: if false`
- Only the Admin SDK (backend) can read/write
- No Firebase Storage dependency

---

## 📱 Frontend Pages

| Page | Purpose |
|---|---|
| **Home** | Hero, request form, Root CA download, features |
| **Verify** | Verify certificate by ID or domain |
| **Status** | Lifecycle timeline (requested → issued → active → expired) |
| **Download** | Download PEM, Fullchain, CRT, copy to clipboard |
| **Admin** | Login, certs, Root CA, pre-verified domains, audit logs |
| **Setup** | Visual DNS setup guide for 22+ providers |
| **Merchant** | Onboarding, dashboard, payment links, invoices, etc. |
| **Checkout** | Hosted checkout for customer payments |

### Setup Guide Features
- **Method tabs** — DNS-01 / HTTP-01 / TLS-ALPN-01
- **22+ provider cards** with visual UI mockups
- **Highlighted target fields** — pulse animation
- **Copy buttons** for tokens / paths
- **Terminal mockups** with exact commands
- **Troubleshooting** grid

---

## 🌍 Supported DNS Providers

The [Setup Guide](https://letssecuredo.github.io/lets-secure/setup.html) includes visual instructions for:

**Registrars & DNS:**
Cloudflare · Namecheap · GoDaddy · Hostinger · FreeDNS · Google Cloud DNS · AWS Route 53 · DigitalOcean · cPanel · Vercel · Netlify · Render · Railway · Firebase Hosting · Porkbun · Squarespace Domains · Azure DNS · Alibaba Cloud · Hetzner · Vultr · Linode/Akamai · Njalla

---

## 🚀 Deployment

### Backend → Render

1. Push to GitHub
2. Create a **Web Service** at [dashboard.render.com](https://dashboard.render.com)
3. Configure:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/healthz`
   - **Instance Type:** Starter (recommended; Free tier has cold starts)
4. Add all environment variables
5. Deploy

### Frontend → GitHub Pages

1. Push to GitHub
2. **Settings** → **Pages**
3. **Source:** `main` branch, `/ (root)`
4. Wait ~1 minute

### First-Run Checklist

1. ✅ Deploy goes live
2. ✅ `GET /healthz` returns `{"ok": true}`
3. ✅ `POST /api/admin/login` returns JWT
4. ✅ `POST /api/admin/create-root-ca` succeeds (3–15 seconds)
5. ✅ Issue first certificate and verify private key is returned
6. ✅ Test admin key retrieval from Admin panel

---

## 🐛 Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| **CORS error** | Origin not in `CORS_ORIGINS` | Add exact URL to Render env vars |
| **"Root CA not initialized"** | Admin hasn't run `create-root-ca` | Log in → Admin → Create Root CA |
| **"Cannot find module"** | Filename typo | Verify filenames match `require()` calls |
| **"Server auth misconfigured"** | `JWT_SECRET` missing/wrong | Verify 128 hex chars |
| **"MASTER_ENCRYPTION_KEY not configured"** | Wrong length | Must be exactly 64 hex chars |
| **Firebase credential error** | `FIREBASE_PRIVATE_KEY` has real newlines | Re-copy with literal `\n` sequences |
| **"Private key not available"** | Cert issued before encryption-at-rest | Request a new certificate |
| **"Private key could not be decrypted"** | `MASTER_ENCRYPTION_KEY` changed | Restore original key from backup |
| **Cold start delays** | Render free tier | Wait 30-60s, or upgrade to Starter |
| **"Challenge expired"** | > 1 hour old | Request a new certificate |
| **"Token mismatch"** | TXT record value wrong | Copy exactly, no extra spaces |
| **"Unable to retrieve private key"** | User lost the once-shown key | Admin retrieves via Admin panel |

---

## 🧠 Design Decisions

### Why Firestore-only (no Firebase Storage)?

- **PEM files are tiny** — a 2048-bit RSA leaf cert is ~1.5–2 KB
- Firestore's **1 MB per-document limit** gives ~500× headroom
- **Atomic writes** — cert metadata + PEM + encrypted key in one document
- **Fewer moving parts** — one Firebase product, one rule set
- **Faster reads** — one document fetch, no separate Storage download

### Why is the Root CA private key encrypted?

Firestore encryption-at-rest is handled by Google, but operators with project access could read raw key material. Encrypting with a separate `MASTER_ENCRYPTION_KEY` (living only in Render's environment) ensures that **compromising Firestore alone is not enough** to forge certificates.

### Why encrypt leaf private keys too?

Consistency with the Root CA pattern + admin recovery. The key is:
- Shown to the user **once** at issuance
- Encrypted at rest with the same master key
- Recoverable by admin if the user loses it
- Never exposed in `jsonPayload` or subsequent API calls

### Why no email verification?

- **Domain verification is the authoritative proof** — DNS-01 is strongest
- Email is metadata for X.509 subject and contact info
- Adding email verification adds complexity without improving security
- Public CAs like Let's Encrypt **deprecated** WHOIS email verification

### Wildcard support

If you request `api.example.com`, the cert includes SAN entries for both `api.example.com` and `*.api.example.com`. If you pass `*.example.com` directly, it's used verbatim.

**Wildcards require DNS-01.**

---

## 📝 Changelog

### v1.2.0 — Private key handling fix
- **FIXED (critical):** Leaf certificate private keys were generated but not persisted — every issued cert was unusable. Now encrypted with AES-256-GCM and stored in Firestore.
- **NEW:** `privateKeyPem` returned once at issuance (both `requestCert` and `verifyChallengeAndIssue`).
- **NEW:** Admin endpoint `GET /api/admin/certificate/:id/key` for key recovery.
- **NEW:** Fullchain download endpoint `GET /api/cert/:id/fullchain`.
- **NEW:** `CERT_KEY_DOWNLOADED` audit action.
- **FIXED:** Wildcard domains (`*.example.com`) now accepted by `DOMAIN_RE`.
- **FIXED:** Morgan format uses `:res[X-Request-Id]` instead of `:req[...]`.
- **FIXED:** `requestCert` uses `req.validated.method` instead of re-reading `req.body.method`.
- **FIXED:** Challenge marked `USED` **before** issuance — prevents replay on failure.

### v1.1.0 — Domain verification
- **NEW:** DNS-01, HTTP-01, TLS-ALPN-01 challenge flows.
- **NEW:** Pre-verified domains (admin whitelist with wildcard support).
- **NEW:** Setup guide with 22+ provider instructions.
- **NEW:** Advanced error handling with classified codes and fix hints.

### v1.0.0 — Initial release
- Root CA generation and storage.
- Leaf certificate issuance, verification, revocation.
- Admin authentication with JWT.
- Audit logging.
- Firestore-only persistence.

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
3. **Install the Root CA only on trusted devices.** It acts as a trust anchor.
4. **Root CA is valid for 10 years.** Leaf certificates are valid for 1 year.
5. **Backup `MASTER_ENCRYPTION_KEY` securely.** If lost, all certificates become undecryptable.
6. **Private keys are shown once.** Save them immediately. Admins can recover them.
7. **Every key download is audited.** Check `audit_logs` for `CERT_KEY_DOWNLOADED` entries.

---

**Built with ❤️ for secure, private infrastructure.**
