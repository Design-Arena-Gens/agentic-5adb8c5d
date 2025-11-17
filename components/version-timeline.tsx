"use client";

import { DocumentVersion } from "@/types";
import { formatDate } from "@/lib/formatters";
import { StatusBadge } from "./status-badge";

export function VersionTimeline({ versions }: { versions: DocumentVersion[] }) {
  return (
    <ol className="relative border-s border-slate-200 space-y-6">
      {versions
        .slice()
        .reverse()
        .map((version, index) => (
          <li key={version.id} className="ml-6">
            <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white text-xs font-semibold">
              {versions.length - index}
            </span>
            <div className="card">
              <div className="card-header flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Version {version.versionLabel}
                  </p>
                  <p className="text-xs text-slate-500">
                    Issued {formatDate(version.createdOn)} by {version.createdBy}
                  </p>
                </div>
                <StatusBadge state={version.status} />
              </div>
              <div className="card-body">
                <p className="text-sm text-slate-600">
                  {version.changeSummary || "No change summary provided."}
                </p>
                <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-500">
                  <div>
                    <dt className="uppercase font-semibold tracking-wide">Effective
                      From
                    </dt>
                    <dd className="text-slate-700 text-sm">
                      {formatDate(version.effectiveFrom)}
                    </dd>
                  </div>
                  <div>
                    <dt className="uppercase font-semibold tracking-wide">Next
                      Review
                    </dt>
                    <dd className="text-slate-700 text-sm">
                      {formatDate(version.nextReviewOn)}
                    </dd>
                  </div>
                  <div>
                    <dt className="uppercase font-semibold tracking-wide">Approvals</dt>
                    <dd className="text-slate-700 text-sm">
                      {version.approvals.length}
                    </dd>
                  </div>
                </dl>
                {version.approvals.length > 0 && (
                  <div className="mt-4 border border-slate-200 rounded-lg">
                    <div className="px-4 py-2 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                      Electronic Signatures
                    </div>
                    <ul className="divide-y divide-slate-200">
                      {version.approvals.map((approval) => (
                        <li key={approval.id} className="px-4 py-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">
                              {approval.signerName}
                            </span>
                            <span className="text-xs text-slate-500">
                              {formatDate(approval.issuedAt)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {approval.stepName} · {approval.role} · {approval.reason}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
    </ol>
  );
}
