export type GarmentType =
  | 'dress'
  | 'top'
  | 'skirt'
  | 'pants'
  | 'shorts'
  | 'jacket'
  | 'coat'
  | 'blouse'
  | 'shirt'
  | 'jumpsuit'
  | 'other'

export type ProjectStatus =
  | 'planning'
  | 'cutting'
  | 'sewing'
  | 'fitting'
  | 'finished'

export interface BodyMeasurements {
  id: string
  name: string
  height: number
  bust: number
  underBust: number
  waist: number
  hip: number
  shoulderWidth: number
  backWidth: number
  armLength: number
  armCircumference: number
  wrist: number
  neck: number
  frontWaistLength: number
  backWaistLength: number
  inseam: number
  thigh: number
  knee: number
  calf: number
  ankle: number
  notes?: string
}

export const defaultMeasurements: Omit<BodyMeasurements, 'id' | 'name'> = {
  height: 165,
  bust: 90,
  underBust: 75,
  waist: 68,
  hip: 96,
  shoulderWidth: 38,
  backWidth: 34,
  armLength: 58,
  armCircumference: 28,
  wrist: 15,
  neck: 35,
  frontWaistLength: 42,
  backWaistLength: 40,
  inseam: 78,
  thigh: 54,
  knee: 36,
  calf: 34,
  ankle: 22,
}

export interface Fabric {
  id: string
  name: string
  color: string
  composition: string
  width: number
  quantity: number
  imageDataUrl: string
  patternType?: 'solid' | 'striped' | 'plaid' | 'floral' | 'other'
  stretch?: number
  notes?: string
  createdAt: string
}

export interface PatternLayer {
  id: string
  patternId: string
  name: string
  imageDataUrl: string
  x: number
  y: number
  width: number
  height: number
  scaleX: number
  scaleY: number
  rotation: number
  opacity: number
  zIndex: number
  linkedFabricId?: string
  linkedFabricImageUrl?: string
}

export interface Pattern {
  id: string
  name: string
  garmentType: GarmentType
  imageDataUrl: string
  width: number
  height: number
  notes?: string
  createdAt: string
}

export interface CroquisViewState {
  zoom: number
  panX: number
  panY: number
  patternLayers: PatternLayer[]
}

export interface Project {
  id: string
  title: string
  description: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  measurementsId: string | null
  fabricIds: string[]
  patternIds: string[]
  croquisView?: CroquisViewState
  notes: string
  tags: string[]
}

export const PROJECT_STATUSES: ProjectStatus[] = [
  'planning',
  'cutting',
  'sewing',
  'fitting',
  'finished',
]

export const GARMENT_TYPES: GarmentType[] = [
  'dress',
  'top',
  'skirt',
  'pants',
  'shorts',
  'jacket',
  'coat',
  'blouse',
  'shirt',
  'jumpsuit',
  'other',
]
