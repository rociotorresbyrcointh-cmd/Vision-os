'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { VisionLogoWhite } from '@/components/VisionLogo'
import { LayoutDashboard, Megaphone, Receipt, BarChart3, Users, Calendar, Settings, LogOut, ChevronRight, ChevronLeft } from 'lucide-react'
import { SECTOR_COLORS, usesTurnos } from '@/lib/constants'

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const sectorColor = SECTOR_COLORS[user?.sector || ''] || '#2563FF'
  const [weekStart, setWeekStart] = useState(new Date())

  const getDayName = (day: number) => {
    const days = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
    return days[day]
  }

  const getWeekDates = () => {
    const d = new Date(weekStart)
    const day = d.getDay()
    const diff = d.getDate() - day
    const sunday = new Date(d)
    sunday.setDate(diff)
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(sunday)
      date.setDate(sunday.getDate() + i)
      return date
    })
  }

  const weekDates = getWeekDates()

  const modules = [
    { href: '/dashboard',             label: 'Dashboard',           Icon: LayoutDashboard, exact: true },
    { href: '/dashboard/turnos',      label: '📅 Gestión de Turnos', Icon: Calendar },
    { href: '/dashboard/clientes',    label: 'Clientes',            Icon: Users },
    { href: '/dashboard/facturacion', label: 'Facturación',         Icon: Receipt },
    { href: '/dashboard/marketing',   label: 'Marketing & Redes',   Icon: Megaphone },
    { href: '#',                      label: 'Analítica',           Icon: BarChart3, disabled: true },
  ]

  return (
    <div style={{ width: 260, background: 'linear-gradient(180deg,#0A0A18 0%,#07070F 100%)', height: '100vh', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(37,99,255,0.1)', position: 'fixed', left: 0, top: 0 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#2563FF,transparent)' }} />

      {/* Logo */}
      <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'center' }}>
        <VisionLogoWhite size={44} animate />
      </div>

      {/* Company badge */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ background: `${sectorColor}0d`, border: `1px solid ${sectorColor}22`, borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${sectorColor},${sectorColor}bb)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0, boxShadow: `0 0 10px ${sectorColor}40`, fontFamily: "'Orbitron', sans-serif" }}>
            {user?.company?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: 'white', fontSize: 12, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.company}</p>
            <p style={{ color: sectorColor, fontSize: 9, margin: 0, fontWeight: 700, letterSpacing: '0.06em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.sector || 'Sin rubro configurado'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '0 8px', margin: '0 0 6px', fontFamily: "'Orbitron', sans-serif" }}>
          Módulos
        </p>

        {modules.map(({ href, label, Icon, exact, disabled }: any) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href) && href !== '#'
          return (
            <div key={`${href}-${label}`}>
              <Link
                href={disabled ? '#' : href}
                onClick={e => disabled && e.preventDefault()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, fontSize: 13,
                  fontWeight: isActive ? 600 : 400, textDecoration: 'none',
                  background: isActive ? 'rgba(37,99,255,0.12)' : 'transparent',
                  color: isActive ? 'white' : disabled ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.45)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  border: isActive ? '1px solid rgba(37,99,255,0.28)' : '1px solid transparent',
                  transition: 'all 0.15s', position: 'relative',
                }}
              >
                {isActive && <div style={{ position: 'absolute', left: 0, top: '18%', bottom: '18%', width: 2.5, borderRadius: 2, background: '#2563FF', boxShadow: '0 0 8px #2563FF' }} />}
                <Icon size={15} style={{ flexShrink: 0, color: isActive ? '#60a5fa' : disabled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.32)' }} />
                <span style={{ flex: 1 }}>{label}</span>
                {disabled ? (
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.06em', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.18)', padding: '2px 6px', borderRadius: 4, fontFamily: "'Orbitron', sans-serif" }}>PRONTO</span>
                ) : isActive ? (
                  <ChevronRight size={12} style={{ color: '#2563FF', flexShrink: 0 }} />
                ) : null}
              </Link>

              {/* Calendar link (solo debajo de Gestión de Turnos) */}
              {label === '📅 Gestión de Turnos' && (
                <Link
                  href="/dashboard/turnos"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', marginTop: 6, borderRadius: 8,
                    fontSize: 12, fontWeight: 500, textDecoration: 'none',
                    background: 'rgba(37,99,255,0.08)',
                    color: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(37,99,255,0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = 'rgba(37,99,255,0.15)'
                    el.style.color = '#60a5fa'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = 'rgba(37,99,255,0.08)'
                    el.style.color = 'rgba(255,255,255,0.6)'
                  }}
                >
                  <Calendar size={12} style={{ color: '#60a5fa' }} />
                  Calendario
                </Link>
              )}
            </div>
          )
        })}

        {/* Settings link */}
        <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8 }}>
          <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '0 8px', margin: '0 0 6px', fontFamily: "'Orbitron', sans-serif" }}>
            Sistema
          </p>
          <Link
            href="/dashboard/configuracion"
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10,
              fontSize: 13, fontWeight: pathname === '/dashboard/configuracion' ? 600 : 400,
              textDecoration: 'none',
              background: pathname === '/dashboard/configuracion' ? 'rgba(37,99,255,0.12)' : 'transparent',
              color: pathname === '/dashboard/configuracion' ? 'white' : 'rgba(255,255,255,0.4)',
              border: pathname === '/dashboard/configuracion' ? '1px solid rgba(37,99,255,0.28)' : '1px solid transparent',
              transition: 'all 0.15s', position: 'relative',
            }}
          >
            {pathname === '/dashboard/configuracion' && <div style={{ position: 'absolute', left: 0, top: '18%', bottom: '18%', width: 2.5, borderRadius: 2, background: '#2563FF', boxShadow: '0 0 8px #2563FF' }} />}
            <Settings size={15} style={{ color: pathname === '/dashboard/configuracion' ? '#60a5fa' : 'rgba(255,255,255,0.3)' }} />
            <span>Configuración</span>
            {pathname === '/dashboard/configuracion' && <ChevronRight size={12} style={{ color: '#2563FF', marginLeft: 'auto' }} />}
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', marginBottom: 4 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#60a5fa', flexShrink: 0 }}>
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, margin: 0 }}>Administrador</p>
          </div>
        </div>
        <button
          onClick={logout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.22)', fontSize: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
          onMouseEnter={e => { const b = e.currentTarget; b.style.color = '#f87171'; b.style.background = 'rgba(239,68,68,0.07)' }}
          onMouseLeave={e => { const b = e.currentTarget; b.style.color = 'rgba(255,255,255,0.22)'; b.style.background = 'transparent' }}
        >
          <LogOut size={13} /> Cerrar sesión
        </button>
      </div>
    </div>
  )
}
