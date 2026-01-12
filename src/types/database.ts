export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TradeType =
  | 'trockenbau'
  | 'estrich'
  | 'abdichtung'
  | 'bodenleger'
  | 'maler'
  | 'fliesen'
  | 'sonstige'

export type DocumentType =
  | 'leistungsverzeichnis'
  | 'baubeschreibung'
  | 'grundriss'
  | 'schnitt'
  | 'ansicht'
  | 'detail'
  | 'vertrag'
  | 'sonstige'

export type DocumentStatus =
  | 'uploaded'
  | 'processing'
  | 'extracted'
  | 'reviewed'
  | 'failed'

export type TakeoffSource = 'extracted' | 'measured' | 'manual' | 'imported'

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical'

export type RiskCategory =
  | 'mengenabweichung'
  | 'leistungsaenderung'
  | 'bauablaufstoerung'
  | 'mangelhafte_planung'
  | 'unklare_abgrenzung'
  | 'fehlende_position'
  | 'normabweichung'
  | 'sonstige'

export type OfferStatus =
  | 'draft'
  | 'in_review'
  | 'submitted'
  | 'won'
  | 'lost'
  | 'cancelled'

export type UnitType =
  | 'm'
  | 'm2'
  | 'm3'
  | 'stk'
  | 'kg'
  | 't'
  | 'l'
  | 'h'
  | 'psch'
  | '%'

export type ExportFormat = 'excel' | 'pdf' | 'json' | 'gaeb'

export type CompanyRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          trade: TradeType
          street: string | null
          zip_code: string | null
          city: string | null
          country: string
          phone: string | null
          email: string | null
          website: string | null
          tax_id: string | null
          vat_id: string | null
          commercial_register: string | null
          default_markup_percent: number
          default_risk_percent: number
          default_overhead_percent: number
          logo_path: string | null
          offer_template: Json
          invoice_template: Json
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          trade?: TradeType
          street?: string | null
          zip_code?: string | null
          city?: string | null
          country?: string
          phone?: string | null
          email?: string | null
          website?: string | null
          tax_id?: string | null
          vat_id?: string | null
          commercial_register?: string | null
          default_markup_percent?: number
          default_risk_percent?: number
          default_overhead_percent?: number
          logo_path?: string | null
          offer_template?: Json
          invoice_template?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          trade?: TradeType
          street?: string | null
          zip_code?: string | null
          city?: string | null
          country?: string
          phone?: string | null
          email?: string | null
          website?: string | null
          tax_id?: string | null
          vat_id?: string | null
          commercial_register?: string | null
          default_markup_percent?: number
          default_risk_percent?: number
          default_overhead_percent?: number
          logo_path?: string | null
          offer_template?: Json
          invoice_template?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      company_members: {
        Row: {
          id: string
          company_id: string
          user_id: string
          role: CompanyRole
          invited_by: string | null
          invited_at: string | null
          accepted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          role?: CompanyRole
          invited_by?: string | null
          invited_at?: string | null
          accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          role?: CompanyRole
          invited_by?: string | null
          invited_at?: string | null
          accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          company_id: string
          title: string
          project_number: string | null
          description: string | null
          client_name: string
          client_contact: string | null
          client_email: string | null
          client_phone: string | null
          client_address: string | null
          site_street: string | null
          site_zip_code: string | null
          site_city: string | null
          site_country: string
          submission_deadline: string | null
          start_date: string | null
          end_date: string | null
          status: OfferStatus
          total_net: number
          total_gross: number
          tags: string[]
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          project_number?: string | null
          description?: string | null
          client_name: string
          client_contact?: string | null
          client_email?: string | null
          client_phone?: string | null
          client_address?: string | null
          site_street?: string | null
          site_zip_code?: string | null
          site_city?: string | null
          site_country?: string
          submission_deadline?: string | null
          start_date?: string | null
          end_date?: string | null
          status?: OfferStatus
          total_net?: number
          total_gross?: number
          tags?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          project_number?: string | null
          description?: string | null
          client_name?: string
          client_contact?: string | null
          client_email?: string | null
          client_phone?: string | null
          client_address?: string | null
          site_street?: string | null
          site_zip_code?: string | null
          site_city?: string | null
          site_country?: string
          submission_deadline?: string | null
          start_date?: string | null
          end_date?: string | null
          status?: OfferStatus
          total_net?: number
          total_gross?: number
          tags?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          project_id: string
          name: string
          original_filename: string
          storage_path: string
          file_size: number | null
          mime_type: string | null
          document_type: DocumentType
          status: DocumentStatus
          page_count: number | null
          processing_started_at: string | null
          processing_completed_at: string | null
          processing_error: string | null
          scale: string | null
          drawing_number: string | null
          revision: string | null
          extraction_summary: Json
          created_at: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          original_filename: string
          storage_path: string
          file_size?: number | null
          mime_type?: string | null
          document_type?: DocumentType
          status?: DocumentStatus
          page_count?: number | null
          processing_started_at?: string | null
          processing_completed_at?: string | null
          processing_error?: string | null
          scale?: string | null
          drawing_number?: string | null
          revision?: string | null
          extraction_summary?: Json
          created_at?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          original_filename?: string
          storage_path?: string
          file_size?: number | null
          mime_type?: string | null
          document_type?: DocumentType
          status?: DocumentStatus
          page_count?: number | null
          processing_started_at?: string | null
          processing_completed_at?: string | null
          processing_error?: string | null
          scale?: string | null
          drawing_number?: string | null
          revision?: string | null
          extraction_summary?: Json
          created_at?: string
          updated_at?: string
          uploaded_by?: string | null
        }
      }
      extracted_data: {
        Row: {
          id: string
          document_id: string
          project_id: string
          position_number: string | null
          oz_number: string | null
          title: string | null
          description: string | null
          long_text: string | null
          quantity: number | null
          unit: UnitType | null
          page_number: number | null
          page_reference: string | null
          bounding_box: Json | null
          extraction_confidence: number | null
          is_verified: boolean
          verified_by: string | null
          verified_at: string | null
          raw_extraction: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          document_id: string
          project_id: string
          position_number?: string | null
          oz_number?: string | null
          title?: string | null
          description?: string | null
          long_text?: string | null
          quantity?: number | null
          unit?: UnitType | null
          page_number?: number | null
          page_reference?: string | null
          bounding_box?: Json | null
          extraction_confidence?: number | null
          is_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          raw_extraction?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          project_id?: string
          position_number?: string | null
          oz_number?: string | null
          title?: string | null
          description?: string | null
          long_text?: string | null
          quantity?: number | null
          unit?: UnitType | null
          page_number?: number | null
          page_reference?: string | null
          bounding_box?: Json | null
          extraction_confidence?: number | null
          is_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          raw_extraction?: Json
          created_at?: string
          updated_at?: string
        }
      }
      takeoff_results: {
        Row: {
          id: string
          project_id: string
          document_id: string | null
          extracted_data_id: string | null
          position_number: string | null
          description: string
          quantity: number
          unit: UnitType
          source: TakeoffSource
          measurement_data: Json
          plan_page: number | null
          plan_zone: string | null
          is_verified: boolean
          verified_by: string | null
          verified_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          project_id: string
          document_id?: string | null
          extracted_data_id?: string | null
          position_number?: string | null
          description: string
          quantity: number
          unit: UnitType
          source?: TakeoffSource
          measurement_data?: Json
          plan_page?: number | null
          plan_zone?: string | null
          is_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          document_id?: string | null
          extracted_data_id?: string | null
          position_number?: string | null
          description?: string
          quantity?: number
          unit?: UnitType
          source?: TakeoffSource
          measurement_data?: Json
          plan_page?: number | null
          plan_zone?: string | null
          is_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      price_library: {
        Row: {
          id: string
          company_id: string
          item_code: string | null
          name: string
          description: string | null
          category: string | null
          subcategory: string | null
          trade: TradeType | null
          unit: UnitType
          unit_price: number
          material_cost: number | null
          labor_cost: number | null
          equipment_cost: number | null
          other_cost: number | null
          labor_hours: number | null
          valid_from: string
          valid_until: string | null
          source: string | null
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          company_id: string
          item_code?: string | null
          name: string
          description?: string | null
          category?: string | null
          subcategory?: string | null
          trade?: TradeType | null
          unit: UnitType
          unit_price: number
          material_cost?: number | null
          labor_cost?: number | null
          equipment_cost?: number | null
          other_cost?: number | null
          labor_hours?: number | null
          valid_from?: string
          valid_until?: string | null
          source?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          item_code?: string | null
          name?: string
          description?: string | null
          category?: string | null
          subcategory?: string | null
          trade?: TradeType | null
          unit?: UnitType
          unit_price?: number
          material_cost?: number | null
          labor_cost?: number | null
          equipment_cost?: number | null
          other_cost?: number | null
          labor_hours?: number | null
          valid_from?: string
          valid_until?: string | null
          source?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      offer_drafts: {
        Row: {
          id: string
          project_id: string
          version: number
          is_current: boolean
          parent_version_id: string | null
          title: string
          offer_number: string | null
          offer_date: string
          validity_days: number
          markup_percent: number
          risk_percent: number
          overhead_percent: number
          discount_percent: number
          subtotal_net: number
          markup_amount: number
          risk_amount: number
          overhead_amount: number
          discount_amount: number
          total_net: number
          vat_percent: number
          vat_amount: number
          total_gross: number
          cover_text: string | null
          terms_and_conditions: string | null
          notes: string | null
          status: OfferStatus
          submitted_at: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          project_id: string
          version?: number
          is_current?: boolean
          parent_version_id?: string | null
          title: string
          offer_number?: string | null
          offer_date?: string
          validity_days?: number
          markup_percent?: number
          risk_percent?: number
          overhead_percent?: number
          discount_percent?: number
          subtotal_net?: number
          markup_amount?: number
          risk_amount?: number
          overhead_amount?: number
          discount_amount?: number
          total_net?: number
          vat_percent?: number
          vat_amount?: number
          total_gross?: number
          cover_text?: string | null
          terms_and_conditions?: string | null
          notes?: string | null
          status?: OfferStatus
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          version?: number
          is_current?: boolean
          parent_version_id?: string | null
          title?: string
          offer_number?: string | null
          offer_date?: string
          validity_days?: number
          markup_percent?: number
          risk_percent?: number
          overhead_percent?: number
          discount_percent?: number
          subtotal_net?: number
          markup_amount?: number
          risk_amount?: number
          overhead_amount?: number
          discount_amount?: number
          total_net?: number
          vat_percent?: number
          vat_amount?: number
          total_gross?: number
          cover_text?: string | null
          terms_and_conditions?: string | null
          notes?: string | null
          status?: OfferStatus
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      offer_line_items: {
        Row: {
          id: string
          offer_draft_id: string
          position_number: string
          sort_order: number
          title: string
          description: string | null
          long_text: string | null
          quantity: number
          unit: UnitType
          unit_price: number
          total_price: number
          takeoff_result_id: string | null
          price_library_id: string | null
          extracted_data_id: string | null
          item_markup_percent: number | null
          item_discount_percent: number | null
          is_optional: boolean
          is_alternative: boolean
          parent_item_id: string | null
          internal_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          offer_draft_id: string
          position_number: string
          sort_order?: number
          title: string
          description?: string | null
          long_text?: string | null
          quantity: number
          unit: UnitType
          unit_price: number
          total_price?: number
          takeoff_result_id?: string | null
          price_library_id?: string | null
          extracted_data_id?: string | null
          item_markup_percent?: number | null
          item_discount_percent?: number | null
          is_optional?: boolean
          is_alternative?: boolean
          parent_item_id?: string | null
          internal_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          offer_draft_id?: string
          position_number?: string
          sort_order?: number
          title?: string
          description?: string | null
          long_text?: string | null
          quantity?: number
          unit?: UnitType
          unit_price?: number
          total_price?: number
          takeoff_result_id?: string | null
          price_library_id?: string | null
          extracted_data_id?: string | null
          item_markup_percent?: number | null
          item_discount_percent?: number | null
          is_optional?: boolean
          is_alternative?: boolean
          parent_item_id?: string | null
          internal_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      risk_flags: {
        Row: {
          id: string
          project_id: string
          document_id: string | null
          extracted_data_id: string | null
          offer_line_item_id: string | null
          takeoff_result_id: string | null
          title: string
          description: string
          category: RiskCategory
          severity: RiskSeverity
          source_reference: string | null
          page_reference: string | null
          estimated_impact_min: number | null
          estimated_impact_max: number | null
          detection_method: string | null
          confidence: number | null
          ai_reasoning: string | null
          is_resolved: boolean
          resolution_notes: string | null
          resolved_by: string | null
          resolved_at: string | null
          is_acknowledged: boolean
          acknowledged_by: string | null
          acknowledged_at: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          project_id: string
          document_id?: string | null
          extracted_data_id?: string | null
          offer_line_item_id?: string | null
          takeoff_result_id?: string | null
          title: string
          description: string
          category: RiskCategory
          severity?: RiskSeverity
          source_reference?: string | null
          page_reference?: string | null
          estimated_impact_min?: number | null
          estimated_impact_max?: number | null
          detection_method?: string | null
          confidence?: number | null
          ai_reasoning?: string | null
          is_resolved?: boolean
          resolution_notes?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          is_acknowledged?: boolean
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          document_id?: string | null
          extracted_data_id?: string | null
          offer_line_item_id?: string | null
          takeoff_result_id?: string | null
          title?: string
          description?: string
          category?: RiskCategory
          severity?: RiskSeverity
          source_reference?: string | null
          page_reference?: string | null
          estimated_impact_min?: number | null
          estimated_impact_max?: number | null
          detection_method?: string | null
          confidence?: number | null
          ai_reasoning?: string | null
          is_resolved?: boolean
          resolution_notes?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          is_acknowledged?: boolean
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      export_bundles: {
        Row: {
          id: string
          project_id: string
          offer_draft_id: string | null
          name: string
          format: ExportFormat
          storage_path: string
          file_size: number | null
          included_sections: Json
          export_options: Json
          download_count: number
          last_downloaded_at: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          project_id: string
          offer_draft_id?: string | null
          name: string
          format: ExportFormat
          storage_path: string
          file_size?: number | null
          included_sections?: Json
          export_options?: Json
          download_count?: number
          last_downloaded_at?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          offer_draft_id?: string | null
          name?: string
          format?: ExportFormat
          storage_path?: string
          file_size?: number | null
          included_sections?: Json
          export_options?: Json
          download_count?: number
          last_downloaded_at?: string | null
          created_at?: string
          created_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      trade_type: TradeType
      document_type: DocumentType
      document_status: DocumentStatus
      takeoff_source: TakeoffSource
      risk_severity: RiskSeverity
      risk_category: RiskCategory
      offer_status: OfferStatus
      unit_type: UnitType
      export_format: ExportFormat
      company_role: CompanyRole
    }
  }
}

// Convenience type aliases
export type Company = Database['public']['Tables']['companies']['Row']
export type CompanyInsert = Database['public']['Tables']['companies']['Insert']
export type CompanyUpdate = Database['public']['Tables']['companies']['Update']

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export type Document = Database['public']['Tables']['documents']['Row']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']
export type DocumentUpdate = Database['public']['Tables']['documents']['Update']

export type ExtractedData = Database['public']['Tables']['extracted_data']['Row']
export type ExtractedDataInsert = Database['public']['Tables']['extracted_data']['Insert']
export type ExtractedDataUpdate = Database['public']['Tables']['extracted_data']['Update']

export type TakeoffResult = Database['public']['Tables']['takeoff_results']['Row']
export type TakeoffResultInsert = Database['public']['Tables']['takeoff_results']['Insert']
export type TakeoffResultUpdate = Database['public']['Tables']['takeoff_results']['Update']

export type PriceLibraryItem = Database['public']['Tables']['price_library']['Row']
export type PriceLibraryItemInsert = Database['public']['Tables']['price_library']['Insert']
export type PriceLibraryItemUpdate = Database['public']['Tables']['price_library']['Update']

export type OfferDraft = Database['public']['Tables']['offer_drafts']['Row']
export type OfferDraftInsert = Database['public']['Tables']['offer_drafts']['Insert']
export type OfferDraftUpdate = Database['public']['Tables']['offer_drafts']['Update']

export type OfferLineItem = Database['public']['Tables']['offer_line_items']['Row']
export type OfferLineItemInsert = Database['public']['Tables']['offer_line_items']['Insert']
export type OfferLineItemUpdate = Database['public']['Tables']['offer_line_items']['Update']

export type RiskFlag = Database['public']['Tables']['risk_flags']['Row']
export type RiskFlagInsert = Database['public']['Tables']['risk_flags']['Insert']
export type RiskFlagUpdate = Database['public']['Tables']['risk_flags']['Update']

export type ExportBundle = Database['public']['Tables']['export_bundles']['Row']
export type ExportBundleInsert = Database['public']['Tables']['export_bundles']['Insert']
export type ExportBundleUpdate = Database['public']['Tables']['export_bundles']['Update']
