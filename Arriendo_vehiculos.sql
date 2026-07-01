DROP DATABASE IF EXISTS arriendo_vehiculos;

CREATE DATABASE arriendo_vehiculos
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE arriendo_vehiculos;

CREATE TABLE perfiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  perfil_id INT NOT NULL,
  rut VARCHAR(12) NOT NULL UNIQUE,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_usuarios_perfiles
    FOREIGN KEY (perfil_id) REFERENCES perfiles(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE tipos_vehiculo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  descripcion VARCHAR(255) NOT NULL,
  valor_diario INT UNSIGNED NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT chk_tipos_valor_diario
    CHECK (valor_diario > 0)
) ENGINE=InnoDB;

CREATE TABLE vehiculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo_id INT NOT NULL,
  patente VARCHAR(10) NOT NULL UNIQUE,
  marca VARCHAR(80) NOT NULL,
  modelo VARCHAR(80) NOT NULL,
  anio SMALLINT UNSIGNED NOT NULL,
  color VARCHAR(50) NOT NULL,
  estado ENUM('disponible', 'arrendado', 'en_mantenimiento', 'de_baja') NOT NULL DEFAULT 'disponible',
  foto_url VARCHAR(255) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_vehiculos_tipos
    FOREIGN KEY (tipo_id) REFERENCES tipos_vehiculo(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT chk_vehiculos_anio
    CHECK (anio >= 1990)
) ENGINE=InnoDB;

CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rut VARCHAR(12) NOT NULL UNIQUE,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(20) NOT NULL,
  direccion VARCHAR(200) NOT NULL,
  licencia_conducir VARCHAR(30) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE arriendos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  vehiculo_id INT NOT NULL,
  usuario_id INT NOT NULL,

  fecha_inicio DATE NOT NULL,
  fecha_termino DATE NOT NULL,
  fecha_hora_entrega DATETIME NOT NULL,
  fecha_hora_recepcion DATETIME NULL,

  valor_diario_aplicado INT UNSIGNED NOT NULL,
  dias_arriendo INT UNSIGNED NOT NULL,
  valor_total INT UNSIGNED NOT NULL,

  estado ENUM('vigente', 'finalizado') NOT NULL DEFAULT 'vigente',

  fotos_entrega JSON NOT NULL,
  fotos_recepcion JSON NULL,

  vehiculo_activo_id INT GENERATED ALWAYS AS (
    CASE WHEN estado = 'vigente' THEN vehiculo_id ELSE NULL END
  ) STORED,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_arriendos_clientes
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_arriendos_vehiculos
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_arriendos_usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT chk_arriendos_fechas
    CHECK (fecha_termino >= fecha_inicio),

  CONSTRAINT chk_arriendos_dias
    CHECK (dias_arriendo > 0),

  CONSTRAINT chk_arriendos_valores
    CHECK (valor_diario_aplicado > 0 AND valor_total > 0),

  CONSTRAINT chk_arriendos_recepcion_estado
    CHECK (
      (estado = 'vigente' AND fecha_hora_recepcion IS NULL)
      OR
      (estado = 'finalizado' AND fecha_hora_recepcion IS NOT NULL)
    ),

  UNIQUE KEY uk_arriendos_vehiculo_vigente (vehiculo_activo_id),
  INDEX idx_arriendos_cliente (cliente_id),
  INDEX idx_arriendos_vehiculo (vehiculo_id),
  INDEX idx_arriendos_usuario (usuario_id),
  INDEX idx_arriendos_estado (estado)
) ENGINE=InnoDB;

INSERT INTO perfiles (id, nombre) VALUES
  (1, 'administrador'),
  (2, 'ejecutivo');

INSERT INTO usuarios (id, perfil_id, rut, nombres, apellidos, email, password_hash, activo) VALUES
  (1, 1, '11111111-1', 'Ana', 'Administrador', 'ana.admin@rentacar.cl', '$2b$10$i0qZQut5gQedLLra22.Pf.x9xR91Gf34yENjpxNkzks6SX8v8IMma', 1),
  (2, 1, '22222222-2', 'Luis', 'Administrador', 'luis.admin@rentacar.cl', '$2b$10$i0qZQut5gQedLLra22.Pf.x9xR91Gf34yENjpxNkzks6SX8v8IMma', 1),
  (3, 2, '33333333-3', 'Carla', 'Ejecutiva', 'carla.ejecutiva@rentacar.cl', '$2b$10$i0qZQut5gQedLLra22.Pf.x9xR91Gf34yENjpxNkzks6SX8v8IMma', 1),
  (4, 2, '44444444-4', 'Marco', 'Ejecutivo', 'marco.ejecutivo@rentacar.cl', '$2b$10$i0qZQut5gQedLLra22.Pf.x9xR91Gf34yENjpxNkzks6SX8v8IMma', 1),
  (5, 2, '55555555-5', 'Paula', 'Ejecutiva', 'paula.ejecutiva@rentacar.cl', '$2b$10$i0qZQut5gQedLLra22.Pf.x9xR91Gf34yENjpxNkzks6SX8v8IMma', 1),
  (6, 2, '66666666-6', 'Felipe', 'Ejecutivo', 'felipe.ejecutivo@rentacar.cl', '$2b$10$i0qZQut5gQedLLra22.Pf.x9xR91Gf34yENjpxNkzks6SX8v8IMma', 1),

  (7, 1, '77777777-7', 'Rosa', 'Admin Inactiva', 'rosa.admin@rentacar.cl', '$2b$10$i0qZQut5gQedLLra22.Pf.x9xR91Gf34yENjpxNkzks6SX8v8IMma', 0),
  (8, 1, '88888888-8', 'Pedro', 'Admin Inactivo', 'pedro.admin@rentacar.cl', '$2b$10$i0qZQut5gQedLLra22.Pf.x9xR91Gf34yENjpxNkzks6SX8v8IMma', 0),
  (9, 2, '99999999-9', 'Sofia', 'Ejecutiva Inactiva', 'sofia.ejecutiva@rentacar.cl', '$2b$10$i0qZQut5gQedLLra22.Pf.x9xR91Gf34yENjpxNkzks6SX8v8IMma', 0),
  (10, 2, '10101010-0', 'Tomas', 'Ejecutivo Inactivo', 'tomas.ejecutivo@rentacar.cl', '$2b$10$i0qZQut5gQedLLra22.Pf.x9xR91Gf34yENjpxNkzks6SX8v8IMma', 0);

INSERT INTO tipos_vehiculo (id, nombre, descripcion, valor_diario, activo) VALUES
  (1, 'Sedán', 'Vehículo de pasajeros de cuatro puertas.', 30000, 1),
  (2, 'SUV', 'Vehículo familiar de mayor tamaño y altura.', 55000, 1),
  (3, 'Moto', 'Vehículo motorizado de dos ruedas.', 18000, 1),
  (4, 'Coupé', 'Vehículo compacto de estilo deportivo.', 42000, 1),
  (5, 'Camioneta', 'Vehículo de carga liviana o uso mixto.', 50000, 1);

INSERT INTO vehiculos (id, tipo_id, patente, marca, modelo, anio, color, estado, foto_url, activo) VALUES
  (1, 1, 'SDAN-01', 'Toyota', 'Yaris', 2022, 'Blanco', 'arrendado', '/images/vehiculos/sdan-01.jpg', 1),
  (2, 1, 'SDAN-02', 'Hyundai', 'Accent', 2021, 'Gris', 'arrendado', '/images/vehiculos/sdan-02.jpg', 1),
  (3, 1, 'SDAN-03', 'Kia', 'Rio', 2020, 'Azul', 'disponible', '/images/vehiculos/sdan-03.jpg', 1),

  (4, 2, 'SUVE-01', 'Hyundai', 'Tucson', 2023, 'Negro', 'arrendado', '/images/vehiculos/suve-01.jpg', 1),
  (5, 2, 'SUVE-02', 'Toyota', 'RAV4', 2022, 'Rojo', 'arrendado', '/images/vehiculos/suve-02.jpg', 1),
  (6, 2, 'SUVE-03', 'Nissan', 'X-Trail', 2021, 'Blanco', 'disponible', '/images/vehiculos/suve-03.jpg', 1),

  (7, 3, 'MOTO-01', 'Honda', 'CB190R', 2022, 'Negro', 'arrendado', '/images/vehiculos/moto-01.jpg', 1),
  (8, 3, 'MOTO-02', 'Yamaha', 'FZ25', 2023, 'Azul', 'arrendado', '/images/vehiculos/moto-02.jpg', 1),
  (9, 3, 'MOTO-03', 'Suzuki', 'Gixxer', 2021, 'Rojo', 'disponible', '/images/vehiculos/moto-03.jpg', 1),

  (10, 4, 'COUP-01', 'Mini', 'Cooper', 2022, 'Verde', 'arrendado', '/images/vehiculos/coup-01.jpg', 1),
  (11, 4, 'COUP-02', 'BMW', 'Serie 2', 2021, 'Gris', 'disponible', '/images/vehiculos/coup-02.jpg', 1),
  (12, 4, 'COUP-03', 'Audi', 'TT', 2020, 'Blanco', 'en_mantenimiento', '/images/vehiculos/coup-03.jpg', 1),

  (13, 5, 'CAMI-01', 'Toyota', 'Hilux', 2023, 'Blanco', 'arrendado', '/images/vehiculos/cami-01.jpg', 1),
  (14, 5, 'CAMI-02', 'Mitsubishi', 'L200', 2022, 'Plata', 'disponible', '/images/vehiculos/cami-02.jpg', 1),
  (15, 5, 'CAMI-03', 'Ford', 'Ranger', 2021, 'Azul', 'de_baja', '/images/vehiculos/cami-03.jpg', 0);

INSERT INTO clientes (id, rut, nombres, apellidos, email, telefono, direccion, licencia_conducir, activo) VALUES
  (1, '18111111-1', 'Camila', 'Rojas Pérez', 'camila.rojas@gmail.com', '+56911111111', 'Av. Libertad 100, Viña del Mar', 'B-18111111', 1),
  (2, '18222222-2', 'Diego', 'Morales Díaz', 'diego.morales@gmail.com', '+56922222222', 'Calle Valparaíso 200, Viña del Mar', 'B-18222222', 1),
  (3, '18333333-3', 'Valentina', 'Soto Muñoz', 'valentina.soto@gmail.com', '+56933333333', 'Av. Argentina 300, Valparaíso', 'B-18333333', 1),
  (4, '18444444-4', 'Matías', 'Herrera Silva', 'matias.herrera@gmail.com', '+56944444444', 'Los Carrera 400, Quilpué', 'B-18444444', 1),
  (5, '18555555-5', 'Fernanda', 'Castillo Vega', 'fernanda.castillo@gmail.com', '+56955555555', 'Avenida Principal 500, Concón', 'B-18555555', 1),
  (6, '18666666-6', 'Nicolás', 'Pavez Torres', 'nicolas.pavez@gmail.com', '+56966666666', 'Calle Central 600, Villa Alemana', 'B-18666666', 1);

INSERT INTO arriendos (
  id, cliente_id, vehiculo_id, usuario_id,
  fecha_inicio, fecha_termino, fecha_hora_entrega, fecha_hora_recepcion,
  valor_diario_aplicado, dias_arriendo, valor_total,
  estado, fotos_entrega, fotos_recepcion
) VALUES
  (1, 1, 3, 3, '2026-04-01', '2026-04-03', '2026-04-01 09:30:00', '2026-04-03 18:00:00', 30000, 3, 90000, 'finalizado',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-1-entrega-1.jpg', '/images/arriendos/entregas/arriendo-1-entrega-2.jpg'),
    JSON_ARRAY('/images/arriendos/recepciones/arriendo-1-recepcion-1.jpg', '/images/arriendos/recepciones/arriendo-1-recepcion-2.jpg')),
  (2, 1, 6, 4, '2026-05-10', '2026-05-12', '2026-05-10 10:00:00', '2026-05-12 17:30:00', 55000, 3, 165000, 'finalizado',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-2-entrega-1.jpg'),
    JSON_ARRAY('/images/arriendos/recepciones/arriendo-2-recepcion-1.jpg')),

  (3, 2, 9, 4, '2026-03-15', '2026-03-17', '2026-03-15 08:45:00', '2026-03-17 16:20:00', 18000, 3, 54000, 'finalizado',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-3-entrega-1.jpg'),
    JSON_ARRAY('/images/arriendos/recepciones/arriendo-3-recepcion-1.jpg')),

  (4, 3, 11, 5, '2026-02-05', '2026-02-08', '2026-02-05 12:00:00', '2026-02-08 18:10:00', 42000, 4, 168000, 'finalizado',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-4-entrega-1.jpg'),
    JSON_ARRAY('/images/arriendos/recepciones/arriendo-4-recepcion-1.jpg')),
  (5, 3, 14, 5, '2026-04-22', '2026-04-24', '2026-04-22 11:15:00', '2026-04-24 19:00:00', 50000, 3, 150000, 'finalizado',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-5-entrega-1.jpg'),
    JSON_ARRAY('/images/arriendos/recepciones/arriendo-5-recepcion-1.jpg')),
  (6, 3, 3, 6, '2026-05-18', '2026-05-20', '2026-05-18 09:00:00', '2026-05-20 15:40:00', 30000, 3, 90000, 'finalizado',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-6-entrega-1.jpg'),
    JSON_ARRAY('/images/arriendos/recepciones/arriendo-6-recepcion-1.jpg')),

  (7, 4, 12, 3, '2026-01-10', '2026-01-12', '2026-01-10 13:00:00', '2026-01-12 16:00:00', 42000, 3, 126000, 'finalizado',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-7-entrega-1.jpg'),
    JSON_ARRAY('/images/arriendos/recepciones/arriendo-7-recepcion-1.jpg')),
  (8, 4, 15, 4, '2026-03-01', '2026-03-05', '2026-03-01 10:30:00', '2026-03-05 17:45:00', 50000, 5, 250000, 'finalizado',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-8-entrega-1.jpg'),
    JSON_ARRAY('/images/arriendos/recepciones/arriendo-8-recepcion-1.jpg')),

  (9, 5, 6, 5, '2026-05-01', '2026-05-02', '2026-05-01 15:00:00', '2026-05-02 18:00:00', 55000, 2, 110000, 'finalizado',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-9-entrega-1.jpg'),
    JSON_ARRAY('/images/arriendos/recepciones/arriendo-9-recepcion-1.jpg')),

  (10, 6, 9, 6, '2026-04-03', '2026-04-04', '2026-04-03 09:10:00', '2026-04-04 13:30:00', 18000, 2, 36000, 'finalizado',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-10-entrega-1.jpg'),
    JSON_ARRAY('/images/arriendos/recepciones/arriendo-10-recepcion-1.jpg')),
  (11, 6, 11, 3, '2026-06-01', '2026-06-03', '2026-06-01 08:40:00', '2026-06-03 18:20:00', 42000, 3, 126000, 'finalizado',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-11-entrega-1.jpg'),
    JSON_ARRAY('/images/arriendos/recepciones/arriendo-11-recepcion-1.jpg'));

INSERT INTO arriendos (
  id, cliente_id, vehiculo_id, usuario_id,
  fecha_inicio, fecha_termino, fecha_hora_entrega, fecha_hora_recepcion,
  valor_diario_aplicado, dias_arriendo, valor_total,
  estado, fotos_entrega, fotos_recepcion
) VALUES
  (12, 1, 1, 3, '2026-06-23', '2026-06-28', '2026-06-23 09:00:00', NULL, 30000, 6, 180000, 'vigente',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-12-entrega-1.jpg', '/images/arriendos/entregas/arriendo-12-entrega-2.jpg'), NULL),
  (13, 1, 2, 4, '2026-06-24', '2026-06-29', '2026-06-24 11:00:00', NULL, 30000, 6, 180000, 'vigente',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-13-entrega-1.jpg'), NULL),

  (14, 2, 4, 4, '2026-06-22', '2026-06-27', '2026-06-22 10:30:00', NULL, 55000, 6, 330000, 'vigente',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-14-entrega-1.jpg'), NULL),
  (15, 2, 5, 5, '2026-06-20', '2026-06-30', '2026-06-20 13:20:00', NULL, 55000, 11, 605000, 'vigente',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-15-entrega-1.jpg'), NULL),
  (16, 2, 7, 5, '2026-06-25', '2026-06-27', '2026-06-25 08:50:00', NULL, 18000, 3, 54000, 'vigente',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-16-entrega-1.jpg'), NULL),

  (17, 3, 8, 6, '2026-06-21', '2026-06-26', '2026-06-21 16:00:00', NULL, 18000, 6, 108000, 'vigente',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-17-entrega-1.jpg'), NULL),

  (18, 4, 10, 3, '2026-06-23', '2026-07-01', '2026-06-23 12:40:00', NULL, 42000, 9, 378000, 'vigente',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-18-entrega-1.jpg'), NULL),

  (19, 5, 13, 4, '2026-06-24', '2026-07-02', '2026-06-24 09:25:00', NULL, 50000, 9, 450000, 'vigente',
    JSON_ARRAY('/images/arriendos/entregas/arriendo-19-entrega-1.jpg'), NULL);
