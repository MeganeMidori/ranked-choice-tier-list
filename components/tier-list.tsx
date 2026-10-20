"use client";

import { useEffect, useRef, useState } from "react";
import { candidates, CANDIDATE_DRAG_TYPE } from "@/lib/candidates";
import { dropLineIn, tiers, useTierList } from "@/components/tier-list-context";
import CandidateChip from "@/components/candidate-chip";
import { DROP_TARGET_ATTR, dropBefore } from "@/components/use-touch-drag";
import { useCandidateTabOrder } from "@/components/use-candidate-tab-order";

const candidatesById = new Map(candidates.map((c) => [c.id, c]));

// Lines drawn in the gap above or below a chip, showing where a dragged name would land. They're as wide as the dragged
// pill, set on the tier as --drop-line-width. The tiers' gap is 4px, so these sit in the middle of it.
const DROP_LINE =
  "before:absolute before:left-0 before:w-(--drop-line-width) before:-top-[3px] before:h-0.5 before:rounded-full before:bg-[#D94296]";
const DROP_LINE_AFTER =
  "after:absolute after:left-0 after:w-(--drop-line-width) after:-bottom-[3px] after:h-0.5 after:rounded-full after:bg-[#D94296]";

export default function TierList() {
  const { state, dispatch } = useTierList();
  const unplacedCount = state.placements.filter((p) => p.tier === null).length;
  const validityRef = useRef<HTMLInputElement>(null);
  // Set by a failed submit and cleared by a reset, like :user-invalid on the text fields. The error shows only while
  // names are still unplaced.
  const [submitFailed, setSubmitFailed] = useState(false);
  const showError = submitFailed && unplacedCount > 0;
  const containerRef = useRef<HTMLDivElement>(null);
  useCandidateTabOrder(containerRef);
  const dragging = state.draggingId ? candidatesById.get(state.draggingId) : undefined;

  useEffect(() => {
    validityRef.current!.setCustomValidity(unplacedCount ? "Place every name in the tier list." : "");
  }, [unplacedCount]);

  useEffect(() => {
    const form = validityRef.current!.form;
    const onReset = () => setSubmitFailed(false);
    form?.addEventListener("reset", onReset);
    return () => form?.removeEventListener("reset", onReset);
  }, []);

  return (
    // Relative so the hidden checkbox below scrolls with the form when it's focused.
    <div ref={containerRef} className="relative flex flex-1 flex-col gap-1">
      {/* Takes part in the form's validation for the tier list, which has no input of its own, so a submit with
          unplaced names fails and focuses here. A checkbox, since focusing a text input would open the keyboard on
          mobile. The error is shown from state rather than with peer-user-invalid like the text fields: Chrome
          doesn't restyle the siblings when a reset clears :user-invalid, so the error would stick around. */}
      <h2
        className={`text-base font-bold uppercase ${
          showError ? "text-red-600 dark:text-red-400" : "text-[#D94296]"
        }`}
      >
        Tier List
      </h2>
      <input
        ref={validityRef}
        type="checkbox"
        tabIndex={-1}
        aria-hidden
        onInvalid={() => setSubmitFailed(true)}
        className="sr-only"
      />
      <div
        className={`flex flex-1 flex-col border bg-white dark:bg-zinc-800 ${
          showError ? "border-red-600 dark:border-red-400" : "border-black/[.15] dark:border-white/[.2]"
        }`}
      >
        {tiers.map((tier) => {
          const ids = state.placements.filter((p) => p.tier === tier.label).map((p) => p.id);
          const lineBefore = dropLineIn(state, tier.label, ids);
          return (
            <div
              key={tier.label}
              // The minimum height sits on the drop zone rather than the row, so the row keeps flex's automatic minimum
              // and grows past its share when it holds more chips than fit.
              className="flex flex-1 border-b border-black/[.15] last:border-b-0 dark:border-white/[.2]"
            >
              <div
                className="flex w-24 shrink-0 items-center justify-center p-2 text-center text-sm font-bold"
                style={{ backgroundColor: tier.color, color: tier.textColor }}
              >
                {tier.label}
              </div>
              <div
                {...{ [DROP_TARGET_ATTR]: tier.label }}
                onDragOver={(e) => {
                  if (!e.dataTransfer.types.includes(CANDIDATE_DRAG_TYPE)) return;
                  e.preventDefault();
                  dispatch({
                    type: "dragOverAt",
                    target: tier.label,
                    beforeId: dropBefore(tier.label, e.clientY, state.draggingId),
                  });
                }}
                onDragLeave={(e) => {
                  // Also fires when moving between chips, so only clear the highlight when leaving the tier itself.
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                    dispatch({ type: "dragOver", tierLabel: null });
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const candidateId = e.dataTransfer.getData(CANDIDATE_DRAG_TYPE);
                  dispatch({
                    type: "place",
                    candidateId,
                    tierLabel: tier.label,
                    beforeId: dropBefore(tier.label, e.clientY, candidateId),
                  });
                }}
                // Each chip gets its own line, stacked down the tier.
                style={{ "--drop-line-width": `${state.dragWidth ?? 0}px` } as React.CSSProperties}
                className={`flex min-h-20 flex-1 flex-col items-start justify-center gap-1 p-1 ${
                  state.dragOverTier === tier.label ? "bg-zinc-100 dark:bg-zinc-700" : "bg-white dark:bg-zinc-800"
                }`}
              >
                {ids.map((id, i) => (
                    <div
                    key={id}
                    className={`relative flex ${lineBefore === id ? DROP_LINE : ""} ${
                      lineBefore === null && i === ids.length - 1 ? DROP_LINE_AFTER : ""
                    }`}
                  >
                    <CandidateChip candidate={candidatesById.get(id)!} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* Tells screen readers where a name picked up with the keyboard would land. */}
      <span aria-live="polite" className="sr-only">
        {dragging && state.dropAt
          ? `${dragging.name}: ${state.dropAt.target ?? "Candidates"}, ${
              state.dropAt.beforeId ? `before ${candidatesById.get(state.dropAt.beforeId)!.name}` : "at the end"
            }`
          : ""}
      </span>
      {showError && (
        <span className="text-sm text-red-600 dark:text-red-400">
          Please place every name in the tier list. {unplacedCount} {unplacedCount === 1 ? "name is" : "names are"}{" "}
          left.
        </span>
      )}
    </div>
  );
}
