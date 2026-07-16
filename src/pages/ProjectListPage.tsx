import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Plus, FolderKanban } from 'lucide-react'
import { useProjects } from '@/store/useProjects'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const statusLabels: Record<string, string> = {
  planning: 'projects.planning',
  cutting: 'projects.cutting',
  sewing: 'projects.sewing',
  fitting: 'projects.fitting',
  finished: 'projects.finished',
}

export function ProjectListPage() {
  const { t } = useTranslation()
  const { items, load } = useProjects()

  useEffect(() => { load() }, [load])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('projects.title')}</h1>
        </div>
        <Link to="/projects/new">
          <Button>
            <Plus className="w-4 h-4" />
            {t('projects.newProject')}
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-12 text-center">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">{t('projects.noProjects')}</p>
          <Link to="/projects/new">
            <Button variant="outline">
              <Plus className="w-4 h-4" />
              {t('projects.createFirst')}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.slice().reverse().map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between hover:border-primary/50 hover:shadow-sm transition-all">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{project.title}</h3>
                  {project.description && (
                    <p className="text-sm text-slate-500 mt-0.5">{project.description}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge status={project.status} label={t(statusLabels[project.status])} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
