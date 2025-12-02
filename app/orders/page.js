"use client";
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    // Real-time updates every 3 seconds
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusStyle(status) {
    const styles = {
      'New': { bg: 'linear-gradient(135deg, #FF3D00 0%, #DD2C00 100%)', text: 'white', icon: '🔴' },
      'In Progress': { bg: 'linear-gradient(135deg, #FF9100 0%, #FF6F00 100%)', text: 'white', icon: '⚡' },
      'Ready': { bg: 'linear-gradient(135deg, var(--success) 0%, var(--primary-dark) 100%)', text: 'white', icon: '✅' },
      'Completed': { bg: 'linear-gradient(135deg, #78909C 0%, #546E7A 100%)', text: 'white', icon: '✓' }
    };
    return styles[status] || styles['New'];
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
      {/* Header */}
      <header className="glass sticky top-0 z-50" style={{ 
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gradient flex items-center gap-2">
                📦 My Orders
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {session?.user?.name || 'Guest'} • Track your orders in real-time
              </p>
            </div>
            <div className="flex gap-3">
              {session?.user?.loyaltyPoints > 0 && (
                <div className="badge badge-warning">
                  ★ {session.user.loyaltyPoints} Points
                </div>
              )}
              <button onClick={() => router.push('/menu')} className="btn btn-primary">
                ☕ Menu
              </button>
              {session && (
                <button onClick={() => signOut()} className="btn btn-ghost">
                  🚪 Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {orders.length === 0 ? (
          <div className="card text-center py-16 animate-fade-in">
            <div className="text-8xl mb-6">📦</div>
            <h2 className="text-3xl font-bold mb-3">No Orders Yet</h2>
            <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
              Start by ordering something delicious!
            </p>
            <button onClick={() => router.push('/menu')} className="btn btn-primary text-lg">
              🍽️ Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const statusStyle = getStatusStyle(order.status);
              
              return (
                <div key={order.id} className="card card-hover animate-fade-in">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        🕐 {new Date(order.created_at).toLocaleString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Customer: {order.customer_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="status-pill mb-3" style={{ 
                        background: statusStyle.bg,
                        color: statusStyle.text
                      }}>
                        <span>{statusStyle.icon}</span>
                        {order.status}
                      </div>
                      <div className="text-3xl font-bold text-gradient">
                        ${parseFloat(order.total).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 rounded-xl mb-4" style={{ 
                    background: 'var(--bg-main)'
                  }}>
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <span>🍽️</span>
                      Order Items ({order.items.length})
                    </h4>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <span className="font-semibold">
                              {item.quantity}x
                            </span>
                            <span>{item.name}</span>
                          </span>
                          <span className="font-bold text-gradient">
                            ${(item.quantity * item.price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Message */}
                  {order.status === 'Ready' && (
                    <div className="p-4 rounded-xl animate-pulse" style={{ 
                      background: 'linear-gradient(135deg, rgba(0, 200, 83, 0.1) 0%, rgba(0, 163, 68, 0.1) 100%)',
                      border: '2px solid var(--success)'
                    }}>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🎉</span>
                        <div>
                          <p className="font-bold text-lg" style={{ color: 'var(--success)' }}>
                            Your order is ready!
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Please pick up at the counter
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between mb-2 text-xs font-semibold">
                      {['New', 'In Progress', 'Ready'].map(step => (
                        <span key={step} style={{ 
                          color: order.status === step ? 'var(--primary)' : 'var(--text-muted)'
                        }}>
                          {step}
                        </span>
                      ))}
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'var(--border)' }}>
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%)',
                          width: order.status === 'New' ? '33%' : order.status === 'In Progress' ? '66%' : '100%'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}