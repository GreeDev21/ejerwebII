// login.js — qué pasa cuando tocás “Entrar al Reino” o un enlace que todavía no existe.

// Tomamos las piezas de la página por su id, como si fueran manijas con nombre.
const form = document.getElementById("login-form");
const alertBox = document.getElementById("login-alert");
const submitBtn = document.getElementById("login-submit");
const passInput = document.getElementById("pass");
const togglePass = document.getElementById("toggle-pass");

// Textos amables para caminos que el servidor de hoy no atiende.
const UNAVAILABLE = {
  registrar: "El registro todavía no está abierto en este reino.",
  recuperar: "La recuperación de acceso no está habilitada todavía.",
  facebook: "Facebook no está conectado en este servidor.",
  ok: "Odnoklassniki no está conectado en este servidor.",
  vk: "VK no está conectado en este servidor.",
  invitado: "El paso de invitado no está habilitado en las sesiones actuales.",
};

// Muestra el recado. tone "error" lo pinta en rojo; "success" en oro.
function showAlert(message, tone = "error") {
  alertBox.hidden = false;
  alertBox.dataset.tone = tone;
  alertBox.textContent = message;
}

function hideAlert() {
  alertBox.hidden = true;
  alertBox.textContent = "";
}

// Si el campo está vacío, le pone un borde rojo para que se note.
function setFieldValidity(name, isValid) {
  const field = form.querySelector(`[name="${name}"]`)?.closest(".login-field");
  field?.classList.toggle("is-invalid", !isValid);
}

// Mientras espera al servidor: el botón no se puede tocar dos veces y gira un anillo.
function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle("is-loading", isLoading);
  submitBtn.querySelector(".login-button__label").textContent = isLoading
    ? "Abriendo las puertas"
    : "Entrar al Reino";
}

// El ojito cambia la caja de “puntos” a letras visibles, y al revés.
togglePass.addEventListener("click", () => {
  const visible = passInput.type === "text";
  passInput.type = visible ? "password" : "text";
  togglePass.setAttribute("aria-pressed", String(!visible));
  togglePass.setAttribute("aria-label", visible ? "Mostrar contraseña" : "Ocultar contraseña");
});

// Al enviar: no recarga la página; habla con el servidor y espera la respuesta.
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideAlert();

  // trim() saca espacios de más al inicio y al final del usuario.
  const username = form.username.value.trim();
  const pass = form.pass.value;

  setFieldValidity("username", Boolean(username));
  setFieldValidity("pass", Boolean(pass));

  if (!username || !pass) {
    showAlert("Completá usuario y contraseña para cruzar el umbral.");
    return;
  }

  setLoading(true);

  try {
    // POST /login: “tomá este usuario y esta clave, ¿me dejás pasar?”
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin", // para que el navegador guarde la galletita de sesión
      body: JSON.stringify({ username, pass }),
    });

    // El servidor contesta en JSON. Si viniera vacío, usamos un objeto hueco.
    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      showAlert(data.mensaje || "Usuario logueado correctamente", "success");
      window.location.href = "/reino"; // nos mudamos al salón
      return;
    }

    setFieldValidity("pass", false);
    showAlert(data.error || "Credenciales no válidas");
  } catch (error) {
    // Acá no hubo respuesta: el servidor no está prendido o se cortó la red.
    showAlert("No hay conexión con el reino. Confirmá que el servidor esté en el puerto 3000.");
  } finally {
    setLoading(false);
  }
});

// Crear cuenta, recuperar y redes: no navegan; muestran el recado de UNAVAILABLE.
document.querySelectorAll("[data-unavailable]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const key = link.getAttribute("data-unavailable");
    showAlert(UNAVAILABLE[key] || "Ese camino no está abierto todavía.");
  });
});
