"use client";

import { useEffect, useRef } from "react";

// A native dialog opened with showModal(), which traps focus, closes on Escape, and sits in the top layer above
// everything else. onClose is called however it's closed (Escape, a backdrop click, or the caller), so the caller
// can keep open in sync. Without onClose the modal can't be dismissed at all: Escape and backdrop clicks are ignored.
export default function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current!;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={(e) => {
        if (onClose) onClose();
        // Browsers may close the dialog on a repeated Escape even when cancel is prevented, so reopen it.
        else if (open) e.currentTarget.showModal();
      }}
      onCancel={(e) => !onClose && e.preventDefault()}
      // Close when the backdrop is clicked: the dialog element itself is only the target outside its content.
      onClick={(e) => onClose && e.target === e.currentTarget && e.currentTarget.close()}
      className="m-auto max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] max-w-md rounded-lg bg-white p-0 text-black backdrop:bg-black/50 dark:bg-zinc-900 dark:text-zinc-50"
    >
      <div className="flex flex-col gap-4 p-6">{children}</div>
    </dialog>
  );
}
