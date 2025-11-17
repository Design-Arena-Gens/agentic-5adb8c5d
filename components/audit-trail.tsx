"use client";

import { AuditEntry } from "@/types";
import { formatTimestamp } from "@/lib/formatters";

export function AuditTrail({ entries }: { entries: AuditEntry[] }) {
  if (!entries.length) {
    return (
      <p className="text-sm text-slate-500">
        No recorded audit events for this document yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entries
        .slice()
        .reverse()
        .map((entry) => (
          <div
            key={entry.id}
            className="border border-slate-200 rounded-lg bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{formatTimestamp(entry.timestamp)}</span>
              <span className="font-semibold text-slate-600">{entry.actor}</span>
            </div>
            <p className="text-sm font-medium text-slate-700 mt-1">{entry.action}</p>
            <p className="text-sm text-slate-600">{entry.details}</p>
          </div>
        ))}
    </div>
  );
}
