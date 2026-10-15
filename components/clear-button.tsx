"use client";

import { useTierList } from "@/components/tier-list-context";

// A native reset button clears the form's inputs; the tier list lives in React state, so reset it too.
export default function ClearButton() {
  const { dispatch } = useTierList();

  return (
    <button
      type="reset"
      onClick={() => dispatch({ type: "reset" })}
      className="h-10 rounded-full border border-black/[.15] px-5 text-sm font-medium text-black transition-colors hover:bg-black/[.05] dark:border-white/[.2] dark:text-zinc-50 dark:hover:bg-white/[.08]"
    >
      Clear
    </button>
  );
}
