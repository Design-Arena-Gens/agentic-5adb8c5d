"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { z } from "zod";
import { useDMS } from "@/components/providers";

const workflowSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  steps: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(3),
        role: z.string().min(3),
        instructions: z.string().min(5),
        requiresESignature: z.boolean(),
      })
    )
    .min(1),
});

export function WorkflowForm() {
  const { addWorkflow } = useDMS();
  const [stepDraft, setStepDraft] = useState({
    name: "",
    role: "",
    instructions: "",
    requiresESignature: true,
  });
  const [steps, setSteps] = useState([
    {
      id: nanoid(),
      name: "Author Review",
      role: "Document Owner",
      instructions: "Review content for accuracy and compliance.",
      requiresESignature: true,
    },
  ]);
  const [workflowDraft, setWorkflowDraft] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<string | null>(null);

  const resetStepDraft = () =>
    setStepDraft({ name: "", role: "", instructions: "", requiresESignature: true });

  const handleAddStep = () => {
    if (!stepDraft.name || !stepDraft.role || !stepDraft.instructions) {
      setErrors("Please complete all step fields before adding.");
      return;
    }

    setSteps((prev) => [
      ...prev,
      {
        id: nanoid(),
        ...stepDraft,
      },
    ]);
    resetStepDraft();
    setErrors(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = workflowSchema.safeParse({
      ...workflowDraft,
      steps,
    });

    if (!payload.success) {
      setErrors("Please review the workflow details and resolve validation errors.");
      return;
    }

    addWorkflow({
      name: workflowDraft.name,
      description: workflowDraft.description,
      steps,
    });

    setWorkflowDraft({ name: "", description: "" });
    setSteps([
      {
        id: nanoid(),
        name: "Author Review",
        role: "Document Owner",
        instructions: "Review content for accuracy and compliance.",
        requiresESignature: true,
      },
    ]);
    setErrors(null);
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((step) => step.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="text-base font-semibold text-slate-700">
              New Workflow Definition
            </h2>
            <p className="text-sm text-slate-500">
              Configure approval steps aligned with QA and regulatory expectations.
            </p>
          </div>
        </div>
        <div className="card-body space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600">
                Workflow Name
              </label>
              <input
                value={workflowDraft.name}
                onChange={(event) =>
                  setWorkflowDraft((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="e.g. Deviation CAPA Release"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">
                Description
              </label>
              <input
                value={workflowDraft.description}
                onChange={(event) =>
                  setWorkflowDraft((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Outline workflow purpose and compliance intent"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-2">
              Approval Steps
            </h3>
            <ol className="space-y-3">
              {steps.map((step, index) => (
                <li key={step.id} className="border border-slate-200 rounded-lg px-4 py-3 bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {index + 1}. {step.name}
                      </p>
                      <p className="text-xs text-slate-500">Role: {step.role}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {step.requiresESignature ? (
                        <span className="text-emerald-600 font-semibold uppercase">
                          E-Sign Required
                        </span>
                      ) : (
                        <span className="text-slate-500 uppercase">Optional Signature</span>
                      )}
                      <button
                        type="button"
                        className="text-rose-600 hover:text-rose-700"
                        onClick={() => removeStep(step.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{step.instructions}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="border border-dashed border-slate-300 rounded-lg p-4 space-y-3 bg-slate-50">
            <h4 className="text-sm font-semibold text-slate-600">Add Step</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                placeholder="Step name"
                value={stepDraft.name}
                onChange={(event) =>
                  setStepDraft((prev) => ({ ...prev, name: event.target.value }))
                }
              />
              <input
                placeholder="Responsible role"
                value={stepDraft.role}
                onChange={(event) =>
                  setStepDraft((prev) => ({ ...prev, role: event.target.value }))
                }
              />
              <input
                className="md:col-span-2"
                placeholder="Instructions"
                value={stepDraft.instructions}
                onChange={(event) =>
                  setStepDraft((prev) => ({
                    ...prev,
                    instructions: event.target.value,
                  }))
                }
              />
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={stepDraft.requiresESignature}
                  onChange={(event) =>
                    setStepDraft((prev) => ({
                      ...prev,
                      requiresESignature: event.target.checked,
                    }))
                  }
                />
                Electronic signature required
              </label>
              <button type="button" className="primary" onClick={handleAddStep}>
                Append Step
              </button>
            </div>
          </div>

          {errors && <p className="text-sm text-rose-600">{errors}</p>}

          <div className="flex items-center justify-end">
            <button type="submit" className="primary">
              Save Workflow
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
