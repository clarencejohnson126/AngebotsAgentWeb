-- AngebotsAgent Storage Setup
-- Creates storage buckets and policies for document uploads
-- Run this in Supabase Dashboard > SQL Editor

-- ============ CREATE STORAGE BUCKETS ============

-- Create project-documents bucket for LV/Baubeschreibung files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-documents',
  'project-documents',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
)
ON CONFLICT (id) DO NOTHING;

-- Create project-plans bucket for blueprints/floor plans
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-plans',
  'project-plans',
  false,
  104857600, -- 100MB limit for larger plan files
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/tiff', 'application/dxf', 'application/dwg']
)
ON CONFLICT (id) DO NOTHING;

-- ============ STORAGE RLS POLICIES ============
-- Simple policies for authenticated users (matching the relaxed table RLS approach)

-- ============ project-documents BUCKET POLICIES ============

-- SELECT: Allow authenticated users to view project documents
CREATE POLICY "Authenticated users can view project documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'project-documents');

-- INSERT: Allow authenticated users to upload project documents
CREATE POLICY "Authenticated users can upload project documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-documents');

-- UPDATE: Allow authenticated users to update project documents
CREATE POLICY "Authenticated users can update project documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-documents');

-- DELETE: Allow authenticated users to delete project documents
CREATE POLICY "Authenticated users can delete project documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-documents');

-- ============ project-plans BUCKET POLICIES ============

-- SELECT: Allow authenticated users to view project plans
CREATE POLICY "Authenticated users can view project plans"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'project-plans');

-- INSERT: Allow authenticated users to upload project plans
CREATE POLICY "Authenticated users can upload project plans"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-plans');

-- UPDATE: Allow authenticated users to update project plans
CREATE POLICY "Authenticated users can update project plans"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-plans');

-- DELETE: Allow authenticated users to delete project plans
CREATE POLICY "Authenticated users can delete project plans"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-plans');
