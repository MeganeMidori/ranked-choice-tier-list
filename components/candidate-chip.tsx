"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { CANDIDATE_DRAG_TYPE, type Candidate } from "@/lib/candidates";
import { tiers, useTierList, type TierLabel } from "@/components/tier-list-context";
import CandidateDragPreview, { PILL_COLORS, PILL_SHAPE, PREVIEW_LOGO_HEIGHT } from "@/components/candidate-drag-preview";
import CandidateLogo from "@/components/candidate-logo";
import { DROP_TARGET_ATTR, useTouchDrag } from "@/components/use-touch-drag";
import { CANDIDATE_ID_ATTR } from "@/components/use-candidate-tab-order";

const CARD_COLORS =
  "border-black/[.15] bg-white text-black dark:border-white/[.2] dark:bg-zinc-900 dark:text-zinc-50";
// Shows which name Enter would pick up. outline-none also sets the outline style to none, so set it back to solid.
const FOCUS_RING =
  "outline-none focus-visible:outline-solid focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#D94296]";
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
  // Only draggable once the preview can be shown. Before then, including before hydration attaches onDragStart,
  // the browser would drag a snapshot of the whole chip carrying no candidate id.
  const [previewReady, setPreviewReady] = useState(false);
  const chipRef = useRef<HTMLDivElement>(null);
  const touchActive = useTouchDrag({
    chipRef,
    previewRef,
    enabled: previewReady,
    onStart: () => dispatch({ type: "dragStart", candidateId: candidate.id }),
    onOver: (target) => dispatch({ type: "dragOver", tierLabel: target ?? null }),
    onDrop: (target) =>
      dispatch(
        target === undefined ? { type: "dragEnd" } : { type: "place", candidateId: candidate.id, tierLabel: target },
      ),
    onCancel: () => dispatch({ type: "dragEnd" }),
  });
  const currentTier = state.placements.find((p) => p.id === candidate.id)?.tier ?? null;

  // Keyboard placement reuses the drag state, so it looks the same as dragging: the chip is picked up and the tier it
  // would land in is highlighted.
  const highlightTier = (tierLabel: TierLabel) => {
    dispatch({ type: "dragOver", tierLabel });
    document.querySelector(`[${DROP_TARGET_ATTR}="${tierLabel}"]`)?.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const enter = e.key === "Enter" || e.key === " ";
    if (!isDragging) {
      if (!enter) return;
      e.preventDefault();
      dispatch({ type: "dragStart", candidateId: candidate.id });
      // A name that's already placed starts from its own tier, so picking it up and dropping it again changes nothing.
      highlightTier(currentTier ?? tiers[0].label);
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const i = tiers.findIndex((t) => t.label === state.dragOverTier);
      const next = Math.min(Math.max(i + (e.key === "ArrowDown" ? 1 : -1), 0), tiers.length - 1);
      highlightTier(tiers[next].label);
    } else if (enter && state.dragOverTier) {
      e.preventDefault();
      // A name placed from the candidate pool remounts in the tier list, so render that now and move focus to it, so
      // tabbing continues from the name just placed.
      flushSync(() => dispatch({ type: "place", candidateId: candidate.id, tierLabel: state.dragOverTier }));
      document.querySelector<HTMLElement>(`[${DROP_TARGET_ATTR}] [${CANDIDATE_ID_ATTR}="${candidate.id}"]`)?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      dispatch({ type: "dragEnd" });
    }
  };

  return (
    <>
      <div
        ref={chipRef}
        {...{ [CANDIDATE_ID_ATTR]: candidate.id }}
        role="button"
        // Placed names are drawn only on a canvas, so screen readers need them spelled out.
        aria-label={showDetails ? undefined : candidate.name}
        aria-pressed={isDragging}
        // Names in the candidate pool are reached through useCandidateTabOrder, which tabs to them after the tier list.
        tabIndex={showDetails ? -1 : 0}
        onKeyDown={onKeyDown}
        // Tabbing or clicking away puts a name picked up with the keyboard back down.
        onBlur={() => isDragging && dispatch({ type: "dragEnd" })}
        draggable={previewReady}
        onDragStart={(e) => {
          // Touch drags are handled by useTouchDrag. Some phones also start a native drag from a long press.
          if (touchActive.current) return e.preventDefault();
          // Center the preview under the cursor. It's smaller than the chip, so the grab point's offset within the
          // chip can land outside it.
          const preview = previewRef.current!;
          e.dataTransfer.setDragImage(preview, preview.offsetWidth / 2, preview.offsetHeight / 2);
          e.dataTransfer.setData(CANDIDATE_DRAG_TYPE, candidate.id);
          e.dataTransfer.effectAllowed = "move";
          dispatch({ type: "dragStart", candidateId: candidate.id });
        }}
        onDragEnd={() => dispatch({ type: "dragEnd" })}
        // A long press would otherwise open the browser's context menu or start selecting text.
        onContextMenu={(e) => touchActive.current && e.preventDefault()}
        className={`select-none [-webkit-touch-callout:none] ${FOCUS_RING} ${previewReady ? "cursor-grab active:cursor-grabbing" : ""} ${
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
      <CandidateDragPreview
        candidate={candidate}
        ref={previewRef}
        onReady={() => {
          setPreviewReady(true);
          dispatch({ type: "candidateReady", candidateId: candidate.id, at: performance.now() });
        }}
      />
    </>
  );
}
