### Feature: Thread goals and slash commands

#### Prerequisites
- Current app on `http://127.0.0.1:4173`; a disposable thread and an enabled local skill.
- A Codex app server supporting `thread/goal/get`, `thread/goal/set`, and `thread/goal/clear`, or deterministic RPC fixtures.

#### Steps
1. Type `/` and inspect commands and skills. Filter by a skill name, navigate with arrow keys, and select with Enter or Tab.
2. Confirm the skill appears as an attachment; Escape dismisses suggestions without sending.
3. Select `/plan`; confirm the Plan chip appears. Toggle it off, then select `/goal` in a thread with no goal.
4. Type a unique test objective and send. Inspect `turn/start` input for the `/goal ` prefix.
5. With a goal returned by the server, click Edit, change its objective and status to paused, and save.
6. Reload the page; confirm the saved objective/status remain. Select `/goal` again; confirm it opens the editor.
7. Switch threads while a goal request is delayed; confirm it cannot replace the new thread's goal.
8. Clear the goal. Check card, editor, and suggestions in both themes, including a 375x812 viewport.
9. Test with unsupported goal RPCs; ordinary chat remains usable.

#### Expected Results
- Suggestions include only enabled skills, at most 20 entries, without network searches per keystroke.
- Plan and new-goal modes are mutually exclusive; changing threads clears transient goal mode.
- Save/clear affect only the selected thread. Errors remain visible in the editor.
- IME composition Enter does not select a command or send a message.

#### Rollback/Cleanup
- Delete the disposable goal/thread and restore any fixture or network interception.
