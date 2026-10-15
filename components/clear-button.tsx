"use client";

import { useTierList } from "@/components/tier-list-context";

// A native reset button clears the form's inputs; the tier list lives in React state, so reset it too.
// Starting over also shows the welcome modal again.
export default function ClearButton() {
  const { dispatch } = useTierList();

  return (
    <button
      type="reset"
      onClick={() => dispatch({ type: "reset" })}
      className="h-10 cursor-pointer rounded-full border border-[#D94296] px-5 text-sm font-bold text-[#D94296] transition-colors hover:bg-[#D94296]/10"
    >
      Start over
    </button>
  );
}
