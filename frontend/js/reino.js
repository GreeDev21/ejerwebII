// reino.js — al abrir el salón pregunta: “¿tenés sello de sesión?” Si no, volvés al login.

const subtitle = document.getElementById("reino-subtitle");
const body = document.getElementById("reino-body");
const nombre = document.getElementById("reino-nombre");
const avatar = document.getElementById("reino-avatar");
const mensaje = document.getElementById("reino-mensaje");
const rol = document.getElementById("reino-rol");
const contenidos = document.getElementById("reino-contenidos");
const sello = document.getElementById("reino-sello");
const logoutButton = document.getElementById("logout-button");

// El servidor borra la sesión a los 60 segundos. Acá contamos ese mismo minuto.
const SESSION_MS = 60_000;

// De “Bienvenido al dashboard AGUSTIN” nos quedamos con la última palabra: AGUSTIN.
function extraerNombre(texto) {
  const parts = String(texto || "").trim().split(/\s+/);
  return parts.at(-1) || "Viajero";
}

// Reloj del sello: cada cuarto de segundo baja el número. En 0, te manda al login.
function iniciarSello() {
  const started = Date.now();

  const tick = () => {
    const left = Math.max(0, SESSION_MS - (Date.now() - started));
    const seconds = Math.ceil(left / 1000);
    sello.textContent = seconds > 0 ? `${seconds} s` : "expirado";

    if (left <= 0) {
      window.location.replace("/");
      return;
    }

    window.setTimeout(tick, 250);
  };

  tick();
}

// Pide al servidor los datos del viajero. Sin galletita válida, no hay salón.
async function cargarReino() {
  try {
    const response = await fetch("/dashboard", {
      credentials: "same-origin",
    });

    // 401 = “no estás logueado”. replace evita que el botón Atrás te deje en un salón vacío.
    if (response.status === 401) {
      window.location.replace("/");
      return;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      subtitle.textContent = data.error || "El sello de sesión no es válido.";
      return;
    }

    const viajero = extraerNombre(data.mensaje);
    subtitle.textContent = "Las puertas se abrieron";
    nombre.textContent = viajero;
    avatar.textContent = viajero.slice(0, 1).toUpperCase(); // la inicial del nombre
    mensaje.textContent = data.mensaje || "Bienvenido al dashboard";
    rol.textContent = data.rol || "—";
    contenidos.textContent = data.contenidos || "—";
    body.hidden = false; // recién ahora se ve la carta
    iniciarSello();
  } catch (error) {
    subtitle.textContent = "No se pudo hablar con el servidor.";
  }
}

// Rompe la galletita en el servidor y vuelve a la puerta.
logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  try {
    await fetch("/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  } finally {
    window.location.replace("/");
  }
});

cargarReino();
