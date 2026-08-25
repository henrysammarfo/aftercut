"use client";

import { useState, type FormEvent } from "react";
import { joinCreatorWaitlist, CREATOR_BETA_CAP } from "@/lib/waitlist";
import { cloudJoinWaitlist } from "@/lib/tenant-cloud";
import { notifyError, notifySuccess } from "@/lib/notify";

export function WaitlistForm({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = joinCreatorWaitlist(email);
    if (!res.ok) {
      notifyError(res.error);
      return;
    }
    setJoined(true);
    try {
      const cloud = await cloudJoinWaitlist({ data: { email } });
      if (cloud.ok) {
        notifySuccess(
          cloud.duplicate
            ? "You're already on the list."
            : `You're in the first ${CREATOR_BETA_CAP} creators.`,
        );
        return;
      }
    } catch {
      /* fall through to local confirmation */
    }
    notifySuccess(
      res.count <= CREATOR_BETA_CAP
        ? `You're in the first ${CREATOR_BETA_CAP} creators.`
        : "You're on the list — we'll open seats as the beta fills.",
    );
  };

  return (
    <form
      onSubmit={onSubmit}
      className={
        compact
          ? "flex flex-col gap-2 sm:flex-row sm:items-center"
          : "mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
      }
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email for the first 100"
        className="w-full flex-1 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-white/30"
      />
      <button
        type="submit"
        className="rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
      >
        {joined ? "You're on the list" : "Join free beta"}
      </button>
    </form>
  );
}
