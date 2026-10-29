### Feature: OpenCode Zen raw Responses normalization

#### Prerequisites
- Current app, a Zen-compatible model, and upstream request inspection or an intercepted upstream.

#### Steps
1. Select OpenCode Zen and Responses format; send a short message.
2. Inspect the upstream request: original Responses input remains intact; store is false, stream is true, and tool_choice is auto.
3. Send with no bash/read tools, then with existing definitions; confirm missing tools are added and existing definitions are not duplicated or overwritten.
4. Switch to Completions format and repeat; confirm the chat-completions path still operates.
5. Simulate an upstream error and verify it is surfaced to the user.

#### Expected Results
- Responses mode no longer converts the body into chat messages.
- Required tool entries are present with bounded overhead, while caller tool definitions remain intact.
- Completions behavior and upstream error visibility remain available.

#### Rollback/Cleanup
- Restore provider/format settings and remove upstream interception.
