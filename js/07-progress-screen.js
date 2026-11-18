/* js/07-progress-screen.js
 * Purpose: Progress screen: summary, the difficulty model and links.
 * Defines (4): progModel, MODEL_NOTE, progLinks, prog
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
const progModel = () => {
  const mu = t => `<p class="mu" style="text-align:left">${t}</p>`;
  return `<div class="card"><b>Difficulty model</b>` + mu(`Logistic regression predicting your chance of a correct answer, trained on ${S.mdl.n} answers. ` + MODEL_NOTE) + mu(`Fit check, −log L (lower is better, a coin flip scores 0.69): last 20 answers ${nlq()[0]}, all answers ${nlq()[1]}.`) + mu(`Calibration, predicted band vs actual success: ${calq()}.`) + attr() + FN
    .map((n, i) => `<div>${n}: ${S.mdl.w[i].toFixed(2)}</div>`).join('') + `</div>`
};
const MODEL_NOTE = 'Positive weights make a question easier, negative weights make it harder. It picks new words and question types near an 80% success rate. Words you keep missing also get their own extra difficulty term, like a Rasch model.';
const progLinks = () => `<div class="card"><button class="sec" onclick="vocab()">Vocabulary list</button><button class="sec" onclick="roadmap()">Roadmap</button></div>`;
function prog() {
  const A = W(),
    L = A.filter(w => S.i[w.w]),
    sol = L.filter(w => S.i[w.w].s >= 7).length;
  $('#m').innerHTML = `<h2 class="sh">Progress</h2><div class="card"><b>${L.length}</b> items met, <b>${sol}</b> solid, ${A.length} in the deck</div>` + pvCard() + ppCard() + progMap() + progModel() + progLinks() + statsCard() + `<div class="card"><button class="sec" onclick="go('m')">Backup and transfer</button></div>`
}
