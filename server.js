const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 Conexión MySQL (usaremos variables de Railway)
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

console.log("DATABASE:", process.env.MYSQLDATABASE);

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

app.post("/guardar-resultado", (req, res) => {

  const { id_equipo, tiempo, puntaje } = req.body;

  if (!id_equipo || !tiempo || !puntaje) {
    return res.status(400).send("FALTAN DATOS");
  }

  const sql = `
    INSERT INTO resultados (id_equipo, puntaje_total, tiempo_total_segundos)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [id_equipo, puntaje, tiempo], (err) => {

    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.send("YA_REGISTRADO");
      }

      console.error(err);
      return res.status(500).send("ERROR");
    }

    res.send("OK");
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});