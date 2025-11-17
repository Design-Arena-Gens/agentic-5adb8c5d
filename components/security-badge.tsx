"use client";

import clsx from "clsx";
import { DocumentSecurityLevel } from "@/types";

const colorMap: Record<DocumentSecurityLevel, string> = {
  confidential: "bg-rose-600/10 text-rose-700 border border-rose-200",
  internal: "bg-sky-600/10 text-sky-700 border border-sky-200",
  restricted: "bg-amber-600/10 text-amber-700 border border-amber-200",
  public: "bg-emerald-600/10 text-emerald-700 border border-emerald-200",
};

export function SecurityBadge({ level }: { level: DocumentSecurityLevel }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-1 text-xs font-medium rounded-md uppercase",
        colorMap[level]
      )}
    >
      {level}
    </span>
  );
}
