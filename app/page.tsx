"use client";

import Link from "next/link";
import { useDMS } from "@/components/providers";
import { formatDate } from "@/lib/formatters";
import { StatusBadge } from "@/components/status-badge";
import { SecurityBadge } from "@/components/security-badge";

export default function Page() {
  const { documents, workflows, documentTypes } = useDMS();

  const totalDocuments = documents.length;
  const effective = documents.filter((doc) => doc.lifecycleState === "Effective").length;
  const restricted = documents.filter((doc) => doc.securityLevel !== "public").length;
  const upcomingReviews = documents.filter((doc) => {
    const reviewDate = new Date(doc.nextIssueDate).getTime();
    return reviewDate - Date.now() < 30 * 24 * 60 * 60 * 1000;
  }).length;

  const recent = documents
    .slice()
    .sort((a, b) => new Date(b.dateOfIssue).getTime() - new Date(a.dateOfIssue).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-body">
            <p className="text-xs uppercase text-slate-500 font-semibold">
              Controlled Documents
            </p>
            <p className="text-3xl font-semibold text-primary-700">{totalDocuments}</p>
            <p className="text-xs text-slate-500">
              Total records across all categories
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-xs uppercase text-slate-500 font-semibold">
              Effective
            </p>
            <p className="text-3xl font-semibold text-emerald-600">{effective}</p>
            <p className="text-xs text-slate-500">Currently released for use</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-xs uppercase text-slate-500 font-semibold">
              Restricted Access
            </p>
            <p className="text-3xl font-semibold text-amber-600">{restricted}</p>
            <p className="text-xs text-slate-500">
              Requires controlled distribution
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-xs uppercase text-slate-500 font-semibold">
              Upcoming Reviews
            </p>
            <p className="text-3xl font-semibold text-rose-600">{upcomingReviews}</p>
            <p className="text-xs text-slate-500">30-day review window</p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="text-base font-semibold text-slate-700">
              Recent Issuances
            </h2>
            <p className="text-sm text-slate-500">
              Documents issued or revised in the last cycle
            </p>
          </div>
          <Link href="/documents" className="text-sm text-primary-600 font-medium">
            View records
          </Link>
        </div>
        <div className="card-body">
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500">No recent document issuances.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {recent.map((doc) => (
                <li key={doc.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{doc.title}</p>
                    <p className="text-xs text-slate-500">
                      {doc.documentNumber} · {formatDate(doc.dateOfIssue)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge state={doc.lifecycleState} />
                    <SecurityBadge level={doc.securityLevel} />
                    <Link
                      href={`/documents/${doc.id}`}
                      className="text-sm text-primary-600 font-medium"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="text-base font-semibold text-slate-700">
                Controlled Document Types
              </h3>
              <p className="text-sm text-slate-500">Maintained taxonomy for ISO 9001 compliance</p>
            </div>
          </div>
          <div className="card-body space-y-3">
            {documentTypes.map((type) => (
              <div key={type.id} className="border border-slate-200 rounded-lg px-4 py-3">
                <p className="text-sm font-semibold text-slate-700">{type.type}</p>
                <p className="text-xs text-slate-500">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="text-base font-semibold text-slate-700">Active Workflows</h3>
              <p className="text-sm text-slate-500">
                Automated approval paths supporting GMP and ICH Q7
              </p>
            </div>
          </div>
          <div className="card-body space-y-3">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="border border-slate-200 rounded-lg px-4 py-3">
                <p className="text-sm font-semibold text-slate-700">{workflow.name}</p>
                <p className="text-xs text-slate-500">
                  {workflow.steps.length} steps · {workflow.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
