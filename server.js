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
  database: process.env.DB_NAME
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});