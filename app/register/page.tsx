'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { VisionLogoWhite } from '@/components/VisionLogo'
import { SectorSelect } from '@/components/SectorSelect'

export default function RegisterPage() {
  const [company,  setCompany]  = useState('')
  const [sector,   setSector]   = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const { register } = useAuth()
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sector) { setError('Seleccioná el rubro de tu negocio'); return }
    setLoading(true)
    setError('')
    const ok = await register(email, password, company, sector)
    if (ok) {
      router.push('/dashboard')
    } else {
      setError('Ya existe una cuenta con ese email')
      setLoading(false)
    }
  }

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(6px)`
    card.style.transition = 'transform 0.08s ease'
  }
  const onMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0px)'
      cardRef.current.style.transition = 'transform 0.5s ease'
    }
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
    padding: '11px 14px', color: 'white', fontSize: 14,
    outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 10, fontWeight: 700,
    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
    textTransform: 'uppercase', marginBottom: 7,
    fontFamily: "'Orbitron', sans-serif",
  }
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    e.target.style.borderColor = 'rgba(37,99,255,0.6)'
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    e.target.style.borderColor = 'rgba(255,255,255,0.1)'

  return (
    <div style={{ minHeight: '100vh', background: '#07070F', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: 24 }}>
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,255,0.1) 0%,transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-5%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,255,0.07) 0%,transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '38vh', backgroundImage: 'linear-gradient(rgba(37,99,255,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,255,0.12) 1px,transparent 1px)', backgroundSize: '55px 55px', transform: 'perspective(350px) rotateX(82deg)', transformOrigin: '50% 100%', WebkitMaskImage: 'linear-gradient(to bottom,transparent 0%,black 55%)', maskImage: 'linear-gradient(to bottom,transparent 0%,black 55%)', pointerEvents: 'none', animation: 'gridScroll 3s linear infinite' }} />
      <style>{`@keyframes gridScroll { from { background-position: 0 0; } to { background-position: 0 55px; } } @keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: 12 }}>
            <VisionLogoWhite size={60} animate />
          </div>
        </div>

        <div
          ref={cardRef}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          style={{ background: 'linear-gradient(145deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.02) 100%)', borderRadius: 20, padding: '28px 28px 22px', border: '1px solid rgba(37,99,255,0.25)', backdropFilter: 'blur(16px)', boxShadow: '0 0 40px rgba(37,99,255,0.1),0 24px 48px rgba(0,0,0,0.5)', transition: 'transform 0.5s ease' }}
        >
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 3px' }}>Crear cuenta</h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: '0 0 22px' }}>Registrá tu negocio en Vision OS</p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Nombre del negocio */}
              <div>
                <label style={labelStyle}>Nombre del negocio</label>
                <input type="text" value={company} onChange={e => setCompany(e.target.value)} required placeholder="Ej: Estética Lumière" style={fieldStyle} onFocus={focus} onBlur={blur} />
              </div>

              {/* Rubro */}
              <div>
                <label style={labelStyle}>Rubro</label>
                <SectorSelect
                  value={sector}
                  onChange={setSector}
                  onFocus={focus as any}
                  onBlur={blur as any}
                />
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@negocio.com" style={fieldStyle} onFocus={focus} onBlur={blur} />
              </div>

              {/* Contraseña */}
              <div>
                <label style={labelStyle}>Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" style={fieldStyle} onFocus={focus} onBlur={blur} />
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '9px 14px', color: '#f87171', fontSize: 12 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ background: loading ? 'rgba(37,99,255,0.4)' : 'linear-gradient(135deg,#3b82f6,#2563FF)', color: 'white', border: 'none', borderRadius: 10, padding: '13px 0', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 0 24px rgba(37,99,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? (
                  <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Creando cuenta...</>
                ) : 'Crear cuenta →'}
              </button>
            </div>
          </form>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" style={{ color: '#60a5fa', fontWeight: 700, textDecoration: 'none' }}>Ingresá</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 10, color: 'rgba(255,255,255,0.14)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Orbitron', sans-serif" }}>
          © 2026 Vision OS
        </p>
      </div>
    </div>
  )
}
