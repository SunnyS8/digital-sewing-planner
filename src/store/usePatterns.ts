import { create } from 'zustand'
import type { Pattern } from '@/types'
import { getAll, getById, create as dbCreate, update as dbUpdate, remove as dbRemove, generateId, KEYS } from '@/db'

interface PatternsState {
  items: Pattern[]
  load: () => void
  get: (id: string) => Pattern | undefined
  create: (data: Omit<Pattern, 'id' | 'createdAt'>) => Pattern
  update: (id: string, data: Partial<Pattern>) => Pattern | undefined
  remove: (id: string) => boolean
}

export const usePatterns = create<PatternsState>((set) => ({
  items: [],
  load: () => {
    const items = getAll<Pattern>(KEYS.PATTERNS)
    set({ items })
  },
  get: (id) => getById<Pattern>(KEYS.PATTERNS, id),
  create: (data) => {
    const now = new Date().toISOString()
    const item: Pattern = {
      id: generateId(),
      createdAt: now,
      ...data,
      width: data.width || 400,
      height: data.height || 600,
    }
    dbCreate(KEYS.PATTERNS, item)
    set({ items: getAll<Pattern>(KEYS.PATTERNS) })
    return item
  },
  update: (id, data) => {
    const existing = getById<Pattern>(KEYS.PATTERNS, id)
    if (!existing) return undefined
    const updated = { ...existing, ...data }
    dbUpdate(KEYS.PATTERNS, updated)
    set({ items: getAll<Pattern>(KEYS.PATTERNS) })
    return updated
  },
  remove: (id) => {
    const result = dbRemove<Pattern>(KEYS.PATTERNS, id)
    if (result) set({ items: getAll<Pattern>(KEYS.PATTERNS) })
    return result
  },
}))
