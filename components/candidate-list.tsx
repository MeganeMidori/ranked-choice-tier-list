"use client";

import { candidates, CANDIDATE_DRAG_TYPE } from "@/lib/candidates";
import { dropLineIn, useTierList } from "@/components/tier-list-context";
import CandidateChip from "@/components/candidate-chip";
import { DROP_TARGET_ATTR, dropBefore, UNPLACED } from "@/components/use-touch-drag";

const candidatesById = new Map(candidates.map((c) => [c.id, c]));

// Lines drawn in the gap above or below a chip, showing where a dragged name would land. The list's gap is 8px, so
// these sit in the middle of it.
const DROP_LINE = "before:absolute before:inset-x-0 before:-top-[5px] before:h-0.5 before:rounded-full before:bg-[#D94296]";
const DROP_LINE_AFTER =
  "after:absolute after:inset-x-0 after:-bottom-[5px] after:h-0.5 after:rounded-full after:bg-[#D94296]";

export default function CandidateList() {
  const { state, dispatch } = useTierList();
  const unplaced = state.placements.filter((p) => p.tier === null).map((p) => p.id);
  const lineBefore = dropLineIn(state, null, unplaced);

  return (
    <ul
      {...{ [DROP_TARGET_ATTR]: UNPLACED }}
      // Dropping a placed candidate back here removes it from the tier list. Dropping one that's already here moves it.
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(CANDIDATE_DRAG_TYPE)) return;
        e.preventDefault();
        dispatch({ type: "dragOverAt", target: null, beforeId: dropBefore(null, e.clientY, state.draggingId) });
      }}
      onDragLeave={(e) => {
        // Also fires when moving between chips, so only clear the line when leaving the list itself.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) dispatch({ type: "dragOver", tierLabel: null });
      }}
      onDrop={(e) => {
        e.preventDefault();
        const candidateId = e.dataTransfer.getData(CANDIDATE_DRAG_TYPE);
        dispatch({ type: "place", candidateId, tierLabel: null, beforeId: dropBefore(null, e.clientY, candidateId) });
      }}
      className="flex min-h-20 shrink-0 grow flex-col gap-2"
    >
      {unplaced.map((id, i) => (
        <li
          key={id}
          className={`relative ${lineBefore === id ? DROP_LINE : ""} ${
            lineBefore === null && i === unplaced.length - 1 ? DROP_LINE_AFTER : ""
          }`}
        >
          <CandidateChip candidate={candidatesById.get(id)!} showDetails />
        </li>
      ))}
      {/* Kept inside the list so the empty list stays a drop target. */}
      {unplaced.length === 0 && (
        <li
          className={`relative flex flex-1 items-center justify-center p-4 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400 ${
            lineBefore === null ? DROP_LINE : ""
          }`}
        >
          You&apos;re all set! Double check your entry and click Submit when you are ready.
        </li>
      )}
    </ul>
  );
}
