/* ============================================================
   Portada SISALUD Guárico · interacción
   ============================================================ */
(function () {
  'use strict';

  const DATOS = window.SISALUD_DATOS;
  const S = window.SISALUD;
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const dialog = $('#modalAcceso');
  const formLogin = $('#formLogin');
  const formSolicitud = $('#formSolicitud');
  const loginAlerta = $('#loginAlerta');
  const solAlerta = $('#solAlerta');
  const tabLogin = $('#tabLogin');
  const tabSolicitud = $('#tabSolicitud');
  const subtitulo = $('#authSubtitulo');
  const titulo = $('#authTitulo');
  let sesion = null;

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function mostrarAlerta(nodo, mensaje, tipo) {
    nodo.textContent = mensaje;
    nodo.className = 'auth-alert show ' + (tipo === 'ok' ? 'ok' : 'error');
  }

  function ocultarAlerta(nodo) {
    nodo.textContent = '';
    nodo.className = 'auth-alert';
  }

  function cambiarTab(tab) {
    const esLogin = tab !== 'solicitud';
    tabLogin.classList.toggle('active', esLogin);
    tabSolicitud.classList.toggle('active', !esLogin);
    tabLogin.setAttribute('aria-selected', String(esLogin));
    tabSolicitud.setAttribute('aria-selected', String(!esLogin));
    formLogin.hidden = !esLogin;
    formSolicitud.hidden = esLogin;
    titulo.textContent = esLogin ? 'Ingresar al Sistema' : 'Solicitar acceso';
    subtitulo.textContent = esLogin
      ? 'Acceso para personal autorizado de SISALUD Guárico'
      : 'El Master aprobará tu correo y asignará el rol';
    ocultarAlerta(loginAlerta);
    ocultarAlerta(solAlerta);
    window.setTimeout(() => {
      const campo = esLogin ? $('#loginCorreo') : $('#solNombre');
      if (campo) campo.focus();
    }, 50);
  }

  function abrirDialogo(tab, rolSolicitado) {
    if (sesion) {
      window.location.href = 'app.html';
      return;
    }
    if (rolSolicitado) {
      cambiarTab('solicitud');
      $('#solRol').value = rolSolicitado;
      actualizarCentroSolicitud();
    } else {
      cambiarTab(tab || 'login');
    }
    if (!dialog.open) dialog.showModal();
  }

  function cerrarDialogo() {
    if (dialog.open) dialog.close();
  }

  function actualizarCentroSolicitud() {
    const esCentro = $('#solRol').value === 'centro';
    $('#solCentroWrap').hidden = !esCentro;
    $('#solCentro').required = esCentro;
  }

  function pintarDemo() {
    $('#listaDemo').innerHTML = S.CUENTAS_DEMO.map((cuenta) => {
      const rol = DATOS.ROLES[cuenta.rol] ? DATOS.ROLES[cuenta.rol].corto : cuenta.rol;
      return `<li>
        <span><span class="demo-rol">${esc(rol)}</span><br><code>${esc(cuenta.correo)}</code></span>
        <code>${esc(cuenta.clave)}</code>
      </li>`;
    }).join('');
  }

  function pintarCentros() {
    const grupos = new Map();
    DATOS.CENTROS.forEach((centro) => {
      const clave = centro.municipio;
      if (!grupos.has(clave)) grupos.set(clave, []);
      grupos.get(clave).push(centro);
    });

    $('#solCentro').innerHTML = '<option value="">Seleccione un centro…</option>' +
      Array.from(grupos.entries()).map(([municipio, centros]) => `
        <optgroup label="${esc(municipio)}">
          ${centros.map((centro) => `<option value="${esc(centro.id)}">${esc(centro.nombre)} — ${esc(centro.parroquia)}</option>`).join('')}
        </optgroup>`).join('');
  }

  function pintarSesion() {
    const contenedor = $('#navAcciones');
    if (!sesion) {
      contenedor.innerHTML = `
        <button type="button" class="btn-ingresar" id="btnIngresar" data-auth="login">
          <i class="fas fa-sign-in-alt"></i> Ingresar al Sistema
        </button>`;
      return;
    }

    const rol = DATOS.ROLES[sesion.rol] ? DATOS.ROLES[sesion.rol].corto : sesion.rol;
    contenedor.innerHTML = `
      <span class="session-chip" title="${esc(sesion.correo)}">
        <i class="fas fa-user-circle"></i>
        <strong>${esc(sesion.nombre)}</strong>
        <span>${esc(rol)}</span>
      </span>
      <a class="btn-nav-outline" href="app.html"><i class="fas fa-columns"></i> Ir al sistema</a>
      <button type="button" class="btn-nav-ghost" id="btnSalirPortada"><i class="fas fa-sign-out-alt"></i> Salir</button>`;
  }

  async function refrescarSesion() {
    sesion = S.getSession();
    pintarSesion();
  }

  async function iniciar() {
    try {
      await S.init();
    } catch {
      mostrarAlerta($('#loginAlerta'), 'No se pudo inicializar el almacenamiento local del navegador.', 'error');
      return;
    }

    pintarDemo();
    pintarCentros();
    await refrescarSesion();

    /* Delegación para abrir login o solicitud. */
    document.addEventListener('click', (event) => {
      const auth = event.target.closest('[data-auth="login"]');
      if (auth) {
        event.preventDefault();
        abrirDialogo('login');
        return;
      }

      const solicitar = event.target.closest('[data-solicitar]');
      if (solicitar) {
        event.preventDefault();
        abrirDialogo('solicitud', solicitar.dataset.solicitar);
      }
    });

    $$('[data-tab]').forEach((boton) => {
      boton.addEventListener('click', () => {
        cambiarTab(boton.dataset.tab);
        if (!dialog.open) dialog.showModal();
      });
    });

    $('#authCerrar').addEventListener('click', cerrarDialogo);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) cerrarDialogo();
    });

    $$('[data-ver-clave]').forEach((boton) => {
      boton.addEventListener('click', () => {
        const input = document.getElementById(boton.dataset.verClave);
        if (!input) return;
        const visible = input.type === 'text';
        input.type = visible ? 'password' : 'text';
        boton.innerHTML = visible ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        boton.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
      });
    });

    $('#solRol').addEventListener('change', actualizarCentroSolicitud);

    formLogin.addEventListener('submit', async (event) => {
      event.preventDefault();
      ocultarAlerta(loginAlerta);
      const boton = $('#btnLogin');
      const correo = $('#loginCorreo').value;
      const clave = $('#loginClave').value;
      if (!correo || !clave) {
        mostrarAlerta(loginAlerta, 'Escribe tu correo y contraseña.', 'error');
        return;
      }
      boton.disabled = true;
      boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando…';
      try {
        await S.login(correo, clave, $('#loginRecordar').checked);
        boton.innerHTML = '<i class="fas fa-check"></i> Acceso concedido';
        window.location.href = 'app.html';
      } catch (err) {
        mostrarAlerta(loginAlerta, err.message, 'error');
        boton.disabled = false;
        boton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar sesión';
        if (err.codigo === 'no-existe') {
          $('#loginCorreo').focus();
        } else if (err.codigo === 'clave') {
          $('#loginClave').focus();
        }
      }
    });

    formSolicitud.addEventListener('submit', async (event) => {
      event.preventDefault();
      ocultarAlerta(solAlerta);
      const boton = $('#btnSolicitud');
      const clave = $('#solClave').value;
      const clave2 = $('#solClave2').value;

      if (clave !== clave2) {
        mostrarAlerta(solAlerta, 'Las contraseñas no coinciden.', 'error');
        $('#solClave2').focus();
        return;
      }

      boton.disabled = true;
      boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando…';
      try {
        await S.registrarSolicitud({
          nombre: $('#solNombre').value,
          correo: $('#solCorreo').value,
          clave,
          rol: $('#solRol').value,
          centroId: $('#solCentro').value
        });
        const correoSolicitado = S.normalizarCorreo($('#solCorreo').value);
        formSolicitud.reset();
        $('#solCentroWrap').hidden = true;
        cambiarTab('login');
        $('#loginCorreo').value = correoSolicitado;
        mostrarAlerta(loginAlerta, 'Solicitud enviada. El Master debe aprobar tu correo antes de que puedas ingresar.', 'ok');
        boton.disabled = false;
        boton.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar solicitud';
      } catch (err) {
        mostrarAlerta(solAlerta, err.message, 'error');
        boton.disabled = false;
        boton.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar solicitud';
      }
    });

    document.addEventListener('click', (event) => {
      if (event.target.closest('#btnSalirPortada')) {
        S.logout();
        sesion = null;
        pintarSesion();
        cerrarDialogo();
      }
    });

    window.addEventListener('sisalud:usuarios', () => { refrescarSesion(); });
    window.addEventListener('storage', (event) => {
      if (!event.key || event.key === S.KEY_USUARIOS || event.key === S.KEY_SESION) refrescarSesion();
    });

    /* Navegación activa al hacer scroll. */
    const enlacesNav = Array.from(document.querySelectorAll('.nav-item[href^="#"]'));
    const secciones = Array.from(document.querySelectorAll('section[id]'));
    const marcarNav = () => {
      const y = window.scrollY + 90;
      secciones.forEach((seccion) => {
        const enlace = document.querySelector('.nav-item[href="#' + seccion.id + '"]');
        if (!enlace) return;
        if (y >= seccion.offsetTop && y < seccion.offsetTop + seccion.offsetHeight) {
          enlacesNav.forEach((item) => item.classList.remove('active'));
          enlace.classList.add('active');
        }
      });
    };
    window.addEventListener('scroll', marcarNav, { passive: true });
    marcarNav();

    document.querySelectorAll('a[href^="#"]').forEach((enlace) => {
      enlace.addEventListener('click', (event) => {
        const id = enlace.getAttribute('href');
        if (id === '#') return;
        const destino = document.querySelector(id);
        if (destino) {
          event.preventDefault();
          destino.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  iniciar();
})();
