const express = require("express");
const app = express();

const primerFIltro = (req, res, next) => {
  console.log("Primer filtro. Revisando lista de invitados");
  const tieneInvitacion = req.query.invitado === "true";

  if (tieneInvitacion) {
    console.log("Invitación: OK");
    next();
  } else {
    console.log("Invitación: NO");
    res.status(403).send("Acceso denegado. No tienes invitación");
  }
};

const segundoFiltro = (req, res, next) => {
  console.log("Segundo filtro. Validando credenciales");
  const credencialesValidas = req.query.credenciales === "true";

  if (credencialesValidas) {
    console.log("Credenciales: OK");
    next();
  } else {
    console.log("Credenciales: NO");
    res.status(403).send("Acceso denegado. Credenciales inválidas");
  }
};

app.get("/entrar", primerFIltro, segundoFiltro, (req, res) => {
  console.log("Acceso permitido. Bienvenido al evento");
  res.send("Acceso permitido. Bienvenido al evento");
});

app.listen(3000, () => {
  console.log("Servidor escuchando en el puerto 3000");
});
