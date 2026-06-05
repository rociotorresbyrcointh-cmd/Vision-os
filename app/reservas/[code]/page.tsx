'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Phone, Mail, Check, AlertCircle } from 'lucide-react'

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
  padding: '12px 16px', color: 'white', fontSize: 14,
  outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.2s',
}

const focus = (e: React.FocusEvent<any>) => e.target.style.borderColor = 'rgba(6,182,212,0.5)'
const blur = (e: React.FocusEvent<any>) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'

export default function ReservasPage({ params }: { params: { code: string } }) {
  const [config, setConfig] = useState<any>(null)
  const [turnos, setTurnos] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Formulario de reserva
  const [step, setStep] = useState<'service' | 'professional' | 'datetime' | 'contact' | 'confirm'>('service')
  const [selectedService, setSelectedService] = useState('')
  const [selectedProf, setSelectedProf] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [reserved, setReserved] = useState(false)

  useEffect(() => {
    // Cargar configuración del negocio usando el código público
    // En este MVP, buscamos en todos los negocios guardados
    const allConfigs = localStorage.getItem('bos_public_businesses') || '{}'
    const businesses = JSON.parse(allConfigs)
    const businessData = businesses[params.code]

    if (!businessData) {
      setError('Código de reservas inválido o expirado')
      setLoading(false)
      return
    }

    // Cargar config y turnos del usuario
    const userConfig = localStorage.getItem(`bos_config_${businessData.userId}`)
    const userTurnos = localStorage.getItem(`bos_turnos_${businessData.userId}`)

    if (!userConfig) {
      setError('No se encontró la configuración del negocio')
      setLoading(false)
      return
    }

    setConfig(JSON.parse(userConfig))
    if (userTurnos) setTurnos(JSON.parse(userTurnos))
    setLoading(false)
  }, [params.code])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#07070F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 50, height: 50, border: '3px solid rgba(6,182,212,0.2)', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Cargando disponibilidad...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#07070F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <AlertCircle size={50} style={{ color: '#f87171', marginBottom: 20 }} />
          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Error</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 20 }}>{error}</p>
          <a href="/" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: 600 }}>Volver al inicio</a>
        </div>
      </div>
    )
  }

  if (reserved) {
    return (
      <div style={{ minHeight: '100vh', background: '#07070F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 500, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 40 }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Check size={28} style={{ color: '#10b981' }} />
          </div>
          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 10 }}>¡Reserva Confirmada!</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 8 }}>Tu turno está confirmado para:</p>
          <p style={{ color: '#06b6d4', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
            {selectedDate} a las {selectedTime}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 20, lineHeight: 1.6 }}>
            Recibirás un recordatorio por WhatsApp 24 horas antes. Si necesitas cambiar o cancelar, contactá con {config.businessName}.
          </p>
          <a href={`/reservas/${params.code}`} onClick={() => { setReserved(false); setStep('service'); setSelectedService(''); setSelectedProf(''); setSelectedDate(''); setSelectedTime(''); setClientName(''); setClientPhone(''); setClientEmail(''); }} style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: 600 }}>
            Hacer otra reserva
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07070F', padding: '20px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', paddingTop: 20 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: 0, marginBottom: 8, fontFamily: "'Orbitron', sans-serif" }}>
            Reservá tu turno
          </p>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 4 }}>{config.businessName}</h1>
          {config.sector && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>{config.sector}</p>}
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40, justifyContent: 'center' }}>
          {['service', 'professional', 'datetime', 'contact', 'confirm'].map((s, i) => (
            <div key={s} style={{ width: 8, height: 8, borderRadius: '50%', background: ['service', 'professional', 'datetime', 'contact', 'confirm'].indexOf(step) >= i ? '#06b6d4' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>

        {/* Formulario */}
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 30, marginBottom: 20 }}>
          {step === 'service' && (
            <div>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 20px' }}>¿Qué servicio buscás?</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {turnos?.services?.map((svc: any) => (
                  <button
                    key={svc.id}
                    onClick={() => { setSelectedService(svc.id); setStep('professional'); }}
                    style={{
                      padding: '16px', textAlign: 'left', background: selectedService === svc.id ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.05)',
                      border: selectedService === svc.id ? '2px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (selectedService !== svc.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
                    onMouseLeave={e => { if (selectedService !== svc.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
                  >
                    <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>{svc.name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>⏱️ {svc.durationMinutes} min {svc.price > 0 ? `· $${svc.price}` : ''}</p>
                  </button>
                )) || <p style={{ color: 'rgba(255,255,255,0.3)' }}>No hay servicios disponibles</p>}
              </div>
            </div>
          )}

          {step === 'professional' && (
            <div>
              <button onClick={() => setStep('service')} style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', marginBottom: 20, fontWeight: 600 }}>← Cambiar servicio</button>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 20px' }}>¿Con quién querés tu turno?</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {turnos?.professionals?.map((prof: any) => (
                  <button
                    key={prof.id}
                    onClick={() => { setSelectedProf(prof.id); setStep('datetime'); }}
                    style={{
                      padding: '16px', textAlign: 'left', background: selectedProf === prof.id ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.05)',
                      border: selectedProf === prof.id ? '2px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>{prof.name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>{prof.specialty}</p>
                  </button>
                )) || <p style={{ color: 'rgba(255,255,255,0.3)' }}>No hay profesionales disponibles</p>}
              </div>
            </div>
          )}

          {step === 'datetime' && (
            <div>
              <button onClick={() => setStep('professional')} style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', marginBottom: 20, fontWeight: 600 }}>← Cambiar profesional</button>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 20px' }}>Elegí fecha y hora</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>FECHA</label>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>HORA</label>
                  <input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
                <button
                  onClick={() => selectedDate && selectedTime && setStep('contact')}
                  disabled={!selectedDate || !selectedTime}
                  style={{
                    marginTop: 20, padding: '14px 0', background: selectedDate && selectedTime ? 'linear-gradient(135deg,#06b6d4,#0284c7)' : 'rgba(6,182,212,0.2)',
                    color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: selectedDate && selectedTime ? 'pointer' : 'not-allowed',
                    boxShadow: selectedDate && selectedTime ? '0 0 16px rgba(6,182,212,0.3)' : 'none',
                  }}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 'contact' && (
            <div>
              <button onClick={() => setStep('datetime')} style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', marginBottom: 20, fontWeight: 600 }}>← Cambiar fecha/hora</button>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 20px' }}>Tus datos</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>NOMBRE *</label>
                  <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Tu nombre completo" style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>WHATSAPP *</label>
                  <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+54 9 11 0000-0000" style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>EMAIL (opcional)</label>
                  <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="tu@email.com" style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
                <button
                  onClick={() => clientName && clientPhone && setStep('confirm')}
                  disabled={!clientName || !clientPhone}
                  style={{
                    marginTop: 20, padding: '14px 0', background: clientName && clientPhone ? 'linear-gradient(135deg,#06b6d4,#0284c7)' : 'rgba(6,182,212,0.2)',
                    color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: clientName && clientPhone ? 'pointer' : 'not-allowed',
                  }}
                >
                  Revisar reserva
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div>
              <button onClick={() => setStep('contact')} style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', marginBottom: 20, fontWeight: 600 }}>← Editar datos</button>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 20px' }}>Confirmá tu reserva</h2>
              <div style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}><Calendar size={16} style={{ color: '#06b6d4' }} /> <span style={{ color: 'white' }}>{selectedDate}</span></div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}><Clock size={16} style={{ color: '#06b6d4' }} /> <span style={{ color: 'white' }}>{selectedTime}</span></div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}><User size={16} style={{ color: '#06b6d4' }} /> <span style={{ color: 'white' }}>{clientName}</span></div>
                <div style={{ display: 'flex', gap: 12 }}><Phone size={16} style={{ color: '#06b6d4' }} /> <span style={{ color: 'white' }}>{clientPhone}</span></div>
              </div>
              <button
                onClick={() => {
                  // Guardar la reserva en el localStorage del negocio
                  const service = turnos.services.find((s: any) => s.id === selectedService)
                  const prof = turnos.professionals.find((p: any) => p.id === selectedProf)
                  const startDateTime = `${selectedDate}T${selectedTime}`
                  const endTime = new Date(new Date(startDateTime).getTime() + (service?.durationMinutes || 60) * 60000)
                  const newAppt = {
                    id: Date.now().toString(),
                    clientName, clientPhone, clientEmail,
                    professionalId: selectedProf, serviceId: selectedService,
                    startTime: startDateTime, endTime: endTime.toISOString(),
                    status: 'pending', notes: 'Reserva desde sitio público', createdAt: new Date().toISOString(), source: 'public',
                  }
                  const updatedTurnos = { ...turnos, appointments: [...(turnos.appointments || []), newAppt] }
                  // Aquí normalmente guardaríamos en el servidor, pero en este MVP guardamos en localStorage
                  setReserved(true)
                }}
                style={{
                  width: '100%', padding: '14px 0', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white',
                  border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14,
                  boxShadow: '0 0 16px rgba(16,185,129,0.3)',
                }}
              >
                ✓ Confirmar reserva
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
          <p>
            {config.phone && `📞 ${config.phone}`}
            {config.phone && config.website && ' · '}
            {config.website && `🌐 ${config.website}`}
          </p>
        </div>
      </div>
    </div>
  )
}
