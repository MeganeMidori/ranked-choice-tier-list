"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { tiers, type TierLabel } from "@/components/tier-list-context";

// Marks an element as a place a dragged candidate can be dropped: a tier's label, or UNPLACED for the candidate pool.
export const DROP_TARGET_ATTR = "data-drop-target";
export const UNPLACED = "unplaced";

// How long a finger must rest on a chip before it's picked up, so a swipe still scrolls the page, in ms.
const LONG_PRESS_MS = 300;
// How far a finger can wander during the long press before it counts as a scroll instead, in px.
const MOVE_TOLERANCE_PX = 10;
// How close to the top or bottom of the scrolling area the finger must be to scroll it while dragging, and the
// fastest that scrolls, in px per frame.
const EDGE_PX = 60;
const MAX_SCROLL_PX = 15;

// The tier under a point, null for the candidate pool, or undefined when it's over neither.
function dropTargetAt(x: number, y: number): TierLabel | null | undefined {
  const value = document.elementFromPoint(x, y)?.closest(`[${DROP_TARGET_ATTR}]`)?.getAttribute(DROP_TARGET_ATTR);
  if (value === UNPLACED) return null;
  return tiers.find((t) => t.label === value)?.label;
}

// The nearest element under a point that can scroll vertically, or the page itself. On mobile, the form and the
// candidates each scroll on their own.
function scrollerAt(x: number, y: number): Element {
  for (let el = document.elementFromPoint(x, y); el; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight) return el;
  }
  return document.scrollingElement ?? document.documentElement;
}

// Native drag and drop doesn't start from touch on most phones, so this drags with touch events instead: a long press
// picks the chip up, the preview follows the finger, and lifting it drops the chip on whatever's underneath.
//
// Returns a ref that's true while a finger is on the chip, so the chip can cancel a native drag the browser might
// also start from the same long press.
export function useTouchDrag({
  chipRef,
  previewRef,
  enabled,
  onStart,
  onOver,
  onDrop,
  onCancel,
}: {
  chipRef: React.RefObject<HTMLElement | null>;
  previewRef: React.RefObject<HTMLElement | null>;
  enabled: boolean;
  onStart: () => void;
  onOver: (target: TierLabel | null | undefined) => void;
  onDrop: (target: TierLabel | null | undefined) => void;
  onCancel: () => void;
}) {
  const touchActive = useRef(false);
  const start = useEffectEvent(onStart);
  const over = useEffectEvent(onOver);
  const drop = useEffectEvent(onDrop);
  const cancel = useEffectEvent(onCancel);

  useEffect(() => {
    const chip = chipRef.current;
    if (!chip || !enabled) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    let dragging = false;
    let origin = { x: 0, y: 0 };
    let last = { x: 0, y: 0 };

    // Centers the preview under the finger. It's normally parked off-screen, and these inline styles override that.
    const moveTo = (x: number, y: number) => {
      last = { x, y };
      const preview = previewRef.current;
      if (preview) {
        preview.style.left = `${x - preview.offsetWidth / 2}px`;
        preview.style.top = `${y - preview.offsetHeight / 2}px`;
        preview.style.zIndex = "60";
      }
      over(dropTargetAt(x, y));
    };

    // Scrolls whatever's under the finger while it's near that area's top or bottom edge, faster the closer it gets,
    // so a chip can reach tiers that are out of view. Nothing scrolls by itself, since touchmove is cancelled while
    // dragging.
    const autoScroll = () => {
      const scroller = scrollerAt(last.x, last.y);
      const isPage = scroller === document.scrollingElement;
      const top = isPage ? 0 : scroller.getBoundingClientRect().top;
      const bottom = isPage ? window.innerHeight : scroller.getBoundingClientRect().bottom;
      const fromTop = last.y - top;
      const fromBottom = bottom - last.y;
      const depth = fromTop < EDGE_PX ? fromTop - EDGE_PX : fromBottom < EDGE_PX ? EDGE_PX - fromBottom : 0;
      if (depth !== 0) {
        scroller.scrollBy(0, (depth / EDGE_PX) * MAX_SCROLL_PX);
        over(dropTargetAt(last.x, last.y));
      }
      frame = requestAnimationFrame(autoScroll);
    };

    const finish = () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      dragging = false;
      touchActive.current = false;
      const preview = previewRef.current;
      if (preview) preview.style.left = preview.style.top = preview.style.zIndex = "";
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return finish();
      touchActive.current = true;
      origin = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      timer = setTimeout(() => {
        dragging = true;
        navigator.vibrate?.(10);
        start();
        moveTo(origin.x, origin.y);
        frame = requestAnimationFrame(autoScroll);
      }, LONG_PRESS_MS);
    };

    const onTouchMove = (e: TouchEvent) => {
      const { clientX: x, clientY: y } = e.touches[0];
      if (dragging) {
        e.preventDefault();
        moveTo(x, y);
      } else if (Math.hypot(x - origin.x, y - origin.y) > MOVE_TOLERANCE_PX) {
        clearTimeout(timer);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (dragging) {
        // Stops the tap from also firing a click.
        e.preventDefault();
        drop(dropTargetAt(last.x, last.y));
      }
      finish();
    };

    const onTouchCancel = () => {
      if (dragging) cancel();
      finish();
    };

    // Not passive, so touchmove can stop the page scrolling while dragging. React's touch handlers are passive.
    chip.addEventListener("touchstart", onTouchStart, { passive: true });
    chip.addEventListener("touchmove", onTouchMove, { passive: false });
    chip.addEventListener("touchend", onTouchEnd);
    chip.addEventListener("touchcancel", onTouchCancel);
    return () => {
      finish();
      chip.removeEventListener("touchstart", onTouchStart);
      chip.removeEventListener("touchmove", onTouchMove);
      chip.removeEventListener("touchend", onTouchEnd);
      chip.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [chipRef, previewRef, enabled]);

  return touchActive;
}
