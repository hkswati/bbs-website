---
name: Beyond Borders website progress
description: What has been completed and what remains to do
type: project
---

Hugo site is live at beyondborders.com.sa. All service pages have real content.

**Completed:**
- Hugo project at `/home/hks/beyond-borders-website/site/`
- Custom theme `beyondborders` with full CSS design system (Gold & Charcoal, Astral-inspired)
- All 10 service pages have real, KSA-specific content (drawn from live Ghost site and improved)
- Logo PNG (transparent bg) at `site/static/images/logo.png` — used in nav and as favicon
- Nav updated: gold B logo image + "Beyond Borders" in Comfortaa font
- Contact page: form replaced with WhatsApp CTA card; address, email, phone all from hugo.toml
- All contact details (email, phone, WhatsApp, address) centralised in `hugo.toml` params
- nginx config at `nginx/beyondborders.conf` — deployed and active on droplet
- Hugo static files deployed to `/var/www/beyondborders-static/` on droplet
- Ghost CLI's main-domain nginx configs removed; our config serving Hugo on beyondborders.com.sa
- SSL working via existing acme.sh cert

**Remaining — blog subdomain setup (do in this order):**
1. Add `blog` A record at domain registrar pointing to droplet IP
2. Update Ghost's `config.production.json` — change `url` from `https://beyondborders.com.sa` to `https://blog.beyondborders.com.sa`
3. Restart Ghost: `ghost restart` from `/var/www/beyondborders/`
4. Once DNS propagates, run `ghost setup ssl` from `/var/www/beyondborders/` — Ghost CLI will provision cert for blog subdomain and generate its own nginx configs
5. After `ghost setup ssl`, apply the nginx crash fix to Ghost's new blog nginx config (see nginx-crash-fix memory)

**Remaining — other:**
- Adapt Ghost blog theme to visually match the main site (same fonts, gold accent, nav style)
- Font identification for "Beyond Borders" brand typography (distinctive rounded sans-serif in bb-name.jpeg) — designer would know the name; WhatTheFont can identify it
- Phase 1 rsync command for future deploys: `rsync -avz --delete /home/hks/beyond-borders-website/site/public/ ghost-user@DROPLET_IP:/var/www/beyondborders-static/`
