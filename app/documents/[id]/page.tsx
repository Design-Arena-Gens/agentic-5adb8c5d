"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { nanoid } from "nanoid";
import { formatISO } from "date-fns";
import { useDMS, useDocument, appendVersion } from "@/components/providers";
import { StatusBadge } from "@/components/status-badge";
import { SecurityBadge } from "@/components/security-badge";
import { AuditTrail } from "@/components/audit-trail";
import { VersionTimeline } from "@/components/version-timeline";
import { ESignatureDialog } from "@/components/e-signature-dialog";
import { formatDate } from "@/lib/formatters";
import type { DocumentVersion } from "@/types";

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params?.id as string;
  const document = useDocument(documentId);
  const { workflows, updateDocument } = useDMS();

  const workflow = useMemo(
    () => workflows.find((wf) => wf.id === document?.workflowId) ?? null,
    [workflows, document]
  );

  const [signatureStepId, setSignatureStepId] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [newVersionDraft, setNewVersionDraft] = useState({
    versionLabel: "",
    changeSummary: "",
    effectiveFrom: formatISO(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), {
      representation: "date",
    }),
    nextReviewOn: formatISO(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), {
      representation: "date",
    }),
  });

  if (!document) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-500">Document not found or may have been archived.</p>
        <Link href="/documents" className="secondary">
          Back to documents
        </Link>
      </div>
    );
  }

  const latestVersion = document.versions[document.versions.length - 1];
  const approvals = latestVersion.approvals;
  const completedStepIds = approvals.map((approval) => approval.stepId);
  const nextStep = workflow?.steps.find((step) => !completedStepIds.includes(step.id)) ?? null;

  const openSignature = (stepId: string) => {
    setSignatureStepId(stepId);
    setShowSignature(true);
  };

  const handleSignature = (payload: {
    signerName: string;
    signerTitle: string;
    signerId: string;
    reason: string;
    passwordHash: string;
  }) => {
    if (!workflow || !signatureStepId) return;
    const step = workflow.steps.find((s) => s.id === signatureStepId);
    if (!step) return;

    updateDocument(document.id, (doc) => {
      const versionToUpdate = doc.versions.find((version) => version.id === latestVersion.id);
      if (!versionToUpdate) return doc;

      const updatedApprovals = [
        ...versionToUpdate.approvals,
        {
          id: nanoid(),
          stepId: step.id,
          stepName: step.name,
          role: step.role,
          signerName: payload.signerName,
          signerTitle: payload.signerTitle,
          signerId: payload.signerId,
          reason: payload.reason,
          passwordHash: payload.passwordHash,
          issuedAt: new Date().toISOString(),
        },
      ];

      const allStepsCompleted = updatedApprovals.length === (workflow?.steps.length ?? 0);
      const newStatus = allStepsCompleted ? "Approved" : "Under Review";

      const updatedVersion: DocumentVersion = {
        ...versionToUpdate,
        approvals: updatedApprovals,
        status: newStatus,
      };

      const auditDetail = `${step.name} signed by ${payload.signerName} (${payload.signerId})`;

      const updatedDoc: typeof doc = {
        ...doc,
        lifecycleState: allStepsCompleted ? "Approved" : "Under Review",
        versions: doc.versions.map((version) =>
          version.id === updatedVersion.id ? updatedVersion : version
        ),
        auditTrail: [
          ...doc.auditTrail,
          {
            id: nanoid(),
            timestamp: new Date().toISOString(),
            actor: payload.signerName,
            action: `Electronic Signature - ${step.name}`,
            details: auditDetail,
            relatedDocumentId: doc.id,
            relatedVersionId: updatedVersion.id,
          },
        ],
      };

      return updatedDoc;
    });

  };

  const sendToReview = () => {
    updateDocument(document.id, (doc) => {
      if (doc.lifecycleState !== "Draft") return doc;
      const auditRecord = {
        id: nanoid(),
        timestamp: new Date().toISOString(),
        actor: doc.createdBy,
        action: "Lifecycle Status Update",
        details: "Document progressed to Under Review",
        relatedDocumentId: doc.id,
        relatedVersionId: latestVersion.id,
      };
      return {
        ...doc,
        lifecycleState: "Under Review",
        versions: doc.versions.map((version) =>
          version.id === latestVersion.id ? { ...version, status: "Under Review" } : version
        ),
        auditTrail: [...doc.auditTrail, auditRecord],
      };
    });
  };

  const markEffective = () => {
    updateDocument(document.id, (doc) => {
      if (doc.lifecycleState !== "Approved") return doc;
      const auditRecord = {
        id: nanoid(),
        timestamp: new Date().toISOString(),
        actor: "Quality Unit",
        action: "Lifecycle Status Update",
        details: "Document marked as Effective and released for GMP use",
        relatedDocumentId: doc.id,
        relatedVersionId: latestVersion.id,
      };
      return {
        ...doc,
        lifecycleState: "Effective",
        versions: doc.versions.map((version) =>
          version.id === latestVersion.id ? { ...version, status: "Effective" } : version
        ),
        auditTrail: [...doc.auditTrail, auditRecord],
      };
    });
  };

  const renderActionButtons = () => {
    if (document.lifecycleState === "Draft") {
      return (
        <button className="primary" onClick={sendToReview}>
          Submit for Review
        </button>
      );
    }

    if (document.lifecycleState === "Under Review" && nextStep) {
      return (
        <button className="primary" onClick={() => openSignature(nextStep.id)}>
          Complete Step: {nextStep.name}
        </button>
      );
    }

    if (document.lifecycleState === "Approved") {
      return (
        <div className="flex gap-3">
          <button className="primary" onClick={markEffective}>
            Release as Effective
          </button>
        </div>
      );
    }

    return null;
  };

  const handleNewVersion = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newVersionDraft.versionLabel || !newVersionDraft.changeSummary) {
      return;
    }
    const newVersion: DocumentVersion = {
      id: nanoid(),
      versionLabel: newVersionDraft.versionLabel,
      changeSummary: newVersionDraft.changeSummary,
      createdBy: document.createdBy,
      createdOn: new Date().toISOString(),
      effectiveFrom: new Date(newVersionDraft.effectiveFrom).toISOString(),
      nextReviewOn: new Date(newVersionDraft.nextReviewOn).toISOString(),
      status: "Draft",
      approvals: [],
    };

    const auditEntries = [
      {
        id: nanoid(),
        timestamp: new Date().toISOString(),
        actor: document.createdBy,
        action: "New Version Drafted",
        details: `Version ${newVersion.versionLabel} created with summary: ${newVersion.changeSummary}`,
        relatedDocumentId: document.id,
        relatedVersionId: newVersion.id,
      },
    ];

    updateDocument(document.id, (doc) =>
      appendVersion(doc, newVersion, auditEntries)
    );

    setNewVersionDraft({
      versionLabel: "",
      changeSummary: "",
      effectiveFrom: formatISO(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), {
        representation: "date",
      }),
      nextReviewOn: formatISO(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), {
        representation: "date",
      }),
    });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-800">{document.title}</h1>
            <StatusBadge state={document.lifecycleState} />
            <SecurityBadge level={document.securityLevel} />
          </div>
          <p className="text-sm text-slate-500">
            Document Number: {document.documentNumber} · Current Version {document.documentVersion}
          </p>
          <p className="text-xs text-slate-500">
            Created by {document.createdBy} on {formatDate(document.dateCreated)} · Issued by {document.issuedBy} ({document.issuerRole})
          </p>
        </div>
        <Link href="/documents" className="secondary">
          Back to Documents
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="text-base font-semibold text-slate-700">Lifecycle & Workflow</h2>
            <p className="text-sm text-slate-500">
              {workflow ? workflow.name : "No workflow assigned"}
            </p>
          </div>
          {renderActionButtons()}
        </div>
        <div className="card-body">
          {workflow ? (
            <ol className="space-y-4">
              {workflow.steps.map((step, index) => {
                const isCompleted = completedStepIds.includes(step.id);
                return (
                  <li
                    key={step.id}
                    className="border border-slate-200 rounded-lg px-4 py-3 bg-white flex items-start justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Step {index + 1}: {step.name}
                      </p>
                      <p className="text-xs text-slate-500">Responsible role: {step.role}</p>
                      <p className="text-xs text-slate-500">{step.instructions}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-xs">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 font-semibold uppercase ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isCompleted ? "Completed" : "Pending"}
                      </span>
                      {step.requiresESignature && !isCompleted && document.lifecycleState !== "Draft" && (
                        <button
                          className="primary text-xs"
                          onClick={() => openSignature(step.id)}
                        >
                          Apply E-Signature
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="text-sm text-slate-500">
              Assign a workflow to enforce review and approval requirements.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="text-base font-semibold text-slate-700">Version History</h2>
                <p className="text-sm text-slate-500">
                  Complete, immutable log of issued document versions and e-signatures.
                </p>
              </div>
            </div>
            <div className="card-body">
              <VersionTimeline versions={document.versions} />
            </div>
          </div>
        </div>
        <div>
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="text-base font-semibold text-slate-700">Metadata</h2>
                <p className="text-sm text-slate-500">Regulated attributes for audit readiness.</p>
              </div>
            </div>
            <div className="card-body text-sm text-slate-600 space-y-2">
              <p>Category: {document.category}</p>
              <p>Type ID: {document.typeId}</p>
              <p>Effective From: {formatDate(document.effectiveFrom)}</p>
              <p>Next Issue: {formatDate(document.nextIssueDate)}</p>
              <p>Issued By: {document.issuedBy}</p>
              <p>Issuer Role: {document.issuerRole}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="text-base font-semibold text-slate-700">Audit Trail</h2>
              <p className="text-sm text-slate-500">
                Immutable chronicle of actions per 21 CFR Part 11.
              </p>
            </div>
          </div>
          <div className="card-body">
            <AuditTrail entries={document.auditTrail} />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="text-base font-semibold text-slate-700">Draft New Version</h2>
              <p className="text-sm text-slate-500">
                Initiate controlled changes with traceable rationale.
              </p>
            </div>
          </div>
          <div className="card-body">
            <form className="space-y-4" onSubmit={handleNewVersion}>
              <div>
                <label className="block text-sm font-medium text-slate-600">
                  Version Label
                </label>
                <input
                  value={newVersionDraft.versionLabel}
                  onChange={(event) =>
                    setNewVersionDraft((prev) => ({
                      ...prev,
                      versionLabel: event.target.value,
                    }))
                  }
                  placeholder="e.g. 1.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">
                  Change Summary
                </label>
                <textarea
                  value={newVersionDraft.changeSummary}
                  onChange={(event) =>
                    setNewVersionDraft((prev) => ({
                      ...prev,
                      changeSummary: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Describe impact, validation updates, and training needs"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600">
                    Effective From
                  </label>
                  <input
                    type="date"
                    value={newVersionDraft.effectiveFrom}
                    onChange={(event) =>
                      setNewVersionDraft((prev) => ({
                        ...prev,
                        effectiveFrom: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">
                    Next Review
                  </label>
                  <input
                    type="date"
                    value={newVersionDraft.nextReviewOn}
                    onChange={(event) =>
                      setNewVersionDraft((prev) => ({
                        ...prev,
                        nextReviewOn: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button className="primary" type="submit">
                  Draft Revision
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ESignatureDialog
        open={showSignature}
        onClose={() => setShowSignature(false)}
        stepName={workflow?.steps.find((step) => step.id === signatureStepId)?.name ?? ""}
        role={workflow?.steps.find((step) => step.id === signatureStepId)?.role ?? ""}
        onSubmit={handleSignature}
      />
    </div>
  );
}
