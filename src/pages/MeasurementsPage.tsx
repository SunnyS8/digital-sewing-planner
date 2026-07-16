import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Ruler } from 'lucide-react'
import { useMeasurements } from '@/store/useMeasurements'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { MeasurementForm } from '@/components/measurements/MeasurementForm'
import type { BodyMeasurements } from '@/types'

export function MeasurementsPage() {
  const { t } = useTranslation()
  const { items, load, remove } = useMeasurements()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => { load() }, [load])

  const editingItem = editingId ? items.find((m) => m.id === editingId) : undefined

  const handleCreate = () => {
    setEditingId(null)
    setDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm(t('common.confirm') + '?')) {
      remove(id)
    }
  }

  const handleClose = () => {
    setDialogOpen(false)
    setEditingId(null)
    load()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('measurements.title')}</h1>
          <p className="text-slate-500 mt-1">{t('measurements.createFirst')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          {t('measurements.newSet')}
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Ruler className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">{t('measurements.noSets')}</p>
          <Button variant="outline" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            {t('measurements.createFirst')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((m) => (
            <div key={m.id} className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100">{m.name}</h3>
                <p className="text-sm text-slate-500">
                  {t('measurements.bust')}: {m.bust} см | {t('measurements.waist')}: {m.waist} см | {t('measurements.hip')}: {m.hip} см
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(m.id)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={handleClose} title={editingId ? t('measurements.editSet') : t('measurements.newSet')}>
        <MeasurementForm item={editingItem} onClose={handleClose} />
      </Dialog>
    </div>
  )
}
