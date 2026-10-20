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

// Every candidate's tier, or null when it hasn't been placed. Within a tier, and within the unplaced pool, array order
// is display order.
export type Placement = { id: string; tier: TierLabel | null };

export type TierListState = {
  placements: Placement[];
  // Id of the candidate currently being dragged, if any.
  draggingId: string | null;
  // Width of the dragged candidate's pill, in px, so the drop line in a tier matches what's being dragged.
  dragWidth: number | null;
  // The tier the dragged candidate is over, if any.
  dragOverTier: TierLabel | null;
  // Where the dragged candidate would land while it's over a tier, or the unplaced pool when target is null: before the
  // candidate with beforeId, or at the end when that's null.
  dropAt: { target: TierLabel | null; beforeId: string | null } | null;
  // Ids of candidates whose drag preview has loaded. The page shows a loading overlay until every candidate is here.
  readyIds: string[];
  // When the most recent candidate became ready, in ms since the page started loading (performance.now()).
  lastReadyAt: number | null;
  // Whether the visitor has closed the welcome modal. Starting over shows it again.
  introDismissed: boolean;
};

export type TierListAction =
  // Moves a candidate into a tier, or back to the unplaced pool when tierLabel is null. It goes just before the candidate
  // with beforeId, or last when that's missing.
  | { type: "place"; candidateId: string; tierLabel: TierLabel | null; beforeId?: string | null }
  // Clears every tier, returning all candidates to the unplaced pool, and shows the welcome modal again.
  | { type: "reset" }
  | { type: "dismissIntro" }
  | { type: "dragStart"; candidateId: string; width?: number }
  | { type: "dragEnd" }
  | { type: "dragOver"; tierLabel: TierLabel | null }
  // Over a tier, or the unplaced pool when target is null, at a position within it.
  | { type: "dragOverAt"; target: TierLabel | null; beforeId: string | null }
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
  dragWidth: null,
  dragOverTier: null,
  dropAt: null,
  readyIds: [],
  lastReadyAt: null,
  introDismissed: false,
};

export function tierListReducer(state: TierListState, action: TierListAction): TierListState {
  switch (action.type) {
    case "place": {
      const { candidateId, tierLabel, beforeId } = action;
      // The dragged element may unmount on drop and never fire dragend, so clear it here too.
      const cleared = { ...state, draggingId: null, dragOverTier: null, dropAt: null };
      if (!state.placements.some((p) => p.id === candidateId)) return cleared;

      const others = state.placements.filter((p) => p.id !== candidateId);
      const at = beforeId ? others.findIndex((p) => p.id === beforeId) : -1;
      const index = at === -1 ? others.length : at;
      const placements = [...others.slice(0, index), { id: candidateId, tier: tierLabel }, ...others.slice(index)];
      return { ...cleared, placements };
    }
    case "reset":
      return { ...state, placements: emptyPlacements, introDismissed: false };
    case "dismissIntro":
      return { ...state, introDismissed: true };
    case "dragStart":
      return { ...state, draggingId: action.candidateId, dragWidth: action.width ?? null };
    case "dragEnd":
      return { ...state, draggingId: null, dragOverTier: null, dropAt: null };
    case "dragOver":
      // Fires on every pointer move, so skip the re-render when nothing changed.
      if (state.dragOverTier === action.tierLabel && !state.dropAt) return state;
      return { ...state, dragOverTier: action.tierLabel, dropAt: null };
    case "dragOverAt": {
      const { target, beforeId } = action;
      if (state.dropAt?.target === target && state.dropAt.beforeId === beforeId) return state;
      return { ...state, dragOverTier: target, dropAt: { target, beforeId } };
    }
    case "candidateReady":
      if (state.readyIds.includes(action.candidateId)) return state;
      return { ...state, readyIds: [...state.readyIds, action.candidateId], lastReadyAt: action.at };
  }
}

// Where to show the line marking a drop among ids, the candidates in target in display order: before the candidate with
// the returned id, at the end for null, or nowhere for undefined. Hidden when the drop wouldn't move the dragged
// candidate.
export function dropLineIn(state: TierListState, target: TierLabel | null, ids: string[]): string | null | undefined {
  const { dropAt, draggingId } = state;
  if (!dropAt || dropAt.target !== target) return undefined;
  const draggedAt = draggingId ? ids.indexOf(draggingId) : -1;
  if (draggedAt !== -1 && (ids[draggedAt + 1] ?? null) === dropAt.beforeId) return undefined;
  return dropAt.beforeId;
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
