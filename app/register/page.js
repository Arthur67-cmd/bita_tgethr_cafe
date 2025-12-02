"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      alert('✅ Account created successfully!');
      router.push('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{
      background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 50%, var(--info) 100%)'
    }}>
      <div className="card animate-fade-in" style={{
        maxWidth: '520px',
        width: '100%'
      }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
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
            />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Create Account
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Join us to get Bita_Tgethr!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="input-group">
            <label className="input-label">Full Name *</label>
            <div className="relative">
              <span className="input-icon">👤</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input input-with-icon"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email Address *</label>
            <div className="relative">
              <span className="input-icon">📧</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input input-with-icon"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password *</label>
            <div className="relative">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input input-with-icon"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Confirm Password *</label>
            <div className="relative">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="input input-with-icon"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Account Type *</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="input"
            >
              <option value="customer">🛍️ Customer</option>
              <option value="staff">👨‍🍳 Staff (Barista)</option>
              <option value="owner">👔 Owner</option>
            </select>
          </div>

          {error && (
            <div className="p-4 rounded-xl animate-slide-in" style={{
              background: 'rgba(255, 61, 0, 0.1)',
              border: '2px solid var(--error)',
              color: 'var(--error)'
            }}>
              <div className="flex items-center gap-2 font-semibold">
                <span>⚠️</span>
                {error}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full text-lg shadow-glow"
            style={{ padding: '1rem' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </span>
            ) : (
              '✨ Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-gradient hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}