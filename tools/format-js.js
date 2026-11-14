#!/usr/bin/env node
'use strict';
/*
 * tools/format-js.js
 * A small formatter with no dependencies, for this project's JavaScript and CSS.
 *
 *   node tools/format-js.js            format js/*.js and css/app.css in place
 *   node tools/format-js.js --check    list files that are not formatted (exit code 1)
 *   node tools/format-js.js a.js b.css format the given files
 *
 * It only changes white space and line breaks, never the tokens, so behaviour cannot change.
 * Rules: 2 spaces, one statement per line, one declarator per line in const/let/var lists, spaces around operators,
 * soft wrap at 100 columns after commas and logical operators, and before method calls chained after a call. Long template literals stay as they are.
 */
const fs = require('fs');
const path = require('path');

const KEYWORDS = new Set(['return', 'typeof', 'case', 'in', 'of', 'delete', 'void', 'throw', 'new', 'else', 'do',
  'instanceof', 'yield', 'await', 'const', 'let', 'var', 'function', 'if', 'for', 'while', 'switch', 'catch', 'try',
  'finally', 'class', 'extends', 'async']);
const BEFORE_PAREN = new Set(['if', 'for', 'while', 'switch', 'catch', 'return', 'typeof', 'in', 'of', 'instanceof',
  'else', 'do', 'case', 'void', 'delete', 'throw', 'await', 'function', 'yield']);
const REGEX_AFTER = new Set(['return', 'typeof', 'case', 'in', 'of', 'delete', 'void', 'throw', 'new', 'else', 'do',
  'instanceof', 'yield', 'await']);
const PUNCTUATORS = ['>>>=', '...', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=', '=>', '==', '!=',
  '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>', '**'];
const WRAP_COLUMN = 100;

// ---------- tokenizer ----------

const isOperand = (t) => !!t && (['num', 'str', 'tpl', 're'].includes(t.t)
  || (t.t === 'id' && !REGEX_AFTER.has(t.x))
  || (t.t === 'p' && [')', ']', '}'].includes(t.x)));

function scan(src, start, stopAtBrace) {
  const tokens = [];
  const n = src.length;
  let i = start;
  let depth = 0;
  let newline = false;
  const previous = () => tokens.filter((t) => t.t !== 'lc' && t.t !== 'bc').pop() || null;
  const push = (t, x, from) => { tokens.push({ t, x: x === undefined ? src.slice(from, i) : x, nl: newline }); newline = false; };

  while (i < n) {
    const c = src[i];
    if (c === '\n') { newline = true; i++; continue; }
    if (/\s/.test(c)) { i++; continue; }
    const from = i;
    if (c === '/' && src[i + 1] === '/') {
      let end = src.indexOf('\n', i);
      if (end < 0) end = n;
      tokens.push({ t: 'lc', x: src.slice(i, end).replace(/\s+$/, ''), nl: newline });
      i = end;
      newline = true;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2) + 2;
      tokens.push({ t: 'bc', x: src.slice(i, end), nl: newline });
      i = end;
      newline = false;
      continue;
    }
    if (c === '"' || c === "'") {
      i++;
      while (src[i] !== c) i += src[i] === '\\' ? 2 : 1;
      i++;
      push('str', undefined, from);
      continue;
    }
    if (c === '`') {
      i++;
      while (src[i] !== '`') {
        if (src[i] === '\\') i += 2;
        else if (src[i] === '$' && src[i + 1] === '{') i = scan(src, i + 2, true).end;
        else i++;
      }
      i++;
      push('tpl', undefined, from);
      continue;
    }
    const prev = previous();
    const number = /^(0[xX][0-9a-fA-F_]+|\d[\d_]*\.?\d*(?:[eE][+-]?\d+)?|\.\d[\d_]*(?:[eE][+-]?\d+)?)n?/.exec(src.slice(i, i + 40));
    if (number && (c !== '.' || !isOperand(prev))) {
      i += number[0].length;
      push('num', undefined, from);
      continue;
    }
    if (/[A-Za-z_$\u0080-\uffff]/.test(c)) {
      while (i < n && /[\w$\u0080-\uffff]/.test(src[i])) i++;
      push('id', undefined, from);
      continue;
    }
    if (c === '/' && !isOperand(prev)) {
      i++;
      let inClass = false;
      while (src[i] !== '/' || inClass) {
        if (src[i] === '\\') i++;
        else if (src[i] === '[') inClass = true;
        else if (src[i] === ']') inClass = false;
        i++;
      }
      i++;
      while (/[a-z]/.test(src[i] || '')) i++;
      push('re', undefined, from);
      continue;
    }
    let op = PUNCTUATORS.find((p) => src.startsWith(p, i)) || c;
    if (op === '?.' && /[0-9]/.test(src[i + 2] || '')) op = '?';
    i += op.length;
    if (op === '{') depth++;
    if (op === '}') {
      if (stopAtBrace && depth === 0) return { tokens, end: i };
      depth--;
    }
    push('p', op, from);
  }
  return { tokens, end: i };
}

// ---------- JavaScript ----------

function format(src) {
  const T = scan(src.replace(/\r\n?/g, '\n'), 0, false).tokens;
  const stack = [];
  let out = '';
  let col = 0;
  let indent = 0;
  let pending = null;
  let prev = null;
  let decl = null;

  const emit = (s) => { out += s; col += s.length; };
  const lineBreak = (extra) => {
    out = out.replace(/ +$/, '');
    out += '\n' + '  '.repeat(Math.max(0, indent + extra));
    col = (indent + extra) * 2;
  };
  const continuation = () => {
    let extra = 0;
    for (let k = stack.length - 1; k >= 0 && stack[k].k !== 'b'; k--) extra++;
    return Math.max(1, Math.min(extra, 3));
  };
  const isBlockStart = (p) => !p || (p.t === 'id' && ['else', 'try', 'finally', 'do'].includes(p.x))
    || (p.t === 'p' && [')', '=>', ';', '{', '}'].includes(p.x));
  const prefixUnary = (t) => t && t.t === 'p' && (['!', '~', '...'].includes(t.x) || (t.u === 'pre'));

  function gap(a, b, top) {
    if (!a) return '';
    if (b.t === 'p') {
      const x = b.x;
      if ([',', ';', ')', ']', '.', '?.'].includes(x)) return '';
      if (b.u === 'post') return '';
      if (x === '(') {
        if (a.t === 'id' && BEFORE_PAREN.has(a.x)) return ' ';
        if (a.t === 'p' && !['(', '[', '!', '~', '...'].includes(a.x) && a.u !== 'pre' && ![')', ']', '}'].includes(a.x)) return ' ';
        return '';
      }
      if (x === '[') {
        if (a.t === 'id') return KEYWORDS.has(a.x) ? ' ' : '';
        if (['str', 'tpl', 'num', 're'].includes(a.t)) return '';
        if (a.t === 'p' && ([')', ']', '}', '(', '['].includes(a.x) || prefixUnary(a))) return '';
        return ' ';
      }
      if (x === '{') return a.t === 'p' && ['(', '['].includes(a.x) ? '' : ' ';
      if (x === '}') return a.t === 'p' && a.x === '{' ? '' : ' ';
      if (x === ':') return b.ternary ? ' ' : '';
      if (b.u === 'pre' || ['!', '~', '...'].includes(x)) {
        return a.t === 'p' && (['(', '['].includes(a.x) || prefixUnary(a)) ? '' : ' ';
      }
      return ' ';
    }
    if (a.t === 'p' && (['(', '[', '.', '?.'].includes(a.x) || prefixUnary(a))) return '';
    return ' ';
  }

  for (let k = 0; k < T.length; k++) {
    const tok = T[k];
    const next = T[k + 1];

    if (tok.t === 'lc' || tok.t === 'bc') {
      const ownLine = tok.nl || out === '';
      if (!ownLine) pending = null;
      if (ownLine && out !== '') {
        const blank = stack.length === 0 && tok.nl && !/\n\n$/.test(out) && !/^\/\*/.test(tok.x);
        lineBreak(0);
        if (blank) { out = out.replace(/\n( *)$/, '\n\n$1'); }
      } else if (!ownLine) emit(' ');
      emit(tok.x);
      pending = 'nl';
      continue;
    }

    // decide the type of this token before emitting it
    if (tok.t === 'p') {
      const top = stack[stack.length - 1];
      if (tok.x === '?') { tok.ternary = true; if (top) top.q++; else stack.q = (stack.q || 0) + 1; }
      if (tok.x === ':') {
        const q = top ? top.q : stack.q;
        if (q > 0) { tok.ternary = true; if (top) top.q--; else stack.q--; }
      }
      if (['+', '-'].includes(tok.x)) tok.u = isOperand(prev) ? undefined : 'pre';
      if (['++', '--'].includes(tok.x)) tok.u = isOperand(prev) ? 'post' : 'pre';
    }

    const closesBlock = tok.t === 'p' && tok.x === '}' && stack.length && stack[stack.length - 1].k === 'b';
    if (closesBlock) { indent--; pending = 'nl'; }
    else if (!pending && tok.nl && prev
      && (['num', 'str', 'tpl', 're'].includes(prev.t) || (prev.t === 'id' && isOperand(prev)) || (prev.t === 'p' && [')', ']', '}'].includes(prev.x)) || prev.u === 'post')
      && (['id', 'num', 'str', 'tpl', 're'].includes(tok.t) || (tok.t === 'p' && ['(', '[', '{', '!', '~', '++', '--'].includes(tok.x)))
      && !(tok.t === 'id' && ['else', 'catch', 'finally'].includes(tok.x))) pending = 'nl';
    if (!pending && tok.t === 'id' && (tok.x === 'case' || tok.x === 'default') && prev && !(prev.t === 'p' && prev.x === '{')
      && stack.length && stack[stack.length - 1].k === 'b') pending = 'nl';

    if (!pending && tok.t === 'p' && tok.x === '.' && prev && prev.t !== 'num'
      && (col > WRAP_COLUMN || (col > 72 && prev.t === 'p' && prev.x === ')'))) pending = 'wrap';
    if (tok.t === 'id' && ['const', 'let', 'var'].includes(tok.x)
      && (!prev || (prev.t === 'p' && [';', '{', '}'].includes(prev.x)))
      && (!stack.length || stack[stack.length - 1].k === 'b')) decl = { depth: stack.length };

    const top = stack[stack.length - 1];
    if (pending) {
      lineBreak(pending === 'wrap' ? continuation() : pending === 'decl' ? 1 : 0);
      if (pending === 'blank') { out = out.replace(/\n( *)$/, '\n\n$1'); }
      pending = null;
    } else emit(gap(prev, tok, top));
    emit(tok.x);

    if (tok.t === 'p') {
      const x = tok.x;
      if (x === '(' || x === '[') stack.push({ k: x, q: 0 });
      else if (x === ')' || x === ']') stack.pop();
      else if (x === '{') {
        if (next && next.t === 'p' && next.x === '}') stack.push({ k: 'e', q: 0 });
        else if (isBlockStart(prev)) { stack.push({ k: 'b', q: 0 }); indent++; pending = 'nl'; }
        else stack.push({ k: 'o', q: 0 });
      } else if (x === '}') {
        const closed = stack.pop();
        if (closed && closed.k === 'b') {
          const follower = next && ((next.t === 'id' && ['else', 'catch', 'finally'].includes(next.x))
            || (next.t === 'p' && [')', ']', ',', ';', '.', '?.', '('].includes(next.x)));
          if (!follower && next) pending = stack.length === 0 ? 'blank' : 'nl';
        }
      } else if (x === ';') {
        const inHeader = stack.length && stack[stack.length - 1].k === '(';
        if (!inHeader) pending = 'nl';
        if (decl && stack.length === decl.depth) decl = null;
      } else if (x === ',' && decl && stack.length === decl.depth) pending = 'decl';
      else if (x === ',' && col > WRAP_COLUMN && stack.length && stack[stack.length - 1].k !== 'b') pending = 'wrap';
      else if (col > WRAP_COLUMN && (['&&', '||', '??'].includes(x) || (x === '?' && tok.ternary) || (x === ':' && tok.ternary))) pending = 'wrap';
    }
    prev = tok;
  }
  return out.replace(/ +$/gm, '').replace(/\n{3,}/g, '\n\n').replace(/\n*$/, '\n');
}

// ---------- CSS ----------

function formatCss(src) {
  const text = src.replace(/\r\n?/g, '\n');
  let out = '';
  let buf = '';
  let depth = 0;
  let paren = 0;
  const pad = () => '  '.repeat(depth);
  const flush = (end) => {
    const t = buf.trim();
    buf = '';
    if (!t) return;
    const m = /^([-\w]+)\s*:\s*([\s\S]*)$/.exec(t);
    out += pad() + (m && end !== '{' ? m[1] + ': ' + m[2].trim() : t.replace(/\s*,\s*/g, ', ').replace(/\s+/g, ' ')) + end;
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '/' && text[i + 1] === '*') {
      flush('');
      if (out && !out.endsWith('\n')) out += '\n';
      const end = text.indexOf('*/', i + 2) + 2;
      out += pad() + text.slice(i, end) + '\n';
      i = end - 1;
    } else if (c === '"' || c === "'") {
      let j = i + 1;
      while (text[j] !== c) j += text[j] === '\\' ? 2 : 1;
      buf += text.slice(i, j + 1);
      i = j;
    } else if (c === '(') { paren++; buf += c; }
    else if (c === ')') { paren--; buf += c; }
    else if (c === '{' && !paren) {
      flush(' {');
      out += '\n';
      depth++;
    } else if (c === ';' && !paren) {
      flush(';');
      out += '\n';
    } else if (c === '}' && !paren) {
      if (buf.trim()) { flush(''); out += '\n'; }
      depth--;
      out += pad() + '}\n';
      if (depth === 0) out += '\n';
    } else buf += c;
  }
  return out.replace(/\n{3,}/g, '\n\n').replace(/\n*$/, '\n');
}

// ---------- command line ----------

function formatFile(file, src) { return file.endsWith('.css') ? formatCss(src) : format(src); }

function main(argv) {
  const root = path.resolve(__dirname, '..');
  const check = argv.includes('--check');
  let files = argv.filter((a) => !a.startsWith('--'));
  if (!files.length) {
    files = fs.readdirSync(path.join(root, 'js')).filter((f) => f.endsWith('.js')).map((f) => path.join('js', f));
    files.push(path.join('css', 'app.css'));
  }
  const changed = [];
  for (const f of files) {
    const p = path.resolve(root, f);
    const before = fs.readFileSync(p, 'utf8');
    const after = formatFile(f, before);
    if (after !== before) { changed.push(f); if (!check) fs.writeFileSync(p, after); }
  }
  if (check) {
    changed.forEach((f) => console.log('not formatted: ' + f));
    process.exit(changed.length ? 1 : 0);
  }
  console.log(changed.length ? 'formatted ' + changed.join(', ') : 'already formatted');
}

if (require.main === module) main(process.argv.slice(2));
module.exports = { format, formatCss, scan };
