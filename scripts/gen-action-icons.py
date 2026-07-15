#!/usr/bin/env python3
"""Generate the 4 icon files (icon/icon@2x/key/key@2x) for each plugin
action as simple flat glyphs — no external deps (no PIL, no SVG
rasterizer available in this environment), just a minimal PNG encoder
over a supersampled canvas for anti-aliasing.

Run: python3 scripts/gen-action-icons.py
Regenerate anytime the glyph design changes — this is a one-off asset
generator, not part of the build.
"""
import math
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMGS = ROOT / "com.angelcantugr.devworkflow.sdPlugin" / "imgs" / "actions"

BG = (28, 28, 35)  # matches the existing placeholder background exactly
SUPERSAMPLE = 4


class Canvas:
    def __init__(self, size, bg):
        self.n = size * SUPERSAMPLE
        self.px = [[bg for _ in range(self.n)] for _ in range(self.n)]

    def _blend(self, x, y, color, alpha):
        if 0 <= x < self.n and 0 <= y < self.n and alpha > 0:
            r0, g0, b0 = self.px[y][x]
            r1, g1, b1 = color
            a = min(1.0, alpha)
            self.px[y][x] = (
                round(r0 + (r1 - r0) * a),
                round(g0 + (g1 - g0) * a),
                round(b0 + (b1 - b0) * a),
            )

    def _coverage(self, inside_fn, x, y, samples=2):
        # 2x2 sub-sample coverage per supersampled pixel for softer edges.
        hit = 0
        for sx in range(samples):
            for sy in range(samples):
                px = x + (sx + 0.5) / samples
                py = y + (sy + 0.5) / samples
                if inside_fn(px, py):
                    hit += 1
        return hit / (samples * samples)

    def fill(self, inside_fn, color, bbox):
        x0, y0, x1, y1 = bbox
        for y in range(max(0, int(y0)), min(self.n, int(y1) + 1)):
            for x in range(max(0, int(x0)), min(self.n, int(x1) + 1)):
                cov = self._coverage(inside_fn, x, y)
                if cov > 0:
                    self._blend(x, y, color, cov)

    def rounded_rect(self, cx0, cy0, cx1, cy1, r, color):
        def inside(x, y):
            nx = min(max(x, cx0 + r), cx1 - r)
            ny = min(max(y, cy0 + r), cy1 - r)
            if cx0 + r <= x <= cx1 - r or cy0 + r <= y <= cy1 - r:
                return cx0 <= x <= cx1 and cy0 <= y <= cy1
            return (x - nx) ** 2 + (y - ny) ** 2 <= r * r

        self.fill(inside, color, (cx0 - 1, cy0 - 1, cx1 + 1, cy1 + 1))

    def circle(self, cx, cy, r, color):
        self.fill(lambda x, y: (x - cx) ** 2 + (y - cy) ** 2 <= r * r, color,
                   (cx - r - 1, cy - r - 1, cx + r + 1, cy + r + 1))

    def ring(self, cx, cy, r, width, color):
        r_out, r_in = r + width / 2, r - width / 2

        def inside(x, y):
            d2 = (x - cx) ** 2 + (y - cy) ** 2
            return r_in * r_in <= d2 <= r_out * r_out

        self.fill(inside, color, (cx - r_out - 1, cy - r_out - 1, cx + r_out + 1, cy + r_out + 1))

    def arc(self, cx, cy, r, width, start_deg, end_deg, color):
        r_out, r_in = r + width / 2, r - width / 2
        a0, a1 = math.radians(start_deg), math.radians(end_deg)

        def inside(x, y):
            d2 = (x - cx) ** 2 + (y - cy) ** 2
            if not (r_in * r_in <= d2 <= r_out * r_out):
                return False
            ang = math.atan2(y - cy, x - cx)
            if ang < 0:
                ang += 2 * math.pi
            a0n, a1n = a0 % (2 * math.pi), a1 % (2 * math.pi)
            return a0n <= ang <= a1n

        self.fill(inside, color, (cx - r_out - 1, cy - r_out - 1, cx + r_out + 1, cy + r_out + 1))

    def line(self, x0, y0, x1, y1, width, color):
        dx, dy = x1 - x0, y1 - y0
        length = math.hypot(dx, dy) or 1
        ux, uy = dx / length, dy / length
        # Perpendicular half-width offsets define a capsule (rect + 2 round caps).
        def inside(x, y):
            t = ((x - x0) * ux + (y - y0) * uy)
            t = min(max(t, 0), length)
            px, py = x0 + ux * t, y0 + uy * t
            return (x - px) ** 2 + (y - py) ** 2 <= (width / 2) ** 2

        pad = width / 2 + 1
        self.fill(inside, color, (min(x0, x1) - pad, min(y0, y1) - pad, max(x0, x1) + pad, max(y0, y1) + pad))

    def polygon(self, points, color):
        def inside(x, y):
            # Standard even-odd point-in-polygon test.
            n = len(points)
            j = n - 1
            c = False
            for i in range(n):
                xi, yi = points[i]
                xj, yj = points[j]
                if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
                    c = not c
                j = i
            return c

        xs = [p[0] for p in points]
        ys = [p[1] for p in points]
        self.fill(inside, color, (min(xs) - 1, min(ys) - 1, max(xs) + 1, max(ys) + 1))

    def to_png_bytes(self, out_size):
        # Box-downsample the supersampled canvas to the final size.
        s = SUPERSAMPLE
        rows = []
        for oy in range(out_size):
            row = bytearray()
            row.append(0)  # filter type 0 (none)
            for ox in range(out_size):
                r = g = b = 0
                for sy in range(s):
                    for sx in range(s):
                        pr, pg, pb = self.px[oy * s + sy][ox * s + sx]
                        r += pr
                        g += pg
                        b += pb
                n = s * s
                # Fully opaque RGBA — real Stream Deck profile Images/ files
                # are RGBA (color type 6); matching that exactly avoids
                # relying on any undocumented format tolerance.
                row += bytes((r // n, g // n, b // n, 255))
            rows.append(bytes(row))
        raw = b"".join(rows)

        def chunk(tag, data):
            return (struct.pack(">I", len(data)) + tag + data +
                    struct.pack(">I", zlib.crc32(tag + data)))

        sig = b"\x89PNG\r\n\x1a\n"
        ihdr = struct.pack(">IIBBBBB", out_size, out_size, 8, 6, 0, 0, 0)
        idat = zlib.compress(raw, 9)
        return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


def render(name, draw_fn, accent):
    """draw_fn(canvas, size) draws the glyph at the given logical (pre-
    supersample) pixel size; called once per output resolution so strokes
    stay crisp rather than being scaled from a single master."""
    out_dir = IMGS / name
    out_dir.mkdir(parents=True, exist_ok=True)
    for fname, size in [("icon.png", 20), ("icon@2x.png", 40), ("key.png", 72), ("key@2x.png", 144)]:
        c = Canvas(size, BG)
        draw_fn(c, size, accent)
        (out_dir / fname).write_bytes(c.to_png_bytes(size))
    print(f"{name}: wrote icon.png, icon@2x.png, key.png, key@2x.png")


def bg_rounded_frame(c, size):
    # Subtle rounded-corner frame so icons read as tiles, not raw squares.
    r = size * 0.16
    c.rounded_rect(0, 0, size * SUPERSAMPLE, size * SUPERSAMPLE, r * SUPERSAMPLE, BG)


def s(size, v):
    """Scale a 0..1 fraction of the logical size to supersampled pixels."""
    return v * size * SUPERSAMPLE


# ─── Glyphs ──────────────────────────────────────────────────────────────────

def draw_app_launcher(c, size, accent):
    bg_rounded_frame(c, size)
    cx, cy = s(size, 0.5), s(size, 0.5)
    r = s(size, 0.26)
    c.ring(cx, cy, r, s(size, 0.075), accent)
    # Upward arrow inside the ring — "launch".
    tip = (cx, cy - s(size, 0.16))
    c.line(cx, cy + s(size, 0.14), cx, cy - s(size, 0.12), s(size, 0.075), accent)
    c.polygon([tip, (cx - s(size, 0.11), cy - s(size, 0.02)), (cx + s(size, 0.11), cy - s(size, 0.02))], accent)


def draw_shell_command(c, size, accent):
    bg_rounded_frame(c, size)
    cx, cy = s(size, 0.5), s(size, 0.5)
    w = s(size, 0.075)
    # ">" chevron
    c.line(cx - s(size, 0.16), cy - s(size, 0.14), cx + s(size, 0.02), cy, w, accent)
    c.line(cx + s(size, 0.02), cy, cx - s(size, 0.16), cy + s(size, 0.14), w, accent)
    # cursor bar
    c.line(cx + s(size, 0.08), cy + s(size, 0.16), cx + s(size, 0.24), cy + s(size, 0.16), w, accent)


def draw_tmux_session(c, size, accent):
    bg_rounded_frame(c, size)
    gap = s(size, 0.045)
    x0, y0, x1, y1 = s(size, 0.22), s(size, 0.22), s(size, 0.78), s(size, 0.78)
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    rr = s(size, 0.05)
    c.rounded_rect(x0, y0, mx - gap, my - gap, rr, accent)
    c.rounded_rect(mx + gap, y0, x1, my - gap, rr, accent)
    c.rounded_rect(x0, my + gap, mx - gap, y1, rr, accent)
    c.rounded_rect(mx + gap, my + gap, x1, y1, rr, accent)


def draw_script_runner(c, size, accent):
    bg_rounded_frame(c, size)
    cx, cy = s(size, 0.5), s(size, 0.5)
    r = s(size, 0.28)
    c.ring(cx, cy, r, s(size, 0.06), accent)
    tri = s(size, 0.16)
    c.polygon([
        (cx - tri * 0.55, cy - tri),
        (cx - tri * 0.55, cy + tri),
        (cx + tri * 0.9, cy),
    ], accent)


def draw_status_tile(c, size, accent):
    bg_rounded_frame(c, size)
    cx, cy = s(size, 0.5), s(size, 0.5)
    c.circle(cx, cy, s(size, 0.09), accent)
    c.arc(cx, cy, s(size, 0.22), s(size, 0.06), 200, 340, accent)
    c.arc(cx, cy, s(size, 0.34), s(size, 0.06), 200, 340, accent)


ACTIONS = [
    ("app-launcher", draw_app_launcher, (137, 180, 250)),   # blue
    ("shell-command", draw_shell_command, (166, 227, 161)), # green
    ("tmux-session", draw_tmux_session, (203, 166, 247)),   # mauve
    ("script-runner", draw_script_runner, (250, 179, 135)), # peach
    ("status-tile", draw_status_tile, (148, 226, 213)),     # teal
]


# ─── Native-action glyphs ────────────────────────────────────────────────────
# Generated profiles (src/profiles/) also embed a key face for Stream Deck's
# own system actions (Hotkey, Text, Open, Pages, Multi Action) — a real
# GUI-built profile always writes an Images/*.png for every key, native or
# plugin, and omitting one was confirmed (2026-07-15) to leave the key
# blank on-device. These live in imgs/native/<name>/key@2x.png — 144x144
# only, since that's the sole size ever copied into a profile bundle
# (native actions aren't declared in manifest.json, so no icon.png/key.png
# default-state sizes are needed).

NATIVE_DIR = ROOT / "com.angelcantugr.devworkflow.sdPlugin" / "imgs" / "native"


def render_native(name, draw_fn, accent):
    out_dir = NATIVE_DIR / name
    out_dir.mkdir(parents=True, exist_ok=True)
    c = Canvas(144, BG)
    draw_fn(c, 144, accent)
    (out_dir / "key@2x.png").write_bytes(c.to_png_bytes(144))
    print(f"native/{name}: wrote key@2x.png")


def draw_hotkey(c, size, accent):
    bg_rounded_frame(c, size)
    x0, y0, x1, y1 = s(size, 0.24), s(size, 0.28), s(size, 0.76), s(size, 0.72)
    c.rounded_rect(x0, y0, x1, y1, s(size, 0.09), accent)
    inset = s(size, 0.05)
    c.rounded_rect(x0 + inset, y0 + inset, x1 - inset, y1 - inset, s(size, 0.06), BG)
    c.circle((x0 + x1) / 2, (y0 + y1) / 2, s(size, 0.05), accent)


def draw_text(c, size, accent):
    bg_rounded_frame(c, size)
    x0, x1 = s(size, 0.24), s(size, 0.76)
    y0 = s(size, 0.34)
    step = s(size, 0.16)
    for i, wfrac in enumerate((1.0, 0.75, 0.55)):
        yy = y0 + step * i
        c.line(x0, yy, x0 + (x1 - x0) * wfrac, yy, s(size, 0.075), accent)


def draw_open(c, size, accent):
    bg_rounded_frame(c, size)
    x0, y0, x1, y1 = s(size, 0.22), s(size, 0.32), s(size, 0.68), s(size, 0.78)
    c.rounded_rect(x0, y0, x1, y1, s(size, 0.07), accent)
    inset = s(size, 0.055)
    c.rounded_rect(x0 + inset, y0 + inset, x1 - inset, y1 - inset, s(size, 0.045), BG)
    ax0, ay0 = x1 - s(size, 0.06), y0 + s(size, 0.06)
    ax1, ay1 = s(size, 0.82), s(size, 0.18)
    c.line(ax0, ay0, ax1, ay1, s(size, 0.06), accent)
    ang = math.atan2(ay1 - ay0, ax1 - ax0)
    ah = s(size, 0.09)
    a1 = (ax1 - ah * math.cos(ang - 0.5), ay1 - ah * math.sin(ang - 0.5))
    a2 = (ax1 - ah * math.cos(ang + 0.5), ay1 - ah * math.sin(ang + 0.5))
    c.polygon([(ax1, ay1), a1, a2], accent)


def draw_page(c, size, accent):
    bg_rounded_frame(c, size)
    x0, y0, x1, y1 = s(size, 0.28), s(size, 0.22), s(size, 0.72), s(size, 0.78)
    fold = s(size, 0.14)
    c.polygon([(x0, y0), (x1 - fold, y0), (x1, y0 + fold), (x1, y1), (x0, y1)], accent)
    c.polygon([(x1 - fold, y0), (x1, y0 + fold), (x1 - fold, y0 + fold)], BG)


def draw_multiaction(c, size, accent):
    bg_rounded_frame(c, size)
    cy = s(size, 0.5)
    xs = [s(size, 0.28), s(size, 0.5), s(size, 0.72)]
    c.line(xs[0], cy, xs[2], cy, s(size, 0.045), accent)
    for x in xs:
        c.circle(x, cy, s(size, 0.06), accent)


NATIVE_ACTIONS = [
    ("hotkey", draw_hotkey, (249, 226, 175)),        # yellow
    ("text", draw_text, (137, 220, 235)),            # sky
    ("open", draw_open, (116, 199, 236)),            # sapphire
    ("page", draw_page, (180, 190, 254)),            # lavender
    ("multiaction", draw_multiaction, (242, 205, 205)),  # flamingo
]


# ─── Semantic-category glyphs ────────────────────────────────────────────────
# What a key DOES (git, PR, notes, search, …), independent of which native
# or plugin primitive implements it — see src/profiles/model.ts IconCategory
# and src/profiles/action-images.ts. Without these every text()/hotkey()/
# scriptRunner() call on a profile collapsed to one generic icon per
# primitive type, which is indistinguishable in practice on a 32-key deck.

def draw_git(c, size, accent):
    bg_rounded_frame(c, size)
    cx = s(size, 0.38)
    y0, y1 = s(size, 0.24), s(size, 0.76)
    w = s(size, 0.06)
    c.line(cx, y0, cx, y1, w, accent)
    bx, by = s(size, 0.66), s(size, 0.38)
    c.line(cx, s(size, 0.5), bx, by, w, accent)
    for px, py in ((cx, y0), (cx, y1), (bx, by)):
        c.circle(px, py, s(size, 0.07), accent)


def draw_pr(c, size, accent):
    bg_rounded_frame(c, size)
    x0, y0, x1, y1 = s(size, 0.24), s(size, 0.24), s(size, 0.76), s(size, 0.76)
    c.rounded_rect(x0, y0, x1, y1, s(size, 0.09), accent)
    inset = s(size, 0.055)
    c.rounded_rect(x0 + inset, y0 + inset, x1 - inset, y1 - inset, s(size, 0.06), BG)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    w = s(size, 0.055)
    c.line(cx - s(size, 0.11), cy, cx - s(size, 0.02), cy + s(size, 0.09), w, accent)
    c.line(cx - s(size, 0.02), cy + s(size, 0.09), cx + s(size, 0.14), cy - s(size, 0.10), w, accent)


def draw_issue(c, size, accent):
    bg_rounded_frame(c, size)
    cx, cy = s(size, 0.5), s(size, 0.5)
    c.circle(cx, cy, s(size, 0.28), accent)
    c.line(cx, cy - s(size, 0.14), cx, cy + s(size, 0.02), s(size, 0.055), BG)
    c.circle(cx, cy + s(size, 0.14), s(size, 0.035), BG)


def draw_ai(c, size, accent):
    bg_rounded_frame(c, size)
    cx, cy = s(size, 0.46), s(size, 0.5)

    def diamond(dcx, dcy, rx, ry):
        return [(dcx, dcy - ry), (dcx + rx, dcy), (dcx, dcy + ry), (dcx - rx, dcy)]

    c.polygon(diamond(cx, cy, s(size, 0.20), s(size, 0.28)), accent)
    c.polygon(diamond(cx + s(size, 0.20), cy - s(size, 0.20), s(size, 0.065), s(size, 0.09)), accent)


def draw_agent_flow(c, size, accent):
    bg_rounded_frame(c, size)
    p1 = (s(size, 0.30), s(size, 0.68))
    p2 = (s(size, 0.70), s(size, 0.68))
    p3 = (s(size, 0.50), s(size, 0.30))
    w = s(size, 0.045)
    c.line(p1[0], p1[1], p2[0], p2[1], w, accent)
    c.line(p1[0], p1[1], p3[0], p3[1], w, accent)
    c.line(p2[0], p2[1], p3[0], p3[1], w, accent)
    for px, py in (p1, p2, p3):
        c.circle(px, py, s(size, 0.07), accent)


def draw_report(c, size, accent):
    bg_rounded_frame(c, size)
    base_y = s(size, 0.72)
    bw = s(size, 0.12)
    gap = s(size, 0.06)
    x = s(size, 0.26)
    for h in (0.18, 0.30, 0.44):
        c.rounded_rect(x, base_y - s(size, h), x + bw, base_y, s(size, 0.025), accent)
        x += bw + gap


def draw_notes(c, size, accent):
    bg_rounded_frame(c, size)
    x0, x1 = s(size, 0.36), s(size, 0.78)
    box = s(size, 0.08)
    y0 = s(size, 0.30)
    step = s(size, 0.19)
    for i in range(3):
        yy = y0 + step * i
        c.rounded_rect(s(size, 0.22), yy - box / 2, s(size, 0.22) + box, yy + box / 2, s(size, 0.015), accent)
        c.line(x0, yy, x1 - i * s(size, 0.10), yy, s(size, 0.045), accent)


def draw_search(c, size, accent):
    bg_rounded_frame(c, size)
    cx, cy = s(size, 0.44), s(size, 0.44)
    r = s(size, 0.16)
    c.ring(cx, cy, r, s(size, 0.055), accent)
    hx0, hy0 = cx + r * 0.75, cy + r * 0.75
    c.line(hx0, hy0, s(size, 0.76), s(size, 0.76), s(size, 0.06), accent)


def draw_debug(c, size, accent):
    bg_rounded_frame(c, size)
    cx, cy = s(size, 0.42), s(size, 0.5)
    tri = s(size, 0.16)
    c.polygon([(cx - tri * 0.4, cy - tri), (cx - tri * 0.4, cy + tri), (cx + tri * 0.7, cy)], accent)
    c.line(s(size, 0.68), cy - s(size, 0.16), s(size, 0.68), cy + s(size, 0.16), s(size, 0.06), accent)


def draw_save(c, size, accent):
    bg_rounded_frame(c, size)
    x0, y0, x1, y1 = s(size, 0.26), s(size, 0.24), s(size, 0.74), s(size, 0.76)
    c.rounded_rect(x0, y0, x1, y1, s(size, 0.06), accent)
    c.rounded_rect(x0 + s(size, 0.10), y0, x1 - s(size, 0.10), y0 + s(size, 0.16), s(size, 0.02), BG)


def draw_browser(c, size, accent):
    bg_rounded_frame(c, size)
    x0, y0, x1, y1 = s(size, 0.20), s(size, 0.26), s(size, 0.80), s(size, 0.74)
    c.rounded_rect(x0, y0, x1, y1, s(size, 0.06), accent)
    inset = s(size, 0.045)
    bar_y = y0 + s(size, 0.14)
    c.rounded_rect(x0 + inset, bar_y, x1 - inset, y1 - inset, s(size, 0.035), BG)
    for dx in (0.28, 0.34, 0.40):
        c.circle(s(size, dx), y0 + s(size, 0.07), s(size, 0.018), BG)


def draw_tools(c, size, accent):
    bg_rounded_frame(c, size)
    cx, cy = s(size, 0.5), s(size, 0.5)
    c.ring(cx, cy, s(size, 0.16), s(size, 0.06), accent)
    for ang in (0, 90, 180, 270):
        rad = math.radians(ang)
        tx, ty = cx + math.cos(rad) * s(size, 0.24), cy + math.sin(rad) * s(size, 0.24)
        c.circle(tx, ty, s(size, 0.045), accent)


SEMANTIC_CATEGORIES = [
    ("git", draw_git, (245, 224, 220)),          # rosewater
    ("pr", draw_pr, (235, 160, 172)),            # maroon
    ("issue", draw_issue, (243, 139, 168)),      # red
    ("ai", draw_ai, (245, 194, 231)),            # pink
    ("agent-flow", draw_agent_flow, (137, 180, 250)),  # blue
    ("report", draw_report, (166, 227, 161)),    # green
    ("notes", draw_notes, (249, 226, 175)),      # yellow
    ("search", draw_search, (116, 199, 236)),    # sapphire
    ("debug", draw_debug, (250, 179, 135)),      # peach
    ("save", draw_save, (137, 220, 235)),        # sky
    ("browser", draw_browser, (180, 190, 254)),  # lavender
    ("tools", draw_tools, (242, 205, 205)),      # flamingo
]

if __name__ == "__main__":
    for name, fn, accent in ACTIONS:
        render(name, fn, accent)
    for name, fn, accent in NATIVE_ACTIONS:
        render_native(name, fn, accent)
    for name, fn, accent in SEMANTIC_CATEGORIES:
        render_native(name, fn, accent)
