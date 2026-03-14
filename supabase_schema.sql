-- Crear tabla de clientes
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT,
  direccion TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  frecuencia INTEGER DEFAULT 0,
  volumen INTEGER DEFAULT 0,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de pedidos
CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  total DECIMAL(10,2) NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  cantidad INTEGER NOT NULL,
  notas TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de ventas
CREATE TABLE ventas (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  total DECIMAL(10,2) NOT NULL,
  metodo TEXT NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de inventario
CREATE TABLE inventario (
  id SERIAL PRIMARY KEY,
  item TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  umbral INTEGER NOT NULL DEFAULT 0,
  precio DECIMAL(10,2) DEFAULT 0
);

-- Insertar datos de prueba
INSERT INTO clientes (nombre, telefono, direccion, lat, lng, frecuencia, volumen) VALUES
('Casa López', '555-111-2222', 'Col. Centro', 25.6638889, -108.638333, 12, 42),
('Oficinas Delta', '555-333-4444', 'Av. Reforma', 25.660, -108.64, 18, 58),
('Gym Vital', '555-555-6666', 'Roma Norte', 25.670, -108.63, 10, 35);

INSERT INTO inventario (item, stock, umbral, precio) VALUES
('Garrafón lleno', 140, 60, 30.00),
('Garrafón vacío', 220, 80, 100.00),
('Sellos', 480, 150, 0.50),
('Tapas', 900, 300, 1.00);
