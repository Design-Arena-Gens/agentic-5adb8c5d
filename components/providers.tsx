"use client";

import { ReactNode, createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { nanoid } from "nanoid";
import type {
  ApprovalRecord,
  AuditEntry,
  DMSState,
  DocumentRecord,
  DocumentType,
  DocumentVersion,
  WorkflowDefinition,
} from "@/types";
import { defaultState } from "@/data/defaultState";

interface DMSContextValue extends DMSState {
  addDocument: (doc: Omit<DocumentRecord, "id" | "auditTrail" | "versions" | "documentVersion"> & {
    version: DocumentVersion;
  }) => DocumentRecord;
  updateDocument: (docId: string, updater: (doc: DocumentRecord) => DocumentRecord) => void;
  logAudit: (entry: Omit<AuditEntry, "id" | "timestamp">) => void;
  addWorkflow: (workflow: Omit<WorkflowDefinition, "id">) => WorkflowDefinition;
  addDocumentType: (type: Omit<DocumentType, "id">) => DocumentType;
}

const STORAGE_KEY = "document-management-state";

const DMSContext = createContext<DMSContextValue | null>(null);

type DMSAction =
  | { type: "INITIALIZE"; payload: DMSState }
  | { type: "ADD_DOCUMENT"; payload: DocumentRecord }
  | { type: "UPDATE_DOCUMENT"; payload: DocumentRecord }
  | { type: "LOG_AUDIT"; payload: AuditEntry }
  | { type: "ADD_WORKFLOW"; payload: WorkflowDefinition }
  | { type: "ADD_DOCUMENT_TYPE"; payload: DocumentType };

function reducer(state: DMSState, action: DMSAction): DMSState {
  switch (action.type) {
    case "INITIALIZE":
      return action.payload;
    case "ADD_DOCUMENT":
      return {
        ...state,
        documents: [...state.documents, action.payload],
      };
    case "UPDATE_DOCUMENT":
      return {
        ...state,
        documents: state.documents.map((doc) =>
          doc.id === action.payload.id ? action.payload : doc
        ),
      };
    case "LOG_AUDIT":
      return {
        ...state,
        documents: state.documents.map((doc) =>
          doc.id === action.payload.relatedDocumentId
            ? {
                ...doc,
                auditTrail: [...doc.auditTrail, action.payload],
              }
            : doc
        ),
      };
    case "ADD_WORKFLOW":
      return {
        ...state,
        workflows: [...state.workflows, action.payload],
      };
    case "ADD_DOCUMENT_TYPE":
      return {
        ...state,
        documentTypes: [...state.documentTypes, action.payload],
      };
    default:
      return state;
  }
}

function persistState(state: DMSState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState(): DMSState {
  if (typeof window === "undefined") return defaultState;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState;
  try {
    const parsed = JSON.parse(raw) as DMSState;
    return {
      ...defaultState,
      ...parsed,
    };
  } catch (error) {
    console.error("Failed to parse persisted state", error);
    return defaultState;
  }
}

export function DMSProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState);

  useEffect(() => {
    const initial = loadState();
    dispatch({ type: "INITIALIZE", payload: initial });
  }, []);

  useEffect(() => {
    persistState(state);
  }, [state]);

  const value = useMemo<DMSContextValue>(() => {
    return {
      ...state,
      addDocument: (docInput) => {
        const documentId = nanoid();
        const versionId = docInput.version.id;
        const baseVersion = {
          ...docInput.version,
          id: versionId,
        };

        const newDocument: DocumentRecord = {
          id: documentId,
          title: docInput.title,
          documentNumber: docInput.documentNumber,
          documentVersion: baseVersion.versionLabel,
          dateCreated: docInput.dateCreated,
          createdBy: docInput.createdBy,
          dateOfIssue: docInput.dateOfIssue,
          issuedBy: docInput.issuedBy,
          issuerRole: docInput.issuerRole,
          effectiveFrom: docInput.effectiveFrom,
          nextIssueDate: docInput.nextIssueDate,
          category: docInput.category,
          securityLevel: docInput.securityLevel,
          typeId: docInput.typeId,
          workflowId: docInput.workflowId,
          lifecycleState: baseVersion.status,
          versions: [baseVersion],
          auditTrail: [],
        };

        dispatch({ type: "ADD_DOCUMENT", payload: newDocument });
        dispatch({
          type: "LOG_AUDIT",
          payload: {
            id: nanoid(),
            timestamp: new Date().toISOString(),
            actor: docInput.createdBy,
            action: "Document Created",
            details: `Document ${docInput.documentNumber} created with version ${baseVersion.versionLabel}`,
            relatedDocumentId: documentId,
            relatedVersionId: baseVersion.id,
          },
        });
        return newDocument;
      },
      updateDocument: (docId, updater) => {
        const existing = state.documents.find((doc) => doc.id === docId);
        if (!existing) return;
        const updated = updater(existing);
        dispatch({ type: "UPDATE_DOCUMENT", payload: updated });
      },
      logAudit: (entry) => {
        dispatch({
          type: "LOG_AUDIT",
          payload: {
            ...entry,
            id: nanoid(),
            timestamp: new Date().toISOString(),
          },
        });
      },
      addWorkflow: (workflow) => {
        const newWorkflow: WorkflowDefinition = {
          ...workflow,
          id: nanoid(),
        };
        dispatch({ type: "ADD_WORKFLOW", payload: newWorkflow });
        return newWorkflow;
      },
      addDocumentType: (type) => {
        const newType: DocumentType = {
          ...type,
          id: nanoid(),
        };
        dispatch({ type: "ADD_DOCUMENT_TYPE", payload: newType });
        return newType;
      },
    };
  }, [state]);

  return <DMSContext.Provider value={value}>{children}</DMSContext.Provider>;
}

export function useDMS() {
  const context = useContext(DMSContext);
  if (!context) {
    throw new Error("useDMS must be used within a DMSProvider");
  }
  return context;
}

export function useDocument(docId: string) {
  const { documents } = useDMS();
  return documents.find((doc) => doc.id === docId) ?? null;
}

export function appendVersion(
  doc: DocumentRecord,
  version: DocumentVersion,
  auditEntries: AuditEntry[],
  approvals: ApprovalRecord[] = []
): DocumentRecord {
  return {
    ...doc,
    documentVersion: version.versionLabel,
    lifecycleState: version.status,
    versions: [...doc.versions, { ...version, approvals }],
    auditTrail: [...doc.auditTrail, ...auditEntries],
  };
}
