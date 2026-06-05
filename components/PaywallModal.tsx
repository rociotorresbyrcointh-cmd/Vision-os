'use client'

import { STRIPE_PLANS } from '@/lib/stripe-service'
import { X } from 'lucide-react'

export function PaywallModal({ daysLeft, onClose }: { daysLeft: number; onClose: () => void }) {
  const isExpired = daysLeft <= 0

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.95))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 48, width: '100%', maxWidth: 600, boxShadow: '0 20px 60px rgba(0,0,0,0.8)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
          <X size={24} />
        </button>

        {isExpired ? (
          <>
            <h2 style={{ color: 'white', fontSize: 28, fontWeight: 800, margin: '0 0 12px', textAlign: 'center' }}>
              Tu período de prueba expiró
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, textAlign: 'center', margin: '0 0 32px' }}>
              ¡Gracias por probar Vision OS! Ahora es momento de suscribirse y continuar usando la plataforma.
            </p>
          </>
        ) : (
          <>
            <h2 style={{ color: 'white', fontSize: 28, fontWeight: 800, margin: '0 0 8px', textAlign: 'center' }}>
              {daysLeft} días de prueba restantes
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, textAlign: 'center', margin: '0 0 32px' }}>
              Suscribete ahora y obtén acceso completo a todas las funciones.
            </p>
          </>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          {Object.values(STRIPE_PLANS).map(plan => (
            <div key={plan.priceId} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
              <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>
                {plan.name}
              </h3>
              <p style={{ color: '#2563FF', fontSize: 28, fontWeight: 900, margin: '0 0 16px', fontFamily: "'Orbitron', sans-serif" }}>
                ${plan.price}/mes
              </p>
              <button
                onClick={() => {
                  // Integrar con Stripe después
                  alert(`Suscripción a ${plan.name} - integrar con Stripe`);
                }}
                style={{ width: '100%', padding: '12px 16px', background: 'linear-gradient(135deg,#2563FF,#1d4ed8)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                Suscribirse
              </button>
            </div>
          ))}
        </div>

        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center', margin: 0 }}>
          💳 Pagos seguros con Stripe | 📧 Facturación automática | 🔄 Cancela cuando quieras
        </p>
      </div>
    </div>
  )
}
