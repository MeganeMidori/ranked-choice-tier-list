"use client";

import { useState } from "react";
import { candidates } from "@/lib/candidates";
import { tiers, useTierList } from "@/components/tier-list-context";
import Modal from "@/components/modal";
import { downloadResponsePdf } from "@/lib/response-pdf";

const candidatesById = new Map(candidates.map((c) => [c.id, c]));

// The form's text fields, read when it's submitted.
type Entry = { maidName: string; fullName: string; comments: string };

// The entry form. Submitting it checks the required fields, then shows the entry back in a modal so it can be checked
// before it's sent. Confirming swaps it for a thank-you modal, where the response can be downloaded as a PDF. The tier list is read live from context, since nothing can change it while the modal is open.
//
// Fields mark themselves invalid with required and pattern, and show their own error messages with :user-invalid,
// which matches after a failed submit or once someone has edited the field, and is cleared by a reset.
export default function EntryForm({ className, children }: { className?: string; children: React.ReactNode }) {
  const { state } = useTierList();
  const [entry, setEntry] = useState<Entry | null>(null);
  // The confirmed entry, kept for the thank-you modal's download.
  const [submitted, setSubmitted] = useState<Entry | null>(null);
  const close = () => setEntry(null);
  const namesInTier = (label: string) =>
    state.placements.filter((p) => p.tier === label).map((p) => candidatesById.get(p.id)!.name);

  return (
    <>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          // noValidate skips the browser's own error bubbles, which would repeat the inline messages, so check here.
          // The submit attempt still marks the fields as :user-invalid.
          if (!form.checkValidity()) {
            form.querySelector<HTMLElement>(":invalid")?.focus();
            return;
          }
          const data = new FormData(form);
          setEntry({
            maidName: String(data.get("maid_name") ?? "").trim(),
            fullName: String(data.get("full_name") ?? "").trim(),
            comments: String(data.get("additional_comments") ?? "").trim(),
          });
        }}
        className={className}
      >
        {children}
      </form>
      <Modal open={entry !== null} onClose={close}>
        <h2 className="text-base font-bold uppercase text-[#D94296]">Confirm your entry</h2>
        <dl className="flex flex-col gap-3 text-sm">
          <Field label="Maid Name" value={entry?.maidName} />
          <Field label="Full Name" value={entry?.fullName} />
          <div className="flex flex-col gap-1">
            <dt className="font-bold uppercase text-black">Tier List</dt>
            <dd>
              <ul className="flex flex-col gap-1">
                {tiers.map((tier) => {
                  const names = namesInTier(tier.label);
                  return (
                    <li key={tier.label} className="flex items-start gap-2">
                      <span
                        className="w-16 shrink-0 rounded px-2 py-0.5 text-center text-xs font-bold"
                        style={{ backgroundColor: tier.color, color: tier.textColor }}
                      >
                        {tier.label}
                      </span>
                      <span className={names.length ? "" : "text-zinc-400"}>
                        {names.length ? names.join(", ") : "None"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </dd>
          </div>
          <Field label="Additional Comments" value={entry?.comments} />
        </dl>
        <div className="flex justify-end gap-2">
          {/* Nothing is saved yet: this only swaps in the thank-you modal. */}
          <button
            type="button"
            onClick={() => {
              setSubmitted(entry);
              close();
            }}
            className="h-10 cursor-pointer rounded-full bg-[#D94296] px-5 text-sm font-bold text-white transition-colors hover:bg-[#C2357F]"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={close}
            className="h-10 cursor-pointer rounded-full border border-[#D94296] px-5 text-sm font-bold text-[#D94296] transition-colors hover:bg-[#D94296]/10"
          >
            Go back
          </button>
        </div>
      </Modal>
      {/* No onClose and no close button: once confirmed, the form stays covered so the entry can't be submitted again. */}
      <Modal open={submitted !== null}>
        <h2 className="text-base font-bold uppercase text-[#D94296]">Thank you for your feedback!</h2>
        <p className="text-sm">Results will be tallied and announced on MM/DD.</p>
        <p className="text-sm">
          If you have any questions please reach us via email at{" "}
          <a href="mailto:fanimaidcafe@gmail.com" className="text-[#D94296] underline">
            fanimaidcafe@gmail.com
          </a>{" "}
          or any <b>@Lead Maid</b> on discord.
        </p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              submitted &&
              downloadResponsePdf({
                ...submitted,
                tiers: tiers.map((tier) => ({ ...tier, names: namesInTier(tier.label) })),
              })
            }
            className="h-10 cursor-pointer rounded-full bg-[#D94296] px-5 text-sm font-bold text-white transition-colors hover:bg-[#C2357F]"
          >
            Download my response
          </button>
        </div>
      </Modal>
    </>
  );
}

function Field({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-bold uppercase text-black">{label}</dt>
      <dd className={`whitespace-pre-wrap ${value ? "" : "text-zinc-400"}`}>{value || "None"}</dd>
    </div>
  );
}
