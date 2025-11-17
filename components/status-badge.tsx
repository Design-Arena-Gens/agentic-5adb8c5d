"use client";

import clsx from "clsx";
import { DocumentLifecycleState } from "@/types";

const stateStyles: Record<DocumentLifecycleState, string> = {
  Draft: "bg-slate-100 text-slate-700 border border-slate-200",
  "Under Review": "bg-amber-100 text-amber-700 border border-amber-200",
  "Pending Approval": "bg-orange-100 text-orange-700 border border-orange-200",
  Approved: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Effective: "bg-blue-100 text-blue-700 border border-blue-200",
  Obsolete: "bg-rose-100 text-rose-700 border border-rose-200",
};

export function StatusBadge({ state }: { state: DocumentLifecycleState }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide",
        stateStyles[state]
      )}
    >
      {state}
    </span>
  );
}
