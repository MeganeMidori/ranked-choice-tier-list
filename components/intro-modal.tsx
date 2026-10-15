"use client";

import { useEffect, useRef } from "react";
import { candidates } from "@/lib/candidates";
import { useTierList } from "@/components/tier-list-context";

// Greets the visitor with a modal once the loading overlay is gone. A native dialog opened with showModal() traps
// focus, closes on Escape, and sits in the top layer, so it would cover the loading overlay if opened any sooner.
export default function IntroModal() {
  const { state } = useTierList();
  const ready = candidates.every((c) => state.readyIds.includes(c.id));
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (ready && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [ready]);

  return (
    <dialog
      ref={dialogRef}
      // Close when the backdrop is clicked: the dialog element itself is only the target outside its content.
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      className="m-auto max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] max-w-md rounded-lg bg-white p-0 text-black backdrop:bg-black/50 dark:bg-zinc-900 dark:text-zinc-50"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 className="text-base font-bold uppercase text-[#D94296]">
          Welcome to the maid cafe poll!
        </h2>
        <p className="text-sm">
          Welcome and thank you for helping us lay the foundation for our next
          Maid Cafe! This form lets you vote for our new brand name.
        </p>
        <p className="text-sm">
          Votes will be tallied using ranked choice voting to ensure the most
          fair outcome.
        </p>
        <p className="text-sm">
          The winner of the poll will become our new brand name moving forward!
        </p>
        <hr className="border-[#D94296]" />
        <p className="text-sm">
          Please review all the candidates and assess them based on how well
          each of them fits our aesthetic, and how well it describes us as a
          group.
        </p>
        <p className="text-sm">
          Drag and drop each name into categories from S to F tier, with S-Tier
          being the best names and F-Tier being the worst names.
        </p>
        <p className="text-sm italic text-[#D94296]">
          Note for mobile users: long press on a name before dragging.
        </p>
        <p className="text-sm">
          You can put multiple names into the same category, and may leave some
          categories empty as you see fit.
        </p>
        <p className="text-sm">
          Everyone gets one vote! If you vote twice, only your most recent entry will be counted.
        </p>
        <form method="dialog" className="flex justify-end">
          <button className="h-10 cursor-pointer rounded-full bg-[#D94296] px-5 text-sm font-medium text-white transition-colors hover:bg-[#C2357F]">
            Got it
          </button>
        </form>
      </div>
    </dialog>
  );
}
