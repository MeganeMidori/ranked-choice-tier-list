"use client";

import { useRef } from "react";
import { CANDIDATE_DRAG_TYPE, type Candidate } from "@/lib/candidates";
import { useTierList } from "@/components/tier-list-context";
import CandidateDragPreview, { PILL_COLORS, PILL_SHAPE, PREVIEW_LOGO_HEIGHT } from "@/components/candidate-drag-preview";
import CandidateLogo from "@/components/candidate-logo";

const CARD_COLORS =
  "border-black/[.15] bg-white text-black dark:border-white/[.2] dark:bg-zinc-900 dark:text-zinc-50";
const DRAGGING_COLORS =
  "border-blue-500 bg-blue-100 text-black ring-2 ring-blue-500 dark:bg-blue-950 dark:text-zinc-50";

export default function CandidateChip({
  candidate,
  showDetails = false,
}: {
  candidate: Candidate;
  showDetails?: boolean;
}) {
  const { state, dispatch } = useTierList();
  const isDragging = state.draggingId === candidate.id;
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        draggable
        onDragStart={(e) => {
          // Center the preview under the cursor. It's smaller than the chip, so the grab point's offset within the
          // chip can land outside it.
          const preview = previewRef.current!;
          e.dataTransfer.setDragImage(preview, preview.offsetWidth / 2, preview.offsetHeight / 2);
          e.dataTransfer.setData(CANDIDATE_DRAG_TYPE, candidate.id);
          e.dataTransfer.effectAllowed = "move";
          dispatch({ type: "dragStart", candidateId: candidate.id });
        }}
        onDragEnd={() => dispatch({ type: "dragEnd" })}
        className={`cursor-grab active:cursor-grabbing ${
          showDetails ? "rounded border px-3 py-2 text-sm" : PILL_SHAPE
        } ${isDragging ? DRAGGING_COLORS : showDetails ? CARD_COLORS : PILL_COLORS}`}
      >
        {showDetails ? (
          <div className="flex flex-col items-center">
            <CandidateLogo candidate={candidate} />
            <div className="text-center">
              {candidate.name}
              {candidate.nameJa && (
                <>
                  <span aria-hidden className="mx-2 text-zinc-400">
                    ♥
                  </span>
                  <span lang="ja">{candidate.nameJa}</span>
                </>
              )}
              {candidate.description && <p className="mt-1 text-xs opacity-70">{candidate.description}</p>}
            </div>
          </div>
        ) : (
          // Matches the drag preview, so a dropped chip looks like what was being dragged.
          <CandidateLogo candidate={candidate} height={PREVIEW_LOGO_HEIGHT} monochrome centerOnLetters />
        )}
      </div>
      <CandidateDragPreview candidate={candidate} ref={previewRef} />
    </>
  );
}
