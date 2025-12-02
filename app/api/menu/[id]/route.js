import { NextResponse } from 'next/server';
import { mysqlPool } from '@/utils/db';
import { auth } from '@/auth';


export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const promisePool = mysqlPool.promise();
    const [items] = await promisePool.query(
      'SELECT * FROM menu_items WHERE id = ?',
      [id]
    );

    if (items.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(items[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { name, description, price, category, image_url, available } = await request.json();

    const promisePool = mysqlPool.promise();
    await promisePool.query(
      `UPDATE menu_items 
       SET name = ?, description = ?, price = ?, category = ?, image_url = ?, available = ?
       WHERE id = ?`,
      [name, description, price, category, image_url, available, id]
    );

    const [updated] = await promisePool.query(
      'SELECT * FROM menu_items WHERE id = ?',
      [id]
    );

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const promisePool = mysqlPool.promise();
    await promisePool.query('DELETE FROM menu_items WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

