import { useEffect, useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Pencil, Upload, ShirtIcon } from 'lucide-react'
import { usePatterns } from '@/store/usePatterns'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { GarmentType } from '@/types'
import { GARMENT_TYPES } from '@/types'

export function PatternsPage() {
  const { t } = useTranslation()
  const { items, load, create, update, remove } = usePatterns()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [garmentType, setGarmentType] = useState<GarmentType>('dress')
  const [notes, setNotes] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [load])

  const editingItem = editingId ? items.find((p) => p.id === editingId) : undefined

  const openCreate = () => {
    setEditingId(null)
    setName('')
    setGarmentType('dress')
    setNotes('')
    setImageDataUrl('')
    setDialogOpen(true)
  }

  const openEdit = (pattern: typeof items[0]) => {
    setEditingId(pattern.id)
    setName(pattern.name)
    setGarmentType(pattern.garmentType)
    setNotes(pattern.notes || '')
    setImageDataUrl(pattern.imageDataUrl)
    setDialogOpen(true)
  }

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => setImageDataUrl(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }, [handleFile])

  const handleSave = () => {
    const img = new Image()
    img.src = imageDataUrl
    const data = {
      name,
      garmentType,
      notes,
      imageDataUrl,
      width: imageDataUrl ? 400 : 400,
      height: imageDataUrl ? 600 : 600,
    }

    if (editingId) {
      update(editingId, data)
    } else {
      create(data)
    }
    setDialogOpen(false)
    load()
  }

  const handleDelete = (id: string) => {
    if (confirm(t('common.confirm') + '?')) {
      remove(id)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('patterns.title')}</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          {t('patterns.addPattern')}
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-12 text-center">
          <ShirtIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">{t('patterns.noPatterns')}</p>
          <Button variant="outline" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            {t('patterns.addFirst')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {items.map((pattern) => (
            <div key={pattern.id} className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden group">
              <div className="h-40 bg-slate-50 dark:bg-slate-800 relative">
                {pattern.imageDataUrl ? (
                  <img src={pattern.imageDataUrl} alt={pattern.name} className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300">
                    <ShirtIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button variant="secondary" size="icon" className="w-7 h-7" onClick={() => openEdit(pattern)}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button variant="secondary" size="icon" className="w-7 h-7" onClick={() => handleDelete(pattern.id)}>
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              </div>
              <div className="p-3 space-y-1">
                <p className="font-medium text-sm truncate">{pattern.name}</p>
                <p className="text-xs text-slate-400">{t(`garmentTypes.${pattern.garmentType}`)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editingId ? t('patterns.editPattern') : t('patterns.addPattern')}>
        <div className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
              imageDataUrl ? 'border-primary/50' : 'border-slate-300 dark:border-slate-600 hover:border-primary/50'
            )}
          >
            {imageDataUrl ? (
              <img src={imageDataUrl} alt="pattern" className="max-h-40 mx-auto rounded" />
            ) : (
              <div>
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm text-slate-400">{t('patterns.dragDrop')}</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }} />
          </div>

          <div>
            <Label>{t('common.name')}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label>{t('patterns.garmentType')}</Label>
            <Select
              value={garmentType}
              onChange={(e) => setGarmentType(e.target.value as GarmentType)}
              options={GARMENT_TYPES.map((gt) => ({ value: gt, label: t(`garmentTypes.${gt}`) }))}
            />
          </div>

          <div>
            <Label>{t('common.notes')}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSave}>{t('common.save')}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
