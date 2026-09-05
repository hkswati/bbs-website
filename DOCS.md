# Beyond Borders — Server & Site Documentation

Full reference for the infrastructure, code structure, and workflows behind `beyondborders.com.sa`.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Server Details](#2-server-details)
3. [DNS Records](#3-dns-records)
4. [SSL Certificates](#4-ssl-certificates)
5. [nginx Configuration](#5-nginx-configuration)
6. [Hugo Site (Main Site)](#6-hugo-site-main-site)
7. [Ghost CMS (Blog)](#7-ghost-cms-blog)
8. [Deployment Workflow](#8-deployment-workflow)
9. [Known Issues & Fixes](#9-known-issues--fixes)
10. [Adding a New Subdomain](#10-adding-a-new-subdomain)

---

## 1. Architecture Overview

```
Internet
   │
   ├── beyondborders.com.sa  ──► nginx ──► /var/www/beyondborders-static/   (Hugo static site)
   │
   └── blog.beyondborders.com.sa ──► nginx ──► Ghost on 127.0.0.1:2368     (Ghost CMS)
```

Both domains are served from a **single DigitalOcean droplet**. nginx handles all incoming traffic and routes based on domain name. Hugo and Ghost are completely independent — Hugo is purely static files, Ghost is a Node.js process running on port 2368.

---

## 2. Server Details

| Property | Value |
|----------|-------|
| Provider | DigitalOcean |
| OS | Ubuntu 24.04 LTS |
| Plan | Basic / 1 vCPU / 2 GB RAM / 25 GB Disk |
| IP | 165.232.66.134 |
| SSH user | `ghost-user` |
| Ghost user | `ghost-user` |

**Key directories on the server:**

| Path | Purpose |
|------|---------|
| `/var/www/beyondborders-static/` | Hugo built files served by nginx |
| `/var/www/beyondborders/` | Ghost CMS installation |
| `/var/www/beyondborders/content/` | Ghost content (images, themes, etc.) |
| `/var/www/beyondborders/system/nginx-root` | Webroot used by acme.sh for HTTP challenge renewal |
| `/etc/nginx/sites-available/` | nginx config files |
| `/etc/nginx/sites-enabled/` | Symlinks to active nginx configs |
| `/etc/nginx/snippets/ssl-params.conf` | Shared SSL parameters (TLS versions, ciphers) |
| `/etc/letsencrypt/` | SSL certs managed by acme.sh |

---

## 3. DNS Records

Registrar: **dnet.sa**

| Type | Name | Value |
|------|------|-------|
| A | `@` | `165.232.66.134` |
| A | `blog` | `165.232.66.134` |

`@` is the root domain (`beyondborders.com.sa`). Both point to the same droplet — nginx routes them to the correct service.

---

## 4. SSL Certificates

**Tool:** acme.sh (installed automatically by Ghost CLI — NOT certbot)

**Cert location:** `/etc/letsencrypt/beyondborders.com.sa/`

| File | Description |
|------|-------------|
| `fullchain.cer` | Full certificate chain (used in nginx `ssl_certificate`) |
| `beyondborders.com.sa.key` | Private key (used in nginx `ssl_certificate_key`) |

**Renewal:** Automatic via root cron job, runs daily at 21:18:
```
"/etc/letsencrypt"/acme.sh --cron --home "/etc/letsencrypt"
```

**HTTP challenge webroot** (used by acme.sh to prove domain ownership):
```
/var/www/beyondborders/system/nginx-root
```
This path is served by the HTTP nginx block for `beyondborders.com.sa` — do not remove it.

**Ghost's blog cert** (`blog.beyondborders.com.sa`) is provisioned and managed separately by Ghost CLI using the same acme.sh install. The cron job handles renewal for all certs under `/etc/letsencrypt/`.

---

## 5. nginx Configuration

### Main site config

**Source (in this repo):** `nginx/beyondborders.conf`
**Active location on server:** `/etc/nginx/sites-available/beyondborders.conf`
**Symlinked to:** `/etc/nginx/sites-enabled/beyondborders.conf`

The config has two server blocks:

**HTTP block** — redirects all traffic to HTTPS, and serves the acme.sh challenge path for cert renewal:
```nginx
server {
    listen 80;
    server_name beyondborders.com.sa www.beyondborders.com.sa;
    root /var/www/beyondborders/system/nginx-root;
    location ~ ^/.well-known/acme-challenge { allow all; }
    location / { return 301 https://beyondborders.com.sa$request_uri; }
}
```

**HTTPS block** — serves Hugo static files:
```nginx
server {
    listen 443 ssl http2;
    server_name beyondborders.com.sa www.beyondborders.com.sa;
    ssl_certificate     /etc/letsencrypt/beyondborders.com.sa/fullchain.cer;
    ssl_certificate_key /etc/letsencrypt/beyondborders.com.sa/beyondborders.com.sa.key;
    root /var/www/beyondborders-static;
    ...
}
```

### Blog config

Managed entirely by Ghost CLI. When `ghost setup ssl` is run from `/var/www/beyondborders/`, Ghost CLI generates:
- `/etc/nginx/sites-available/blog.beyondborders.com.sa.conf` (HTTP)
- `/etc/nginx/sites-available/blog.beyondborders.com.sa-ssl.conf` (HTTPS, proxies to port 2368)

Do not edit these manually — Ghost CLI owns them.

### Deploying nginx config changes

```bash
# Copy updated config to server
scp nginx/beyondborders.conf ghost-user@165.232.66.134:/tmp/
ssh ghost-user@165.232.66.134 "sudo cp /tmp/beyondborders.conf /etc/nginx/sites-available/beyondborders.conf"

# Test and reload
ssh ghost-user@165.232.66.134 "sudo nginx -t && sudo systemctl reload nginx"
```

---

## 6. Hugo Site (Main Site)

### Local dev environment

**Location (WSL):** `/home/hks/beyond-borders-website/`
**Hugo binary:** `./hugo` (v0.161.1, pre-built binary in project root — no installation needed)

```bash
# Build the site
./hugo -s site

# Local dev server with live reload
./hugo server -s site
```

Output goes to `site/public/`. The dev server does not write to disk.

### Project structure

```
beyond-borders-website/
├── hugo                          # Hugo binary
├── nginx/
│   └── beyondborders.conf        # nginx config for main site
├── memory/
│   └── nginx_crash_fix.md        # Fix for nginx boot crash after blog SSL setup
└── site/
    ├── hugo.toml                 # Site config, params, menus
    ├── content/                  # Page content (Markdown)
    │   ├── _index.md
    │   ├── about.md
    │   ├── contact.md
    │   └── services/
    │       ├── _index.md
    │       └── [service].md      # One file per service
    ├── data/
    │   └── services.yaml         # Service definitions (name, slug, icon, tagline, summary)
    ├── static/
    │   └── images/
    │       └── logo.png          # Gold calligraphic B logo (transparent bg) — also used as favicon
    └── themes/beyondborders/
        ├── layouts/
        │   ├── _default/
        │   │   └── baseof.html   # Base HTML shell (head + nav + main + footer + JS)
        │   ├── index.html        # Homepage template
        │   ├── about/single.html
        │   ├── contact/single.html
        │   ├── services/
        │   │   ├── list.html     # /services/ page
        │   │   └── single.html   # Individual service page
        │   └── partials/
        │       ├── head.html     # <head> tag (fonts, favicon, CSS link)
        │       ├── nav.html      # Site header and navigation
        │       └── footer.html   # Site footer
        └── static/
            ├── css/main.css      # All styles
            └── js/main.js        # Mobile nav, scroll shadow
```

### hugo.toml — key params

All contact details, URLs, and site metadata are centralised here. Edit this file to change anything site-wide:

```toml
baseURL = "https://beyondborders.com.sa/"
title = "Beyond Borders | Business Consultancy"

[params]
  blogURL      = "https://blog.beyondborders.com.sa"
  contactEmail = "mohsin@beyondborders.com.sa"
  phone        = "+966 55 583 7541"
  whatsappNumber = "966555837541"         # Used in wa.me link on Contact page
  address      = "20, 3rd Floor, Salah ud Din Ayubi Road..."
```

### Adding / editing services

Services are driven by `site/data/services.yaml`. Each entry:
```yaml
- name: Entity Setup
  slug: entity-setup
  icon: "🏢"
  tagline: Business formation & registration across the GCC
  summary: One-line summary shown on the /services/ listing page.
```

The corresponding content lives in `site/content/services/entity-setup.md`. Adding a new service requires both a YAML entry and a matching `.md` file.

### Fonts

Loaded from Google Fonts (defined in `partials/head.html`):
- **Outfit** — headings, nav, labels (weights 400–900)
- **Inter** — body text (weights 400–600)
- **Comfortaa** — logo wordmark only

### Mobile nav

Right-side slide-in drawer triggered by hamburger button (≤680px). Three files involved:
- `partials/nav.html` — drawer HTML (panel header with X button, backdrop div)
- `static/css/main.css` — drawer styles in the `@media (max-width: 680px)` block
- `static/js/main.js` — open/close logic, backdrop and X button handlers

**Important:** `backdrop-filter` is disabled on mobile in the CSS (`site-header { backdrop-filter: none }`). This is intentional — `backdrop-filter` makes the header the containing block for `position: fixed` children, which breaks the drawer positioning.

---

## 7. Ghost CMS (Blog)

### Installation

**Location on server:** `/var/www/beyondborders/`
**Version:** Ghost 6.22.1
**Node:** v22
**Database:** MySQL (`beyondborders_prod`)
**Process manager:** systemd (`ghost_beyondborders-com-sa.service`)
**Internal port:** 2368 (not exposed publicly — nginx proxies to it)

### Config file

`/var/www/beyondborders/config.production.json`

Key values:
```json
{
  "url": "https://blog.beyondborders.com.sa",
  "server": { "port": 2368, "host": "127.0.0.1" },
  "database": { "client": "mysql", ... },
  "mail": { "transport": "SMTP", ... },
  "security": { "staffDeviceVerification": true }
}
```

### Mail / Admin login

Ghost uses **magic link emails** for admin login (no password). `staffDeviceVerification: true` also requires email verification on each new device. Mail must be configured for login to work.

`"transport": "Direct"` (the default) does **not** work on DigitalOcean — outbound port 25 is blocked. Use SMTP:

```json
"mail": {
  "transport": "SMTP",
  "options": {
    "host": "smtp.gmail.com",
    "port": 465,
    "secure": true,
    "auth": {
      "user": "your@gmail.com",
      "pass": "your-app-password"
    }
  }
}
```

After editing config: `cd /var/www/beyondborders && ghost restart`

### Ghost CLI commands

All run from `/var/www/beyondborders/`:

```bash
ghost status          # Check if running
ghost restart         # Restart Ghost
ghost stop            # Stop Ghost
ghost start           # Start Ghost
ghost log             # View recent logs
ghost setup nginx     # Generate nginx config for current URL
ghost setup ssl       # Issue SSL cert via acme.sh and update nginx
```

### Admin panel

`https://blog.beyondborders.com.sa/ghost`

---

## 8. Deployment Workflow

### Hugo site

```bash
# 1. Make changes to files in site/
# 2. Build
./hugo -s site

# 3. Deploy to server
rsync -avz --delete /home/hks/beyond-borders-website/site/public/ ghost-user@165.232.66.134:/var/www/beyondborders-static/
```

Run both commands from `/home/hks/beyond-borders-website/` in WSL.

After rsync, **hard refresh** the browser (`Ctrl+Shift+R`) to bypass cached CSS/JS. On mobile Firefox, cached files require clearing via Settings → Delete browsing data → Cached images and files.

### nginx config

```bash
# Copy updated config to server then reload
scp nginx/beyondborders.conf ghost-user@165.232.66.134:/tmp/
ssh ghost-user@165.232.66.134 "sudo cp /tmp/beyondborders.conf /etc/nginx/sites-available/beyondborders.conf && sudo nginx -t && sudo systemctl reload nginx"
```

---

## 9. Known Issues & Fixes

### nginx boot crash after blog SSL setup

**Symptom:** nginx fails to start on reboot with a DNS resolution error related to `ap.ghost.org`.

**Cause:** Ghost's generated nginx config proxies to `ap.ghost.org`. nginx resolves this at startup before the network/DNS is ready.

**Fix:** See full instructions in `memory/nginx_crash_fix.md`. Apply all four fixes after running `ghost setup ssl`. Summary:
1. Add systemd override to make nginx wait for network
2. Enable `systemd-networkd-wait-online.service`
3. Add `resolver 8.8.8.8 8.8.4.4` to Ghost's blog nginx config
4. Add systemd override to make Ghost wait for network

### Browser cache mismatch after deploy

**Symptom:** After deploying, the site looks broken (elements visible that should be hidden, or styles not applied).

**Cause:** Browser serves cached CSS/JS against freshly deployed HTML.

**Fix:** Hard refresh — `Ctrl+Shift+R` on desktop. On mobile Firefox: Settings → Delete browsing data → Cached images and files.

---

## 10. Adding a New Subdomain (Hugo Site)

Example: `tech.beyondborders.com.sa`

**Step 1 — DNS (dnet.sa)**
Add A record: `tech` → `165.232.66.134`

**Step 2 — Server directory**
```bash
ssh ghost-user@165.232.66.134 "sudo mkdir -p /var/www/tech-static && sudo chown ghost-user:ghost-user /var/www/tech-static"
```

**Step 3 — nginx config (HTTP only first)**
Create `/etc/nginx/sites-available/tech.beyondborders.com.sa.conf`:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name tech.beyondborders.com.sa;
    root /var/www/tech-static;
    location ~ ^/.well-known/acme-challenge { allow all; }
    location / { return 301 https://tech.beyondborders.com.sa$request_uri; }
}
```
Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/tech.beyondborders.com.sa.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**Step 4 — Issue SSL cert** (after DNS has propagated)
```bash
sudo "/etc/letsencrypt"/acme.sh --issue \
  -d tech.beyondborders.com.sa \
  -w /var/www/tech-static \
  --home /etc/letsencrypt \
  --reloadcmd "systemctl reload nginx"
```

**Step 5 — Update nginx to HTTPS**
Add the HTTPS server block to the config (using the new cert paths), reload nginx.

**Step 6 — Deploy Hugo site**
Build locally and rsync to `/var/www/tech-static/`.
