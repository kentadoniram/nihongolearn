#!/usr/bin/env python3
"""Builds the release zip.
Default: a PATCH zip with only the files modified since the previous release, in their original folders.
  Baseline = --baseline <zip or folder>, else tools/release-state.json (written by the last build),
  else the newest nihongo-lab-v*-full.zip next to the project, else everything.
--full  : include every file.      --list : print what would be included (JSON) and write nothing.
A JSON file that also sits outside data/ (for example a flat upload) is never added twice: the data/ copy is kept and any difference is reported.
Usage: python3 tools/build-release.py [--full] [--list] [--baseline PATH] [--root DIR] [--out DIR]"""
import os, sys, json, glob, zipfile, hashlib
a = sys.argv[1:]
arg = lambda k: os.path.abspath(a[a.index(k) + 1]) if k in a else None
ROOT = arg('--root') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = arg('--out') or os.path.dirname(ROOT)
SITE = ['index.html', 'sw.js', 'manifest.json', 'version.json', 'CHANGELOG.md', 'ROADMAP.md', 'README.md', 'package.json',
        '.editorconfig', '.gitignore']
STATE = 'tools/release-state.json'
hb = lambda b: hashlib.sha256(b).hexdigest()
def h(p): return hb(open(p, 'rb').read())
files, notes = {}, []
for f in SITE:
    if os.path.exists(os.path.join(ROOT, f)): files[f] = os.path.join(ROOT, f)
for d in ('css', 'js', 'data', 'docs', 'tests', 'tools'):
    for dp, _, fs in os.walk(os.path.join(ROOT, d)):
        if 'node_modules' in dp: continue
        for f in fs:
            rel = os.path.relpath(os.path.join(dp, f), ROOT).replace(os.sep, '/')
            if rel != STATE: files[rel] = os.path.join(dp, f)
for f in sorted(os.listdir(ROOT)):
    p = os.path.join(ROOT, f)
    if f.endswith('.json') and f not in SITE and os.path.isfile(p):
        inner = 'data/' + f
        if inner in files: notes.append(f + (' is identical to ' if h(p) == h(files[inner]) else ' differs from ') + inner + '; kept only ' + inner)
        else: files[inner] = p; notes.append(f + ' was outside data/; placed at ' + inner)
need = []
try:
    c = json.load(open(os.path.join(ROOT, 'data', 'content.json'), encoding='utf-8'))
    need = ['data/content.json'] + ['data/' + p for p in c['packs']]
except Exception as e: notes.append('content.json unreadable: ' + str(e))
missing = [n for n in need if n not in files]
full = '--full' in a
base, src = None, None
if not full:
    b = arg('--baseline')
    st = os.path.join(ROOT, STATE)
    if b and os.path.isdir(b):
        base = {os.path.relpath(os.path.join(dp, f), b).replace(os.sep, '/'): h(os.path.join(dp, f)) for dp, _, fs in os.walk(b) for f in fs}; src = b
    elif b:
        z = zipfile.ZipFile(b); base = {n: hb(z.read(n)) for n in z.namelist() if not n.endswith('/')}; src = b
    elif os.path.exists(st):
        base = json.load(open(st, encoding='utf-8'))['files']; src = STATE
    else:
        zs = sorted(glob.glob(os.path.join(OUT, 'nihongo-lab-v*-full.zip')), key=os.path.getmtime)
        if zs: z = zipfile.ZipFile(zs[-1]); base = {n: hb(z.read(n)) for n in z.namelist() if not n.endswith('/')}; src = zs[-1]
    if base is None: notes.append('no previous release found, so everything is included')
    base = base if base is None else {k: v for k, v in base.items() if k != STATE}
names = sorted(files)
if base is not None: names = [n for n in names if base.get(n) != h(files[n])]
removed = sorted(set(base) - set(files)) if base is not None else []
if base is not None and not names: notes.append('nothing was modified since the previous release')
if '--list' in a:
    print(json.dumps({'mode': 'full' if base is None else 'patch', 'baseline': src, 'files': names, 'removed': removed, 'notes': notes, 'missing': missing})); sys.exit(0)
if missing: print('Missing:', missing); sys.exit(1)
ver = json.load(open(os.path.join(ROOT, 'version.json')))['app']
out = os.path.join(OUT, 'nihongo-lab-v%s-%s.zip' % (ver, 'full' if base is None else 'patch'))
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for n in names: z.write(files[n], n)
json.dump({'version': ver, 'files': {n: h(p) for n, p in files.items()}}, open(os.path.join(ROOT, STATE), 'w', encoding='utf-8'))
print(out, len(names), 'of', len(files), 'files' + (' (baseline: ' + os.path.basename(str(src)) + ')' if base is not None else ''))
for x in removed: print('removed since baseline:', x)
for x in notes: print('note:', x)
