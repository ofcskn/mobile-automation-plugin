# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| Latest (`main`) | Yes |
| Older tags | Security fixes backported on a best-effort basis |

---

## Reporting a Vulnerability

**Do not file a public GitHub issue for security vulnerabilities.**

Please report security issues by emailing **security@mobile-store-deploy.dev** (or open a [GitHub private security advisory](https://github.com/mobile-store-deploy/mobile-store-deploy/security/advisories/new) if email is unavailable).

Include:

1. A description of the vulnerability and potential impact.
2. Steps to reproduce or a proof-of-concept (sanitise any real credentials).
3. Affected versions or components (e.g., a specific script, hook, or plugin command).

You will receive an acknowledgement within **48 hours** and a status update within **7 days**.

---

## Credential Handling

This plugin manages paths to sensitive credential files used by Fastlane and EAS. The following files are **intentionally gitignored** and must never be committed:

| File | Purpose |
|---|---|
| `fastlane/api_key.json` | App Store Connect API private key |
| `fastlane/google-play-api.json` | Google Play service account key |

If you discover a credential leak (e.g., a committed `.json` key), **rotate the credential immediately** before doing anything else, then report the repository state via the channel above.

---

## Dependency Scope

This plugin ships **zero npm runtime dependencies**. All scripts use Node.js built-ins. The only external tools are optional CLI tools invoked by the user (Fastlane, EAS CLI, app-store-screenshots). Security issues in those tools should be reported to their respective upstream projects.

---

## Permissions

The plugin's hooks run Node.js scripts against local files. They do not make outbound network requests, access environment variables beyond `CLAUDE_TOOL_INPUT`, or persist data outside the plugin directory. Review `hooks/hooks.json` to audit all hook commands before enabling the plugin.

---

## Disclosure Policy

We follow **coordinated disclosure**: we ask that you give us reasonable time to patch and release a fix before public disclosure. We commit to:

- Acknowledging your report within 48 hours.
- Publishing a fix within 30 days for critical issues, 90 days for lower-severity ones.
- Crediting reporters in the release notes (unless anonymity is requested).
