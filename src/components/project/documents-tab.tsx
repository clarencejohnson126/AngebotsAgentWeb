'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatFileSize, formatDate } from '@/lib/utils'
import { DocumentType, DocumentStatus, Document } from '@/types/database'
import {
  Upload,
  FileText,
  Loader2,
  Trash2,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Map as MapIcon,
  FileSpreadsheet,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'
import useSWR, { mutate } from 'swr'
import { AreaResultsViewer } from '@/components/extraction/area-results-viewer'

interface DocumentsTabProps {
  projectId: string
}

interface AreaExtractionResult {
  success: boolean
  rooms: any[]
  total_area_m2: number
  total_counted_m2: number
  room_count: number
  page_count: number
  blueprint_style: string
  extraction_method: string
  warnings: string[]
  totals_by_category: Record<string, number>
}

const statusIcons: Record<DocumentStatus, React.ReactNode> = {
  uploaded: <Clock className="h-4 w-4 text-gray-500" />,
  processing: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
  extracted: <CheckCircle className="h-4 w-4 text-green-500" />,
  reviewed: <CheckCircle className="h-4 w-4 text-purple-500" />,
  failed: <AlertCircle className="h-4 w-4 text-red-500" />,
}

// Client-side file cache for demo mode (keeps files in memory for extraction)
const clientFileCache = new Map<string, File>()

export function DocumentsTab({ projectId }: DocumentsTabProps) {
  const t = useTranslations('documents')
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [selectedType, setSelectedType] = useState<DocumentType>('leistungsverzeichnis')
  const [extractingId, setExtractingId] = useState<string | null>(null)
  const [showResultsDialog, setShowResultsDialog] = useState(false)
  const [extractionResult, setExtractionResult] = useState<AreaExtractionResult | null>(null)
  const [resultDocName, setResultDocName] = useState<string>('')

  const supabase = createClient()

  // Fetch documents
  const { data: documents, error, isLoading } = useSWR(
    `documents-${projectId}`,
    async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  )

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Nicht angemeldet')
        return
      }

      // Get company ID
      const { data: membership } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        toast.error('Keine Firma gefunden')
        return
      }

      for (const file of acceptedFiles) {
        // Generate unique file path
        const fileExt = file.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const filePath = `${membership.company_id}/${projectId}/documents/${fileName}`

        // Store file in client-side cache for demo mode extraction
        clientFileCache.set(filePath, file)
        console.log(`[Client Cache] Stored file: ${filePath} (${file.size} bytes)`)

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('project-documents')
          .upload(filePath, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          toast.error(`Fehler beim Hochladen von ${file.name}`)
          continue
        }

        // Create document record
        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            project_id: projectId,
            name: file.name.replace(/\.[^/.]+$/, ''),
            original_filename: file.name,
            storage_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            document_type: selectedType,
            status: 'uploaded',
            uploaded_by: user.id,
          })

        if (dbError) {
          console.error('DB error:', dbError)
          toast.error(`Fehler beim Speichern von ${file.name}`)
          continue
        }

        toast.success(`${file.name} hochgeladen`)
      }

      // Refresh documents list
      mutate(`documents-${projectId}`)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ein Fehler ist aufgetreten')
    } finally {
      setUploading(false)
    }
  }, [projectId, selectedType, supabase])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    disabled: uploading,
  })

  // Determine if document is a blueprint/plan type (uses area extraction)
  const isPlanDocument = (docType: DocumentType): boolean => {
    return ['grundriss', 'schnitt', 'detail'].includes(docType)
  }

  // Change document type
  const handleChangeType = async (documentId: string, newType: DocumentType) => {
    try {
      await supabase
        .from('documents')
        .update({
          document_type: newType,
          status: 'uploaded', // Reset status so extraction can be run again
          extraction_summary: null,
        })
        .eq('id', documentId)

      mutate(`documents-${projectId}`)
      toast.success(`Dokumenttyp geändert zu ${documentTypes.find(t => t.value === newType)?.label}`)
    } catch (error) {
      toast.error('Fehler beim Ändern des Dokumenttyps')
    }
  }

  const handleExtract = async (documentId: string, storagePath: string, documentType: DocumentType, originalFilename: string, docName?: string) => {
    const isAreaExtraction = isPlanDocument(documentType)
    toast.info(isAreaExtraction ? 'Flächenextraktion wird gestartet...' : 'LV-Extraktion wird gestartet...')
    setExtractingId(documentId)

    try {
      // Create form data
      const formData = new FormData()
      let fileToSend: Blob | null = null

      // First try client-side cache (for demo mode)
      const cachedFile = clientFileCache.get(storagePath)
      if (cachedFile && cachedFile.size > 0) {
        console.log(`[Extraction] Using cached file: ${storagePath} (${cachedFile.size} bytes)`)
        fileToSend = cachedFile
      } else {
        // Fall back to storage download (for production)
        console.log(`[Extraction] Trying storage download: ${storagePath}`)
        const { data: fileData } = await supabase.storage
          .from('project-documents')
          .download(storagePath)

        if (fileData && fileData.size > 100) {
          console.log(`[Extraction] Got file from storage: ${fileData.size} bytes`)
          fileToSend = fileData
        }
      }

      if (!fileToSend || fileToSend.size < 100) {
        throw new Error('Datei konnte nicht geladen werden. Bitte laden Sie das Dokument erneut hoch.')
      }

      formData.append('file', fileToSend, originalFilename || 'document.pdf')

      if (isAreaExtraction) {
        // Call Python service directly for area extraction
        const PYTHON_SERVICE_URL = 'http://localhost:8000'

        console.log(`[Extraction] Sending to Python service...`)
        const response = await fetch(`${PYTHON_SERVICE_URL}/extract/areas`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Extraktion fehlgeschlagen: ${errorText}`)
        }

        const result = await response.json()
        console.log(`[Extraction] Result:`, result)

        // Store result in sessionStorage and redirect to results page
        sessionStorage.setItem(`extraction-result-${documentId}`, JSON.stringify(result))

        toast.success(`${result.room_count || 0} Räume extrahiert!`)

        // Redirect to results page
        const docNameEncoded = encodeURIComponent(docName || originalFilename)
        router.push(`/projekte/${projectId}/flaechen?documentId=${documentId}&name=${docNameEncoded}`)
      } else {
        // LV extraction - use API endpoint
        formData.append('documentId', documentId)
        formData.append('documentType', documentType)

        const response = await fetch('/api/extraction/lv', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Extraktion fehlgeschlagen')
        }

        const result = await response.json()
        const noteText = result.summary?.note ? ` (${result.summary.note})` : ''
        toast.success(`LV-Extraktion: ${result.positions?.length || 0} Positionen gefunden${noteText}`)
        mutate(`documents-${projectId}`)
      }
    } catch (error) {
      console.error('Extraction error:', error)
      toast.error(error instanceof Error ? error.message : 'Extraktion fehlgeschlagen')
    } finally {
      setExtractingId(null)
    }
  }

  const handleDelete = async (documentId: string, storagePath: string) => {
    if (!confirm('Dokument wirklich löschen?')) return

    try {
      // Remove from client cache
      clientFileCache.delete(storagePath)

      // Delete from storage
      await supabase.storage.from('project-documents').remove([storagePath])

      // Delete from database
      await supabase.from('documents').delete().eq('id', documentId)

      mutate(`documents-${projectId}`)
      toast.success('Dokument gelöscht')
    } catch (error) {
      toast.error('Fehler beim Löschen')
    }
  }

  // View existing extraction results
  const handleViewResults = (doc: any) => {
    const summary = doc.extraction_summary
    if (summary && summary.type === 'area_extraction' && summary.rooms) {
      setExtractionResult({
        success: true,
        rooms: summary.rooms,
        total_area_m2: summary.total_area_m2 || 0,
        total_counted_m2: summary.total_counted_m2 || 0,
        room_count: summary.rooms_found || summary.rooms?.length || 0,
        page_count: summary.page_count || 1,
        blueprint_style: summary.blueprint_style || 'unknown',
        extraction_method: summary.method || 'unknown',
        warnings: [],
        totals_by_category: summary.totals_by_category || {},
      })
      setResultDocName(doc.name)
      setShowResultsDialog(true)
    } else {
      toast.info('Keine detaillierten Ergebnisse verfügbar. Führen Sie die Extraktion erneut durch.')
    }
  }

  const documentTypes: { value: DocumentType; label: string; icon: React.ReactNode }[] = [
    { value: 'leistungsverzeichnis', label: t('types.leistungsverzeichnis'), icon: <FileSpreadsheet className="h-4 w-4" /> },
    { value: 'baubeschreibung', label: t('types.baubeschreibung'), icon: <FileText className="h-4 w-4" /> },
    { value: 'grundriss', label: t('types.grundriss'), icon: <MapIcon className="h-4 w-4" /> },
    { value: 'schnitt', label: t('types.schnitt'), icon: <MapIcon className="h-4 w-4" /> },
    { value: 'detail', label: t('types.detail'), icon: <MapIcon className="h-4 w-4" /> },
    { value: 'sonstige', label: t('types.sonstige'), icon: <FileText className="h-4 w-4" /> },
  ]

  const statusLabels: Record<DocumentStatus, string> = {
    uploaded: t('status.uploaded'),
    processing: t('status.processing'),
    extracted: t('status.extracted'),
    reviewed: t('status.reviewed'),
    failed: t('status.failed'),
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>{t('upload')}</CardTitle>
          <CardDescription>
            Laden Sie Leistungsverzeichnisse, Baubeschreibungen und Pläne hoch
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select
                value={selectedType}
                onValueChange={(value) => setSelectedType(value as DocumentType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Dokumenttyp auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 rounded p-3">
            <strong>Tipp:</strong> Für Grundrisse/Pläne wählen Sie "Grundriss" - dann wird die <strong>deterministische Flächenextraktion</strong> verwendet (kein AI).
            Für LV-Dokumente wird Claude AI zur Positionsextraktion eingesetzt.
          </div>

          <div
            {...getRootProps()}
            className={`
              flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
            `}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">{t('uploadProgress')}</p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">{t('uploadHint')}</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : !documents || documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <FileText className="h-10 w-10" />
              <p className="mt-2">{t('noDocuments')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc: Document) => (
                <div
                  key={doc.id}
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {isPlanDocument(doc.document_type) ? (
                        <MapIcon className="h-8 w-8 text-blue-500 flex-shrink-0" />
                      ) : (
                        <FileText className="h-8 w-8 text-red-500 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.name}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>{formatFileSize(doc.file_size || 0)}</span>
                          <span>•</span>
                          <span>{formatDate(doc.created_at)}</span>
                        </div>
                        {/* Document Type Selector */}
                        <div className="mt-2">
                          <Select
                            value={doc.document_type}
                            onValueChange={(value) => handleChangeType(doc.id, value as DocumentType)}
                          >
                            <SelectTrigger className="h-7 text-xs w-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {documentTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    {type.icon}
                                    <span>{type.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Extraction Summary */}
                        {doc.status === 'extracted' && doc.extraction_summary && (
                          <div className="mt-2 text-xs p-2 bg-green-50 border border-green-200 rounded">
                            {(doc.extraction_summary as any).type === 'lv_extraction' ? (
                              <div>
                                <span className="font-medium text-green-700">
                                  {(doc.extraction_summary as any).positions_found || 0} Positionen extrahiert
                                </span>
                                {(doc.extraction_summary as any).note && (
                                  <p className="text-green-600 mt-1">{(doc.extraction_summary as any).note}</p>
                                )}
                              </div>
                            ) : (
                              <div>
                                <span className="font-medium text-green-700">
                                  {(doc.extraction_summary as any).rooms_found || 0} Räume, {((doc.extraction_summary as any).total_area_m2 || 0).toFixed(1)} m²
                                </span>
                                {(doc.extraction_summary as any).method && (
                                  <span className="text-green-600 ml-2">({(doc.extraction_summary as any).method})</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {doc.status === 'failed' && doc.processing_error && (
                          <div className="mt-2 text-xs p-2 bg-red-50 border border-red-200 rounded text-red-600">
                            {doc.processing_error}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1 text-sm">
                        {statusIcons[doc.status]}
                        <span className="hidden sm:inline">{statusLabels[doc.status]}</span>
                      </div>
                      {(doc.status === 'uploaded' || doc.status === 'failed') && isPlanDocument(doc.document_type) && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            // Simple redirect - extraction happens on the flaechen page
                            router.push(`/projekte/${projectId}/flaechen?documentId=${doc.id}&name=${encodeURIComponent(doc.name)}&storagePath=${encodeURIComponent(doc.storage_path)}`)
                          }}
                          title="Flächenextraktion öffnen"
                        >
                          <Play className="mr-1 h-3 w-3" />
                          Flächen
                        </Button>
                      )}
                      {(doc.status === 'uploaded' || doc.status === 'failed') && !isPlanDocument(doc.document_type) && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={extractingId !== null}
                          onClick={() => handleExtract(doc.id, doc.storage_path, doc.document_type, doc.original_filename, doc.name)}
                          title="AI-basierte LV-Extraktion"
                        >
                          {extractingId === doc.id ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Play className="mr-1 h-3 w-3" />
                          )}
                          Extrahieren
                        </Button>
                      )}
                      {doc.status === 'extracted' && isPlanDocument(doc.document_type) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewResults(doc)}
                          title="Ergebnisse anzeigen"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Ergebnisse
                        </Button>
                      )}
                      {doc.status === 'extracted' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={extractingId !== null}
                          onClick={() => handleExtract(doc.id, doc.storage_path, doc.document_type, doc.original_filename, doc.name)}
                          title="Erneut extrahieren"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(doc.id, doc.storage_path)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extraction Results Dialog */}
      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto p-0">
          {extractionResult && (
            <AreaResultsViewer
              result={extractionResult}
              documentName={resultDocName}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
