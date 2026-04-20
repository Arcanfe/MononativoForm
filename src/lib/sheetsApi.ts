import { SignJWT, importPKCS8 } from 'jose'

const SCOPE = 'https://www.googleapis.com/auth/spreadsheets'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'

async function getAccessToken(): Promise<string> {
  const email = import.meta.env.VITE_GOOGLE_SA_EMAIL as string
  const rawKey = (import.meta.env.VITE_GOOGLE_SA_PRIVATE_KEY as string).replace(/\\n/g, '\n')
  const privateKey = await importPKCS8(rawKey, 'RS256')

  const now = Math.floor(Date.now() / 1000)
  const jwt = await new SignJWT({ scope: SCOPE })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(email)
    .setAudience(TOKEN_URL)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey)

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token error: ${err}`)
  }

  const { access_token } = await res.json()
  return access_token as string
}

export async function submitToSheet(email: string): Promise<void> {
  const token = await getAccessToken()
  const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID as string
  const timestamp = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Hoja%201!A:B:append?valueInputOption=RAW`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [[timestamp, email]] }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Sheets error: ${err}`)
  }
}
