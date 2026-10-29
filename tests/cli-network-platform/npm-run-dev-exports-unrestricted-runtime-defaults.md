### Feature: Dev startup inherits the Codex sandbox

#### Prerequisites
- Node/pnpm and dependencies available; unset `CODEXUI_SANDBOX_MODE` and `CODEXUI_APPROVAL_POLICY` in the test process.

#### Steps
1. Run `pnpm run dev --host 127.0.0.1 --port 4173` from the current checkout.
2. Inspect the Vite process environment: sandbox is unset and approval policy is never.
3. In a separate disposable test process, launch with `CODEXUI_SANDBOX_MODE=workspace-write CODEXUI_APPROVAL_POLICY=on-request pnpm run dev --host 127.0.0.1 --port 4174`.
4. Inspect that process's environment and spawned app-server arguments.

#### Expected Results
- Dev startup no longer injects danger-full-access.
- Explicit environment settings remain effective.

#### Rollback/Cleanup
- Stop the disposable 4174 process and remove overrides. Do not stop persistent 5173 or shared 4173 servers.
