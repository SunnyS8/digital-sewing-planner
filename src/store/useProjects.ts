import { create } from 'zustand'
import type { Project } from '@/types'
import { getAll, getById, create as dbCreate, update as dbUpdate, remove as dbRemove, generateId, KEYS } from '@/db'

interface ProjectsState {
  items: Project[]
  selectedId: string | null
  load: () => void
  select: (id: string | null) => void
  get: (id: string) => Project | undefined
  create: (data: Pick<Project, 'title' | 'description'> & Partial<Project>) => Project
  update: (id: string, data: Partial<Project>) => Project | undefined
  remove: (id: string) => boolean
}

export const useProjects = create<ProjectsState>((set) => ({
  items: [],
  selectedId: null,
  load: () => {
    const items = getAll<Project>(KEYS.PROJECTS)
    set({ items })
  },
  select: (id) => set({ selectedId: id }),
  get: (id) => getById<Project>(KEYS.PROJECTS, id),
  create: (data) => {
    const now = new Date().toISOString()
    const item: Project = {
      id: generateId(),
      title: data.title,
      description: data.description || '',
      status: 'planning',
      createdAt: now,
      updatedAt: now,
      measurementsId: data.measurementsId ?? null,
      fabricIds: data.fabricIds ?? [],
      patternIds: data.patternIds ?? [],
      croquisView: data.croquisView,
      notes: data.notes || '',
      tags: data.tags ?? [],
    }
    dbCreate(KEYS.PROJECTS, item)
    set({ items: getAll<Project>(KEYS.PROJECTS) })
    return item
  },
  update: (id, data) => {
    const existing = getById<Project>(KEYS.PROJECTS, id)
    if (!existing) return undefined
    const updated: Project = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    }
    dbUpdate(KEYS.PROJECTS, updated)
    set({ items: getAll<Project>(KEYS.PROJECTS) })
    return updated
  },
  remove: (id) => {
    const result = dbRemove<Project>(KEYS.PROJECTS, id)
    if (result) set({ items: getAll<Project>(KEYS.PROJECTS) })
    return result
  },
}))
