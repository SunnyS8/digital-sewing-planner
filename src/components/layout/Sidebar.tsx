import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Ruler, FolderKanban, Layers, Shirt, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  labelKey: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/measurements', labelKey: 'nav.measurements', icon: Ruler },
  { to: '/projects', labelKey: 'nav.projects', icon: FolderKanban },
  { to: '/fabrics', labelKey: 'nav.fabrics', icon: Layers },
  { to: '/patterns', labelKey: 'nav.patterns', icon: Shirt },
]

export function Sidebar() {
  const { t } = useTranslation()

  return (
    <aside className="w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary" />
          {t('dashboard.title')}
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-400">Sewing Planner v1.0</p>
      </div>
    </aside>
  )
}
