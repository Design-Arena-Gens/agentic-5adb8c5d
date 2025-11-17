"use client";

import { useEffect, useState } from "react";
import { hashSecret } from "@/lib/security";

interface ESignatureDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    signerName: string;
    signerTitle: string;
    signerId: string;
    reason: string;
    passwordHash: string;
  }) => void;
  stepName: string;
  role: string;
}

export function ESignatureDialog({
  open,
  onClose,
  onSubmit,
  stepName,
  role,
}: ESignatureDialogProps) {
  const [state, setState] = useState({
    signerName: "",
    signerTitle: "",
    signerId: "",
    reason: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setState({ signerName: "", signerTitle: "", signerId: "", reason: "", password: "" });
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!state.signerName || !state.signerTitle || !state.signerId || !state.reason || !state.password) {
      setError("All signature fields are required for 21 CFR Part 11 compliance.");
      return;
    }

    const passwordHash = await hashSecret(state.password);

    onSubmit({
      signerName: state.signerName,
      signerTitle: state.signerTitle,
      signerId: state.signerId,
      reason: state.reason,
      passwordHash,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-700">
            Electronic Signature Verification
          </h2>
          <p className="text-xs text-slate-500">
            Step: {stepName} · Role: {role}
          </p>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Signer Name
              </label>
              <input
                value={state.signerName}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, signerName: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Signer Title
              </label>
              <input
                value={state.signerTitle}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, signerTitle: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Unique Identifier
              </label>
              <input
                value={state.signerId}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, signerId: event.target.value }))
                }
                placeholder="Username or employee ID"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Purpose / Reason
              </label>
              <input
                value={state.reason}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, reason: event.target.value }))
                }
                placeholder="Approval, review, verification"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Signature Password
              </label>
              <input
                type="password"
                value={state.password}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="Enter controlled signature password"
              />
            </div>
          </div>
          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
        <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-200">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            Apply Electronic Signature
          </button>
        </div>
      </form>
    </div>
  );
}
