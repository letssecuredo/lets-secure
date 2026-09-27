"use strict";

/* ============================================================
   CONFIG
   ============================================================ */
window.LS = window.LS || {};
LS.API_BASE = "https://lets-secure-ca.onrender.com";

LS.API = {
  // Certificate request flow
  requestCert:  () => `${LS.API_BASE}/api/request-cert`,
  challenge:    (id) => `${LS.API_BASE}/api/challenge/${encodeURIComponent(id)}`,
  verifyChallenge: (id) => `${LS.API_BASE}/api/verify-challenge/${encodeURIComponent(id)}`,
  provisionCert:(id) => `${LS.API_BASE}/api/challenge/${encodeURIComponent(id)}/provision-cert`,
  provisionKey: (id) => `${LS.API_BASE}/api/challenge/${encodeURIComponent(id)}/provision-key`,

  // Certificate operations
  verifyCert:   () => `${LS.API_BASE}/api/verify-cert`,
  status:       (id) => `${LS.API_BASE}/api/status/${encodeURIComponent(id)}`,
  download:     (id) => `${LS.API_BASE}/api/cert/${encodeURIComponent(id)}`,
  fullchain:    (id) => `${LS.API_BASE}/api/cert/${encodeURIComponent(id)}/fullchain`,
  key:          (id) => `${LS.API_BASE}/api/cert/${encodeURIComponent(id)}/key`,
  downloadJson: (id) => `${LS.API_BASE}/api/cert/${encodeURIComponent(id)}/json`,
  rootCaPem:    () => `${LS.API_BASE}/api/root-ca.pem`,

  // Admin
  adminLogin:   () => `${LS.API_BASE}/api/admin/login`,
  adminCreateRoot: () => `${LS.API_BASE}/api/admin/create-root-ca`,
  adminRootInfo:   () => `${LS.API_BASE}/api/admin/root-ca`,
  adminListCerts:  () => `${LS.API_BASE}/api/admin/certificates`,
  adminRevoke:     () => `${LS.API_BASE}/api/admin/revoke-cert`,
  adminDelete:  (id) => `${LS.API_BASE}/api/admin/certificate/${encodeURIComponent(id)}`,
  adminAuditLogs:  () => `${LS.API_BASE}/api/admin/audit-logs`,
  adminVerifiedDomains: () => `${LS.API_BASE}/api/admin/verified-domains`,
  adminVerifiedDomainDelete: (id) => `${LS.API_BASE}/api/admin/verified-domains/${encodeURIComponent(id)}`,
};

/* ============================================================
   DOM HELPERS
   ============================================================ */
LS.$  = (sel, root = document) => root.querySelector(sel);
LS.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
LS.sleep = (ms) => new Promise((r) => setTimeout(r, ms));

LS.escapeHtml = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

LS.fmtDate = (ts) => {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    });
  } catch { return String(ts); }
};

LS.fmtCountdown = (ms) => {
  if (ms <= 0) return "expired";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
};

/* ============================================================
   ICON INJECTION
   ============================================================ */
LS.injectIcons = function () {
  if (document.getElementById("ls-icon-sprite")) return;
  const sprite = document.createElement("div");
  sprite.id = "ls-icon-sprite";
  sprite.style.position = "absolute";
  sprite.style.width = "0";
  sprite.style.height = "0";
  sprite.style.overflow = "hidden";
  sprite.setAttribute("aria-hidden", "true");
  sprite.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true">
      <defs>
        <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 2.5 4.5 5.6v5.6c0 4.9 3.2 9.2 7.5 10.3 4.3-1.1 7.5-5.4 7.5-10.3V5.6L12 2.5Z"/></symbol>
        <symbol id="i-shield-check" viewBox="0 0 24 24"><path d="M12 2.5 4.5 5.6v5.6c0 4.9 3.2 9.2 7.5 10.3 4.3-1.1 7.5-5.4 7.5-10.3V5.6L12 2.5Z"/><path d="m9 11.8 2.1 2.1L15.2 9.8"/></symbol>
        <symbol id="i-lock" viewBox="0 0 24 24"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/><circle cx="12" cy="15.5" r="1.2"/></symbol>
        <symbol id="i-cert" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/><circle cx="12" cy="14" r="2.4"/><path d="M10.4 15.9 9.6 20l2.4-1.4 2.4 1.4-.8-4.1"/></symbol>
        <symbol id="i-key" viewBox="0 0 24 24"><circle cx="8" cy="8" r="4.2"/><path d="m11 11 8.5 8.5"/><path d="m16.5 16.5 2-2"/><path d="m14 14 2-2"/></symbol>
        <symbol id="i-check-circle" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8.3 12.3 2.5 2.5 4.9-5.2"/></symbol>
        <symbol id="i-x-circle" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m9.3 9.3 5.4 5.4M14.7 9.3l-5.4 5.4"/></symbol>
        <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></symbol>
        <symbol id="i-download" viewBox="0 0 24 24"><path d="M12 3.5v11"/><path d="m7.8 10.6 4.2 4.2 4.2-4.2"/><path d="M4.5 17.5v1.2a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-1.2"/></symbol>
        <symbol id="i-refresh" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20.2 4.2v4.4h-4.4"/></symbol>
        <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></symbol>
        <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8.4" r="3.7"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/></symbol>
        <symbol id="i-folder" viewBox="0 0 24 24"><path d="M3.5 7.2A2 2 0 0 1 5.5 5.2h3.4l2 2.4h7.6a2 2 0 0 1 2 2v8.2a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z"/></symbol>
        <symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3.2 12h17.6"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/></symbol>
        <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3.2" y="5.5" width="17.6" height="13" rx="2.4"/><path d="m4 7.5 8 5.4 8-5.4"/></symbol>
        <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5.2v13.6M5.2 12h13.6"/></symbol>
        <symbol id="i-copy" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2.2"/><path d="M15 6.4V5.6A2.2 2.2 0 0 0 12.8 3.4H5.6A2.2 2.2 0 0 0 3.4 5.6v7.2A2.2 2.2 0 0 0 5.6 15h.8"/></symbol>
        <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7.2V12l3.2 2"/></symbol>
        <symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.2"/><path d="M12 7.9h.01"/></symbol>
        <symbol id="i-log-out" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></symbol>
        <symbol id="i-settings" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></symbol>
        <symbol id="i-wifi-off" viewBox="0 0 24 24"><path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 5-2.7M19 12.5a10 10 0 0 0-4-2.5M2 8.5a15 15 0 0 1 4-2.5M22 8.5a15 15 0 0 0-4-2.5"/><circle cx="12" cy="20" r=".6" fill="currentColor"/></symbol>
      </defs>
    </svg>`;
  document.body.insertBefore(sprite, document.body.firstChild);
};

/* ============================================================
   TOAST
   ============================================================ */
LS.toast = function (message, type = "info", ms = 3600) {
  let wrap = document.getElementById("toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "toast-wrap";
    wrap.className = "toast-wrap";
    wrap.setAttribute("aria-live", "polite");
    document.body.appendChild(wrap);
  }
  const el = document.createElement("div");
  el.className = "toast " + type;
  const icon = type === "ok" ? "i-check-circle" : type === "err" ? "i-x-circle" : "i-info";
  el.innerHTML = '<svg class="ic ic-sm"><use href="#' + icon + '"/></svg><span>' + LS.escapeHtml(message) + "</span>";
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 380);
  }, ms);
};

/* ============================================================
   ADVANCED ERROR CLASSIFICATION
   ============================================================ */
LS.classifyError = function (err) {
  const msg = String(err.message || "").toLowerCase();
  const code = (err.code || "").toUpperCase();

  // Network / offline
  if (err.name === "TypeError" && msg.includes("fetch")) {
    return {
      title: "Cannot reach the CA server",
      code: "NETWORK_ERROR",
      hints: [
        "Check your internet connection.",
        "The Render backend may be cold-starting — wait 30 seconds and try again.",
        "Open <code>" + LS.API_BASE + "/healthz</code> in a browser to confirm the server is online."
      ],
      retryable: true,
    };
  }

  // Server cold-start (504, 502, 503)
  if ([502, 503, 504].includes(err.status)) {
    return {
      title: "CA server is starting up",
      code: "SERVER_" + err.status,
      hints: [
        "The Render backend takes 30–60 seconds to spin up from idle.",
        "Wait a moment, then click Retry.",
        "If it keeps failing, check Render logs for startup errors."
      ],
      retryable: true,
    };
  }

  // Root CA not initialized
  if (msg.includes("root ca not initialized")) {
    return {
      title: "Root CA not initialized",
      code: "NO_ROOT_CA",
      hints: [
        "An administrator must generate the Root CA before any certificate can be issued.",
        "Go to the Admin panel and click <b>Create Root CA</b>.",
        "This is a one-time setup step."
      ],
      retryable: false,
    };
  }

  // Rate limit
  if (err.status === 429 || msg.includes("rate limit") || msg.includes("too many")) {
    return {
      title: "Rate limit reached",
      code: "RATE_LIMIT",
      hints: [
        "You've made too many requests in a short window.",
        "Wait a few minutes before retrying.",
        "Issuance limit: 30 per hour · Login: 10 per 15 min · Global: 300 per 15 min."
      ],
      retryable: true,
    };
  }

  // Domain verification errors
  if (msg.includes("no txt record found") || code === "DNS_NOT_FOUND") {
    return {
      title: "DNS TXT record not found",
      code: "DNS_NOT_FOUND",
      hints: [
        "Log in to your DNS provider (Cloudflare / FreeDNS / Namecheap / GoDaddy).",
        "Add a TXT record with the exact Name and Value shown above.",
        "DNS changes take 5–30 minutes to propagate worldwide.",
        "Verify from a terminal: <code>nslookup -type=TXT _letssecure-challenge.YOURDOMAIN 1.1.1.1</code>"
      ],
      retryable: true,
    };
  }

  if (msg.includes("token mismatch") || code === "DNS_MISMATCH") {
    return {
      title: "TXT record value mismatch",
      code: "DNS_MISMATCH",
      hints: [
        "The TXT record exists but the value is wrong.",
        "Copy the exact Value shown above — no extra spaces, no quotes.",
        "Some DNS providers add quotes automatically — that's fine.",
        "Verify with: <code>nslookup -type=TXT _letssecure-challenge.YOURDOMAIN</code>"
      ],
      retryable: true,
    };
  }

  if (msg.includes("could not fetch") || code === "HTTP_FETCH_FAILED") {
    return {
      title: "Cannot reach your HTTP file",
      code: "HTTP_FETCH_FAILED",
      hints: [
        "Make sure the file exists at the exact path shown above.",
        "Your server must be publicly accessible on <b>port 80</b>.",
        "Check that no firewall blocks incoming port 80.",
        "Test in a browser: open the URL shown above."
      ],
      retryable: true,
    };
  }

  if (msg.includes("http") && msg.includes("instead of 200")) {
    return {
      title: "Unexpected HTTP response",
      code: "HTTP_BAD_STATUS",
      hints: [
        "The file must return HTTP 200 with the exact token content.",
        "Check your server logs for the response code.",
        "Redirects are followed, but the final response must be 200."
      ],
      retryable: true,
    };
  }

  if (msg.includes("alpn") || code === "ALPN_MISMATCH") {
    return {
      title: "TLS-ALPN negotiation failed",
      code: "ALPN_MISMATCH",
      hints: [
        'The server must accept the ALPN protocol <b>acme-tls/1</b>.',
        "Install the provisioning certificate provided below on port 443.",
        "Restart your web server after installation.",
        "Not all servers support custom ALPN — Caddy and Nginx Plus do, but stock Nginx does not."
      ],
      retryable: true,
    };
  }

  if (msg.includes("challenge expired")) {
    return {
      title: "Challenge expired",
      code: "CHALLENGE_EXPIRED",
      hints: [
        "Challenges are valid for 1 hour only.",
        "Request a new certificate to get a fresh challenge."
      ],
      retryable: false,
    };
  }

  if (msg.includes("already been used")) {
    return {
      title: "Challenge already used",
      code: "CHALLENGE_USED",
      hints: [
        "This challenge has already issued a certificate.",
        "Request a new certificate if you need another one."
      ],
      retryable: false,
    };
  }

  if (msg.includes("certificate not found")) {
    return {
      title: "Certificate not found",
      code: "CERT_NOT_FOUND",
      hints: [
        "Check the certificate ID format: <code>LS-XXXXXXXX</code> (8 hex chars).",
        "The certificate may have been deleted by an admin.",
        "Try looking it up by domain name instead."
      ],
      retryable: false,
    };
  }

  if (msg.includes("certificate revoked")) {
    return {
      title: "Certificate has been revoked",
      code: "CERT_REVOKED",
      hints: [
        "This certificate is no longer trusted by the CA.",
        "The revocation was logged with a timestamp and reason.",
        "Request a new certificate if you still need one for this domain."
      ],
      retryable: false,
    };
  }

  if (msg.includes("certificate expired")) {
    return {
      title: "Certificate has expired",
      code: "CERT_EXPIRED",
      hints: [
        "Leaf certificates are valid for 365 days.",
        "Request a new certificate to replace this one."
      ],
      retryable: false,
    };
  }

  if (msg.includes("private key not available") || msg.includes("key not available")) {
    return {
      title: "Private key not available",
      code: "NO_PRIVATE_KEY",
      hints: [
        "This certificate was issued before encryption-at-rest was enabled.",
        "The key was discarded at issuance and cannot be recovered.",
        "Request a new certificate to get a fresh private key."
      ],
      retryable: false,
    };
  }

  if (msg.includes("could not be decrypted")) {
    return {
      title: "Private key decryption failed",
      code: "KEY_DECRYPT_FAILED",
      hints: [
        "The MASTER_ENCRYPTION_KEY may have changed since issuance.",
        "Contact the CA administrator.",
        "Do NOT delete the certificate — it may be recoverable with the original key."
      ],
      retryable: false,
    };
  }

  if (msg.includes("signature verification failed")) {
    return {
      title: "Signature verification failed",
      code: "SIG_INVALID",
      hints: [
        "The certificate was not signed by this Root CA.",
        "It may have been tampered with or issued by a different CA.",
        "Do not trust this certificate for any production use."
      ],
      retryable: false,
    };
  }

  if (msg.includes("issuer mismatch")) {
    return {
      title: "Issuer mismatch",
      code: "ISSUER_MISMATCH",
      hints: [
        "The certificate was issued by a different CA.",
        "Verify that you downloaded the certificate from this Let-S Secure instance."
      ],
      retryable: false,
    };
  }

  if (msg.includes("malformed") && msg.includes("pem")) {
    return {
      title: "Malformed certificate PEM",
      code: "MALFORMED_PEM",
      hints: [
        "The input is not a valid X.509 PEM certificate.",
        "Check that it starts with <code>-----BEGIN CERTIFICATE-----</code>.",
        "Check that it ends with <code>-----END CERTIFICATE-----</code>."
      ],
      retryable: false,
    };
  }

  // Auth
  if (err.status === 401) {
    return {
      title: "Authentication failed",
      code: "AUTH_FAILED",
      hints: [
        "Your session may have expired.",
        "Sign out and sign in again.",
        "If you don't have credentials, contact the CA administrator."
      ],
      retryable: false,
    };
  }

  if (err.status === 403) {
    return {
      title: "Permission denied",
      code: "FORBIDDEN",
      hints: [
        "This action requires admin privileges.",
        "If you're the admin, your account may be disabled."
      ],
      retryable: false,
    };
  }

  if (err.status === 400) {
    return {
      title: "Invalid request",
      code: "BAD_REQUEST",
      hints: [
        "Check the highlighted fields and try again.",
        "The server rejected your input as malformed."
      ],
      retryable: true,
    };
  }

  // Fallback
  return {
    title: "Something went wrong",
    code: code || "UNKNOWN",
    hints: [
      "Review the error message below.",
      "Wait a moment and try again.",
      "If the problem persists, check the Render logs."
    ],
    retryable: true,
  };
};

LS.renderAdvancedError = function (container, err, opts = {}) {
  const info = LS.classifyError(err);
  const retryAction = opts.retryAction || null;
  const retryLabel = opts.retryLabel || "Try Again";
  const safeMsg = String(err.message || "Unknown error");

  const hintsHtml = info.hints.map((h) => "<li>" + h + "</li>").join("");

  container.innerHTML =
    '<div class="advanced-error">' +
      '<div class="ae-head">' +
        '<div class="ae-icon"><svg class="ic ic-lg"><use href="#i-x-circle"/></svg></div>' +
        "<div>" +
          "<h4>" + LS.escapeHtml(info.title) +
            '<span class="ae-code">' + LS.escapeHtml(info.code) + "</span>" +
          "</h4>" +
          "<p>The CA server rejected the request. Details below.</p>" +
        "</div>" +
      "</div>" +
      '<div class="ae-message">' + LS.escapeHtml(safeMsg) + "</div>" +
      '<div class="ae-hints">' +
        '<div class="ae-hints-label">How to fix this</div>' +
        "<ul>" + hintsHtml + "</ul>" +
      "</div>" +
      '<div class="ae-actions">' +
        (info.retryable
          ? '<button class="btn btn-primary btn-sm" id="ls-retry-btn"><svg class="ic ic-sm"><use href="#i-refresh"/></svg> ' +
            LS.escapeHtml(retryLabel) + "</button>"
          : "") +
        '<button class="btn btn-ghost btn-sm" data-ls-action="dismiss-error"><svg class="ic ic-sm"><use href="#i-x-circle"/></svg> Dismiss</button>' +
      "</div>" +
    "</div>";

  const retryBtn = document.getElementById("ls-retry-btn");
  if (retryBtn && retryAction) {
    retryBtn.addEventListener("click", retryAction);
  }

  const dismiss = container.querySelector('[data-ls-action="dismiss-error"]');
  if (dismiss) {
    dismiss.addEventListener("click", () => { container.innerHTML = ""; });
  }

  setTimeout(() => {
    const banner = container.querySelector(".advanced-error");
    if (banner) banner.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 180);
};

/* ============================================================
   API CLIENT
   ============================================================ */
LS.getToken = () => localStorage.getItem("ls_admin_token") || "";
LS.getAdminEmail = () => localStorage.getItem("ls_admin_email") || "";

LS.setAuth = function (token, email) {
  localStorage.setItem("ls_admin_token", token);
  localStorage.setItem("ls_admin_email", email || "");
};
LS.clearAuth = function () {
  localStorage.removeItem("ls_admin_token");
  localStorage.removeItem("ls_admin_email");
};

LS.apiRequest = async function (url, options = {}) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs || 30000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    let data = null;
    const text = await res.text();
    if (text) {
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
    }

    if (!res.ok) {
      const message =
        (data && (data.error || data.detail || data.message)) || `HTTP ${res.status}`;
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      err.code = data && data.code;
      throw err;
    }
    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      const timeoutErr = new Error("Request timed out after " + (timeoutMs / 1000) + "s");
      timeoutErr.status = 504;
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

LS.apiAuth = function (url, options = {}) {
  return LS.apiRequest(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: "Bearer " + LS.getToken(),
    },
  });
};

/**
 * Fetch a PEM file (text response) with optional Authorization header.
 * Throws a structured error on failure.
 */
LS.fetchPem = async function (url, { auth = false, timeoutMs = 30000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = {};
    if (auth) headers.Authorization = "Bearer " + LS.getToken();

    const res = await fetch(url, { headers, signal: controller.signal });

    if (!res.ok) {
      let msg = "Download failed";
      try {
        const j = await res.json();
        msg = j.error || msg;
      } catch {}
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }

    return await res.text();
  } catch (err) {
    if (err.name === "AbortError") {
      const e = new Error("Request timed out");
      e.status = 504;
      throw e;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

/* ============================================================
   COPY / DOWNLOAD HELPERS
   ============================================================ */
LS.copyText = function (text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => LS.fallbackCopy(text));
  }
  return Promise.resolve(LS.fallbackCopy(text));
};

LS.fallbackCopy = function (text) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch { return false; }
};

LS.downloadFile = function (filename, content, mime) {
  const blob = new Blob([content], { type: mime || "application/x-pem-file" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
};

/* ============================================================
   CERT ID CACHE
   ============================================================ */
const CACHE_KEY = "ls_cert_ids_v1";
LS.getCachedCertIds = function () {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};
LS.cacheCertId = function (id) {
  if (!id) return;
  try {
    const ids = LS.getCachedCertIds();
    if (!ids.includes(id)) {
      ids.unshift(id);
      localStorage.setItem(CACHE_KEY, JSON.stringify(ids.slice(0, 50)));
    }
  } catch {}
};

/* ============================================================
   FORM VALIDATION
   ============================================================ */
LS.DOMAIN_RE =
  /^(?:\*\.)?(?!-)(?:[a-zA-Z0-9\u00a1-\uffff](?:[a-zA-Z0-9\u00a1-\uffff-]{0,61}[a-zA-Z0-9\u00a1-\uffff])?\.)+[a-zA-Z\u00a1-\uffff]{2,}$/;
LS.EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
LS.CERT_ID_RE = /^LS-[A-Fa-f0-9]{8}$/;
LS.CHALLENGE_ID_RE = /^CH-[A-Fa-f0-9]{12}$/;

LS.setFieldError = function (name, hasError) {
  const field = document.querySelector('[data-field="' + name + '"]');
  if (field) field.classList.toggle("invalid", !!hasError);
};
LS.clearFieldErrors = function () {
  LS.$$(".field").forEach((f) => f.classList.remove("invalid"));
};

/* ============================================================
   NAV / MENU / REVEAL
   ============================================================ */
LS.initMenu = function () {
  const menuBtn = document.getElementById("menu-btn");
  const navLinks = document.getElementById("nav-links");
  if (!menuBtn || !navLinks) return;
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (e) => {
    if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
      navLinks.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });
};

LS.initReveal = function () {
  const obs = ("IntersectionObserver" in window)
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      )
    : null;

  LS.$$(".grid-stagger").forEach((grid) => {
    Array.from(grid.children).forEach((child, i) => {
      child.style.transitionDelay = (i * 70) + "ms";
    });
  });

  LS.$$(".reveal").forEach((el) => {
    if (obs) obs.observe(el);
    else el.classList.add("visible");
  });
};

/* ============================================================
   OFFLINE DETECTION
   ============================================================ */
LS.initOffline = function () {
  window.addEventListener("offline", () => {
    LS.toast("You are offline. Some features may not work.", "err", 6000);
  });
  window.addEventListener("online", () => {
    LS.toast("Back online.", "ok", 2600);
  });
};

/* ============================================================
   BOOTSTRAP
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
  LS.injectIcons();
  LS.initMenu();
  LS.initReveal();
  LS.initOffline();

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Load the page-specific script if it exists
  const pageScript = document.body.dataset.page;
  if (pageScript && window["LS_" + pageScript]) {
    try { window["LS_" + pageScript](); } catch (e) { console.error(e); }
  }
});
