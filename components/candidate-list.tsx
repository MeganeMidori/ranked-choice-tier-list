"use client";

import { candidates, CANDIDATE_DRAG_TYPE } from "@/lib/candidates";
import { useTierList } from "@/components/tier-list-context";
import CandidateChip from "@/components/candidate-chip";
import { DROP_TARGET_ATTR, UNPLACED } from "@/components/use-touch-drag";

export default function CandidateList() {
  const { state, dispatch } = useTierList();
  const placedIds = new Set(state.placements.filter((p) => p.tier !== null).map((p) => p.id));
  const unplaced = candidates.filter((candidate) => !placedIds.has(candidate.id));

  return (
    <ul
      {...{ [DROP_TARGET_ATTR]: UNPLACED }}
      // Dropping a placed candidate back here removes it from the tier list.
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(CANDIDATE_DRAG_TYPE)) e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        dispatch({
          type: "place",
          candidateId: e.dataTransfer.getData(CANDIDATE_DRAG_TYPE),
          tierLabel: null,
        });
      }}
      className="flex min-h-20 shrink-0 grow flex-col gap-2"
    >
      {unplaced.map((candidate) => (
        <li key={candidate.id}>
          <CandidateChip
            candidate={candidate}
            showDetails
          />
        </li>
      ))}
      {/* Kept inside the list so the empty list stays a drop target. */}
      {unplaced.length === 0 && (
        <li className="flex flex-1 items-center justify-center p-4 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
          You&apos;re all set! Double check your entry and click Submit when you are ready.
        </li>
      )}
    </ul>
  );
}
