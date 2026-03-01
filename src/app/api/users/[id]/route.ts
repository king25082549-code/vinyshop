import { NextRequest, NextResponse } from 'next/server';
import { sql, toUser } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [user] = await sql`SELECT * FROM users WHERE id = ${id}`;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(toUser(user));
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await request.json();

    let hashedPassword = null;
    if (updates.password) {
      hashedPassword = await bcrypt.hash(updates.password, 10);
    }

    const [user] = await sql`
      UPDATE users SET
        name = COALESCE(${updates.name}, name),
        role = COALESCE(${updates.role}, role),
        phone = COALESCE(${updates.phone}, phone),
        username = COALESCE(${updates.username}, username),
        password = COALESCE(${hashedPassword}, password),
        is_active = COALESCE(${updates.isActive}, is_active)
      WHERE id = ${id}
      RETURNING *
    `;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(toUser(user));
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM users WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
