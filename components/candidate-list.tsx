import config from "@/config/candidates.json";

type Candidate = {
  // Stored in the votes table's tier columns, so keep it stable once voting starts.
  id: string;
  name: string;
};

const candidates: Candidate[] = config.candidates;

export default function CandidateList() {
  return (
    <ul className="flex flex-wrap gap-2">
      {candidates.map((candidate) => (
        <li
          key={candidate.id}
          className="rounded border border-black/[.15] bg-white px-3 py-2 text-sm text-black dark:border-white/[.2] dark:bg-zinc-900 dark:text-zinc-50"
        >
          {candidate.name}
        </li>
      ))}
    </ul>
  );
}
