/* js/99-boot.js
 * Purpose: Start-up: service worker registration and loading the content.
 * Defines (0): 
 * Classic script: shares one global scope with the other files, so load order (see index.html) matters.
 */
try{navigator.storage.persist()}catch(x){}
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
loadContent().then(()=>go('t')).catch(x=>{$('#m').innerHTML='<div class="card"><b>Lesson files could not be loaded</b><p>'+e(x.message)+'</p><p class="mu" style="text-align:left">Keep content.json and the n5, n4, n3 .json files in a folder called data next to index.html (or all in the same folder as index.html), and open the app from its web address, not by double-clicking the file.</p></div>'});
