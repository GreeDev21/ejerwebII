const express = require("express");
const app = express();

// CONFIGURACIÓN CLAVE: Definir carpeta para archivos estáticos (CSS, imágenes)
app.use(express.static("./public"));

// Configurar EJS como motor de plantillas
app.set("view engine", "ejs");

app.listen(3000, () =>
  console.log("Servidor corriendo en http://localhost:3000"),
);
