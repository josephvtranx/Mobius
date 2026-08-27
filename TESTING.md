# Test Mobius on your Mac

## Start here

1. Open your IDE terminal and run:

   ```bash
   git clone https://github.com/josephvtranx/Mobius.git
   cd Mobius
   ```

2. Unzip the **Mobius-Test-Kit.zip** Joseph sent you. Put the resulting **Mobius-Test-Kit** folder inside **Mobius**, next to `client` and `server`.

3. Run this command, wait for **Ready**, and open the local link printed in the terminal:

   ```bash
   bash Mobius-Test-Kit/start.sh
   ```

The first run installs everything automatically and also opens the browser. Accounts and scenarios are on the welcome page; all demo passwords are **Password123!**. No Node.js, PostgreSQL, Docker, or `.env` setup required. If the testing setup is already included in your checkout, `bash "Start Mobius.command"` also works without the kit.

Keep the Terminal window open while testing. **Closing it or pressing Control+C discards your academy and uploaded photos.** Start the launcher again for fresh data. Closing only the browser tab does not stop it.

Everyone has their own local academy. Your actions cannot change a teammate’s data or production. Use synthetic information and sample photos, not real student or payment information.

## If your Mac will not open the launcher

Use Finder’s right-click → Open if macOS offers that option. Review the source/trust the repository before approving any security prompt. Do not disable Gatekeeper or remove quarantine protections.

If a ZIP download lost executable permission, open Terminal, type `chmod +x ` (including the trailing space), drag **Start Mobius.command** into that window, and press Return. Then double-click it again. Ask Joseph for help if macOS or your organization still blocks it.

Supported runtime: Node 22.23.2, downloaded from nodejs.org with a pinned SHA-256 checksum, for Intel and Apple Silicon. Requires a macOS version supported by that runtime (macOS 11 or newer). The launcher does not install or replace system Node.

## How to test together

- Claim a role or workflow in your team chat so coverage is shared. Each person still tests their own independent academy.
- Start with one scenario on the welcome page and check its expected result after reloading.
- For a cross-role workflow, sign out and sign in with the next role. Separate browser profiles can hold different roles; ordinary tabs share the same login.
- Test desktop and narrow windows, keyboard navigation, empty searches, invalid submissions, repeated saves and back/forward navigation.
- Return to the welcome page by changing the path in the address to `/__sandbox/`. The launch address is also printed in Terminal.
- Save bug reports and screenshots outside the app before closing. Welcome-page checkbox ticks are temporary.

## Known limits

The sandbox runs the real app and migrations against local PGlite databases. It is for feature and UX testing, not production-scale concurrency/load testing. It does not prove every existing feature works.

Real email and scheduled jobs are disabled. In-app notifications still work; automatic attendance/queue states are seeded in advance. Waiting does not run scheduled jobs. Payments record money already received—there is no real checkout/payment processor. Password reset and invitations are incomplete. Platform-admin provisioning creates only additional temporary local databases.

The generated academy uses relative dates and repeatable synthetic names; UUIDs, secrets and launch timestamps change. Alice starts with 40 credits, Ben with 3, Charlie with 30. Financial history contains documented synthetic opening adjustments, real attendance-linked deductions, money-only payments and matching Standard package grants. Do not treat it as a real institution’s accounting history.

## Troubleshooting

- **Internet/install failure:** reconnect and launch again. A failed install is retried; a successful install is cached until manifests, lockfiles or runtime change. Use a trusted network that can access nodejs.org and registry.npmjs.org.
- **Already running:** use the existing Terminal window or close it before relaunching. The launcher never kills someone else’s server.
- **Address changed:** ports are assigned automatically on each launch. Use the newly printed/opened URL instead of an old bookmark.
- **Browser did not open:** copy the local URL printed in Terminal.
- **Unexpected error:** send the message and `.mobius-sandbox/latest.log` to Joseph. Do not send any `.env` file. Logs contain synthetic test actions and are overwritten on the next launch.
- **Force-quit/power loss:** database data disappears with the process. An OS temporary upload folder may remain until macOS clears it; the next launch uses a new directory and cannot serve old photos. Normal shutdown removes it immediately.

## Bug report template

```text
Title:
Code version (from welcome page):
Role / demo email:
Scenario / page URL:
Mac / browser / window size:
Steps to reproduce:
Expected result:
Actual result:
Screenshot:
Reproduces after a fresh launch?
```

## For maintainers

- `npm run sandbox` runs the same private-runtime bootstrap. Do not use `dev:setup` for testers; it configures normal development environments.
- `node scripts/sandbox/launch.mjs --no-open` runs orchestration with the current Node; useful for QA after dependencies are installed by the launcher. The official teammate entry point pins Node automatically.
- `npm run test:sandbox` checks launcher utilities; `npm test` includes seed integrity and API workflow checks.
- Launcher sources: `scripts/sandbox/`; frontend runner: `client/scripts/sandbox-server.mjs`; API worker/seeds: `server/scripts/dev/`.
- Update runtime version and both archive hashes together in `bootstrap.sh`, verifying them against the official release checksums. Never disable verification.
- Sandbox `.env` loading is disabled; child process environment is allowlisted; API/DB listeners bind only to 127.0.0.1. Upload directories and signing secrets are unique per run. Welcome routes are installed only by the sandbox Vite runner.
- `.mobius-sandbox/` contains a process lock, dependency fingerprint, latest log and active session metadata. It is gitignored and contains no production credentials.
- For a separate ZIP handoff, run `python3 scripts/sandbox/package-kit.py`. Share `dist/Mobius-Test-Kit.zip`; it contains a three-step guide, installer, checked application patch, and file manifest. It includes unpublished application changes needed to test the current version. It excludes environment files, uploads, dependencies and design bundles; it leaves your actual Git staging area untouched.
- The kit targets the current local HEAD commit. Verify that it matches the GitHub clone revision before sharing; regenerate and retest the kit when the base or application changes. The installer rejects a different base and conflicting edits and is safe to rerun. It never resets, commits or pushes a tester's work.
- Alternatively publish/commit the complete launcher and application changes; teammates can then run the root launcher directly without a kit.

### Verification on August 26, 2026

- Tested the actual launcher on Apple Silicon/macOS 26 from a fresh directory with spaces, with system Node excluded from PATH. The private runtime downloaded and verified, dependencies installed, and cached launches skipped installation.
- Tested incorrect `.env` targets, occupied development ports, duplicate launch, normal shutdown and interruption during startup. The existing development server was left running. Shutdown removed the sandbox photo directory and closed both ports.
- Automated: 199 server tests passed, including six seed/workflow tests; seven launcher tests passed, including failed download/checksum handling and two-launch token/photo isolation. Client build and focused lint passed. Repository-wide lint still reports 302 pre-existing errors.
- Browser: all seven accounts signed in; booking/reschedule acceptance, attendance with notes and deductions, package payment (+105 credits), task completion/history and photo upload/reload worked in the isolated sandbox. Welcome layout visually reviewed at desktop width.
- Not physically verified: Intel Mac, minimum supported macOS, Finder security prompts, default-browser auto-opening (QA used `--no-open`), and narrow/mobile layouts. These remain teammate acceptance checks, not claims of completed validation.
