/* ============================================================
   Datos compartidos · SISALUD Guárico
   Catálogos usados por la portada y por la aplicación.
   ============================================================ */
(function () {
  'use strict';

  const CENTROS = [
    {
      id: 'hospital-san-juan',
      nombre: 'Hospital Central de San Juan de los Morros',
      estado: 'Guárico',
      municipio: 'Juan Germán Roscio',
      parroquia: 'San Juan de los Morros'
    },
    {
      id: 'hospital-calabozo',
      nombre: 'Hospital Dr. Francisco Antonio Rísquez',
      estado: 'Guárico',
      municipio: 'Francisco de Miranda',
      parroquia: 'Calabozo'
    },
    {
      id: 'ambulatorio-valle-pascua',
      nombre: 'Ambulatorio Urbano Valle de la Pascua',
      estado: 'Guárico',
      municipio: 'Leonardo Infante',
      parroquia: 'Valle de la Pascua'
    },
    {
      id: 'ambulatorio-zaraza',
      nombre: 'Ambulatorio Urbano Zaraza',
      estado: 'Guárico',
      municipio: 'Pedro Zaraza',
      parroquia: 'Zaraza'
    },
    {
      id: 'hospital-altagracia',
      nombre: 'Hospital Dr. José Francisco Torrealba',
      estado: 'Guárico',
      municipio: 'José Tadeo Monagas',
      parroquia: 'Altagracia de Orituco'
    },
    {
      id: 'ambulatorio-las-mercedes',
      nombre: 'Ambulatorio Rural Las Mercedes del Llano',
      estado: 'Guárico',
      municipio: 'Las Mercedes',
      parroquia: 'Las Mercedes del Llano'
    },
    {
      id: 'ambulatorio-el-sombrero',
      nombre: 'Ambulatorio Urbano El Sombrero',
      estado: 'Guárico',
      municipio: 'Julián Mellado',
      parroquia: 'El Sombrero'
    },
    {
      id: 'ambulatorio-tucupido',
      nombre: 'Ambulatorio Urbano Tucupido',
      estado: 'Guárico',
      municipio: 'José Félix Ribas',
      parroquia: 'Tucupido'
    },
    {
      id: 'ambulatorio-chaguaramas',
      nombre: 'Ambulatorio Rural Chaguaramas',
      estado: 'Guárico',
      municipio: 'Chaguaramas',
      parroquia: 'Chaguaramas'
    },
    {
      id: 'ambulatorio-cazorla',
      nombre: 'Ambulatorio Rural Cazorla',
      estado: 'Guárico',
      municipio: 'Ortiz',
      parroquia: 'Cazorla'
    },
    {
      id: 'ambulatorio-santa-maria',
      nombre: 'Ambulatorio Rural Santa María de Ipire',
      estado: 'Guárico',
      municipio: 'Santa María de Ipire',
      parroquia: 'Santa María de Ipire'
    }
  ];

  const VACUNAS = {
    bcg: {
      nombre: 'BCG (antituberculosa)',
      esquema: 'recién nacido · dosis única',
      dosis: ['Dosis única']
    },
    hepb: {
      nombre: 'Hepatitis B',
      esquema: 'recién nacido · dosis única (o serie de 3 dosis)',
      dosis: ['Dosis única (recién nacido)', '1.ª dosis', '2.ª dosis', '3.ª dosis']
    },
    penta: {
      nombre: 'Pentavalente (DPT + Hib + HB)',
      esquema: '2, 4 y 6 meses',
      dosis: ['1.ª dosis', '2.ª dosis', '3.ª dosis', 'Refuerzo']
    },
    polio: {
      nombre: 'Antipoliomielítica (Sabin)',
      esquema: '2, 4 y 6 meses · refuerzos a los 18 meses y 4–6 años',
      dosis: ['1.ª dosis', '2.ª dosis', '3.ª dosis', '1.er refuerzo', '2.º refuerzo']
    },
    srp: {
      nombre: 'SRP (sarampión, rubéola, parotiditis)',
      esquema: '12 meses · refuerzo a los 4–6 años',
      dosis: ['1.ª dosis', 'Refuerzo']
    }
  };

  const ROLES = {
    centro: {
      nombre: 'Centro de Salud',
      corto: 'Centro',
      icono: 'fa-hospital',
      descripcion: 'Registra vacunas aplicadas y consulta el historial del sistema.'
    },
    revisor: {
      nombre: 'Revisor / Aprobador',
      corto: 'Revisor',
      icono: 'fa-user-check',
      descripcion: 'Consulta los registros y valida los datos antes de darlos por aprobados.'
    },
    master: {
      nombre: 'Administrador Master',
      corto: 'Master',
      icono: 'fa-crown',
      descripcion: 'Administra las solicitudes, los usuarios y todos los registros.'
    }
  };

  const CUENTAS_DEMO = [
    {
      nombre: 'Coordinación SISALUD',
      correo: 'master@sisalud.gob.ve',
      clave: 'Master2026',
      rol: 'master',
      centroId: null
    },
    {
      nombre: 'Personal Hospital San Juan',
      correo: 'centro@sisalud.gob.ve',
      clave: 'Centro2026',
      rol: 'centro',
      centroId: 'hospital-san-juan'
    },
    {
      nombre: 'Revisión SISALUD',
      correo: 'revisor@sisalud.gob.ve',
      clave: 'Revisor2026',
      rol: 'revisor',
      centroId: null
    }
  ];

  window.SISALUD_DATOS = {
    CENTROS,
    VACUNAS,
    ROLES,
    CUENTAS_DEMO
  };
})();
