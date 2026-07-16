import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types'

const statusStyles: Record<ProjectStatus, string> = {
  planning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  cutting: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  sewing: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  fitting: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  finished: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
}

interface BadgeProps {
  status: ProjectStatus
  label: string
}

export function Badge({ status, label }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusStyles[status])}>
      {label}
    </span>
  )
}
