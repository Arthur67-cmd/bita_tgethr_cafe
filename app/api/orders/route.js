import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

// GET - Fetch all orders
export async function GET() {
  try {
    
    const promisePool = mysqlPool.promise();
    
    const [orders] = await promisePool.query(`
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    // Get order items for each order
    for (let order of orders) {
      const [items] = await promisePool.query(`
        SELECT 
          oi.*,
          mi.name as item_name,
          mi.image_url
        FROM order_items oi
        LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = ?
      `, [order.id]);
      
      order.items = items;
    }

    console.log(`✅ Fetched ${orders.length} orders`);
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('❌ Orders fetch error:', error);
    return NextResponse.json(
      { error: "Failed to fetch orders", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(request) {
  let connection;
  
  try {
    console.log('🔍 POST /api/orders starting...');
    
    // Parse request body
    const body = await request.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
    
    const {
      customer_name,
      total: requestTotal,
      subtotal,
      tax,
      discount,
      paymentType,
      voucherCode,
      cashierId,
      items
    } = body;
    
    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('❌ No items in order');
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }
    
    // Calculate total if not provided
    let orderTotal = parseFloat(requestTotal);
    if (!orderTotal || orderTotal <= 0) {
      orderTotal = items.reduce((sum, item) => {
        const price = parseFloat(item.price || 0);
        const qty = parseInt(item.quantity || 1);
        return sum + (price * qty);
      }, 0);
    }
    
    if (orderTotal <= 0) {
      console.error('❌ Invalid total:', orderTotal);
      return NextResponse.json(
        { error: "Invalid order total" },
        { status: 400 }
      );
    }
    
    console.log('✅ Validation passed. Total:', orderTotal);
    
    // Get database connection
    const promisePool = mysqlPool.promise();
    connection = await promisePool.getConnection();
    console.log('✅ Database connection acquired');
    
    // Start transaction
    await connection.beginTransaction();
    console.log('✅ Transaction started');
    
    // Get customer name
    const customerName = customer_name || 'Guest';
    
    // Insert order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, customer_name, total, status, payment_status) 
       VALUES (?, ?, ?, ?, ?)`,
      [cashierId || null, customerName, orderTotal, 'New', 'Paid']
    );
    
    const orderId = orderResult.insertId;
    console.log(`✅ Order created with ID: ${orderId}`);
    
    // Insert order items
    for (const item of items) {
      // Support multiple property names
      const menuItemId = item.menu_item_id || item.productId || item.id;
      const quantity = parseInt(item.quantity || 1);
      const price = parseFloat(item.price || 0);
      
      if (!menuItemId) {
        throw new Error(`Item missing menu_item_id: ${JSON.stringify(item)}`);
      }
      
      console.log(`📦 Inserting: menu_item_id=${menuItemId}, qty=${quantity}, price=${price}`);
      
      await connection.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, menuItemId, quantity, price]
      );
    }
    
    console.log(`✅ All ${items.length} items inserted`);
    
    // Add loyalty points if user logged in
    if (cashierId) {
      const points = Math.floor(orderTotal / 10);
      if (points > 0) {
        await connection.query(
          'UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?',
          [points, cashierId]
        );
        console.log(`✅ Added ${points} loyalty points to user ${cashierId}`);
      }
    }
    
    // Commit transaction
    await connection.commit();
    console.log('✅ Transaction committed successfully');
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      orderId,
      total: orderTotal
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ ERROR in POST /api/orders:');
    console.error('❌ Message:', error.message);
    console.error('❌ Code:', error.code);
    console.error('❌ SQL Message:', error.sqlMessage);
    console.error('❌ Stack:', error.stack);
    
    // Rollback transaction if exists
    if (connection) {
      try {
        await connection.rollback();
        console.log('✅ Transaction rolled back');
      } catch (rollbackError) {
        console.error('❌ Rollback error:', rollbackError.message);
      }
    }
    
    return NextResponse.json(
      { 
        error: error.sqlMessage || error.message || 'Failed to create order',
        code: error.code
      },
      { status: 500 }
    );
    
  } finally {
    if (connection) {
      try {
        connection.release();
        console.log('✅ Connection released');
      } catch (releaseError) {
        console.error('❌ Release error:', releaseError.message);
      }
    }
  }
}

// PATCH - Update order status
export async function PATCH(request) {
  try {
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ['New', 'In Progress', 'Ready', 'Completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const promisePool = mysqlPool.promise();

    await promisePool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );

    console.log(`✅ Order #${orderId} status updated to: ${status}`);

    return NextResponse.json({
      message: "Order status updated",
      orderId,
      status
    });

  } catch (error) {
    console.error('❌ Order update error:', error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}