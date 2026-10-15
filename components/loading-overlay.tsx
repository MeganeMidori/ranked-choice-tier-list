"use client";

import { candidates } from "@/lib/candidates";
import { useTierList } from "@/components/tier-list-context";

// How long each loading message shows, and how long the crossfade between messages takes, in seconds.
const MESSAGE_SECONDS = 3.5;
const FADE_SECONDS = 0.6;
// How long to wait before showing the spinner, so fast loads don't flash it, in seconds.
const SPINNER_DELAY_SECONDS = 0.5;
// How long to wait before offering a reload, in seconds.
const TIMEOUT_SECONDS = 15;

// Covers the page with a spinner until every candidate's drag preview has loaded, then fades out. It's rendered on
// the server too, so it shows from the first paint.
//
// The messages rotate, and the timeout's reload button appears, with CSS animations rather than state or timers.
// Most of the wait is the page's JavaScript loading, before any component code can run, and if that JavaScript
// fails to load, no timer would ever fire.
export default function LoadingOverlay({ messages }: { messages: string[] }) {
  const { state } = useTierList();
  const ready = candidates.every((c) => state.readyIds.includes(c.id));
  // If everything was ready before the spinner would have appeared, vanish at once: fading out a blank overlay just
  // looks like the page fading in. Only fade out when the spinner had been showing.
  const readyBeforeSpinner = ready && state.lastReadyAt !== null && state.lastReadyAt < SPINNER_DELAY_SECONDS * 1000;

  // Each message is visible for its slice of one full cycle, fading in and out at the slice's edges.
  const cycleSeconds = messages.length * MESSAGE_SECONDS;
  const slice = 100 / messages.length;
  const fade = (FADE_SECONDS / cycleSeconds) * 100;
  const keyframes = `@keyframes loading-message {
    0% { opacity: 0; }
    ${fade}% { opacity: 1; }
    ${slice - fade}% { opacity: 1; }
    ${slice}% { opacity: 0; }
    100% { opacity: 0; }
  }
  @keyframes loading-reveal {
    from { opacity: 0; visibility: hidden; }
    to { opacity: 1; visibility: visible; }
  }`;

  return (
    <div
      role="status"
      aria-hidden={ready}
      // The background shows right away to hide the half-built page, and matches the page's own background, so on
      // fast loads this looks like the page fading in.
      className={`fixed inset-0 z-50 flex items-center justify-center bg-pink-50 dark:bg-black ${
        readyBeforeSpinner ? "hidden" : ready ? "pointer-events-none opacity-0 transition-opacity duration-300" : ""
      }`}
    >
      <style>{keyframes}</style>
      <div
        className="flex flex-col items-center gap-3"
        style={{ animation: `loading-reveal ${FADE_SECONDS}s ${SPINNER_DELAY_SECONDS}s both` }}
      >
        <div className="size-10 animate-spin rounded-full border-4 border-pink-200 border-t-[#D94296]" />
        {/* Every message sits in the same grid cell, so they stack and the cell fits the widest one. */}
        <div aria-hidden className="grid text-center text-sm font-bold uppercase text-[#D94296]">
          {messages.map((message, i) => (
            <p
              key={i}
              className="col-start-1 row-start-1"
              style={
                messages.length > 1
                  ? { animation: `loading-message ${cycleSeconds}s ${i * MESSAGE_SECONDS}s infinite both` }
                  : undefined
              }
            >
              {message}
            </p>
          ))}
        </div>
        <span className="sr-only">Loading</span>
        {/* Hidden (and out of the accessibility tree) until the timeout. It keeps its space meanwhile, so nothing
            shifts when it appears. */}
        <div
          className="mt-4 flex flex-col items-center gap-3"
          style={{ animation: `loading-reveal ${FADE_SECONDS}s ${TIMEOUT_SECONDS}s both` }}
        >
          <p className="text-sm text-zinc-600 dark:text-zinc-400">This is taking longer than expected.</p>
          {/* A link to the current page rather than a button with a handler, so it works even without JavaScript. */}
          <a
            href=""
            className="flex h-10 items-center rounded-full bg-[#D94296] px-5 text-sm font-medium text-white transition-colors hover:bg-[#C2357F]"
          >
            Try reloading
          </a>
        </div>
      </div>
    </div>
  );
}
