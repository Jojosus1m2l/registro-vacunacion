(() => {
  'use strict';

  let version = null;
  let intervalo = null;

  const comprobar = async () => {
    try {
      const respuesta = await fetch('/__version', { cache: 'no-store' });
      if (!respuesta.ok) return;

      const actual = (await respuesta.text()).trim();
      if (version === null) {
        version = actual;
        return;
      }

      if (actual && actual !== version) {
        window.clearInterval(intervalo);
        window.location.reload();
      }
    } catch {
      /* Si el servidor se está reiniciando, se reintenta en el próximo ciclo. */
    }
  };

  comprobar();
  intervalo = window.setInterval(comprobar, 1200);
  window.addEventListener('beforeunload', () => window.clearInterval(intervalo));
})();
