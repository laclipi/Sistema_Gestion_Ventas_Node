async function cargarProductos() {
  const res = await fetch("http://localhost:3000/api/productos");
  const datos = await res.json();
  // luego actualizar el select...
}

class Producto {
  constructor(nombre, precio, stock) {
    this.id = Date.now();
    this.nombre = nombre;
    this.precio = parseFloat(precio);
    this.stock = parseInt(stock);
  }
}

class Cliente {
  constructor(nombre, email) {
    this.id = Date.now();
    this.nombre = nombre;
    this.email = email;
  }
}

class CarritoDeCompras {
  constructor() {
    this.productos = [];
  }

  agregarProducto(producto, cantidad) {
    this.productos.push({ producto, cantidad });
  }

  calcularTotal() {
    return this.productos.reduce(
      (acc, item) => acc + item.producto.precio * item.cantidad,
      0
    );
  }
}

class Factura {
  constructor(cliente, carrito) {
    this.id = Date.now();
    this.fecha = new Date();
    this.total = carrito.calcularTotal();
    this.cliente = cliente;
    this.carrito = carrito;
  }
}

const productos = [];
const clientes = [];
let carrito = new CarritoDeCompras();

function agregarProducto() {
  const nombre = document.getElementById("nombreProducto").value;
  const precio = document.getElementById("precioProducto").value;
  const stock = document.getElementById("stockProducto").value;

  if (!nombre || !precio || !stock) return alert("Completa todos los campos.");

  const producto = new Producto(nombre, precio, stock);
  productos.push(producto);
  actualizarSelectProductos();
  alert("Producto agregado.");
}

function registrarCliente() {
  const nombre = document.getElementById("nombreCliente").value;
  const email = document.getElementById("emailCliente").value;

  if (!nombre || !email) return alert("Completa los datos del cliente.");

  const cliente = new Cliente(nombre, email);
  clientes.push(cliente);
  actualizarSelectClientes();
  alert("Cliente registrado.");
}

function actualizarSelectProductos() {
  const select = document.getElementById("selectProducto");
  select.innerHTML = productos.map(p => 
    `<option value="${p.id}">${p.nombre} - $${p.precio}</option>`
  ).join("");
}

function actualizarSelectClientes() {
  const select = document.getElementById("selectCliente");
  select.innerHTML = clientes.map(c => 
    `<option value="${c.id}">${c.nombre}</option>`
  ).join("");
}

function agregarAlCarrito() {
  const idProducto = document.getElementById("selectProducto").value;
  const cantidad = parseInt(document.getElementById("cantidadProducto").value);

  const producto = productos.find(p => p.id == idProducto);
  if (!producto || cantidad > producto.stock) {
    return alert("Producto no disponible o stock insuficiente.");
  }

  carrito.agregarProducto(producto, cantidad);
  producto.stock -= cantidad;
  alert("Producto agregado al carrito.");
}

function generarFactura() {
  const idCliente = document.getElementById("selectCliente").value;
  const cliente = clientes.find(c => c.id == idCliente);

  const factura = new Factura(cliente, carrito);
  mostrarFactura(factura);

  // Reiniciar carrito
  carrito = new CarritoDeCompras();
}

function mostrarFactura(factura) {
  const lista = document.getElementById("factura");
  lista.innerHTML = `
    <li>Factura #${factura.id}</li>
    <li>Cliente: ${factura.cliente.nombre}</li>
    <li>Fecha: ${factura.fecha.toLocaleString()}</li>
    <li>Total: $${factura.total.toFixed(2)}</li>
  `;
}
