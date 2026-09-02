const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();

const frontendDir = path.join(__dirname, "..", "frontend");

app.use(express.json());
app.use(
  session({
    // Configurar SESIONES
    secret: "the_most_secret_key", // Firma digital
    resave: false, // No vuelve a guardar en memoria los datos de una sesion en curso
    saveUninitialized: true, // no se le brinda datos a un usuario anónimo (peticion)
    cookie: { maxAge: 60000 }, // La sesión expira en 60 segundo
  }),
);

// Simulacion consulta asincrona a una base de datos
const buscarUsuarioEnBase = async (username) => {
  await new Promise((resolve) => setTimeout(resolve, 350));

  let usuario = null;

  if (username === "admin") {
    usuario = { username: "AGUSTIN", pass: "1234", rol: "docente" };
  }
  return usuario;
};

// Middleware para validar si el usuario esta logueado
const verificarSesion = (req, res, next) => {
  if (!req.session || !req.session.usuario) {
    return res
      .status(401)
      .json({ error: "No tiene permisos para acceder a este recurso" });
  }
  next();
};

// ruta Login
app.post("/login", async (req, res) => {
  const { username, pass } = req.body;
  const usuarioBd = await buscarUsuarioEnBase(username);

  let estado = 402;
  let respuesta = { error: "Credenciales no válidas" };

  if (usuarioBd && usuarioBd.pass == pass) {
    req.session.usuario = {
      username: usuarioBd.username,
      rol: usuarioBd.rol,
    };

    respuesta = { mensaje: "Usuario logueado correctamente" };
    estado = 200;
  }
  res.status(estado).json(respuesta);
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ mensaje: "Sesión cerrada" });
  });
});

// Ruta protegida
app.get("/dashboard", verificarSesion, (req, res) => {
  res.json({
    mensaje: `Bienvenido al dashboard ${req.session.usuario.username}`,
    rol: req.session.usuario.rol,
    contenidos: "datos de la asignatura",
  });
});

app.get("/reino", (req, res) => {
  res.sendFile(path.join(frontendDir, "reino.html"));
});

app.use(express.static(frontendDir));

app.listen(3000, () =>
  console.log("Servidor escuchando en http://localhost:3000"),
);
