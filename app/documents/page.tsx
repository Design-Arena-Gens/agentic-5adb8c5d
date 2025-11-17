"use client";

import { DocumentTable } from "@/components/document-table";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Controlled Documents
        </h1>
        <p className="text-sm text-slate-500">
          Maintain GMP-compliant document records with lifecycle visibility and
          audit readiness.
        </p>
      </div>
      <DocumentTable />
    </div>
  );
}
