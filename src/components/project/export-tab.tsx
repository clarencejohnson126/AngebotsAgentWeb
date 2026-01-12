'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Project } from '@/types/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  Package,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface ExportTabProps {
  projectId: string
  project: Project
}

export function ExportTab({ projectId, project }: ExportTabProps) {
  const t = useTranslations('export')
  const common = useTranslations('common')

  const [generating, setGenerating] = useState<string | null>(null)
  const [includeRisks, setIncludeRisks] = useState(true)
  const [includeTerms, setIncludeTerms] = useState(true)

  const handleExportExcel = async () => {
    setGenerating('excel')
    try {
      const response = await fetch(`/api/export/excel?projectId=${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeRisks, includeTerms }),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Angebot_${project.title.replace(/\s+/g, '_')}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Excel exportiert')
    } catch (error) {
      toast.error('Export fehlgeschlagen')
    } finally {
      setGenerating(null)
    }
  }

  const handleExportPDF = async () => {
    setGenerating('pdf')
    try {
      const response = await fetch(`/api/export/pdf?projectId=${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeRisks, includeTerms }),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Angebot_${project.title.replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('PDF exportiert')
    } catch (error) {
      toast.error('Export fehlgeschlagen')
    } finally {
      setGenerating(null)
    }
  }

  const handleExportJSON = async () => {
    setGenerating('json')
    try {
      const response = await fetch(`/api/export/json?projectId=${projectId}`)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Angebot_${project.title.replace(/\s+/g, '_')}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('JSON exportiert')
    } catch (error) {
      toast.error('Export fehlgeschlagen')
    } finally {
      setGenerating(null)
    }
  }

  const handleExportPackage = async () => {
    setGenerating('package')
    toast.info('Komplettpaket wird erstellt...')

    // Export all formats
    await handleExportExcel()
    await handleExportPDF()
    await handleExportJSON()

    setGenerating(null)
    toast.success('Komplettpaket erstellt')
  }

  const exportOptions = [
    {
      id: 'excel',
      title: t('excel'),
      description: 'Positionsliste mit Kalkulationsformeln',
      icon: FileSpreadsheet,
      color: 'text-green-600',
      action: handleExportExcel,
    },
    {
      id: 'pdf',
      title: t('pdf'),
      description: 'Druckfertiges Angebotsschreiben',
      icon: FileText,
      color: 'text-red-600',
      action: handleExportPDF,
    },
    {
      id: 'json',
      title: t('json'),
      description: 'Strukturierte Daten zur Archivierung',
      icon: FileJson,
      color: 'text-blue-600',
      action: handleExportJSON,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Project Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Projektübersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <dt className="text-sm text-muted-foreground">Projekt</dt>
              <dd className="font-medium">{project.title}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Auftraggeber</dt>
              <dd className="font-medium">{project.client_name}</dd>
            </div>
            {project.submission_deadline && (
              <div>
                <dt className="text-sm text-muted-foreground">Abgabefrist</dt>
                <dd className="font-medium">{formatDate(project.submission_deadline)}</dd>
              </div>
            )}
            {project.total_net > 0 && (
              <div>
                <dt className="text-sm text-muted-foreground">Angebotssumme</dt>
                <dd className="font-medium">{formatCurrency(project.total_net)}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>
            Wählen Sie das gewünschte Exportformat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Options */}
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeRisks"
                checked={includeRisks}
                onCheckedChange={(checked) => setIncludeRisks(checked as boolean)}
              />
              <Label htmlFor="includeRisks">{t('includeRiskFlags')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeTerms"
                checked={includeTerms}
                onCheckedChange={(checked) => setIncludeTerms(checked as boolean)}
              />
              <Label htmlFor="includeTerms">{t('includeTerms')}</Label>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="grid gap-4 md:grid-cols-3">
            {exportOptions.map((option) => (
              <Card
                key={option.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => !generating && option.action()}
              >
                <CardContent className="flex flex-col items-center py-6">
                  <option.icon className={`h-12 w-12 ${option.color}`} />
                  <h3 className="mt-4 font-semibold">{option.title}</h3>
                  <p className="mt-1 text-center text-sm text-muted-foreground">
                    {option.description}
                  </p>
                  <Button
                    className="mt-4 w-full gap-2"
                    disabled={generating !== null}
                    onClick={(e) => {
                      e.stopPropagation()
                      option.action()
                    }}
                  >
                    {generating === option.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('generating')}
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        {t('download')}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Complete Package */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <Package className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="font-semibold">{t('package')}</h3>
                  <p className="text-sm text-muted-foreground">
                    Alle Formate als Komplettpaket herunterladen
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={handleExportPackage}
                disabled={generating !== null}
                className="gap-2"
              >
                {generating === 'package' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('generating')}
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    {t('download')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
