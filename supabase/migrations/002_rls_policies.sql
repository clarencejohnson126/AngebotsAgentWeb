-- AngebotsAgent RLS Policies
-- Row Level Security for multi-tenant data isolation

-- ============ ENABLE RLS ============

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE takeoff_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_bundles ENABLE ROW LEVEL SECURITY;

-- ============ HELPER FUNCTIONS ============

-- Check if user is member of company
CREATE OR REPLACE FUNCTION is_company_member(company_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = company_uuid
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has specific role in company
CREATE OR REPLACE FUNCTION has_company_role(company_uuid UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = company_uuid
    AND user_id = auth.uid()
    AND role::TEXT = ANY(
      CASE required_role
        WHEN 'viewer' THEN ARRAY['owner', 'admin', 'member', 'viewer']
        WHEN 'member' THEN ARRAY['owner', 'admin', 'member']
        WHEN 'admin' THEN ARRAY['owner', 'admin']
        WHEN 'owner' THEN ARRAY['owner']
      END
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============ COMPANIES POLICIES ============

CREATE POLICY "Users can view their companies"
  ON companies FOR SELECT
  USING (is_company_member(id));

CREATE POLICY "Admins can update company"
  ON companies FOR UPDATE
  USING (has_company_role(id, 'admin'));

CREATE POLICY "Anyone authenticated can create company"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners can delete company"
  ON companies FOR DELETE
  USING (has_company_role(id, 'owner'));

-- ============ COMPANY_MEMBERS POLICIES ============

CREATE POLICY "View members of own companies"
  ON company_members FOR SELECT
  USING (is_company_member(company_id));

CREATE POLICY "Admins can add members"
  ON company_members FOR INSERT
  WITH CHECK (
    has_company_role(company_id, 'admin')
    OR (auth.uid() = user_id AND NOT EXISTS (
      SELECT 1 FROM company_members WHERE company_id = company_members.company_id
    ))
  );

CREATE POLICY "Admins can update members"
  ON company_members FOR UPDATE
  USING (has_company_role(company_id, 'admin'));

CREATE POLICY "Admins can remove members"
  ON company_members FOR DELETE
  USING (has_company_role(company_id, 'admin'));

-- ============ PROJECTS POLICIES ============

CREATE POLICY "View projects of own companies"
  ON projects FOR SELECT
  USING (is_company_member(company_id));

CREATE POLICY "Members can create projects"
  ON projects FOR INSERT
  WITH CHECK (has_company_role(company_id, 'member'));

CREATE POLICY "Members can update projects"
  ON projects FOR UPDATE
  USING (has_company_role(company_id, 'member'));

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (has_company_role(company_id, 'admin'));

-- ============ DOCUMENTS POLICIES ============

CREATE POLICY "View documents of own projects"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = documents.project_id
      AND is_company_member(p.company_id)
    )
  );

CREATE POLICY "Members can upload documents"
  ON documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id
      AND has_company_role(p.company_id, 'member')
    )
  );

CREATE POLICY "Members can update documents"
  ON documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = documents.project_id
      AND has_company_role(p.company_id, 'member')
    )
  );

CREATE POLICY "Members can delete documents"
  ON documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = documents.project_id
      AND has_company_role(p.company_id, 'member')
    )
  );

-- ============ EXTRACTED_DATA POLICIES ============

CREATE POLICY "View extracted data of own projects"
  ON extracted_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = extracted_data.project_id
      AND is_company_member(p.company_id)
    )
  );

CREATE POLICY "Insert extracted data"
  ON extracted_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id
      AND is_company_member(p.company_id)
    )
  );

CREATE POLICY "Update extracted data"
  ON extracted_data FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = extracted_data.project_id
      AND has_company_role(p.company_id, 'member')
    )
  );

-- ============ TAKEOFF_RESULTS POLICIES ============

CREATE POLICY "View takeoffs of own projects"
  ON takeoff_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = takeoff_results.project_id
      AND is_company_member(p.company_id)
    )
  );

CREATE POLICY "Members can create takeoffs"
  ON takeoff_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id
      AND has_company_role(p.company_id, 'member')
    )
  );

CREATE POLICY "Members can update takeoffs"
  ON takeoff_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = takeoff_results.project_id
      AND has_company_role(p.company_id, 'member')
    )
  );

CREATE POLICY "Members can delete takeoffs"
  ON takeoff_results FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = takeoff_results.project_id
      AND has_company_role(p.company_id, 'member')
    )
  );

-- ============ PRICE_LIBRARY POLICIES ============

CREATE POLICY "View own company price library"
  ON price_library FOR SELECT
  USING (is_company_member(company_id));

CREATE POLICY "Members can add prices"
  ON price_library FOR INSERT
  WITH CHECK (has_company_role(company_id, 'member'));

CREATE POLICY "Members can update prices"
  ON price_library FOR UPDATE
  USING (has_company_role(company_id, 'member'));

CREATE POLICY "Admins can delete prices"
  ON price_library FOR DELETE
  USING (has_company_role(company_id, 'admin'));

-- ============ OFFER_DRAFTS POLICIES ============

CREATE POLICY "View offers of own projects"
  ON offer_drafts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = offer_drafts.project_id
      AND is_company_member(p.company_id)
    )
  );

CREATE POLICY "Members can create offers"
  ON offer_drafts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id
      AND has_company_role(p.company_id, 'member')
    )
  );

CREATE POLICY "Members can update offers"
  ON offer_drafts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = offer_drafts.project_id
      AND has_company_role(p.company_id, 'member')
    )
  );

CREATE POLICY "Admins can delete offers"
  ON offer_drafts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = offer_drafts.project_id
      AND has_company_role(p.company_id, 'admin')
    )
  );

-- ============ OFFER_LINE_ITEMS POLICIES ============

CREATE POLICY "View line items of own offers"
  ON offer_line_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM offer_drafts od
      JOIN projects p ON p.id = od.project_id
      WHERE od.id = offer_line_items.offer_draft_id
      AND is_company_member(p.company_id)
    )
  );

CREATE POLICY "Members can manage line items"
  ON offer_line_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM offer_drafts od
      JOIN projects p ON p.id = od.project_id
      WHERE od.id = offer_line_items.offer_draft_id
      AND has_company_role(p.company_id, 'member')
    )
  );

-- ============ RISK_FLAGS POLICIES ============

CREATE POLICY "View risk flags of own projects"
  ON risk_flags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = risk_flags.project_id
      AND is_company_member(p.company_id)
    )
  );

CREATE POLICY "Create risk flags"
  ON risk_flags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id
      AND is_company_member(p.company_id)
    )
  );

CREATE POLICY "Update risk flags"
  ON risk_flags FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = risk_flags.project_id
      AND has_company_role(p.company_id, 'member')
    )
  );

CREATE POLICY "Delete risk flags"
  ON risk_flags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = risk_flags.project_id
      AND has_company_role(p.company_id, 'admin')
    )
  );

-- ============ EXPORT_BUNDLES POLICIES ============

CREATE POLICY "View exports of own projects"
  ON export_bundles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = export_bundles.project_id
      AND is_company_member(p.company_id)
    )
  );

CREATE POLICY "Create exports"
  ON export_bundles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id
      AND has_company_role(p.company_id, 'member')
    )
  );

CREATE POLICY "Delete exports"
  ON export_bundles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = export_bundles.project_id
      AND has_company_role(p.company_id, 'admin')
    )
  );
