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
        setCart(
            cart
                .map(item => {
                    if (item.cartId === cartId) {
                        const newQuantity = item.quantity + change;
                        if (newQuantity <= 0) return null;
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                })
                .filter(Boolean)
        );
    }

    function removeFromCart(cartId) {
        setCart(cart.filter(item => item.cartId !== cartId));
        showToastMessage('Item removed from cart');
    }

    function getItemCountInCart(itemId) {
        return cart
            .filter(item => item.id === itemId)
            .reduce((sum, item) => sum + item.quantity, 0);
    }

    function getSubtotal() {
        return cart
            .reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
            .toFixed(2);
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
        <div className="min-h-screen py-8" style={{ background: 'var(--bg-main)' }}>

            {showToast && (
                <div className="toast toast-success animate-slide-in">
                    <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>✓</span>
                    {toastMessage}
                </div>
            )}


            <header
                className="sticky top-0 z-50 glass"
                style={{
                    borderBottom: '1px solid var(--border)'
                }}
            >
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex justify-between items-center mb-4">

                        <div className="flex items-center gap-4">
                            <image
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
                            />
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

                        <div className="flex items-center gap-3">
                            {session && (
                                <div className="badge badge-info">
                                 {cart.length} {cart.length === 1 ? 'Order' : 'Orders'}
                                </div>
                            )}

                            {session?.user?.loyaltyPoints > 0 && (
                                <div className="badge badge-warning">
                                    ★ {session.user.loyaltyPoints} Pts
                                </div>
                            )}

                            <button onClick={() => router.push('/orders')} className="btn btn-primary">
                                <image
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
                                /> My Orders
                            </button>


                            {session ? (
                                <>
                                    {session.user.role === 'owner' && (
                                        <button onClick={() => router.push('/owner')} className="btn btn-primary">
                                            <image
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
                                    {['staff', 'owner'].includes(session.user.role) && (
                                        <button onClick={() => router.push('/coffee-bar')} className="btn btn-primary">
                                            <image
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
                                            /> Coffee Bar
                                        </button>
                                    )}
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/login' })}
                                        className="btn btn-ghost"
                                    >
                                        Logout
                                    </button>


                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                                        style={{
                                            background:
                                                'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                                            color: 'white'
                                        }}
                                    >
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


                    <div className="search-container" style={{ paddingTop: 6 }}>
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search menu items..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2">

                        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
                                    style={{ padding: '8px 12px', borderRadius: 10 }}
                                >
                                    {category}
                                    <span className="ml-2 opacity-75">
                                        (
                                        {category === 'All'
                                            ? menuItems.length
                                            : menuItems.filter(item => item.category === category).length}
                                        )
                                    </span>
                                </button>
                            ))}
                        </div>


                        {filteredItems.length === 0 ? (
                            <div className="card text-center py-12" style={{ padding: '28px' }}>
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold mb-2">No items found</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Try searching for something else
                                </p>
                            </div>
                        ) : (
                            <div
                                className="product-grid"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                                    gap: '20px'
                                }}
                            >
                                {filteredItems.map(item => {
                                    const itemCount = getItemCountInCart(item.id);

                                    return (
                                        <div
                                            key={item.id}
                                            className="card-product animate-fade-in"
                                            style={{
                                                borderRadius: 12,
                                                overflow: 'hidden',
                                                background: 'var(--bg-card)',
                                                boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                                                position: 'relative'
                                            }}
                                        >
                                            {itemCount > 0 && (
                                                <div
                                                    className="counter-badge"
                                                    style={{
                                                        position: 'absolute',
                                                        zIndex: 30,
                                                        margin: 12,
                                                        right: 0,
                                                        transform: 'translateX(-8px)'
                                                    }}
                                                >
                                                    {itemCount}
                                                </div>
                                            )}


                                            <div
                                                className="photo-fill"
                                                style={{
                                                    width: '100%',
                                                    height: 0,
                                                    paddingTop: '66%',
                                                    backgroundImage: `url(${item.image_url})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    position: 'relative',
                                                    transition: 'transform 400ms ease',
                                                    willChange: 'transform'
                                                }}
                                                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                                                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                                                aria-label={item.name}
                                            >

                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        background:
                                                            'linear-gradient(180deg, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.5) 100%)'
                                                    }}
                                                />


                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        zIndex: 20,
                                                        display: 'flex',
                                                        alignItems: 'flex-end',
                                                        justifyContent: 'right',
                                                        pointerEvents: 'none',
                                                        padding: '12px'
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            background: 'rgba(0,0,0,0.6)',
                                                            color: 'white',
                                                            padding: '8px 14px',
                                                            borderRadius: 999,
                                                            fontWeight: 800,
                                                            fontSize: '1.1rem',
                                                            boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
                                                            pointerEvents: 'none'
                                                        }}
                                                    >
                                                        ${parseFloat(item.price).toFixed(2)}
                                                    </div>
                                                </div>


                                                <image
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    style={{ display: 'none' }}
                                                    loading="lazy"
                                                />
                                            </div>


                                            <div style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                            {item.name}
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                                                            {item.description?.slice(0, 100)}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => addToCart(item)}
                                                        className="btn-icon"
                                                        style={{
                                                            marginLeft: 12,
                                                            width: 48,
                                                            height: 48,
                                                            borderRadius: 12,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                                            color: '#fff',
                                                            fontWeight: 800,
                                                            boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
                                                        }}
                                                        aria-label={`Add ${item.name} to cart`}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>


                    <div>
                        <div className="card sticky top-24 animate-fade-in" style={{ padding: '18px' }}>
                            <div className="flex items-center justify-between mb-4">
                                <h2
                                    className="text-xl font-bold"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    🧾 Order Summary
                                </h2>
                                <span
                                    className="text-sm font-mono"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    #{Math.floor(Math.random() * 100000)}
                                </span>
                            </div>


                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => setOrderType('Dine In')}
                                    className={`flex-1 py-3 rounded-lg font-semibold transition ${orderType === 'Dine In' ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    🍽️ Dine In
                                </button>
                                <button
                                    onClick={() => setOrderType('Take Away')}
                                    className={`flex-1 py-3 rounded-lg font-semibold transition ${orderType === 'Take Away' ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    📦 Take Away
                                </button>
                            </div>


                            <div className="input-group" style={{ marginBottom: 12 }}>
                                <label className="input-label">Customer Name *</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="input"
                                    required
                                />
                            </div>


                            <div className="mb-4">
                                <label className="input-label mb-3">
                                    Order Items ({cart.length})
                                </label>

                                {cart.length === 0 ? (
                                    <div
                                        className="text-center py-12"
                                        style={{
                                            background: 'var(--bg-main)',
                                            borderRadius: '12px',
                                            padding: 20
                                        }}
                                    >
                                        <div className="text-5xl mb-3">🛒</div>
                                        <p
                                            className="font-semibold"
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
                                            Cart is empty
                                        </p>
                                        <p
                                            className="text-sm mt-1"
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            Add items to get started
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-80 overflow-y-auto mb-4" style={{ paddingRight: 6 }}>
                                        {cart.map(item => (
                                            <div
                                                key={item.cartId}
                                                className="card-hover p-3 rounded-xl"
                                                style={{
                                                    background: 'var(--bg-main)',
                                                    border: '1px solid var(--border)',
                                                    padding: 12
                                                }}
                                            >
                                                <div className="flex gap-3">
                                                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">

                                                        <image
                                                            src={item.image_url}
                                                            alt={item.name}
                                                            style={{
                                                                width: '56px',
                                                                height: '56px',
                                                                objectFit: 'contain'
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-sm mb-1">
                                                            {item.name}
                                                        </h4>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-bold text-gradient">
                                                                ${(item.price * item.quantity).toFixed(2)}
                                                            </span>


                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => updateQuantity(item.cartId, -1)}
                                                                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
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
                                                                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                                                                    style={{
                                                                        background: 'var(--primary)',
                                                                        color: 'white'
                                                                    }}
                                                                >
                                                                    +
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        removeFromCart(item.cartId)
                                                                    }
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


                            {cart.length > 0 && (
                                <>
                                    <div
                                        className="space-y-3 p-4 rounded-xl mb-4"
                                        style={{
                                            background: 'var(--bg-main)',
                                            padding: 16
                                        }}
                                    >
                                        <div className="flex justify-between text-sm">
                                            <span style={{ color: 'var(--text-secondary)' }}>
                                                Subtotal
                                            </span>
                                            <span className="font-semibold">
                                                ${getSubtotal()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span style={{ color: 'var(--text-secondary)' }}>
                                                Tax (10%)
                                            </span>
                                            <span className="font-semibold">
                                                ${getTax()}
                                            </span>
                                        </div>
                                        <div
                                            className="h-px"
                                            style={{ background: 'var(--border)' }}
                                        ></div>
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
