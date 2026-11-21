export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company_name?: string;
  phone?: string;
  avatar_url?: string;
  must_reset_password?: boolean;
  created_at: string;
}

export type DevelopmentStatus =
  | 'Planning'
  | 'Requirements Approved'
  | 'Development Started'
  | 'In Progress'
  | 'Alpha Build Ready'
  | 'Testing & QA'
  | 'Ready for Launch'
  | 'Completed'
  | 'On Hold';

export interface Project {
  id: string;
  name: string;
  category: string;
  client_email: string;
  client_phone?: string;
  client_company?: string;
  client_id?: string;
  estimated_duration?: string;
  start_date?: string;
  development_status: DevelopmentStatus;
  build_link?: string;
  invite_token: string;
  declaration_accepted: boolean;
  declaration_accepted_at?: string;
  declaration_signee_name?: string;
  declaration_terms?: string;
  budget_total: number;
  currency: string;
  payment_qr_url?: string;
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_ifsc_swift?: string;
  bank_upi_iban?: string;
  bank_notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  total_paid?: number;
  updates_count?: number;
  documents_count?: number;
  transactions_count?: number;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  title: string;
  content: string;
  status_snapshot?: string;
  author_name?: string;
  author_role?: string;
  created_at: string;
}

export type DocumentCategory = 'invoice' | 'budget' | 'technical' | 'contract' | 'other';

export interface ProjectDocument {
  id: string;
  project_id: string;
  title: string;
  category: DocumentCategory;
  file_url: string;
  public_id?: string;
  file_type?: string;
  file_size?: number;
  uploader_name?: string;
  created_at: string;
}

export type TransactionStatus = 'verified' | 'pending' | 'rejected';

export interface Transaction {
  id: string;
  project_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_reference?: string;
  payment_date: string;
  status: TransactionStatus;
  receipt_url?: string;
  notes?: string;
  recorder_name?: string;
  created_at: string;
}

export interface FinancialSummary {
  budget_total: number;
  total_paid: number;
  balance_due: number;
  currency: string;
}

export interface WorkspaceData {
  project: Project;
  updates: ProjectUpdate[];
  documents: ProjectDocument[];
  transactions: Transaction[];
  financials: FinancialSummary;
}
