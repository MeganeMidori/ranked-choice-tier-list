"use client";

import { useEffect, useEffectEvent, useState } from "react";
import Image from "next/image";
import type { Candidate } from "@/lib/candidates";
import CanvasText from "@/components/canvas-text";

// Height of the logo's viewBox.
const LOGO_VIEWBOX_HEIGHT = 188;
// Where the logo's lowercase "maid" letters sit, in its 188-unit-tall viewBox.
const LOGO_X_HEIGHT = 117.9 - 32.5;
const LOGO_BASELINE = 117.9;
// Top of the tallest letters ("d"), used with the baseline to find the letters' vertical center.
const LOGO_ASCENDER = 15.4;
// Extra space the logo puts between its letters beyond the font's own spacing, fitted from the "maid" letter positions.
const LOGO_LETTER_SPACING = 5.1;
// Ink-to-ink space between words, both inside the canvas text and between it and the logo.
const WORD_GAP = 22.5;
// Blank space the logo's viewBox leaves left of its "m".
const LOGO_LEFT_BEARING = 1.4;

// The logo already reads "maid café", so drop that suffix from names drawn next to it.
function withoutMaidCafe(name: string) {
  return name.replace(/\s*maid\s*caf[eé]\s*$/i, "");
}

// The candidate's name drawn in the logo font, followed by the "maid café" logo.
// height is the logo's rendered height in CSS pixels. monochrome draws the name and logo in solid black.
// centerOnLetters shifts everything down toward centering the letters rather than the whole logo with the maid's
// feet hanging below them. It goes halfway, since fully centered letters look low with the feet underneath.
// onReady is called once both the name and the logo are showing.
export default function CandidateLogo({
  candidate,
  height = 32,
  monochrome = false,
  centerOnLetters = false,
  onReady,
}: {
  candidate: Candidate;
  height?: number;
  monochrome?: boolean;
  centerOnLetters?: boolean;
  onReady?: () => void;
}) {
  // Stay hidden until both the name and the logo can show, rather than showing "maid café" with no name first.
  const [nameDrawn, setNameDrawn] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const ready = nameDrawn && logoLoaded;
  const handleReady = useEffectEvent(() => onReady?.());
  useEffect(() => {
    if (ready) handleReady();
  }, [ready]);
  const logoScale = height / LOGO_VIEWBOX_HEIGHT;
  // A transform rather than a margin, so the layout box (and the pill around it) keeps its size.
  const lettersOffset = ((LOGO_VIEWBOX_HEIGHT / 2 - (LOGO_ASCENDER + LOGO_BASELINE) / 2) * logoScale) / 2;
  return (
    <div
      // invisible keeps the line's space, so content around it doesn't shift when it appears.
      className={`flex shrink-0 items-center ${ready ? "" : "invisible"}`}
      style={{
        gap: (WORD_GAP - LOGO_LEFT_BEARING) * logoScale,
        transform: centerOnLetters ? `translateY(${lettersOffset}px)` : undefined,
      }}
    >
      <CanvasText
        text={withoutMaidCafe(candidate.name).toLowerCase()}
        height={height}
        xHeight={LOGO_X_HEIGHT * logoScale}
        baseline={LOGO_BASELINE * logoScale}
        letterSpacing={LOGO_LETTER_SPACING * logoScale}
        wordGap={WORD_GAP * logoScale}
        // Otherwise the same pink as "café" in the logo.
        className={monochrome ? "text-black" : "text-[#D94296]"}
        onDraw={() => setNameDrawn(true)}
      />
      {/* draggable={false} so grabbing the logo drags the chip, not the image. */}
      <Image
        // An all-black copy of the logo, since CSS filters don't reliably survive the browser's drag image snapshot.
        src={monochrome ? "/fanimaid-logo-black.svg" : "/Fanimaid%20Logo.svg"}
        alt=""
        width={659}
        height={188}
        draggable={false}
        // Eager so the download starts from the server-rendered HTML. There are only two logo files, shared by
        // every chip, and the drag preview's copy is off-screen where a lazy image would never load.
        loading="eager"
        style={{ height }}
        className="w-auto"
        onLoad={() => setLogoLoaded(true)}
      />
    </div>
  );
}
