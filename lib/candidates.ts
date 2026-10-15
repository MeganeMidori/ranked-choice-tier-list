import config from "@/config/candidates.json";

export type Candidate = {
  // Stored in the votes table's tier columns, so keep it stable once voting starts.
  id: string;
  name: string;
};

export const candidates: Candidate[] = config.candidates;

// MIME type for the candidate id carried in drag-and-drop dataTransfer.
export const CANDIDATE_DRAG_TYPE = "application/x-candidate-id";
