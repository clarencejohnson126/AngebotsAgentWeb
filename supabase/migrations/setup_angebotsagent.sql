-- AngebotsAgent Schema Setup for SnapPlan Project
-- Run this in Supabase SQL Editor

-- ============ CUSTOM ENUM TYPES ============

DO $$ BEGIN
  CREATE TYPE trade_type AS ENUM (
    'trockenbau', 'estrich', 'abdichtung', 'bodenleger', 'maler', 'fliesen', 'sonstige'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE document_type AS ENUM (
    'leistungsverzeichnis', 'baubeschreibung', 'grundriss', 'schnitt', 'ansicht', 'detail', 'vertrag', 'sonstige'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE document_status AS ENUM (
    'uploaded', 'processing', 'extracted', 'reviewed', 'failed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE takeoff_source AS ENUM (
    'extracted', 'measured', 'manual', 'imported'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_severity AS ENUM (
    'low', 'medium', 'high', 'critical'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_category AS ENUM (
    'mengenabweichung', 'leistungsaenderung', 'bauablaufstoerung', 'mangelhafte_planung',
    'unklare_abgrenzung', 'fehlende_position', 'normabweichung', 'sonstige'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE offer_status AS ENUM (
    'draft', 'in_review', 'submitted', 'won', 'lost', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE unit_type AS ENUM (
    'm', 'm2', 'm3', 'stk', 'kg', 't', 'l', 'h', 'psch'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE export_format AS ENUM (
    'excel', 'pdf', 'json', 'gaeb'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE company_role AS ENUM (
    'owner', 'admin', 'member', 'viewer'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============ COMPANIES TABLE ============

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trade trade_type NOT NULL DEFAULT 'sonstige',
  street TEXT,
  zip_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'Deutschland',
  phone TEXT,
  email TEXT,
  website TEXT,
  tax_id TEXT,
  vat_id TEXT,
  commercial_register TEXT,
  default_markup_percent DECIMAL(5,2) DEFAULT 15.00,
  default_risk_percent DECIMAL(5,2) DEFAULT 3.00,
  default_overhead_percent DECIMAL(5,2) DEFAULT 10.00,
  logo_path TEXT,
  offer_template JSONB DEFAULT '{}',
  invoice_template JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============ COMPANY MEMBERS TABLE ============

CREATE TABLE IF NOT EXISTS company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role company_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- ============ EXTEND EXISTING PROJECTS TABLE ============

-- Add missing columns to existing projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_number TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_contact TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_phone TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_address TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS site_street TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS site_zip_code TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS site_city TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS site_country TEXT DEFAULT 'Deutschland';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS submission_deadline TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status offer_status DEFAULT 'draft';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS total_net DECIMAL(12,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS total_gross DECIMAL(12,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- ============ DOCUMENTS TABLE ============

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  document_type document_type NOT NULL DEFAULT 'sonstige',
  status document_status NOT NULL DEFAULT 'uploaded',
  page_count INTEGER,
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  processing_error TEXT,
  scale TEXT,
  drawing_number TEXT,
  revision TEXT,
  extraction_summary JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- ============ EXTRACTED DATA TABLE ============

CREATE TABLE IF NOT EXISTS extracted_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  position_number TEXT,
  oz_number TEXT,
  title TEXT,
  description TEXT,
  long_text TEXT,
  quantity DECIMAL(12,3),
  unit unit_type,
  page_number INTEGER,
  page_reference TEXT,
  bounding_box JSONB,
  extraction_confidence DECIMAL(3,2),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  raw_extraction JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ TAKEOFF RESULTS TABLE ============

CREATE TABLE IF NOT EXISTS takeoff_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  extracted_data_id UUID REFERENCES extracted_data(id) ON DELETE SET NULL,
  position_number TEXT,
  description TEXT NOT NULL,
  quantity DECIMAL(12,3) NOT NULL,
  unit unit_type NOT NULL,
  source takeoff_source NOT NULL DEFAULT 'manual',
  measurement_data JSONB DEFAULT '{}',
  plan_page INTEGER,
  plan_zone TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============ PRICE LIBRARY TABLE ============

CREATE TABLE IF NOT EXISTS price_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  item_code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  subcategory TEXT,
  trade trade_type,
  unit unit_type NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  material_cost DECIMAL(10,2),
  labor_cost DECIMAL(10,2),
  equipment_cost DECIMAL(10,2),
  other_cost DECIMAL(10,2),
  labor_hours DECIMAL(6,2),
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============ OFFER DRAFTS TABLE ============

CREATE TABLE IF NOT EXISTS offer_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  is_current BOOLEAN DEFAULT TRUE,
  parent_version_id UUID REFERENCES offer_drafts(id),
  title TEXT NOT NULL,
  offer_number TEXT,
  offer_date DATE DEFAULT CURRENT_DATE,
  validity_days INTEGER DEFAULT 30,
  markup_percent DECIMAL(5,2) DEFAULT 15.00,
  risk_percent DECIMAL(5,2) DEFAULT 3.00,
  overhead_percent DECIMAL(5,2) DEFAULT 10.00,
  discount_percent DECIMAL(5,2) DEFAULT 0.00,
  subtotal_net DECIMAL(12,2) DEFAULT 0,
  markup_amount DECIMAL(12,2) DEFAULT 0,
  risk_amount DECIMAL(12,2) DEFAULT 0,
  overhead_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_net DECIMAL(12,2) DEFAULT 0,
  vat_percent DECIMAL(4,2) DEFAULT 19.00,
  vat_amount DECIMAL(12,2) DEFAULT 0,
  total_gross DECIMAL(12,2) DEFAULT 0,
  cover_text TEXT,
  terms_and_conditions TEXT,
  notes TEXT,
  status offer_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============ OFFER LINE ITEMS TABLE ============

CREATE TABLE IF NOT EXISTS offer_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_draft_id UUID NOT NULL REFERENCES offer_drafts(id) ON DELETE CASCADE,
  position_number TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT,
  long_text TEXT,
  quantity DECIMAL(12,3) NOT NULL,
  unit unit_type NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  takeoff_result_id UUID REFERENCES takeoff_results(id) ON DELETE SET NULL,
  price_library_id UUID REFERENCES price_library(id) ON DELETE SET NULL,
  extracted_data_id UUID REFERENCES extracted_data(id) ON DELETE SET NULL,
  item_markup_percent DECIMAL(5,2),
  item_discount_percent DECIMAL(5,2),
  is_optional BOOLEAN DEFAULT FALSE,
  is_alternative BOOLEAN DEFAULT FALSE,
  parent_item_id UUID REFERENCES offer_line_items(id),
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ RISK FLAGS TABLE ============

CREATE TABLE IF NOT EXISTS risk_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  extracted_data_id UUID REFERENCES extracted_data(id) ON DELETE SET NULL,
  offer_line_item_id UUID REFERENCES offer_line_items(id) ON DELETE SET NULL,
  takeoff_result_id UUID REFERENCES takeoff_results(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category risk_category NOT NULL,
  severity risk_severity NOT NULL DEFAULT 'medium',
  source_reference TEXT,
  page_reference TEXT,
  estimated_impact_min DECIMAL(12,2),
  estimated_impact_max DECIMAL(12,2),
  detection_method TEXT,
  confidence DECIMAL(3,2),
  ai_reasoning TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============ EXPORT BUNDLES TABLE ============

CREATE TABLE IF NOT EXISTS export_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  offer_draft_id UUID REFERENCES offer_drafts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  format export_format NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  included_sections JSONB DEFAULT '{}',
  export_options JSONB DEFAULT '{}',
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============ INDEXES ============

CREATE INDEX IF NOT EXISTS idx_companies_trade ON companies(trade);
CREATE INDEX IF NOT EXISTS idx_company_members_user ON company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_company_members_company ON company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_extracted_data_document ON extracted_data(document_id);
CREATE INDEX IF NOT EXISTS idx_takeoff_project ON takeoff_results(project_id);
CREATE INDEX IF NOT EXISTS idx_price_library_company ON price_library(company_id);
CREATE INDEX IF NOT EXISTS idx_offer_drafts_project ON offer_drafts(project_id);
CREATE INDEX IF NOT EXISTS idx_risk_flags_project ON risk_flags(project_id);
CREATE INDEX IF NOT EXISTS idx_export_bundles_project ON export_bundles(project_id);

-- ============ UPDATE TIMESTAMP TRIGGER ============

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS set_updated_at ON companies;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON company_members;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON company_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON projects;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON documents;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON extracted_data;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON extracted_data FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON takeoff_results;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON takeoff_results FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON price_library;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON price_library FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON offer_drafts;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON offer_drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON offer_line_items;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON offer_line_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON risk_flags;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON risk_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============ SUCCESS MESSAGE ============
SELECT 'AngebotsAgent schema setup complete!' as message;
