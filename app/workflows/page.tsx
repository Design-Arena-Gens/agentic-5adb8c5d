"use client";

import { WorkflowCard } from "@/components/workflow-card";
import { WorkflowForm } from "@/components/workflow-form";
import { useDMS } from "@/components/providers";

export default function WorkflowsPage() {
  const { workflows } = useDMS();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Workflows</h1>
        <p className="text-sm text-slate-500">
          Configure compliant approval paths with enforced electronic signatures.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <WorkflowCard workflow={workflow} key={workflow.id} />
          ))}
        </div>
        <WorkflowForm />
      </div>
    </div>
  );
}
