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