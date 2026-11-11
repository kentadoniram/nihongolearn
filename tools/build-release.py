#!/usr/bin/env python3
"""Builds the full release zip: site files, EVERY data JSON file, tests and tools, in the original folder layout, one copy of each path.
Usage: python3 tools/build-release.py [--list] [--root DIR] [--out DIR]
If a JSON file also exists outside data/ (for example a flat upload) the data/ copy is kept, the other copy is not added, and the difference is reported."""
import os, sys, json, zipfile, hashlib
a = sys.argv[1:]
ROOT = os.path.abspath(a[a.index('--root') + 1]) if '--root' in a else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.abspath(a[a.index('--out') + 1]) if '--out' in a else os.path.dirname(ROOT)
SITE = ['index.html', 'sw.js', 'manifest.json', 'version.json', 'CHANGELOG.md', 'ROADMAP.md', 'package.json']
def h(p): return hashlib.sha256(open(p, 'rb').read()).hexdigest()
files, notes = {}, []
for f in SITE:
    if os.path.exists(os.path.join(ROOT, f)): files[f] = os.path.join(ROOT, f)
for d in ('data', 'tests', 'tools'):
    for dp, _, fs in os.walk(os.path.join(ROOT, d)):
        if 'node_modules' in dp: continue
        for f in fs:
            p = os.path.join(dp, f); files[os.path.relpath(p, ROOT).replace(os.sep, '/')] = p
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
names = sorted(files)
if '--list' in a:
    print(json.dumps({'files': names, 'notes': notes, 'missing': missing})); sys.exit(0)
if missing: print('Missing:', missing); sys.exit(1)
ver = json.load(open(os.path.join(ROOT, 'version.json')))['app']
out = os.path.join(OUT, 'nihongo-lab-v%s-full.zip' % ver)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for n in names: z.write(files[n], n)
print(out, len(names), 'files')
for x in notes: print('note:', x)
