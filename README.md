# :fire: codexapp

### :rocket: Run Codex App UI Anywhere: Linux, Windows, or Termux on Android :rocket:

[![platform](https://img.shields.io/badge/Platform-Linux%20%7C%20Windows%20%7C%20Android-blue?style=for-the-badge)](#-quick-start)
[![node](https://img.shields.io/badge/Node-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![license](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

> **Codex UI in your browser. No drama. One command.**
>  
> **Yes, that is your Codex desktop app experience exposed over web UI. Yes, it runs cross-platform.**

```text
 ██████╗ ██████╗ ██████╗ ███████╗██╗  ██╗██╗   ██╗██╗
██╔════╝██╔═══██╗██╔══██╗██╔════╝╚██╗██╔╝██║   ██║██║
██║     ██║   ██║██║  ██║█████╗   ╚███╔╝ ██║   ██║██║
██║     ██║   ██║██║  ██║██╔══╝   ██╔██╗ ██║   ██║██║
╚██████╗╚██████╔╝██████╔╝███████╗██╔╝ ██╗╚██████╔╝██║
 ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝
```

---

## :exploding_head: What Is This?
**`codexapp`** is a lightweight bridge that gives you a browser-accessible UI for Codex app-server workflows.

You run one command. It starts a local web server. You open it from your machine, your LAN, or wherever your setup allows.  

**TL;DR :brain:: Codex app UI, unlocked for Linux, Windows, and Termux-powered Android setups.**

---

## :zap: Quick Start
> **The main event.**

### Run the development branch from source

To run this repository's development version, clone the `devel` branch and start the Vite development server:

```bash
git clone -b devel https://github.com/vast-cow/codex-mobile.git
cd codex-mobile
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) on the same computer. To connect from a phone on the same Wi-Fi network, use the computer's LAN IP address with port `5173` (for example, `http://192.168.1.100:5173`). Allow the connection through the computer's firewall if needed.

To run the built app as a Node.js server instead, build the project and start its CLI entry point:

```bash
pnpm install
pnpm run build
node dist-cli/index.js --no-open --no-tunnel
```

Password protection is disabled by default (`--no-password`). To require sign-in, add `--password <pass>`; the password is required for every connection, including localhost and Tailscale.

Use the URL printed in the terminal. Install and log in to Codex CLI (`npm install -g @openai/codex`, then `codex login`) if you want Codex features.

---

## :sparkles: Features
> **The payload.**

- :rocket: One-command launch with `npx codexapp`
- :earth_americas: Cross-platform support for Linux, Windows, and Termux on Android
- :desktop_computer: Browser-first Codex UI flow on `http://localhost:5900`
- :globe_with_meridians: LAN-friendly access from other devices on the same network
- :test_tube: Remote/headless-friendly setup for server-based Codex usage
- :electric_plug: Works with reverse proxies and tunneling setups
- :zap: No global install required for quick experimentation
- :studio_microphone: Built-in hold-to-dictate voice input with transcription to composer draft
- :robot: Optional Telegram bot bridge: send messages to bot, forward into mapped thread, send assistant reply back to Telegram
- :floppy_disk: Project portability: export a project as a ZIP from project or thread menus, including matching Codex chat JSONL history under `.codex-project/chats/`
- :package: Project import: restore exported project ZIPs from the browser via `Import Project`
- :repeat: Imported chats are rewritten for the destination `CODEX_HOME`, project path, and currently selected provider/model so they can be resumed in the new environment
- :gear: Project ZIP performance: exports stream ZIP bytes with response backpressure handling and skip generated/git-ignored folders; imports still buffer the selected ZIP once because the browser upload arrives as a single file

### Telegram Bot Bridge (Optional)

Set these environment variables before starting `codexapp`:

```bash
export TELEGRAM_BOT_TOKEN="<your-telegram-bot-token>"
export TELEGRAM_ALLOWED_USER_IDS="<your-telegram-user-id>,<optional-second-id>"
export TELEGRAM_DEFAULT_CWD="$PWD" # optional, defaults to current working directory
npx codexapp
```

`TELEGRAM_ALLOWED_USER_IDS` is required for safe access. Only allowlisted Telegram user IDs can use the bridge. If no allowed user IDs are configured, incoming Telegram messages are rejected.

To find your Telegram user ID:

1. Send a message to your bot.
2. Run `curl "https://api.telegram.org/bot<your-telegram-bot-token>/getUpdates"`.
3. Read `message.from.id` from the returned update payload.

Bot commands:

- `/start` show quick help and thread picker
- `/threads` list recent threads and pick one
- `/newthread` create and map a new Codex thread for this Telegram chat
- `/thread <threadId>` map current Telegram chat to an existing thread
- `/current` show currently connected thread for this chat
- `/history` show recent history for current thread
- `/status` show bridge/mapping status
- `/whoami` show your Telegram user/chat IDs and authorization state
- `/help` show command reference

Outgoing assistant messages are sent with Telegram `parse_mode=HTML` for formatting, with automatic plain-text fallback if HTML delivery fails.

---

## :jigsaw: Recent Product Features (from main commits)
> **Not just launch. Actual UX upgrades.**

- :card_index_dividers: Searchable project picker in new-thread flow
- :heavy_plus_sign: "Create Project" button next to "Select folder" with browser prompt
- :pushpin: New projects get pinned to top automatically
- :brain: Smart default new-project name suggestion via server-side free-directory scan (`New Project (N)`)
- :arrows_counterclockwise: Project order persisted globally to workspace roots state
- :thread: Optimistic in-progress threads preserved during refresh/poll cycles
- :iphone: Mobile drawer sidebar in desktop layout (teleported overlay + swipe-friendly structure)
- :control_knobs: Skills Hub mobile-friendly spacing/toolbar layout improvements
- :window: Skill detail modal tuned for mobile sheet-style behavior
- :test_tube: Skills Hub event typing fix for `SkillCard` select emit compatibility
- :studio_microphone: Voice dictation flow in composer (`hold to dictate` -> transcribe -> append text)

---

## :earth_americas: What Can You Do With This?

| :fire: Use Case | :boom: What You Get |
|---|---|
| :computer: Linux workstation | Run Codex UI in browser without depending on desktop shell |
| :window: Windows machine | Launch web UI and access from Chrome/Edge quickly |
| :iphone: Termux on Android | Start service in Termux and control from mobile browser |
| :test_tube: Remote dev box | Keep Codex process on server, view UI from client device |
| :globe_with_meridians: LAN sharing | Open UI from another device on same network |
| :toolbox: Headless workflows | Keep terminal + browser split for productivity |
| :electric_plug: Custom routing | Put behind reverse proxy/tunnel if needed |
| :zap: Fast experiments | `npx` run without full global setup |

---

## :building_construction: Architecture

```text
┌─────────────────────────────┐
│  Browser (Desktop/Mobile)   │
└──────────────┬──────────────┘
               │ HTTP/WebSocket
┌──────────────▼──────────────┐
│         codexapp            │
│  (Express + Vue UI bridge)  │
└──────────────┬──────────────┘
               │ RPC/Bridge calls
┌──────────────▼──────────────┐
│      Codex App Server       │
└─────────────────────────────┘
```

---

## :dart: Requirements
- :white_check_mark: Node.js `18+`
- :white_check_mark: Codex app-server environment available
- :white_check_mark: Browser access to host/port
- :white_check_mark: Microphone permission (only for voice dictation)

---

## :bug: Troubleshooting

| :x: Problem | :white_check_mark: Fix |
|---|---|
| Port already in use | Run on a free port or stop old process |
| `npx` fails | Update npm/node, then retry |
| Termux install fails | `pkg update && pkg upgrade` then reinstall `nodejs` |
| Can’t open from other device | Check firewall, bind address, and LAN routing |

---

## :handshake: Contributing
Issues and PRs are welcome.  
Bring bug reports, platform notes, and setup improvements.

---

## :star: Star This Repo
If you believe Codex UI should be accessible from **any machine, any OS, any screen**, star this project and share it. :star:

<div align="center">
Built for speed, portability, and a little bit of chaos :smirk:
</div>

---
