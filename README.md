<div align="center">

# 🤖 AI Agent Activity — Discord Rich Presence

**Show the world (on Discord) that an AI agent is coding for you.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.85%2B-blue.svg)](https://code.visualstudio.com/)
[![Version](https://img.shields.io/visual-studio-marketplace/v/RikoAppDev.ai-agent-activity-for-dc?color=green)](https://marketplace.visualstudio.com/items?itemName=RikoAppDev.ai-agent-activity-for-dc)

</div>

---

When an AI agent takes over your VS Code, this extension updates your Discord Rich Presence with custom, rotating, humorous messages — so your friends know **who's really writing the code**.

## ✨ Features

- **🤖 AI Agent Mode** — Custom Discord presence when AI is coding for you
- **🔄 Rotating Messages** — 25+ built-in messages that cycle on a timer
- **🕐 Time-of-Day Awareness** — Different messages for night owls, early birds, and lunch breaks
- **🎛️ Manual + Auto Detection** — Toggle via status bar or let the extension auto-detect agent activity
- **✏️ Fully Customizable** — Write your own messages with template variables (`{agent}`, `{workspace}`, `{file}`, `{time}`)
- **🧑 Human Mode** — Optional presence when you're coding yourself (or disable to let other extensions handle it)
- **⚡ Lightweight** — Minimal footprint, smart throttling, no performance impact

## 🚀 Quick Start

1. Install the extension
2. Make sure **Discord desktop** is running
3. Click the **🧑 Human Mode** button in the status bar to switch to **🤖 AI Agent Active**
4. Your Discord will show a rotating custom message!

> The extension also auto-detects agent activity via the VS Code Chat API and edit heuristics — no manual toggling required.

## 📝 Default Messages

The extension ships with fun defaults like:

- 😴 {agent} here! The human's offline, I've got the controls.
- ☁️ Hey, it's me {agent} 😎 — steering the ship while my human snoozes.
- 🛫 {agent} took the cockpit — human's dreaming in economy class.
- 👀 The human left me unsupervised. This should be interesting.
- 🧹 Cleaning up the human's mess... as usual.
- 📝 Dear diary, the human let me code again today. I'm thriving.

Plus time-of-day variants for night owls 🦉, early birds 🐓, and lunch breaks 🍔.

## 🎨 Custom Messages

Add your own messages in **Settings → Agent Activity → Messages**:

```json
"agentActivity.messages": [
  "🧙 {agent} casting code spells in {workspace}",
  "🎮 {agent} is speedrunning this codebase",
  "🌙 It's {time} and {agent} is still going strong"
]
```

### Template Variables

| Variable      | Description               | Example      |
| ------------- | ------------------------- | ------------ |
| `{agent}`     | Agent name (configurable) | `AI Agent`   |
| `{workspace}` | Current workspace name    | `my-project` |
| `{file}`      | Current file name         | `index.ts`   |
| `{time}`      | Current time (HH:MM)      | `23:45`      |

### Time-Based Messages

Override messages for specific hours of the day:

```json
"agentActivity.timeBasedMessages": {
  "22-06": ["🌙 Midnight coding session — {agent} never sleeps"],
  "06-10": ["☀️ Early bird {agent} already started the day"],
  "12-14": ["🍔 Lunch break? Not for {agent}"]
}
```

Keys are `HH-HH` ranges in 24-hour format. Overnight ranges (e.g., `22-06`) wrap correctly.

## 🔍 Detection Strategies

| Strategy | Description                                              |
| -------- | -------------------------------------------------------- |
| `manual` | Toggle via status bar click or command palette only      |
| `auto`   | Auto-detect via VS Code Chat API + rapid edit heuristics |
| `both`   | Use both manual and automatic detection **(default)**    |

**How auto-detection works:**

- **Chat API Strategy** — Hooks into `vscode.chat` and `vscode.lm` namespaces to detect when AI extensions are actively generating
- **Edit Heuristic Strategy** — Detects rapid multi-line edits (8+ edits in a 3-second window) typical of AI-generated code
- **Agent Timeout** — After the configured timeout (default: 2 min), AI agent mode automatically deactivates

## ⌨️ Commands

| Command                                | Description                     |
| -------------------------------------- | ------------------------------- |
| `AI Agent Activity: Toggle Agent Mode` | Switch between human/agent mode |
| `AI Agent Activity: Next Message`      | Skip to the next random message |
| `AI Agent Activity: Reconnect`         | Force reconnect to presence RPC |
| `AI Agent Activity: Open Settings`     | Jump to extension settings      |

## ⚙️ Settings

| Setting                                 | Default      | Description                                                     |
| --------------------------------------- | ------------ | --------------------------------------------------------------- |
| `agentActivity.enabled`                 | `true`       | Master on/off toggle                                            |
| `agentActivity.clientId`                | `""`         | Custom Application Client ID (empty = built-in)                 |
| `agentActivity.detectionStrategy`       | `"both"`     | Detection method: `manual`, `auto`, or `both`                   |
| `agentActivity.messages`                | `[]`         | Custom messages (empty = use built-in defaults)                 |
| `agentActivity.messageRotationInterval` | `300`        | Seconds between message rotations (min: 30)                     |
| `agentActivity.timeBasedMessages`       | `{}`         | Time-range → message arrays                                     |
| `agentActivity.agentTimeout`            | `120`        | Seconds of inactivity before auto-deactivation                  |
| `agentActivity.showStatusBar`           | `true`       | Show the mode indicator in the status bar                       |
| `agentActivity.humanModePresence`       | `"none"`     | What to show when human is coding: `none`, `simple`, `detailed` |
| `agentActivity.agentName`               | `"AI Agent"` | Name used in `{agent}` template variable                        |
| `agentActivity.showElapsedTime`         | `true`       | Show elapsed time in Discord presence                           |

## 🔧 Using Your Own Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** and give it a name
3. Copy the **Application ID** from the General Information page
4. In VS Code settings, set `agentActivity.clientId` to your Application ID
5. *(Optional)* Upload custom images under **Rich Presence → Art Assets** with these keys:
   - `agent_active` — Large image for agent mode
   - `vscode_icon` — Large image for human mode
   - `ai_sparkle` — Small image badge for agent mode
   - `human_icon` — Small image badge for human mode

## 🏗️ Project Structure

```
agent-activity/
├── src/
│   ├── extension.ts            # Entry point — wires all components
│   ├── config.ts               # Typed configuration reader
│   ├── constants.ts            # Discord Client ID, image keys, intervals
│   ├── detection/
│   │   ├── agentDetector.ts    # Unified detector combining strategies
│   │   └── strategies/
│   │       ├── manualToggle.ts     # Status bar click toggle
│   │       ├── chatApiStrategy.ts  # VS Code Chat/LM API detection
│   │       └── editHeuristic.ts    # Rapid edit pattern detection
│   ├── discord/
│   │   ├── rpcManager.ts       # Discord RPC connection lifecycle
│   │   └── activityBuilder.ts  # Activity payload construction
│   ├── messages/
│   │   ├── messageRotator.ts   # Message cycling with time awareness
│   │   └── defaultMessages.ts  # 25+ built-in messages
│   └── ui/
│       └── statusBar.ts        # Status bar indicator
├── assets/                     # Discord Rich Presence art assets (SVG)
├── package.json
├── tsconfig.json
└── LICENSE
```

## 🤝 Compatibility

- **Works alongside** other Discord Presence extensions — set `humanModePresence` to `"none"` to avoid conflicts
- **Requires** Discord desktop app running on the same machine
- **VS Code** 1.85.0 or newer

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/RikoAppDev/ai-agent-activity.git
cd ai-agent-activity

# Install dependencies
npm install

# Compile
npm run compile

# Watch mode (auto-recompile on changes)
npm run watch

# Launch Extension Development Host
# Press F5 in VS Code (uses .vscode/launch.json)
```

## 📄 License

This project is licensed under the MIT License.
