"use client";

import { createContext, useContext, useEffect, useReducer } from "react";
import { candidates } from "@/lib/candidates";

export const tiers = [
  { label: "S-Tier", color: "#ff7f7f" },
  { label: "A-Tier", color: "#ffbf7f" },
  { label: "B-Tier", color: "#ffdf7f" },
  { label: "C-Tier", color: "#ffff7f" },
  { label: "D-Tier", color: "#bfff7f" },
  { label: "F-Tier", color: "#7fff7f" },
] as const;

export type TierLabel = (typeof tiers)[number]["label"];

// Every candidate's tier, or null when it hasn't been placed. Within a tier, array order is display order.
export type Placement = { id: string; tier: TierLabel | null };

export type TierListState = {
  placements: Placement[];
  // Id of the candidate currently being dragged, if any.
  draggingId: string | null;
};

export type TierListAction =
  // Moves a candidate into a tier, or back to the unplaced pool when tierLabel is null.
  | { type: "place"; candidateId: string; tierLabel: TierLabel | null }
  // Clears every tier, returning all candidates to the unplaced pool.
  | { type: "reset" }
  | { type: "dragStart"; candidateId: string }
  | { type: "dragEnd" };

type TierListContextValue = {
  state: TierListState;
  dispatch: React.Dispatch<TierListAction>;
};

const TierListContext = createContext<TierListContextValue | null>(null);

const emptyPlacements: Placement[] = candidates.map((c) => ({ id: c.id, tier: null }));

const initialState: TierListState = { placements: emptyPlacements, draggingId: null };

export function tierListReducer(state: TierListState, action: TierListAction): TierListState {
  switch (action.type) {
    case "place": {
      const { candidateId, tierLabel } = action;
      // The dragged element may unmount on drop and never fire dragend, so clear it here too.
      if (!state.placements.some((p) => p.id === candidateId)) return { ...state, draggingId: null };

      // Move the entry to the end so it appears last in its new tier.
      const placements = [
        ...state.placements.filter((p) => p.id !== candidateId),
        { id: candidateId, tier: tierLabel },
      ];
      return { placements, draggingId: null };
    }
    case "reset":
      return { ...state, placements: emptyPlacements };
    case "dragStart":
      return { ...state, draggingId: action.candidateId };
    case "dragEnd":
      return { ...state, draggingId: null };
  }
}

export function TierListProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tierListReducer, initialState);

  useEffect(() => {
    console.log("Tier list:", state.placements);
  }, [state.placements]);

  return <TierListContext value={{ state, dispatch }}>{children}</TierListContext>;
}

export function useTierList() {
  const context = useContext(TierListContext);
  if (!context) throw new Error("useTierList must be used within a TierListProvider");
  return context;
}
