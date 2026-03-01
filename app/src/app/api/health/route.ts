import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    await sql`SELECT 1`;
    return NextResponse.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return NextResponse.json({ status: 'error', database: 'disconnected' }, { status: 500 });
  }
}
