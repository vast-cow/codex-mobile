# vast-cow import: be6b8c6..ba9d2c4

The source checkout imports the behavior changes in `./vast-cow` after `be6b8c6ec1b26e99723e592736329088161e79ba` through `ba9d2c4`. The destination started at `7b9a931` on `main`; work is on `integrate/vast-cow-since-be6b8c6`.

## Comparison and mapping

The source repository and the nested distribution repository have different histories and layouts. The distribution range contains 17 commits and 56 changed files (+76,045/-3,825 lines), mostly generated bundles and formatting. CLI source maps were used to recover TypeScript changes; normalized frontend bundle diffs were mapped back into the existing Vue components. Generated distribution files are rebuilt from this repository's sources.

| Distribution commit | Imported change / source adaptation |
| --- | --- |
| `95056c9` | Release behavior: thread goals and slash commands; remove GitHub/Firebase skills sync and Composio; Zen models/headers/raw Responses normalization; explicit custom-provider model discovery; thread-resume compatibility fallbacks. Existing sidebar project import behavior was already present. |
| `3450e56` | Remove README screenshots. |
| `bbe822c`, `2c5e580` | Compact Skills/Automations lightning buttons beside search, with accessible labels and active styling. |
| `7e98156` | Cloudflare tunnel off by default; explicit `--tunnel` still enables it. |
| `65b1a27` | Inherit Codex sandbox configuration; explicit CLI/environment overrides remain supported. Dev startup no longer forces danger-full-access. |
| `4b3eca7` | Remove automatic native PTY repair; expose `repair:pty`, retain optional node-pty and source build tools. |
| `7589344`, `a11fd78` | Distribution-only workflows were added and later removed upstream; no equivalent workflow exists in this source checkout, so no CI change is needed. |
| `6c4a385` | Separate Browse/Enter from Select; remove blur navigation. Add a separate action row and fix dark folder-row surfaces. |
| `6090b2e` | Remove hardcoded GitHub startup URL. |
| `c4875dd` | Remove new-chat Plugins/Apps announcement and its frontend preference requests. |
| `8838e5e`, `bba2bf4` | Document passwordless startup and local checkout launching, with the source build prerequisite. |
| `8ebad98` | Preserve Vite's minified/content-hashed assets; version the service worker cache from frontend contents and require HTTP revalidation. No parallel `dist-production` tree or formatter/minifier toolchain is needed. |
| `e31a1a2` | Provider-scoped capability catalogs; dynamic reasoning options; validate direct/queued collaboration efforts; absent metadata uses the model default. |
| `ba9d2c4` | Pack local builds into SHA-256-addressed npm cache tarballs so changed contents cannot reuse a stale directory snapshot. |

The destination package remains `codexapp` version `0.1.87`; the nested distribution's package identity/version and generated artifacts are not copied over. This is a source import, not an npm release. GitHub skill sync and Composio APIs/UI are intentionally removed; existing local skill files remain usable. The first-launch preference backend remains for compatibility, but the UI no longer requests it.

Additional integration safeguards include stale model/goal response guards, model pagination capped at 100 sequential pages, no capability reuse across providers with identical model IDs, and no configured-provider catalog leaking into a Codex thread. Existing directory-based model IDs continue to work when capability discovery fails.

## Verification

All commands below ran in the destination checkout using temporary Node 22.16.0 and pnpm tooling; existing `node_modules` was reused.

| Check | Result |
| --- | --- |
| `pnpm run test:unit` | 21 files / 165 tests passed. Includes supported-effort normalization and pagination, provider isolation, direct/queued payloads, resume fallbacks, goals RPCs, slash filtering, Zen payloads, sandbox inheritance, and snapshot invalidation/flag forwarding with mocked npm. |
| `pnpm run build` | Passed, including `vue-tsc --noEmit`, Vite and CLI bundling. The existing main-chunk warning above 500 kB remains. |
| `node -e "process.argv=['node','codexapp','--help']; require('./dist-cli/index.js')"` | Exit 0; CLI help includes tunnel default false and inherited sandbox. This CLI has no library-export contract. |
| `pnpm pack --pack-destination /tmp/vast-cow-import` | Produced `codexapp-0.1.87.tgz` with frontend, CLI, and the local snapshot launcher. |
| Service-worker cache smoke | Running the version script twice on identical copied fixtures kept the version; changing frontend content changed it. |
| `git diff --check` | Passed. |
| Playwright CJS flow | Passed with intercepted API/WebSocket fixtures and no page errors. Verified goal save/reload/clear, slash skills/plan/goal send, supported reasoning menu and absent-metadata payload, explicit folder browsing/selection, and retired integration requests absent. |

The browser flow ran against the current workspace server:

```bash
CODEX_HOME=/tmp/vast-cow-import/test-home pnpm run dev --host 127.0.0.1 --port 4173
```

Browser Use was not available. Playwright was also needed for deterministic API/WebSocket fixtures and page-context theme setup. Browser dependencies were unpacked under `/tmp`; no host package installation was required. The reproducible script is `output/playwright/vast-cow-import.cjs` and the result/request list is `output/playwright/vast-cow-verification.json`. Verification logs are `output/playwright/vast-cow-{baseline-build,build-final,unit-final,cjs-final,pack-final,browser-final}.log`.

Screenshots were captured after a 2.2-second settling interval. Their absolute base directory is `/root/Projects/20261029-fightjs-codex/output/playwright/`.

| URL | Viewport | Screenshot files | Result |
| --- | --- | --- | --- |
| `http://127.0.0.1:4173/#/thread/vast-import-thread` | 1440x1000 | `vast-cow-thread-light.png`, `vast-cow-thread-dark.png` | Paused goal remains after reload; visible goal/composer controls, correct dark surfaces. |
| `http://127.0.0.1:4173/#/` | 1440x1000 | `vast-cow-folder-dark.png` | Browse and Select are separate actions. |
| Same home URL | 375x812 | `vast-cow-folder-375-light.png`, `vast-cow-folder-375-dark.png` | Full-width path row; no light folder rows on the dark dialog. |
| Same home URL | 768x1024 | `vast-cow-folder-768-light.png`, `vast-cow-folder-768-dark.png` | Readable picker and separate navigation/selection actions. |

![Goal after refresh, light](../output/playwright/vast-cow-thread-light.png)
![Goal after refresh, dark](../output/playwright/vast-cow-thread-dark.png)
![Mobile folder picker, dark](../output/playwright/vast-cow-folder-375-dark.png)

## Performance audit

Build output from the same dependency tree provides the following size comparison. Frontend sizes are decimal kB reported by Vite; CLI sizes are reported by tsup. Sums use the rounded build rows.

| Output | Before | After |
| --- | ---: | ---: |
| All frontend JS chunks | 1,430.37 kB | 1,163.60 kB |
| All frontend JS chunks, gzip | 400.09 kB | 344.18 kB |
| DirectoryHub JS | 66.37 kB | 40.63 kB |
| Main JS | 514.47 kB | 519.70 kB |
| CLI JS | 584.57 KB | 530.84 KB |

Firebase chunks disappear. Goals and capability handling add a small amount to the main chunk; total frontend JS decreases by about 18.7%. Build wall time was not treated as a benchmark.

- Duplicate requests: removing startup GitHub sync/Firebase and Composio removes their network paths. Explicit Codex catalogs do not query the configured provider endpoint. A direct turn with loaded capabilities adds no model request (unit assertion); a queued turn reads config and matching-provider metadata sequentially. The browser scenario recorded two goal gets across initial load/reload, one set, one clear, four model lists across the full navigation sequence, and zero retired integration requests. These are whole-scenario counts, not claims of a duplicate-free live startup.
- Blocking work/fanout: slash search only filters local skill data and limits displayed rows to 20. Goal loading adds one asynchronous read on thread changes, without polling. Model pagination is sequential, deduplicated, and capped at 100 pages. Zen normalization scans the existing tool list and adds at most two entries; header generation uses 40 random bytes per request. No new network retry loops or per-keystroke network requests were added.
- Payloads: total mocked API response bytes were 6.77 kB for the browser scenario; this reflects fixtures, not real thread payload sizes. Model metadata is retained in one provider-scoped shallow catalog; no conversation history payload is enlarged.
- Filesystem/cache: the local launcher synchronously packs/hashes once at startup, outside HTTP request handling. Distinct content hashes retain distinct tarballs in npm's cache; growth tracks distinct launched builds and follows npm cache cleanup. The frontend build hashes files sequentially, writes a stable service-worker cache name, and HTTP static/SPA responses require revalidation. This trades revalidation requests for fresh content. Stale model responses and goal mutations are ignored after thread/provider changes.

## Limits and follow-up verification

Docker/OrbStack and a live Codex provider environment were unavailable. The required packaged Docker matrix (no-auth Zen fallback, malformed auth, invalid/expired auth persistence after reload, Zen-to-OpenRouter switching) was **not run**. There are no Docker test ports or live provider/config results to report; invalid-auth persistence and duplicate-live-overlay counts are unverified. No claim is made that mocked browser results establish live model availability or provider replies.

Published `npx @latest` / Oracle-host validation was not run; no package was published. Local launcher behavior was tested with mocked npm plus a real package-content check. HTTP cache headers were inspected in source, not through a packaged server. Live `profile:browser` / `profile:thread` traces and real request latency were not measured. The source UI server remains on port 4173; persistent port 5173 was not restarted.
