# Tecnologia in classe

Una copia statica e indipendente da Wix del sito didattico, con la navigazione originale, le pagine indicizzate, i testi, le immagini e i collegamenti ai materiali.

## Codici di menu e materiali

Ogni voce del menu conserva l'ordine e la gerarchia originali e riceve un codice stabile: `0.HOME`, `1.AREA OSPITI`, `3.TEORIA`, `3.1.Settori produttivi e materiali`, `3.1.1.Nome voce`. Il codice è calcolato dall'ordine della voce nel menu e da quello dei figli; non rinominare o riordinare le voci senza aggiornare i dati e i collegamenti.

I materiali Dropbox copiati nel sito sono denominati `codice__nome-originale.estensione`. Se lo stesso materiale è raggiungibile da più voci, viene copiato una volta per codice. `import-site.ps1` mantiene sincronizzate le copie in `materiali/` e nella cartella locale `PUBBLICABILI/`; i file già presenti con il nome originale vengono conservati. Le immagini delle pagine restano in `materiali/immagini/`.

La cartella Dropbox sorgente è di sola lettura. L'importazione legge i file da lì, ma salva le copie solo nel progetto; non usare un percorso esterno al progetto come destinazione `PUBBLICABILI`. I link sono aggiornati nei dati generati (`resources.json` e `resources-data.js`). Le risorse non associabili a una voce senza supposizioni sono marcate `unmapped-menu` in `import-report.json` e vanno verificate prima di assegnare un codice.

Il bundle destinato al sito (`resources-data.js`) esclude la pagina e gli URL di Google Classroom e omette gli indirizzi email. `resources.json` e `import-report.json` restano dati di lavoro locali e non vanno inclusi nella pubblicazione pubblica.

Il repository pubblico deve contenere solo i file statici elencati in `.gitignore` e i file sotto `materiali/` effettivamente referenziati dai dati del sito. Importazioni, report, prompt e materiali non collegati restano locali.

## Aggiornare la copia dal sito Wix

Apri la cartella del progetto in VS Code e avvia l'attività **Importa risorse collegate** per aggiornare sitemap, pagine e materiali. L'attività **Aggiorna pagine e materiali** usa le pagine e i collegamenti già archiviati in `resources.json`, ma recupera nuovamente da Wix i testi e le immagini delle pagine.

I testi e le immagini delle pagine vengono salvati nei dati statici del progetto; le immagini scaricate e i file Dropbox abbinati si trovano in `materiali/` e `PUBBLICABILI/`. L'importatore usa la variante dimensionata dell'immagine fornita da Wix, assegna un nome locale distinto per variante e conserva i file locali già presenti. La rigenerazione riutilizza la navigazione archiviata e preferisce i testi catturati dal browser quando disponibili. I contenuti verificati di gallerie iframe che la cattura ordinaria non raggiunge possono essere mantenuti in `browser-page-content-extra.json`; l'importatore li unisce ai dati catturati normalmente. I file Dropbox con corrispondenze ambigue, mancanti, oltre 50 MB o con nomi che indicano possibili dati personali/materiali di terzi non vengono copiati. Le immagini non scaricate e le risorse esterne mantengono il collegamento originale. Il dettaglio è in `import-report.json`.

Esegui l'attività **Verifica sito importato** per controllare i dati sincronizzati, le copie locali e i codici di menu.

Prima di rendere pubblico il repository, controlla `import-report.json` e verifica che i materiali inclusi corrispondano alle autorizzazioni per la pubblicazione.

## Consultare il sito

Apri `index.html` nel browser: pagine, navigazione e risorse sono incorporate in `resources-data.js`, quindi non serve un server locale. `resources.json` contiene la copia strutturata dei dati importati. La navigazione mantiene le sezioni e le sottopagine del sito originale; le pagine non incluse nei menu vengono raccolte sotto **Altre pagine**.

## Pubblicazione

Il progetto è statico e non richiede un backend. Dopo averlo trasferito in un repository GitHub pubblico, abilita GitHub Pages per il ramo e la cartella che contengono `index.html`. Video, documenti esterni e immagini che non si riesce a scaricare restano collegamenti ai rispettivi fornitori.
