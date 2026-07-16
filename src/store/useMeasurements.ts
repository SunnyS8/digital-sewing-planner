import { create } from 'zustand'
import type { BodyMeasurements } from '@/types'
import { defaultMeasurements } from '@/types'
import { getAll, getById, create as dbCreate, update as dbUpdate, remove as dbRemove, generateId, KEYS } from '@/db'

interface MeasurementsState {
  items: BodyMeasurements[]
  selectedId: string | null
  load: () => void
  select: (id: string | null) => void
  get: (id: string) => BodyMeasurements | undefined
  create: (name: string, overrides?: Partial<BodyMeasurements>) => BodyMeasurements
  update: (id: string, data: Partial<BodyMeasurements>) => BodyMeasurements | undefined
  remove: (id: string) => boolean
}

export const useMeasurements = create<MeasurementsState>((set, getState) => ({
  items: [],
  selectedId: null,
  load: () => {
    const items = getAll<BodyMeasurements>(KEYS.MEASUREMENTS)
    set({ items })
  },
  select: (id) => set({ selectedId: id }),
  get: (id) => getById<BodyMeasurements>(KEYS.MEASUREMENTS, id),
  create: (name, overrides) => {
    const now = new Date().toISOString()
    const item: BodyMeasurements = {
      id: generateId(),
      name,
      ...defaultMeasurements,
      ...overrides,
    }
    dbCreate(KEYS.MEASUREMENTS, item)
    set({ items: getAll<BodyMeasurements>(KEYS.MEASUREMENTS) })
    return item
  },
  update: (id, data) => {
    const existing = getById<BodyMeasurements>(KEYS.MEASUREMENTS, id)
    if (!existing) return undefined
    const updated = { ...existing, ...data }
    dbUpdate(KEYS.MEASUREMENTS, updated)
    set({ items: getAll<BodyMeasurements>(KEYS.MEASUREMENTS) })
    return updated
  },
  remove: (id) => {
    const result = dbRemove<BodyMeasurements>(KEYS.MEASUREMENTS, id)
    if (result) set({ items: getAll<BodyMeasurements>(KEYS.MEASUREMENTS) })
    return result
  },
}))
