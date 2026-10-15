// Shared by the entry form and POST /api/votes.

// Keys match the votes table's tier columns (s_tier, a_tier, ...).
export const tierKeys = ["s", "a", "b", "c", "d", "f"] as const;
export type TierKey = (typeof tierKeys)[number];

// The body of POST /api/votes.
export type VoteInput = {
  maidName: string;
  fullName: string;
  comments: string;
  // Candidate ids in each tier, in display order.
  tiers: Record<TierKey, string[]>;
};
