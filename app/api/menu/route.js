import { NextResponse } from 'next/server';
import { mysqlPool } from '@/utils/db';
import { auth } from '@/auth';

// GET all menu items
export async function GET() {
  try {
    const promisePool = mysqlPool.promise();
    const [items] = await promisePool.query(
      'SELECT * FROM menu_items ORDER BY category, name'
    );
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create menu item (owner only)
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description, price, category, image_url } = await request.json();

    const promisePool = mysqlPool.promise();
    const [result] = await promisePool.query(
      `INSERT INTO menu_items (name, description, price, category, image_url) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, price, category, image_url]
    );

    const [newItem] = await promisePool.query(
      'SELECT * FROM menu_items WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json(newItem[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}