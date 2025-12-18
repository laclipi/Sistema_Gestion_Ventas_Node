CREATE DATABASE ventas;

USE ventas;

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  precio DECIMAL(10,2),
  stock INT
);

CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(100)
);

CREATE TABLE facturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT,
  fecha DATETIME,
  total DECIMAL(10,2),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE carrito (
  id INT AUTO_INCREMENT PRIMARY KEY,
  factura_id INT,
  producto_id INT,
  cantidad INT,
  FOREIGN KEY (factura_id) REFERENCES facturas(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);