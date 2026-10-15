import type { Candidate } from "@/lib/candidates";
import CandidateLogo from "@/components/candidate-logo";

// A filled, fully rounded chip in the style of MUI's Chip, shared with tier list chips so a dropped chip matches
// what was dragged.
export const PILL_SHAPE = "inline-flex h-8 items-center rounded-full border px-3";
// Light pink with a black logo, or a dark tint of the logo's pink with a white logo in dark mode. The tint is the
// logo's pink at 30% over the tier list's zinc-800, made solid so it looks the same over any background.
export const PILL_COLORS = "border-pink-400 bg-pink-100 dark:border-[#D94296] dark:bg-[#5C2F4A]";
// Logo height inside the pill.
export const PREVIEW_LOGO_HEIGHT = 20;

// The image that follows the cursor while a candidate is dragged, styled independently of the chip being dragged.
// setDragImage needs a rendered element, so it's kept in the DOM but positioned off-screen. onReady is called once
// its contents are showing, so it's safe to snapshot.
export default function CandidateDragPreview({
  candidate,
  ref,
  onReady,
}: {
  candidate: Candidate;
  ref: React.Ref<HTMLDivElement>;
  onReady: () => void;
}) {
  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none fixed top-0 -left-[9999px] ${PILL_SHAPE} ${PILL_COLORS}`}
    >
      <CandidateLogo candidate={candidate} height={PREVIEW_LOGO_HEIGHT} monochrome centerOnLetters onReady={onReady} />
    </div>
  );
}
