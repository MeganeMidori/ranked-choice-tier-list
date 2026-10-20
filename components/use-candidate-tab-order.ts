"use client";

import { useEffect } from "react";
import { CANDIDATE_ID_ATTR, DROP_TARGET_ATTR, UNPLACED } from "@/components/use-touch-drag";

// Tabs through the form in DOM order, but with the unplaced candidates slotted in right after the tier list, so they can
// be picked up and placed before moving on to the comments. The candidate pool sits outside the form, after it, so its
// chips are left out of the browser's own tab order and reached only through here.
export function useCandidateTabOrder(tierListRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || e.altKey || e.ctrlKey || e.metaKey) return;
      const tierList = tierListRef.current;
      const form = tierList?.closest("form");
      if (!tierList || !form) return;

      const fields = [...form.querySelectorAll<HTMLElement>("input, textarea, select, button, [tabindex]")].filter(
        (el) => el.tabIndex >= 0 && !el.matches(":disabled"),
      );
      const pool = [
        ...document.querySelectorAll<HTMLElement>(`[${DROP_TARGET_ATTR}="${UNPLACED}"] [${CANDIDATE_ID_ATTR}]`),
      ];
      const afterTierList = fields.findIndex(
        (el) => !tierList.contains(el) && tierList.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
      const order =
        afterTierList === -1
          ? [...fields, ...pool]
          : [...fields.slice(0, afterTierList), ...pool, ...fields.slice(afterTierList)];

      const i = order.indexOf(document.activeElement as HTMLElement);
      const next = i === -1 ? undefined : order[i + (e.shiftKey ? -1 : 1)];
      // Focus is outside the form, or leaving it: let the browser carry on.
      if (!next) return;
      e.preventDefault();
      next.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [tierListRef]);
}
