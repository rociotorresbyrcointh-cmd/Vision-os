import { NextRequest, NextResponse } from 'next/server'

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!
const SENDGRID_URL = 'https://api.sendgrid.com/v3/mail/send'

export async function POST(req: NextRequest) {
  try {
    const { email, empresa, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email y code requeridos' }, { status: 400 })
    }

    const registroLink = `https://vision-os-delta.vercel.app/register?code=${code}`

    const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg,#2563FF,#1d4ed8); color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .content { padding: 20px; background: #f5f5f5; margin: 20px 0; border-radius: 8px; }
    .code-box { background: #0f172a; color: #60a5fa; padding: 16px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0; }
    .button { display: inline-block; background: linear-gradient(135deg,#2563FF,#1d4ed8); color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
    .footer { color: #999; font-size: 12px; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>¡Bienvenido a Vision OS!</h1>
    </div>

    <div class="content">
      <h2>¡Hola ${empresa}! 🎉</h2>
      <p>Tu acceso a Vision OS está listo. Aquí está tu código de invitación:</p>

      <div class="code-box">${code}</div>

      <p style="text-align: center;">
        <a href="${registroLink}" class="button">Ir a Vision OS →</a>
      </p>

      <p>O copia este link en tu navegador:</p>
      <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 4px;">
        ${registroLink}
      </p>

      <h3>¿Qué sigue?</h3>
      <ul>
        <li>Clickea el botón arriba o copia el link</li>
        <li>Ingresa tu email</li>
        <li>Confirma el código: <strong>${code}</strong></li>
        <li>¡Listo! Tienes 7 días de prueba GRATIS</li>
      </ul>

      <p>¿Preguntas o dudas?<br>
      📧 Contáctanos: support@visionos.app<br>
      💬 WhatsApp: <a href="https://wa.me/541123456789">+54 9 11 2345 6789</a></p>
    </div>

    <div class="footer">
      <p>© 2026 Vision OS. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
    `.trim()

    const response = await fetch(SENDGRID_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email }],
            subject: `🎉 Tu acceso a Vision OS está listo - Código: ${code}`,
          },
        ],
        from: { email: 'noreply@visionos.app', name: 'Vision OS' },
        content: [
          {
            type: 'text/html',
            value: emailContent,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('SendGrid Error:', error)
      return NextResponse.json({ error: 'Error enviando email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Email enviado correctamente' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Error procesando solicitud' }, { status: 500 })
  }
}
