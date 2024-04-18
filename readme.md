# Guida all'installazione di Accessible Slick per Liferay

Questa guida fornisce istruzioni dettagliate su come integrare Accessible Slick, una versione migliorata di Slick per l'accessibilità, nel tuo progetto Liferay.

## Prerequisiti

Assicurati di avere accesso al codice sorgente del tema del tuo progetto Liferay prima di iniziare l'integrazione.

## Passaggi di Installazione

### 1. Aggiunta della Cartella Accessible Slick

Copia la cartella `accessible-slick-1.0.1` all'interno della directory `vendor` del tuo tema Liferay.

### 2. Importazione dei File SCSS

Apri il file `_clay_custom.scss` del tuo tema e aggiungi le seguenti importazioni alla cima del file:

`
@import "../vendor/accessible-slick-1.0.1/slick.scss";
@import "../vendor/accessible-slick-1.0.1/accessible-slick-theme.scss";

### 3. Importazione dei File JS
Nel file `portal_normal.ftl`, aggiungi la seguente riga di codice all'interno del tag `<head></head>` con il path corretto del file slick.js 

`<script type="text/javascript" src="${themeDisplay.pathThemeRoot}/vendor/accessible-slick-1.0.1/slick.js"></script>`

### 4. Configurazione del Percorso dei Font
Nel file `_clay_variables.scss`, configura la variabile `$slick-font-path` con il percorso corretto dove sono situati i font di Slick. Ad esempio:

`$slick-font-path: "../vendor/accessible-slick-1.0.1/fonts/";`

### 5. Build e Deploy del Tema
Utilizza gli strumenti di build del tuo progetto per compilare il tema modificato. Una volta completato, carica il tema aggiornato sul tuo portale Liferay seguendo la procedura standard di deploy.

### 6. Importazione del Componente Carosello
Decomprimi il file carousel.zip trovato nella cartella Componente-liferay e importa il componente risultante nella sezione dei frammenti del tuo portale Liferay.

### 7. Aggiunta del Componente a una Pagina
Vai alla pagina dove desideri inserire il carosello e aggiungi il componente di carosello appena importato.

---

## Configurazione del Componente Carosello

Per configurare il componente carosello nel tuo sito Liferay, segui questi passaggi dettagliati:

### 1. Aggiunta del Componente Carosello alla Pagina

- Posiziona il componente carosello nella pagina desiderata attraverso l'interfaccia di gestione dei contenuti di Liferay.

### 2. Inserimento di Contenuti tramite Drop-zone

- All'interno della drop-zone del carosello, puoi inserire:
  - Un componente **griglia**, per una disposizione personalizzata di elementi come card o immagini.
  - Un widget **Collection Display** nativo di Liferay 7.4, per visualizzare contenuti dinamici basati su una collection predefinita.

### 3. Configurazione della Griglia o del Widget Collection Display

- **Per la Griglia**: Configura normalmente inserendo card, immagini o qualsiasi altro elemento desideri mostrare.
- **Per il Widget Collection Display**: Seleziona la collection che intendi visualizzare all'interno del carosello.

### 4. Personalizzazione della Visualizzazione

- Utilizza l'editor di Liferay per determinare quanti elementi della griglia o della collection visualizzare per ogni breakpoint. Questo passaggio ti permette di ottimizzare la visualizzazione del carosello su dispositivi di diverse dimensioni.

### 5. Impostazioni del Carosello

- Configura le opzioni del carosello secondo le tue preferenze. Questo può includere la velocità di scorrimento, l'autoplay, la visualizzazione di frecce di navigazione, e altro.

### 6. Pubblicazione

- Una volta configurato il carosello come desiderato, procedi con la pubblicazione sulla tua pagina.

Seguendo questi passaggi, sarai in grado di configurare efficacemente il componente carosello, migliorando l'interattività e l'estetica del tuo sito Liferay.

