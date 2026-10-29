### CLI password output redaction

#### Feature/Change Name
CLI startup output no longer prints the configured password or embeds it in the tunnel URL.

#### Prerequisites/Setup
1. Project dependencies are installed.
2. CLI build is available from the current branch. Set `CODEX_HOME` to a disposable directory and use a fresh browser session.

#### Steps
1. Run `pnpm run build`, then `node scripts/test-cli-password.cjs` for automated CLI, HTTP, and WebSocket checks.
2. Start the CLI with a disposable password: `node dist-cli/index.js --no-tunnel --no-open --port 5998 --password TEST_SECRET_SHOULD_NOT_PRINT`.
3. Confirm startup output includes the local and network URLs.
4. Confirm startup output does not include `Password:` or `TEST_SECRET_SHOULD_NOT_PRINT`.
5. Stop the server and start without a password flag: `node dist-cli/index.js --no-tunnel --no-open --no-login --port 5998`. Confirm startup output does not print `Generated password file:`, no `codexui-password` file is created, and the app opens without sign-in.
6. Repeat with `--no-password` and confirm the same behavior. Restart with `--password TEST_SECRET_SHOULD_NOT_PRINT`; confirm localhost shows the login form and accepts the configured password.
7. If tunnel testing is available, start with tunnel enabled and confirm the printed tunnel URL and QR code do not include `/password=`.

#### Expected Results
- Password-protected startup still works.
- The password is not printed as a standalone line.
- Password protection is disabled by default; no password is generated or persisted.
- Tunnel output does not include an autologin URL containing the password.

#### Rollback/Cleanup
- Stop the disposable CLI process, remove the disposable `CODEX_HOME`, and clear browser cookies.

---
