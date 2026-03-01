import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const [result] = await sql`SELECT COALESCE(SUM(deposit), 0) as revenue FROM orders`;
    return NextResponse.json({ revenue: parseFloat(result.revenue as string) });
  } catch (error) {
    console.error('Error fetching total revenue:', error);
    return NextResponse.json({ error: 'Failed to fetch total revenue' }, { status: 500 });
  }
}
