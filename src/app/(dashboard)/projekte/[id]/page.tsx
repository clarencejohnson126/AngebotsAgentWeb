'use client'

import { useEffect, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  ArrowLeft,
  Calendar,
  Building2,
  MapPin,
  FileText,
  Ruler,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { OfferStatus, Project } from '@/types/database'
import { DocumentsTab } from '@/components/project/documents-tab'
import { TakeoffTab } from '@/components/project/takeoff-tab'
import { OfferTab } from '@/components/project/offer-tab'
import { ExportTab } from '@/components/project/export-tab'

interface ProjectPageProps {
  params: { id: string }
}

const statusVariants: Record<OfferStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  in_review: 'warning',
  submitted: 'default',
  won: 'success',
  lost: 'destructive',
  cancelled: 'outline',
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const t = useTranslations('project')
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [documentCount, setDocumentCount] = useState(0)
  const [riskCount, setRiskCount] = useState(0)

  useEffect(() => {
    async function fetchProject() {
      const supabase = createClient()

      // Fetch project
      const { data: projectData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !projectData) {
        setLoading(false)
        return
      }

      setProject(projectData)

      // Fetch document count
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', params.id)

      setDocumentCount(documents?.length || 0)

      // Fetch risk flags count
      const { data: risks } = await supabase
        .from('risk_flags')
        .select('*')
        .eq('project_id', params.id)
        .eq('is_resolved', false)

      setRiskCount(risks?.length || 0)
      setLoading(false)
    }

    fetchProject()
  }, [params.id])

  const statusLabels: Record<OfferStatus, string> = {
    draft: t('status.draft'),
    in_review: t('status.inReview'),
    submitted: t('status.submitted'),
    won: t('status.won'),
    lost: t('status.lost'),
    cancelled: t('status.cancelled'),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-bold">Projekt nicht gefunden</h2>
        <p className="text-muted-foreground">Das angeforderte Projekt existiert nicht.</p>
        <Link href="/projekte">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zu Projekten
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/projekte">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
              <Badge variant={statusVariants[project.status] as any}>
                {statusLabels[project.status]}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {project.client_name}
              </span>
              {project.site_city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {project.site_city}
                </span>
              )}
              {project.submission_deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Abgabe: {formatDate(project.submission_deadline)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {riskCount > 0 && (
            <Badge variant="warning" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {riskCount} Risiken
            </Badge>
          )}
          {project.total_net > 0 && (
            <span className="text-lg font-semibold">
              {formatCurrency(project.total_net)}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            {t('tabs.documents')}
            {documentCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {documentCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="takeoff" className="gap-2">
            <Ruler className="h-4 w-4" />
            {t('tabs.takeoff')}
          </TabsTrigger>
          <TabsTrigger value="offer" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            {t('tabs.offer')}
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <Download className="h-4 w-4" />
            {t('tabs.export')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <DocumentsTab projectId={params.id} />
        </TabsContent>

        <TabsContent value="takeoff">
          <TakeoffTab projectId={params.id} />
        </TabsContent>

        <TabsContent value="offer">
          <OfferTab projectId={params.id} />
        </TabsContent>

        <TabsContent value="export">
          <ExportTab projectId={params.id} project={project} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
