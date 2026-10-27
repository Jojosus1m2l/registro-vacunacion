# Registro de Vacunación · SISALUD Guárico

Aplicación web local para el registro y la consulta de vacunas aplicadas, con
control de acceso por roles y aprobación de usuarios.

## Funcionalidades

- Portada institucional con información de cobertura y perfiles de acceso.
- Solicitud de acceso por correo; el rol Master aprueba o rechaza solicitudes.
- Roles diferenciados: Master, personal de centro de salud y revisor.
- Registro de vacunas por centro, con selección de estado, municipio y parroquia.
- Ficha de vacunación con validación previa (revisar y confirmar).
- Consulta e historial de registros recientes.
- Datos almacenados en `localStorage` (no requiere base de datos).
- Tailwind CSS incluido localmente: funciona sin conexión a internet.
- Servidor local con recarga automática al guardar cambios.

## Requisitos

- Python 3.8 o superior
- Un navegador moderno

## Cómo ejecutar

```bash
cd server
./iniciar.sh          # abre http://127.0.0.1:8000/
./iniciar.sh 8001     # puerto alternativo
```

También puedes iniciar el servidor manualmente:

```bash
cd server
python3 servidor.py 8000
```

## Estructura

```
registro-vacunacion/
├── public/                 # Aplicación web
│   ├── index.html          # Portada e ingreso
│   ├── app.html            # Registro, consulta y gestión
│   ├── css/                # Estilos propios
│   ├── js/                 # Lógica de la aplicación
│   └── vendor/             # Tailwind CSS local
└── server/
    ├── iniciar.sh          # Lanzador con detección de puerto
    └── servidor.py         # Servidor HTTP + recarga automática
```

## Cuentas de demostración

| Rol     | Correo                    | Contraseña   |
|---------|---------------------------|--------------|
| Master  | master@sisalud.gob.ve     | Master2026   |
| Centro  | centro@sisalud.gob.ve     | Centro2026   |
| Revisor | revisor@sisalud.gob.ve    | Revisor2026  |

> Las cuentas son de demostración y los datos se guardan solo en el navegador
> local. No uses contraseñas reales en esta versión.

## Notas

Los datos de usuarios, solicitudes y registros de vacunación se almacenan en el
`localStorage` del navegador. Para reiniciar la aplicación, borra los datos del
sitio desde las herramientas de desarrollo.
