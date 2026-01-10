-- AngebotsAgent Initial Schema
-- Creates all tables, enums, and relationships for the MVP

-- ============ CUSTOM ENUM TYPES ============

-- Trade types for construction subcontractors
CREATE TYPE trade_type AS ENUM (
  'trockenbau',    -- Drywall
  'estrich',       -- Screed
  'abdichtung',    -- Waterproofing
  'bodenleger',    -- Flooring
  'maler',         -- Painting
  'fliesen',       -- Tiling
  'sonstige'       -- Other
);

-- Document types
CREATE TYPE document_type AS ENUM (
  'leistungsverzeichnis',  -- Bill of quantities
  'baubeschreibung',       -- Building description
  'grundriss',             -- Floor plan
  'schnitt',               -- Section drawing
  'ansicht',               -- Elevation
  'detail',                -- Detail drawing
  'vertrag',               -- Contract
  'sonstige'               -- Other
);

-- Document processing status
CREATE TYPE document_status AS ENUM (
  'uploaded',
  'processing',
  'extracted',
  'reviewed',
  'failed'
);

-- Takeoff source
CREATE TYPE takeoff_source AS ENUM (
  'extracted',     -- AI-extracted from LV
  'measured',      -- User measured from plan
  'manual',        -- Manually entered
  'imported'       -- Imported from external
);

-- Risk flag severity
CREATE TYPE risk_severity AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- Risk flag category (Nachtragspotenziale)
CREATE TYPE risk_category AS ENUM (
  'mengenabweichung',      -- Quantity deviation
  'leistungsaenderung',    -- Scope change
  'bauablaufstoerung',     -- Construction delay
  'mangelhafte_planung',   -- Insufficient planning
  'unklare_abgrenzung',    -- Unclear scope boundary
  'fehlende_position',     -- Missing line item
  'normabweichung',        -- Deviation from standards
  'sonstige'               -- Other
);

-- Offer status
CREATE TYPE offer_status AS ENUM (
  'draft',
  'in_review',
  'submitted',
  'won',
  'lost',
  'cancelled'
);

-- Unit types
CREATE TYPE unit_type AS ENUM (
  'm',        -- Meter
  'm2',       -- Square meter
  'm3',       -- Cubic meter
  'stk',      -- Piece
  'kg',       -- Kilogram
  't',        -- Ton
  'l',        -- Liter
  'h',        -- Hour
  'psch'      -- Lump sum
);

-- Export formats
CREATE TYPE export_format AS ENUM (
  'excel',
  'pdf',
  'json',
  'gaeb'
);

-- Company member roles
CREATE TYPE company_role AS ENUM (
  'owner',
  'admin',
  'member',
  'viewer'
);

-- ============ TABLES ============

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trade trade_type NOT NULL DEFAULT 'sonstige',

  -- Contact info
  street TEXT,
  zip_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'Deutschland',
  phone TEXT,
  email TEXT,
  website TEXT,

  -- Tax & legal
  tax_id TEXT,
  vat_id TEXT,
  commercial_register TEXT,

  -- Default pricing settings
  default_markup_percent DECIMAL(5,2) DEFAULT 15.00,
  default_risk_percent DECIMAL(5,2) DEFAULT 3.00,
  default_overhead_percent DECIMAL(5,2) DEFAULT 10.00,

  -- Branding
  logo_path TEXT,

  -- Templates (JSON for flexibility)
  offer_template JSONB DEFAULT '{}',
  invoice_template JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Company Members
CREATE TABLE company_members (
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

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  project_number TEXT,
  description TEXT,

  -- Client info
  client_name TEXT NOT NULL,
  client_contact TEXT,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,

  -- Location
  site_street TEXT,
  site_zip_code TEXT,
  site_city TEXT,
  site_country TEXT DEFAULT 'Deutschland',

  -- Timeline
  submission_deadline TIMESTAMPTZ,
  start_date DATE,
  end_date DATE,

  -- Status
  status offer_status NOT NULL DEFAULT 'draft',

  -- Financial summary
  total_net DECIMAL(12,2) DEFAULT 0,
  total_gross DECIMAL(12,2) DEFAULT 0,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Documents
CREATE TABLE documents (
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

-- Extracted Data
CREATE TABLE extracted_data (
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

-- Takeoff Results
CREATE TABLE takeoff_results (
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

-- Price Library
CREATE TABLE price_library (
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

-- Offer Drafts
CREATE TABLE offer_drafts (
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

-- Offer Line Items
CREATE TABLE offer_line_items (
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

-- Risk Flags (Nachtragspotenziale)
CREATE TABLE risk_flags (
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

-- Export Bundles
CREATE TABLE export_bundles (
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

CREATE INDEX idx_companies_trade ON companies(trade);
CREATE INDEX idx_companies_created_by ON companies(created_by);

CREATE INDEX idx_company_members_user ON company_members(user_id);
CREATE INDEX idx_company_members_company ON company_members(company_id);

CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_deadline ON projects(submission_deadline);

CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(status);

CREATE INDEX idx_extracted_data_document ON extracted_data(document_id);
CREATE INDEX idx_extracted_data_project ON extracted_data(project_id);

CREATE INDEX idx_takeoff_project ON takeoff_results(project_id);
CREATE INDEX idx_takeoff_source ON takeoff_results(source);

CREATE INDEX idx_price_library_company ON price_library(company_id);
CREATE INDEX idx_price_library_trade ON price_library(trade);

CREATE INDEX idx_offer_drafts_project ON offer_drafts(project_id);
CREATE INDEX idx_offer_drafts_status ON offer_drafts(status);

CREATE INDEX idx_offer_items_draft ON offer_line_items(offer_draft_id);

CREATE INDEX idx_risk_flags_project ON risk_flags(project_id);
CREATE INDEX idx_risk_flags_severity ON risk_flags(severity);

CREATE INDEX idx_export_bundles_project ON export_bundles(project_id);

-- ============ TRIGGERS ============

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON company_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON extracted_data FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON takeoff_results FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON price_library FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON offer_drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON offer_line_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON risk_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at();
