'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Calendar, Plus, Trash2, Edit2, User, Clock, DollarSign, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { Professional, Service, Appointment, TurnosConfig, PROFESSIONAL_COLORS, getDayName, getWeekDates, getDateKey, timeToMinutes, minutesToTime } from '@/lib/turnos-types'
import { sendWhatsAppFromClient } from '@/lib/whatsapp-client'
import { getPendingReminders, sendPendingReminders } from '@/lib/reminders-service'
import { syncTurnosWithServer } from '@/lib/sync-service'
import { addMultipleAppointments, updateAppointment, deleteAppointment } from '@/lib/supabase-operations'
import { useTurnosSync } from '@/lib/use-turnos-sync'

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9,
  padding: '9px 13px', color: 'white', fontSize: 13,
  outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.2s',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 700,
  color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em',
  textTransform: 'uppercase', marginBottom: 10, fontFamily: "'Orbitron', sans-serif",
}
const focus = (e: React.FocusEvent<any>) => e.target.style.borderColor = 'rgba(37,99,255,0.5)'
const blur = (e: React.FocusEvent<any>) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'

type Tab = 'professionals' | 'services' | 'bloqueos' | 'calendar' | 'calendar-full'

export default function TurnosPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('calendar')
  const [monthView, setMonthView] = useState(new Date())
  const [config, setConfig] = useState<TurnosConfig>({ professionals: [], services: [], appointments: [], blockedTimes: [], enableComplexity: false, maxSlotsPerHour: 4 })
  const [generalConfig, setGeneralConfig] = useState<any>({})
  const [weekStart, setWeekStart] = useState(new Date())

  // Form state
  const [editingProf, setEditingProf] = useState<Professional | null>(null)
  const [profForm, setProfForm] = useState({ name: '', specialty: '', hoursStart: '09:00', hoursEnd: '18:00', daysOfWeek: [1,2,3,4,5], color: '#ec4899' })

  const [editingSvc, setEditingSvc] = useState<Service | null>(null)
  const [svcForm, setSvcForm] = useState({ name: '', durationMinutes: 60, price: 0, description: '' })

  const [editingBlock, setEditingBlock] = useState<any>(null)
  const [blockForm, setBlockForm] = useState({ title: '', startDate: '', startTime: '09:00', endDate: '', endTime: '18:00', profId: '', recurring: '' })

  useEffect(() => {
    if (!user) return
    const storedTurnos = localStorage.getItem(`bos_turnos_${user.id}`)
    if (storedTurnos) setConfig(JSON.parse(storedTurnos))
    const storedConfig = localStorage.getItem(`bos_config_${user.id}`)
    if (storedConfig) setGeneralConfig(JSON.parse(storedConfig))
  }, [user])

  // Sincronizar a Supabase automáticamente
  useTurnosSync(user?.id, config)

  // Sincronizar turnos con el servidor cada vez que cambian
  useEffect(() => {
    if (!user || config.appointments.length === 0) return
    syncTurnosWithServer(user.id, config, generalConfig)
  }, [user, config, generalConfig])

  const saveConfig = (newCfg: TurnosConfig) => {
    setConfig(newCfg)
    if (user) localStorage.setItem(`bos_turnos_${user.id}`, JSON.stringify(newCfg))
  }

  const addProfessional = () => {
    const id = Date.now().toString()
    const newProf: Professional = { id, ...profForm }
    saveConfig({ ...config, professionals: [...config.professionals, newProf] })
    setProfForm({ name: '', specialty: '', hoursStart: '09:00', hoursEnd: '18:00', daysOfWeek: [1,2,3,4,5], color: '#ec4899' })
  }

  const updateProfessional = (id: string) => {
    const updated = config.professionals.map(p => p.id === id ? { ...p, ...profForm } : p)
    saveConfig({ ...config, professionals: updated })
    setEditingProf(null)
    setProfForm({ name: '', specialty: '', hoursStart: '09:00', hoursEnd: '18:00', daysOfWeek: [1,2,3,4,5], color: '#ec4899' })
  }

  const deleteProfessional = (id: string) => {
    saveConfig({ ...config, professionals: config.professionals.filter(p => p.id !== id) })
  }

  const addService = () => {
    const id = Date.now().toString()
    const newSvc: Service = { id, ...svcForm }
    saveConfig({ ...config, services: [...config.services, newSvc] })
    setSvcForm({ name: '', durationMinutes: 60, price: 0, description: '' })
  }

  const updateService = (id: string) => {
    const updated = config.services.map(s => s.id === id ? { ...s, ...svcForm } : s)
    saveConfig({ ...config, services: updated })
    setEditingSvc(null)
    setSvcForm({ name: '', durationMinutes: 60, price: 0, description: '' })
  }

  const deleteService = (id: string) => {
    saveConfig({ ...config, services: config.services.filter(s => s.id !== id) })
  }

  const startEditProf = (prof: Professional) => {
    setEditingProf(prof)
    setProfForm({ name: prof.name, specialty: prof.specialty, hoursStart: prof.hoursStart, hoursEnd: prof.hoursEnd, daysOfWeek: prof.daysOfWeek, color: prof.color })
  }

  const startEditSvc = (svc: Service) => {
    setEditingSvc(svc)
    setSvcForm({ name: svc.name, durationMinutes: svc.durationMinutes, price: svc.price, description: svc.description || '', complexity: svc.complexity || 1 })
  }

  const canAddProf = profForm.name.trim() && profForm.specialty.trim()
  const canAddSvc = svcForm.name.trim() && svcForm.durationMinutes > 0

  const addBlock = () => {
    if (!blockForm.title.trim() || !blockForm.startDate || !blockForm.startTime || !blockForm.endDate || !blockForm.endTime) return
    const id = Date.now().toString()
    const recurring = blockForm.recurring as 'daily' | 'weekly' | 'monthly' | undefined || undefined
    const newBlock = { id, title: blockForm.title, startTime: `${blockForm.startDate}T${blockForm.startTime}`, endTime: `${blockForm.endDate}T${blockForm.endTime}`, professionalId: blockForm.profId || undefined, recurring: recurring || undefined }
    saveConfig({ ...config, blockedTimes: [...config.blockedTimes, newBlock] })
    setBlockForm({ title: '', startDate: '', startTime: '09:00', endDate: '', endTime: '18:00', profId: '', recurring: '' })
  }

  const deleteBlock = (id: string) => {
    saveConfig({ ...config, blockedTimes: config.blockedTimes.filter(b => b.id !== id) })
  }

  const canAddBlock = blockForm.title.trim() && blockForm.startDate && blockForm.endDate

  // Si el módulo está desactivado
  if (generalConfig?.turnCalendarEnabled === false) {
    return (
      <div>
        <div style={{ marginBottom: 28 }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 6px', fontFamily: "'Orbitron', sans-serif" }}>
            Vision OS · Agenda
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} style={{ color: '#fb923c' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>Gestión de Turnos</h1>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: 0 }}>Administrá la agenda de tu negocio</p>
            </div>
          </div>
          <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(251,146,60,0.25),transparent 60%)', marginTop: 16 }} />
        </div>

        <div style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 14, padding: 32, textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: 12, background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Calendar size={28} style={{ color: '#fb923c' }} />
          </div>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>Módulo Desactivado</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 24px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
            El módulo de Gestión de Turnos está desactivado. Activalo en Configuración para empezar a administrar profesionales, servicios y turnos.
          </p>
          <a href="/dashboard/configuracion" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#fb923c,#f97316)', color: 'white', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 0 16px rgba(251,146,60,0.3)', transition: 'all 0.2s' }}>
            Ir a Configuración
          </a>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 6px', fontFamily: "'Orbitron', sans-serif" }}>
          Vision OS · Agenda
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={18} style={{ color: '#fb923c' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>Gestión de Turnos</h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: 0 }}>
              {tab === 'professionals' && 'Administrá tus profesionales'}
              {tab === 'services' && 'Configurá los servicios y duraciones'}
              {tab === 'bloqueos' && 'Bloquea horarios: almuerzo, vacaciones, mantenimiento'}
              {tab === 'calendar' && 'Gestiona la agenda semanal'}
              {tab === 'calendar-full' && 'Vista mensual completa - ve todo el mes de un vistazo'}
            </p>
          </div>
        </div>
        <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(251,146,60,0.25),transparent 60%)', marginTop: 16 }} />
      </div>

      {/* Configuración General */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: 'white', fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>Sistema de complejidad/slots</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>Permite servicios que ocupan múltiples turnos simultáneamente</p>
        </div>
        <button
          onClick={() => saveConfig({ ...config, enableComplexity: !config.enableComplexity })}
          style={{
            background: config.enableComplexity ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${config.enableComplexity ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
            color: config.enableComplexity ? '#86efac' : 'rgba(255,255,255,0.5)',
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {config.enableComplexity ? '✓ Activado' : '○ Desactivado'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {(['professionals', 'services', 'bloqueos', 'calendar', 'calendar-full'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '14px 20px', fontSize: 13, fontWeight: 600, color: tab === t ? 'white' : 'rgba(255,255,255,0.4)',
              background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === t ? '2px solid #fb923c' : 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (tab !== t) e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
            onMouseLeave={e => { if (tab !== t) e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
          >
            {t === 'professionals' && '👨‍⚕️ Profesionales'}
            {t === 'services' && '🛠️ Servicios'}
            {t === 'bloqueos' && '🚫 Bloqueos'}
            {t === 'calendar' && '📅 Calendario'}
            {t === 'calendar-full' && '📆 Calendario Completo'}
          </button>
        ))}
      </div>

      {/* PROFESIONALES */}
      {tab === 'professionals' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Formulario */}
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20 }}>
            <p style={labelStyle}>
              {editingProf ? 'Editar profesional' : 'Agregar profesional'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input placeholder="Ej: Dr. García" value={profForm.name} onChange={e => setProfForm({ ...profForm, name: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>

              <div>
                <label style={labelStyle}>Especialidad *</label>
                <input placeholder="Ej: Kinesiólogo, Odontólogo, Esteticien..." value={profForm.specialty} onChange={e => setProfForm({ ...profForm, specialty: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>

              <div>
                <label style={labelStyle}>Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="color" value={profForm.color} onChange={e => setProfForm({ ...profForm, color: e.target.value })} style={{ width: 60, height: 40, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer' }} />
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: `${profForm.color}22`, border: `1px solid ${profForm.color}44`, borderRadius: 8 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: profForm.color }} />
                    <span style={{ color: profForm.color, fontSize: 12, fontFamily: 'monospace' }}>{profForm.color.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Hora inicio</label>
                  <input type="time" value={profForm.hoursStart} onChange={e => setProfForm({ ...profForm, hoursStart: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
                <div>
                  <label style={labelStyle}>Hora fin</label>
                  <input type="time" value={profForm.hoursEnd} onChange={e => setProfForm({ ...profForm, hoursEnd: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Días de atención</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const newDays = profForm.daysOfWeek.includes(idx)
                          ? profForm.daysOfWeek.filter(d => d !== idx)
                          : [...profForm.daysOfWeek, idx]
                        setProfForm({ ...profForm, daysOfWeek: newDays.sort() })
                      }}
                      style={{
                        width: '100%', aspectRatio: '1', background: profForm.daysOfWeek.includes(idx) ? '#fb923c' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${profForm.daysOfWeek.includes(idx) ? '#fb923c' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: 8, color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (editingProf) updateProfessional(editingProf.id)
                  else addProfessional()
                }}
                disabled={!canAddProf}
                style={{
                  marginTop: 8, background: canAddProf ? 'linear-gradient(135deg,#fb923c,#f97316)' : 'rgba(251,146,60,0.2)',
                  color: 'white', border: 'none', borderRadius: 10, padding: '12px 0',
                  fontWeight: 700, cursor: canAddProf ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s',
                }}
              >
                <Plus size={15} />
                {editingProf ? 'Actualizar' : 'Agregar'} profesional
              </button>
              {editingProf && (
                <button
                  onClick={() => {
                    setEditingProf(null)
                    setProfForm({ name: '', specialty: '', hoursStart: '09:00', hoursEnd: '18:00', daysOfWeek: [1,2,3,4,5], color: '#ec4899' })
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
                    border: 'none', borderRadius: 10, padding: '10px 0', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </div>

          {/* Lista */}
          <div>
            <p style={{ ...labelStyle, marginBottom: 16 }}>Profesionales agregados</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {config.professionals.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, margin: 0 }}>Sin profesionales aún</p>
                </div>
              ) : (
                config.professionals.map(prof => (
                  <div key={prof.id} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: prof.color, flexShrink: 0, marginTop: 4 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>{prof.name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 6px' }}>{prof.specialty}</p>
                      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, margin: 0 }}>
                        {prof.hoursStart} - {prof.hoursEnd} · {['D', 'L', 'M', 'M', 'J', 'V', 'S'].filter((_, i) => prof.daysOfWeek.includes(i)).join(', ')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => startEditProf(prof)} style={{ background: 'rgba(59,130,246,0.1)', border: 'none', color: '#3b82f6', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => deleteProfessional(prof.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SERVICIOS */}
      {tab === 'services' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Formulario */}
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20 }}>
            <p style={labelStyle}>
              {editingSvc ? 'Editar servicio' : 'Agregar servicio'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Nombre del servicio *</label>
                <input placeholder="Ej: Sesión de fisioterapia" value={svcForm.name} onChange={e => setSvcForm({ ...svcForm, name: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Duración (minutos) *</label>
                  <input type="number" placeholder="45" value={svcForm.durationMinutes} onChange={e => setSvcForm({ ...svcForm, durationMinutes: Number(e.target.value) })} style={inputStyle} onFocus={focus} onBlur={blur} min={15} step={15} />
                </div>
                <div>
                  <label style={labelStyle}>Precio</label>
                  <input type="number" placeholder="0" value={svcForm.price} onChange={e => setSvcForm({ ...svcForm, price: Number(e.target.value) })} style={inputStyle} onFocus={focus} onBlur={blur} min={0} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Descripción (opcional)</label>
                <textarea placeholder="Detalles del servicio..." value={svcForm.description} onChange={e => setSvcForm({ ...svcForm, description: e.target.value })} style={{ ...inputStyle, resize: 'none', height: 70 }} onFocus={focus} onBlur={blur} />
              </div>

              <button
                onClick={() => {
                  if (editingSvc) updateService(editingSvc.id)
                  else addService()
                }}
                disabled={!canAddSvc}
                style={{
                  marginTop: 8, background: canAddSvc ? 'linear-gradient(135deg,#fb923c,#f97316)' : 'rgba(251,146,60,0.2)',
                  color: 'white', border: 'none', borderRadius: 10, padding: '12px 0',
                  fontWeight: 700, cursor: canAddSvc ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s',
                }}
              >
                <Plus size={15} />
                {editingSvc ? 'Actualizar' : 'Agregar'} servicio
              </button>
              {editingSvc && (
                <button
                  onClick={() => {
                    setEditingSvc(null)
                    setSvcForm({ name: '', durationMinutes: 60, price: 0, description: '', complexity: 1 })
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
                    border: 'none', borderRadius: 10, padding: '10px 0', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </div>

          {/* Lista */}
          <div>
            <p style={{ ...labelStyle, marginBottom: 16 }}>Servicios agregados</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {config.services.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, margin: 0 }}>Sin servicios aún</p>
                </div>
              ) : (
                config.services.map(svc => (
                  <div key={svc.id} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>{svc.name}</p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={12} /> {svc.durationMinutes} min
                          </span>
                          {svc.price > 0 && (
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <DollarSign size={12} /> ${svc.price}
                            </span>
                          )}
                        </div>
                        {svc.description && (
                          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, margin: '6px 0 0', fontStyle: 'italic' }}>{svc.description}</p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => startEditSvc(svc)} style={{ background: 'rgba(59,130,246,0.1)', border: 'none', color: '#3b82f6', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => deleteService(svc.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* BLOQUEOS */}
      {tab === 'bloqueos' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Formulario */}
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20 }}>
            <p style={labelStyle}>Crear bloqueo</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Título *</label>
                <input placeholder="Ej: Almuerzo, Vacaciones, Mantenimiento" value={blockForm.title} onChange={e => setBlockForm({ ...blockForm, title: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>

              <div>
                <label style={labelStyle}>Aplicable a</label>
                <select value={blockForm.profId} onChange={e => setBlockForm({ ...blockForm, profId: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur}>
                  <option value="">Todos los profesionales</option>
                  {config.professionals.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Fecha inicio *</label>
                  <input type="date" value={blockForm.startDate} onChange={e => setBlockForm({ ...blockForm, startDate: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
                <div>
                  <label style={labelStyle}>Hora inicio</label>
                  <input type="time" value={blockForm.startTime} onChange={e => setBlockForm({ ...blockForm, startTime: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Fecha fin *</label>
                  <input type="date" value={blockForm.endDate} onChange={e => setBlockForm({ ...blockForm, endDate: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
                <div>
                  <label style={labelStyle}>Hora fin</label>
                  <input type="time" value={blockForm.endTime} onChange={e => setBlockForm({ ...blockForm, endTime: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Repetir</label>
                <select value={blockForm.recurring} onChange={e => setBlockForm({ ...blockForm, recurring: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur}>
                  <option value="">No repetir (una sola vez)</option>
                  <option value="daily">Todos los días (en esas horas)</option>
                  <option value="weekly">Toda la semana</option>
                  <option value="monthly">Todos los meses</option>
                </select>
              </div>

              <button
                onClick={addBlock}
                disabled={!canAddBlock}
                style={{
                  marginTop: 8, background: canAddBlock ? 'linear-gradient(135deg,#fb923c,#f97316)' : 'rgba(251,146,60,0.2)',
                  color: 'white', border: 'none', borderRadius: 10, padding: '12px 0',
                  fontWeight: 700, cursor: canAddBlock ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s',
                }}
              >
                <Plus size={15} /> Agregar bloqueo
              </button>
            </div>
          </div>

          {/* Lista */}
          <div>
            <p style={{ ...labelStyle, marginBottom: 16 }}>Bloqueos activos</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {config.blockedTimes.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, margin: 0 }}>Sin bloqueos aún</p>
                </div>
              ) : (
                config.blockedTimes.map(block => (
                  <div key={block.id} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>{block.title}</p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 6px' }}>
                          {block.startTime.substring(0, 10)} {block.startTime.substring(11, 16)} → {block.endTime.substring(0, 10)} {block.endTime.substring(11, 16)}
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, margin: 0 }}>
                          {block.professionalId ? `📌 ${config.professionals.find(p => p.id === block.professionalId)?.name}` : '📌 Todos'}
                          {block.recurring ? ` · Repite: ${block.recurring}` : ''}
                        </p>
                      </div>
                      <button onClick={() => deleteBlock(block.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CALENDARIO */}
      {tab === 'calendar' && (
        <div>
          {config.professionals.length === 0 || config.services.length === 0 ? (
            <div style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 12, padding: 16, display: 'flex', gap: 12 }}>
              <AlertCircle size={18} style={{ color: '#fb923c', flexShrink: 0 }} />
              <div>
                <p style={{ color: '#fb923c', fontWeight: 600, margin: '0 0 4px', fontSize: 13 }}>Información incompleta</p>
                <p style={{ color: 'rgba(251,146,60,0.7)', fontSize: 12, margin: 0 }}>
                  Para usar el calendario necesitás tener al menos {config.professionals.length === 0 ? '1 profesional' : ''} {config.professionals.length === 0 && config.services.length === 0 ? ' y ' : ''} {config.services.length === 0 ? '1 servicio' : ''}.
                </p>
              </div>
            </div>
          ) : (
            <CalendarView config={config} saveConfig={saveConfig} generalConfig={generalConfig} />
          )}
        </div>
      )}

      {tab === 'calendar-full' && (
        <div>
          {config.professionals.length === 0 || config.services.length === 0 ? (
            <div style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 12, padding: 16, display: 'flex', gap: 12 }}>
              <AlertCircle size={18} style={{ color: '#fb923c', flexShrink: 0 }} />
              <div>
                <p style={{ color: '#fb923c', fontWeight: 600, margin: '0 0 4px', fontSize: 13 }}>Información incompleta</p>
                <p style={{ color: 'rgba(251,146,60,0.7)', fontSize: 12, margin: 0 }}>
                  Para usar el calendario necesitás tener al menos {config.professionals.length === 0 ? '1 profesional' : ''} {config.professionals.length === 0 && config.services.length === 0 ? ' y ' : ''} {config.services.length === 0 ? '1 servicio' : ''}.
                </p>
              </div>
            </div>
          ) : (
            <MonthCalendarView config={config} saveConfig={saveConfig} monthView={monthView} setMonthView={setMonthView} generalConfig={generalConfig} />
          )}
        </div>
      )}
    </div>
  )
}

const MAX_CAPACITY_NEW = 10

// ─────────────────────────────────────────────────────────────────

function CalendarView({ config, saveConfig, generalConfig }: { config: TurnosConfig; saveConfig: (cfg: TurnosConfig) => void; generalConfig: any }) {
  const [weekStart, setWeekStart] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [dayViewOpen, setDayViewOpen] = useState(false)
  const [selectedDayForView, setSelectedDayForView] = useState<Date | null>(null)
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null)
  const [selectedProfId, setSelectedProfId] = useState<string>('')
  const [form, setForm] = useState({ clientName: '', clientWhatsApp: '', clientEmail: '', serviceId: '', profId: '', date: '', startTime: '', status: 'confirmed' as const, notes: '', recurring: '', sessionCount: 1, complexity: 1 })

  // Verificar y enviar recordatorios automáticamente
  useEffect(() => {
    const checkReminders = async () => {
      const pending = getPendingReminders(config, generalConfig)
      if (pending.length > 0) {
        await sendPendingReminders(pending)
      }
    }
    checkReminders()
  }, [config, generalConfig])

  const weekDates = getWeekDates(weekStart)
  const hours = Array.from({ length: 13 }, (_, i) => i + 8)
  const hoursTexts = hours.map(h => `${String(h).padStart(2, '0')}:00`)

  const openModal = (profId: string, date: Date, time: string) => {
    setEditingAppt(null)
    setForm({ clientName: '', clientWhatsApp: '', clientEmail: '', serviceId: '', profId, date: getDateKey(date), startTime: time, status: 'confirmed', notes: '', recurring: '', sessionCount: 1, complexity: 1 })
    setModalOpen(true)
  }

  const editAppt = (appt: Appointment) => {
    const [startDate, startTime] = appt.startTime.split('T')
    setEditingAppt(appt)
    setForm({ clientName: appt.clientName, clientWhatsApp: appt.clientWhatsApp || '', clientEmail: appt.clientEmail || '', serviceId: config.appointments.find(a => a.id === appt.id)?.serviceId || '', profId: appt.professionalId, date: startDate, startTime: startTime.substring(0, 5), status: appt.status as any, notes: appt.notes || '', recurring: '', sessionCount: 1, complexity: appt.complexity || 1 })
    setModalOpen(true)
  }

  // Validar slots disponibles para complejidad
  const getUsedSlots = (profId: string, dateKey: string, hour: string): number => {
    if (!config.enableComplexity) return 0
    return config.appointments
      .filter(a => a.professionalId === profId && a.startTime.startsWith(dateKey) && a.startTime.substring(11, 16) === hour)
      .reduce((total, appt) => {
        const svc = config.services.find(s => s.id === appt.serviceId)
        return total + (svc?.complexity || 1)
      }, 0)
  }

  const canAddApptWithComplexity = (profId: string, dateKey: string, hour: string, serviceId: string): boolean => {
    if (!config.enableComplexity) return true
    const service = config.services.find(s => s.id === serviceId)
    if (!service) return true
    const usedSlots = getUsedSlots(profId, dateKey, hour)
    const maxSlots = config.maxSlotsPerHour || 4
    return (usedSlots + (service.complexity || 1)) <= maxSlots
  }

  const saveAppt = () => {
    if (!form.clientName.trim() || !form.serviceId || !form.profId || !form.date || !form.startTime) return

    const service = config.services.find(s => s.id === form.serviceId)
    if (!service) return

    // Validar slots si está habilitada la complejidad
    if (!canAddApptWithComplexity(form.profId, form.date, form.startTime, form.serviceId)) {
      alert('❌ No hay suficientes slots disponibles en ese horario. Máximo: ' + (config.maxSlotsPerHour || 4) + ' slots')
      return
    }

    const appointments: Appointment[] = []

    if (form.recurring) {
      // Generar turnos recurrentes
      const startDate = new Date(form.date)
      const recurringDays = form.recurring.split(',').map(Number)
      const sessionCount = Number(form.sessionCount) || 1

      let currentDate = new Date(startDate)
      let sessionsCreated = 0

      while (sessionsCreated < sessionCount) {
        if (recurringDays.includes(currentDate.getDay())) {
          const dateKey = getDateKey(currentDate)
          const startDateTime = `${dateKey}T${form.startTime}`
          const apptStartDate = new Date(startDateTime)
          const apptEndDate = new Date(apptStartDate.getTime() + service.durationMinutes * 60 * 1000)

          appointments.push({
            id: `${Date.now()}_${sessionsCreated}_${Math.random().toString(36).substring(2)}`,
            clientName: form.clientName,
            clientWhatsApp: form.clientWhatsApp,
            clientEmail: form.clientEmail,
            professionalId: form.profId,
            serviceId: form.serviceId,
            startTime: startDateTime,
            endTime: apptEndDate.toISOString(),
            status: form.status,
            notes: form.notes,
            complexity: form.complexity ? Number(form.complexity) : 1,
            createdAt: new Date().toISOString(),
            source: 'admin',
          })
          sessionsCreated++
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
    } else {
      // Turno único
      const startDateTime = `${form.date}T${form.startTime}`
      const startDate = new Date(startDateTime)
      const endDate = new Date(startDate.getTime() + service.durationMinutes * 60 * 1000)
      const endDateTime = endDate.toISOString()

      appointments.push({
        id: `${Date.now()}_${Math.random().toString(36).substring(2)}`,
        clientName: form.clientName,
        clientWhatsApp: form.clientWhatsApp,
        clientEmail: form.clientEmail,
        professionalId: form.profId,
        serviceId: form.serviceId,
        startTime: startDateTime,
        endTime: endDateTime,
        status: form.status,
        notes: form.notes,
        complexity: form.complexity ? Number(form.complexity) : 1,
        createdAt: new Date().toISOString(),
        source: 'admin',
      })
    }

    if (editingAppt) {
      const updated = config.appointments.map(a => a.id === editingAppt.id
        ? { ...a, clientName: form.clientName, clientWhatsApp: form.clientWhatsApp, clientEmail: form.clientEmail, professionalId: form.profId, serviceId: form.serviceId, startTime: `${form.date}T${form.startTime}`, status: form.status, notes: form.notes, complexity: form.complexity ? Number(form.complexity) : 1 }
        : a
      )
      saveConfig({ ...config, appointments: updated })
    } else {
      saveConfig({ ...config, appointments: [...config.appointments, ...appointments] })

      // Enviar mensaje de WhatsApp de confirmación
      if (form.clientWhatsApp && generalConfig?.whatsappNumber) {
        const professional = config.professionals.find(p => p.id === form.profId)
        const serviceName = service?.name || ''
        const professionalName = professional?.name || ''

        const message = `¡Tu turno está confirmado! 📅

Servicio: ${serviceName}
Profesional: ${professionalName}
Fecha: ${new Date(form.date).toLocaleDateString('es-AR')}
Hora: ${form.startTime}

Si necesitás cancelar o cambiar la fecha, respondé este mensaje.`

        sendWhatsAppFromClient(form.clientWhatsApp, message, 'confirmation')
          .then(result => {
            if (result.success) {
              console.log('✓ WhatsApp enviado a', form.clientWhatsApp)
            } else {
              console.warn('✗ Error enviando WhatsApp:', result.error)
            }
          })
          .catch(err => console.error('Error enviando WhatsApp:', err))
      }
    }

    console.log('Closing modal and resetting form')
    setModalOpen(false)
    setForm({ clientName: '', clientWhatsApp: '', clientEmail: '', serviceId: '', profId: '', date: '', startTime: '', status: 'confirmed', notes: '', recurring: '', sessionCount: 1 })
  }

  const deleteAppt = (id: string) => {
    if (confirm('¿Eliminár este turno?')) {
      saveConfig({ ...config, appointments: config.appointments.filter(a => a.id !== id) })
      setModalOpen(false)
    }
  }

  const getAppointmentAtSlot = (profId: string, date: Date, hourText: string) => {
    const dateKey = getDateKey(date)
    return config.appointments.find(a => a.professionalId === profId && a.startTime.startsWith(dateKey) && a.startTime.substring(11, 16) === hourText)
  }

  const getAppointmentsAtSlot = (profId: string, date: Date, hourText: string) => {
    const dateKey = getDateKey(date)
    return config.appointments.filter(a => a.professionalId === profId && a.startTime.startsWith(dateKey) && a.startTime.substring(11, 16) === hourText)
  }

  const getProfsWorkingDay = (date: Date) => config.professionals.filter(p => p.daysOfWeek.includes(date.getDay()))

  // Contar cuántos turnos hay en una hora específica
  const getAppointmentsCountAtSlot = (profId: string, date: Date, hourText: string): number => {
    const dateKey = getDateKey(date)
    return config.appointments.filter(a =>
      a.professionalId === profId &&
      a.startTime.startsWith(dateKey) &&
      a.startTime.substring(11, 16) === hourText
    ).length
  }

  const MAX_CAPACITY = 6
const MAX_CAPACITY_UNIFIED = 10

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Week navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingRight: 20, paddingLeft: 20, paddingTop: 20 }}>
        <button onClick={() => setWeekStart(new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000))} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.5)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ChevronLeft size={14} /> Anterior
        </button>
        <p style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>
          {weekDates[0].toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} - {weekDates[6].toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
        <button onClick={() => setWeekStart(new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000))} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.5)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          Siguiente <ChevronRight size={14} />
        </button>
      </div>

      {/* Unified Calendar Grid */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 20, paddingLeft: 20 }}>
        {config.professionals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>
            <p>Sin profesionales configurados. Agregá uno primero.</p>
          </div>
        ) : (
          (() => {
            const getAppointmentsAtTime = (date: Date, hourText: string) => {
              const dateKey = getDateKey(date)
              return config.appointments.filter(a => a.startTime.startsWith(dateKey) && a.startTime.substring(11, 16) === hourText)
            }

            return (
              <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: 10, overflowX: 'auto', position: 'relative' }}>
                {/* Sticky Header */}
                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'inherit', gap: 10, position: 'sticky', top: 0, background: 'linear-gradient(180deg,#0a0a18,#15101e)', zIndex: 10, paddingBottom: 10 }}>
                  <div />
                  {weekDates.map((d, i) => (
                    <div key={i} style={{ textAlign: 'center', marginBottom: 8 }}>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, margin: 0, fontWeight: 600 }}>{getDayName(d.getDay()).substring(0, 3).toUpperCase()}</p>
                      <p style={{ color: 'white', fontSize: 13, fontWeight: 700, margin: 0, cursor: 'pointer', padding: '4px 8px', borderRadius: 6, background: 'rgba(37,99,255,0.1)', transition: 'all 0.2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,255,0.2)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,255,0.1)' }}
                        onClick={() => { setSelectedDayForView(d); setDayViewOpen(true) }}
                      >
                        {d.getDate()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Hour rows */}
                {hoursTexts.map(hourText => (
                  <div key={hourText} style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'inherit', gap: 6 }}>
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, margin: 0, textAlign: 'right', paddingRight: 6 }}>{hourText}</p>

                    {weekDates.map((date, dayIdx) => {
                      const appts = getAppointmentsAtTime(date, hourText)
                      const isFull = appts.length >= MAX_CAPACITY_NEW

                      return (
                        <div
                          key={`${hourText}-${dayIdx}`}
                          onClick={() => {
                            if (!isFull) {
                              setSelectedProfId('')
                              openModal('', date, hourText)
                            }
                          }}
                          style={{
                            minHeight: 120,
                            background: isFull ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.025)',
                            border: isFull ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 8,
                            padding: 8,
                            cursor: !isFull ? 'pointer' : 'default',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            overflowY: 'auto',
                          }}
                          onMouseEnter={e => { if (!isFull) (e.currentTarget as HTMLElement).style.background = 'rgba(251,146,60,0.08)' }}
                          onMouseLeave={e => { if (!isFull) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)' }}
                        >
                          {appts.map(a => {
                            const prof = config.professionals.find(p => p.id === a.professionalId)
                            return (<div
                              key={a.id}
                              onClick={e => { e.stopPropagation(); editAppt(a) }}
                              style={{
                                cursor: 'pointer',
                                background: 'rgba(255,255,255,0.05)',
                                border: `1px solid ${prof?.color || '#2563FF'}`,
                                borderRadius: 5,
                                padding: '4px 6px',
                                display: 'flex',
                                gap: 5,
                                alignItems: 'center',
                                fontSize: '9px',
                              }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${prof?.color || '#2563FF'}30`}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
                            >
                              <div style={{ width: 5, height: 5, borderRadius: '50%', background: prof?.color || '#2563FF', flexShrink: 0 }} />
                              <span style={{ color: 'white', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.clientName}</span>
                              <span style={{ color: `${prof?.color || '#2563FF'}cc`, fontSize: '7px' }}>({prof?.name})</span>
                            </div>)
                          })}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )
          })()
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20, overflowY: 'auto' }}>
          <div style={{ background: '#07070F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 28, maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <p style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '0 0 20px' }}>
              {editingAppt ? 'Editar turno' : 'Crear turno'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Cliente */}
              <div>
                <label style={labelStyle}>Nombre del cliente *</label>
                <input type="text" placeholder="Nombre completo" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>WhatsApp</label>
                  <input type="tel" placeholder="+54 9..." value={form.clientWhatsApp} onChange={e => setForm({ ...form, clientWhatsApp: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" placeholder="cliente@example.com" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
              </div>

              {/* Servicio */}
              <div>
                <label style={labelStyle}>Servicio *</label>
                <select value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur}>
                  <option value="">Seleccionar servicio</option>
                  {config.services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.durationMinutes}min) - ${s.price}</option>
                  ))}
                </select>
              </div>

              {/* Duración (read-only) */}
              {form.serviceId && (
                <div>
                  <label style={labelStyle}>Duración</label>
                  <input type="text" disabled value={`${config.services.find(s => s.id === form.serviceId)?.durationMinutes || 0} minutos`} style={{ ...inputStyle, opacity: 0.6 }} />
                </div>
              )}

              {/* Profesional */}
              <div>
                <label style={labelStyle}>Profesional *</label>
                <select value={form.profId} onChange={e => setForm({ ...form, profId: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur}>
                  <option value="">Seleccionar profesional</option>
                  {config.professionals.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {p.specialty}</option>
                  ))}
                </select>
              </div>

              {/* Fecha y hora */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Fecha *</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
                <div>
                  <label style={labelStyle}>Hora *</label>
                  <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label style={labelStyle}>Estado</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} style={inputStyle} onFocus={focus} onBlur={blur}>
                  <option value="confirmed">Confirmado</option>
                  <option value="pending">Pendiente</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              {/* Recurrencia */}
              <div>
                <label style={labelStyle}>Repetir turno</label>
                <select value={form.recurring} onChange={e => setForm({ ...form, recurring: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur}>
                  <option value="">No repetir (una sola vez)</option>
                  <optgroup label="Selecciona los días que se repite:">
                    <option value="1">Todos los lunes</option>
                    <option value="2">Todos los martes</option>
                    <option value="3">Todos los miércoles</option>
                    <option value="4">Todos los jueves</option>
                    <option value="5">Todos los viernes</option>
                    <option value="1,3,5">Lunes, miércoles, viernes</option>
                    <option value="2,4">Martes y jueves</option>
                    <option value="1,2,3,4,5">Lunes a viernes</option>
                    <option value="0,6">Fines de semana</option>
                    <option value="1,2,3,4,5,0,6">Todos los días</option>
                  </optgroup>
                </select>
              </div>

              {/* Cantidad de sesiones */}
              {form.recurring && (
                <div>
                  <label style={labelStyle}>¿Cuántas sesiones?</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={form.sessionCount}
                    onChange={e => setForm({ ...form, sessionCount: Number(e.target.value) })}
                    style={inputStyle}
                    onFocus={focus}
                    onBlur={blur}
                    placeholder="Ej: 10 para 10 sesiones en esos días"
                  />
                  <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '10px 12px', marginTop: 10 }}>
                    <p style={{ color: '#34d399', fontSize: 11, fontWeight: 600, margin: '0 0 4px' }}>
                      ✓ Se crearán {form.sessionCount} sesiones
                    </p>
                    <p style={{ color: 'rgba(52,212,153,0.7)', fontSize: 10, margin: 0 }}>
                      Comenzando desde {form.date && new Date(form.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} a las {form.startTime}
                    </p>
                  </div>
                </div>
              )}

              {/* Notas */}
              <div>
                <label style={labelStyle}>Notas internas</label>
                <textarea placeholder="Observaciones..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, resize: 'none', height: 60 }} onFocus={focus} onBlur={blur} />
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setModalOpen(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.5)', borderRadius: 10, padding: '12px 0', fontWeight: 600, cursor: 'pointer' }}>
                Cancelar
              </button>
              {editingAppt && (
                <button onClick={() => deleteAppt(editingAppt.id)} style={{ flex: 1, background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', borderRadius: 10, padding: '12px 0', fontWeight: 600, cursor: 'pointer' }}>
                  Eliminar
                </button>
              )}
              <button onClick={saveAppt} style={{ flex: 1, background: 'linear-gradient(135deg,#fb923c,#f97316)', border: 'none', color: 'white', borderRadius: 10, padding: '12px 0', fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 16px rgba(251,146,60,0.3)' }}>
                {editingAppt ? 'Actualizar' : 'Crear'} turno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ver todos los turnos del día */}
      {dayViewOpen && selectedDayForView && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => setDayViewOpen(false)}>
          <div style={{ background: 'linear-gradient(135deg,#0a0a18,#15101e)', borderRadius: 16, border: '1px solid rgba(37,99,255,0.2)', padding: 28, maxWidth: 500, width: '90%', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
              {selectedDayForView.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(() => {
                const dateKey = getDateKey(selectedDayForView)
                const dayAppts = config.appointments.filter(a => a.startTime.startsWith(dateKey))

                if (dayAppts.length === 0) {
                  return <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '20px 0' }}>No hay turnos este día</p>
                }

                const sorted = dayAppts.sort((a, b) => a.startTime.localeCompare(b.startTime))
                const grouped = sorted.reduce((acc: Record<string, Appointment[]>, appt) => {
                  const time = appt.startTime.split('T')[1].substring(0, 5)
                  if (!acc[time]) acc[time] = []
                  acc[time].push(appt)
                  return acc
                }, {})

                return Object.entries(grouped).map(([time, appts]) => {
                  const prof = config.professionals.find(p => p.id === appts[0].professionalId)
                  return (
                    <div key={time} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
                      <p style={{ color: prof?.color || '#2563FF', fontSize: 12, fontWeight: 700, margin: '0 0 8px' }}>
                        {time} · {prof?.name} ({prof?.specialty})
                      </p>
                      {appts.map(a => (
                        <div
                          key={a.id}
                          onClick={() => { editAppt(a); setDayViewOpen(false) }}
                          style={{
                            background: prof ? `${prof.color}10` : 'rgba(37,99,255,0.1)',
                            border: prof ? `1px solid ${prof.color}40` : '1px solid rgba(37,99,255,0.4)',
                            borderRadius: 8,
                            padding: '10px',
                            marginTop: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => {
                            const c = prof?.color || '#2563FF';
                            const el = e.currentTarget as HTMLElement;
                            el.style.background = c + '20';
                            el.style.borderColor = c + '60';
                          }}
                          onMouseLeave={e => {
                            const c = prof?.color || '#2563FF';
                            const el = e.currentTarget as HTMLElement;
                            el.style.background = c + '10';
                            el.style.borderColor = c + '40';
                          }}
                        >
                          <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: 0 }}>👤 {a.clientName}</p>
                          <p style={{ color: `${prof?.color}99`, fontSize: 11, margin: '4px 0 0' }}>
                            🛠️ {config.services.find(s => s.id === a.serviceId)?.name}
                          </p>
                          {config.enableComplexity && a.complexity && a.complexity > 1 && (
                            <p style={{ color: '#fbbf24', fontSize: 10, margin: '3px 0 0', fontWeight: 600 }}>
                              🔹 Complejidad: {a.complexity} slots
                            </p>
                          )}
                          <p style={{ color: `${prof?.color}66`, fontSize: 10, margin: '3px 0 0' }}>
                            {a.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                })
              })()}
            </div>

            <button onClick={() => setDayViewOpen(false)} style={{ width: '100%', marginTop: 20, background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.3)', color: '#2563FF', borderRadius: 10, padding: '12px 0', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,255,0.2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,255,0.1)' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MonthCalendarView({ config, saveConfig, monthView, setMonthView, generalConfig }: { config: TurnosConfig; saveConfig: (cfg: TurnosConfig) => void; monthView: Date; setMonthView: (d: Date) => void; generalConfig: any }) {
  const [selectedDateForCreate, setSelectedDateForCreate] = useState<Date | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null)
  const [form, setForm] = useState({ date: '', startTime: '09:00', endTime: '10:00', clientName: '', clientWhatsApp: '', clientEmail: '', profId: '', serviceId: '', status: 'confirmed' as const, notes: '' })

  const year = monthView.getFullYear()
  const month = monthView.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i))

  const getAppointmentsForDay = (date: Date) => {
    const dateKey = getDateKey(date)
    return config.appointments.filter(a => a.startTime.startsWith(dateKey))
  }

  const handleCreateTurno = (date: Date) => {
    const dateStr = getDateKey(date)
    setSelectedDateForCreate(date)
    setForm({ date: dateStr, startTime: '09:00', endTime: '10:00', clientName: '', clientWhatsApp: '', clientEmail: '', profId: config.professionals[0]?.id || '', serviceId: '', status: 'confirmed' as const, notes: '' })
    setEditingAppt(null)
    setOpenModal(true)
  }

  const saveTurno = () => {
    if (!form.clientName || !form.profId || !form.date || !form.startTime) return
    const id = `${Date.now()}_${Math.random().toString(36).substring(2)}`
    const appt: Appointment = { id, professionalId: form.profId, clientName: form.clientName, clientWhatsApp: form.clientWhatsApp, clientEmail: form.clientEmail, serviceId: form.serviceId, startTime: `${form.date}T${form.startTime}`, endTime: `${form.date}T${form.endTime}`, status: form.status, notes: form.notes, source: 'admin' as const, createdAt: new Date().toISOString() }
    saveConfig({ ...config, appointments: [...config.appointments, appt] })
    setOpenModal(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={() => setMonthView(new Date(year, month - 1))} style={{ padding: '8px 12px', background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.3)', color: '#2563FF', borderRadius: 8, cursor: 'pointer' }}>
          ← Anterior
        </button>
        <h2 style={{ color: 'white', margin: 0 }}>
          {monthView.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => setMonthView(new Date(year, month + 1))} style={{ padding: '8px 12px', background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.3)', color: '#2563FF', borderRadius: 8, cursor: 'pointer' }}>
          Siguiente →
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map(day => (
          <div key={day} style={{ textAlign: 'center', fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontSize: 12, padding: 8 }}>
            {day}
          </div>
        ))}

        {days.map((date, idx) => {
          const appts = date ? getAppointmentsForDay(date) : []
          return (
            <div
              key={idx}
              onClick={() => date && setMonthView(date)}
              style={{
                minHeight: 120,
                background: date ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                overflowY: 'auto',
                cursor: date ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (date) (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,255,0.08)' }}
              onMouseLeave={e => { if (date) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)' }}
            >
              {date && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, margin: 0 }}>
                      {date.getDate()}
                    </p>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        handleCreateTurno(date)
                      }}
                      style={{
                        padding: '2px 8px',
                        fontSize: 9,
                        background: 'rgba(37,99,255,0.2)',
                        border: '1px solid rgba(37,99,255,0.4)',
                        color: '#60a5fa',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,255,0.3)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,255,0.2)' }}
                    >
                      +
                    </button>
                  </div>
                  {appts.slice(0, 4).map(a => {
                    const prof = config.professionals.find(p => p.id === a.professionalId)
                    return (
                      <div
                        key={a.id}
                        onClick={e => { e.stopPropagation() }}
                        style={{
                          background: `${prof?.color || '#2563FF'}15`,
                          border: `1px solid ${prof?.color || '#2563FF'}40`,
                          borderRadius: 4,
                          padding: '3px 4px',
                          fontSize: 8,
                          color: 'white',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${prof?.color || '#2563FF'}30`; (e.currentTarget as HTMLElement).style.borderColor = `${prof?.color || '#2563FF'}80` }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${prof?.color || '#2563FF'}15`; (e.currentTarget as HTMLElement).style.borderColor = `${prof?.color || '#2563FF'}40` }}
                      >
                        <strong>{a.clientName}</strong> ({a.startTime.substring(11, 16)})
                      </div>
                    )
                  })}
                  {appts.length > 4 && (
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 7, margin: 0 }}>
                      +{appts.length - 4} más
                    </p>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {openModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.95))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
            <h2 style={{ color: 'white', marginTop: 0, marginBottom: 24, fontSize: 20, fontWeight: 700 }}>Nuevo Turno</h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha</label>
              <input type="text" disabled value={form.date} style={{ ...inputStyle, opacity: 0.6 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hora Inicio</label>
                <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hora Fin</label>
                <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profesional</label>
              <select value={form.profId} onChange={e => setForm({ ...form, profId: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur}>
                <option value="">Seleccionar</option>
                {config.professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Servicio</label>
              <select value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur}>
                <option value="">Seleccionar servicio</option>
                {config.services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {config.enableComplexity && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Complejidad (slots)</label>
                <select value={form.complexity} onChange={e => setForm({ ...form, complexity: Number(e.target.value) })} style={inputStyle} onFocus={focus} onBlur={blur}>
                  <option value={1}>1 slot (simple)</option>
                  <option value={2}>2 slots</option>
                  <option value={3}>3 slots</option>
                  <option value={4}>4 slots (máx)</option>
                </select>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cliente (Nombre)</label>
              <input type="text" placeholder="Ej: Juan Pérez" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>WhatsApp</label>
              <input type="text" placeholder="+54 9 11 2345 6789" value={form.clientWhatsApp} onChange={e => setForm({ ...form, clientWhatsApp: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
              <input type="email" placeholder="cliente@email.com" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={saveTurno} style={{ flex: 1, padding: '12px 16px', background: 'linear-gradient(135deg,#2563FF,#1d4ed8)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                Guardar
              </button>
              <button onClick={() => setOpenModal(false)} style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
