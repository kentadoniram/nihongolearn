/* js/07-settings-screen.js
 * Purpose: Settings screen (the gear), built from one function per section.
 * Defines (9): memCk, memOpts, memNote, memDisplay, memLearning, memContent, memAdvanced, memAbout, settings
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// A checkbox row that flips one flag of S.
const memCk = (k, t) => `<p><label><input type="checkbox" ${S[k]?'checked':''} onchange="S.${k}=this.checked;save()"> ${t}</label></p>`;

// <option> list for a select; sel is the value that is selected.
const memOpts = (list, sel) => list.map(([k, t]) => `<option value="${k}" ${sel==k?'selected':''}>${t}</option>`)
  .join('');
const memNote = (t, st) => `<p class="mu" style="text-align:left${st||''}">${t}</p>`;
function memDisplay() {
  const lvl = [[0, 'Automatic (now N' + gateLv().u + ')'], [5, 'N5'], [4, 'N4'], [3, 'N3'], [2, 'N2'],
    [1, 'N1']],
    fonts = [['kyo', 'Textbook (school style)'], ['maru', 'Rounded'], ['sans', 'Plain sans'], ['mincho',
      'Mincho (serif)']],
    tips = [['r', 'Readings'], ['m', 'Meaning'], ['p', 'Part of speech of the word'], ['l', 'JLPT level'],
    ['w', 'Example words'], ['s', 'Look-alike kanji']],
    head = t => `<p class="mu" style="text-align:left;margin:8px 0 2px">${t}</p>`,
    tipRow = ([k, t]) => `<p style="margin:4px 0"><label><input type="checkbox" ${S.tf[k]?'checked':''} onchange="S.tf.${k}=this.checked;save()"> ${t}</label></p>`,
    preset = (t, o) => `<button class="sec" onclick="S.tf=${o};save();settings()">${t}</button>`;
  return `<details class="card"><summary>Display</summary>${memCk('hl','Hide JLPT level labels')}` + memCk('rm',
    'Show romaji under sentences (off: hiragana and furigana only)') + head('My JLPT level: kanji above it get furigana') + `<select aria-label="My JLPT level" onchange="S.jl=+this.value||0;GATE.t=0;save()">${memOpts(lvl,S.jl||0)}</select>` + head('Japanese font') + `<select aria-label="Japanese font" onchange="S.fn=this.value;save();setFont()">${memOpts(fonts,S.fn||'kyo')}</select>` + head('Kanji tooltip shows') + tips
    .map(tipRow).join('') + preset('Reading only', '{r:1,m:0,p:0,l:0,w:0,s:0}') + preset('Reading + meaning',
    '{r:1,m:1,p:0,l:1,w:0,s:0}') + preset('+ part of speech', '{r:1,m:1,p:1,l:1,w:0,s:0}') + preset('Everything',
    '{r:1,m:1,p:1,l:1,w:1,s:1}') + `</details>`
}

function memLearning() {
  const rare = Math.round((S.rare ?? .2) * 100);
  return `<details class="card"><summary>Learning</summary>${memCk('aa','Move on automatically after a correct answer')}` + memCk('wk',
    'Include work vocabulary (plant engineering)') + `<p style="margin:8px 0 2px">Rare words mixed in: <b id="rv">${rare}%</b></p>` + `<input type="range" aria-label="Share of rare words" min="0" max="40" step="10" value="${rare}" oninput="S.rare=this.value/100;$('#rv').textContent=this.value+'%';save()" style="width:100%">` + memCk('n3',
    'Open N3 content now') + memNote('Otherwise N3 opens once most N5 and N4 words are met.') + `</details>`
}

function memContent(pk) {
  return `<details class="card"><summary>Content</summary>` + memNote(`${V.length} words, ${Object.keys(KJ).length} kanji, ${SN.length} sentences, ${GI.length} grammar items and ${rc()} generated reading passages. Lessons load from the data folder, and you can add a content pack here.`) + pk
    .map(p => `<div class="mu">${e(p.pack||p.title||'pack')}${p.level?' (N'+p.level+')':''}</div>`)
    .join('') + `<label class="sec" style="cursor:pointer">Import content pack<input type="file" class="sr-only" accept=".json" onchange="imp(this)"></label></details>`
}

const memAdvanced = () => `<details class="card"><summary>Advanced</summary><button class="sec" onclick="rst()">Erase everything on this device</button></details>`;
const memAbout = () => `<details class="card"><summary>About</summary><p>Nihongo Lab v${e(VER.app)}</p>` + memNote(`Lesson data ${e(VER.content)}. Version format is MAJOR.MINOR.BUILD.`) + `</details>`;
function settings() {
  $('#m').innerHTML = '<h2 class="sh">Settings</h2>' + [memDisplay(), memLearning(), memContent(PK.concat(S
        .cp)), memAdvanced(), memAbout()].join('\n')
}
