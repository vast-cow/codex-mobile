# OpenCode Zen Public Client Headers

## Feature / Change

OpenCode Zen no-auth requests sent through the local Zen proxy include OpenCode-style public client headers so `muse-spark-1.3-contributor-free` requests do not hit the unauthenticated free usage limiter.

## Prerequisites / Setup

- Start the app with no Codex auth available so OpenCode Zen fallback is active.
- Confirm `config/read` reports `model_provider = "opencode_zen"` and `model = "muse-spark-1.3-contributor-free"`.

## Actions

1. Send `hi` from a new thread using the default `muse-spark-1.3-contributor-free` model.
2. Inspect the app response and server logs.
3. Optionally enable `CODEXUI_PROXY_DEBUG=1` and repeat if an upstream error occurs.

## Expected Result

- The assistant responds successfully.
- The upstream error is not `FreeUsageLimitError`.
- Zen uses `Accept: text/event-stream` and the imported `opencode/1.18.30` public client identity. Request/session IDs have a 12-character hexadecimal prefix and a 14-character alphanumeric suffix.
- Zen proxy requests include `Authorization: Bearer public`, `User-Agent: opencode/...`, and `X-Opencode-*` client/session/request headers when no user Zen key is configured.

## Performance / Risk Audit

- Historical live smoke results predate the imported header/model update. Re-run the live no-auth workflow before relying on them for the current provider.
- Code-path audit: the change adds one synchronous header-object callback per Zen upstream request plus two ID generations, each using `randomBytes(6)` and `randomBytes(14)`. It does not add network requests, retries, polling, cache reads/writes, or extra request fanout.
- Duplicate request risk: unchanged. The proxy still creates exactly one upstream request for each inbound proxy request.
- Blocking work risk: bounded to 40 random bytes and string formatting per Zen request; no filesystem, subprocess, or blocking network work was added.
- Large payload risk: unchanged. Only small static headers and two short IDs are added; request body construction is unchanged.
- Cache invalidation risk: none. The proxy path does not introduce or mutate caches.
- Current import verification covers payload normalization with unit tests. Live provider latency, no-auth replies, and Docker authentication cases were not measured in this environment.

## Rollback / Cleanup

- Stop the local app server.
- Remove any temporary no-auth `CODEX_HOME` used for the test.
