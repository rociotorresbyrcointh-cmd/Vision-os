'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useEffect, useState } from 'react'
import { Megaphone, Receipt, BarChart3, Users, Calendar, Settings, ArrowRight, Lock } from 'lucide-react'
import { SECTOR_COLORS } from '@/lib/constants'
import { PaywallModal } from '@/components/PaywallModal'

const ACCENT = '#2563FF'

const stats = [
  { label: 'Anuncios creados',  value: '0', Icon: Megaphone,  color: '#2563FF' },
  { label: 'Facturas emitidas', value: '0', Icon: Receipt,    color: '#06b6d4' },
  { label: 'Clientes',          value: '0', Icon: Users,      color: '#8b5cf6' },
  { label: 'Ingresos del mes',  value: '$0', Icon: Receipt,   color: '#10b981' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  const sectorColor = SECTOR_COLORS[user?.sector || ''] || ACCENT

  useEffect(() => {
    if (!user) return
    const checkAccess = async () => {
      const res = await fetch(`/api/check-access?userId=${user.id}`)
      const data = await res.json()
      if (data.daysLeft !== undefined) {
        setDaysLeft(data.daysLeft)
      }
    }
    checkAccess()
  }, [user])

  const modules = [
    { href: '/dashboard/marketing',    label: 'MARKETING',      title: 'Marketing & Redes Sociales', desc: 'Creador de anuncios con IA, previsualización y 8+ redes sociales.', Icon: Megaphone,  color: '#2563FF',  available: true },
    { href: '/dashboard/facturacion',  label: 'FINANZAS',       title: 'Facturación',         desc: 'Creá y descargá facturas profesionales en PDF al instante.',  Icon: Receipt,    color: '#06b6d4',  available: true },
    { href: '/dashboard/clientes',     label: 'CLIENTES',       title: 'Gestión de Clientes', desc: 'Registrá clientes, servicios, historial y notas de cada uno.', Icon: Users,     color: '#8b5cf6',  available: true },
    { href: '/dashboard/turnos',       label: 'AGENDA',         title: 'Gestión de Turnos',   desc: 'Administrá profesionales, servicios y calendario de turnos.', Icon: Calendar,  color: '#fb923c', available: true },
    { href: '#',                       label: 'ANALÍTICA',      title: 'Redes Sociales',      desc: 'Métricas de YouTube, Instagram, TikTok y Facebook en tiempo real.', Icon: BarChart3, color: '#f472b6', available: false },
    { href: '/dashboard/configuracion',label: 'SISTEMA',        title: 'Configuración',       desc: 'Datos del negocio, rubro, servicios y API keys de integraciones.', Icon: Settings,  color: '#94a3b8', available: true },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 6px', fontFamily: "'Orbitron', sans-serif" }}>
              Vision OS · Dashboard
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'white', margin: 0, letterSpacing: '-0.01em' }}>
              Buen día, <span style={{ color: sectorColor }}>{user?.company}</span>
            </h1>
            {user?.sector && (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: '4px 0 0' }}>
                {user.sector}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(37,99,255,0.07)', border: '1px solid rgba(37,99,255,0.16)', borderRadius: 8, padding: '6px 12px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 500 }}>Sistema activo</span>
          </div>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg,${sectorColor}40,transparent 60%)` }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
        {stats.map(({ label, value, Icon, color }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${color},transparent)` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 500, margin: 0 }}>{label}</p>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}14`, border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, color: 'white', margin: '0 0 3px', letterSpacing: '-0.02em' }}>{value}</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', margin: 0 }}>Sin actividad aún</p>
          </div>
        ))}
      </div>

      {/* Modules */}
      <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 12px', fontFamily: "'Orbitron', sans-serif" }}>
        Módulos
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {modules.map(({ href, label, title, desc, Icon, color, available }) => (
          <Link
            key={href + label}
            href={available ? href : '#'}
            onClick={e => !available && e.preventDefault()}
            style={{ display: 'block', textDecoration: 'none', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 20px 18px', opacity: available ? 1 : 0.5, cursor: available ? 'pointer' : 'not-allowed', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => { if (!available) return; const el = e.currentTarget as HTMLElement; el.style.border = `1px solid ${color}35`; el.style.background = `${color}05`; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = `0 10px 28px ${color}10` }}
            onMouseLeave={e => { if (!available) return; const el = e.currentTarget as HTMLElement; el.style.border = '1px solid rgba(255,255,255,0.06)'; el.style.background = 'rgba(255,255,255,0.025)'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${color}60,transparent)` }} />
            <p style={{ color, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 12px', fontFamily: "'Orbitron', sans-serif" }}>{label}</p>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}12`, border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon size={18} style={{ color }} />
            </div>
            <h3 style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.01em' }}>{title}</h3>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: '0 0 14px', lineHeight: 1.55 }}>{desc}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {available ? (
                <><span style={{ color, fontSize: 11, fontWeight: 600 }}>Abrir</span><ArrowRight size={11} style={{ color }} /></>
              ) : (
                <><Lock size={10} style={{ color: 'rgba(255,255,255,0.2)' }} /><span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 600, fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em' }}>PRÓXIMAMENTE</span></>
              )}
            </div>
          </Link>
        ))}
      </div>

      {daysLeft !== null && daysLeft <= 7 && (
        <PaywallModal daysLeft={daysLeft} onClose={() => setDaysLeft(null)} />
      )}
    </div>
  )
}
