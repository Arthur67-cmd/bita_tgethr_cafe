import { NextResponse } from 'next/server';
import { mysqlPool } from '@/utils/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const promisePool = mysqlPool.promise();

    // Total sales
    const [salesResult] = await promisePool.query(
      `SELECT SUM(total) as total_sales, COUNT(*) as order_count 
       FROM orders WHERE status IN ('Ready', 'Completed')`
    );

    // Popular items
    const [popularItems] = await promisePool.query(
      `SELECT mi.name, SUM(oi.quantity) as sold
       FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status IN ('Ready', 'Completed')
       GROUP BY mi.id, mi.name
       ORDER BY sold DESC
       LIMIT 10`
    );

    return NextResponse.json({
      totalSales: salesResult[0].total_sales || 0,
      orderCount: salesResult[0].order_count || 0,
      popularItems
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}