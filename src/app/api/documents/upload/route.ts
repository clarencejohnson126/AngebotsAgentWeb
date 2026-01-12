import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { DocumentType, Document } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const documentType = (formData.get('documentType') as DocumentType) || 'leistungsverzeichnis'

    if (!file || !projectId) {
      return NextResponse.json(
        { error: 'Datei und Projekt-ID erforderlich' },
        { status: 400 }
      )
    }

    // Verify user has access to the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, company_id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${project.company_id}/${projectId}/${timestamp}_${sanitizedName}`

    // Determine bucket based on document type
    const isLVDocument = ['leistungsverzeichnis', 'baubeschreibung'].includes(documentType)
    const bucket = isLVDocument ? 'project-documents' : 'project-plans'

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Upload fehlgeschlagen' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath)

    // Create document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        project_id: projectId,
        name: file.name,
        file_path: storagePath,
        file_type: file.type,
        file_size: file.size,
        document_type: documentType,
        status: 'pending',
        storage_bucket: bucket,
      })
      .select()
      .single()

    if (docError) {
      console.error('Document record error:', docError)
      // Try to clean up uploaded file
      await supabase.storage.from(bucket).remove([storagePath])
      return NextResponse.json(
        { error: 'Dokumenterstellung fehlgeschlagen' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        file_path: document.file_path,
        document_type: document.document_type,
        status: document.status,
        url: urlData.publicUrl,
      },
    })
  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// List documents for a project
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Projekt-ID erforderlich' },
        { status: 400 }
      )
    }

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Documents query error:', error)
      return NextResponse.json(
        { error: 'Dokumente konnten nicht geladen werden' },
        { status: 500 }
      )
    }

    // Add URLs to documents
    const documentsWithUrls = documents.map((doc: Document) => {
      const { data: urlData } = supabase.storage
        .from('project-documents')
        .getPublicUrl(doc.storage_path)

      return {
        ...doc,
        url: urlData.publicUrl,
      }
    })

    return NextResponse.json({ documents: documentsWithUrls })
  } catch (error) {
    console.error('Documents list error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
