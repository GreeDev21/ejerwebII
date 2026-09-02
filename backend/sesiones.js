// sesiones.js — el portero del reino.
// Recibe el usuario y la clave, da una galletita de un minuto y sirve las pantallas.

const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();

// Carpeta de la interfaz (HTML, CSS, imágenes). Un piso arriba de /backend.
const frontendDir = path.join(__dirname, "..", "frontend");

// Entiende el cuerpo de las peticiones cuando vienen como JSON (lo que manda el login).
app.use(express.json());

app.use(
  session({
    // Configurar SESIONES
    secret: "the_most_secret_key", // Firma digital: el servidor reconoce “esta galletita es mía”.
    resave: false, // No vuelve a guardar en memoria los datos de una sesion en curso
    saveUninitialized: true, // Comentario original: anónimo. En la práctica, true puede crear cookie temprano.
    cookie: { maxAge: 60000 }, // La sesión expira en 60 segundos
  }),
);

// Simulacion consulta asincrona a una base de datos
// Espera un toque (como si viajara a una base real) y solo conoce al usuario "admin".
const buscarUsuarioEnBase = async (username) => {
  await new Promise((resolve) => setTimeout(resolve, 350));

  let usuario = null;

  // Si el nombre no es admin, devolvemos vacío: no hay otra ficha en esta “base”.
  if (username === "admin") {
    usuario = { username: "AGUSTIN", pass: "1234", rol: "docente" };
  }
  return usuario;
};

// Middleware para validar si el usuario esta logueado
// Si no hay viajero en la sesión, cortamos acá y no mostramos el dashboard.
const verificarSesion = (req, res, next) => {
  if (!req.session || !req.session.usuario) {
    return res
      .status(401)
      .json({ error: "No tiene permisos para acceder a este recurso" });
  }
  next(); // hay sello: sigue a la ruta protegida
};

// ruta Login
app.post("/login", async (req, res) => {
  const { username, pass } = req.body;
  const usuarioBd = await buscarUsuarioEnBase(username);

  // Por defecto perdimos: 402 y el recado de claves mal.
  let estado = 402;
  let respuesta = { error: "Credenciales no válidas" };

  // Si existe la ficha y la clave coincide, guardamos nombre y rol en la galletita (nunca la clave).
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

// Rompe la galletita: el próximo /dashboard ya no te reconoce.
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ mensaje: "Sesión cerrada" });
  });
});

// Ruta protegida: primero verificarSesion, después el saludo.
app.get("/dashboard", verificarSesion, (req, res) => {
  res.json({
    mensaje: `Bienvenido al dashboard ${req.session.usuario.username}`,
    rol: req.session.usuario.rol,
    contenidos: "datos de la asignatura",
  });
});

// Entrega el HTML del salón. Los datos los pide después el JS a /dashboard.
app.get("/reino", (req, res) => {
  res.sendFile(path.join(frontendDir, "reino.html"));
});

// Cualquier otra cosa (css, js, fotos) se busca en la carpeta frontend.
app.use(express.static(frontendDir));

app.listen(3000, () =>
  console.log("Servidor escuchando en http://localhost:3000"),
);
