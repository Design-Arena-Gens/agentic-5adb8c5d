"use client";

import Link from "next/link";
import { DocumentForm } from "@/components/document-form";

export default function NewDocumentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Create Controlled Document
          </h1>
          <p className="text-sm text-slate-500">
            Capture regulated metadata and initiate compliant workflows.
          </p>
        </div>
        <Link href="/documents" className="secondary">
          Back to Documents
        </Link>
      </div>
      <DocumentForm />
    </div>
  );
}
