import { create } from 'zustand'
import type { Fabric } from '@/types'
import { getAll, getById, create as dbCreate, update as dbUpdate, remove as dbRemove, generateId, KEYS } from '@/db'

interface FabricsState {
  items: Fabric[]
  load: () => void
  get: (id: string) => Fabric | undefined
  create: (data: Omit<Fabric, 'id' | 'createdAt'>) => Fabric
  update: (id: string, data: Partial<Fabric>) => Fabric | undefined
  remove: (id: string) => boolean
}

export const useFabrics = create<FabricsState>((set) => ({
  items: [],
  load: () => {
    const items = getAll<Fabric>(KEYS.FABRICS)
    set({ items })
  },
  get: (id) => getById<Fabric>(KEYS.FABRICS, id),
  create: (data) => {
    const now = new Date().toISOString()
    const item: Fabric = { id: generateId(), createdAt: now, ...data }
    dbCreate(KEYS.FABRICS, item)
    set({ items: getAll<Fabric>(KEYS.FABRICS) })
    return item
  },
  update: (id, data) => {
    const existing = getById<Fabric>(KEYS.FABRICS, id)
    if (!existing) return undefined
    const updated = { ...existing, ...data }
    dbUpdate(KEYS.FABRICS, updated)
    set({ items: getAll<Fabric>(KEYS.FABRICS) })
    return updated
  },
  remove: (id) => {
    const result = dbRemove<Fabric>(KEYS.FABRICS, id)
    if (result) set({ items: getAll<Fabric>(KEYS.FABRICS) })
    return result
  },
}))
