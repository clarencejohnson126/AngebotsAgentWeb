import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createServerSupabaseClient, getUserCompany, isDemoMode } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus, FolderKanban, Calendar, Building2, AlertTriangle, Sparkles, Eye } from 'lucide-react'
import { OfferStatus, Project } from '@/types/database'
import { DEMO_PROJECTS } from '@/lib/mock-data'

// Demo project IDs to filter out from user projects list
const DEMO_PROJECT_IDS = DEMO_PROJECTS.map(p => p.id)

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
  const inDemoMode = isDemoMode()

  if (!companyData) {
    return null
  }

  // Fetch projects
  const { data: rawProjects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('company_id', companyData.companyId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
  }

  // Filter out demo projects from user's projects list (they're shown in demo section)
  const projects = inDemoMode
    ? rawProjects // In demo mode, show all projects (including demo) as user's projects
    : rawProjects?.filter((p: Project) => !DEMO_PROJECT_IDS.includes(p.id)) // In production, filter out demo IDs

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

      {/* Demo Projects Section - Only show in production mode (not demo mode) */}
      {!inDemoMode && (
        <Card className="border-dashed border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Demo-Projekte zur Orientierung</CardTitle>
            </div>
            <CardDescription>
              Erkunden Sie diese Beispielprojekte, um die Funktionen von AngebotsAgent kennenzulernen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {DEMO_PROJECTS.map((project: Project) => (
                <Link key={project.id} href={`/projekte/${project.id}`}>
                  <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 bg-background">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Eye className="h-3 w-3 text-primary shrink-0" />
                            <CardTitle className="text-sm line-clamp-1">
                              {project.title}
                            </CardTitle>
                          </div>
                          <CardDescription className="flex items-center gap-1 text-xs">
                            <Building2 className="h-3 w-3 shrink-0" />
                            <span className="line-clamp-1">{project.client_name}</span>
                          </CardDescription>
                        </div>
                        <Badge variant={statusVariants[project.status] as any} className="shrink-0 text-xs">
                          {statusLabels[project.status]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{project.site_city}</span>
                        {project.total_net > 0 && (
                          <span className="font-medium text-foreground">
                            {formatCurrency(project.total_net)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Your Projects Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{inDemoMode ? 'Demo-Projekte' : 'Ihre Projekte'}</h2>
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
