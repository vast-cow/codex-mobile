### Feature: Configured passwords are required on local, Tailscale, and reverse tunnel connections

#### Prerequisites
- Build the current CLI and run `CODEX_HOME=<disposable-dir> node dist-cli/index.js --password TEST_SECRET --no-open --no-login --port 5900`. Use fresh browser sessions.
- One direct local browser session (`localhost`).
- One reverse tunnel path (for example SSH/Cloudflare forwarding) that reaches the same server.
- Optional Tailscale client in `100.64.0.0/10` or `fd7a:115c:a1e0::/48`.

#### Steps
1. Open app via `http://localhost:<port>` and confirm the login page is shown. Repeat with `127.0.0.1` and `[::1]` when IPv6 is available.
2. Open app via reverse-tunnel URL and confirm login page is shown.
3. Enter correct password in reverse-tunnel URL and confirm session cookie allows access.
4. Sign in locally with `TEST_SECRET`, reload, and confirm the authenticated session persists.
5. (Optional) Open app via Tailscale IP and confirm the login page is shown.

#### Expected Results
- Local loopback access requires sign-in.
- Reverse-tunnel access does not bypass auth and requires password.
- Valid login on reverse-tunnel path creates session and grants access.
- Tailscale connections require sign-in.
- WebSocket upgrades to `/codex-api/ws` require a valid session cookie from every address.

#### Rollback/Cleanup
- Clear browser cookies for the app origin(s).
- Stop the CLI process and remove the disposable `CODEX_HOME`.
