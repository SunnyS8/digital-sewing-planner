import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, ZoomIn, ZoomOut, RotateCcw, Trash2, Layers } from 'lucide-react'
import { Canvas, Image as FabricImage, loadSVGFromString, util, type FabricObject } from 'fabric'
import { useProjects } from '@/store/useProjects'
import { useMeasurements } from '@/store/useMeasurements'
import { useFabrics } from '@/store/useFabrics'
import { usePatterns } from '@/store/usePatterns'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { generateFigureSvg, CANVAS_W, CANVAS_H } from '@/lib/figureGeometry'
import type { PatternLayer } from '@/types'

interface FabricObjectWithData extends FabricObject {
  data?: Record<string, unknown>
}

export function FittingRoomPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = useRef<Canvas | null>(null)
  const [zoom, setZoom] = useState(1)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { items: projects, get: getProject, update: updateProject } = useProjects()
  const { items: measurements } = useMeasurements()
  const { items: fabrics } = useFabrics()
  const { items: patterns } = usePatterns()

  const project = id ? getProject(id) : undefined
  const projectMeasurements = project?.measurementsId
    ? measurements.find((m) => m.id === project.measurementsId)
    : undefined

  const debouncedSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => saveLayers(), 500)
  }, [])

  const renderFigure = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || !projectMeasurements) return

    const existing = canvas.getObjects().find((obj: FabricObjectWithData) => obj.data?.type === 'figure')
    if (existing) canvas.remove(existing)

    try {
      const svgStr = generateFigureSvg(projectMeasurements)
      const loaded = await loadSVGFromString(svgStr)
      const objects = loaded.objects.filter(Boolean) as FabricObject[]
      const group = util.groupSVGElements(objects, loaded.options)
      group.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
      })
      ;(group as FabricObjectWithData).data = { type: 'figure' }
      canvas.add(group)
      canvas.sendObjectToBack(group)
      canvas.renderAll()
    } catch (err) {
      console.error('SVG error:', err)
    }
  }, [projectMeasurements])

  const saveLayers = useCallback(() => {
    if (!canvasRef.current || !id || !project) return
    const canvas = canvasRef.current
    const objects = canvas.getObjects()
    const layers: PatternLayer[] = []

    objects.forEach((obj: FabricObjectWithData) => {
      if (obj.data?.type === 'pattern') {
        layers.push({
          id: (obj.data?.layerId as string) || '',
          patternId: (obj.data?.patternId as string) || '',
          name: (obj.data?.name as string) || '',
          imageDataUrl: (obj.data?.imageDataUrl as string) || '',
          x: obj.left || 0,
          y: obj.top || 0,
          width: (obj.width || 0) * (obj.scaleX || 1),
          height: (obj.height || 0) * (obj.scaleY || 1),
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          rotation: obj.angle || 0,
          opacity: obj.opacity ?? 1,
          zIndex: 0,
          linkedFabricId: (obj.data?.linkedFabricId as string) || undefined,
          linkedFabricImageUrl: (obj.data?.linkedFabricImageUrl as string) || undefined,
        })
      }
    })

    updateProject(id, {
      croquisView: {
        zoom,
        panX: 0,
        panY: 0,
        patternLayers: layers,
      },
    })
  }, [id, project, zoom, updateProject])

  const loadPatternLayers = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || !project?.croquisView?.patternLayers?.length) return

    const existingPatterns = canvas.getObjects().filter((obj: FabricObjectWithData) => obj.data?.type === 'pattern')
    existingPatterns.forEach((p) => canvas.remove(p))

    for (const layer of project.croquisView.patternLayers) {
      if (!layer.imageDataUrl) continue
      try {
        const img = await FabricImage.fromURL(layer.imageDataUrl, { crossOrigin: 'anonymous' })
        if (!img) continue
        img.set({
          left: layer.x,
          top: layer.y,
          scaleX: layer.scaleX,
          scaleY: layer.scaleY,
          angle: layer.rotation,
          opacity: layer.opacity,
        })
        ;(img as FabricObjectWithData).data = {
          layerId: layer.id,
          patternId: layer.patternId,
          name: layer.name,
          imageDataUrl: layer.imageDataUrl,
          type: 'pattern',
          linkedFabricId: layer.linkedFabricId,
          linkedFabricImageUrl: layer.linkedFabricImageUrl,
        }
        canvas.add(img)
      } catch (err) {
        console.error('Layer load error:', err)
      }
    }
    canvas.renderAll()
  }, [project])

  useEffect(() => {
    if (!canvasElRef.current) return
    if (canvasRef.current) {
      canvasRef.current.dispose()
    }

    const canvas = new Canvas(canvasElRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: '#f8fafc',
      preserveObjectStacking: true,
    })

    canvasRef.current = canvas

    canvas.on('selection:created', (e: Record<string, unknown>) => {
      const sel = e.selected as FabricObject[] | undefined
      const obj = sel?.[0] as FabricObjectWithData | undefined
      if (obj?.data?.layerId) {
        setSelectedLayerId(obj.data.layerId as string)
      }
    })

    canvas.on('selection:cleared', () => {
      setSelectedLayerId(null)
    })

    canvas.on('object:modified', () => {
      debouncedSave()
    })

    return () => {
      canvas.dispose()
      canvasRef.current = null
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const patternObjects = canvas.getObjects().filter((obj: FabricObjectWithData) => obj.data?.type === 'pattern')
    patternObjects.forEach((p) => canvas.remove(p))

    renderFigure()
    loadPatternLayers()
  }, [renderFigure, loadPatternLayers])

  const addPatternToCanvas = async (patternId: string) => {
    const pattern = patterns.find((p) => p.id === patternId)
    if (!pattern || !canvasRef.current || !pattern.imageDataUrl) return

    try {
      const img = await FabricImage.fromURL(pattern.imageDataUrl, { crossOrigin: 'anonymous' })
      const scale = Math.min(300 / (img.width || 1), 500 / (img.height || 1))
      const layerId = `layer-${Date.now()}`

      img.set({
        left: 200,
        top: 200,
        scaleX: scale,
        scaleY: scale,
      })
      ;(img as FabricObjectWithData).data = {
        layerId,
        patternId: pattern.id,
        name: pattern.name,
        imageDataUrl: pattern.imageDataUrl,
        type: 'pattern',
      }

      canvasRef.current.add(img)
      canvasRef.current.setActiveObject(img)
      canvasRef.current.renderAll()
      setAddDialogOpen(false)
      saveLayers()
    } catch (err) {
      console.error('Add pattern error:', err)
    }
  }

  const applyFabricToObject = (obj: FabricObjectWithData, fabricImageUrl: string) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const patternCanvas = document.createElement('canvas')
      patternCanvas.width = 200
      patternCanvas.height = 200
      const ctx = patternCanvas.getContext('2d')
      if (!ctx) return

      const pattern = ctx.createPattern(img, 'repeat')
      if (pattern) {
        ctx.fillStyle = pattern
        ctx.fillRect(0, 0, 200, 200)
      }

      obj.set('opacity', 0.85)
      canvasRef.current?.renderAll()
    }
    img.src = fabricImageUrl
  }

  const handleZoomIn = () => {
    if (!canvasRef.current) return
    const newZoom = Math.min(zoom * 1.2, 3)
    setZoom(newZoom)
    canvasRef.current.setZoom(newZoom)
    canvasRef.current.renderAll()
  }

  const handleZoomOut = () => {
    if (!canvasRef.current) return
    const newZoom = Math.max(zoom / 1.2, 0.3)
    setZoom(newZoom)
    canvasRef.current.setZoom(newZoom)
    canvasRef.current.renderAll()
  }

  const handleReset = () => {
    if (!canvasRef.current) return
    setZoom(1)
    canvasRef.current.setZoom(1)
    canvasRef.current.viewportTransform = [1, 0, 0, 1, 0, 0]
    canvasRef.current.renderAll()
  }

  const handleDeleteSelected = () => {
    if (!canvasRef.current || !selectedLayerId) return
    const obj = canvasRef.current.getObjects().find(
      (o: FabricObjectWithData) => o.data?.layerId === selectedLayerId
    )
    if (obj) {
      canvasRef.current.remove(obj)
      setSelectedLayerId(null)
      saveLayers()
    }
  }

  const selectedObject = canvasRef.current
    ? canvasRef.current.getObjects().find(
        (o: FabricObjectWithData) => o.data?.layerId === selectedLayerId
      ) as FabricObjectWithData | undefined
    : undefined

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${id}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {project.title} — {t('fitting.title')}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-px h-6 bg-slate-200" />
          <Button variant="ghost" size="icon" onClick={handleZoomIn} title={t('fitting.zoomIn')}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <span className="text-xs text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={handleZoomOut} title={t('fitting.zoomOut')}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleReset} title={t('fitting.reset')}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-slate-200" />
          <Button variant="secondary" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            {t('fitting.addPattern')}
          </Button>
          {selectedLayerId && (
            <Button variant="danger" size="icon" onClick={handleDeleteSelected}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
          <canvas ref={canvasElRef} />
        </div>

        {selectedObject && (
          <div className="w-72 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-4 shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{t('fitting.patternSettings')}</h3>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>

            <SliderField label={t('fitting.opacity')} value={selectedObject.opacity ?? 1} min={0} max={1} step={0.05}
              onChange={(v) => { selectedObject.set('opacity', v); canvasRef.current?.renderAll(); saveLayers() }}
            />
            <SliderField label={t('fitting.rotation')} value={selectedObject.angle ?? 0} min={-180} max={180} step={1}
              onChange={(v) => { selectedObject.set('angle', v); canvasRef.current?.renderAll(); saveLayers() }}
            />
            <SliderField label={t('fitting.scale') + ' X'} value={selectedObject.scaleX ?? 1} min={0.1} max={3} step={0.05}
              onChange={(v) => { selectedObject.set('scaleX', v); canvasRef.current?.renderAll(); saveLayers() }}
            />
            <SliderField label={t('fitting.scale') + ' Y'} value={selectedObject.scaleY ?? 1} min={0.1} max={3} step={0.05}
              onChange={(v) => { selectedObject.set('scaleY', v); canvasRef.current?.renderAll(); saveLayers() }}
            />

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <Label>{t('fitting.linkFabric')}</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <button
                  onClick={() => {
                    selectedObject.data = {
                      ...selectedObject.data,
                      linkedFabricId: undefined,
                      linkedFabricImageUrl: undefined,
                    }
                    selectedObject.set('opacity', 1)
                    canvasRef.current?.renderAll()
                    saveLayers()
                  }}
                  className="p-2 rounded border border-slate-200 text-xs hover:bg-slate-50"
                >
                  {t('fitting.unlinkFabric')}
                </button>
                {fabrics.map((fabric) => (
                  <button
                    key={fabric.id}
                    onClick={() => {
                      selectedObject.data = {
                        ...selectedObject.data,
                        linkedFabricId: fabric.id,
                        linkedFabricImageUrl: fabric.imageDataUrl,
                      }
                      if (fabric.imageDataUrl) {
                        applyFabricToObject(selectedObject, fabric.imageDataUrl)
                      }
                      saveLayers()
                    }}
                    className="p-2 rounded border border-slate-200 text-xs hover:border-primary"
                    title={fabric.name}
                  >
                    <div className="w-full h-6 rounded mb-1" style={{ backgroundColor: fabric.color }} />
                    <span className="truncate block">{fabric.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        title={t('fitting.addPattern')}
      >
        <div className="space-y-2">
          {patterns
            .filter((p) => project.patternIds.includes(p.id) || project.patternIds.length === 0)
            .map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => addPatternToCanvas(pattern.id)}
                className="w-full flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:border-primary/50 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-all text-left"
              >
                {pattern.imageDataUrl ? (
                  <img src={pattern.imageDataUrl} alt={pattern.name} className="w-16 h-16 object-contain rounded bg-slate-50" />
                ) : (
                  <div className="w-16 h-16 rounded bg-slate-100 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-slate-300" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{pattern.name}</p>
                  <p className="text-xs text-slate-400">{t(`garmentTypes.${pattern.garmentType}`)}</p>
                </div>
              </button>
            ))}
          {patterns.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">{t('patterns.noPatterns')}</p>
          )}
        </div>
      </Dialog>
    </div>
  )
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs text-slate-700 dark:text-slate-300 font-medium">{label}</label>
        <span className="text-xs text-slate-400">{value.toFixed(2)}</span>
      </div>
      <Slider value={value} min={min} max={max} step={step} onChange={onChange} />
    </div>
  )
}
