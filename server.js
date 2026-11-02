const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const produits = JSON.parse(
  fs.readFileSync(path.join(__dirname, "products.json"), "utf8")
);
const commandes = [];

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/products", (req, res) => {
  res.json(produits);
});

app.post("/api/orders", (req, res) => {
  const { nom, telephone, adresse, paiement, panier } = req.body || {};
  if (!nom || !telephone || !adresse || !Array.isArray(panier)) {
    return res.status(400).json({ erreur: "Informations manquantes" });
  }
  let total = 0;
  const lignes = [];
  for (const l of panier) {
    const p = produits.find((x) => x.id === l.id);
    const q = parseInt(l.quantite, 10);
    if (!p || !(q > 0)) continue;
    total += p.prix * q;
    lignes.push({ nom: p.nom, quantite: q, unite: p.unite });
  }
  if (!lignes.length) {
    return res.status(400).json({ erreur: "Panier vide" });
  }
  const commande = {
    numero: commandes.length + 1,
    nom,
    telephone,
    adresse,
    paiement,
    lignes,
    total,
  };
  commandes.push(commande);
  console.log("NOUVELLE COMMANDE", JSON.stringify(commande));
  res.json({ numero: commande.numero, total });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serveur démarré sur le port " + PORT));
