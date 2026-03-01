import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [result] = await sql`SELECT COALESCE(SUM(deposit), 0) as revenue FROM orders WHERE order_date = ${today}`;
    return NextResponse.json({ revenue: parseFloat(result.revenue as string) });
  } catch (error) {
    console.error('Error fetching today revenue:', error);
    return NextResponse.json({ error: 'Failed to fetch today revenue' }, { status: 500 });
  }
}
