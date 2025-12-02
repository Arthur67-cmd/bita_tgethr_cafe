"use client";
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function OwnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login?callbackUrl=/owner");
      return;
    }

    if (session.user.role !== "owner") {
      router.push("/menu");
      return;
    }

    fetchData();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [session, status, router]);

  async function fetchData() {
    try {
      const [statsRes, menuRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/menu')
      ]);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenuItems(menuData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateMenuPrice(itemId) {
    if (!editPrice) return;
    
    try {
      const item = menuItems.find(i => i.id === itemId);
      const res = await fetch(`/api/menu/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          price: parseFloat(editPrice)
        })
      });

      if (res.ok) {
        fetchData();
        setEditingItem(null);
        setEditPrice('');
        alert('✅ Price updated successfully!');
      }
    } catch (error) {
      alert('❌ Failed to update price');
    }
  }

  function startEditing(item) {
    setEditingItem(item.id);
    setEditPrice(item.price);
  }

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "owner") {
    return null;
  }

  const avgOrderValue = stats?.orderCount > 0 && stats?.totalSales
  ? (parseFloat(stats.totalSales) / stats.orderCount).toFixed(2) 
  : '0.00';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass" style={{ 
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
                👔 Owner Dashboard
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Business analytics & management • Auto-refresh every 10s
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => router.push('/coffee-bar')} className="btn btn-secondary">
                ☕ Coffee Bar
              </button>
              <button onClick={() => router.push('/menu')} className="btn btn-secondary">
                🍽️ Menu
              </button>
              <button onClick={() => signOut({ callbackUrl: "/login" })} className="btn btn-ghost">
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  <div className="card card-hover animate-fade-in" style={{ 
    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    color: 'white',
    border: 'none'
  }}>
    <div className="flex items-center gap-4">
      <div className="text-6xl">💰</div>
      <div className="flex-1">
        <div className="text-4xl font-bold mb-1">
          ${stats?.totalSales ? parseFloat(stats.totalSales).toFixed(2) : '0.00'}
        </div>
        <div className="text-sm opacity-90">Total Sales</div>
        <div className="mt-2 px-3 py-1 rounded-full inline-block" style={{ 
          background: 'rgba(255,255,255,0.2)'
        }}>
          +12.5% vs last week
        </div>
      </div>
    </div>
  </div>

  <div className="card card-hover animate-fade-in" style={{ 
    background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
    color: 'white',
    border: 'none'
  }}>
    <div className="flex items-center gap-4">
      <div className="text-6xl">📦</div>
      <div className="flex-1">
        <div className="text-4xl font-bold mb-1">
          {stats?.orderCount || 0}
        </div>
        <div className="text-sm opacity-90">Completed Orders</div>
        <div className="mt-2 px-3 py-1 rounded-full inline-block" style={{ 
          background: 'rgba(255,255,255,0.2)'
        }}>
          {Math.floor((stats?.orderCount || 0) / 7)} per day avg
        </div>
      </div>
    </div>
  </div>

  <div className="card card-hover animate-fade-in" style={{ 
    background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
    color: 'white',
    border: 'none'
  }}>
    <div className="flex items-center gap-4">
      <div className="text-6xl">📊</div>
      <div className="flex-1">
        <div className="text-4xl font-bold mb-1">
          ${avgOrderValue}
        </div>
        <div className="text-sm opacity-90">Avg Order Value</div>
        <div className="mt-2 px-3 py-1 rounded-full inline-block" style={{ 
          background: 'rgba(255,255,255,0.2)'
        }}>
          Target: $15.00
        </div>
      </div>
    </div>
  </div>
</div>

        {/* Popular Items */}
        <div className="card mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>🔥</span>
              Popular Items
            </h2>
            <div className="badge badge-info">
              Top {stats?.popularItems.length || 0} Sellers
            </div>
          </div>
          
          {stats?.popularItems.length > 0 ? (
            <div className="space-y-4">
              {stats.popularItems.map((item, idx) => (
                <div key={idx} className="card-hover p-4 rounded-xl" style={{ 
                  background: 'var(--bg-main)',
                  border: '2px solid var(--border)'
                }}>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold" style={{ 
                      color: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'var(--text-muted)',
                      minWidth: '50px'
                    }}>
                      #{idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-xl mb-1">{item.name}</div>
                      <div className="flex items-center gap-4">
                        <span className="badge badge-success">
                          📦 {item.sold} orders
                        </span>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Revenue: ${(item.sold * 4.5).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gradient">
                        {item.sold}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        sold
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="h-2 rounded-full" style={{ background: 'var(--border)' }}>
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%)',
                          width: `${Math.min((item.sold / (stats?.popularItems[0]?.sold || 1)) * 100, 100)}%`,
                          transition: 'width 0.5s ease'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
              <div className="text-6xl mb-3">📊</div>
              <p>No sales data yet</p>
            </div>
          )}
        </div>

        {/* Menu Management */}
        <div className="card animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>📝</span>
              Menu Management
            </h2>
            <div className="badge badge-info">
              {menuItems.length} Items
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ 
                  background: 'var(--bg-main)',
                  borderBottom: '2px solid var(--border)'
                }}>
                  <th className="p-4 text-left font-bold">Item</th>
                  <th className="p-4 text-left font-bold">Category</th>
                  <th className="p-4 text-left font-bold">Price</th>
                  <th className="p-4 text-left font-bold">Status</th>
                  <th className="p-4 text-left font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map(item => (
                  <tr key={item.id} className="card-hover" style={{ 
                    borderBottom: '1px solid var(--border)'
                  }}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{item.image_url}</div>
                        <div>
                          <div className="font-bold">{item.name}</div>
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="badge badge-info">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4">
                      {editingItem === item.id ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.25"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="input"
                            style={{ width: '100px' }}
                            autoFocus
                          />
                          <button
                            onClick={() => updateMenuPrice(item.id)}
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1rem' }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(null);
                              setEditPrice('');
                            }}
                            className="btn btn-ghost"
                            style={{ padding: '0.5rem 1rem' }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-gradient">
                          ${item.price}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`badge ${item.available ? 'badge-success' : 'badge-error'}`}>
                        {item.available ? '✓ Available' : '✗ Unavailable'}
                      </span>
                    </td>
                    <td className="p-4">
                      {editingItem !== item.id && (
                        <button
                          onClick={() => startEditing(item)}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem 1rem' }}
                        >
                          ✏️ Edit Price
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}