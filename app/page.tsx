'use client'

import { useState } from 'react'
import Link from 'next/link'
import { VisionLogoWhite } from '@/components/VisionLogo'
import {
  Megaphone, Receipt, BarChart3, ArrowRight, Check,
  Scissors, Activity, Building2, Utensils, Dumbbell,
  Stethoscope, Scale, ShoppingBag, Zap, Lock,
} from 'lucide-react'

// ─── Tokens ─────────────────────────────────────────────────────
const ACCENT  = '#2563FF'
const SURFACE = 'rgba(255,255,255,0.028)'
const BORDER  = 'rgba(255,255,255,0.07)'

// ─── Data ────────────────────────────────────────────────────────
const sectors = [
  { Icon: Scissors,    label: 'Centros de Estética',  color: '#f472b6' },
  { Icon: Activity,    label: 'Kinesiología',          color: '#34d399' },
  { Icon: Stethoscope, label: 'Clínicas & Consultorios', color: '#60a5fa' },
  { Icon: Dumbbell,    label: 'Gimnasios & Fitness',   color: '#fb923c' },
  { Icon: Utensils,    label: 'Gastronomía',           color: '#fbbf24' },
  { Icon: Building2,   label: 'Inmobiliarias',         color: '#a78bfa' },
  { Icon: Scale,       label: 'Estudios Jurídicos',    color: '#2563FF' },
  { Icon: ShoppingBag, label: 'Comercios & Retail',    color: '#f87171' },
]

const features = [
  {
    label: 'MARKETING',
    title: 'Anuncios con IA para tu negocio',
    desc: 'Generá campañas publicitarias para Meta, Instagram y TikTok en segundos. La IA escribe el copy y crea las imágenes adaptados a tu rubro.',
    Icon: Megaphone,
    color: '#2563FF',
    points: [
      'Copy profesional listo para publicar',
      'Imágenes generadas con IA',
      'Adaptado por plataforma y objetivo',
    ],
    available: true,
  },
  {
    label: 'ADMINISTRACIÓN',
    title: 'Facturación en segundos',
    desc: 'Emitir una factura tarda menos de un minuto. Cargás el cliente, el servicio y el monto — Vision OS genera el PDF profesional al instante.',
    Icon: Receipt,
    color: '#06b6d4',
    points: [
      'PDF descargable al instante',
      'Vista previa en tiempo real',
      'Múltiples monedas y tasas de IVA',
    ],
    available: true,
  },
  {
    label: 'ANALÍTICA',
    title: 'Tus redes, en un solo panel',
    desc: 'Conectá YouTube, Instagram, TikTok y Facebook. Métricas de engagement, alcance y recomendaciones de IA para hacer crecer tu negocio.',
    Icon: BarChart3,
    color: '#8b5cf6',
    points: [
      'Conecta 4 plataformas a la vez',
      'Recomendaciones automáticas con IA',
      'Reportes exportables',
    ],
    available: false,
  },
]

const steps = [
  { n: '01', title: 'Registrá tu negocio', desc: 'Creá tu cuenta en menos de 60 segundos. Sin tarjeta de crédito. Sin configuraciones complicadas.' },
  { n: '02', title: 'Configurá tus módulos', desc: 'Personalizá Vision OS con los datos de tu negocio. Cada módulo funciona de forma independiente.' },
  { n: '03', title: 'Operá y crecé', desc: 'Creá anuncios, emití facturas y analizá tus resultados — todo desde un mismo lugar, todos los días.' },
]

const testimonials = [
  {
    name: 'Valeria S.',
    role: 'Directora',
    company: 'Centro de Estética Lumière',
    text: 'Antes tardaba 20 minutos en generar una factura. Ahora lo hago en 60 segundos. Vision OS cambió completamente la parte administrativa de mi centro.',
    color: '#f472b6',
  },
  {
    name: 'Rodrigo M.',
    role: 'Kinesiólogo',
    company: 'KineActiva',
    text: 'Los anuncios que genera la IA son mejores que los que pagaba a una agencia. Y puedo hacerlo yo mismo, sin saber diseño ni publicidad.',
    color: '#34d399',
  },
  {
    name: 'Laura F.',
    role: 'Socia gerente',
    company: 'Inmobiliaria Del Sur',
    text: 'Facturamos decenas de operaciones por mes. Vision OS nos permite emitir comprobantes profesionales en segundos y llevar todo organizado.',
    color: '#a78bfa',
  },
]

// ─── App Mockup ──────────────────────────────────────────────────
function AppMockup() {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(ellipse,rgba(37,99,255,0.14) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{
        background: '#0A0A18', borderRadius: 16, overflow: 'hidden',
        border: '1px solid rgba(37,99,255,0.2)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(37,99,255,0.06)',
        position: 'relative',
      }}>
        {/* Browser bar */}
        <div style={{ background: '#0D0D1E', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {['#ff5f57','#febc2e','#28c840'].map(c => (
            <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, opacity: 0.75 }} />
          ))}
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 5, padding: '3px 10px', marginLeft: 8, fontSize: 10, color: 'rgba(255,255,255,0.22)', fontFamily: 'monospace' }}>
            app.vision-os.com/dashboard
          </div>
        </div>

        <div style={{ display: 'flex', height: 310 }}>
          {/* Mini sidebar */}
          <div style={{ width: 52, background: '#0A0A18', borderRight: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: 6 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#2563FF,#1d4ed8)', borderRadius: 7, marginBottom: 6 }} />
            {[ACCENT,'rgba(255,255,255,0.1)','rgba(255,255,255,0.07)'].map((c, i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: 7, background: i === 0 ? 'rgba(37,99,255,0.2)' : 'transparent', border: i === 0 ? `1px solid rgba(37,99,255,0.3)` : '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 14, height: 10, borderRadius: 2, background: c, opacity: 0.55 }} />
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, background: '#07070F', padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ width: 90, height: 7, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 5 }} />
                <div style={{ width: 140, height: 11, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
              </div>
              <div style={{ width: 72, height: 22, borderRadius: 6, background: 'rgba(37,99,255,0.14)', border: '1px solid rgba(37,99,255,0.2)' }} />
            </div>
            <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(37,99,255,0.3),transparent)', marginBottom: 12 }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7, marginBottom: 12 }}>
              {['#2563FF','#06b6d4','#8b5cf6','#10b981'].map((color, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 9, border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${color},transparent)` }} />
                  <div style={{ width: '60%', height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, marginBottom: 8 }} />
                  <div style={{ width: '40%', height: 13, background: 'rgba(255,255,255,0.13)', borderRadius: 3 }} />
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
              {[
                { c: '#2563FF', l: 'Anuncios' },
                { c: '#06b6d4', l: 'Facturación' },
                { c: '#8b5cf6', l: 'Analítica' },
              ].map((m, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 8, padding: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: `${m.c}18`, border: `1px solid ${m.c}28`, marginBottom: 7 }} />
                  <div style={{ width: '80%', height: 7, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 5 }} />
                  <div style={{ width: '95%', height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, marginBottom: 3 }} />
                  <div style={{ width: '70%', height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, marginBottom: 8 }} />
                  <div style={{ width: '50%', height: 6, background: `${m.c}28`, borderRadius: 3 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [showContactForm, setShowContactForm] = useState(false)
  const [formData, setFormData] = useState({ email: '', empresa: '', rubro: '', turnos: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [code, setCode] = useState('')

  return (
    <div style={{ background: '#07070F', minHeight: '100vh', color: 'white', fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden' }}>

      <style>{`
        @keyframes gridScroll  { from { background-position: 0 0; } to { background-position: 0 70px; } }
        @keyframes fadeUp      { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ring1 { from { transform:perspective(600px) rotateX(72deg) rotateZ(0deg); } to { transform:perspective(600px) rotateX(72deg) rotateZ(360deg); } }
        @keyframes ring2 { from { transform:perspective(600px) rotateY(72deg) rotateZ(0deg); } to { transform:perspective(600px) rotateY(72deg) rotateZ(360deg); } }
        .nav-link { color:rgba(255,255,255,0.5); font-size:14px; font-weight:500; text-decoration:none; transition:color 0.2s; }
        .nav-link:hover { color:white; }
        .sector-card { transition: all 0.2s; cursor:default; }
        .sector-card:hover { transform:translateY(-3px); }
        .feature-card { transition: all 0.22s; }
        .feature-card:hover { transform:translateY(-4px); }
        .foot-link { color:rgba(255,255,255,0.25); font-size:12px; text-decoration:none; transition:color 0.2s; }
        .foot-link:hover { color:rgba(255,255,255,0.6); }
      `}</style>

      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(7,7,15,0.88)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '0 60px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <VisionLogoWhite size={32} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          {[['#características','Características'],['#sectores','Para quién'],['#cómo-funciona','Cómo funciona']].map(([href, label]) => (
            <a key={href} href={href} className="nav-link">{label}</a>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/login" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 500, textDecoration: 'none', padding: '8px 14px', borderRadius: 8 }}>
            Ingresar
          </Link>
          <button onClick={() => setShowContactForm(true)} style={{ background: 'linear-gradient(135deg,#3b82f6,#2563FF)', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none', padding: '8px 20px', borderRadius: 9, boxShadow: '0 0 22px rgba(37,99,255,0.35)', border: 'none', cursor: 'pointer' }}>
            Solicitar acceso →
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', padding: '0 80px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,255,0.11) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,255,0.07) 0%,transparent 65%)', pointerEvents: 'none' }} />

        {/* Grid */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '72%', backgroundImage: 'linear-gradient(rgba(37,99,255,0.13) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,255,0.13) 1px,transparent 1px)', backgroundSize: '70px 70px', transform: 'perspective(400px) rotateX(82deg)', transformOrigin: '50% 100%', WebkitMaskImage: 'linear-gradient(to bottom,transparent 0%,rgba(0,0,0,0.4) 28%,black 62%)', maskImage: 'linear-gradient(to bottom,transparent 0%,rgba(0,0,0,0.4) 28%,black 62%)', pointerEvents: 'none', animation: 'gridScroll 3s linear infinite' }} />
        <div style={{ position: 'absolute', bottom: '28%', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(37,99,255,0.5) 30%,rgba(37,99,255,0.7) 50%,rgba(37,99,255,0.5) 70%,transparent)', boxShadow: '0 0 20px rgba(37,99,255,0.4)', pointerEvents: 'none' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', width: '100%', position: 'relative', zIndex: 2 }}>
          {/* Left */}
          <div style={{ animation: 'fadeUp 0.7s ease both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,255,0.09)', border: '1px solid rgba(37,99,255,0.2)', borderRadius: 100, padding: '5px 14px', marginBottom: 24 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 500 }}>Para cualquier negocio que quiera crecer</span>
            </div>

            <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em', margin: '0 0 20px', color: 'white', fontFamily: "'Orbitron', sans-serif" }}>
              Gestioná tu<br />negocio con<br />
              <span style={{ background: 'linear-gradient(135deg,#60a5fa,#2563FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                inteligencia
              </span>
            </h1>

            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.48)', lineHeight: 1.72, margin: '0 0 36px', maxWidth: 450 }}>
              Vision OS es la plataforma que le faltaba a tu negocio. Creá anuncios con IA, facturá clientes en segundos y analizá tus redes sociales — todo sin depender de múltiples herramientas.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
              <button onClick={() => setShowContactForm(true)} style={{ background: 'linear-gradient(135deg,#3b82f6,#2563FF)', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none', padding: '13px 26px', borderRadius: 11, boxShadow: '0 0 28px rgba(37,99,255,0.38)', display: 'flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer' }}>
                Solicitar acceso <ArrowRight size={15} />
              </button>
              <Link href="#contacto" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: 14, textDecoration: 'none', padding: '13px 26px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.1)' }}>
                Ver más información
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {['Sin tarjeta de crédito', 'Listo en minutos', 'Para cualquier rubro'].map(text => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={12} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div style={{ animation: 'fadeUp 0.9s ease 0.12s both', animationFillMode: 'both' }}>
            <AppMockup />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '30px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[
            { value: '+8',    label: 'Rubros de negocios compatibles' },
            { value: '60s',   label: 'Para generar una factura completa' },
            { value: '3×',    label: 'Más rápido en producción publicitaria' },
            { value: '100%',  label: 'Negocios físicos y digitales' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <p style={{ fontSize: 34, fontWeight: 900, margin: '0 0 4px', fontFamily: "'Orbitron', sans-serif", background: 'linear-gradient(135deg,#fff,#93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {s.value}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: 12, margin: 0, lineHeight: 1.45 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTORES ─────────────────────────────────────────────── */}
      <section id="sectores" style={{ padding: '90px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ color: ACCENT, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 14px', fontFamily: "'Orbitron', sans-serif" }}>
            Para quién es
          </p>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: 'white', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
            Diseñado para negocios reales
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 15, margin: '0 auto', maxWidth: 500, lineHeight: 1.65 }}>
            Vision OS funciona para cualquier negocio que genere ingresos y quiera profesionalizar su operación, sin importar si es físico o digital.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
          {sectors.map(({ Icon, label, color }) => (
            <div
              key={label}
              className="sector-card"
              style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: color, borderRadius: '14px 0 0 14px', opacity: 0.6 }} />
              <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}14`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{label}</p>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.22)', fontSize: 12, marginTop: 16 }}>
          Y cualquier negocio que quiera crecer con tecnología.
        </p>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section id="características" style={{ padding: '80px 80px 100px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ color: ACCENT, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 14px', fontFamily: "'Orbitron', sans-serif" }}>
            Módulos
          </p>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: 'white', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
            Todo lo que necesitás en un lugar
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 15, margin: '0 auto', maxWidth: 480, lineHeight: 1.65 }}>
            Sin pagar múltiples herramientas. Sin aprender 5 plataformas distintas.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {features.map(({ label, title, desc, Icon, color, points, available }) => (
            <div
              key={title}
              className="feature-card"
              style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '28px 26px 24px', position: 'relative', overflow: 'hidden', opacity: available ? 1 : 0.65 }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${color},transparent)` }} />
              {!available && (
                <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '3px 9px', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', fontFamily: "'Orbitron', sans-serif", display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Lock size={9} /> PRÓXIMAMENTE
                </div>
              )}

              <p style={{ color, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 16px', fontFamily: "'Orbitron', sans-serif" }}>{label}</p>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}14`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Icon size={22} style={{ color }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', margin: '0 0 10px', letterSpacing: '-0.01em' }}>{title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, lineHeight: 1.65, margin: '0 0 22px' }}>{desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {points.map(p => (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, background: `${color}14`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={10} style={{ color }} />
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.48)', fontSize: 12 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="cómo-funciona" style={{ padding: '80px 80px 100px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ color: ACCENT, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 14px', fontFamily: "'Orbitron', sans-serif" }}>
            Proceso
          </p>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: 'white', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            En tres pasos ya estás operando
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 15, margin: 0 }}>Sin onboarding complicado. Sin manual de instrucciones.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 36, left: '17%', right: '17%', height: 1, background: 'linear-gradient(90deg,rgba(37,99,255,0.4),rgba(37,99,255,0.15))', zIndex: 0 }} />
          {steps.map(({ n, title, desc }, i) => (
            <div key={n} style={{ textAlign: 'center', padding: '0 36px', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', margin: '0 auto 22px',
                background: i === 0 ? 'linear-gradient(135deg,#2563FF,#1d4ed8)' : 'rgba(255,255,255,0.04)',
                border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.09)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: i === 0 ? '0 0 28px rgba(37,99,255,0.4)' : 'none',
              }}>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, color: i === 0 ? 'white' : 'rgba(255,255,255,0.25)' }}>{n}</span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'white', margin: '0 0 10px' }}>{title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.36)', fontSize: 13, lineHeight: 1.65, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section style={{ padding: '80px 80px 100px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Negocios que ya usan Vision OS
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: 14, margin: 0 }}>Resultados reales de negocios reales</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {testimonials.map(({ name, role, company, text, color }) => (
            <div key={name} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '26px 24px 22px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${color}60,transparent)` }} />
              <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ width: 11, height: 11, background: color, borderRadius: 3, opacity: 0.75 }} />
                ))}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 13, lineHeight: 1.72, margin: '0 0 20px', fontStyle: 'italic' }}>
                "{text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${color}22`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color, flexShrink: 0 }}>
                  {name[0]}
                </div>
                <div>
                  <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: 0 }}>{name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, margin: 0 }}>{role} · {company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────── */}
      <section style={{ padding: '0 80px 100px' }}>
        <div style={{ background: 'linear-gradient(135deg,rgba(37,99,255,0.11) 0%,rgba(37,99,255,0.04) 100%)', border: '1px solid rgba(37,99,255,0.18)', borderRadius: 24, padding: '68px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-60px', top: '50%', transform: 'translateY(-50%)', width: 260, height: 260, pointerEvents: 'none', opacity: 0.35 }}>
            <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(37,99,255,0.5)', borderRadius: '50%', animation: 'ring1 10s linear infinite' }} />
            <div style={{ position: 'absolute', inset: 24, border: '1px solid rgba(37,99,255,0.3)', borderRadius: '50%', animation: 'ring2 14s linear infinite' }} />
          </div>
          <div style={{ position: 'absolute', left: '-50px', top: '50%', transform: 'translateY(-50%)', width: 180, height: 180, pointerEvents: 'none', opacity: 0.25 }}>
            <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(37,99,255,0.4)', borderRadius: '50%', animation: 'ring2 12s linear infinite reverse' }} />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ color: ACCENT, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 16px', fontFamily: "'Orbitron', sans-serif" }}>
              Empezá hoy
            </p>
            <h2 style={{ fontSize: 42, fontWeight: 900, color: 'white', margin: '0 0 16px', letterSpacing: '-0.025em' }}>
              Tu negocio, en un solo lugar
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 16, margin: '0 auto 38px', maxWidth: 480, lineHeight: 1.65 }}>
              Unite a los negocios que ya usan Vision OS para operar mejor, crecer más rápido y dejar de perder tiempo en tareas administrativas.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setShowContactForm(true)} style={{ background: 'linear-gradient(135deg,#3b82f6,#2563FF)', color: 'white', fontWeight: 700, fontSize: 15, textDecoration: 'none', padding: '14px 32px', borderRadius: 12, boxShadow: '0 0 36px rgba(37,99,255,0.45)', display: 'flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer' }}>
                Solicitar acceso <ArrowRight size={16} />
              </button>
              <Link href="/login" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: 15, textDecoration: 'none', padding: '14px 28px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                Ya tengo invitación
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <VisionLogoWhite size={26} />
        <div style={{ display: 'flex', gap: 24 }}>
          {['Términos', 'Privacidad', 'Contacto'].map(l => (
            <a key={l} href="#" className="foot-link">{l}</a>
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, margin: 0, fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.1em' }}>
          © 2026 VISION OS
        </p>
      </footer>

      {/* ── CONTACT FORM MODAL ──────────────────────────────────── */}
      {showContactForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.95))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 40, width: '100%', maxWidth: 450, boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
            <h2 style={{ color: 'white', marginTop: 0, marginBottom: 24, fontSize: 24, fontWeight: 700 }}>Solicitar acceso a Vision OS</h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
              <input type="email" placeholder="tu@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 13, outline: 'none', fontFamily: "'Inter', sans-serif" }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre de tu empresa</label>
              <input type="text" placeholder="Mi Negocio S.A." value={formData.empresa} onChange={e => setFormData({...formData, empresa: e.target.value})} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 13, outline: 'none', fontFamily: "'Inter', sans-serif" }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rubro</label>
              <input type="text" placeholder="Ej: Centro de Estética, Kinesiología..." value={formData.rubro} onChange={e => setFormData({...formData, rubro: e.target.value})} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 13, outline: 'none', fontFamily: "'Inter', sans-serif" }} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Turnos/mes aproximado</label>
              <input type="text" placeholder="Ej: 50, 100..." value={formData.turnos} onChange={e => setFormData({...formData, turnos: e.target.value})} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 13, outline: 'none', fontFamily: "'Inter', sans-serif" }} />
            </div>

            {code && (
              <div style={{ background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.5)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#10b981', margin: '0 0 14px 0', fontWeight: 700 }}>✅ ¡TU CÓDIGO ESTÁ LISTO!</p>

                <div style={{ background: 'rgba(0,0,0,0.6)', border: '2px solid rgba(16,185,129,0.6)', borderRadius: 10, padding: 16, marginBottom: 14, textAlign: 'center' }}>
                  <code style={{ fontSize: 28, fontWeight: 900, color: '#10b981', letterSpacing: '3px', fontFamily: 'monospace', display: 'block', marginBottom: 12 }}>{code}</code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(code); alert('✅ ¡Código copiado al portapapeles!') }}
                    style={{ padding: '10px 20px', background: 'rgba(16,185,129,0.3)', border: '1px solid rgba(16,185,129,0.6)', borderRadius: 8, color: '#10b981', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%' }}
                  >
                    📋 COPIAR CÓDIGO
                  </button>
                </div>

                <div style={{ background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.3)', borderRadius: 8, padding: 12, marginBottom: 14 }}>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
                    📧 <strong>Te enviaremos un email</strong> con tu link de registro. Revisa tu bandeja de entrada (e inbox de spam por si acaso).
                    <br />Si no llega en 2 minutos, puedes usar tu código en: <strong>vision-os-delta.vercel.app/register</strong>
                  </p>
                </div>
              </div>
            )}

            {message && !code && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, color: '#f87171' }}>
                {message}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={async () => {
                  if (!formData.email || !formData.empresa) {
                    setMessage('Completa email y empresa')
                    return
                  }
                  setLoading(true)
                  try {
                    const res = await fetch('/api/contact-form', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(formData)
                    })
                    const data = await res.json()
                    if (res.ok && data.code) {
                      setCode(data.code)
                      setMessage(`✅ ¡Perfecto! Tu código es: ${data.code}`)
                    } else {
                      setMessage(data.error || 'Error enviando solicitud')
                    }
                  } catch (e) {
                    setMessage('Error: intenta de nuevo')
                  }
                  setLoading(false)
                }}
                disabled={loading}
                style={{ flex: 1, padding: '12px 16px', background: 'linear-gradient(135deg,#2563FF,#1d4ed8)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', fontSize: 14, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Enviando...' : 'Enviar solicitud'}
              </button>
              <button onClick={() => { setShowContactForm(false); setMessage(''); }} style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
