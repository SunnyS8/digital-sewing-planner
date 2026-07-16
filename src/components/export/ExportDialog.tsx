import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileDown, FileImage, FileType, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { useExportPDF, useExportImage, useExportSVG } from '@/hooks/useExportPDF'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  projectTitle: string
}

export function ExportDialog({ open, onClose, projectTitle }: Props) {
  const { t } = useTranslation()
  const [exporting, setExporting] = useState<string | null>(null)
  const { exportPDF } = useExportPDF()
  const { exportPNG } = useExportImage()
  const { exportSVG } = useExportSVG()

  const handleExport = async (format: 'pdf' | 'png' | 'svg') => {
    setExporting(format)
    await new Promise((r) => setTimeout(r, 50))

    const filename = projectTitle.replace(/\s+/g, '_')

    try {
      switch (format) {
        case 'pdf':
          await exportPDF('project-content', filename)
          break
        case 'png':
          await exportPNG('fitting-canvas-area', filename)
          break
        case 'svg':
          exportSVG('figure-area', filename)
          break
      }
    } catch (err) {
      console.error('Export error:', err)
    }

    setExporting(null)
  }

  return (
    <Dialog open={open} onClose={onClose} title={t('export.exportProject')}>
      <div className="space-y-4">
        <p className="text-sm text-slate-500">{t('export.format')}</p>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border transition-all',
              'hover:border-primary hover:bg-primary/5',
              exporting === 'pdf' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'
            )}
          >
            {exporting === 'pdf' ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <FileDown className="w-6 h-6 text-primary" />
            )}
            <span className="text-xs font-medium">{t('export.exportPdf')}</span>
          </button>
          <button
            onClick={() => handleExport('png')}
            disabled={exporting !== null}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border transition-all',
              'hover:border-primary hover:bg-primary/5',
              exporting === 'png' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'
            )}
          >
            {exporting === 'png' ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <FileImage className="w-6 h-6 text-emerald-500" />
            )}
            <span className="text-xs font-medium">{t('export.exportPng')}</span>
          </button>
          <button
            onClick={() => handleExport('svg')}
            disabled={exporting !== null}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border transition-all',
              'hover:border-primary hover:bg-primary/5',
              exporting === 'svg' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'
            )}
          >
            {exporting === 'svg' ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <FileType className="w-6 h-6 text-amber-500" />
            )}
            <span className="text-xs font-medium">{t('export.exportSvg')}</span>
          </button>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>{t('common.close')}</Button>
        </div>
      </div>
    </Dialog>
  )
}
