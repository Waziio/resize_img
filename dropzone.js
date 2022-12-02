// modules
const express = require("express");
const app = express();
const path = require("path");
const jimp = require("jimp");
const fs = require("fs");
const fileupload = require("express-fileupload");
app.use(fileupload());

// Affiche la page d'accueil sur le serv
app.get("/", (req, res) => {
  var files = fs.readdirSync(__dirname + "/save");

  // Supprime tout les fichiers de save
  for (const file of files) {
    fs.unlinkSync(__dirname + "/save/" + file);
  }

  res.sendFile(path.join(__dirname, "index.html"));
});

// Reçoit l'image uploader et renvoie la page de téléchargement
app.post("/api", (req, res) => {
  var file = req.files.file;
  var pathFile;

  file.mv(path.join(__dirname, "save/") + file.name, () => {
    pathFile = path.join(__dirname, "save/");
    var height = req.body.radio;
    var width = height === 1080 ? 1920 : height === 720 ? 1280 : 960;
    resizeImg(pathFile + file.name, width, height)
      .then(() => {
        res.write(
          `<p><a id="dlBtn" href="/download/${file.name}" download>Telecharger</a></p>\n <a href="/">Revenir a l'accueil</a>`
        );
        res.end();
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/500");
      });
  });
});

// Page de téléchargement qui renvoie le fichier modifié
app.get("/download/:fichier", (req, res) => {
  res.sendFile(path.join(__dirname, "save/") + req.params.fichier);
  console.log(path.join(__dirname, "save/") + req.params.fichier);
});

app.get("/500", (req, res) => {
  res.status(500).send("t'es mort");
});

app.listen(8080, () => {
  console.log("Serveur");
});

// Fonction de redimensionnement de l'image
async function resizeImg(path, w, h) {
  const img = await jimp.read(path);
  img.resize(w * 1, h * 1).write(path); // on multiplie par 1 pour assurer que w et h sont des nombres
}
