import { pool } from "@/lib/db";
import { candidates } from "@/lib/candidates";
import { tierKeys, type TierKey } from "@/lib/votes";
import { isSignedIn } from "@/lib/site-auth";

const MAX_NAME_LENGTH = 200;
const MAX_COMMENTS_LENGTH = 5000;
const candidateIds = new Set(candidates.map((c) => c.id));

const fail = (error: string, status = 400) => Response.json({ error }, { status });

// Values are passed to the query as parameters, never spliced into the SQL, so text can't inject SQL. Postgres does
// reject null bytes in text though, so those are dropped.
const cleanText = (value: unknown) => (typeof value === "string" ? value.replaceAll("\0", "").trim() : "");

// Saves a confirmed entry (a VoteInput). Anyone can POST here directly, so everything the form checks is checked
// again here. Responds 201 on success, or with { error } to show the voter.
export async function POST(request: Request) {
  if (!(await isSignedIn())) return fail("Your session has expired. Please reload the page and sign in again.", 401);

  let input;
  try {
    input = await request.json();
  } catch {
    return fail("Your entry couldn't be read.");
  }

  const maidName = cleanText(input?.maidName);
  const fullName = cleanText(input?.fullName);
  const comments = cleanText(input?.comments);
  if (!maidName || !fullName) return fail("Please enter your maid name and full name.");
  if (maidName.length > MAX_NAME_LENGTH || fullName.length > MAX_NAME_LENGTH || comments.length > MAX_COMMENTS_LENGTH)
    return fail("Your entry is too long.");

  // Each tier must be a list of known candidates, and no candidate can appear twice.
  const seen = new Set<string>();
  const tiers = {} as Record<TierKey, string[]>;
  for (const key of tierKeys) {
    const ids: unknown = input?.tiers?.[key];
    if (!Array.isArray(ids)) return fail("Your tier list couldn't be read.");
    for (const id of ids) {
      if (typeof id !== "string" || !candidateIds.has(id) || seen.has(id))
        return fail("Your tier list couldn't be read.");
      seen.add(id);
    }
    tiers[key] = ids;
  }

  try {
    await pool.query(
      `insert into votes (maid_name, full_name, additional_comments, s_tier, a_tier, b_tier, c_tier, d_tier, f_tier)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [maidName, fullName, comments, tiers.s, tiers.a, tiers.b, tiers.c, tiers.d, tiers.f],
    );
  } catch (err) {
    console.error("Failed to save vote:", err);
    return fail("Something went wrong saving your entry. Please try again.", 500);
  }
  return new Response(null, { status: 201 });
}
