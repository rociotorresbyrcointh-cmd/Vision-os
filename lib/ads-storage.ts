// ─── Gestión de anuncios guardados ────────────────────────────────

export interface SavedAd {
  id: string
  platform: string
  headline: string
  copy: string
  cta: string
  description: string
  tone: string
  objective: string
  accentColor: string
  createdAt: string
  usedCount: number
}

export const saveAd = (userId: string, ad: Omit<SavedAd, 'id' | 'createdAt' | 'usedCount'>): SavedAd => {
  const key = `bos_ads_${userId}`
  const ads = JSON.parse(localStorage.getItem(key) || '[]') as SavedAd[]

  const newAd: SavedAd = {
    ...ad,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    usedCount: 0,
  }

  ads.push(newAd)
  localStorage.setItem(key, JSON.stringify(ads))
  return newAd
}

export const getAds = (userId: string): SavedAd[] => {
  const key = `bos_ads_${userId}`
  return JSON.parse(localStorage.getItem(key) || '[]') as SavedAd[]
}

export const deleteAd = (userId: string, adId: string): void => {
  const key = `bos_ads_${userId}`
  const ads = JSON.parse(localStorage.getItem(key) || '[]') as SavedAd[]
  const filtered = ads.filter(a => a.id !== adId)
  localStorage.setItem(key, JSON.stringify(filtered))
}

export const incrementUsedCount = (userId: string, adId: string): void => {
  const key = `bos_ads_${userId}`
  const ads = JSON.parse(localStorage.getItem(key) || '[]') as SavedAd[]
  const updated = ads.map(a => a.id === adId ? { ...a, usedCount: a.usedCount + 1 } : a)
  localStorage.setItem(key, JSON.stringify(updated))
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}
