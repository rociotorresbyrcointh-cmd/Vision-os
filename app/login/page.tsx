'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { VisionLogoWhite } from '@/components/VisionLogo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const ok = await login(email, password)
    if (ok) {
      router.push('/dashboard')
    } else {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    }
  }

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    card.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(12px)`
    card.style.transition = 'transform 0.08s ease'
  }

  const onMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0px)'
      cardRef.current.style.transition = 'transform 0.6s ease'
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07070F', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

      <style>{`
        @keyframes gridScroll {
          from { background-position: 0 0; }
          to   { background-position: 0 70px; }
        }

        /* 4D = rotar en X+Y+Z simultáneamente a distintas velocidades */
        @keyframes dim4ring1 {
          0%   { transform: perspective(700px) rotateX(0deg)   rotateY(0deg)   rotateZ(0deg); }
          100% { transform: perspective(700px) rotateX(360deg) rotateY(180deg) rotateZ(90deg); }
        }
        @keyframes dim4ring2 {
          0%   { transform: perspective(700px) rotateX(90deg)  rotateY(0deg)   rotateZ(0deg); }
          100% { transform: perspective(700px) rotateX(90deg)  rotateY(360deg) rotateZ(180deg); }
        }
        @keyframes dim4ring3 {
          0%   { transform: perspective(700px) rotateX(45deg)  rotateY(45deg)  rotateZ(0deg); }
          100% { transform: perspective(700px) rotateX(45deg)  rotateY(45deg)  rotateZ(360deg); }
        }
        @keyframes dim4ring4 {
          0%   { transform: perspective(700px) rotateX(0deg)   rotateY(90deg)  rotateZ(0deg); }
          100% { transform: perspective(700px) rotateX(180deg) rotateY(90deg)  rotateZ(270deg); }
        }
        @keyframes dim4ring5 {
          0%   { transform: perspective(700px) rotateX(60deg)  rotateY(30deg)  rotateZ(0deg); }
          100% { transform: perspective(700px) rotateX(60deg)  rotateY(390deg) rotateZ(120deg); }
        }

        @keyframes orbitDot1 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orbitDot2 { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes orbitDot3 { from { transform: rotate(90deg); } to { transform: rotate(450deg); } }

        @keyframes pulse4d {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.9; transform: scale(1.06); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(37,99,255,0.15), 0 24px 48px rgba(0,0,0,0.5); }
          50%       { box-shadow: 0 0 55px rgba(37,99,255,0.3), 0 24px 48px rgba(0,0,0,0.5); }
        }
      `}</style>

      {/* ── Ambient orbs ── */}
      <div style={{ position: 'fixed', top: '-20%', left: '-15%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,255,0.13) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,255,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* ── GRILLA 3D GRANDE — cubre casi toda la pantalla ── */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: '75vh',
        backgroundImage: [
          'linear-gradient(rgba(37,99,255,0.18) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(37,99,255,0.18) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '70px 70px',
        transform: 'perspective(420px) rotateX(80deg)',
        transformOrigin: '50% 100%',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 25%, black 60%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 25%, black 60%)',
        pointerEvents: 'none',
        animation: 'gridScroll 2.5s linear infinite',
        zIndex: 0,
      }} />

      {/* Horizontal line accent on horizon */}
      <div style={{
        position: 'fixed',
        bottom: '25vh',
        left: 0, right: 0,
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(37,99,255,0.6) 30%, rgba(37,99,255,0.8) 50%, rgba(37,99,255,0.6) 70%, transparent)',
        boxShadow: '0 0 20px rgba(37,99,255,0.5)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* ── 4D SPHERE — anillos multidimensionales (derecha) ── */}
      <div style={{ position: 'fixed', right: '6%', top: '50%', transform: 'translateY(-50%)', width: 320, height: 320, pointerEvents: 'none', zIndex: 2 }}>

        {/* 5 anillos, cada uno rota en X+Y+Z distintos → efecto 4D */}
        <div style={{ position: 'absolute', inset: 0, border: '1.5px solid rgba(37,99,255,0.55)', borderRadius: '50%', boxShadow: '0 0 16px rgba(37,99,255,0.2)', animation: 'dim4ring1 12s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 14, border: '1px solid rgba(37,99,255,0.4)', borderRadius: '50%', animation: 'dim4ring2 9s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 28, border: '1px solid rgba(37,99,255,0.3)', borderRadius: '50%', animation: 'dim4ring3 7s linear infinite reverse' }} />
        <div style={{ position: 'absolute', inset: 44, border: '1px solid rgba(96,165,250,0.35)', borderRadius: '50%', boxShadow: '0 0 10px rgba(37,99,255,0.15)', animation: 'dim4ring4 15s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 62, border: '1px solid rgba(96,165,250,0.25)', borderRadius: '50%', animation: 'dim4ring5 11s linear infinite reverse' }} />

        {/* Centro pulsante */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 16, height: 16, borderRadius: '50%',
          background: '#2563FF',
          boxShadow: '0 0 30px 10px rgba(37,99,255,0.5)',
          animation: 'pulse4d 2.5s ease-in-out infinite',
        }} />

        {/* Puntos orbitantes */}
        <div style={{ position: 'absolute', inset: 0, animation: 'orbitDot1 6s linear infinite' }}>
          <div style={{ position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, borderRadius: '50%', background: '#2563FF', boxShadow: '0 0 12px 5px rgba(37,99,255,0.7)' }} />
        </div>
        <div style={{ position: 'absolute', inset: 28, animation: 'orbitDot2 9s linear infinite' }}>
          <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 10px 4px rgba(96,165,250,0.6)' }} />
        </div>
        <div style={{ position: 'absolute', inset: 14, animation: 'orbitDot3 11s linear infinite' }}>
          <div style={{ position: 'absolute', right: -4, top: '50%', transform: 'translateY(-50%)', width: 5, height: 5, borderRadius: '50%', background: '#93c5fd', boxShadow: '0 0 8px 3px rgba(147,197,253,0.5)' }} />
        </div>
      </div>

      {/* ── Decoración izquierda pequeña ── */}
      <div style={{ position: 'fixed', left: '4%', top: '22%', width: 160, height: 160, pointerEvents: 'none', zIndex: 2, opacity: 0.55 }}>
        <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(37,99,255,0.4)', borderRadius: '50%', animation: 'dim4ring2 14s linear infinite reverse' }} />
        <div style={{ position: 'absolute', inset: 20, border: '1px solid rgba(37,99,255,0.25)', borderRadius: '50%', animation: 'dim4ring4 10s linear infinite' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 8, height: 8, borderRadius: '50%', background: '#2563FF', boxShadow: '0 0 14px 5px rgba(37,99,255,0.4)', animation: 'pulse4d 3s ease-in-out infinite' }} />
      </div>

      {/* ── Contenido principal ── */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 400, padding: '0 24px', animation: 'fadeUp 0.7s ease' }}>

        {/* Logo animado */}
        <div style={{ textAlign: 'center', marginBottom: 30, animation: 'logoFloat 4s ease-in-out infinite' }}>
          <VisionLogoWhite size={90} animate />
        </div>

        {/* Card con efecto 3D en hover + glow pulsante */}
        <div
          ref={cardRef}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            borderRadius: 20,
            padding: '28px 28px 22px',
            border: '1px solid rgba(37,99,255,0.28)',
            backdropFilter: 'blur(20px)',
            animation: 'glowPulse 4s ease-in-out infinite',
            transition: 'transform 0.6s ease',
          }}
        >
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 3px' }}>
            Iniciá sesión
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: '0 0 22px' }}>
            Ingresá a tu cuenta de Vision OS
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 7 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="tu@empresa.com"
                style={{ width: '100%', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(37,99,255,0.7)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 7 }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: '100%', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = 'rgba(37,99,255,0.7)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '9px 14px', color: '#f87171', fontSize: 12, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'rgba(37,99,255,0.4)' : 'linear-gradient(135deg, #3b82f6, #2563FF, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                padding: '13px 0',
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.04em',
                boxShadow: loading ? 'none' : '0 0 28px rgba(37,99,255,0.45), 0 4px 16px rgba(0,0,0,0.4)',
                transition: 'all 0.25s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Ingresando...
                </>
              ) : 'Ingresar →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>
            ¿No tenés cuenta?{' '}
            <Link href="/register" style={{ color: '#60a5fa', fontWeight: 700, textDecoration: 'none' }}>
              Registrate
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 10, color: 'rgba(255,255,255,0.14)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Orbitron', sans-serif" }}>
          © 2026 Vision · All Rights Reserved
        </p>
      </div>
    </div>
  )
}
