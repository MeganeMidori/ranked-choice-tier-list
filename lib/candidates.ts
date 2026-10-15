import config from "@/config/candidates.json";

export type Candidate = {
  // Stored in the votes table's tier columns, so keep it stable once voting starts.
  id: string;
  name: string;
  // Japanese name, shown next to the English name in the candidate list.
  nameJa?: string;
  // Shown in small text under the name in the candidate list.
  description?: string;
};

export const candidates: Candidate[] = config.candidates;

// MIME type for the candidate id carried in drag-and-drop dataTransfer.
export const CANDIDATE_DRAG_TYPE = "application/x-candidate-id";
