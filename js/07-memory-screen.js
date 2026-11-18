/* js/07-memory-screen.js
 * Purpose: Memory screen: backup and transfer, what the app remembers, and the learning data.
 * Defines (4): memBackup, memStatusCard, memDataCard, mem
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
function memBackup(d) {
  const file = `<label class="pri" style="display:block;text-align:center;cursor:pointer">Load memory from file<input type="file" class="sr-only" accept=".json,application/json" onchange="imp(this)"></label>`,
    text = `<details><summary class="mu">Use text instead</summary><textarea id="mt" aria-label="Memory text" placeholder="Paste memory text here"></textarea>` + `<button class="sec" onclick="$('#mt').value=JSON.stringify(S)">Show as text</button>` + `<button class="sec" onclick="navigator.clipboard&&navigator.clipboard.writeText(JSON.stringify(S))">Copy</button>` + `<button class="sec" onclick="impt()">Load from text</button></details>`;
  return `<details class="card" open><summary>Backup and transfer</summary>` + memNote(`Last backup: ${d}. Memory means your progress, mistakes, XP and difficulty model.`) + `<button class="pri" onclick="exp()">Download my memory</button>${file}${text}</details>`
}

const memStatusCard = () => `<details class="card" open><summary>What the app remembers</summary>` + memNote(`Forgetting model: ${fmStatus()}`) + memNote(`Reading help: ${kiStatus()}`) + memNote(`Kanji mastery: ${kmStatus()}`) + memNote(`Word ranking: ${cfStatus()}`) + `<button class="sec" onclick="refitFm();mem()">Refit now</button></details>`;
const memDataCard = () => `<details class="card"><summary>Learning data</summary>${dataCard()}</details>`;
function mem() {
  const d = S.bk ? new Date(S.bk).toLocaleDateString() : 'never';
  $('#m').innerHTML = '<h2 class="sh">Memory</h2>' + [memBackup(d), memStatusCard(), memDataCard()].join('\n')
}
