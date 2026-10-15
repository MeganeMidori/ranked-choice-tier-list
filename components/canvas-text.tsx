"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { preload } from "react-dom";

const FONT_FAMILY = "Fanimaid";
const FONT_URL = "/Fanimaid-.ttf";

// Loaded once and shared by every CanvasText on the page.
let fontLoad: Promise<void> | null = null;
function loadFont() {
  fontLoad ??= new FontFace(FONT_FAMILY, `url(${FONT_URL})`).load().then((font) => {
    document.fonts.add(font);
  });
  return fontLoad;
}

// Draws text onto a canvas in the Fanimaid font and the element's text color. The font is sized so a lowercase
// "x" is xHeight CSS pixels tall with its bottom edge at baseline pixels from the top of a height-tall canvas,
// and letterSpacing CSS pixels are added between characters. The canvas is cropped to the ink on both sides, and
// words are wordGap CSS pixels apart ink to ink, so callers can space neighboring elements to match. onDraw is
// called once the text has been drawn, since that waits on the font loading.
export default function CanvasText({
  text,
  height,
  xHeight,
  baseline,
  letterSpacing = 0,
  wordGap,
  className,
  onDraw,
}: {
  text: string;
  height: number;
  xHeight: number;
  baseline: number;
  letterSpacing?: number;
  wordGap: number;
  className?: string;
  onDraw?: () => void;
}) {
  // Start downloading the font from the server-rendered <head>, rather than waiting for hydration to reach the
  // effect below. FontFace fetches in CORS mode, so the preload has to match for the browser to reuse it.
  preload(FONT_URL, { as: "font", type: "font/ttf", crossOrigin: "anonymous" });
  const ref = useRef<HTMLCanvasElement>(null);
  // An effect event, so a new onDraw on each parent render doesn't trigger a redraw.
  const handleDraw = useEffectEvent(() => onDraw?.());

  useEffect(() => {
    let cancelled = false;
    loadFont().then(() => {
      const canvas = ref.current;
      const ctx = canvas?.getContext("2d");
      if (cancelled || !canvas || !ctx) return;

      // Measure the font's own "x" ink, since its glyphs don't sit on the alphabetic baseline.
      ctx.font = `100px ${FONT_FAMILY}`;
      const x = ctx.measureText("x");
      const scale = xHeight / (x.actualBoundingBoxAscent + x.actualBoundingBoxDescent);
      const font = `${100 * scale}px ${FONT_FAMILY}`;
      // actualBoundingBoxDescent is negative when the ink sits above the baseline, so this lowers the baseline.
      const y = baseline - x.actualBoundingBoxDescent * scale;

      // Lay characters out one at a time rather than with ctx.letterSpacing, which older Safari lacks.
      // The font has no kerning, so this matches drawing the whole string. It has no space glyph either, so words
      // are placed by ink edges instead of drawing spaces in a fallback font.
      ctx.font = font;
      const glyphs: { char: string; x: number }[] = [];
      let inkRight = 0;
      text.split(" ").forEach((word, i) => {
        const chars = [...word];
        if (chars.length === 0) return;
        // Start the word's ink wordGap after the previous word's ink (or at 0 for the first word).
        const inkLeft = i === 0 ? 0 : inkRight + wordGap;
        let pen = inkLeft + ctx.measureText(chars[0]).actualBoundingBoxLeft;
        for (const char of chars) {
          const metrics = ctx.measureText(char);
          glyphs.push({ char, x: pen });
          inkRight = Math.max(inkRight, pen + metrics.actualBoundingBoxRight);
          pen += metrics.width + letterSpacing;
        }
      });
      const width = Math.ceil(inkRight);

      // Back the canvas with device pixels so the text stays sharp on high-DPI screens.
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      // Rounding the width up leaves a sliver of blank canvas, so pull the next element back over it.
      canvas.style.marginRight = `${inkRight - width}px`;

      // Resizing the canvas resets its context state, so set it up again.
      ctx.scale(dpr, dpr);
      ctx.font = font;
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = getComputedStyle(canvas).color;
      for (const { char, x } of glyphs) ctx.fillText(char, x, y);
      handleDraw();
    });
    return () => {
      cancelled = true;
    };
  }, [text, height, xHeight, baseline, letterSpacing, wordGap]);

  return <canvas ref={ref} className={className} role="img" aria-label={text} height={height} width={0} />;
}
