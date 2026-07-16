const PREFIX = 'planner:'

function getItem<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setItem<T>(key: string, data: T[]): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(data))
}

export function getAll<T>(key: string): T[] {
  return getItem<T>(key)
}

export function getById<T extends { id: string }>(key: string, id: string): T | undefined {
  return getAll<T>(key).find((item) => item.id === id)
}

export function create<T extends { id: string }>(key: string, item: T): T {
  const items = getAll<T>(key)
  items.push(item)
  setItem(key, items)
  return item
}

export function update<T extends { id: string }>(key: string, item: T): T | undefined {
  const items = getAll<T>(key)
  const index = items.findIndex((i) => i.id === item.id)
  if (index === -1) return undefined
  items[index] = item
  setItem(key, items)
  return item
}

export function remove<T extends { id: string }>(key: string, id: string): boolean {
  const items = getAll<T>(key)
  const filtered = items.filter((i) => i.id !== id)
  if (filtered.length === items.length) return false
  setItem(key, filtered)
  return true
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const KEYS = {
  MEASUREMENTS: 'measurements',
  PROJECTS: 'projects',
  FABRICS: 'fabrics',
  PATTERNS: 'patterns',
} as const

export { KEYS }
