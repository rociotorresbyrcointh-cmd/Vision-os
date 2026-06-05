// Servicio Stripe para manejo de pagos
// Configurar en .env.local:
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
// STRIPE_SECRET_KEY=sk_test_...

export const STRIPE_PLANS = {
  starter: {
    name: 'Starter',
    price: 1000, // USD
    priceId: 'price_starter_usd', // Configurar en Stripe dashboard
  },
  professional: {
    name: 'Professional',
    price: 2000,
    priceId: 'price_professional_usd',
  },
  enterprise: {
    name: 'Enterprise',
    price: 5000,
    priceId: 'price_enterprise_usd',
  },
}

export async function createCheckoutSession(userId: string, priceId: string) {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, priceId })
  })

  const { sessionId } = await response.json()
  return sessionId
}

export async function getSubscriptionStatus(userId: string) {
  const response = await fetch(`/api/subscription-status?userId=${userId}`)
  return response.json()
}
