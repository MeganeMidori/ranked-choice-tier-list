import config from "@/config/candidates.json";

export type Candidate = {
  // Stored in the votes table's tier columns, so keep it stable once voting starts.
  id: string;
  name: string;
  // Japanese name, shown next to the English name in the candidate list.
  nameJa?: string;
  // How to say the Japanese words in the name, as a dictionary.com-style respelling with the stressed syllable
  // wrapped in *asterisks*. Shown under the name in the candidate list.
  pronunciation?: string;
  // Shown in small text under the name in the candidate list.
  description?: string;
};

export const candidates: Candidate[] = config.candidates;

// MIME type for the candidate id carried in drag-and-drop dataTransfer.
export const CANDIDATE_DRAG_TYPE = "application/x-candidate-id";
