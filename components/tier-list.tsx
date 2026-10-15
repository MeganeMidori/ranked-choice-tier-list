"use client";

import { useState } from "react";
import { candidates, CANDIDATE_DRAG_TYPE } from "@/lib/candidates";
import { tiers, useTierList } from "@/components/tier-list-context";
import CandidateChip from "@/components/candidate-chip";

const candidatesById = new Map(candidates.map((c) => [c.id, c]));

export default function TierList() {
  const { state, dispatch } = useTierList();
  const [dragOverTier, setDragOverTier] = useState<string | null>(null);

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
            onDragOver={(e) => {
              if (!e.dataTransfer.types.includes(CANDIDATE_DRAG_TYPE)) return;
              e.preventDefault();
              setDragOverTier(tier.label);
            }}
            onDragLeave={() => setDragOverTier(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverTier(null);
              dispatch({
                type: "place",
                candidateId: e.dataTransfer.getData(CANDIDATE_DRAG_TYPE),
                tierLabel: tier.label,
              });
            }}
            className={`flex flex-1 flex-wrap items-center gap-1 p-1 ${
              dragOverTier === tier.label ? "bg-zinc-100" : "bg-white"
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
