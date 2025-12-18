// backend/db.js
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect(err => {
  if (err) throw err;
  console.log('Conectado a MySQL');
});

module.exports = connection;

// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();

const productos = require('./routes/productos');
const clientes = require('./routes/clientes');
const ventas = require('./routes/ventas');

app.use(cors());
app.use(express.json());

app.use('/api/productos', productos);
app.use('/api/clientes', clientes);
app.use('/api/ventas', ventas);

app.listen(3000, () => console.log('Servidor en puerto 3000'));

// backend/routes/productos.js
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

// backend/routes/clientes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM clientes', (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

router.post('/', (req, res) => {
  const { nombre, email } = req.body;
  db.query('INSERT INTO clientes (nombre, email) VALUES (?, ?)',
    [nombre, email],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ id: result.insertId });
    });
});

module.exports = router;

// backend/routes/ventas.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { cliente_id, productos, total } = req.body;
  const fecha = new Date();

  db.query('INSERT INTO facturas (cliente_id, fecha, total) VALUES (?, ?, ?)',
    [cliente_id, fecha, total], (err, result) => {
      if (err) return res.status(500).send(err);
      const facturaId = result.insertId;

      const carritoQueries = productos.map(p => {
        return new Promise((resolve, reject) => {
          db.query('INSERT INTO carrito (factura_id, producto_id, cantidad) VALUES (?, ?, ?)',
            [facturaId, p.id, p.cantidad], (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
        });
      });

      Promise.all(carritoQueries)
        .then(() => res.json({ mensaje: 'Factura generada correctamente', id: facturaId }))
        .catch(err => res.status(500).send(err));
    });
});

module.exports = router;

// frontend/index.html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gestión de Ventas</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <h1>Gestión de Ventas</h1>

  <section>
    <h2>Productos</h2>
    <input id="productoNombre" placeholder="Nombre del producto">
    <input id="productoPrecio" placeholder="Precio" type="number">
    <input id="productoStock" placeholder="Stock" type="number">
    <button onclick="agregarProducto()">Agregar Producto</button>
  </section>

  <section>
    <h2>Clientes</h2>
    <input id="clienteNombre" placeholder="Nombre del cliente">
    <input id="clienteEmail" placeholder="Email del cliente">
    <button onclick="registrarCliente()">Registrar Cliente</button>
  </section>

  <section>
    <h2>Carrito</h2>
    <select id="selectProducto"></select>
    <input id="cantidadProducto" type="number" placeholder="Cantidad">
    <button onclick="agregarAlCarrito()">Agregar al carrito</button>
  </section>

  <section>
    <h2>Facturar</h2>
    <select id="selectCliente"></select>
    <button onclick="generarFactura()">Generar Factura</button>
  </section>

  <script src="script.js"></script>
</body>
</html>

// frontend/styles.css
body {
  font-family: Arial, sans-serif;
  margin: 20px;
}

section {
  margin-bottom: 30px;
}

input, select, button {
  margin: 5px;
  padding: 8px;
}

// frontend/script.js
const API = 'http://localhost:3000/api';
let carrito = [];

async function cargarDatos() {
  const productos = await (await fetch(`${API}/productos`)).json();
  const clientes = await (await fetch(`${API}/clientes`)).json();

  const selectProducto = document.getElementById('selectProducto');
  selectProducto.innerHTML = '';
  productos.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = `${p.nombre} ($${p.precio})`;
    selectProducto.appendChild(option);
  });

  const selectCliente = document.getElementById('selectCliente');
  selectCliente.innerHTML = '';
  clientes.forEach(c => {
    const option = document.createElement('option');
    option.value = c.id;
    option.textContent = c.nombre;
    selectCliente.appendChild(option);
  });
}

async function agregarProducto() {
  const nombre = document.getElementById('productoNombre').value;
  const precio = document.getElementById('productoPrecio').value;
  const stock = document.getElementById('productoStock').value;

  await fetch(`${API}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, precio, stock })
  });

  cargarDatos();
}

async function registrarCliente() {
  const nombre = document.getElementById('clienteNombre').value;
  const email = document.getElementById('clienteEmail').value;

  await fetch(`${API}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email })
  });

  cargarDatos();
}

function agregarAlCarrito() {
  const id = document.getElementById('selectProducto').value;
  const cantidad = parseInt(document.getElementById('cantidadProducto').value);
  carrito.push({ id: parseInt(id), cantidad });
  alert('Producto agregado al carrito');
}

async function generarFactura() {
  const cliente_id = document.getElementById('selectCliente').value;

  // Consulta productos actuales para calcular el total
  const productosActuales = await (await fetch(`${API}/productos`)).json();
  let total = 0;
  carrito.forEach(item => {
    const prod = productosActuales.find(p => p.id === item.id);
    if (prod) total += prod.precio * item.cantidad;
  });

  await fetch(`${API}/ventas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cliente_id, productos: carrito, total })
  });

  alert('Factura generada');
  carrito = [];
}

cargarDatos();