import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/server/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    if (email === adminEmail && password === adminPassword) {
      const token = createToken({ email, role: 'admin' });
      return NextResponse.json({ token });
    }
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
