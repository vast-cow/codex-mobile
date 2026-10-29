### Feature: Local skills and compact directory navigation

#### Prerequisites
- Current app, one installed local skill, and access to browser request inspection.

#### Steps
1. Open the sidebar in light and dark themes. Locate the lightning icon buttons by their Skills and Automations labels/tooltips.
2. Open Skills, Automations, then Apps/Plugins/MCP; confirm each destination is reachable.
3. Inspect Skills Hub: local installed skills and discovery remain available, and there is no GitHub Skills Sync panel.
4. Inspect the directory: there is no Composio tab or login/link action.
5. Reload, change routes, and confirm no `skills-sync` or Composio API requests occur.
6. Open a new chat; confirm the first-launch Plugins/Apps announcement is absent.

#### Expected Results
- Compact icon controls have accessible names and show the active route.
- Local skills, prompts, Apps, Plugins, and MCP continue working.
- GitHub/Firebase skill sync and Composio integration are retired, matching the imported distribution.

#### Rollback/Cleanup
- Remove only temporary test skills/plugins, if installed. Existing user skill directories are retained.
