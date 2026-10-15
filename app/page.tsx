import TierList from "@/components/tier-list";
import CandidateList from "@/components/candidate-list";
import { TierListProvider } from "@/components/tier-list-context";
import ClearButton from "@/components/clear-button";
import LoadingOverlay from "@/components/loading-overlay";
import { getLoadingMessages } from "@/lib/loading-messages";

export default function Home() {
  return (
    <TierListProvider>
      <LoadingOverlay messages={getLoadingMessages()} />
      <div className="flex flex-1 flex-col bg-pink-50 font-sans md:flex-row dark:bg-black">
        <form className="flex flex-1 flex-col gap-4 border-b border-black/[.08] p-4 md:border-r md:border-b-0 dark:border-white/[.145]">
          <label className="flex flex-col gap-1 text-sm font-medium text-black dark:text-zinc-50">
            <span className="text-base font-bold uppercase text-[#D94296]">Maid Name</span>
            <input
              type="text"
              name="maid_name"
              className="rounded border border-black/[.15] bg-white px-3 py-2 font-normal text-black dark:border-white/[.2] dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-black dark:text-zinc-50">
            <span className="text-base font-bold uppercase text-[#D94296]">Full Name</span>
            <input
              type="text"
              name="full_name"
              className="rounded border border-black/[.15] bg-white px-3 py-2 font-normal text-black dark:border-white/[.2] dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <div className="flex flex-1 flex-col gap-1">
            <h2 className="text-base font-bold uppercase text-[#D94296]">
              Tier List
            </h2>
            <TierList />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="h-10 cursor-pointer rounded-full bg-[#D94296] px-5 text-sm font-medium text-white transition-colors hover:bg-[#C2357F]"
            >
              Submit
            </button>
            <ClearButton />
          </div>
        </form>
        <section className="flex flex-1 flex-col gap-1 p-4">
          <h2 className="text-base font-bold uppercase text-[#D94296]">
            Candidates
          </h2>
          <CandidateList />
        </section>
      </div>
    </TierListProvider>
  );
}
