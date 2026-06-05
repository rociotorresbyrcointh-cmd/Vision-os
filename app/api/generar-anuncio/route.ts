import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  try {
    const { platform, objective, tone, product, audience, businessName, sector, services, apiKey } = await req.json()

    if (!apiKey) {
      return NextResponse.json({ error: 'API key requerida' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey })

    const prompt = `Sos un experto en publicidad digital y copywriting para negocios. Tu tarea es crear un anuncio publicitario profesional y efectivo.

DATOS DEL NEGOCIO:
- Nombre: ${businessName || 'No especificado'}
- Rubro: ${sector || 'No especificado'}
- Servicios: ${services || product}

PARÁMETROS DEL ANUNCIO:
- Plataforma: ${platform}
- Objetivo: ${objective}
- Tono: ${tone}
- Producto/Servicio a promocionar: ${product}
- Audiencia objetivo: ${audience || 'Público general interesado en el servicio'}

INSTRUCCIONES:
1. Creá un anuncio auténtico, específico y relevante para este negocio
2. Usá lenguaje propio del rubro (no genérico)
3. El copy debe generar emoción y urgencia real
4. Adaptá el formato y longitud para ${platform}
5. NO uses clichés vacíos como "somos los mejores" o "calidad garantizada"
6. Incluí detalles específicos que hagan el anuncio creíble

Respondé ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "copy": "El texto completo del anuncio (incluí emojis si aplica al tono y plataforma)",
  "headline": "El titular principal (máximo 8 palabras, poderoso y directo)",
  "cta": "El botón de llamado a la acción (máximo 5 palabras)",
  "description": "Descripción corta para el anuncio (máximo 25 palabras)"
}`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Respuesta inválida de la IA')

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json({ success: true, data: result })

  } catch (err: any) {
    console.error('Error generando anuncio:', err)
    if (err?.status === 401) return NextResponse.json({ error: 'API key inválida. Verificá tu clave en Configuración.' }, { status: 401 })
    if (err?.status === 429) return NextResponse.json({ error: 'Límite de la API alcanzado. Intentá en unos minutos.' }, { status: 429 })
    return NextResponse.json({ error: err.message || 'Error generando el anuncio' }, { status: 500 })
  }
}
