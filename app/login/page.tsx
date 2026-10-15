"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(login, null);

  return (
    <div className="flex h-dvh items-center justify-center bg-pink-50 p-4 font-sans dark:bg-black">
      <form
        action={formAction}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-black dark:text-zinc-50">
          <span className="text-base font-bold uppercase text-[#D94296]">Password</span>
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            className="rounded border outline-[#D94296] focus:outline-solid focus:outline-2 border-black/[.15] bg-white px-3 py-2 font-normal text-black dark:border-white/[.2] dark:bg-zinc-900 dark:text-zinc-50"
          />
          {error && <span className="text-red-600 dark:text-red-400">{error}</span>}
        </label>
        <div className="flex">
          <button
            type="submit"
            disabled={pending}
            className="h-10 cursor-pointer rounded-full bg-[#D94296] px-5 text-sm font-bold text-white transition-colors hover:bg-[#C2357F] disabled:cursor-default disabled:opacity-60"
          >
            Enter
          </button>
        </div>
      </form>
    </div>
  );
}
