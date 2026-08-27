#!/usr/bin/env python3
"""Maintainer-only packager. Testers need Bash/Git, not Python or system Node.

Creates a verified patch of application/runtime files, never a whole-tree ZIP.
Uses a temporary Git index so the user's real staging area is untouched.
"""
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[2]
EXACT = {
    '.gitignore', 'index.js', 'package.json', 'package-lock.json',
    'client/package.json', 'client/package-lock.json', 'client/vite.config.js',
    'server/package.json', 'server/package-lock.json', 'Start Mobius.command', 'TESTING.md',
    'server/scripts/dev/sandbox.js', 'server/scripts/dev/seedAcademy.js',
    'server/scripts/dev/seedScenarios.js',
    'scripts/sandbox/bootstrap.sh', 'scripts/sandbox/launch.mjs',
    'scripts/sandbox/runtime.mjs', 'scripts/sandbox/welcome.mjs',
    'scripts/sandbox/kit/start.sh', 'scripts/sandbox/package-kit.py',
}
PREFIXES = ('client/src/', 'client/scripts/', 'server/src/', 'server/migrations/',
            'server/test/', 'scripts/sandbox/test/')
BLOCKED_PARTS = {'node_modules', '.git', 'uploads', 'dist', 'build', '.mobius-sandbox', '__pycache__'}


def allowed(name):
    parts = PurePosixPath(name).parts
    return (name in EXACT or name.startswith(PREFIXES)) and not any(
        p in BLOCKED_PARTS or p.startswith('.env') or p in {'AGENTS.md', 'CLAUDE.md'} for p in parts
    ) and not name.endswith(('.log', '.pem', '.key', '.p12', '.pfx', '.zip', '.pyc'))


def git(*args, env=None):
    return subprocess.check_output(['git', '-C', str(ROOT), *args], env=env)


def build():
    base = git('rev-parse', 'HEAD').decode().strip()
    changed = set(git('diff', '--name-only', '-z', 'HEAD').decode().split('\0'))
    changed.update(git('ls-files', '--others', '--exclude-standard', '-z').decode().split('\0'))
    names = sorted(name for name in changed if name and allowed(name))
    if not names:
        raise SystemExit('No local testing changes to package. The kit is for sharing unpublished changes.')
    for name in names:
        if (ROOT / name).is_symlink():
            raise SystemExit(f'Refusing to package symlink: {name}')
    with tempfile.TemporaryDirectory(prefix='mobius-kit-index-') as temp:
        env = {**os.environ, 'GIT_INDEX_FILE': str(Path(temp) / 'index')}
        git('read-tree', 'HEAD', env=env)
        # Explicit allowlist, including deletions. Never stage in the real index.
        git('add', '-A', '--', *names, env=env)
        patch = git('diff', '--cached', '--binary', '--full-index', '--no-ext-diff',
                    '--src-prefix=a/', '--dst-prefix=b/', 'HEAD', env=env)
    sha = hashlib.sha256(patch).hexdigest()
    starter = (ROOT / 'scripts/sandbox/kit/start.sh').read_text().replace('@BASE_COMMIT@', base).replace('@PATCH_SHA@', sha)
    readme = '''# Mobius testing — 3 steps (Mac)

1. Open your IDE terminal and run:

   ```bash
   git clone https://github.com/josephvtranx/Mobius.git
   cd Mobius
   ```

2. Unzip **Mobius-Test-Kit.zip**. Put the resulting **Mobius-Test-Kit** folder inside **Mobius**, next to `client` and `server`.

3. In that same terminal, run:

   ```bash
   bash Mobius-Test-Kit/start.sh
   ```

   Wait for **Ready**, then open the local link printed in the terminal. It also opens automatically. Accounts and test scenarios are on that page.

Keep the terminal open. Closing it discards your test data. Run the same command again for a fresh academy.

Mac only. Internet and GitHub repo access are needed. No Node.js, Docker, PostgreSQL, or `.env` setup required.

This kit includes the unpublished app updates being tested and applies them to your local clone; it does not commit or push anything. If it reports a conflict or version mismatch, ask Joseph for help—do not reset your work. Do not commit the kit folder or send `.env` files.
'''
    manifest = {'baseCommit': base, 'patchSha256': sha, 'files': names,
                'excludes': ['environment files', 'credentials', 'uploads', 'installed dependencies', 'Git history', 'design-reference bundles']}
    output = ROOT / 'dist' / 'Mobius-Test-Kit.zip'
    output.parent.mkdir(exist_ok=True)
    entries = {'README.md': readme.encode(), 'start.sh': starter.encode(), 'app.patch': patch,
               'manifest.json': (json.dumps(manifest, indent=2) + '\n').encode()}
    with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, data in entries.items():
            info = zipfile.ZipInfo(f'Mobius-Test-Kit/{name}', (2026, 8, 26, 0, 0, 0))
            info.create_system = 3
            info.external_attr = (0o100755 if name == 'start.sh' else 0o100644) << 16
            archive.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    digest = hashlib.sha256(output.read_bytes()).hexdigest()
    output.with_suffix('.zip.sha256').write_text(f'{digest}  {output.name}\n')
    print(f'{output}\n{len(names)} application/runtime files; {output.stat().st_size:,} bytes\nBase: {base}\nSHA256: {digest}')


if __name__ == '__main__':
    build()
