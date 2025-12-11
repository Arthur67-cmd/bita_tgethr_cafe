"use client";
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CoffeeBarPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const [ordersRes, menuRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/menu')
      ]);
      const ordersData = await ordersRes.json();
      const menuData = await menuRes.json();

      setOrders(ordersData.filter(o => o.status !== 'Completed'));
      setMenuItems(menuData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      alert('Failed to update order status');
    }
  }

  async function toggleAvailability(itemId, currentStatus) {
    try {
      const item = menuItems.find(i => i.id === itemId);
      const res = await fetch(`/api/menu/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          available: !currentStatus
        })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      alert('Failed to update availability');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1A1A1A' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const newOrders = orders.filter(o => o.status === 'New');
  const inProgress = orders.filter(o => o.status === 'In Progress');
  const ready = orders.filter(o => o.status === 'Ready');

  return (
    <div className="min-h-screen" style={{ background: '#1A1A1A', color: 'white' }}>

      <header className="sticky top-0 z-50" style={{
        background: 'linear-gradient(135deg, #00C853 0%, #00A344 100%)',
        boxShadow: '0 4px 20px rgba(0, 200, 83, 0.3)'
      }}>
        <div className="max-w-full mx-auto px-6 py-6">
          <div className="flex justify-between items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="BITA_TGETHR logo"
                  loading="lazy"
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: 'cover',
                    borderRadius: 10,
                    flexShrink: 0
                  }}
                /> Coffee Bar Display
              </h1>
              <p className="text-sm opacity-90 mt-1">Order Management • </p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="px-6 py-3 rounded-xl" style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <div className="text-sm opacity-30">Orders</div>
                <div className="text-3xl font-bold">{orders.length}</div>
              </div>
              {session?.user?.role === 'owner' && (
                <button onClick={() => router.push('/owner')} className="btn btn-sensory px-4 py-3 flex items-center gap-2">
                                            <img
                                                src="/logo.png"
                                                alt="BITA_TGETHR logo"
                                                loading="lazy"
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    objectFit: 'cover',
                                                    borderRadius: 10,
                                                    flexShrink: 0
                                                }}
                                            /> Dashboard
                                        </button>
              )}
              {session && (
                <button onClick={() => signOut()} className="btn btn-ghost px-4 py-3" style={{ color: 'Red' }}>
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8">
        <section className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <div className="flex flex-col">
              <div className="p-4 rounded-t-2xl font-bold text-lg flex justify-between items-center" style={{
                background: 'linear-gradient(135deg, #FF3D00 0%, #DD2C00 100%)'
              }}>
                <span>🔴 New Orders</span>
                <span className="px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }}>
                  {newOrders.length}
                </span>
              </div>
              <div className="space-y-4 mt-4 p-4">
                {newOrders.map(order => (
                  <div key={order.id} className="card animate-fade-in p-4 mb-4 rounded-xl" style={{
                    background: '#2A2A2A',
                    border: '3px solid #FF3D00'
                  }}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-3xl font-bold">#{order.id}</div>
                        <div className="text-sm opacity-75">{order.customer_name}</div>
                      </div>
                      <div className="text-sm opacity-75">
                        ⏰ {new Date(order.created_at).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="mb-4 p-3 rounded-lg" style={{ background: '#1A1A1A' }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-lg font-semibold mb-2">
                          • {item.quantity}x {item.name}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => updateOrderStatus(order.id, 'In Progress')}
                      className="btn w-full text-lg"
                      style={{
                        background: 'linear-gradient(135deg, #FF9100 0%, #FF6F00 100%)',
                        color: 'white'
                      }}
                    >
                      ⚡ Start Preparing
                    </button>
                  </div>
                ))}
                {newOrders.length === 0 && (
                  <div className="text-center py-12 opacity-50 rounded-xl" style={{ background: '#222' }}>
                    <div className="text-6xl mb-3">✓</div>
                    <p>No new orders</p>
                  </div>
                )}
              </div>
            </div>


            <div className="flex flex-col">
              <div className="p-4 rounded-t-2xl font-bold text-lg flex justify-between items-center" style={{
                background: 'linear-gradient(135deg, #FF9100 0%, #FF6F00 100%)'
              }}>
                <span>⚡ In Progress</span>
                <span className="px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }}>
                  {inProgress.length}
                </span>
              </div>
              <div className="space-y-4 mt-4 p-4">
                {inProgress.map(order => (
                  <div key={order.id} className="card animate-fade-in p-4 mb-4 rounded-xl" style={{
                    background: '#2A2A2A',
                    border: '3px solid #FF9100'
                  }}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-3xl font-bold">#{order.id}</div>
                        <div className="text-sm opacity-75">{order.customer_name}</div>
                      </div>
                      <div className="text-sm opacity-75">
                        ⏰ {new Date(order.created_at).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="mb-4 p-3 rounded-lg" style={{ background: '#1A1A1A' }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-lg font-semibold mb-2">
                          • {item.quantity}x {item.name}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => updateOrderStatus(order.id, 'Ready')}
                      className="btn w-full text-lg shadow-glow"
                      style={{
                        background: 'linear-gradient(135deg, #00C853 0%, #00A344 100%)',
                        color: 'white'
                      }}
                    >
                      ✅ Mark as Ready
                    </button>
                  </div>
                ))}
                {inProgress.length === 0 && (
                  <div className="text-center py-12 opacity-50 rounded-xl" style={{ background: '#222' }}>
                    <div className="text-6xl mb-3">⚡</div>
                    <p>No orders in progress</p>
                  </div>
                )}
              </div>
            </div>


            <div className="flex flex-col">
              <div className="p-4 rounded-t-2xl font-bold text-lg flex justify-between items-center" style={{
                background: 'linear-gradient(135deg, #00C853 0%, #00A344 100%)'
              }}>
                <span>✅ Ready</span>
                <span className="px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }}>
                  {ready.length}
                </span>
              </div>
              <div className="space-y-4 mt-4 p-4">
                {ready.map(order => (
                  <div key={order.id} className="card animate-fade-in p-4 mb-4 rounded-xl" style={{
                    background: '#2A2A2A',
                    border: '3px solid #00C853'
                  }}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-3xl font-bold">#{order.id}</div>
                        <div className="text-sm opacity-75">{order.customer_name}</div>
                      </div>
                      <div className="text-sm opacity-75">
                        ⏰ {new Date(order.created_at).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="mb-4 p-3 rounded-lg" style={{ background: '#1A1A1A' }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-lg font-semibold mb-2">
                          • {item.quantity}x {item.name}
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-lg text-center font-bold" style={{
                      background: 'linear-gradient(135deg, rgba(0,200,83,0.2) 0%, rgba(0,163,68,0.2) 100%)',
                      color: '#00C853'
                    }}>
                      🎉 Ready for Pickup!
                    </div>

                    <button
                      onClick={() => updateOrderStatus(order.id, 'Completed')}
                      className="btn w-full mt-3"
                      style={{
                        background: '#444',
                        color: 'white'
                      }}
                    >
                      Complete Order
                    </button>
                  </div>
                ))}
                {ready.length === 0 && (
                  <div className="text-center py-12 opacity-50 rounded-xl" style={{ background: '#222' }}>
                    <div className="text-6xl mb-3">📦</div>
                    <p>No ready orders</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>


        <section>
          <div className="card p-6 rounded-2xl" style={{ background: '#2A2A2A' }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>🍽️</span>
              Menu Item Availability
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleAvailability(item.id, item.available)}
                  className="card card-hover text-center p-4 rounded-xl"
                  style={{
                    background: item.available ? '#1A4D2E' : '#4D1A1A',
                    border: `3px solid ${item.available ? '#00C853' : '#FF3D00'}`
                  }}
                >
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center mx-auto mb-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{
                        width: "48px",
                        height: "48px",
                        objectFit: "contain",
                        borderRadius: "9999px",
                      }}
                    />
                  </div>
                  <div className="font-bold text-lg mb-2">{item.name}</div>
                  <div className="badge mx-auto" style={{
                    background: item.available ? 'rgba(0,200,83,0.3)' : 'rgba(255,61,0,0.3)',
                    color: item.available ? '#00C853' : '#FF3D00',
                    border: 'none'
                  }}>
                    {item.available ? '✓ Available' : '✗ Unavailable'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}