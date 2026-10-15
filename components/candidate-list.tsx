"use client";

import { candidates, CANDIDATE_DRAG_TYPE } from "@/lib/candidates";
import { useTierList } from "@/components/tier-list-context";
import CandidateChip from "@/components/candidate-chip";

export default function CandidateList() {
  const { state, dispatch } = useTierList();
  const placedIds = new Set(state.placements.filter((p) => p.tier !== null).map((p) => p.id));

  return (
    <ul
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
      className="flex min-h-20 flex-1 flex-col gap-2"
    >
      {candidates
        .filter((candidate) => !placedIds.has(candidate.id))
        .map((candidate) => (
          <li key={candidate.id}>
            <CandidateChip
              candidate={candidate}
              showDetails
            />
          </li>
        ))}
    </ul>
  );
}
