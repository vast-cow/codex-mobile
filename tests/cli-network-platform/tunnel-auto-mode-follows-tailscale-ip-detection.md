### Feature: Cloudflare tunnel is explicitly enabled

#### Prerequisites
- Build the current CLI. Test on a host with Tailscale and one without, when available.

#### Steps
1. Run `node dist-cli/index.js --port 4190 --no-open --no-login` without tunnel flags.
2. Confirm no cloudflared child is started, regardless of Tailscale detection.
3. Repeat with `--no-tunnel`; confirm the same result.
4. Run with `--tunnel`; confirm tunnel startup is attempted and the URL is printed when cloudflared succeeds.
5. Check startup output does not include a hardcoded GitHub repository link.

#### Expected Results
- Tunnel default is off. Tailscale address reporting still works independently.
- Only explicit `--tunnel` enables the tunnel.

#### Rollback/Cleanup
- Stop test CLI processes and verify their cloudflared children exit.
