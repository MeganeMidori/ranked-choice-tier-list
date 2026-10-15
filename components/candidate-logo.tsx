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
// Ink-to-ink space between "maid" and "café" in the logo, which sit closer than separate words.
const MAID_CAFE_GAP = 343.9 - 337.7;
// Blank space the café-only logo's viewBox leaves left of its "c".
const CAFE_LEFT_BEARING = 343.9 - 342;
// The near-black of "maid" in the logo.
const MAID_COLOR = "text-[#231F20]";

// How to split a name around the logo. The full logo already reads "maid café", so that suffix is dropped. A name
// ending in just "café" instead draws the rest of the name in the logo's black like "maid", with a café-only logo.
function splitName(name: string): { lead: string; word?: string } {
  const lower = name.toLowerCase();
  const maidCafe = lower.match(/^(.*?)\s*maid\s*caf[eé]\s*$/);
  if (maidCafe) return { lead: maidCafe[1] };
  const cafe = lower.match(/^(.*\S)\s+caf[eé]\s*$/);
  if (cafe) return { lead: "", word: cafe[1] };
  return { lead: lower };
}

// The candidate's name drawn in the logo font, followed by the "maid café" logo (or just "café", see splitName).
// height is the logo's rendered height in CSS pixels. monochrome draws the name and logo in solid black, or white in
// dark mode.
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
  const { lead, word } = splitName(candidate.name);
  const [leadDrawn, setLeadDrawn] = useState(!lead);
  const [wordDrawn, setWordDrawn] = useState(!word);
  const [logoLoaded, setLogoLoaded] = useState(false);
  // Logos with black in them have a dark mode copy with it turned white, which loads alongside them.
  let logoSrc = monochrome ? "/fanimaid-logo-black.svg" : "/Fanimaid%20Logo.svg";
  let darkLogoSrc: string | undefined = monochrome ? "/fanimaid-logo-white.svg" : "/fanimaid-logo-dark.svg";
  let logoWidth = 659;
  if (word) {
    logoSrc = monochrome ? "/fanimaid-cafe-logo-black.svg" : "/fanimaid-cafe-logo.svg";
    // The color café-only logo is all pink.
    darkLogoSrc = monochrome ? "/fanimaid-cafe-logo-white.svg" : undefined;
    logoWidth = 317;
  }
  const [darkLogoLoaded, setDarkLogoLoaded] = useState(!darkLogoSrc);
  const ready = leadDrawn && wordDrawn && logoLoaded && darkLogoLoaded;
  const handleReady = useEffectEvent(() => onReady?.());
  useEffect(() => {
    if (ready) handleReady();
  }, [ready]);
  const logoScale = height / LOGO_VIEWBOX_HEIGHT;
  // A transform rather than a margin, so the layout box (and the pill around it) keeps its size.
  const lettersOffset = ((LOGO_VIEWBOX_HEIGHT / 2 - (LOGO_ASCENDER + LOGO_BASELINE) / 2) * logoScale) / 2;
  const textProps = {
    height,
    xHeight: LOGO_X_HEIGHT * logoScale,
    baseline: LOGO_BASELINE * logoScale,
    letterSpacing: LOGO_LETTER_SPACING * logoScale,
    wordGap: WORD_GAP * logoScale,
  };
  return (
    <div
      // invisible keeps the line's space, so content around it doesn't shift when it appears.
      className={`flex shrink-0 items-center ${ready ? "" : "invisible"}`}
      style={{ transform: centerOnLetters ? `translateY(${lettersOffset}px)` : undefined }}
    >
      {/* Wrapped so the spacing after each canvas doesn't fight the margin CanvasText sets on it. */}
      {lead && (
        <div className="flex" style={{ marginRight: (word ? WORD_GAP : WORD_GAP - LOGO_LEFT_BEARING) * logoScale }}>
          <CanvasText
            text={lead}
            {...textProps}
            // Otherwise the same pink as "café" in the logo.
            className={monochrome ? "text-black dark:text-white" : "text-[#D94296]"}
            onDraw={() => setLeadDrawn(true)}
          />
        </div>
      )}
      {word && (
        <div className="flex" style={{ marginRight: (MAID_CAFE_GAP - CAFE_LEFT_BEARING) * logoScale }}>
          <CanvasText
            text={word}
            {...textProps}
            // White in dark mode like the dark logo's "maid".
            className={monochrome ? "text-black dark:text-white" : `${MAID_COLOR} dark:text-white`}
            onDraw={() => setWordDrawn(true)}
          />
        </div>
      )}
      {/* draggable={false} so grabbing the logo drags the chip, not the image. */}
      <Image
        // An all-black copy of the logo, since CSS filters don't reliably survive the browser's drag image snapshot.
        src={logoSrc}
        alt=""
        width={logoWidth}
        height={188}
        draggable={false}
        // Eager so the download starts from the server-rendered HTML. There are only a few logo files, shared by
        // every chip, and the drag preview's copy is off-screen where a lazy image would never load. It also makes
        // the hidden one of the light and dark logos load, so either is ready when the theme changes.
        loading="eager"
        style={{ height }}
        className={`w-auto ${darkLogoSrc ? "dark:hidden" : ""}`}
        onLoad={() => setLogoLoaded(true)}
      />
      {darkLogoSrc && (
        <Image
          src={darkLogoSrc}
          alt=""
          width={logoWidth}
          height={188}
          draggable={false}
          loading="eager"
          style={{ height }}
          className="hidden w-auto dark:block"
          onLoad={() => setDarkLogoLoaded(true)}
        />
      )}
    </div>
  );
}
