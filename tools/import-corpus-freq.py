#!/usr/bin/env python3
"""Make data/corpus-freq.json (real corpus ranks for the words in the deck) from a corpus frequency list.

Examples:
  python3 tools/import-corpus-freq.py BCCWJ_frequencylist_suw_ver1_0.tsv --name "BCCWJ short-unit words (NINJAL)"
  python3 tools/import-corpus-freq.py jiten-global.csv --name "Jiten media corpus" --license "CC BY-SA 4.0"
  python3 tools/import-corpus-freq.py my-list.csv --word-col word --count-col count

Accepted lists (tab or comma separated, with or without a header row):
  * the NINJAL BCCWJ word list (columns rank, lForm, lemma, pos, ..., frequency): detected by its header
  * any list with a word column and a rank or a count column (counts are turned into ranks, most frequent first)
  * a plain word list in order (first word = most frequent)
A word is matched by its spelling in the deck; words that are only written in kana in the corpus are matched by reading.
Only words of the deck are written, so the file stays small. The app uses it automatically when it sits next to content.json.
Needs Python 3 only. No network access.
"""
import argparse, csv, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
SKIP_POS = ('助詞', '助動詞', '記号', '補助記号', '空白', '感動詞-フィラー')


def rows(t):
    if isinstance(t, list):
        return t
    return [dict(zip(t['cols'], r)) for r in t['rows']]


def deck(data_dir):
    """Every word of the deck as {spelling: reading}."""
    out = {}
    manifest = json.load(open(os.path.join(data_dir, 'content.json'), encoding='utf-8'))
    for f in manifest['packs']:
        p = json.load(open(os.path.join(data_dir, f), encoding='utf-8'))
        for w in rows(p.get('words', [])):
            out.setdefault(w['w'], w.get('r', ''))
    return out


def sniff(path):
    head = open(path, encoding='utf-8-sig').read(4096)
    return '\t' if head.count('\t') > head.count(',') else ','


def read_list(path, word_col, rank_col, count_col, fmt):
    """Returns {word: rank}; the lowest rank wins when a word appears twice."""
    delim = sniff(path)
    with open(path, encoding='utf-8-sig', newline='') as fh:
        table = [r for r in csv.reader(fh, delimiter=delim) if r]
    if not table:
        raise SystemExit('The list is empty.')
    head = [c.strip().lower() for c in table[0]]
    has_head = any(h in head for h in ('lemma', 'word', 'term', 'rank', 'count', 'frequency', '表記', '語彙素')) or not table[0][0].strip().isdigit() and len(table[0]) > 1 and any(h.isalpha() for h in head)
    body = table[1:] if has_head else table

    def col(names, given):
        if given is not None:
            return int(given) if str(given).isdigit() else head.index(str(given).lower())
        for n in names:
            if n in head:
                return head.index(n)
        return None

    bccwj = fmt == 'bccwj' or (has_head and 'lemma' in head and 'rank' in head and 'lform' in head)
    wi = col(['lemma', 'word', 'term', '表記', '語彙素'], word_col) if has_head else (int(word_col) if word_col is not None else 0)
    ri = col(['rank', '順位'], rank_col) if has_head else (int(rank_col) if rank_col is not None else None)
    ci = col(['count', 'frequency', 'freq', '頻度'], count_col) if has_head else (int(count_col) if count_col is not None else None)
    pi = head.index('pos') if bccwj and 'pos' in head else None
    if wi is None:
        raise SystemExit('Could not find the word column; use --word-col.')
    items = []
    for n, r in enumerate(body):
        if wi >= len(r):
            continue
        if pi is not None and any(r[pi].startswith(s) for s in SKIP_POS):
            continue
        w = r[wi].strip()
        if not w:
            continue
        rank = None
        if ri is not None and ri < len(r) and r[ri].strip().replace('.', '', 1).isdigit():
            rank = int(float(r[ri]))
        cnt = float(r[ci].replace(',', '')) if ci is not None and ci < len(r) and r[ci].replace(',', '').replace('.', '', 1).isdigit() else None
        items.append((w, rank, cnt, n))
    if any(i[1] is not None for i in items):
        pass  # ranks given
    elif any(i[2] is not None for i in items):
        order = sorted(items, key=lambda i: (-(i[2] or 0), i[3]))
        items = [(w, k + 1, c, n) for k, (w, _, c, n) in enumerate(order)]
    else:
        items = [(w, k + 1, c, n) for k, (w, _, c, n) in enumerate(items)]
    ranks = {}
    for w, rank, _, _ in items:
        if rank is not None and (w not in ranks or rank < ranks[w]):
            ranks[w] = rank
    return ranks


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('source')
    ap.add_argument('--out', default=os.path.join(DATA, 'corpus-freq.json'))
    ap.add_argument('--data', default=DATA, help='folder with content.json')
    ap.add_argument('--name', default='corpus')
    ap.add_argument('--license', default='')
    ap.add_argument('--format', choices=['auto', 'bccwj', 'csv'], default='auto')
    ap.add_argument('--word-col')
    ap.add_argument('--rank-col')
    ap.add_argument('--count-col')
    a = ap.parse_args()
    ranks = read_list(a.source, a.word_col, a.rank_col, a.count_col, a.format)
    d = deck(a.data)
    cf, by_reading = {}, 0
    for w, r in d.items():
        if w in ranks:
            cf[w] = ranks[w]
        elif r and r != w and r in ranks and not any('\u4e00' <= c <= '\u9fff' for c in r):
            cf[w] = ranks[r]
            by_reading += 1
    meta = {'name': a.name, 'size': len(ranks), 'matched': len(cf), 'total': len(d)}
    if a.license:
        meta['license'] = a.license
    pack = {'schema': 1, 'pack': 'corpus-frequency', 'level': 5, 'title': 'Corpus frequency ranks: ' + a.name, 'corpus': meta, 'cfreq': cf}
    with open(a.out, 'w', encoding='utf-8') as fh:
        json.dump(pack, fh, ensure_ascii=False, separators=(',', ':'))
    print(f'{len(cf)} of {len(d)} deck words ranked ({by_reading} matched by reading) from {len(ranks)} corpus entries -> {a.out}', file=sys.stderr)
    miss = [w for w in d if w not in cf]
    print('not in the corpus list (they keep estimated ranks), first 30: ' + ' '.join(miss[:30]), file=sys.stderr)


if __name__ == '__main__':
    main()
