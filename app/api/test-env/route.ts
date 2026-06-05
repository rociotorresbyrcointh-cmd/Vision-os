import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY || 'NOT_FOUND'

  return NextResponse.json({
    apiKeyPresent: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPrefix: apiKey?.substring(0, 10) || 'N/A',
    allEnvKeys: Object.keys(process.env)
      .filter(key => key.includes('RESEND') || key.includes('SEND'))
      .reduce((acc, key) => ({ ...acc, [key]: 'PRESENT' }), {})
  })
}
