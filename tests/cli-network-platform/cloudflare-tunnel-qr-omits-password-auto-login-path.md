### Feature: Cloudflare tunnel QR omits password auto-login path

#### Prerequisites
- App is running from this repository with `--password TEST_SECRET` and a fresh browser session.
- Cloudflare tunnel startup is enabled (`--tunnel` or auto-enabled path).

#### Steps
1. Start CLI and wait for tunnel output.
2. Verify the printed `Tunnel:` URL does not include a `/password=` suffix.
3. Scan the terminal QR code from a phone/browser.
4. Confirm first page load shows the password form without a valid session cookie.
5. Sign in using the configured password `TEST_SECRET`.

#### Expected Results
- Tunnel URL shown in startup output does not expose the password.
- QR code encodes the base tunnel URL without a password-bearing path.
- The configured password allows sign-in.
- Base tunnel URL requires login without a valid session cookie.

#### Rollback/Cleanup
- Stop the CLI process.
- Clear cookies for the tunnel origin if needed.
