import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createServerSupabaseClient, getUserCompany } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus, FolderKanban, Calendar, Building2, AlertTriangle } from 'lucide-react'
import { OfferStatus, Project } from '@/types/database'

const statusVariants: Record<OfferStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  in_review: 'warning',
  submitted: 'default',
  won: 'success',
  lost: 'destructive',
  cancelled: 'outline',
}

export default async function ProjectsPage() {
  const t = await getTranslations('project')
  const tDashboard = await getTranslations('dashboard')

  const supabase = await createServerSupabaseClient()
  const companyData = await getUserCompany()

  if (!companyData) {
    return null
  }

  // Fetch projects
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('company_id', companyData.companyId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
  }

  const statusLabels: Record<OfferStatus, string> = {
    draft: t('status.draft'),
    in_review: t('status.inReview'),
    submitted: t('status.submitted'),
    won: t('status.won'),
    lost: t('status.lost'),
    cancelled: t('status.cancelled'),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('projects')}</h1>
          <p className="text-muted-foreground">
            {tDashboard('welcome')}
          </p>
        </div>
        <Link href="/projekte/neu">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('newProject')}
          </Button>
        </Link>
      </div>

      {/* Projects List */}
      {!projects || projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <FolderKanban className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">{tDashboard('noProjects')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {tDashboard('createFirst')}
          </p>
          <Link href="/projekte/neu" className="mt-4">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t('newProject')}
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: Project) => (
            <Link key={project.id} href={`/projekte/${project.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg line-clamp-1">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {project.client_name}
                      </CardDescription>
                    </div>
                    <Badge variant={statusVariants[project.status] as any}>
                      {statusLabels[project.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {project.site_city && (
                      <p className="text-muted-foreground">
                        {project.site_street && `${project.site_street}, `}
                        {project.site_zip_code} {project.site_city}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      {project.submission_deadline && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs">
                            {formatDate(project.submission_deadline)}
                          </span>
                        </div>
                      )}

                      {project.total_net > 0 && (
                        <span className="font-medium">
                          {formatCurrency(project.total_net)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
