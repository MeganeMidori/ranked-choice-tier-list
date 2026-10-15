import type { Candidate } from "@/lib/candidates";
import CandidateLogo from "@/components/candidate-logo";

// A filled, fully rounded chip in the style of MUI's Chip, shared with tier list chips so a dropped chip matches
// what was dragged.
export const PILL_SHAPE = "inline-flex h-8 items-center rounded-full border px-3";
// Light in both themes, since the logo inside is drawn in black.
export const PILL_COLORS = "border-pink-400 bg-pink-100";
// Logo height inside the pill.
export const PREVIEW_LOGO_HEIGHT = 20;

// The image that follows the cursor while a candidate is dragged, styled independently of the chip being dragged.
// setDragImage needs a rendered element, so it's kept in the DOM but positioned off-screen.
export default function CandidateDragPreview({
  candidate,
  ref,
}: {
  candidate: Candidate;
  ref: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none fixed top-0 -left-[9999px] ${PILL_SHAPE} ${PILL_COLORS}`}
    >
      <CandidateLogo candidate={candidate} height={PREVIEW_LOGO_HEIGHT} monochrome centerOnLetters />
    </div>
  );
}
