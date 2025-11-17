"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { formatISO } from "date-fns";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useDMS } from "@/components/providers";
import type { DocumentSecurityLevel, DocumentVersion } from "@/types";

const documentSchema = z.object({
  title: z.string().min(3),
  documentNumber: z.string().min(3),
  versionLabel: z.string().min(1),
  changeSummary: z.string().min(5),
  dateCreated: z.string(),
  createdBy: z.string().min(2),
  dateOfIssue: z.string(),
  issuedBy: z.string().min(2),
  issuerRole: z.string().min(2),
  effectiveFrom: z.string(),
  nextIssueDate: z.string(),
  category: z.string().min(2),
  securityLevel: z.enum(["confidential", "internal", "restricted", "public"]),
  typeId: z.string().min(1),
  workflowId: z.string().min(1),
});

const securityLabels: Record<DocumentSecurityLevel, string> = {
  confidential: "Confidential",
  internal: "Internal",
  restricted: "Restricted",
  public: "Public",
};

export function DocumentForm() {
  const router = useRouter();
  const { addDocument, documentTypes, workflows } = useDMS();

  const [formData, setFormData] = useState({
    title: "",
    documentNumber: "",
    versionLabel: "1.0",
    changeSummary: "Initial release",
    dateCreated: formatISO(new Date(), { representation: "date" }),
    createdBy: "",
    dateOfIssue: formatISO(new Date(), { representation: "date" }),
    issuedBy: "",
    issuerRole: "",
    effectiveFrom: formatISO(new Date(), { representation: "date" }),
    nextIssueDate: formatISO(new Date(Date.now() + 15552000000), {
      representation: "date",
    }),
    category: "",
    securityLevel: "internal" as DocumentSecurityLevel,
    typeId: documentTypes[0]?.id ?? "",
    workflowId: workflows.find((wf) => wf.isDefault)?.id ?? workflows[0]?.id ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const workflowOptions = useMemo(() => workflows, [workflows]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = documentSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    const version: DocumentVersion = {
      id: nanoid(),
      versionLabel: formData.versionLabel,
      changeSummary: formData.changeSummary,
      createdBy: formData.createdBy,
      createdOn: new Date().toISOString(),
      effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
      nextReviewOn: new Date(formData.nextIssueDate).toISOString(),
      status: "Draft",
      approvals: [],
    };

    const record = addDocument({
      title: formData.title,
      documentNumber: formData.documentNumber,
      dateCreated: new Date(formData.dateCreated).toISOString(),
      createdBy: formData.createdBy,
      dateOfIssue: new Date(formData.dateOfIssue).toISOString(),
      issuedBy: formData.issuedBy,
      issuerRole: formData.issuerRole,
      effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
      nextIssueDate: new Date(formData.nextIssueDate).toISOString(),
      category: formData.category,
      securityLevel: formData.securityLevel,
      typeId: formData.typeId,
      workflowId: formData.workflowId,
      lifecycleState: "Draft",
      version,
    });

    router.push(`/documents/${record.id}`);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="text-base font-semibold text-slate-700">
              Core Document Details
            </h2>
            <p className="text-sm text-slate-500">
              Capture metadata required for GMP-compliant documentation.
            </p>
          </div>
        </div>
        <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600">
              Title
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter document title"
            />
            {errors.title && (
              <p className="text-xs text-rose-600 mt-1">{errors.title}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">
              Document Number
            </label>
            <input
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleChange}
              placeholder="e.g. SOP-GMP-0042"
            />
            {errors.documentNumber && (
              <p className="text-xs text-rose-600 mt-1">
                {errors.documentNumber}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">
              Category
            </label>
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. Manufacturing"
            />
            {errors.category && (
              <p className="text-xs text-rose-600 mt-1">{errors.category}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">
              Document Type
            </label>
            <select name="typeId" value={formData.typeId} onChange={handleChange}>
              {documentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.type}
                </option>
              ))}
            </select>
            {errors.typeId && (
              <p className="text-xs text-rose-600 mt-1">{errors.typeId}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">
              Security Level
            </label>
            <select
              name="securityLevel"
              value={formData.securityLevel}
              onChange={handleChange}
            >
              {Object.entries(securityLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">
              Workflow
            </label>
            <select
              name="workflowId"
              value={formData.workflowId}
              onChange={handleChange}
            >
              {workflowOptions.map((workflow) => (
                <option key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </option>
              ))}
            </select>
            {errors.workflowId && (
              <p className="text-xs text-rose-600 mt-1">{errors.workflowId}</p>
            )}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="text-base font-semibold text-slate-700">
              Version & Lifecycle
            </h2>
            <p className="text-sm text-slate-500">
              Establish controlled issuance and lifecycle timings.
            </p>
          </div>
        </div>
        <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600">
              Version Label
            </label>
            <input
              name="versionLabel"
              value={formData.versionLabel}
              onChange={handleChange}
            />
            {errors.versionLabel && (
              <p className="text-xs text-rose-600 mt-1">
                {errors.versionLabel}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600">
              Change Summary
            </label>
            <textarea
              name="changeSummary"
              value={formData.changeSummary}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the rationale and scope of this document version"
            />
            {errors.changeSummary && (
              <p className="text-xs text-rose-600 mt-1">
                {errors.changeSummary}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">
              Date Created
            </label>
            <input
              type="date"
              name="dateCreated"
              value={formData.dateCreated}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">
              Date of Issue
            </label>
            <input
              type="date"
              name="dateOfIssue"
              value={formData.dateOfIssue}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">
              Effective From
            </label>
            <input
              type="date"
              name="effectiveFrom"
              value={formData.effectiveFrom}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">
              Date of Next Issue
            </label>
            <input
              type="date"
              name="nextIssueDate"
              value={formData.nextIssueDate}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="text-base font-semibold text-slate-700">
              Responsible Parties
            </h2>
            <p className="text-sm text-slate-500">
              Capture electronic record authorship and issuance information.
            </p>
          </div>
        </div>
        <div className="card-body grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600">
              Created By
            </label>
            <input
              name="createdBy"
              value={formData.createdBy}
              onChange={handleChange}
            />
            {errors.createdBy && (
              <p className="text-xs text-rose-600 mt-1">
                {errors.createdBy}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">
              Issued By
            </label>
            <input
              name="issuedBy"
              value={formData.issuedBy}
              onChange={handleChange}
            />
            {errors.issuedBy && (
              <p className="text-xs text-rose-600 mt-1">{errors.issuedBy}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">
              Issuer Role
            </label>
            <input
              name="issuerRole"
              value={formData.issuerRole}
              onChange={handleChange}
            />
            {errors.issuerRole && (
              <p className="text-xs text-rose-600 mt-1">
                {errors.issuerRole}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <button type="button" className="secondary" onClick={() => router.back()}>
          Cancel
        </button>
        <button type="submit" className="primary">
          Create Controlled Document
        </button>
      </div>
    </form>
  );
}
