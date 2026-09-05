---
name: Beyond Borders website stack
description: Tech stack, hosting, and architecture decisions for the Beyond Borders consultancy site
type: project
---

Main site is Hugo (static) served from a DigitalOcean droplet via nginx. Ghost CMS (self-hosted, same droplet) will move to blog.beyondborders.com.sa as a reverse-proxied subdomain once DNS is set up.

**Why:** Ghost's London theme was inadequate for a multi-page consultancy site; hybrid approach gives flexibility without losing the blog.

**Server:** Ubuntu 24.04, Basic / 1 vCPU / 2 GB RAM / 25 GB Disk. User: `ghost-user`.

**Hugo:** Binary at `/home/hks/beyond-borders-website/hugo` (v0.161.1). Site source at `site/`. Build with `./hugo -s site` from project root. Output goes to `site/public/`. Deploy by rsyncing `site/public/` to `/var/www/beyondborders-static/` on the droplet.

**Ghost:** Installed at `/var/www/beyondborders/` on the droplet. Running via systemd (`ghost_beyondborders-com-sa.service`) on port 2368. Ghost version 6.22.1, Node v22. Currently configured with URL `https://beyondborders.com.sa` — needs to change to `https://blog.beyondborders.com.sa` before blog setup.

**SSL:** Managed by acme.sh (installed by Ghost CLI, not certbot). Certs at `/etc/letsencrypt/beyondborders.com.sa/`. Cron job runs daily at 21:18 as root: `"/etc/letsencrypt"/acme.sh --cron --home "/etc/letsencrypt"`. Handles all certs under that acme.sh install — not domain-specific.

**nginx:** Our config at `nginx/beyondborders.conf` — currently active on the droplet serving the Hugo site. Ghost CLI's old main-domain configs (`beyondborders.com.sa.conf` + `beyondborders.com.sa-ssl.conf`) have been removed from sites-enabled. Ghost CLI will generate its own new nginx configs for `blog.beyondborders.com.sa` when `ghost setup ssl` is run. SSL params at `/etc/nginx/snippets/ssl-params.conf`.

**acme.sh webroot:** `/var/www/beyondborders/system/nginx-root` — kept in our nginx HTTP block for cert renewal.
