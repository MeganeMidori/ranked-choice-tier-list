"use client";

import { CANDIDATE_DRAG_TYPE, type Candidate } from "@/lib/candidates";
import { useTierList } from "@/components/tier-list-context";

export default function CandidateChip({
  candidate,
  className = "",
}: {
  candidate: Candidate;
  className?: string;
}) {
  const { state, dispatch } = useTierList();
  const isDragging = state.draggingId === candidate.id;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(CANDIDATE_DRAG_TYPE, candidate.id);
        e.dataTransfer.effectAllowed = "move";
        dispatch({ type: "dragStart", candidateId: candidate.id });
      }}
      onDragEnd={() => dispatch({ type: "dragEnd" })}
      className={`cursor-grab rounded border px-3 py-2 text-sm active:cursor-grabbing ${
        isDragging
          ? "border-blue-500 bg-blue-100 text-black ring-2 ring-blue-500 dark:bg-blue-950 dark:text-zinc-50"
          : className
      }`}
    >
      {candidate.name}
    </div>
  );
}
