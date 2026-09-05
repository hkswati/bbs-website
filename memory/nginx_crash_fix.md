---
name: nginx crash fix for blog subdomain
description: Fix for nginx crashing at boot due to ap.ghost.org DNS resolution failure — apply after ghost setup ssl creates blog subdomain configs
type: project
---

Ghost's nginx configs proxy to `ap.ghost.org` (Ghost's analytics/ActivityPub endpoint). nginx tries to resolve this at startup before DNS is available, causing a boot crash. This happened twice on the droplet in April 2026.

**This does not affect our Hugo site nginx config** — only Ghost CLI's blog subdomain config will have this issue once generated.

**Apply these fixes after running `ghost setup ssl` for blog.beyondborders.com.sa:**

**Why:** nginx starts before DNS is fully available on boot (systemd ordering issue on Ubuntu).

**Fix 1 — Make nginx wait for DNS (systemd override):**
```bash
sudo systemctl edit nginx
```
Add:
```ini
[Unit]
After=network-online.target nss-lookup.target
Wants=network-online.target

[Service]
Restart=on-failure
RestartSec=5s
```

**Fix 2 — Enable network-online target:**
```bash
sudo systemctl enable systemd-networkd-wait-online.service
# or if using NetworkManager:
sudo systemctl enable NetworkManager-wait-online.service
```

**Fix 3 — Add resolver directive to Ghost's blog nginx config:**
Add inside the server block of Ghost CLI's generated blog nginx config:
```nginx
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 10s;
```
This makes nginx resolve `ap.ghost.org` dynamically at request time rather than only at startup.

**Fix 4 — Ghost systemd ordering:**
```bash
sudo systemctl edit ghost_beyondborders-com-sa
```
Add:
```ini
[Unit]
After=network-online.target
```

After all changes:
```bash
sudo systemctl daemon-reload
sudo systemctl restart nginx
```
