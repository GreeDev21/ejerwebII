const form = document.getElementById("login-form");
const alertBox = document.getElementById("login-alert");
const submitBtn = document.getElementById("login-submit");

const UNAVAILABLE = {
  registrar: "El registro no existe en el servidor actual.",
  recuperar: "La recuperación de clave no existe en el servidor actual.",
  facebook: "Facebook no está conectado en el backend de hoy.",
  ok: "Odnoklassniki no está conectado en el backend de hoy.",
  vk: "VK no está conectado en el backend de hoy.",
  invitado: "El acceso de invitado vive en middleware.js, no en las sesiones.",
};

function showAlert(message, tone = "error") {
  alertBox.hidden = false;
  alertBox.dataset.tone = tone;
  alertBox.textContent = message;
}

function hideAlert() {
  alertBox.hidden = true;
  alertBox.textContent = "";
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.querySelector(".login-button__label").textContent = isLoading
    ? "Abriendo las puertas…"
    : "Entrar al Reino";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideAlert();

  const username = form.username.value.trim();
  const pass = form.pass.value;

  if (!username || !pass) {
    showAlert("Escribí usuario y contraseña para cruzar el umbral.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ username, pass }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      showAlert(data.mensaje || "Usuario logueado correctamente", "success");
      window.location.href = "/reino";
      return;
    }

    showAlert(data.error || "Credenciales no válidas");
  } catch (error) {
    showAlert("No se pudo hablar con el reino. ¿Está corriendo el servidor en el puerto 3000?");
  } finally {
    setLoading(false);
  }
});

document.querySelectorAll("[data-unavailable]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const key = link.getAttribute("data-unavailable");
    showAlert(UNAVAILABLE[key] || "Ese camino no está abierto todavía.");
  });
});
