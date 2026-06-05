'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Settings, Key, Building2, Save, Eye, EyeOff, CheckCircle, Calendar } from 'lucide-react'
import { SectorSelect } from '@/components/SectorSelect'

interface Config {
  businessName: string
  sector: string
  services: string
  phone: string
  address: string
  website: string
  claudeApiKey: string
  openaiApiKey: string
  turnCalendarEnabled?: boolean
  publicReservationCode?: string
  whatsappNumber?: string
  whatsappReminder24h?: string
  whatsappReminder2h?: string
}

const DEFAULT: Config = { businessName: '', sector: '', services: '', phone: '', address: '', website: '', claudeApiKey: '', openaiApiKey: '', turnCalendarEnabled: true, publicReservationCode: '', whatsappNumber: '', whatsappReminder24h: '', whatsappReminder2h: '' }

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
const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
  e.target.style.borderColor = 'rgba(37,99,255,0.5)'
const blur  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
  e.target.style.borderColor = 'rgba(255,255,255,0.08)'

function Section({ title, icon: Icon, color = '#2563FF', children }: { title: string; icon: any; color?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '22px 22px 20px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${color},transparent)` }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}14`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} style={{ color }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0, fontFamily: "'Orbitron', sans-serif" }}>
          {title}
        </p>
      </div>
      {children}
    </div>
  )
}

function ApiKeyField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="sk-ant-..."
          style={{ ...inputStyle, paddingRight: 42 }}
          onFocus={focus}
          onBlur={blur}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 4 }}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {value && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
          <span style={{ color: '#10b981', fontSize: 11 }}>API key guardada</span>
        </div>
      )}
    </div>
  )
}

export default function ConfiguracionPage() {
  const { user } = useAuth()
  const [config, setConfig] = useState<Config>(DEFAULT)
  const [saved,  setSaved]  = useState(false)

  useEffect(() => {
    if (!user) return
    const stored = localStorage.getItem(`bos_config_${user.id}`)
    if (stored) setConfig({ ...DEFAULT, ...JSON.parse(stored) })
  }, [user])

  const set = (key: keyof Config) => (val: string) =>
    setConfig(prev => ({ ...prev, [key]: val }))

  const toggle = (key: keyof Config) => () =>
    setConfig(prev => ({ ...prev, [key]: !prev[key] }))

  const generatePublicCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    setConfig(prev => ({ ...prev, publicReservationCode: code }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const save = () => {
    if (!user) return
    localStorage.setItem(`bos_config_${user.id}`, JSON.stringify(config))

    // Guardar código público si existe
    if (config.publicReservationCode) {
      const publicBiz = localStorage.getItem('bos_public_businesses') || '{}'
      const businesses = JSON.parse(publicBiz)
      businesses[config.publicReservationCode] = { userId: user.id, businessName: config.businessName }
      localStorage.setItem('bos_public_businesses', JSON.stringify(businesses))
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 6px', fontFamily: "'Orbitron', sans-serif" }}>
          Vision OS · Sistema
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={18} style={{ color: '#2563FF' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>Configuración</h1>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: 0 }}>Datos del negocio e integraciones</p>
            </div>
          </div>

          <button
            onClick={save}
            style={{
              background: saved ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg,#3b82f6,#2563FF)',
              border: saved ? '1px solid rgba(16,185,129,0.4)' : 'none',
              color: 'white', borderRadius: 10, padding: '10px 20px',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: saved ? 'none' : '0 0 20px rgba(37,99,255,0.3)',
              transition: 'all 0.2s',
            }}
          >
            {saved ? <><CheckCircle size={15} style={{ color: '#10b981' }} />Guardado</> : <><Save size={15} />Guardar cambios</>}
          </button>
        </div>
        <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(37,99,255,0.25),transparent 60%)', marginTop: 16 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Left column */}
        <div>
          <Section title="Información del negocio" icon={Building2} color="#2563FF">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Nombre del negocio</label>
                <input value={config.businessName} onChange={e => set('businessName')(e.target.value)} placeholder="Ej: Estética Lumière" style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>

              <div>
                <label style={labelStyle}>Rubro</label>
                <SectorSelect
                  value={config.sector}
                  onChange={set('sector')}
                  onFocus={focus as any}
                  onBlur={blur as any}
                  placeholder="Seleccioná tu rubro"
                />
              </div>

              <div>
                <label style={labelStyle}>Servicios que ofrecés</label>
                <textarea
                  value={config.services}
                  onChange={e => set('services')(e.target.value)}
                  placeholder="Ej: Masajes, tratamientos faciales, depilación láser..."
                  style={{ ...inputStyle, resize: 'none', height: 90 }}
                  onFocus={focus}
                  onBlur={blur}
                />
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 5 }}>
                  Esta información se usa para generar anuncios más relevantes.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Teléfono</label>
                  <input value={config.phone} onChange={e => set('phone')(e.target.value)} placeholder="+54 11 0000-0000" style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
                <div>
                  <label style={labelStyle}>WhatsApp (para mensajes automáticos)</label>
                  <input value={config.whatsappNumber} onChange={e => set('whatsappNumber')(e.target.value)} placeholder="+54 9 11 0000-0000" style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Sitio web</label>
                <input value={config.website} onChange={e => set('website')(e.target.value)} placeholder="www.mi-negocio.com" style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>

              <div>
                <label style={labelStyle}>Dirección</label>
                <input value={config.address} onChange={e => set('address')(e.target.value)} placeholder="Av. Corrientes 1234, Buenos Aires" style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>
            </div>
          </Section>

          {/* Módulos */}
          <Section title="Módulos" icon={Calendar} color="#fb923c">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.15)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>Gestión de Turnos</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>Calendario, profesionales y reservas</p>
                </div>
                <button
                  onClick={toggle('turnCalendarEnabled')}
                  style={{
                    background: config.turnCalendarEnabled ? '#10b981' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: 20,
                    width: 50,
                    height: 28,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: config.turnCalendarEnabled ? 'flex-end' : 'flex-start',
                    padding: '2px 4px',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ width: 22, height: 22, borderRadius: 18, background: 'white', transition: 'all 0.3s' }} />
                </button>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, margin: 0, lineHeight: 1.5 }}>
                {config.turnCalendarEnabled ? '✓ Activo' : '○ Desactivado'} — Administrá profesionales, servicios y el calendario de turnos de tu negocio.
              </p>
            </div>
          </Section>

          {/* Reservas Públicas */}
          <Section title="Reservas Públicas" icon={Settings} color="#06b6d4">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {!config.publicReservationCode ? (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 12px', lineHeight: 1.5 }}>
                    Genera un código para activar la página pública donde tus clientes pueden reservar turnos sin entrar a tu panel.
                  </p>
                  <button
                    onClick={generatePublicCode}
                    style={{
                      width: '100%', background: 'linear-gradient(135deg,#06b6d4,#0284c7)', color: 'white', border: 'none', borderRadius: 10, padding: '12px 0',
                      fontWeight: 700, cursor: 'pointer', fontSize: 13, transition: 'all 0.2s', boxShadow: '0 0 16px rgba(6,182,212,0.3)',
                    }}
                  >
                    Generar código de reservas
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', fontFamily: "'Orbitron', sans-serif" }}>
                      Código público
                    </p>
                    <p style={{ color: '#06b6d4', fontSize: 16, fontWeight: 700, margin: '0 0 12px', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.1em' }}>
                      {config.publicReservationCode}
                    </p>
                    <button
                      onClick={() => copyToClipboard(config.publicReservationCode || '')}
                      style={{
                        width: '100%', background: 'rgba(6,182,212,0.15)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.3)',
                        borderRadius: 8, padding: '8px 0', fontWeight: 600, cursor: 'pointer', fontSize: 12, transition: 'all 0.2s',
                      }}
                    >
                      Copiar código
                    </button>
                  </div>

                  <div style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 10, padding: 12 }}>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', fontFamily: "'Orbitron', sans-serif" }}>
                      URL de reservas
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 10, marginBottom: 10 }}>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: 0, wordBreak: 'break-all', fontFamily: "'Courier New', monospace" }}>
                        vision-os.app/reservas/{config.publicReservationCode}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`vision-os.app/reservas/${config.publicReservationCode}`)}
                      style={{
                        width: '100%', background: 'rgba(6,182,212,0.15)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.3)',
                        borderRadius: 8, padding: '8px 0', fontWeight: 600, cursor: 'pointer', fontSize: 12, transition: 'all 0.2s',
                      }}
                    >
                      Copiar URL
                    </button>
                  </div>

                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, margin: '12px 0 0', lineHeight: 1.5 }}>
                    Compartí este enlace con tus clientes. Ellos pueden ver tu disponibilidad y reservar turnos.
                  </p>

                  <button
                    onClick={generatePublicCode}
                    style={{
                      width: '100%', marginTop: 12, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)',
                      border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600, cursor: 'pointer', fontSize: 12,
                    }}
                  >
                    Regenerar código
                  </button>
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* Right column */}
        <div>
          <Section title="Integraciones · API Keys" icon={Key} color="#8b5cf6">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Claude */}
              <div style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: config.claudeApiKey ? '#10b981' : 'rgba(255,255,255,0.2)' }} />
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>Claude (Anthropic)</span>
                  <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>Creador de anuncios</span>
                </div>
                <ApiKeyField label="API Key" value={config.claudeApiKey} onChange={set('claudeApiKey')} />
                <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', fontSize: 11, marginTop: 8, display: 'inline-block', textDecoration: 'none' }}>
                  Obtener API key → console.anthropic.com
                </a>
              </div>

              {/* OpenAI */}
              <div style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: config.openaiApiKey ? '#10b981' : 'rgba(255,255,255,0.2)' }} />
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>OpenAI</span>
                  <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>Generación de imágenes</span>
                </div>
                <ApiKeyField label="API Key" value={config.openaiApiKey} onChange={set('openaiApiKey')} />
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', fontSize: 11, marginTop: 8, display: 'inline-block', textDecoration: 'none' }}>
                  Obtener API key → platform.openai.com
                </a>
              </div>

              {/* WhatsApp */}
              <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: config.whatsappNumber ? '#10b981' : 'rgba(255,255,255,0.2)' }} />
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>WhatsApp</span>
                  <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>Mensajes automáticos</span>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={labelStyle}>Número de WhatsApp (con código de país)</label>
                  <input
                    value={config.whatsappNumber}
                    onChange={e => set('whatsappNumber')(e.target.value)}
                    placeholder="+54 9 11 0000-0000"
                    style={inputStyle}
                    onFocus={focus}
                    onBlur={blur}
                  />
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 6, margin: '6px 0 0' }}>
                    Se usará para enviar confirmaciones, recordatorios y notificaciones automáticas a tus clientes.
                  </p>
                </div>
                {config.whatsappNumber && (
                  <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                      <span style={{ color: '#22c55e', fontSize: 11, fontWeight: 600 }}>Número configurado</span>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(34,197,94,0.2)' }}>
                  <label style={labelStyle}>Recordatorio 24h antes</label>
                  <textarea
                    value={config.whatsappReminder24h}
                    onChange={e => set('whatsappReminder24h')(e.target.value)}
                    placeholder="Ej: ⏰ Recordatorio: Tu turno es en 24 horas. Confirmamos tu asistencia. ¡Hasta pronto!"
                    style={{ ...inputStyle, resize: 'none', height: 80, marginBottom: 12 }}
                    onFocus={focus}
                    onBlur={blur}
                  />
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, margin: '0 0 12px' }}>
                    Mensaje automático que se enviará 24 horas antes del turno. Puede incluir emojis.
                  </p>

                  <label style={labelStyle}>Recordatorio 2h antes</label>
                  <textarea
                    value={config.whatsappReminder2h}
                    onChange={e => set('whatsappReminder2h')(e.target.value)}
                    placeholder="Ej: ⏰ Tu turno es en 2 horas. ¡Te esperamos!"
                    style={{ ...inputStyle, resize: 'none', height: 80 }}
                    onFocus={focus}
                    onBlur={blur}
                  />
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, margin: '6px 0 0' }}>
                    Mensaje automático que se enviará 2 horas antes del turno.
                  </p>
                </div>
              </div>

              {/* Info box */}
              <div style={{ background: 'rgba(37,99,255,0.05)', border: '1px solid rgba(37,99,255,0.12)', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                  Tus API keys se guardan localmente en tu navegador. Nunca se envían a nuestros servidores.
                </p>
              </div>
            </div>
          </Section>

          {/* Account info */}
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '18px 20px' }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', margin: '0 0 14px', fontFamily: "'Orbitron', sans-serif" }}>
              Cuenta
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Email', value: user?.email },
                { label: 'Negocio', value: user?.company },
                { label: 'Rubro', value: user?.sector || config.sector || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>{label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
