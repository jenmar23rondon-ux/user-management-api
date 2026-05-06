const API_URL = "http://localhost:3000/usuarios";
const LOGIN_URL = "http://localhost:3000/auth/login";
const REGISTER_URL = "http://localhost:3000/auth/register";

// Auth
const formLogin = document.getElementById("formLogin");
const loginEmailInput = document.getElementById("loginEmail");
const loginPasswordInput = document.getElementById("loginPassword");
const formRegister = document.getElementById("formRegister");
const registerEmailInput = document.getElementById("registerEmail");
const registerPasswordInput = document.getElementById("registerPassword");
const btnLogout = document.getElementById("btnLogout");
const estadoSesion = document.getElementById("estadoSesion");

// CRUD
const crudSection = document.getElementById("crudSection");
const form = document.getElementById("formUsuario");
const nombreInput = document.getElementById("nombre");
const edadInput = document.getElementById("edad");
const mensaje = document.getElementById("mensaje");
const listaUsuarios = document.getElementById("listaUsuarios");
const btnSubmit = document.getElementById("btnSubmit");

// Extras UI
const buscarNombreInput = document.getElementById("buscarNombre");
const ordenNombreSelect = document.getElementById("ordenNombre");
const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");
const paginaInfo = document.getElementById("paginaInfo");

let usuarioEditandoId = null;
let usuariosCache = [];
let paginaActual = 1;
const usuariosPorPagina = 5;

function mostrarMensaje(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.style.color = esError ? "red" : "lightgreen";
}

function guardarToken(token) {
  localStorage.setItem("token", token);
}

function obtenerToken() {
  return localStorage.getItem("token");
}

function eliminarToken() {
  localStorage.removeItem("token");
}

function haySesionActiva() {
  return !!obtenerToken();
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarPassword(password) {
  return typeof password === "string" && password.trim().length >= 6;
}

function validarFormulario(nombre, edad) {
  if (!nombre || nombre.trim().length < 2) {
    mostrarMensaje("El nombre debe tener al menos 2 caracteres", true);
    return false;
  }

  const edadNumero = Number(edad);

  if (!Number.isInteger(edadNumero) || edadNumero < 0 || edadNumero > 120) {
    mostrarMensaje("La edad debe ser un número entero entre 0 y 120", true);
    return false;
  }

  return true;
}

function obtenerPayloadToken() {
  const token = obtenerToken();
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    const payloadBase64Corregido = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const payloadJson = atob(payloadBase64Corregido);
    return JSON.parse(payloadJson);
  } catch (error) {
    console.error("Error al leer token:", error);
    return null;
  }
}

function actualizarEstadoUI() {
  const token = obtenerToken();
  const sesionActiva = !!token;

  if (!sesionActiva) {
    estadoSesion.textContent = "No has iniciado sesión";
    estadoSesion.className = "estado-sesion no-session";
    crudSection.style.display = "none";
    return;
  }

  const payload = obtenerPayloadToken();
  const email = payload?.email || "usuario";
  const role = payload?.role || "user";

  estadoSesion.textContent = `Sesión iniciada como: ${email} (${role})`;
  estadoSesion.className = "estado-sesion session-on";
  crudSection.style.display = "block";
}

function obtenerUsuariosProcesados() {
  let usuarios = [...usuariosCache];

  const textoBusqueda = buscarNombreInput.value.trim().toLowerCase();
  const orden = ordenNombreSelect.value;

  if (textoBusqueda) {
    usuarios = usuarios.filter((usuario) =>
      usuario.nombre.toLowerCase().includes(textoBusqueda)
    );
  }

  usuarios.sort((a, b) => {
    if (orden === "asc") {
      return a.nombre.localeCompare(b.nombre);
    }
    return b.nombre.localeCompare(a.nombre);
  });

  return usuarios;
}

function renderUsuarios() {
  const usuariosProcesados = obtenerUsuariosProcesados();
  const totalPaginas = Math.max(1, Math.ceil(usuariosProcesados.length / usuariosPorPagina));

  if (paginaActual > totalPaginas) {
    paginaActual = totalPaginas;
  }

  const inicio = (paginaActual - 1) * usuariosPorPagina;
  const fin = inicio + usuariosPorPagina;
  const usuariosPagina = usuariosProcesados.slice(inicio, fin);

  listaUsuarios.innerHTML = "";

  if (usuariosPagina.length === 0) {
    listaUsuarios.innerHTML = "<li>No hay usuarios registrados</li>";
  } else {
    const payload = obtenerPayloadToken();
    const role = payload?.role || "user";

    usuariosPagina.forEach((usuario) => {
      const li = document.createElement("li");

      const texto = document.createElement("span");
      texto.textContent = `${usuario.id} - ${usuario.nombre} - ${usuario.edad} años`;

      const contenedorBotones = document.createElement("div");

      const btnEditar = document.createElement("button");
      btnEditar.type = "button";
      btnEditar.textContent = "Editar";
      btnEditar.addEventListener("click", () => {
        editarUsuario(usuario.id, usuario.nombre, usuario.edad);
      });

      const btnEliminar = document.createElement("button");
      btnEliminar.type = "button";
      btnEliminar.textContent = "Eliminar";
      btnEliminar.disabled = role !== "admin";
      btnEliminar.addEventListener("click", () => {
        eliminarUsuario(usuario.id);
      });

      contenedorBotones.appendChild(btnEditar);
      contenedorBotones.appendChild(btnEliminar);

      li.appendChild(texto);
      li.appendChild(contenedorBotones);
      listaUsuarios.appendChild(li);
    });
  }

  paginaInfo.textContent = `Página ${paginaActual} de ${totalPaginas}`;
  btnAnterior.disabled = paginaActual === 1;
  btnSiguiente.disabled = paginaActual === totalPaginas;
}

async function registrarUsuarioAuth(email, password) {
  try {
    if (!validarEmail(email)) {
      mostrarMensaje("Correo inválido", true);
      return;
    }

    if (!validarPassword(password)) {
      mostrarMensaje("La contraseña debe tener al menos 6 caracteres", true);
      return;
    }

    const res = await fetch(REGISTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarMensaje(data.error || "Error al registrar usuario", true);
      return;
    }

    mostrarMensaje(data.mensaje || "Usuario registrado correctamente");
    formRegister.reset();
  } catch (error) {
    console.error("Error en register:", error);
    mostrarMensaje("Error al registrar usuario", true);
  }
}

async function login(email, password) {
  try {
    if (!validarEmail(email)) {
      mostrarMensaje("Correo inválido", true);
      return false;
    }

    if (!validarPassword(password)) {
      mostrarMensaje("La contraseña debe tener al menos 6 caracteres", true);
      return false;
    }

    const res = await fetch(LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarMensaje(data.error || "Error en login", true);
      return false;
    }

    guardarToken(data.token);
    actualizarEstadoUI();
    mostrarMensaje(data.mensaje || "Login correcto");
    formLogin.reset();
    await obtenerUsuarios();
    return true;
  } catch (error) {
    console.error("Error en login:", error);
    mostrarMensaje("Error al iniciar sesión", true);
    return false;
  }
}

function cerrarSesion() {
  eliminarToken();
  listaUsuarios.innerHTML = "";
  usuariosCache = [];
  form.reset();
  formLogin.reset();
  formRegister.reset();
  usuarioEditandoId = null;
  paginaActual = 1;
  btnSubmit.textContent = "Crear";
  mensaje.textContent = "";
  actualizarEstadoUI();
}

async function obtenerUsuarios() {
  try {
    const token = obtenerToken();

    if (!token) {
      mostrarMensaje("Debes iniciar sesión para ver usuarios", true);
      listaUsuarios.innerHTML = "";
      return;
    }

    const res = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarMensaje(data.error || "Error al cargar usuarios", true);
      return;
    }

    usuariosCache = data.data || [];
    renderUsuarios();
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    mostrarMensaje("Error al cargar usuarios", true);
  }
}

async function crearUsuario(nombre, edad) {
  try {
    const token = obtenerToken();

    if (!token) {
      mostrarMensaje("Debes iniciar sesión", true);
      return;
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        nombre,
        edad: Number(edad)
      })
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarMensaje(data.error || "Error al crear usuario", true);
      return;
    }

    mostrarMensaje(data.mensaje || "Usuario creado correctamente");
    form.reset();
    paginaActual = 1;
    await obtenerUsuarios();
  } catch (error) {
    console.error("Error al crear usuario:", error);
    mostrarMensaje("Error de conexión con el servidor", true);
  }
}

async function actualizarUsuario(id, nombre, edad) {
  try {
    const token = obtenerToken();

    if (!token) {
      mostrarMensaje("Debes iniciar sesión", true);
      return;
    }

    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        nombre,
        edad: Number(edad)
      })
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarMensaje(data.error || "Error al actualizar usuario", true);
      return;
    }

    mostrarMensaje(data.mensaje || "Usuario actualizado correctamente");
    form.reset();
    usuarioEditandoId = null;
    btnSubmit.textContent = "Crear";
    await obtenerUsuarios();
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    mostrarMensaje("Error de conexión al actualizar usuario", true);
  }
}

async function eliminarUsuario(id) {
  try {
    const token = obtenerToken();

    if (!token) {
      mostrarMensaje("Debes iniciar sesión", true);
      return;
    }

    const confirmar = confirm(`¿Seguro que quieres eliminar el usuario ID ${id}?`);
    if (!confirmar) return;

    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarMensaje(data.error || "Error al eliminar usuario", true);
      return;
    }

    mostrarMensaje(data.mensaje || "Usuario eliminado correctamente");
    await obtenerUsuarios();
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    mostrarMensaje("Error de conexión al eliminar usuario", true);
  }
}

function editarUsuario(id, nombre, edad) {
  nombreInput.value = nombre;
  edadInput.value = edad;
  usuarioEditandoId = id;
  btnSubmit.textContent = "Actualizar";
  mostrarMensaje(`Editando usuario ID ${id}`);
}

formRegister.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = registerEmailInput.value.trim();
  const password = registerPasswordInput.value.trim();

  await registrarUsuarioAuth(email, password);
});

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value.trim();

  await login(email, password);
});

btnLogout.addEventListener("click", () => {
  cerrarSesion();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = nombreInput.value.trim();
  const edad = edadInput.value;

  if (!validarFormulario(nombre, edad)) {
    return;
  }

  if (usuarioEditandoId) {
    await actualizarUsuario(usuarioEditandoId, nombre, edad);
  } else {
    await crearUsuario(nombre, edad);
  }
});

buscarNombreInput.addEventListener("input", () => {
  paginaActual = 1;
  renderUsuarios();
});

ordenNombreSelect.addEventListener("change", () => {
  paginaActual = 1;
  renderUsuarios();
});

btnAnterior.addEventListener("click", () => {
  if (paginaActual > 1) {
    paginaActual--;
    renderUsuarios();
  }
});

btnSiguiente.addEventListener("click", () => {
  const totalPaginas = Math.max(1, Math.ceil(obtenerUsuariosProcesados().length / usuariosPorPagina));
  if (paginaActual < totalPaginas) {
    paginaActual++;
    renderUsuarios();
  }
});

async function iniciarApp() {
  actualizarEstadoUI();

  if (haySesionActiva()) {
    await obtenerUsuarios();
  } else {
    mostrarMensaje("Inicia sesión para gestionar usuarios", true);
  }
}

iniciarApp();