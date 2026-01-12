import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getUser, getUserCompany } from '@/lib/supabase/server'
import type { Document, ExtractedData, TakeoffResult, OfferLineItem, RiskFlag } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyData = await getUserCompany()
    if (!companyData) {
      return NextResponse.json({ error: 'No company found' }, { status: 403 })
    }

    const supabase = await createServerSupabaseClient()

    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('company_id', companyData.companyId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Fetch related data
    const [
      { data: documents },
      { data: extractedData },
      { data: takeoffs },
      { data: offerDraft },
      { data: riskFlags },
    ] = await Promise.all([
      supabase.from('documents').select('*').eq('project_id', projectId),
      supabase.from('extracted_data').select('*').eq('project_id', projectId),
      supabase.from('takeoff_results').select('*').eq('project_id', projectId),
      supabase.from('offer_drafts').select('*, offer_line_items(*)').eq('project_id', projectId).eq('is_current', true).single(),
      supabase.from('risk_flags').select('*').eq('project_id', projectId),
    ])

    // Build export package
    const exportData = {
      meta: {
        exportedAt: new Date().toISOString(),
        exportedBy: user.email,
        version: '1.0',
        app: 'AngebotsAgent',
      },
      project: {
        id: project.id,
        title: project.title,
        projectNumber: project.project_number,
        description: project.description,
        client: {
          name: project.client_name,
          contact: project.client_contact,
          email: project.client_email,
          phone: project.client_phone,
        },
        location: {
          street: project.site_street,
          zipCode: project.site_zip_code,
          city: project.site_city,
        },
        deadline: project.submission_deadline,
        status: project.status,
      },
      documents: documents?.map((doc: Document) => ({
        id: doc.id,
        name: doc.name,
        type: doc.document_type,
        status: doc.status,
        pageCount: doc.page_count,
      })) || [],
      extractedPositions: extractedData?.map((item: ExtractedData) => ({
        id: item.id,
        position: item.position_number,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        pageReference: item.page_reference,
        confidence: item.extraction_confidence,
        verified: item.is_verified,
      })) || [],
      takeoffResults: takeoffs?.map((t: TakeoffResult) => ({
        id: t.id,
        description: t.description,
        quantity: t.quantity,
        unit: t.unit,
        source: t.source,
        verified: t.is_verified,
        notes: t.notes,
      })) || [],
      offer: offerDraft ? {
        id: offerDraft.id,
        number: offerDraft.offer_number,
        date: offerDraft.offer_date,
        status: offerDraft.status,
        totals: {
          subtotalNet: offerDraft.subtotal_net,
          markupPercent: offerDraft.markup_percent,
          riskPercent: offerDraft.risk_percent,
          overheadPercent: offerDraft.overhead_percent,
          discountPercent: offerDraft.discount_percent,
          totalNet: offerDraft.total_net,
          vatPercent: offerDraft.vat_percent,
          vatAmount: offerDraft.vat_amount,
          totalGross: offerDraft.total_gross,
        },
        lineItems: offerDraft.offer_line_items?.map((item: any) => ({
          position: item.position_number,
          title: item.title,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          isOptional: item.is_optional,
        })) || [],
      } : null,
      riskFlags: riskFlags?.map((flag: RiskFlag) => ({
        id: flag.id,
        title: flag.title,
        description: flag.description,
        category: flag.category,
        severity: flag.severity,
        sourceReference: flag.source_reference,
        estimatedImpact: {
          min: flag.estimated_impact_min,
          max: flag.estimated_impact_max,
        },
        resolved: flag.is_resolved,
        acknowledged: flag.is_acknowledged,
      })) || [],
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
