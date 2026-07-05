// app/api/ping-google/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuth } from 'google-auth-library'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url || !url.startsWith('https://')) {
      return NextResponse.json({ error: 'Valid HTTPS URL required' }, { status: 400 })
    }

    // Load service account credentials from env
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}')

    if (!credentials.client_email) {
      return NextResponse.json({ error: 'Google service account not configured' }, { status: 500 })
    }

    // Authenticate with Google
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    })

    const client = await auth.getClient()
    const accessToken = await client.getAccessToken()

    // Call Google Indexing API
    const response = await fetch(
      'https://indexing.googleapis.com/v3/urlNotifications:publish',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken.token}`,
        },
        body: JSON.stringify({
          url,
          type: 'URL_UPDATED',
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Google Indexing API error:', data)
      return NextResponse.json({ error: data.error?.message || 'Google API error' }, { status: response.status })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('Ping Google error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}