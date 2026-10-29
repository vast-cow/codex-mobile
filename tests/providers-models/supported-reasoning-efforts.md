### Feature: Provider-scoped supported reasoning efforts

#### Prerequisites
- Current app and deterministic `model/list` fixtures, or a provider exposing capability metadata.
- Model A supports low/high with default low; model B has no reasoning metadata. Configure an invalid saved effort such as xhigh.

#### Steps
1. Open a thread on the configured provider. Confirm A shows Low/High in server order and selects Low.
2. Select High, send a normal turn and a plan turn; inspect explicit effort and collaboration settings.
3. Choose B; confirm disabled **Model default**. Send and inspect that effort is omitted and collaboration reasoning is null.
4. Switch to a thread locked to another provider with the same model ID. Delay the previous model request and let it finish.
5. Confirm old capabilities never reappear. In particular, a Codex thread must not acquire the configured Zen model catalog.
6. Return a paginated catalog; verify all pages are read, repeated cursors stop, and IDs are deduplicated.
7. Queue a turn with an unsupported configured effort. Let the backend drain it and inspect its collaboration settings.
8. Fail capability discovery while retaining provider model IDs; confirm model selection still works with Model default.
9. Check menus in light and dark themes.

#### Expected Results
- Direct/queued turns use only supported reasoning values for a matching provider; missing capabilities use the server default.
- Direct submission with a loaded catalog adds no capability requests.
- Stale results are ignored; pagination is sequential and capped at 100 pages.

#### Rollback/Cleanup
- Restore provider/model settings, remove test queue items, and remove interception.
