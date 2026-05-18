import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/server/lib/jwt';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  return NextResponse.json({ valid: true, user: decoded });
}
