# main.py — news-image-20261126
# Python 3.13, standard library only, no network.
# Draws a one-page world-news front page for Thursday 26 November 2026
# and writes it to /output/entry.png (or $MAKEFUN_OUTPUT_DIR/entry.png).
# Deterministic: fixed strings, fixed layout, zlib level 9, no time/random.
#
#   mkdir -p out && MAKEFUN_OUTPUT_DIR=out python3 main.py

import os
import struct
import zlib
from pathlib import Path

W = 1024
H = 1024

# ---------------------------------------------------------------------------
# 5x7 bitmap font. Each glyph is seven rows of five bits, '#' = on.
# ---------------------------------------------------------------------------
FONT = {
    'A': ('01110', '10001', '10001', '11111', '10001', '10001', '10001'),
    'B': ('11110', '10001', '10001', '11110', '10001', '10001', '11110'),
    'C': ('01110', '10001', '10000', '10000', '10000', '10001', '01110'),
    'D': ('11110', '10001', '10001', '10001', '10001', '10001', '11110'),
    'E': ('11111', '10000', '10000', '11110', '10000', '10000', '11111'),
    'F': ('11111', '10000', '10000', '11110', '10000', '10000', '10000'),
    'G': ('01110', '10001', '10000', '10111', '10001', '10001', '01111'),
    'H': ('10001', '10001', '10001', '11111', '10001', '10001', '10001'),
    'I': ('01110', '00100', '00100', '00100', '00100', '00100', '01110'),
    'J': ('00111', '00010', '00010', '00010', '00010', '10010', '01100'),
    'K': ('10001', '10010', '10100', '11000', '10100', '10010', '10001'),
    'L': ('10000', '10000', '10000', '10000', '10000', '10000', '11111'),
    'M': ('10001', '11011', '10101', '10101', '10001', '10001', '10001'),
    'N': ('10001', '11001', '10101', '10011', '10001', '10001', '10001'),
    'O': ('01110', '10001', '10001', '10001', '10001', '10001', '01110'),
    'P': ('11110', '10001', '10001', '11110', '10000', '10000', '10000'),
    'Q': ('01110', '10001', '10001', '10001', '10101', '10010', '01101'),
    'R': ('11110', '10001', '10001', '11110', '10100', '10010', '10001'),
    'S': ('01111', '10000', '10000', '01110', '00001', '00001', '11110'),
    'T': ('11111', '00100', '00100', '00100', '00100', '00100', '00100'),
    'U': ('10001', '10001', '10001', '10001', '10001', '10001', '01110'),
    'V': ('10001', '10001', '10001', '10001', '10001', '01010', '00100'),
    'W': ('10001', '10001', '10001', '10101', '10101', '11011', '10001'),
    'X': ('10001', '10001', '01010', '00100', '01010', '10001', '10001'),
    'Y': ('10001', '10001', '01010', '00100', '00100', '00100', '00100'),
    'Z': ('11111', '00001', '00010', '00100', '01000', '10000', '11111'),
    '0': ('01110', '10001', '10011', '10101', '11001', '10001', '01110'),
    '1': ('00100', '01100', '00100', '00100', '00100', '00100', '01110'),
    '2': ('01110', '10001', '00001', '00110', '01000', '10000', '11111'),
    '3': ('11111', '00010', '00100', '00010', '00001', '10001', '01110'),
    '4': ('00010', '00110', '01010', '10010', '11111', '00010', '00010'),
    '5': ('11111', '10000', '11110', '00001', '00001', '10001', '01110'),
    '6': ('01110', '10000', '10000', '11110', '10001', '10001', '01110'),
    '7': ('11111', '00001', '00010', '00100', '01000', '01000', '01000'),
    '8': ('01110', '10001', '10001', '01110', '10001', '10001', '01110'),
    '9': ('01110', '10001', '10001', '01111', '00001', '00001', '01110'),
    ' ': ('00000', '00000', '00000', '00000', '00000', '00000', '00000'),
    '.': ('00000', '00000', '00000', '00000', '00000', '01100', '01100'),
    ',': ('00000', '00000', '00000', '00000', '01100', '00100', '01000'),
    ':': ('00000', '01100', '01100', '00000', '01100', '01100', '00000'),
    ';': ('00000', '01100', '01100', '00000', '01100', '00100', '01000'),
    '-': ('00000', '00000', '00000', '01110', '00000', '00000', '00000'),
    '/': ('00001', '00010', '00010', '00100', '01000', '01000', '10000'),
    '(': ('00010', '00100', '01000', '01000', '01000', '00100', '00010'),
    ')': ('01000', '00100', '00010', '00010', '00010', '00100', '01000'),
    "'": ('00100', '00100', '01000', '00000', '00000', '00000', '00000'),
    '&': ('01100', '10010', '10100', '01000', '10101', '10010', '01101'),
    '%': ('11001', '11010', '00010', '00100', '01000', '01011', '10011'),
    '+': ('00000', '00100', '00100', '11111', '00100', '00100', '00000'),
    '?': ('01110', '10001', '00001', '00110', '00100', '00000', '00100'),
    '!': ('00100', '00100', '00100', '00100', '00100', '00000', '00100'),
    '=': ('00000', '00000', '11111', '00000', '11111', '00000', '00000'),
    '"': ('01010', '01010', '00000', '00000', '00000', '00000', '00000'),
}

PAPER = (248, 245, 238)
NAVY = (16, 36, 62)
GOLD = (201, 162, 39)
WHITE = (255, 255, 255)
INK = (17, 17, 17)
GREY = (51, 51, 51)
CARD_LINE = (216, 210, 196)

# ---------------------------------------------------------------------------
# Raster buffer (RGB, row-major)
# ---------------------------------------------------------------------------
px = bytearray(W * H * 3)


def set_pixel(x, y, color):
    if 0 <= x < W and 0 <= y < H:
        i = (y * W + x) * 3
        px[i], px[i + 1], px[i + 2] = color


def fill_rect(x, y, w, h, color):
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            set_pixel(xx, yy, color)


def text_width(text, scale):
    if not text:
        return 0
    return len(text) * 6 * scale - scale


def draw_text(text, x, y, scale, color):
    for ci, ch in enumerate(text.upper()):
        glyph = FONT.get(ch, FONT['?'])
        cx = x + ci * 6 * scale
        for r in range(7):
            row = glyph[r]
            for col in range(5):
                if row[col] == '1':
                    fill_rect(cx + col * scale, y + r * scale, scale, scale, color)


def draw_text_centered(text, y, scale, color):
    draw_text(text, (W - text_width(text, scale)) // 2, y, scale, color)


def wrap(text, scale, max_width):
    """Word-wrap to lines that fit max_width px at the given scale."""
    max_chars = max(1, (max_width + scale) // (6 * scale))
    lines = []
    cur = ''
    for word in text.split(' '):
        nxt = word if cur == '' else cur + ' ' + word
        if len(nxt) <= max_chars:
            cur = nxt
        else:
            if cur != '':
                lines.append(cur)
            cur = word
    if cur != '':
        lines.append(cur)
    return lines

# ---------------------------------------------------------------------------
# News: Thursday 26 November 2026. Verified by web search on 2026-11-26.
# Events happened, or were first reported, on 26 Nov 2026 in some time zone.
# ---------------------------------------------------------------------------
STORIES = [
    {
        'tag': 'OIL',
        'color': (125, 102, 8),
        'headline': 'BRENT NEARS 95 ON GULF ATTACKS',
        'summary': 'HOUTHI REFINERY CLAIM AND IRAN MINE STRIKES LIFT OIL. BRENT AT 94.71.',
    },
    {
        'tag': 'TRADE',
        'color': (20, 90, 50),
        'headline': 'US PROPOSES TARIFFS ON 14 ECONOMIES',
        'summary': 'USTR NAMES RATES UP TO 35 PERCENT. INDIA 25, VIETNAM 35, CHINA PLUS 20.',
    },
    {
        'tag': 'UKRAINE',
        'color': (27, 79, 114),
        'headline': 'UKRAINE HITS RUSSIAN AIRBASE',
        'summary': 'KYIV SAYS FIVE JETS DAMAGED AT SAVASLEYKA. RUSSIA HITS KYIV WITH MISSILES.',
    },
    {
        'tag': 'UK',
        'color': (146, 43, 33),
        'headline': 'UK WRITES TO 100,000 VETERANS',
        'summary': 'FIRST CALL-UP LETTERS SINCE COLD WAR. RESERVISTS TOLD TO BE READY.',
    },
    {
        'tag': 'NORTH KOREA',
        'color': (108, 52, 131),
        'headline': 'KIM VOWS MORE NUKES, EXPELS SWISS',
        'summary': 'PYONGYANG TO EXPAND ARSENAL. ORDERS SWISS OFFICE SHUT AFTER TRUMP OVERTURE.',
    },
    {
        'tag': 'USA',
        'color': (26, 82, 118),
        'headline': "MACY'S PARADE MOVED BY STORM",
        'summary': '100TH THANKSGIVING PARADE POSTPONED TO SATURDAY. FIRST WEATHER DELAY EVER.',
    },
]

# ---------------------------------------------------------------------------
# Layout: 1024 x 1024 front page
# ---------------------------------------------------------------------------
fill_rect(0, 0, W, H, PAPER)

# Header band
fill_rect(0, 0, W, 148, NAVY)
draw_text_centered('WORLD NEWS', 22, 7, WHITE)
draw_text_centered('THURSDAY 26 NOVEMBER 2026', 86, 4, GOLD)
fill_rect(0, 144, W, 4, GOLD)

# Subhead
draw_text_centered('SIX STORIES THAT DEFINED THE DAY', 160, 3, NAVY)

# Story cards
CARD_X = 28
CARD_W = 968
ROW_H = 122
ROW_GAP = 8
START_Y = 196

for i, s in enumerate(STORIES):
    y = START_Y + i * (ROW_H + ROW_GAP)
    # Card
    fill_rect(CARD_X, y, CARD_W, ROW_H, WHITE)
    # Border: top and bottom hairlines + side hairlines
    fill_rect(CARD_X, y, CARD_W, 2, CARD_LINE)
    fill_rect(CARD_X, y + ROW_H - 2, CARD_W, 2, CARD_LINE)
    fill_rect(CARD_X, y, 2, ROW_H, CARD_LINE)
    fill_rect(CARD_X + CARD_W - 2, y, 2, ROW_H, CARD_LINE)
    # Accent bar
    fill_rect(CARD_X, y, 14, ROW_H, s['color'])
    # Tag
    draw_text(s['tag'], CARD_X + 30, y + 12, 3, s['color'])
    # Headline
    draw_text(s['headline'], CARD_X + 30, y + 40, 4, INK)
    # Summary, wrapped to two lines
    lines = wrap(s['summary'], 3, CARD_W - 60)[:2]
    for li, line in enumerate(lines):
        draw_text(line, CARD_X + 30, y + 74 + li * 24, 3, GREY)

# Footer: sources
draw_text_centered('SOURCES: REUTERS / AP / TELEGRAPH / WSJ / CNN', 984, 3, GREY)

# ---------------------------------------------------------------------------
# PNG encoder (stdlib only): IHDR + IDAT (zlib deflate, level 9) + IEND.
# ---------------------------------------------------------------------------
def png_chunk(chunk_type, data):
    body = chunk_type + data
    return (
        struct.pack('>I', len(data))
        + body
        + struct.pack('>I', zlib.crc32(body) & 0xFFFFFFFF)
    )


ihdr = struct.pack('>IIBBBBB', W, H, 8, 2, 0, 0, 0)

raw = bytearray()
for y in range(H):
    raw.append(0)  # filter: none
    raw += px[y * W * 3:(y + 1) * W * 3]
idat = zlib.compress(bytes(raw), 9)

png = b''.join([
    b'\x89PNG\r\n\x1a\n',
    png_chunk(b'IHDR', ihdr),
    png_chunk(b'IDAT', idat),
    png_chunk(b'IEND', b''),
])

out_dir = Path(os.environ.get('MAKEFUN_OUTPUT_DIR', '/output'))
out_dir.mkdir(parents=True, exist_ok=True)
(out_dir / 'entry.png').write_bytes(png)
