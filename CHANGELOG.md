# Changelog

All notable changes to the **AI Agent Activity** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-03

### Added

- Initial release
- Discord Rich Presence integration via `@xhayper/discord-rpc`
- 25+ built-in rotating humorous messages for agent mode
- Time-of-day message pools (night, morning, afternoon)
- Template variables: `{agent}`, `{workspace}`, `{file}`, `{time}`
- Three detection strategies:
  - **Manual toggle** — status bar click or command palette
  - **Chat API** — auto-detect via `vscode.chat` / `vscode.lm` namespaces
  - **Edit heuristic** — detect rapid multi-line edits typical of AI agents
- Configurable agent timeout for auto-detection
- Status bar indicator (🧑 Human Mode / 🤖 AI Agent Active)
- Human mode presence options: none, simple, detailed
- Custom Discord Application ID support
- SVG art assets for Discord Rich Presence
