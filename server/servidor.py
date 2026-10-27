#!/usr/bin/env python3
"""Servidor local con recarga automática para el Registro de Vacunación."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import mimetypes
import sys

ROOT = Path(__file__).resolve().parent.parent / "public"
ARCHIVOS_VIGILADOS = (
    "index.html",
    "app.html",
    "css/portada.css",
    "css/app.css",
    "css/institucional.css",
    "js/portada.js",
    "js/app.js",
    "js/auth.js",
    "js/datos.js",
    "live-reload.js",
)

mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("font/woff", ".woff")


def version_actual() -> str:
    partes = []
    for nombre in ARCHIVOS_VIGILADOS:
        archivo = ROOT / nombre
        try:
            estado = archivo.stat()
            partes.append(f"{nombre}:{estado.st_mtime_ns}:{estado.st_size}")
        except FileNotFoundError:
            partes.append(f"{nombre}:ausente")
    return "|".join(partes)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self):
        if self.path.split("?", 1)[0] == "/__version":
            cuerpo = version_actual().encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(cuerpo)))
            self.end_headers()
            self.wfile.write(cuerpo)
            return
        super().do_GET()

    def do_HEAD(self):
        if self.path.split("?", 1)[0] == "/__version":
            cuerpo = version_actual().encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(cuerpo)))
            self.end_headers()
            return
        super().do_HEAD()


def main() -> None:
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    servidor = ThreadingHTTPServer(("127.0.0.1", puerto), Handler)
    print(f"Registro de Vacunación: http://127.0.0.1:{puerto}/", flush=True)
    print("Recarga automática activa; Ctrl+C para detener.", flush=True)
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        servidor.server_close()


if __name__ == "__main__":
    main()
