### Feature: Inherit Codex sandbox configuration

#### Prerequisites
- Build the current checkout. Use a disposable `CODEX_HOME` whose config sets `sandbox_mode = "read-only"`.
- Unset `CODEXUI_SANDBOX_MODE` and `CODEXUI_APPROVAL_POLICY` in the test process.

#### Steps
1. Run `node dist-cli/index.js --port 4190 --no-password --no-open --no-tunnel --no-login` with the disposable home.
2. Confirm startup reports `Codex configuration (inherited)` for sandbox and `never` for approval policy.
3. Inspect spawned app-server arguments: no `sandbox_mode` override should be present; verify the configured read-only behavior.
4. Restart with `CODEXUI_SANDBOX_MODE=workspace-write`; confirm the explicit sandbox override is forwarded.
5. Restart with that environment plus `--sandbox-mode danger-full-access --approval-policy on-request`; confirm CLI flags win.
6. Trigger an account/quota request using a temporary app server; confirm it receives the same effective overrides.

#### Expected Results
- An unset sandbox preserves Codex configuration. Approval remains never unless explicitly overridden.
- Both persistent and temporary app servers receive explicit overrides consistently.

#### Rollback/Cleanup
- Stop only test processes; remove the disposable home and test environment overrides.
