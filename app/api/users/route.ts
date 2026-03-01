import { NextRequest, NextResponse } from 'next/server';
import { sql, toUser } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const users = await sql`SELECT * FROM users ORDER BY name`;
    return NextResponse.json(users.map(toUser));
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    const id = uuidv4();
    const now = new Date().toISOString();
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const [user] = await sql`
      INSERT INTO users (id, name, role, phone, username, password, is_active, created_at)
      VALUES (${id}, ${userData.name}, ${userData.role}, ${userData.phone || null}, ${userData.username}, ${hashedPassword}, ${userData.isActive !== false}, ${now})
      RETURNING *
    `;

    return NextResponse.json(toUser(user), { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
