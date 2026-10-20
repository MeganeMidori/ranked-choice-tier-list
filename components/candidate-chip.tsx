"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { CANDIDATE_DRAG_TYPE, type Candidate } from "@/lib/candidates";
import { tiers, useTierList, type TierLabel } from "@/components/tier-list-context";
import CandidateDragPreview, { PILL_COLORS, PILL_SHAPE, PREVIEW_LOGO_HEIGHT } from "@/components/candidate-drag-preview";
import CandidateLogo from "@/components/candidate-logo";
import { CANDIDATE_ID_ATTR, DROP_TARGET_ATTR, dropBefore, UNPLACED, useTouchDrag } from "@/components/use-touch-drag";

// A place a name picked up with the keyboard can be put down, in a tier or the candidate pool when target is null:
// before the name with beforeId, or at the end.
type DropSpot = { target: TierLabel | null; beforeId: string | null };

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
    onStart: () => dispatch({ type: "dragStart", candidateId: candidate.id, width: previewRef.current?.offsetWidth }),
    onOver: (target, y) =>
      dispatch(
        target === undefined
          ? { type: "dragOver", tierLabel: null }
          : { type: "dragOverAt", target, beforeId: dropBefore(target, y, candidate.id) },
      ),
    onDrop: (target, y) =>
      dispatch(
        target === undefined
          ? { type: "dragEnd" }
          : {
              type: "place",
              candidateId: candidate.id,
              tierLabel: target,
              beforeId: dropBefore(target, y, candidate.id),
            },
      ),
    onCancel: () => dispatch({ type: "dragEnd" }),
  });
  const currentTier = state.placements.find((p) => p.id === candidate.id)?.tier ?? null;

  // Keyboard placement reuses the drag state, so it looks the same as dragging: the chip is picked up, and a line shows
  // where it would land. Scrolls to the name the line is above, or the last name when it's at the end.
  const highlightSpot = (spot: DropSpot) => {
    dispatch({ type: "dragOverAt", ...spot });
    const zone = document.querySelector(`[${DROP_TARGET_ATTR}="${spot.target ?? UNPLACED}"]`);
    const chips = zone?.querySelectorAll(`[${CANDIDATE_ID_ATTR}]`);
    const near = spot.beforeId
      ? zone?.querySelector(`[${CANDIDATE_ID_ATTR}="${spot.beforeId}"]`)
      : chips?.[chips.length - 1];
    (near ?? zone)?.scrollIntoView({ block: "nearest" });
  };

  // Every spot a picked-up name could be put down on one side, top to bottom: in the tier list, before each other name
  // in a tier then at its end, or the same through the candidate pool.
  const dropSpots = (inPool: boolean): DropSpot[] =>
    (inPool ? [null] : tiers.map((t) => t.label)).flatMap((target) =>
      [...state.placements.filter((p) => p.tier === target && p.id !== candidate.id).map((p) => p.id), null].map(
        (beforeId) => ({ target, beforeId }),
      ),
    );

  // Where a picked-up name starts in the tier list: its own spot when it's already placed, so putting it down again
  // changes nothing, or otherwise the very top of the top tier.
  const tierStartSpot = (): DropSpot => {
    if (!currentTier) return dropSpots(false)[0];
    const ids = state.placements.filter((p) => p.tier === currentTier).map((p) => p.id);
    return { target: currentTier, beforeId: ids[ids.indexOf(candidate.id) + 1] ?? null };
  };

  // Alt+Up and Alt+Down move a name up or down one place within its tier, or within the candidate pool.
  const moveWithinTier = (direction: -1 | 1) => {
    const ids = state.placements.filter((p) => p.tier === currentTier).map((p) => p.id);
    const i = ids.indexOf(candidate.id);
    // Moving down lands before the name two below, or at the end when that's past the last name.
    const before = direction === -1 ? i - 1 : i + 2;
    if (before < 0 || i + direction >= ids.length) return;
    flushSync(() =>
      dispatch({ type: "place", candidateId: candidate.id, tierLabel: currentTier, beforeId: ids[before] ?? null }),
    );
    chipRef.current?.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const enter = e.key === "Enter" || e.key === " ";
    if (!isDragging && e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      moveWithinTier(e.key === "ArrowUp" ? -1 : 1);
    } else if (!isDragging) {
      if (!enter) return;
      e.preventDefault();
      dispatch({ type: "dragStart", candidateId: candidate.id, width: previewRef.current?.offsetWidth });
      highlightSpot(tierStartSpot());
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      // Right switches to putting the name back in the candidate pool, which sits to the right of the tier list on wide
      // screens, starting at its very top. Left switches back to the tier list.
      e.preventDefault();
      const toPool = e.key === "ArrowRight";
      if ((state.dropAt?.target === null) !== toPool) highlightSpot(toPool ? dropSpots(true)[0] : tierStartSpot());
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      // Steps one spot at a time, through the rest of the tier before moving on to the next.
      e.preventDefault();
      const spots = dropSpots(state.dropAt?.target === null);
      const i = spots.findIndex((s) => s.target === state.dropAt?.target && s.beforeId === state.dropAt.beforeId);
      const next = Math.min(Math.max(i + (e.key === "ArrowDown" ? 1 : -1), 0), spots.length - 1);
      highlightSpot(spots[next]);
    } else if (enter && state.dropAt) {
      e.preventDefault();
      const { target, beforeId } = state.dropAt;
      // A name moved between the candidate pool and the tier list remounts in its new place, so render that now and
      // move focus to it, so tabbing continues from the name just placed.
      flushSync(() => dispatch({ type: "place", candidateId: candidate.id, tierLabel: target, beforeId }));
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
        aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
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
          dispatch({ type: "dragStart", candidateId: candidate.id, width: preview.offsetWidth });
        }}
        onDragEnd={() => dispatch({ type: "dragEnd" })}
        // A long press would otherwise open the browser's context menu or start selecting text.
        onContextMenu={(e) => touchActive.current && e.preventDefault()}
        // The scroll margin keeps the drop line in view when keyboard placement scrolls to the name beside it.
        className={`scroll-my-3 select-none [-webkit-touch-callout:none] ${FOCUS_RING} ${previewReady ? "cursor-grab active:cursor-grabbing" : ""} ${
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
              {candidate.pronunciation && (
                <p className="text-xs opacity-70">
                  [{" "}
                  {/* Stressed syllables are wrapped in *asterisks*, shown bold like dictionary.com does. */}
                  {candidate.pronunciation.split("*").map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part))} ]
                </p>
              )}
              {candidate.description &&<p className="mt-1 text-xs opacity-70">{candidate.description}</p>}
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
