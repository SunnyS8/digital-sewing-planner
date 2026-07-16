import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Plus, FolderKanban, CheckCircle2, Clock } from 'lucide-react'
import { useProjects } from '@/store/useProjects'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusLabels: Record<string, string> = {
  planning: 'projects.planning',
  cutting: 'projects.cutting',
  sewing: 'projects.sewing',
  fitting: 'projects.fitting',
  finished: 'projects.finished',
}

export function Dashboard() {
  const { t } = useTranslation()
  const { items, load } = useProjects()

  useEffect(() => { load() }, [load])

  const activeCount = items.filter((p) => p.status !== 'finished').length
  const finishedCount = items.filter((p) => p.status === 'finished').length

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('dashboard.title')}</h1>
          <p className="text-slate-500 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <Link to="/projects/new">
          <Button>
            <Plus className="w-4 h-4" />
            {t('dashboard.newProject')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{items.length}</p>
              <p className="text-sm text-slate-500">{t('dashboard.totalProjects')}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{activeCount}</p>
              <p className="text-sm text-slate-500">{t('dashboard.activeProjects')}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{finishedCount}</p>
              <p className="text-sm text-slate-500">{t('dashboard.finishedProjects')}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('dashboard.recentProjects')}</h2>
        {items.length === 0 ? (
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-12 text-center">
            <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">{t('dashboard.noProjects')}</p>
            <Link to="/projects/new">
              <Button variant="outline">
                <Plus className="w-4 h-4" />
                {t('dashboard.newProject')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {items.slice().reverse().map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <div className={cn(
                  'rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4',
                  'hover:border-primary/50 hover:shadow-sm transition-all'
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">{project.title}</h3>
                      {project.description && (
                        <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{project.description}</p>
                      )}
                    </div>
                    <Badge status={project.status} label={t(statusLabels[project.status])} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
