const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");

const PORT = 3000;

// Nastavení middleware pro zpracování urlencoded dat
app.use(bodyParser.urlencoded({ extended: true }));

// Nastavení statického adresáře pro veřejné soubory (např. css, img)
app.use('/public', express.static('public', {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.css')) {
      res.set('Content-Type', 'text/css');
    }
  }
}));

// Nastavení templating enginu na EJS
app.set("view engine", "ejs");

// Cesta k zobrazení domovské stránky
app.get("/", (req, res) => {
  res.render("index", { title: "Webová anketa" }); 
});

// Cesta ke zpracování odeslaných dat z formuláře
app.post("/submit", (req, res) => {
  const newResponse = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    answers: req.body,
  };

  // Čtení stávajících dat ze souboru responses.json
  fs.readFile("responses.json", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Nastala chyba při čtení dat.');
    }

    let json = JSON.parse(data);
    json.push(newResponse);

    // Zápis aktualizovaných dat zpět do souboru responses.json
    fs.writeFile("responses.json", JSON.stringify(json, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Nastala chyba při zápisu dat.');
      }
      console.log("Data byla úspěšně uložena.");
      res.redirect("/results");
    });
  });
});

// Cesta pro zobrazení výsledků ankety
app.get("/results", (req, res) => {
  fs.readFile('responses.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Nastala chyba při čtení dat.');
    }
    const responses = JSON.parse(data);
    res.render('results', { title: "Výsledky ankety", responses });
  });
});

// Spuštění serveru
app.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});
