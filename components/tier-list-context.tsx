"use client";

import { createContext, useContext, useEffect, useReducer } from "react";
import { candidates } from "@/lib/candidates";

export const tiers = [
  { label: "S-Tier", color: "#D94296", textColor: "#ffffff" },
  { label: "A-Tier", color: "#ffbf7f", textColor: "#18181b" },
  { label: "B-Tier", color: "#ffdf7f", textColor: "#18181b" },
  { label: "C-Tier", color: "#ffff7f", textColor: "#18181b" },
  { label: "D-Tier", color: "#bfff7f", textColor: "#18181b" },
  { label: "F-Tier", color: "#7fff7f", textColor: "#18181b" },
] as const;

export type TierLabel = (typeof tiers)[number]["label"];

// Every candidate's tier, or null when it hasn't been placed. Within a tier, array order is display order.
export type Placement = { id: string; tier: TierLabel | null };

export type TierListState = {
  placements: Placement[];
  // Id of the candidate currently being dragged, if any.
  draggingId: string | null;
  // The tier the dragged candidate is over, if any.
  dragOverTier: TierLabel | null;
  // Ids of candidates whose drag preview has loaded. The page shows a loading overlay until every candidate is here.
  readyIds: string[];
  // When the most recent candidate became ready, in ms since the page started loading (performance.now()).
  lastReadyAt: number | null;
};

export type TierListAction =
  // Moves a candidate into a tier, or back to the unplaced pool when tierLabel is null.
  | { type: "place"; candidateId: string; tierLabel: TierLabel | null }
  // Clears every tier, returning all candidates to the unplaced pool.
  | { type: "reset" }
  | { type: "dragStart"; candidateId: string }
  | { type: "dragEnd" }
  | { type: "dragOver"; tierLabel: TierLabel | null }
  // at is performance.now() when it became ready.
  | { type: "candidateReady"; candidateId: string; at: number };

type TierListContextValue = {
  state: TierListState;
  dispatch: React.Dispatch<TierListAction>;
};

const TierListContext = createContext<TierListContextValue | null>(null);

const emptyPlacements: Placement[] = candidates.map((c) => ({ id: c.id, tier: null }));

const initialState: TierListState = {
  placements: emptyPlacements,
  draggingId: null,
  dragOverTier: null,
  readyIds: [],
  lastReadyAt: null,
};

export function tierListReducer(state: TierListState, action: TierListAction): TierListState {
  switch (action.type) {
    case "place": {
      const { candidateId, tierLabel } = action;
      // The dragged element may unmount on drop and never fire dragend, so clear it here too.
      if (!state.placements.some((p) => p.id === candidateId)) return { ...state, draggingId: null, dragOverTier: null };

      // Move the entry to the end so it appears last in its new tier.
      const placements = [
        ...state.placements.filter((p) => p.id !== candidateId),
        { id: candidateId, tier: tierLabel },
      ];
      return { ...state, placements, draggingId: null, dragOverTier: null };
    }
    case "reset":
      return { ...state, placements: emptyPlacements };
    case "dragStart":
      return { ...state, draggingId: action.candidateId };
    case "dragEnd":
      return { ...state, draggingId: null, dragOverTier: null };
    case "dragOver":
      // Fires on every pointer move, so skip the re-render when nothing changed.
      if (state.dragOverTier === action.tierLabel) return state;
      return { ...state, dragOverTier: action.tierLabel };
    case "candidateReady":
      if (state.readyIds.includes(action.candidateId)) return state;
      return { ...state, readyIds: [...state.readyIds, action.candidateId], lastReadyAt: action.at };
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
