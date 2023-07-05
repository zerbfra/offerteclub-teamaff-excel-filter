# Istruzioni utilizzo

1) Metti in data/allowedAsinFiles liste con un asin per ogni riga
2) Metti in pastRecaps i recap vecchi
3) Il file data/source.xlsx deve essere il file da filtrare che è quello fornito dal team affiliazione senza le scritte prima della riga d'intestazione


## Output

1) File final_asins_file.csv è il file con tutti gli asin univoci tirati fuori dalle selezioni
2) File final_deals_file.csv è il file sorgente filtrato con solo gli asin richiesti

## Installazione

1) scarica questo repo
2) npm install
3) node index.js