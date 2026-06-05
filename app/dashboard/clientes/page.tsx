'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/auth'
import { Users, Plus, Search, Trash2, ChevronDown, ChevronUp, Phone, Mail, FileText, Clock, X } from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  services: string
  notes: string
  createdAt: string
  lastVisit: string
}

const emptyClient = (): Omit<Client, 'id' | 'createdAt'> => ({
  name: '', email: '', phone: '', services: '', notes: '',
  lastVisit: new Date().toISOString().split('T')[0],
})

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9,
  padding: '9px 13px', color: 'white', fontSize: 13,
  outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.2s',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 700,
  color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em',
  textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Orbitron', sans-serif",
}
const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  e.target.style.borderColor = 'rgba(37,99,255,0.5)'
const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  e.target.style.borderColor = 'rgba(255,255,255,0.08)'

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
}

const AVATAR_COLORS = ['#2563FF','#8b5cf6','#06b6d4','#10b981','#f472b6','#fb923c','#f87171','#34d399']
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i)
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export default function ClientesPage() {
  const { user } = useAuth()
  const [clients,    setClients]    = useState<Client[]>([])
  const [search,     setSearch]     = useState('')
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState(emptyClient())
  const [expanded,   setExpanded]   = useState<string | null>(null)
  const [saving,     setSaving]     = useState(false)

  const KEY = user ? `bos_clients_${user.id}` : null

  useEffect(() => {
    if (!KEY) return
    const stored = localStorage.getItem(KEY)
    if (stored) setClients(JSON.parse(stored))
  }, [KEY])

  const persist = (data: Client[]) => {
    setClients(data)
    if (KEY) localStorage.setItem(KEY, JSON.stringify(data))
  }

  const filtered = useMemo(() =>
    clients.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.services.toLowerCase().includes(search.toLowerCase())
    ), [clients, search])

  const addClient = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))
    const newClient: Client = {
      ...form,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    }
    persist([newClient, ...clients])
    setForm(emptyClient())
    setShowForm(false)
    setSaving(false)
  }

  const deleteClient = (id: string) => persist(clients.filter(c => c.id !== id))

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 6px', fontFamily: "'Orbitron', sans-serif" }}>
          Vision OS · Clientes
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>Clientes</h1>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: 0 }}>{clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(s => !s)}
            style={{ background: showForm ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#3b82f6,#2563FF)', color: 'white', border: showForm ? '1px solid rgba(255,255,255,0.1)' : 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: showForm ? 'none' : '0 0 18px rgba(37,99,255,0.3)', transition: 'all 0.2s' }}
          >
            {showForm ? <><X size={14} />Cancelar</> : <><Plus size={14} />Nuevo cliente</>}
          </button>
        </div>
        <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(139,92,246,0.25),transparent 60%)', marginTop: 16 }} />
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ background: 'rgba(37,99,255,0.05)', border: '1px solid rgba(37,99,255,0.18)', borderRadius: 16, padding: 22, marginBottom: 20 }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 16px', fontFamily: "'Orbitron', sans-serif" }}>
            Nuevo cliente
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input value={form.name} onChange={setField('name')} placeholder="Ana García" style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <input value={form.phone} onChange={setField('phone')} placeholder="+54 11 0000-0000" style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={form.email} onChange={setField('email')} placeholder="ana@email.com" style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>Servicios / Tratamientos</label>
              <input value={form.services} onChange={setField('services')} placeholder="Ej: masajes, faciales..." style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Última visita</label>
              <input type="date" value={form.lastVisit} onChange={setField('lastVisit')} style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Notas</label>
            <textarea value={form.notes} onChange={setField('notes')} placeholder="Observaciones, alergias, preferencias..." style={{ ...inputStyle, resize: 'none', height: 70 }} onFocus={focus} onBlur={blur} />
          </div>
          <button
            onClick={addClient}
            disabled={!form.name.trim() || saving}
            style={{ background: !form.name.trim() ? 'rgba(37,99,255,0.25)' : 'linear-gradient(135deg,#3b82f6,#2563FF)', color: 'white', border: 'none', borderRadius: 9, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: !form.name.trim() ? 'not-allowed' : 'pointer', boxShadow: form.name.trim() ? '0 0 16px rgba(37,99,255,0.3)' : 'none' }}
          >
            {saving ? 'Guardando...' : 'Guardar cliente'}
          </button>
        </div>
      )}

      {/* Stats strip */}
      {clients.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total clientes', value: clients.length, color: '#8b5cf6' },
            { label: 'Con email', value: clients.filter(c => c.email).length, color: '#2563FF' },
            { label: 'Con teléfono', value: clients.filter(c => c.phone).length, color: '#06b6d4' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email, teléfono o servicio..."
          style={{ ...inputStyle, paddingLeft: 38 }}
          onFocus={focus}
          onBlur={blur}
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 16, padding: '56px 24px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Users size={22} style={{ color: 'rgba(139,92,246,0.4)' }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>
            {search ? 'No se encontraron clientes' : 'Todavía no hay clientes'}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.14)', fontSize: 12, margin: 0 }}>
            {search ? 'Probá con otro término de búsqueda' : 'Hacé clic en "Nuevo cliente" para agregar el primero'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(client => {
            const isExpanded = expanded === client.id
            const color = avatarColor(client.name)
            return (
              <div
                key={client.id}
                style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${isExpanded ? 'rgba(37,99,255,0.25)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}
              >
                {/* Row */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}
                  onClick={() => setExpanded(isExpanded ? null : client.id)}
                >
                  {/* Avatar */}
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${color}20`, border: `1px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>
                    {getInitials(client.name)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: '0 0 2px' }}>{client.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      {client.phone && (
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Phone size={11} /> {client.phone}
                        </span>
                      )}
                      {client.email && (
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Mail size={11} /> {client.email}
                        </span>
                      )}
                      {client.services && (
                        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FileText size={11} /> {client.services}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Last visit + expand */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                    {client.lastVisit && (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, margin: '0 0 1px', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em' }}>Última visita</p>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} /> {client.lastVisit}
                        </p>
                      </div>
                    )}
                    {isExpanded ? <ChevronUp size={16} style={{ color: 'rgba(255,255,255,0.3)' }} /> : <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ paddingTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <p style={{ ...labelStyle, marginBottom: 5 }}>Servicios</p>
                        <p style={{ color: client.services ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)', fontSize: 13, margin: 0 }}>
                          {client.services || 'Sin especificar'}
                        </p>
                      </div>
                      <div>
                        <p style={{ ...labelStyle, marginBottom: 5 }}>Registrado</p>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>{client.createdAt}</p>
                      </div>
                      {client.notes && (
                        <div style={{ gridColumn: '1/-1' }}>
                          <p style={{ ...labelStyle, marginBottom: 5 }}>Notas</p>
                          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 9, padding: '10px 14px' }}>
                            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{client.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteClient(client.id) }}
                        style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <Trash2 size={12} /> Eliminar cliente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
