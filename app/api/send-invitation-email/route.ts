import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const { email, empresa, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email y code requeridos' }, { status: 400 })
    }

    const registroLink = `https://vision-os-delta.vercel.app/register?code=${code}`

    // Crear transporte de Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rociotorresbyrcointh@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || '',
      },
    })

    const mailOptions = {
      from: 'rociotorresbyrcointh@gmail.com',
      to: email,
      subject: `Tu acceso a Vision OS - Código: ${code}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: white; border-radius: 8px; }
            .header { background: linear-gradient(135deg,#2563FF,#1d4ed8); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
            .content { padding: 20px; line-height: 1.6; }
            .code-box { background: #f0f0f0; border-left: 4px solid #2563FF; padding: 15px; margin: 20px 0; font-family: monospace; font-size: 18px; font-weight: bold; color: #2563FF; }
            .button { display: inline-block; background: linear-gradient(135deg,#2563FF,#1d4ed8); color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { color: #999; font-size: 12px; text-align: center; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido a Vision OS!</h1>
            </div>

            <div class="content">
              <h2>Hola ${empresa} 👋</h2>
              <p>Tu acceso a Vision OS está listo. Haz click en el botón abajo para registrarte:</p>

              <center>
                <a href="${registroLink}" class="button">Registrarse en Vision OS →</a>
              </center>

              <p>O si el botón no funciona, copia este link en tu navegador:</p>
              <div class="code-box">${registroLink}</div>

              <p><strong>Tu código de invitación:</strong></p>
              <div class="code-box">${code}</div>

              <h3>Qué sigue:</h3>
              <ul>
                <li>Haz click en el botón arriba</li>
                <li>Completa tu email y crea una contraseña</li>
                <li>¡Listo! Tienes 7 días de prueba GRATIS</li>
              </ul>

              <p>¿Preguntas? Responde este email y te ayudaremos.</p>
            </div>

            <div class="footer">
              <p>© 2026 Vision OS. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    // Intentar enviar el email
    try {
      await transporter.sendMail(mailOptions)
      return NextResponse.json({
        success: true,
        message: '✅ Email enviado correctamente a ' + email,
      })
    } catch (emailError) {
      console.error('Gmail error:', emailError)
      // Si falla, devolvemos el código igual para que el usuario lo pueda copiar
      return NextResponse.json({
        success: true,
        fallback: true,
        message: '⚠️ Hubo un problema con el email, pero tu código está listo para copiar.',
        code,
      })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      error: `Error: ${error instanceof Error ? error.message : String(error)}`,
      success: false
    }, { status: 500 })
  }
}
