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
// Blank space the maid-only logo's viewBox leaves right of its "d".
const MAID_RIGHT_BEARING = 339 - 337.7;
// The near-black of "maid" in the logo.
const MAID_COLOR = "text-[#231F20]";

// The logos a name can sit around. Logos with black in them have a dark mode copy with it turned white.
const LOGOS = {
  full: {
    width: 659,
    src: "/Fanimaid%20Logo.svg",
    darkSrc: "/fanimaid-logo-dark.svg",
    blackSrc: "/fanimaid-logo-black.svg",
    whiteSrc: "/fanimaid-logo-white.svg",
  },
  // The color café-only logo is all pink, so it has no dark copy.
  cafe: {
    width: 317,
    src: "/fanimaid-cafe-logo.svg",
    darkSrc: undefined,
    blackSrc: "/fanimaid-cafe-logo-black.svg",
    whiteSrc: "/fanimaid-cafe-logo-white.svg",
  },
  maid: {
    width: 339,
    src: "/fanimaid-maid-logo.svg",
    darkSrc: "/fanimaid-maid-logo-dark.svg",
    blackSrc: "/fanimaid-maid-logo-black.svg",
    whiteSrc: "/fanimaid-maid-logo-white.svg",
  },
};

// How to split a name around the logo. The full logo already reads "maid café", so that suffix is dropped, and the
// rest of the name (lead) goes before it in pink. A name ending in just "café" instead draws the rest of the name
// (word) in the logo's black like "maid", with a café-only logo. A name starting with "maid" draws that with a
// maid-only logo, and the rest after it: in black before a café-only logo, or otherwise in pink like the heart.
function splitName(name: string): { lead?: string; maid: boolean; word?: string; pink?: boolean; cafe?: boolean } {
  const lower = name.toLowerCase().trim();
  const maidCafe = lower.match(/^(.*?)\s*maid\s*caf[eé]$/);
  if (maidCafe) return { lead: maidCafe[1] || undefined, maid: false };
  const cafe = lower.match(/^(.*\S)\s+caf[eé]$/);
  const rest = cafe ? cafe[1] : lower;
  const maid = rest.match(/^maid\s+(.*)$/);
  const word = maid ? maid[1] : rest;
  if (cafe) return { maid: !!maid, word, cafe: true };
  if (maid) return { maid: true, word, pink: true };
  return { lead: lower, maid: false };
}

// One logo, with its dark mode copy if it has one. onLoad is called once every copy has loaded.
function LogoImage({
  logo,
  height,
  monochrome,
  onLoad,
}: {
  logo: (typeof LOGOS)[keyof typeof LOGOS];
  height: number;
  monochrome: boolean;
  onLoad: () => void;
}) {
  // An all-black copy of the logo, since CSS filters don't reliably survive the browser's drag image snapshot.
  const src = monochrome ? logo.blackSrc : logo.src;
  const darkSrc = monochrome ? logo.whiteSrc : logo.darkSrc;
  const [loaded, setLoaded] = useState(false);
  const [darkLoaded, setDarkLoaded] = useState(!darkSrc);
  const handleLoad = useEffectEvent(onLoad);
  useEffect(() => {
    if (loaded && darkLoaded) handleLoad();
  }, [loaded, darkLoaded]);
  // draggable={false} so grabbing the logo drags the chip, not the image.
  // Eager so the download starts from the server-rendered HTML. There are only a few logo files, shared by every
  // chip, and the drag preview's copy is off-screen where a lazy image would never load. It also makes the hidden
  // one of the light and dark logos load, so either is ready when the theme changes.
  return (
    <>
      <Image
        src={src}
        alt=""
        width={logo.width}
        height={LOGO_VIEWBOX_HEIGHT}
        draggable={false}
        loading="eager"
        style={{ height }}
        className={`w-auto ${darkSrc ? "dark:hidden" : ""}`}
        onLoad={() => setLoaded(true)}
      />
      {darkSrc && (
        <Image
          src={darkSrc}
          alt=""
          width={logo.width}
          height={LOGO_VIEWBOX_HEIGHT}
          draggable={false}
          loading="eager"
          style={{ height }}
          className="hidden w-auto dark:block"
          onLoad={() => setDarkLoaded(true)}
        />
      )}
    </>
  );
}

// The candidate's name drawn in the logo font, around the "maid café" logo (or the "maid" and "café" halves of it,
// see splitName).
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
  const { lead, maid, word, pink, cafe } = splitName(candidate.name);
  // The logo after the name, if any.
  const endLogo = cafe ? LOGOS.cafe : maid ? undefined : LOGOS.full;
  const [leadDrawn, setLeadDrawn] = useState(!lead);
  const [wordDrawn, setWordDrawn] = useState(!word);
  const [maidLoaded, setMaidLoaded] = useState(!maid);
  const [endLogoLoaded, setEndLogoLoaded] = useState(!endLogo);
  const ready = leadDrawn && wordDrawn && maidLoaded && endLogoLoaded;
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
  // Pink text is the same pink as "café" and the heart in the logo. Black text is white in dark mode like the dark
  // logo's "maid".
  const pinkText = monochrome ? "text-black dark:text-white" : "text-[#D94296]";
  const blackText = monochrome ? "text-black dark:text-white" : `${MAID_COLOR} dark:text-white`;
  return (
    <div
      // invisible keeps the line's space, so content around it doesn't shift when it appears.
      className={`flex shrink-0 items-center ${ready ? "" : "invisible"}`}
      style={{ transform: centerOnLetters ? `translateY(${lettersOffset}px)` : undefined }}
    >
      {/* Wrapped so the spacing after each canvas doesn't fight the margin CanvasText sets on it. */}
      {lead && (
        <div className="flex" style={{ marginRight: (WORD_GAP - LOGO_LEFT_BEARING) * logoScale }}>
          <CanvasText text={lead} {...textProps} className={pinkText} onDraw={() => setLeadDrawn(true)} />
        </div>
      )}
      {maid && (
        <LogoImage logo={LOGOS.maid} height={height} monochrome={monochrome} onLoad={() => setMaidLoaded(true)} />
      )}
      {word && (
        <div
          className="flex"
          style={{
            marginLeft: maid ? (WORD_GAP - MAID_RIGHT_BEARING) * logoScale : undefined,
            marginRight: cafe ? (MAID_CAFE_GAP - CAFE_LEFT_BEARING) * logoScale : undefined,
          }}
        >
          <CanvasText
            text={word}
            {...textProps}
            className={pink ? pinkText : blackText}
            onDraw={() => setWordDrawn(true)}
          />
        </div>
      )}
      {endLogo && (
        <LogoImage logo={endLogo} height={height} monochrome={monochrome} onLoad={() => setEndLogoLoaded(true)} />
      )}
    </div>
  );
}
