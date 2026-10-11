#!/usr/bin/env python3
"""Optimiza recursivamente imágenes de src/img para entrega web.

Uso seguro (conserva originales):
    python scripts/optimize_images.py

Reemplazar originales después de crear cada WebP correctamente:
    python scripts/optimize_images.py --replace
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg"}


def human_size(size: int) -> str:
    units = ("B", "KB", "MB", "GB")
    value = float(size)
    for unit in units:
        if value < 1024 or unit == units[-1]:
            return f"{value:.1f} {unit}"
        value /= 1024
    return f"{value:.1f} GB"


def optimize_image(source: Path, quality: int, max_width: int, replace: bool) -> tuple[int, int]:
    target = source.with_suffix(".webp")
    original_size = source.stat().st_size

    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        if image.width > max_width:
            new_height = round(image.height * max_width / image.width)
            image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)

        # WebP admite transparencia. Las paletas se normalizan para evitar
        # colores incorrectos y errores al guardar PNG indexados.
        if image.mode in {"RGBA", "LA"} or "transparency" in image.info:
            image = image.convert("RGBA")
        else:
            image = image.convert("RGB")

        image.save(target, "WEBP", quality=quality, method=6, optimize=True)

    optimized_size = target.stat().st_size
    if replace and source.resolve() != target.resolve():
        source.unlink()
    return original_size, optimized_size


def main() -> int:
    parser = argparse.ArgumentParser(description="Convierte imágenes de Sisal Studio a WebP.")
    parser.add_argument("folder", nargs="?", default="src/img", help="Carpeta que se procesará.")
    parser.add_argument("--quality", type=int, default=80, choices=range(1, 101), metavar="1-100")
    parser.add_argument("--max-width", type=int, default=1920)
    parser.add_argument("--replace", action="store_true", help="Elimina PNG/JPG solo después de crear el WebP.")
    args = parser.parse_args()

    root = Path(args.folder).resolve()
    if not root.is_dir():
        parser.error(f"La carpeta no existe: {root}")

    sources = sorted(path for path in root.rglob("*") if path.suffix.lower() in SUPPORTED_EXTENSIONS)
    if not sources:
        print(f"No se encontraron archivos PNG/JPG en {root}")
        return 0

    total_before = 0
    total_after = 0
    failures = 0
    action = "reemplazando originales" if args.replace else "conservando originales"
    print(f"Procesando {len(sources)} imágenes ({action})…\n")

    for index, source in enumerate(sources, start=1):
        try:
            before, after = optimize_image(source, args.quality, args.max_width, args.replace)
            reduction = (1 - after / before) * 100 if before else 0
            total_before += before
            total_after += after
            print(
                f"[{index:>3}/{len(sources)}] {source.relative_to(root)}: "
                f"{human_size(before)} -> {human_size(after)} ({reduction:+.1f}% menos)"
            )
        except Exception as error:  # continúa para informar todos los archivos problemáticos
            failures += 1
            print(f"[ERROR] {source.relative_to(root)}: {error}")

    total_reduction = (1 - total_after / total_before) * 100 if total_before else 0
    print(
        f"\nResultado: {human_size(total_before)} -> {human_size(total_after)} "
        f"({total_reduction:.1f}% menos). Errores: {failures}."
    )
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
