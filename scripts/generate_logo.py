"""Generate polished Pixmith logo + favicon (pixel art)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

# Palette
BG = (15, 23, 42, 255)  # deep slate
MINT = (168, 251, 211, 255)
MINT_SOFT = (120, 230, 190, 255)
MINT_DIM = (90, 180, 150, 180)
MINT_GLOW = (168, 251, 211, 90)
WHITE_SOFT = (220, 255, 240, 255)
TRANSPARENT = (0, 0, 0, 0)

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "projects" / "ui" / "src" / "assets"


def scale_nearest(img: Image.Image, factor: int) -> Image.Image:
    w, h = img.size
    return img.resize((w * factor, h * factor), Image.Resampling.NEAREST)


def draw_pixels(draw: ImageDraw.ImageDraw, cells: list[tuple[int, int]], color, ox=0, oy=0):
    for x, y in cells:
        draw.point((ox + x, oy + y), fill=color)


# ---------------------------------------------------------------------------
# Anvil / forge mark — 16x16 grid, reads as pixel anvil + spark
# ---------------------------------------------------------------------------
MARK = [
    # top horn / spark crown
    "....####....",
    "...######...",
    "..########..",
    ".##########.",
    ".##########.",
    "..###..###..",
    "...##..##...",
    "....####....",
    "....####....",
    "....####....",
    "...######...",
    "..########..",
    ".##########.",
    "############",
    ".##########.",
    "..########..",
]


def mark_cells(pattern: list[str]) -> list[tuple[int, int]]:
    cells = []
    for y, row in enumerate(pattern):
        for x, ch in enumerate(row):
            if ch == "#":
                cells.append((x, y))
    return cells


# 5x7 pixel font (uppercase-ish, compact game style)
FONT: dict[str, list[str]] = {
    "P": [
        "####.",
        "#...#",
        "#...#",
        "####.",
        "#....",
        "#....",
        "#....",
    ],
    "I": [
        "###",
        ".#.",
        ".#.",
        ".#.",
        ".#.",
        ".#.",
        "###",
    ],
    "X": [
        "#...#",
        "#...#",
        ".#.#.",
        "..#..",
        ".#.#.",
        "#...#",
        "#...#",
    ],
    "M": [
        "#....#",
        "##..##",
        "#.##.#",
        "#....#",
        "#....#",
        "#....#",
        "#....#",
    ],
    "T": [
        "#####",
        "..#..",
        "..#..",
        "..#..",
        "..#..",
        "..#..",
        "..#..",
    ],
    "H": [
        "#...#",
        "#...#",
        "#...#",
        "#####",
        "#...#",
        "#...#",
        "#...#",
    ],
}


def glyph_width(ch: str) -> int:
    return len(FONT[ch][0])


def text_width(text: str, gap: int = 1) -> int:
    if not text:
        return 0
    return sum(glyph_width(c) for c in text) + gap * (len(text) - 1)


def blit_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    ox: int,
    oy: int,
    color,
    gap: int = 1,
) -> int:
    x = ox
    for i, ch in enumerate(text):
        rows = FONT[ch]
        for dy, row in enumerate(rows):
            for dx, cell in enumerate(row):
                if cell == "#":
                    draw.point((x + dx, oy + dy), fill=color)
        x += glyph_width(ch) + (gap if i < len(text) - 1 else 0)
    return x - ox


def soft_glow(base: Image.Image, radius: int = 6, strength: float = 0.55) -> Image.Image:
    """Add soft mint glow under opaque pixels without blurring the pixels themselves."""
    alpha = base.split()[-1]
    glow = Image.new("RGBA", base.size, TRANSPARENT)
    # Expand alpha slightly for glow source
    expanded = alpha.filter(ImageFilter.MaxFilter(3))
    glow_layer = Image.new("RGBA", base.size, MINT_GLOW)
    glow_layer.putalpha(expanded)
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=radius))
    # Dim
    r, g, b, a = glow_layer.split()
    a = a.point(lambda v: int(v * strength))
    glow_layer = Image.merge("RGBA", (r, g, b, a))
    out = Image.alpha_composite(glow_layer, base)
    return out


def make_icon_small() -> Image.Image:
    """16x16 mark on transparent, with 2px padding -> 20x20 canvas."""
    pad = 2
    size = 12 + pad * 2
    img = Image.new("RGBA", (size, size), TRANSPARENT)
    draw = ImageDraw.Draw(img)
    cells = mark_cells(MARK)
    # body
    draw_pixels(draw, cells, MINT, ox=pad, oy=pad)
    # highlight row on top face
    for x, y in cells:
        if y in (0, 1) or (y == 2 and 3 <= x <= 8):
            draw.point((pad + x, pad + y), fill=WHITE_SOFT)
        if y >= 13:
            draw.point((pad + x, pad + y), fill=MINT_SOFT)
    return img


def make_logo_small() -> Image.Image:
    """Compose mark + wordmark on dark background (logical pixel canvas)."""
    mark = make_icon_small()  # 16x16 with pad = 16? wait 12+4=16
    # mark is 16x16 (12 + 2*2)

    word = "PIXMITH"
    gap = 1
    tw = text_width(word, gap=gap)
    underline_w = 18
    underline_h = 2

    mark_w, mark_h = mark.size
    content_w = max(mark_w, tw, underline_w)
    pad_x = 10
    pad_top = 8
    gap_mark_text = 5
    gap_text_line = 3
    pad_bottom = 8

    text_h = 7
    h = pad_top + mark_h + gap_mark_text + text_h + gap_text_line + underline_h + pad_bottom
    w = content_w + pad_x * 2

    canvas = Image.new("RGBA", (w, h), BG)
    # subtle vignette-ish frame pixels (optional corner accents)
    draw = ImageDraw.Draw(canvas)

    # place mark centered
    mx = (w - mark_w) // 2
    my = pad_top
    canvas.alpha_composite(mark, (mx, my))

    # text
    tx = (w - tw) // 2
    ty = my + mark_h + gap_mark_text
    blit_text(draw, word, tx, ty, MINT, gap=gap)

    # underline
    ux = (w - underline_w) // 2
    uy = ty + text_h + gap_text_line
    draw.rectangle([ux, uy, ux + underline_w - 1, uy + underline_h - 1], fill=MINT)

    return canvas


def make_favicon_small() -> Image.Image:
    """Square favicon: mark centered on dark bg."""
    mark = make_icon_small()
    size = 20
    canvas = Image.new("RGBA", (size, size), BG)
    mx = (size - mark.size[0]) // 2
    my = (size - mark.size[1]) // 2
    canvas.alpha_composite(mark, (mx, my))
    return canvas


def export_logo(path: Path, scale: int = 48):
    small = make_logo_small()
    # glow on small then scale? better: scale first for crisp pixels, glow after slightly
    crisp = scale_nearest(small, scale)
    # soft outer glow (keeps pixel edges)
    final = soft_glow(crisp, radius=max(8, scale // 3), strength=0.45)
    # re-composite crisp on top so text stays sharp
    final = Image.alpha_composite(final, crisp)
    path.parent.mkdir(parents=True, exist_ok=True)
    final.save(path, "PNG")
    print(f"Wrote {path} {final.size}")


def export_icon(path: Path, scale: int = 64):
    small = make_favicon_small()
    crisp = scale_nearest(small, scale)
    final = soft_glow(crisp, radius=max(10, scale // 3), strength=0.5)
    final = Image.alpha_composite(final, crisp)
    # make square matching previous usage
    final.save(path, "PNG")
    print(f"Wrote {path} {final.size}")


def export_transparent_mark(path: Path, scale: int = 64):
    small = make_icon_small()
    crisp = scale_nearest(small, scale)
    final = soft_glow(crisp, radius=max(8, scale // 4), strength=0.55)
    final = Image.alpha_composite(final, crisp)
    final.save(path, "PNG")
    print(f"Wrote {path} {final.size}")


def main():
    # Match previous approximate sizes / usage
    export_logo(ASSETS / "logo.png", scale=48)  # ~ (logical ~56x45) * 48
    export_icon(ASSETS / "icon.png", scale=64)  # 20*64 = 1280 sq-ish
    # also a transparent mark for potential UI use
    export_transparent_mark(ASSETS / "logo-mark.png", scale=64)


if __name__ == "__main__":
    main()
