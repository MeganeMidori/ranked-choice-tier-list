"use client";

import { candidates, CANDIDATE_DRAG_TYPE } from "@/lib/candidates";
import { tiers, useTierList } from "@/components/tier-list-context";
import CandidateChip from "@/components/candidate-chip";
import { DROP_TARGET_ATTR } from "@/components/use-touch-drag";

const candidatesById = new Map(candidates.map((c) => [c.id, c]));

export default function TierList() {
  const { state, dispatch } = useTierList();

  return (
    <div className="flex flex-1 flex-col border border-black/[.15] bg-white">
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
  );
}
