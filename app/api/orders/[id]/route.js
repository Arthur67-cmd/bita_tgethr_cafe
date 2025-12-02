import { NextResponse } from 'next/server';
import { mysqlPool } from '@/utils/db';
import { auth } from '@/auth';


export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || !['staff', 'owner'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await request.json();

    const promisePool = mysqlPool.promise();
    await promisePool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    const [updated] = await promisePool.query(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}