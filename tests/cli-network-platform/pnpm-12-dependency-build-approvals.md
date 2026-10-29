# pnpm 12 dependency build approvals

## Prerequisites / setup

- Use a fresh clone with no `node_modules`, Node.js 22, and pnpm 12.16.1
  (`npm install -g pnpm@12.16.1`). Verify `node --version` and `pnpm --version`.
- On Linux, install Python 3, make, and a C++ compiler for `node-pty` when no
  native prebuild is available. Do not inherit `npm_config_node_gyp` from another
  installation.
- Use an empty disposable store for the first install so cached build artifacts
  cannot mask missing approval. Do not run `pnpm approve-builds`.

## Actions and expected results

1. Run `pnpm install --store-dir /tmp/codexapp-pnpm12-clean-store` (choose a new
   directory for each run). Expect exit 0, successful lifecycle scripts for both
   locked `esbuild` versions and `node-pty`, no ignored-build error, and no warning
   about the `pnpm` field in `package.json` or ignored `.npmrc` settings.
2. Run `CI=true pnpm install --frozen-lockfile --store-dir /tmp/codexapp-pnpm12-clean-store`.
   Expect exit 0 without prompts or lockfile changes. `pnpm permissions list`
   should show `esbuild` and `node-pty` approved and no packages awaiting approval.
3. Run `pnpm run build` and `pnpm run test:unit`. Expect both commands to pass;
   record any unrelated failures separately with their exact diagnostics.
4. Verify the CJS dependency exports and actual native PTY operation:

   ```bash
   node -e 'const assert = require("node:assert/strict"); for (const version of ["0.25.12", "0.27.7"]) { const esbuild = require("./node_modules/.pnpm/esbuild@" + version + "/node_modules/esbuild"); assert.equal(typeof esbuild.buildSync, "function"); assert.match(esbuild.transformSync("const n: number = 1", { loader: "ts" }).code, /const n = 1/); console.log("esbuild", esbuild.version, "OK"); }'
   node -e 'const assert = require("node:assert/strict"); const pty = require("node-pty"); assert.equal(typeof pty.spawn, "function"); const child = pty.spawn("/bin/sh", ["-c", "printf pnpm12-pty-ok"], { cols: 80, rows: 24 }); let output = ""; const timer = setTimeout(() => { child.kill(); process.exit(1); }, 5000); child.onData(data => output += data); child.onExit(({ exitCode }) => { clearTimeout(timer); assert.equal(exitCode, 0); assert.match(output, /pnpm12-pty-ok/); console.log("node-pty spawn OK"); });'
   ```

5. Review `publish-android.sh` to confirm its npm publishing and optional-PTY
   removal remain unchanged; do not publish as part of this test. The frontend
   and CLI build commands are covered by step 3.

## Approval review

- `esbuild@0.25.12` and `esbuild@0.27.7`: `node install.js` installs/validates the
  platform binary used by Vite and tsup. Keep approval.
- `node-pty@1.1.0`: `node scripts/prebuild.js || node-gyp rebuild` selects/builds
  the native binding; `node scripts/post-install.js` cleans build output and
  installs Windows support files. Keep approval even though it is optional.
- `protobufjs`: absent from the manifest and lockfile, so no lifecycle script
  runs in this graph. Remove its obsolete approval and review again if added.
- `@firebase/util`: also absent; remove the stale placeholder rather than
  granting permission to an unused package.
- Use `allowBuilds` because this repository has no `permissions` configuration.
  Leave strict dependency-build enforcement enabled and preserve the existing
  `sideEffectsCache: false` / `packageImportMethod: copy` policy in workspace YAML.

## Rollback / cleanup

Remove only the disposable clone and store created for this test. Keep generated
build output out of Git. Roll back the configuration and lockfile together if
reverting this change.
