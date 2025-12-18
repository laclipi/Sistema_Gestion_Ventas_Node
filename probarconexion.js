const mysql = require("mysql");
const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

// Configurar la conexión a la base de datos
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "banco"
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error("Error conectando a la base de datos:", err.stack);
        return;
    }
    console.log("Conectado a la base de datos MySQL");
});

app.get('/consutlas', (req, res) => {
  db.query('SELECT id_usuario,nombre,apellido,email FROM usuarios', (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
