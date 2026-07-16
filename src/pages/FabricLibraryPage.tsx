import { useEffect, useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Pencil, Upload } from 'lucide-react'
import { useFabrics } from '@/store/useFabrics'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { Fabric } from '@/types'

export function FabricLibraryPage() {
  const { t } = useTranslation()
  const { items, load, create, update, remove } = useFabrics()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#cccccc')
  const [composition, setComposition] = useState('')
  const [width, setWidth] = useState('140')
  const [quantity, setQuantity] = useState('100')
  const [patternType, setPatternType] = useState('solid')
  const [stretch, setStretch] = useState('0')
  const [notes, setNotes] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [load])

  const editingItem = editingId ? items.find((f) => f.id === editingId) : undefined

  const openCreate = () => {
    setEditingId(null)
    setName('')
    setColor('#cccccc')
    setComposition('')
    setWidth('140')
    setQuantity('100')
    setPatternType('solid')
    setStretch('0')
    setNotes('')
    setImageDataUrl('')
    setDialogOpen(true)
  }

  const openEdit = (fabric: Fabric) => {
    setEditingId(fabric.id)
    setName(fabric.name)
    setColor(fabric.color)
    setComposition(fabric.composition)
    setWidth(String(fabric.width))
    setQuantity(String(fabric.quantity))
    setPatternType(fabric.patternType || 'solid')
    setStretch(String(fabric.stretch || 0))
    setNotes(fabric.notes || '')
    setImageDataUrl(fabric.imageDataUrl)
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
    const data = {
      name,
      color,
      composition,
      width: Number(width),
      quantity: Number(quantity),
      patternType: patternType as Fabric['patternType'],
      stretch: Number(stretch),
      notes,
      imageDataUrl,
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('fabrics.title')}</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          {t('fabrics.addFabric')}
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">{t('fabrics.noFabrics')}</p>
          <Button variant="outline" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            {t('fabrics.addFirst')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {items.map((fabric) => (
            <div key={fabric.id} className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden group">
              <div className="h-32 relative">
                {fabric.imageDataUrl ? (
                  <img src={fabric.imageDataUrl} alt={fabric.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: fabric.color }} />
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button variant="secondary" size="icon" className="w-7 h-7" onClick={() => openEdit(fabric)}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button variant="secondary" size="icon" className="w-7 h-7" onClick={() => handleDelete(fabric.id)}>
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              </div>
              <div className="p-3 space-y-1">
                <p className="font-medium text-sm truncate">{fabric.name}</p>
                <p className="text-xs text-slate-400">{fabric.composition}</p>
                <p className="text-xs text-slate-400">
                  {fabric.width} см × {fabric.quantity} см
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editingId ? t('fabrics.editFabric') : t('fabrics.addFabric')}>
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
              <img src={imageDataUrl} alt="fabric" className="max-h-32 mx-auto rounded" />
            ) : (
              <div>
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm text-slate-400">{t('fabrics.dragDrop')}</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('common.name')}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>{t('fabrics.color')}</Label>
              <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 p-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('fabrics.composition')}</Label>
              <Input value={composition} onChange={(e) => setComposition(e.target.value)} placeholder="хлопок 100%" />
            </div>
            <div>
              <Label>{t('fabrics.patternType')}</Label>
              <Select
                value={patternType}
                onChange={(e) => setPatternType(e.target.value)}
                options={[
                  { value: 'solid', label: t('fabrics.solid') },
                  { value: 'striped', label: t('fabrics.striped') },
                  { value: 'plaid', label: t('fabrics.plaid') },
                  { value: 'floral', label: t('fabrics.floral') },
                  { value: 'other', label: t('fabrics.other') },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>{t('fabrics.width')}</Label>
              <Input type="number" value={width} onChange={(e) => setWidth(e.target.value)} />
            </div>
            <div>
              <Label>{t('fabrics.quantity')}</Label>
              <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div>
              <Label>{t('fabrics.stretch')}</Label>
              <Input type="number" value={stretch} onChange={(e) => setStretch(e.target.value)} />
            </div>
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
