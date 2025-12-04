// src/app/api/validate/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const SECRET = process.env.PORTAL_JWT_SECRET

if (!SECRET) {
  console.warn('PORTAL_JWT_SECRET não configurado. /api/validate não funcionará corretamente.')
}

export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get('acaoleve_session')?.value

    if (!cookie) {
      return new NextResponse(JSON.stringify({ ok: false }), { status: 401 })
    }

    if (!SECRET) {
      // sem segredo, falha seguro
      return new NextResponse(JSON.stringify({ ok: false }), { status: 500 })
    }

    let payload: any
    try {
      payload = jwt.verify(cookie, SECRET)
    } catch (err) {
      return new NextResponse(JSON.stringify({ ok: false }), { status: 401 })
    }

    // Retorna atributos essenciais do usuário
    const user = {
      id: payload.sub || payload.id,
      name: payload.name,
      email: payload.email,
    }

    return new NextResponse(JSON.stringify({ ok: true, user }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('validate error', err)
    return new NextResponse(JSON.stringify({ ok: false }), { status: 500 })
  }
}
