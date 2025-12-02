import { NextResponse } from 'next/server';
import { mysqlPool } from '@/utils/db';
import { auth } from '@/auth';

// GET all orders
export async function GET() {
  try {
    const session = await auth();
    const promisePool = mysqlPool.promise();
    
    let query = `
      SELECT o.*, 
        GROUP_CONCAT(
          JSON_OBJECT(
            'id', oi.id,
            'menu_item_id', oi.menu_item_id,
            'name', mi.name,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
    `;

    // Filter by user if customer
    if (session && session.user.role === 'customer') {
      query += ' WHERE o.user_id = ?';
    }

    query += ' GROUP BY o.id ORDER BY o.created_at DESC';

    const [orders] = session && session.user.role === 'customer'
      ? await promisePool.query(query, [session.user.id])
      : await promisePool.query(query);

    // Parse items JSON
    const formatted = orders.map(order => ({
      ...order,
      items: order.items ? JSON.parse(`[${order.items}]`) : []
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create order
export async function POST(request) {
  try {
    const session = await auth();
    const { customer_name, items, total } = await request.json();

    const promisePool = mysqlPool.promise();
    const connection = await promisePool.getConnection();

    try {
      await connection.beginTransaction();

      // Create order
      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, customer_name, total, status, payment_status) VALUES (?, ?, ?, ?, ?)',
        [session?.user?.id || null, customer_name, total, 'New', 'Paid']
      );

      const orderId = orderResult.insertId;

      // Create order items
      for (const item of items) {
        await connection.query(
          'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.menu_item_id, item.quantity, item.price]
        );
      }

      // Update loyalty points if user is logged in
      if (session?.user?.id) {
        const points = Math.floor(total);
        await connection.query(
          'UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?',
          [points, session.user.id]
        );
      }

      await connection.commit();

      // Fetch created order with items
      const [orders] = await promisePool.query(
        `SELECT o.*, 
          GROUP_CONCAT(
            JSON_OBJECT(
              'menu_item_id', oi.menu_item_id,
              'name', mi.name,
              'quantity', oi.quantity,
              'price', oi.price
            )
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE o.id = ?
        GROUP BY o.id`,
        [orderId]
      );

      const order = orders[0];
      order.items = order.items ? JSON.parse(`[${order.items}]`) : [];

      return NextResponse.json(order, { status: 201 });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}