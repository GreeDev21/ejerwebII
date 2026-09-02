const subtitle = document.getElementById("reino-subtitle");
const body = document.getElementById("reino-body");
const mensaje = document.getElementById("reino-mensaje");
const rol = document.getElementById("reino-rol");
const contenidos = document.getElementById("reino-contenidos");
const logoutButton = document.getElementById("logout-button");

async function cargarReino() {
  try {
    const response = await fetch("/dashboard", {
      credentials: "same-origin",
    });

    if (response.status === 401) {
      window.location.replace("/");
      return;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      subtitle.textContent = data.error || "El sello de sesión no es válido.";
      return;
    }

    subtitle.textContent = "Las puertas se abrieron";
    mensaje.textContent = data.mensaje || "Bienvenido al dashboard";
    rol.textContent = data.rol || "—";
    contenidos.textContent = data.contenidos || "—";
    body.hidden = false;
  } catch (error) {
    subtitle.textContent = "No se pudo hablar con el servidor.";
  }
}

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
