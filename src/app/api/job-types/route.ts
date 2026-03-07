import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const jobTypes = await sql`SELECT * FROM job_types ORDER BY name`;
    return NextResponse.json(jobTypes);
  } catch (error) {
    console.error('Error fetching job types:', error);
    return NextResponse.json({ error: 'Failed to fetch job types' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const [jobType] = await sql`
      INSERT INTO job_types (id, name)
      VALUES (gen_random_uuid()::text, ${name.trim()})
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING *
    `;
    return NextResponse.json(jobType, { status: 201 });
  } catch (error) {
    console.error('Error creating job type:', error);
    return NextResponse.json({ error: 'Failed to create job type' }, { status: 500 });
  }
}
