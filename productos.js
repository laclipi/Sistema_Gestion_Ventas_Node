const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM productos', (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

router.post('/', (req, res) => {
  const { nombre, precio, stock } = req.body;
  db.query('INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
    [nombre, precio, stock],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ id: result.insertId });
    });
});

module.exports = router;