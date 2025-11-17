export type DocumentSecurityLevel =
  | "confidential"
  | "internal"
  | "restricted"
  | "public";

export type DocumentLifecycleState =
  | "Draft"
  | "Under Review"
  | "Pending Approval"
  | "Approved"
  | "Effective"
  | "Obsolete";

export interface DocumentType {
  id: string;
  type: string;
  description: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  role: string;
  instructions: string;
  requiresESignature: boolean;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  isDefault?: boolean;
}

export interface SignaturePayload {
  signerName: string;
  signerTitle: string;
  signerId: string;
  reason: string;
  passwordHash: string;
  issuedAt: string;
}

export interface ApprovalRecord extends SignaturePayload {
  id: string;
  stepId: string;
  stepName: string;
  role: string;
}

export interface DocumentVersion {
  id: string;
  versionLabel: string;
  changeSummary: string;
  createdBy: string;
  createdOn: string;
  effectiveFrom: string;
  nextReviewOn: string;
  status: DocumentLifecycleState;
  approvals: ApprovalRecord[];
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  relatedDocumentId?: string;
  relatedVersionId?: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  documentNumber: string;
  documentVersion: string;
  dateCreated: string;
  createdBy: string;
  dateOfIssue: string;
  issuedBy: string;
  issuerRole: string;
  effectiveFrom: string;
  nextIssueDate: string;
  category: string;
  securityLevel: DocumentSecurityLevel;
  typeId: string;
  workflowId: string;
  lifecycleState: DocumentLifecycleState;
  versions: DocumentVersion[];
  auditTrail: AuditEntry[];
}

export interface DMSState {
  documentTypes: DocumentType[];
  workflows: WorkflowDefinition[];
  documents: DocumentRecord[];
}
