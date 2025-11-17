"use client";

import { WorkflowDefinition } from "@/types";

export function WorkflowCard({ workflow }: { workflow: WorkflowDefinition }) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <p className="text-base font-semibold text-slate-700">{workflow.name}</p>
          <p className="text-sm text-slate-500">{workflow.description}</p>
        </div>
        {workflow.isDefault && (
          <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700">
            Default
          </span>
        )}
      </div>
      <div className="card-body">
        <ol className="space-y-3">
          {workflow.steps.map((step, index) => (
            <li key={step.id} className="border border-slate-200 rounded-lg px-4 py-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {index + 1}. {step.name}
                  </p>
                  <p className="text-xs text-slate-500">Role: {step.role}</p>
                </div>
                {step.requiresESignature && (
                  <span className="text-xs uppercase font-semibold text-emerald-600">
                    E-Signature Required
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-2">{step.instructions}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
