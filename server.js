const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 Conexión MySQL (usaremos variables de Railway)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  multipleStatements: true
});

db.connect(err => {
  if (err) {
    console.error("Error conexión MySQL:", err);
  } else {
    console.log("Conectado a MySQL");
  }
});

// 🔹 LOGIN
app.post("/login", (req, res) => {

  const { nombre, password } = req.body;

  if (!nombre || !password) {
    return res.send("FALTAN DATOS");
  }

  const sql = "SELECT * FROM equipos WHERE nombre_equipo=? AND password_hash=?";
  
  db.query(sql, [nombre, password], (err, result) => {

    if (err) {
      console.error(err);
      return res.status(500).send("ERROR");
    }

    if (result.length > 0) {
      const equipo = result[0];
      res.send(`OK|${equipo.id_equipo}|${equipo.nombre_equipo}`);
    } else {
      res.send("ERROR");
    }
  });
});

app.get("/crear-tablas", (req, res) => {

  const sql = `
  CREATE TABLE IF NOT EXISTS equipos (
      id_equipo INT AUTO_INCREMENT PRIMARY KEY,
      nombre_equipo VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS resultados (
      id_resultado INT AUTO_INCREMENT PRIMARY KEY,
      id_equipo INT NOT NULL UNIQUE,
      puntaje_total INT NOT NULL,
      tiempo_total_segundos INT NOT NULL,
      fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_resultados_equipo
          FOREIGN KEY (id_equipo)
          REFERENCES equipos(id_equipo)
          ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS usuario (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL
  );
  `;

  db.query(sql, (err) => {
    if (err) return res.send("Error creando tablas: " + err);
    res.send("Tablas creadas correctamente");
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});