'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Megaphone, Sparkles, Copy, Check, ChevronDown, ImageIcon, AlertTriangle, Settings, CheckCircle, Palette, Save, Trash2, Repeat2, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { saveAd, getAds, deleteAd, incrementUsedCount, formatDate, SavedAd } from '@/lib/ads-storage'

const platforms = ['Meta (Facebook)', 'Instagram', 'TikTok', 'Google Ads', 'LinkedIn', 'Twitter/X', 'Pinterest', 'YouTube']
const objectives = ['Ventas', 'Reconocimiento de marca', 'Generación de leads', 'Tráfico web', 'Engagement', 'Reservas / Turnos']
const tones = ['Profesional', 'Cercano y casual', 'Urgente', 'Inspiracional', 'Divertido', 'Exclusivo / Premium']
const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

interface Config { businessName: string; sector: string; services: string; claudeApiKey: string; openaiApiKey: string }
interface AdResult { copy: string; headline: string; cta: string; description: string }

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
  padding: '10px 14px', color: 'white', fontSize: 13,
  outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.2s',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 700,
  color: 'rgba(255,255,255,0.35)', letterSpacing: '0.13em',
  textTransform: 'uppercase', marginBottom: 7, fontFamily: "'Orbitron', sans-serif",
}
const focus = (e: React.FocusEvent<any>) => e.target.style.borderColor = 'rgba(37,99,255,0.5)'
const blur = (e: React.FocusEvent<any>) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur}>
          {options.map(o => <option key={o} value={o} style={{ background: '#0a0a18', color: 'white' }}>{o}</option>)}
        </select>
        <ChevronDown size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
      </div>
    </div>
  )
}

// Previsualización por plataforma
function PreviewAd({ platform, result, accentColor }: { platform: string; result: AdResult | null; accentColor: string }) {
  if (!result) return null

  const PreviewComponents: Record<string, any> = {
    'Meta (Facebook)': {
      title: 'Facebook Post',
      render: () => (
        <div style={{ background: '#fff', color: '#000', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
          <div style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: accentColor, opacity: 0.7 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Tu negocio</div>
              <div style={{ fontSize: '11px', color: '#666' }}>Ahora</div>
            </div>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ marginBottom: '12px', fontWeight: 'bold', fontSize: '15px' }}>{result.headline}</div>
            <div style={{ whiteSpace: 'pre-wrap', marginBottom: '12px', fontSize: '13px', lineHeight: 1.5, color: '#333' }}>{result.copy}</div>
            <button style={{ background: accentColor, color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 24px', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '13px' }}>{result.cta}</button>
          </div>
        </div>
      )
    },
    'Instagram': {
      title: 'Instagram Post Caption',
      render: () => (
        <div style={{ background: '#fff', color: '#000', borderRadius: '12px', overflow: 'hidden', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
          <div style={{ marginBottom: '12px', fontWeight: 'bold', fontSize: '15px', color: accentColor }}>{result.headline}</div>
          <div style={{ whiteSpace: 'pre-wrap', marginBottom: '12px', fontSize: '13px', lineHeight: 1.5 }}>{result.copy.substring(0, 150)}...</div>
          <div style={{ color: accentColor, fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Ver más</div>
        </div>
      )
    },
    'TikTok': {
      title: 'TikTok Video Caption',
      render: () => (
        <div style={{ background: '#000', color: '#fff', borderRadius: '12px', overflow: 'hidden', padding: '16px', position: 'relative', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ marginBottom: '12px', fontWeight: 'bold', fontSize: '16px', color: accentColor }}>{result.headline}</div>
          <div style={{ whiteSpace: 'pre-wrap', marginBottom: '12px', fontSize: '13px', lineHeight: 1.5 }}>{result.copy.substring(0, 120)}...</div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px', fontSize: '24px' }}>❤️ 💬 ↗️</div>
        </div>
      )
    },
    'LinkedIn': {
      title: 'LinkedIn Post',
      render: () => (
        <div style={{ background: '#fff', color: '#000', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 0 0 1px #e5e7eb' }}>
          <div style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: accentColor, opacity: 0.7 }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold' }}>Tu empresa</div>
              <div style={{ fontSize: '12px', color: '#666' }}>2 minutos</div>
            </div>
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '12px', fontWeight: 'bold', fontSize: '15px' }}>{result.headline}</div>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: 1.6, color: '#333' }}>{result.copy.substring(0, 180)}...</div>
          </div>
          <div style={{ borderTop: '1px solid #e5e7eb', padding: '8px 16px', display: 'flex', justifyContent: 'space-around', color: '#666', fontSize: '12px' }}>
            <span>👍 Like</span>
            <span>💬 Comentar</span>
            <span>↗️ Compartir</span>
          </div>
        </div>
      )
    },
    'Twitter/X': {
      title: 'Tweet',
      render: () => (
        <div style={{ background: '#fff', color: '#000', borderRadius: '12px', overflow: 'hidden', padding: '16px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: accentColor, opacity: 0.6, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold' }}>@tuempresa</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Ahora</div>
            </div>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: 1.5, marginBottom: '12px' }}>{result.copy.substring(0, 220)}...</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', color: '#666', fontSize: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
            <span>💬</span>
            <span>🔄</span>
            <span>❤️</span>
            <span>📤</span>
          </div>
        </div>
      )
    },
    'Pinterest': {
      title: 'Pinterest Pin',
      render: () => (
        <div style={{ background: '#fff', color: '#000', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          <div style={{ background: accentColor, height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '32px', color: '#fff' }}>📌</div>
          </div>
          <div style={{ padding: '12px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>{result.headline}</div>
            <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.4 }}>{result.copy.substring(0, 100)}...</div>
          </div>
        </div>
      )
    },
    'YouTube': {
      title: 'YouTube Video Description',
      render: () => (
        <div style={{ background: '#f9f9f9', color: '#030303', borderRadius: '8px', padding: '16px', border: '1px solid #e0e0e0' }}>
          <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '8px' }}>{result.headline}</div>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: 1.5, marginBottom: '12px' }}>{result.copy.substring(0, 180)}...</div>
          <button style={{ background: accentColor, color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>{result.cta}</button>
        </div>
      )
    },
    'Google Ads': {
      title: 'Google Ads Preview',
      render: () => (
        <div style={{ background: '#f5f5f5', color: '#000', borderRadius: '8px', padding: '12px', border: '1px solid #dadce0' }}>
          <div style={{ fontSize: '11px', color: '#006621', marginBottom: '4px' }}>tudominio.com › categoría › página</div>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1a73e8', marginBottom: '4px', textDecoration: 'underline', cursor: 'pointer' }}>{result.headline}</div>
          <div style={{ fontSize: '13px', color: '#333', marginBottom: '6px' }}>{result.description || result.cta}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{result.copy.substring(0, 100)}...</div>
        </div>
      )
    },
  }

  const preview = PreviewComponents[platform] || PreviewComponents['Meta (Facebook)']

  return (
    <div>
      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 12px', fontFamily: "'Orbitron', sans-serif" }}>
        {preview.title}
      </p>
      <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
        {preview.render()}
      </div>
    </div>
  )
}

export default function MarketingPage() {
  const { user } = useAuth()
  const [config, setConfig] = useState<Partial<Config>>({})
  const [platform, setPlatform] = useState(platforms[0])
  const [objective, setObjective] = useState(objectives[0])
  const [tone, setTone] = useState(tones[0])
  const [product, setProduct] = useState('')
  const [audience, setAudience] = useState('')
  const [accentColor, setAccentColor] = useState(colors[0])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AdResult | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [savedAds, setSavedAds] = useState<SavedAd[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    const stored = localStorage.getItem(`bos_config_${user.id}`)
    if (stored) setConfig(JSON.parse(stored))
    // Cargar anuncios guardados
    setSavedAds(getAds(user.id))
  }, [user])

  const hasApiKey = !!config.claudeApiKey

  const generate = async () => {
    if (!product.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    if (!hasApiKey) {
      await new Promise(r => setTimeout(r, 1200))
      const demos: AdResult[] = [
        {
          copy: `¿Cuánto tiempo llevas postergando ese cambio que tanto querés?\n\nEn ${config.businessName || 'nuestro negocio'} entendemos que el tiempo es tu recurso más valioso. Por eso diseñamos un servicio pensado exactamente para vos.\n\n✓ Resultados desde la primera sesión\n✓ Atención personalizada 100%\n✓ Sin compromisos — probá y decidís\n\nPlazas limitadas esta semana. Reservá ahora y empezá el cambio que tu vida merece.`,
          headline: `Transformá tu bienestar esta semana`,
          cta: 'Reservar mi lugar',
          description: `Servicio profesional personalizado. Primeras plazas con descuento especial.`,
        },
      ]
      setResult(demos[0])
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/generar-anuncio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform, objective, tone, product, audience,
          businessName: config.businessName,
          sector: config.sector,
          services: config.services,
          apiKey: config.claudeApiKey,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error generando el anuncio'); return }
      setResult(data.data)
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const copyText = () => {
    if (!result) return
    navigator.clipboard.writeText(result.copy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveAd = () => {
    if (!user || !result) return
    saveAd(user.id, {
      platform,
      headline: result.headline,
      copy: result.copy,
      cta: result.cta,
      description: result.description,
      tone,
      objective,
      accentColor,
    })
    setSavedAds(getAds(user.id))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReuseAd = (ad: SavedAd) => {
    if (!user) return
    setPlatform(ad.platform)
    setTone(ad.tone)
    setObjective(ad.objective)
    setAccentColor(ad.accentColor)
    setProduct(ad.copy.substring(0, 50))
    setResult({
      headline: ad.headline,
      copy: ad.copy,
      cta: ad.cta,
      description: ad.description,
    })
    incrementUsedCount(user.id, ad.id)
    setSavedAds(getAds(user.id))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteAd = (adId: string) => {
    if (!user) return
    deleteAd(user.id, adId)
    setSavedAds(getAds(user.id))
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 6px', fontFamily: "'Orbitron', sans-serif" }}>
          Vision OS · Marketing
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Megaphone size={18} style={{ color: '#2563FF' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>Marketing & Redes Sociales</h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: 0 }}>Creador de anuncios con IA y previsualización en tiempo real</p>
          </div>
        </div>
        <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(37,99,255,0.25),transparent 60%)', marginTop: 16 }} />
      </div>

      {/* API Key status */}
      {hasApiKey ? (
        <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle size={14} style={{ color: '#10b981', flexShrink: 0 }} />
          <span style={{ color: '#10b981', fontSize: 12, fontWeight: 600 }}>IA activada — </span>
          <span style={{ color: 'rgba(16,185,129,0.6)', fontSize: 12 }}>Claude está generando anuncios reales y únicos para tu negocio.</span>
        </div>
      ) : (
        <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.16)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
          <span style={{ color: '#fbbf24', fontSize: 12, fontWeight: 600 }}>Modo demo — </span>
          <span style={{ color: 'rgba(251,191,36,0.55)', fontSize: 12 }}>Los anuncios son de ejemplo. </span>
          <Link href="/dashboard/configuracion" style={{ color: '#fbbf24', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', flexShrink: 0 }}>
            <Settings size={12} /> Configurar API key
          </Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 18 }}>
        {/* Form */}
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 22, height: 'fit-content' }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 18px', fontFamily: "'Orbitron', sans-serif" }}>
            Configuración del anuncio
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <SelectField label="Plataforma" value={platform} onChange={setPlatform} options={platforms} />
            <SelectField label="Objetivo" value={objective} onChange={setObjective} options={objectives} />
            <SelectField label="Tono" value={tone} onChange={setTone} options={tones} />

            <div>
              <label style={labelStyle}>Color de marca</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      background: color,
                      border: accentColor === color ? '3px solid white' : '2px solid rgba(255,255,255,0.2)',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Producto o servicio *</label>
              <textarea
                value={product}
                onChange={e => setProduct(e.target.value)}
                style={{ ...inputStyle, resize: 'none', height: 100 }}
                placeholder="Ej: Sesión de masajes descontracturantes, 60 minutos, incluye aromaterapia..."
                onFocus={focus}
                onBlur={blur}
              />
            </div>

            <div>
              <label style={labelStyle}>Audiencia objetivo</label>
              <input
                type="text"
                value={audience}
                onChange={e => setAudience(e.target.value)}
                style={inputStyle}
                placeholder="Ej: mujeres 30-50 años, Buenos Aires"
                onFocus={focus}
                onBlur={blur}
              />
            </div>

            <button
              onClick={generate}
              disabled={loading || !product.trim()}
              style={{
                background: loading || !product.trim() ? 'rgba(37,99,255,0.2)' : 'linear-gradient(135deg,#3b82f6,#2563FF)',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                padding: '12px 0',
                fontSize: 13,
                fontWeight: 700,
                cursor: loading || !product.trim() ? 'not-allowed' : 'pointer',
                boxShadow: !loading && product.trim() ? '0 0 22px rgba(37,99,255,0.35)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', width: 13, height: 13, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  {hasApiKey ? 'Generando...' : 'Generando...'}
                  <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </>
              ) : (
                <><Sparkles size={15} /> Generar anuncio</>
              )}
            </button>
          </div>
        </div>

        {/* Result y Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 12, padding: '12px 16px' }}>
              <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>
            </div>
          )}

          {!result ? (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 16, padding: 40, textAlign: 'center' }}>
              <Sparkles size={32} style={{ color: 'rgba(37,99,255,0.3)', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: 'rgba(255,255,255,0.26)', fontSize: 14, margin: 0 }}>Tu anuncio aparecerá aquí</p>
            </div>
          ) : (
            <>
              {/* Copy */}
              <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0, fontFamily: "'Orbitron', sans-serif" }}>
                    Copy
                  </p>
                  <button onClick={copyText} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '5px 12px', color: copied ? '#34d399' : 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>

                <div style={{ background: '#07070F', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.04)', minHeight: 120 }}>
                  <pre style={{ color: 'rgba(255,255,255,0.78)', fontSize: 12, whiteSpace: 'pre-wrap', fontFamily: "'Inter', sans-serif", margin: 0, lineHeight: 1.6 }}>
                    {result.copy}
                  </pre>
                </div>
              </div>

              {/* Preview */}
              <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <PreviewAd platform={platform} result={result} accentColor={accentColor} />
              </div>

              {/* Save button */}
              <button
                onClick={handleSaveAd}
                style={{
                  background: saved ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.1)',
                  border: saved ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(59,130,246,0.2)',
                  color: saved ? '#10b981' : '#60a5fa',
                  borderRadius: 10,
                  padding: '10px 16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                  width: '100%',
                }}
              >
                {saved ? <><Check size={14} /> Guardado</> : <><Save size={14} /> Guardar anuncio</>}
              </button>
            </>
          )}
        </div>

        {/* Saved Ads */}
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, height: 'fit-content' }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 14px', fontFamily: "'Orbitron', sans-serif" }}>
            Anuncios guardados ({savedAds.length})
          </p>

          {savedAds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, margin: 0 }}>Sin anuncios guardados</p>
              <p style={{ color: 'rgba(255,255,255,0.1)', fontSize: 11, margin: '4px 0 0' }}>Guarda tus mejores anuncios</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '600px', overflowY: 'auto' }}>
              {savedAds.map(ad => (
                <div key={ad.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 }}>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: ad.accentColor, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {ad.platform.substring(0, 8)}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9 }}>{formatDate(ad.createdAt)}</span>
                    </div>
                    <p style={{ color: 'white', fontSize: 11, fontWeight: 600, margin: '0 0 4px', lineHeight: 1.3 }}>
                      {ad.headline.substring(0, 40)}...
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, margin: 0 }}>
                      {ad.copy.substring(0, 50)}...
                    </p>
                    {ad.usedCount > 0 && (
                      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, margin: '4px 0 0' }}>
                        Usado {ad.usedCount}x
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <button
                      onClick={() => handleReuseAd(ad)}
                      style={{
                        background: 'rgba(34,197,94,0.1)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        color: '#34d399',
                        borderRadius: 6,
                        padding: '6px 8px',
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                      }}
                    >
                      <Repeat2 size={12} /> Reutilizar
                    </button>
                    <button
                      onClick={() => handleDeleteAd(ad.id)}
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#f87171',
                        borderRadius: 6,
                        padding: '6px 8px',
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                      }}
                    >
                      <Trash2 size={12} /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
