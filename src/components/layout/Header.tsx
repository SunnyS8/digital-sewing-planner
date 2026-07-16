import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  const { i18n } = useTranslation()
  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'ru' ? 'en' : 'ru')
  }

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-end px-6 shrink-0">
      <Button variant="ghost" size="sm" onClick={toggleLang} className="flex items-center gap-2">
        <Languages className="w-4 h-4" />
        {i18n.language === 'ru' ? 'EN' : 'RU'}
      </Button>
    </header>
  )
}
