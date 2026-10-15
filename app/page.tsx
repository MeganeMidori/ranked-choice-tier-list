import TierList from "@/components/tier-list";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans md:flex-row dark:bg-black">
      <section className="flex flex-1 flex-col gap-4 border-b border-black/[.08] p-4 md:border-r md:border-b-0 dark:border-white/[.145]">
        <label className="flex flex-col gap-1 text-sm font-medium text-black dark:text-zinc-50">
          Name
          <input
            type="text"
            name="name"
            className="rounded border border-black/[.15] bg-white px-3 py-2 font-normal text-black dark:border-white/[.2] dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <div className="flex flex-1 flex-col gap-1">
          <h2 className="text-sm font-medium text-black dark:text-zinc-50">
            Tier List
          </h2>
          <TierList />
        </div>
        <div>
          <button
            type="button"
            className="h-10 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Submit
          </button>
        </div>
      </section>
      <section className="flex flex-1 flex-col gap-4 p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Right
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum.
        </p>
      </section>
    </div>
  );
}
