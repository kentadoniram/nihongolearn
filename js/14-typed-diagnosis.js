/* js/14-typed-diagnosis.js
 * Purpose: Typed answer diagnosis: endings, particles and what differs.
 * Defines (4): EN, ending, PR, diagT
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
const EN = [[/ませんでした$/, 'past negative (polite)'], [/でした$/, 'was / were (polite)'], [/ました$/, 'past (polite)'],
  [/ません$/, 'negative (polite)'], [/[てで]います$/, 'ongoing or resulting state (-ている)'], [/ですか$/, 'question (polite)'],
  [/たいです$/, 'want to (-たい)'], [/[てで]ください$/, 'please do (-てください)'], [/ます$/, 'present or future (polite)'],
  [/です$/, 'is / am / are (polite)']];
const ending = x => (EN.find(y => y[0].test(x)) || [])[1];
const PR = { は: 'topic', が: 'subject', を: 'object', に: 'target, destination or time', で: 'place of action or means',
  へ: 'direction', と: 'together with', も: 'also' };
function diagT(q, un, cn, hk) {
  const m = [],
    nz = x => x.replace(/を/g, 'お').replace(/は/g, 'わ').replace(/へ/g, 'え'),
    a = ending(un),
    b = ending(cn);
  if (hk) m.push('I could not read some kanji in your answer. Try writing those words in hiragana or romaji.');
  if (a != b) m.push(`Tense or form: your sentence ends as “${a||'no clear verb ending'}”, but it needs “${b}”.`);
  if ([...un].sort().join('') == [...cn].sort().join('')) m.push('You have the right pieces in the wrong order. Japanese keeps each particle right after its word and puts the verb last. English order (subject, verb, object) does not carry over.');
  else {
    const tl = nz(q.r[q.r.length - 1]);
    if (!un.endsWith(tl) && un.includes(tl)) m.push('The verb (predicate) must come last in a Japanese sentence.');
    q.t.forEach((t, i) => {
      if (PR[t] && i) {
        if (!un.includes(nz(q.r[i - 1] + q.r[i]))) m.push(`Check the particle after ${q.t[i-1]}: it needs ${t} (${PR[t]}).`)
      } else if (!PR[t] && i < q.t.length - 1 && !un.includes(nz(q.r[i]))) m.push(`I cannot find ${t} (${q.r[i]}) in your answer.`)
    })
  }
  return m
}
