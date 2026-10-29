### Feature: Content-addressed local snapshots and frontend caches

#### Prerequisites
- Node/npm/pnpm available; build the current source checkout.
- For published npx validation, follow AGENTS.md: publish first and run the published latest package on Oracle.

#### Steps
1. Run `pnpm run test:unit -- src/cli/runLocal.test.ts`; verify snapshot reuse, changed-content invalidation, and flag forwarding with mocked npm.
2. Run `pnpm pack --pack-destination /tmp`; inspect that the tarball contains dist, dist-cli, and scripts/run-local.cjs.
3. Run `node -e "process.argv=['node','codexapp','--help']; require('./dist-cli/index.js')"` and confirm help exits zero.
4. On a designated local-launch test host, run `npm start -- --port 4190 --no-password --no-open --no-tunnel --no-login`. Record the printed package revision; stop and repeat with identical contents.
5. Change a visible source string, rebuild, and repeat. Confirm a different revision and the new browser content after reload.
6. Build twice without changes; compare the service worker CACHE_NAME. Change frontend content and rebuild; confirm the cache version changes.
7. Inspect GET /, a static JS asset, and a SPA fallback response; each requires HTTP revalidation with `Cache-Control: no-cache`.
8. Inspect package.json: no automatic PTY postinstall hook. If the optional native terminal binding needs repair, run `npm run repair:pty` explicitly.

#### Expected Results
- Identical packed contents reuse the snapshot path; changed contents cannot reuse a stale directory snapshot.
- Vite serves minified assets with content-based names; changed contents invalidate the service worker cache.
- The source checkout must be built before starting a package snapshot.

#### Rollback/Cleanup
- Revert the temporary source string, rebuild, stop only test servers, and delete test tarballs if desired.
