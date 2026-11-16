/* js/07-progress-screen.js
 * Purpose: Progress screen: vocabulary groups, memory map and the difficulty model.
 * Defines (7): progCell, progGroupsCard, progMap, progModel, MODEL_NOTE, progLinks, prog
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */

// One cell of the memory map: faded words are due for a visit.
const progCell = (A, n) => w => {
  const it = S.i[w.w],
    o = it ? Math.max(.25, ret(it, n)) : .08;
  return `<span onclick="dict(${A.indexOf(w)})" style="cursor:pointer;opacity:${o}" title="${e(w.m||w.q||'')}">${e(w.g?'文法':w.w)}</span>`
};
const progGroupsCard = () => PG.map(([k, t]) => `<details class="card pg"><summary>${t}</summary>${pgGroups(k)}</details>`)
  .join('');
const progMap = (A, n) => `<details class="card"><summary>Memory map</summary><div class="grid">${A.map(progCell(A,n)).join('')}</div>` + `<p class="mu">Bright words are strong in memory. Faded ones are due for a visit.</p></details>`;
const progModel = () => {
  const mu = t => `<p class="mu" style="text-align:left">${t}</p>`;
  return `<div class="card"><b>Difficulty model</b>` + mu(`Logistic regression predicting your chance of a correct answer, trained on ${S.mdl.n} answers. ` + MODEL_NOTE) + mu(`Fit check, −log L (lower is better, a coin flip scores 0.69): last 20 answers ${nlq()[0]}, all answers ${nlq()[1]}.`) + mu(`Calibration, predicted band vs actual success: ${calq()}.`) + attr() + FN
    .map((n, i) => `<div>${n}: ${S.mdl.w[i].toFixed(2)}</div>`).join('') + `</div>`
};
const MODEL_NOTE = 'Positive weights make a question easier, negative weights make it harder. It picks new words and question types near an 80% success rate. Words you keep missing also get their own extra difficulty term, like a Rasch model.';
const progLinks = () => `<div class="card"><button class="sec" onclick="vocab()">Vocabulary list</button><button class="sec" onclick="roadmap()">Roadmap</button></div>`;
function prog() {
  const A = W(),
    n = Date.now(),
    L = A.filter(w => S.i[w.w]),
    sol = L.filter(w => S.i[w.w].s >= 7).length;
  $('#m').innerHTML = `<div class="card"><b>${L.length}</b> items met, <b>${sol}</b> solid, ${A.length} in the deck</div>` + progGroupsCard() + progMap(A,
    n) + progModel() + progLinks() + statsCard() + `<div class="card"><button class="sec" onclick="go('m')">Backup and transfer</button></div>`
}
