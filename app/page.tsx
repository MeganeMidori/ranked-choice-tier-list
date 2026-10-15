import TierList from "@/components/tier-list";
import CandidateList from "@/components/candidate-list";
import { TierListProvider } from "@/components/tier-list-context";
import ClearButton from "@/components/clear-button";
import EntryForm from "@/components/entry-form";
import LoadingOverlay from "@/components/loading-overlay";
import IntroModal from "@/components/intro-modal";
import { getLoadingMessages } from "@/lib/loading-messages";

export default function Home() {
  return (
    <TierListProvider>
      <LoadingOverlay messages={getLoadingMessages()} />
      <IntroModal />
      {/* The form and candidates each take half the screen and scroll on their own, so the tier list stays in reach
          while browsing candidates. They stack on mobile and sit side by side on wider screens. */}
      <div className="flex h-dvh flex-col bg-pink-50 font-sans md:flex-row dark:bg-black">
        <EntryForm className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain border-b border-black/[.08] p-4 md:border-r md:border-b-0 dark:border-white/[.145]">
          <label className="group flex flex-col gap-1 text-sm font-medium text-black dark:text-zinc-50">
            <span className="text-base font-bold uppercase text-[#D94296] group-has-user-invalid:text-red-600 dark:group-has-user-invalid:text-red-400">Maid Name</span>
            <input
              type="text"
              name="maid_name"
              required
              // Rejects names that are only spaces.
              pattern=".*\S.*"
              className="peer rounded border border-black/[.15] bg-white px-3 py-2 font-normal text-black user-invalid:border-red-600 dark:border-white/[.2] dark:bg-zinc-900 dark:text-zinc-50 dark:user-invalid:border-red-400"
            />
            <span className="hidden text-red-600 peer-user-invalid:block dark:text-red-400">Please enter your maid name.</span>
          </label>
          <label className="group flex flex-col gap-1 text-sm font-medium text-black dark:text-zinc-50">
            <span className="text-base font-bold uppercase text-[#D94296] group-has-user-invalid:text-red-600 dark:group-has-user-invalid:text-red-400">Full Name</span>
            <input
              type="text"
              name="full_name"
              required
              // Rejects names that are only spaces.
              pattern=".*\S.*"
              className="peer rounded border border-black/[.15] bg-white px-3 py-2 font-normal text-black user-invalid:border-red-600 dark:border-white/[.2] dark:bg-zinc-900 dark:text-zinc-50 dark:user-invalid:border-red-400"
            />
            <span className="hidden text-red-600 peer-user-invalid:block dark:text-red-400">Please enter your full name.</span>
          </label>
          <TierList />
          <label className="flex flex-col gap-1 text-sm font-medium text-black dark:text-zinc-50">
            <span className="text-base font-bold uppercase text-[#D94296]">Additional Comments</span>
            <textarea
              name="additional_comments"
              rows={4}
              className="rounded border border-black/[.15] bg-white px-3 py-2 font-normal text-black dark:border-white/[.2] dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="h-10 cursor-pointer rounded-full bg-[#D94296] px-5 text-sm font-bold text-white transition-colors hover:bg-[#C2357F]"
            >
              Submit
            </button>
            <ClearButton />
          </div>
        </EntryForm>
        <section className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-4">
          <h2 className="text-base font-bold uppercase text-[#D94296]">
            Candidates
          </h2>
          <CandidateList />
        </section>
      </div>
    </TierListProvider>
  );
}
