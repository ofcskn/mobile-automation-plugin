# Contributing to automobileapp

Thank you for taking the time to contribute! This document covers how to report issues, propose changes, and submit pull requests.

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating you agree to abide by its terms.

---

## Ways to Contribute

- **Bug reports** — file an issue describing steps to reproduce, expected behaviour, and actual behaviour.
- **Feature requests** — open an issue and label it `enhancement`. Check the [Roadmap](docs/ROADMAP.md) first to see if work is already planned.
- **Platform support** — Flutter, Swift Package Manager, Kotlin Multiplatform, and Capacitor are in the roadmap. Pull requests for these are especially welcome.
- **Documentation improvements** — fixing typos, adding examples, translating docs.
- **New skills or commands** — see the plugin structure overview in `docs/README.md`.

---

## Getting Started

### Prerequisites

- [Claude Code](https://claude.ai/code) installed and authenticated
- Node.js 18+
- (Optional) Expo CLI / EAS CLI for end-to-end testing

### Run the plugin locally

```bash
git clone https://github.com/ofcskn/mobile-automation-plugin
cd mobile-automation-plugin
claude --plugin-dir .
```

Use `/msd-status` to verify the plugin loads correctly with the bundled `testapp` fixture.

### Run validation scripts

```bash
node skills/managing-store-metadata/scripts/validate-metadata.js testapp
node skills/managing-app-localizations/scripts/validate-translations.js testapp
node skills/submitting-app-release/scripts/release-checklist.js testapp
```

All three should exit with code `0` on a clean checkout.

---

## Submitting a Pull Request

1. **Fork** the repository and create a feature branch: `git checkout -b feat/my-feature`.
2. **Make your changes.** Keep commits focused; one logical change per commit.
3. **Test** with the `testapp` fixture and, if adding a new platform, provide a minimal fixture under `examples/`.
4. **Update documentation** — if your change affects a command, skill, or config schema, update the relevant `docs/` or `skills/*/SKILL.md` file.
5. **Open a PR** targeting the `main` branch. Fill in the PR template.

### PR checklist

- [ ] `validate-metadata.js testapp` passes
- [ ] `validate-translations.js testapp` passes
- [ ] `release-checklist.js testapp` passes
- [ ] New commands documented in `README.md` slash-commands table
- [ ] `CHANGELOG.md` updated under `[Unreleased]`

---

## Style Guidelines

### Plugin components

| Component | Convention |
|---|---|
| Commands | `commands/msd-<verb>.md` — imperative verb, e.g. `msd-build`, `msd-validate` |
| Skills | `skills/<noun-phrase>/SKILL.md` — noun phrase, e.g. `managing-app-versions` |
| Agents | `agents/<role>.md` — role noun, e.g. `metadata-validator` |
| Scripts | `skills/<skill>/scripts/<verb>-<noun>.js` — camelCase inside, kebab-case filename |

### JavaScript scripts

- CommonJS (`require`/`module.exports`) — keeps Node.js 18 compatibility without a build step.
- No external runtime dependencies. Use Node built-ins only (`fs`, `path`, `child_process`).
- `process.exit(1)` on validation failure; `process.exit(0)` on success.

### Metadata / locale fixtures

Changes to `testapp` fixtures must keep all validation scripts passing. Do not commit real API keys or store credentials.

---

## Reporting Security Issues

Do **not** open a public issue for security vulnerabilities. See [SECURITY.md](SECURITY.md) for the responsible-disclosure process.

---

## Questions?

Open a [GitHub Discussion](https://github.com/ofcskn/mobile-automation-plugin/discussions) for general questions, or file an issue for anything specific.
