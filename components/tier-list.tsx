"use client";

import { useEffect, useRef, useState } from "react";
import { candidates, CANDIDATE_DRAG_TYPE } from "@/lib/candidates";
import { tiers, useTierList } from "@/components/tier-list-context";
import CandidateChip from "@/components/candidate-chip";
import { DROP_TARGET_ATTR } from "@/components/use-touch-drag";

const candidatesById = new Map(candidates.map((c) => [c.id, c]));

export default function TierList() {
  const { state, dispatch } = useTierList();
  const unplacedCount = state.placements.filter((p) => p.tier === null).length;
  const validityRef = useRef<HTMLInputElement>(null);
  // Set by a failed submit and cleared by a reset, like :user-invalid on the text fields. The error shows only while
  // names are still unplaced.
  const [submitFailed, setSubmitFailed] = useState(false);
  const showError = submitFailed && unplacedCount > 0;

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
    <div className="relative flex flex-1 flex-col gap-1">
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
        className={`flex flex-1 flex-col border bg-white ${
          showError ? "border-red-600 dark:border-red-400" : "border-black/[.15]"
        }`}
      >
        {tiers.map((tier) => (
          <div key={tier.label} className="flex min-h-20 flex-1 border-b border-black/[.15] last:border-b-0">
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
                dispatch({ type: "dragOver", tierLabel: tier.label });
              }}
              onDragLeave={() => dispatch({ type: "dragOver", tierLabel: null })}
              onDrop={(e) => {
                e.preventDefault();
                dispatch({
                  type: "place",
                  candidateId: e.dataTransfer.getData(CANDIDATE_DRAG_TYPE),
                  tierLabel: tier.label,
                });
              }}
              className={`flex flex-1 flex-wrap items-center gap-1 p-1 ${
                state.dragOverTier === tier.label ? "bg-zinc-100" : "bg-white"
              }`}
            >
              {state.placements
                .filter((p) => p.tier === tier.label)
                .map(({ id }) => (
                  <CandidateChip key={id} candidate={candidatesById.get(id)!} />
                ))}
            </div>
          </div>
        ))}
      </div>
      {showError && (
        <span className="text-sm text-red-600 dark:text-red-400">
          Please place every name in the tier list. {unplacedCount} {unplacedCount === 1 ? "name is" : "names are"}{" "}
          left.
        </span>
      )}
    </div>
  );
}
