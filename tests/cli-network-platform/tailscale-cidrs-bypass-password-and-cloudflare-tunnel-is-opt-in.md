### Feature: Tailscale requires configured passwords and Cloudflare tunnel is opt-in

#### Prerequisites
- Build the current repository with `pnpm run build`. Use a disposable `CODEX_HOME` and fresh browser sessions.
- A Tailscale client can reach the host over Tailscale IPv4 (`100.64.0.0/10`) or IPv6 (`fd7a:115c:a1e0::/48`).
- `cloudflared` is installed only if testing `--tunnel`.

#### Steps
1. Start CLI without tunnel flag: `node dist-cli/index.js --port 5900`.
2. From a Tailscale client, open `http://100.x.x.x:5900` using a host address in `100.64.0.0/10` (replace with host tailnet IP).
3. Confirm the app opens directly without the password login page.
4. (Optional IPv6 check) Open the same service using the host Tailscale IPv6 address in `fd7a:115c:a1e0::/48` and confirm it also opens without sign-in by default.
5. Restart with `--password TEST_SECRET --no-open --no-login --port 5900`. Clear cookies and confirm both Tailscale IPv4 and IPv6 access show the login form. Enter `TEST_SECRET`, confirm access, and reload to verify the session persists.
6. Stop the server and start again with tunnel enabled: `node dist-cli/index.js --port 5900 --tunnel`.
7. Confirm startup output now includes a `Tunnel:` URL only when `--tunnel` is provided.
8. Stop and restart once more without `--tunnel`, and verify no tunnel URL is printed.

#### Expected Results
- Password protection is off by default for all connections.
- When `--password` is configured, Tailscale IPv4 and IPv6 require sign-in like every other address.
- Cloudflare tunnel does not start by default.
- Cloudflare tunnel starts only when `--tunnel` is explicitly passed.

#### Rollback/Cleanup
- Stop the CLI process, remove the disposable `CODEX_HOME`, and clear browser cookies.
- If a cloudflared tunnel was started, ensure the tunnel child process has exited.
