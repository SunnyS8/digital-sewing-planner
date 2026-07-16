import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, Trash2, Ruler, ShirtIcon, Image, Eye, Download } from 'lucide-react'
import { useProjects } from '@/store/useProjects'
import { useMeasurements } from '@/store/useMeasurements'
import { useFabrics } from '@/store/useFabrics'
import { usePatterns } from '@/store/usePatterns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FigureRenderer } from '@/components/croquis/FigureRenderer'
import { ExportDialog } from '@/components/export/ExportDialog'
import type { ProjectStatus, Fabric, Pattern } from '@/types'

const statusLabels: Record<string, string> = {
  planning: 'projects.planning',
  cutting: 'projects.cutting',
  sewing: 'projects.sewing',
  fitting: 'projects.fitting',
  finished: 'projects.finished',
}

export function ProjectDetailPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const { items: projects, create, update, remove, load: loadProjects } = useProjects()
  const { items: measurements, load: loadMeasurements } = useMeasurements()
  const { items: fabrics, load: loadFabrics } = useFabrics()
  const { items: patterns, load: loadPatterns } = usePatterns()

  const existingProject = isNew ? null : projects.find((p) => p.id === id)

  const [title, setTitle] = useState(existingProject?.title || '')
  const [description, setDescription] = useState(existingProject?.description || '')
  const [status, setStatus] = useState<ProjectStatus>(existingProject?.status || 'planning')
  const [notes, setNotes] = useState(existingProject?.notes || '')
  const [tagsStr, setTagsStr] = useState(existingProject?.tags?.join(', ') || '')
  const [exportOpen, setExportOpen] = useState(false)
  const [measurementsId, setMeasurementsId] = useState(existingProject?.measurementsId || '')
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>(existingProject?.fabricIds || [])
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>(existingProject?.patternIds || [])

  useEffect(() => {
    loadProjects()
    loadMeasurements()
    loadFabrics()
    loadPatterns()
  }, [loadProjects, loadMeasurements, loadFabrics, loadPatterns])

  const currentMeasurements = measurements.find((m) => m.id === measurementsId)

  const handleSave = () => {
    const tags = tagsStr.split(',').map((s) => s.trim()).filter(Boolean)
    const data = {
      title,
      description,
      status,
      notes,
      tags,
      measurementsId: measurementsId || null,
      fabricIds: selectedFabrics,
      patternIds: selectedPatterns,
    }

    if (isNew) {
      const created = create(data)
      navigate(`/projects/${created.id}`, { replace: true })
    } else if (id) {
      update(id, data)
    }
  }

  const handleDelete = () => {
    if (!id || isNew) return
    if (confirm(t('common.confirm') + '?')) {
      remove(id)
      navigate('/projects', { replace: true })
    }
  }

  const toggleFabric = (fabricId: string) => {
    setSelectedFabrics((prev) =>
      prev.includes(fabricId) ? prev.filter((f) => f !== fabricId) : [...prev, fabricId]
    )
  }

  const togglePattern = (patternId: string) => {
    setSelectedPatterns((prev) =>
      prev.includes(patternId) ? prev.filter((p) => p !== patternId) : [...prev, patternId]
    )
  }

  return (
    <div id="project-content" className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isNew ? t('projects.newProject') : existingProject?.title || ''}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <>
              <Button variant="ghost" size="icon" onClick={() => setExportOpen(true)}>
                <Download className="w-4 h-4" />
              </Button>
              <Link to={`/projects/${id}/fitting`}>
                <Button variant="secondary">
                  <Eye className="w-4 h-4" />
                  {t('projects.fittingRoom')}
                </Button>
              </Link>
            </>
          )}
          <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} projectTitle={title} />
          <Button onClick={handleSave}>
            <Save className="w-4 h-4" />
            {t('common.save')}
          </Button>
          {!isNew && (
            <Button variant="danger" size="icon" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t('common.name')}</h2>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('projects.title_field')} />

            <div>
              <Label>{t('projects.description')}</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('projects.status')}</Label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  options={[
                    { value: 'planning', label: t('projects.planning') },
                    { value: 'cutting', label: t('projects.cutting') },
                    { value: 'sewing', label: t('projects.sewing') },
                    { value: 'fitting', label: t('projects.fitting') },
                    { value: 'finished', label: t('projects.finished') },
                  ]}
                />
              </div>
              <div>
                <Label>{t('projects.tags')}</Label>
                <Input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="тег1, тег2" />
              </div>
            </div>

            <div>
              <Label>{t('common.notes')}</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t('projects.selectMeasurements')}</h2>
            <Select
              value={measurementsId}
              onChange={(e) => setMeasurementsId(e.target.value)}
              placeholder={t('common.select')}
              options={measurements.map((m) => ({ value: m.id, label: m.name }))}
            />
            {currentMeasurements && (
              <p className="text-sm text-slate-500">
                {t('measurements.bust')}: {currentMeasurements.bust} | {t('measurements.waist')}: {currentMeasurements.waist} | {t('measurements.hip')}: {currentMeasurements.hip}
              </p>
            )}
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Image className="w-4 h-4" />
              {t('projects.selectFabrics')}
            </h2>
            {fabrics.length === 0 ? (
              <p className="text-sm text-slate-400">{t('fabrics.noFabrics')}</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {fabrics.map((fabric) => (
                  <button
                    key={fabric.id}
                    onClick={() => toggleFabric(fabric.id)}
                    className={`rounded-lg border p-3 text-left text-sm transition-all ${
                      selectedFabrics.includes(fabric.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-full h-12 rounded mb-2" style={{ backgroundColor: fabric.color }} />
                    <p className="font-medium truncate">{fabric.name}</p>
                    <p className="text-xs text-slate-400">{fabric.composition}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShirtIcon className="w-4 h-4" />
              {t('projects.selectPatterns')}
            </h2>
            {patterns.length === 0 ? (
              <p className="text-sm text-slate-400">{t('patterns.noPatterns')}</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {patterns.map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => togglePattern(pattern.id)}
                    className={`rounded-lg border p-3 text-left text-sm transition-all ${
                      selectedPatterns.includes(pattern.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {pattern.imageDataUrl ? (
                      <img
                        src={pattern.imageDataUrl}
                        alt={pattern.name}
                        className="w-full h-20 object-contain rounded mb-2 bg-slate-50"
                      />
                    ) : (
                      <div className="w-full h-20 rounded mb-2 bg-slate-100 flex items-center justify-center text-slate-300">
                        <ShirtIcon className="w-8 h-8" />
                      </div>
                    )}
                    <p className="font-medium truncate">{pattern.name}</p>
                    <p className="text-xs text-slate-400">
                      {t(`garmentTypes.${pattern.garmentType}`)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div id="figure-area" className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
              <Ruler className="w-4 h-4 inline mr-2" />
              {t('dashboard.title')}
            </h2>
            {currentMeasurements ? (
              <FigureRenderer measurements={currentMeasurements} />
            ) : (
              <div className="text-center text-sm text-slate-400 py-12">
                <Ruler className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                {t('projects.selectMeasurements')}
              </div>
            )}
          </div>

          {!isNew && existingProject && (
            <Badge status={existingProject.status} label={t(statusLabels[existingProject.status])} />
          )}
        </div>
      </div>
    </div>
  )
}
