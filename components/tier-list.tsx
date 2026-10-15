const tiers = [
  { label: "S-Tier", color: "#ff7f7f" },
  { label: "A-Tier", color: "#ffbf7f" },
  { label: "B-Tier", color: "#ffdf7f" },
  { label: "C-Tier", color: "#ffff7f" },
  { label: "D-Tier", color: "#bfff7f" },
  { label: "F-Tier", color: "#7fff7f" },
];

export default function TierList() {
  return (
    <div className="flex flex-1 flex-col border border-black bg-white">
      {tiers.map((tier) => (
        <div key={tier.label} className="flex min-h-20 flex-1 border-b border-black last:border-b-0">
          <div
            className="flex w-24 shrink-0 items-center justify-center p-2 text-center text-sm text-zinc-900"
            style={{ backgroundColor: tier.color }}
          >
            {tier.label}
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-1 bg-white p-1" />
        </div>
      ))}
    </div>
  );
}
