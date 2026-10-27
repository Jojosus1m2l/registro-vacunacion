/* ============================================================
   Autenticación local · SISALUD Guárico
   Los roles se asignan por correo: una persona solicita acceso,
   el Master aprueba la solicitud y desde ese momento ese correo
   entra con el rol aprobado.
   ============================================================ */
(function () {
  'use strict';

  const DATOS = window.SISALUD_DATOS;
  const KEY_USUARIOS = 'sisalud_usuarios_v1';
  const KEY_SESION = 'sisalud_sesion_v1';
  const KEY_SESION_TEMP = 'sisalud_sesion_temporal_v1';
  const PEPPER = 'sisalud-guarico-2026';
  const ROLES_VALIDOS = ['centro', 'revisor', 'master'];
  const ROLES_SOLICITABLES = ['centro', 'revisor'];
  let inicializacion = null;

  function normalizarCorreo(valor) {
    return String(valor || '').trim().toLowerCase();
  }

  function correoValido(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  }

  function nuevoId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'usr-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  async function hashClave(clave, correo) {
    const texto = normalizarCorreo(correo) + '::' + String(clave) + '::' + PEPPER;
    if (window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
      const buffer = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
      return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    /* Respaldo solo para contextos sin Web Crypto (no es seguridad real). */
    let h = 2166136261;
    for (let i = 0; i < texto.length; i += 1) {
      h ^= texto.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return 'fnv-' + (h >>> 0).toString(16);
  }

  function leerUsuarios() {
    try {
      const raw = localStorage.getItem(KEY_USUARIOS);
      if (!raw) return [];
      const lista = JSON.parse(raw);
      return Array.isArray(lista) ? lista : [];
    } catch {
      return [];
    }
  }

  function guardarUsuarios(usuarios) {
    localStorage.setItem(KEY_USUARIOS, JSON.stringify(usuarios));
    window.dispatchEvent(new CustomEvent('sisalud:usuarios'));
  }

  function buscarUsuario(referencia) {
    const valor = String(referencia || '').trim().toLowerCase();
    return leerUsuarios().find((u) => u.id === referencia || u.correo === valor) || null;
  }

  function sesionActual() {
    for (const clave of [KEY_SESION, KEY_SESION_TEMP]) {
      const raw = localStorage.getItem(clave) || sessionStorage.getItem(clave);
      if (!raw) continue;
      try {
        const sesion = JSON.parse(raw);
        if (!sesion || !sesion.correo) {
          limpiarSesion();
          return null;
        }
        const usuario = buscarUsuario(sesion.correo);
        if (!usuario || usuario.estado !== 'aprobado') {
          limpiarSesion();
          return null;
        }
        return {
          ...sesion,
          userId: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol,
          centroId: usuario.centroId || null
        };
      } catch {
        limpiarSesion();
        return null;
      }
    }
    return null;
  }

  function limpiarSesion() {
    localStorage.removeItem(KEY_SESION);
    localStorage.removeItem(KEY_SESION_TEMP);
    sessionStorage.removeItem(KEY_SESION);
    sessionStorage.removeItem(KEY_SESION_TEMP);
  }

  function guardarSesion(usuario, recordar) {
    limpiarSesion();
    const sesion = {
      userId: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      centroId: usuario.centroId || null,
      iniciadoEn: new Date().toISOString()
    };
    const destino = recordar ? localStorage : sessionStorage;
    destino.setItem(recordar ? KEY_SESION : KEY_SESION_TEMP, JSON.stringify(sesion));
  }

  function error(codigo, mensaje) {
    const err = new Error(mensaje);
    err.codigo = codigo;
    return err;
  }

  async function init() {
    if (inicializacion) return inicializacion;
    inicializacion = (async () => {
      let usuarios = leerUsuarios();

      if (usuarios.length === 0) {
        usuarios = [];
        for (const demo of DATOS.CUENTAS_DEMO) {
          usuarios.push({
            id: nuevoId(),
            nombre: demo.nombre,
            correo: normalizarCorreo(demo.correo),
            claveHash: await hashClave(demo.clave, demo.correo),
            rol: demo.rol,
            centroId: demo.centroId || null,
            estado: 'aprobado',
            creadoEn: new Date().toISOString(),
            aprobadoEn: new Date().toISOString(),
            aprobadoPor: 'sistema'
          });
        }
        guardarUsuarios(usuarios);
      } else {
        usuarios = usuarios.map((u) => ({
          ...u,
          nombre: u.correo === 'master@sisalud.gob.ve' && u.nombre === 'Coordinación Master'
            ? 'Coordinación SISALUD'
            : u.nombre,
          correo: normalizarCorreo(u.correo),
          estado: u.estado || 'aprobado',
          rol: ROLES_VALIDOS.includes(u.rol) ? u.rol : 'centro',
          centroId: u.centroId || null,
          creadoEn: u.creadoEn || new Date().toISOString()
        }));
        guardarUsuarios(usuarios);
      }

      if (!usuarios.some((u) => u.rol === 'master' && u.estado === 'aprobado')) {
        const demo = DATOS.CUENTAS_DEMO.find((c) => c.rol === 'master');
        usuarios.push({
          id: nuevoId(),
          nombre: demo.nombre,
          correo: normalizarCorreo(demo.correo),
          claveHash: await hashClave(demo.clave, demo.correo),
          rol: 'master',
          centroId: null,
          estado: 'aprobado',
          creadoEn: new Date().toISOString(),
          aprobadoEn: new Date().toISOString(),
          aprobadoPor: 'sistema'
        });
        guardarUsuarios(usuarios);
      }

      localStorage.removeItem('vacunacion_sesion_v1');
      return usuarios;
    })();
    return inicializacion;
  }

  async function registrarSolicitud({ nombre, correo, clave, rol, centroId }) {
    await init();
    const nombreLimpio = String(nombre || '').trim();
    const correoLimpio = normalizarCorreo(correo);
    const rolLimpio = String(rol || '').trim();

    if (nombreLimpio.length < 3) throw error('nombre', 'Escribe tu nombre completo.');
    if (!correoValido(correoLimpio)) throw error('correo', 'Escribe un correo electrónico válido.');
    if (String(clave || '').length < 8) throw error('clave', 'La contraseña debe tener al menos 8 caracteres.');
    if (!ROLES_SOLICITABLES.includes(rolLimpio)) throw error('rol', 'Selecciona el rol que deseas solicitar.');
    if (rolLimpio === 'centro' && !DATOS.CENTROS.some((c) => c.id === centroId)) {
      throw error('centro', 'Selecciona el centro de salud al que perteneces.');
    }

    const usuarios = leerUsuarios();
    const existente = usuarios.find((u) => u.correo === correoLimpio);

    if (existente && existente.estado === 'pendiente') {
      throw error('pendiente', 'Ya existe una solicitud pendiente con ese correo.');
    }
    if (existente && (existente.estado === 'aprobado' || existente.estado === 'suspendido')) {
      throw error('existe', 'Ese correo ya tiene una cuenta. Inicia sesión o contacta al Master.');
    }

    const datosUsuario = {
      nombre: nombreLimpio,
      correo: correoLimpio,
      claveHash: await hashClave(clave, correoLimpio),
      rol: rolLimpio,
      centroId: rolLimpio === 'centro' ? centroId : null,
      estado: 'pendiente',
      creadoEn: new Date().toISOString(),
      aprobadoEn: '',
      aprobadoPor: '',
      rechazadoEn: '',
      rechazadoPor: ''
    };

    if (existente) {
      Object.assign(existente, datosUsuario);
    } else {
      usuarios.push({ id: nuevoId(), ...datosUsuario });
    }

    guardarUsuarios(usuarios);
    return buscarUsuario(correoLimpio);
  }

  async function login(correo, clave, recordar = false) {
    await init();
    const correoLimpio = normalizarCorreo(correo);
    if (!correoValido(correoLimpio)) throw error('correo', 'Escribe un correo electrónico válido.');

    const usuario = buscarUsuario(correoLimpio);
    if (!usuario) {
      throw error('no-existe', 'No hay una cuenta con ese correo. Solicita acceso al sistema.');
    }
    if (usuario.estado === 'pendiente') {
      throw error('pendiente', 'Tu solicitud está pendiente de aprobación por el Master.');
    }
    if (usuario.estado === 'rechazado') {
      throw error('rechazado', 'Tu solicitud fue rechazada. Contacta a la coordinación de SISALUD.');
    }
    if (usuario.estado === 'suspendido') {
      throw error('suspendido', 'Tu cuenta está suspendida. Contacta al Master.');
    }
    if (usuario.estado !== 'aprobado') {
      throw error('estado', 'Tu cuenta no está habilitada para ingresar.');
    }

    const hash = await hashClave(clave, correoLimpio);
    if (hash !== usuario.claveHash) {
      throw error('clave', 'La contraseña no es correcta.');
    }

    guardarSesion(usuario, Boolean(recordar));
    return usuario;
  }

  function logout() {
    limpiarSesion();
    window.dispatchEvent(new CustomEvent('sisalud:sesion'));
  }

  function requireSession() {
    const sesion = sesionActual();
    if (!sesion) {
      limpiarSesion();
      window.location.replace('index.html');
      return null;
    }
    return sesion;
  }

  function actorMaster(actor) {
    const actual = buscarUsuario(actor && actor.correo);
    if (!actual || actual.estado !== 'aprobado' || actual.rol !== 'master') {
      throw error('permiso', 'Solo el Master puede realizar esta acción.');
    }
    return actual;
  }

  function aprobarUsuario(id, { rol, centroId } = {}, actor) {
    const master = actorMaster(actor);
    const usuarios = leerUsuarios();
    const usuario = usuarios.find((u) => u.id === id);
    if (!usuario) throw error('no-existe', 'La solicitud ya no existe.');
    if (usuario.id === master.id) throw error('propio', 'No puedes modificar tu propia cuenta.');
    if (!ROLES_VALIDOS.includes(rol)) throw error('rol', 'Selecciona un rol válido.');
    if (rol === 'centro' && !DATOS.CENTROS.some((c) => c.id === centroId)) {
      throw error('centro', 'Selecciona el centro de salud del usuario.');
    }

    usuario.rol = rol;
    usuario.centroId = rol === 'centro' ? centroId : null;
    usuario.estado = 'aprobado';
    usuario.aprobadoEn = new Date().toISOString();
    usuario.aprobadoPor = master.correo;
    usuario.rechazadoEn = '';
    usuario.rechazadoPor = '';
    guardarUsuarios(usuarios);
    return usuario;
  }

  function rechazarUsuario(id, actor) {
    const master = actorMaster(actor);
    const usuarios = leerUsuarios();
    const usuario = usuarios.find((u) => u.id === id);
    if (!usuario) throw error('no-existe', 'La solicitud ya no existe.');
    if (usuario.id === master.id) throw error('propio', 'No puedes modificar tu propia cuenta.');

    usuario.estado = 'rechazado';
    usuario.rechazadoEn = new Date().toISOString();
    usuario.rechazadoPor = master.correo;
    guardarUsuarios(usuarios);
    return usuario;
  }

  function cambiarEstadoUsuario(id, estado, actor) {
    const master = actorMaster(actor);
    if (!['aprobado', 'suspendido'].includes(estado)) {
      throw error('estado', 'Estado de usuario no válido.');
    }
    const usuarios = leerUsuarios();
    const usuario = usuarios.find((u) => u.id === id);
    if (!usuario) throw error('no-existe', 'El usuario ya no existe.');
    if (usuario.id === master.id) throw error('propio', 'No puedes suspender tu propia cuenta.');

    usuario.estado = estado;
    if (estado === 'aprobado') {
      usuario.aprobadoEn = new Date().toISOString();
      usuario.aprobadoPor = master.correo;
    }
    guardarUsuarios(usuarios);
    return usuario;
  }

  function contarPendientes() {
    return leerUsuarios().filter((u) => u.estado === 'pendiente').length;
  }

  function centroPorId(id) {
    return DATOS.CENTROS.find((c) => c.id === id) || null;
  }

  function etiquetaRol(rol) {
    return (DATOS.ROLES[rol] && DATOS.ROLES[rol].nombre) || rol || '—';
  }

  function etiquetaEstado(estado) {
    const etiquetas = {
      aprobado: 'Aprobado',
      pendiente: 'Pendiente',
      rechazado: 'Rechazado',
      suspendido: 'Suspendido'
    };
    return etiquetas[estado] || estado || '—';
  }

  window.SISALUD = {
    KEY_USUARIOS,
    KEY_SESION,
    init,
    registrarSolicitud,
    login,
    logout,
    getSession: sesionActual,
    requireSession,
    getUsuarios: leerUsuarios,
    buscarUsuario,
    aprobarUsuario,
    rechazarUsuario,
    cambiarEstadoUsuario,
    contarPendientes,
    centroPorId,
    etiquetaRol,
    etiquetaEstado,
    normalizarCorreo,
    correoValido,
    CUENTAS_DEMO: DATOS.CUENTAS_DEMO
  };
})();
