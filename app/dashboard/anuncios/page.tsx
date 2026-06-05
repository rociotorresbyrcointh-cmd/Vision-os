'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Megaphone, Sparkles, Copy, Check, ChevronDown, ImageIcon, AlertTriangle, Settings, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const platforms  = ['Meta (Facebook)', 'Instagram', 'TikTok', 'Google Ads', 'LinkedIn']
const objectives = ['Ventas', 'Reconocimiento de marca', 'Generación de leads', 'Tráfico web', 'Engagement', 'Reservas / Turnos']
const tones      = ['Profesional', 'Cercano y casual', 'Urgente', 'Inspiracional', 'Divertido', 'Exclusivo / Premium']

interface Config { businessName: string; sector: string; services: string; claudeApiKey: string; openaiApiKey: string }
interface AdResult { copy: string; headline: string; cta: string; description: string }

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
  padding: '10px 14px', color: 'white', fontSize: 13,
  outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.2s',
  appearance: 'none', WebkitAppearance: 'none',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 700,
  color: 'rgba(255,255,255,0.35)', letterSpacing: '0.13em',
  textTransform: 'uppercase', marginBottom: 7, fontFamily: "'Orbitron', sans-serif",
}
const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
  e.target.style.borderColor = 'rgba(37,99,255,0.5)'
const blur  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
  e.target.style.borderColor = 'rgba(255,255,255,0.08)'

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

export default function AnunciosPage() {
  const { user } = useAuth()
  const [config,    setConfig]    = useState<Partial<Config>>({})
  const [platform,  setPlatform]  = useState(platforms[0])
  const [objective, setObjective] = useState(objectives[0])
  const [tone,      setTone]      = useState(tones[0])
  const [product,   setProduct]   = useState('')
  const [audience,  setAudience]  = useState('')
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState<AdResult | null>(null)
  const [error,     setError]     = useState('')
  const [copied,    setCopied]    = useState(false)

  useEffect(() => {
    if (!user) return
    const stored = localStorage.getItem(`bos_config_${user.id}`)
    if (stored) setConfig(JSON.parse(stored))
  }, [user])

  const hasApiKey = !!config.claudeApiKey

  const generate = async () => {
    if (!product.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    if (!hasApiKey) {
      // Smart demo mode — varied, quality responses based on inputs
      await new Promise(r => setTimeout(r, 1200))
      const demos: AdResult[] = [
        {
          copy: `¿Cuánto tiempo llevas postergando ese cambio que tanto querés?\n\nEn ${config.businessName || 'nuestro negocio'} entendemos que el tiempo es tu recurso más valioso. Por eso diseñamos un servicio pensado exactamente para vos.\n\n✓ Resultados desde la primera sesión\n✓ Atención personalizada 100%\n✓ Sin compromisos — probá y decidís\n\nPlazas limitadas esta semana. Reservá ahora y empezá el cambio que tu vida merece.`,
          headline: `Transformá tu bienestar esta semana`,
          cta: 'Reservar mi lugar',
          description: `Servicio profesional personalizado. Primeras plazas con descuento especial.`,
        },
        {
          copy: `El secreto de los que mejores resultados obtienen en ${config.sector || 'este rubro'}: eligen bien a quién confiarles su tiempo.\n\n📍 ${config.businessName || 'Tu negocio de confianza'}\n\nLo que nos diferencia no es el servicio — es cómo lo vivís. Cada detalle está pensado para que salgas mejor de lo que entraste.\n\n→ Turno disponible HOY\n→ Sin lista de espera\n→ Precio justo, resultado real\n\nEscribinos y agendamos en 2 minutos.`,
          headline: `El resultado que esperabas, ahora`,
          cta: 'Agendar ahora',
          description: `Disponibilidad inmediata. Experiencia que se nota desde el primer día.`,
        },
        {
          copy: `Para ${audience || 'quienes exigen lo mejor'}: llegó el momento de elevar tu estándar.\n\n${product} diseñado para quienes saben que los resultados no se improvisan.\n\n⚡ Proceso probado\n⚡ Equipo experto\n⚡ Resultados que duran\n\nNo te conformes con menos cuando podés tener exactamente lo que buscás.\n\nContactanos hoy — el próximo paso es tuyo.`,
          headline: `Elevá tu estándar, ahora`,
          cta: 'Quiero saber más',
          description: `Solución profesional para quienes buscan resultados reales y duraderos.`,
        },
      ]
      setResult(demos[Math.floor(Math.random() * demos.length)])
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

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 6px', fontFamily: "'Orbitron', sans-serif" }}>
          Vision OS · Marketing
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Megaphone size={18} style={{ color: '#2563FF' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>Creador de Anuncios</h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: 0 }}>Generá copy e imágenes con IA para tus campañas</p>
          </div>
        </div>
        <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(37,99,255,0.25),transparent 60%)', marginTop: 16 }} />
      </div>

      {/* API Key status banner */}
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Form */}
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 22 }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 18px', fontFamily: "'Orbitron', sans-serif" }}>
            Parámetros del anuncio
          </p>

          {config.businessName && (
            <div style={{ background: 'rgba(37,99,255,0.07)', border: '1px solid rgba(37,99,255,0.15)', borderRadius: 9, padding: '9px 12px', marginBottom: 16, display: 'flex', gap: 8 }}>
              <span style={{ color: '#60a5fa', fontSize: 11 }}>Negocio:</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{config.businessName}</span>
              {config.sector && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>· {config.sector}</span>}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <SelectField label="Plataforma"  value={platform}  onChange={setPlatform}  options={platforms} />
            <SelectField label="Objetivo"    value={objective} onChange={setObjective} options={objectives} />
            <SelectField label="Tono"        value={tone}      onChange={setTone}      options={tones} />

            <div>
              <label style={labelStyle}>Producto o servicio a promocionar <span style={{ color: '#2563FF' }}>*</span></label>
              <textarea
                value={product}
                onChange={e => setProduct(e.target.value)}
                style={{ ...inputStyle, resize: 'none', height: 90 }}
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
                placeholder="Ej: mujeres 30-50 años, Buenos Aires, interesadas en bienestar"
                onFocus={focus}
                onBlur={blur}
              />
            </div>

            <button
              onClick={generate}
              disabled={loading || !product.trim()}
              style={{
                background: loading || !product.trim() ? 'rgba(37,99,255,0.2)' : 'linear-gradient(135deg,#3b82f6,#2563FF)',
                color: 'white', border: 'none', borderRadius: 10, padding: '12px 0',
                fontSize: 13, fontWeight: 700,
                cursor: loading || !product.trim() ? 'not-allowed' : 'pointer',
                boxShadow: !loading && product.trim() ? '0 0 22px rgba(37,99,255,0.35)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s', letterSpacing: '0.03em',
              }}
            >
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', width: 13, height: 13, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  {hasApiKey ? 'Generando con IA...' : 'Generando...'}
                  <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </>
              ) : (
                <><Sparkles size={15} /> {hasApiKey ? 'Generar con IA' : 'Generar anuncio'}</>
              )}
            </button>
          </div>
        </div>

        {/* Result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 12, padding: '12px 16px' }}>
              <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>
            </div>
          )}

          {!result && !error ? (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 16, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(37,99,255,0.07)', border: '1px solid rgba(37,99,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Sparkles size={22} style={{ color: 'rgba(37,99,255,0.4)' }} />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.26)', fontSize: 13, fontWeight: 500, margin: '0 0 4px' }}>Tu anuncio aparecerá acá</p>
                <p style={{ color: 'rgba(255,255,255,0.13)', fontSize: 11, margin: 0 }}>Completá el formulario y hacé clic en Generar</p>
              </div>
            </div>
          ) : result && (
            <>
              {/* Copy */}
              <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0, fontFamily: "'Orbitron', sans-serif" }}>
                    Copy del anuncio
                  </p>
                  <button onClick={copyText} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '5px 12px', color: copied ? '#34d399' : 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>

                <div style={{ background: '#07070F', borderRadius: 10, padding: '14px 16px', marginBottom: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <pre style={{ color: 'rgba(255,255,255,0.78)', fontSize: 12.5, whiteSpace: 'pre-wrap', fontFamily: "'Inter', sans-serif", margin: 0, lineHeight: 1.72 }}>
                    {result.copy}
                  </pre>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: result.description ? 8 : 0 }}>
                  {[{ label: 'TITULAR', value: result.headline }, { label: 'CTA', value: result.cta }].map(item => (
                    <div key={item.label} style={{ background: 'rgba(37,99,255,0.07)', border: '1px solid rgba(37,99,255,0.14)', borderRadius: 10, padding: '10px 12px' }}>
                      <p style={{ color: '#60a5fa', fontSize: 9, fontWeight: 700, margin: '0 0 5px', letterSpacing: '0.14em', fontFamily: "'Orbitron', sans-serif" }}>{item.label}</p>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, margin: 0, lineHeight: 1.4 }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {result.description && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 12px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontWeight: 700, margin: '0 0 4px', letterSpacing: '0.14em', fontFamily: "'Orbitron', sans-serif" }}>DESCRIPCIÓN</p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0, lineHeight: 1.4 }}>{result.description}</p>
                  </div>
                )}
              </div>

              {/* Image placeholder */}
              <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 12px', fontFamily: "'Orbitron', sans-serif" }}>
                  Imagen generada
                </p>
                <div style={{ background: '#07070F', borderRadius: 10, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(37,99,255,0.16)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <ImageIcon size={24} style={{ color: 'rgba(37,99,255,0.28)', display: 'block', margin: '0 auto 7px' }} />
                    <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11, margin: 0 }}>
                      {config.openaiApiKey ? 'Generación de imagen próximamente' : 'Agregá tu API key de OpenAI para generar imágenes'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
