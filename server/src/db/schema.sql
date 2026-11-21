-- PostgreSQL Schema for Workroom

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  company_name VARCHAR(255),
  phone VARCHAR(100),
  avatar_url TEXT,
  must_reset_password BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(100),
  client_company VARCHAR(255),
  client_id UUID REFERENCES users(id) ON DELETE SET NULL,
  estimated_duration VARCHAR(100),
  start_date DATE,
  development_status VARCHAR(100) DEFAULT 'Planning',
  build_link TEXT,
  invite_token VARCHAR(100) UNIQUE NOT NULL,
  declaration_accepted BOOLEAN DEFAULT FALSE,
  declaration_accepted_at TIMESTAMP WITH TIME ZONE,
  declaration_signee_name VARCHAR(255),
  declaration_terms TEXT,
  budget_total NUMERIC(12, 2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'INR',
  payment_qr_url TEXT,
  bank_name VARCHAR(255),
  bank_account_name VARCHAR(255),
  bank_account_number VARCHAR(100),
  bank_ifsc_swift VARCHAR(100),
  bank_upi_iban VARCHAR(100),
  bank_notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status_snapshot VARCHAR(100),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'invoice', 'budget', 'technical', 'contract', 'other'
  file_url TEXT NOT NULL,
  public_id VARCHAR(255),
  file_type VARCHAR(100),
  file_size BIGINT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  payment_method VARCHAR(100) NOT NULL,
  transaction_reference VARCHAR(255),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'verified', -- 'verified', 'pending', 'rejected'
  receipt_url TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_client_email ON projects(client_email);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_invite_token ON projects(invite_token);
CREATE INDEX IF NOT EXISTS idx_updates_project_id ON project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_project_id ON transactions(project_id);
