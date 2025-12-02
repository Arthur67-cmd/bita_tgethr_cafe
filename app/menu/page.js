"use client";
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdvancedMenuPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [orderType, setOrderType] = useState('Dine In');

  const categories = ['All', 'Coffee', 'Food', 'Special'];

  useEffect(() => {
    if (session) {
      setCustomerName(session.user.name);
    }
    fetchMenu();
    
    // Auto-refresh menu every 30 seconds
    const interval = setInterval(fetchMenu, 30000);
    return () => clearInterval(interval);
  }, [session]);

  async function fetchMenu() {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      setMenuItems(data.filter(item => item.available));
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function addToCart(item) {
    setCart([...cart, { ...item, cartId: Date.now() + Math.random(), quantity: 1 }]);
    showToastMessage(`${item.name} added to cart`);
  }

  function updateQuantity(cartId, change) {
    setCart(cart.map(item => {
      if (item.cartId === cartId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return null;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  }

  function removeFromCart(cartId) {
    setCart(cart.filter(item => item.cartId !== cartId));
    showToastMessage('Item removed from cart');
  }

  function getItemCountInCart(itemId) {
    return cart.filter(item => item.id === itemId).reduce((sum, item) => sum + item.quantity, 0);
  }

  function getSubtotal() {
    return cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
  }

  function getTax() {
    return (getSubtotal() * 0.1).toFixed(2);
  }

  function getTotal() {
    return (parseFloat(getSubtotal()) + parseFloat(getTax())).toFixed(2);
  }

  function showToastMessage(message) {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  async function handleOrder(e) {
    e.preventDefault();
    if (cart.length === 0 || !customerName) return;

    setSubmitting(true);

    try {
      const orderItems = cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          items: orderItems,
          total: getTotal()
        })
      });

      if (res.ok) {
        showToastMessage('Order placed successfully! 🎉');
        setCart([]);
        setTimeout(() => router.push('/orders'), 1500);
      }
    } catch (error) {
      showToastMessage('Failed to place order ❌');
    } finally {
      setSubmitting(false);
    }
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
      {/* Toast Notification */}
      {showToast && (
        <div className="toast toast-success animate-slide-in">
          <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>✓</span>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 glass" style={{ 
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="text-4xl">☕</div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">BITA_TGETHR</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {session && (
                <div className="badge badge-info">
                  Total: {cart.length} {cart.length === 1 ? 'Order' : 'Orders'}
                </div>
              )}
              
              {session?.user?.loyaltyPoints > 0 && (
                <div className="badge badge-warning">
                  ★ {session.user.loyaltyPoints} Points
                </div>
              )}

              <button 
                onClick={() => router.push('/orders')} 
                className="btn btn-secondary"
              >
                📦 My Orders
              </button>

              {session ? (
                <>
                  {session.user.role === 'owner' && (
                    <button 
                      onClick={() => router.push('/owner')} 
                      className="btn btn-primary"
                    >
                      📊 Dashboard
                    </button>
                  )}
                  {['staff', 'owner'].includes(session.user.role) && (
                    <button 
                      onClick={() => router.push('/coffee-bar')} 
                      className="btn btn-primary"
                    >
                      ☕ Coffee Bar
                    </button>
                  )}
                  <button 
                    onClick={() => signOut({ callbackUrl: '/login' })} 
                    className="btn btn-ghost"
                  >
                    🚪 Logout
                  </button>
                  
                  {/* User Avatar */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ 
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    color: 'white'
                  }}>
                    {session.user.name.charAt(0).toUpperCase()}
                  </div>
                </>
              ) : (
                <button 
                  onClick={() => router.push('/login')} 
                  className="btn btn-primary"
                >
                  🔐 Login
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Categories */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
                >
                  {category}
                  <span className="ml-2 opacity-75">
                    ({category === 'All' 
                      ? menuItems.length 
                      : menuItems.filter(item => item.category === category).length})
                  </span>
                </button>
              ))}
            </div>

            {/* Products Grid */}
            {filteredItems.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">No items found</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Try searching for something else
                </p>
              </div>
            ) : (
              <div className="product-grid">
                {filteredItems.map(item => {
                  const itemCount = getItemCountInCart(item.id);
                  
                  return (
                    <div key={item.id} className="card-product animate-fade-in">
                      {itemCount > 0 && (
                        <div className="counter-badge">{itemCount}</div>
                      )}
                      
                      <div className="text-7xl text-center py-6 mb-3">
                        {item.image_url}
                      </div>
                      
                      <div className="mb-3">
                        <span className="badge badge-success mb-2">
                          {item.category}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                        {item.name}
                      </h3>
                      <p className="text-sm mb-4" style={{ 
                        color: 'var(--text-secondary)',
                        height: '40px',
                        overflow: 'hidden'
                      }}>
                        {item.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-2xl font-bold text-gradient">
                            ${item.price}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span style={{ color: 'var(--warning)' }}>⭐</span>
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                              4.5
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          className="btn-icon"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="card sticky top-24 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  🧾 Order Summary
                </h2>
                <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
                  #{Math.floor(Math.random() * 100000)}
                </span>
              </div>

              {/* Order Type Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setOrderType('Dine In')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    orderType === 'Dine In'
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  🍽️ Dine In
                </button>
                <button
                  onClick={() => setOrderType('Take Away')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    orderType === 'Take Away'
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  📦 Take Away
                </button>
              </div>

              {/* Customer Name */}
              <div className="input-group">
                <label className="input-label">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="input"
                  required
                />
              </div>

              {/* Order List */}
              <div className="mb-4">
                <label className="input-label mb-3">
                  Order Items ({cart.length})
                </label>
                
                {cart.length === 0 ? (
                  <div className="text-center py-12" style={{ 
                    background: 'var(--bg-main)',
                    borderRadius: '12px'
                  }}>
                    <div className="text-5xl mb-3">🛒</div>
                    <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      Cart is empty
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                      Add items to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                    {cart.map(item => (
                      <div key={item.cartId} className="card-hover p-3 rounded-xl" style={{ 
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border)'
                      }}>
                        <div className="flex gap-3">
                          <div className="text-3xl">{item.image_url}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{item.name}</h4>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-gradient">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                              
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.cartId, -1)}
                                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold"
                                  style={{ 
                                    background: 'var(--bg-card)',
                                    border: '2px solid var(--border)'
                                  }}
                                >
                                  -
                                </button>
                                <span className="font-bold w-8 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.cartId, 1)}
                                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold"
                                  style={{ 
                                    background: 'var(--primary)',
                                    color: 'white'
                                  }}
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => removeFromCart(item.cartId)}
                                  className="ml-2 text-lg"
                                  style={{ color: 'var(--error)' }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Details */}
              {cart.length > 0 && (
                <>
                  <div className="space-y-3 p-4 rounded-xl mb-4" style={{ 
                    background: 'var(--bg-main)'
                  }}>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                      <span className="font-semibold">${getSubtotal()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>Tax (10%)</span>
                      <span className="font-semibold">${getTax()}</span>
                    </div>
                    <div className="h-px" style={{ background: 'var(--border)' }}></div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-2xl font-bold text-gradient">
                        ${getTotal()}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleOrder}>
                    <button
                      type="submit"
                      disabled={submitting || !customerName}
                      className="btn btn-primary w-full text-lg shadow-glow"
                      style={{ padding: '1.25rem' }}
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          💳 Confirm Payment
                        </span>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}