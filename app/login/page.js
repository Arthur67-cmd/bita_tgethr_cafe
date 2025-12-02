"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ 
      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 50%, var(--secondary) 100%)'
    }}>
      <div className="card animate-fade-in" style={{ 
        maxWidth: '480px',
        width: '100%'
      }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">☕</div>
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Sign in to continue to Bita_Tgethr
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="relative">
              <span className="input-icon">📧</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-with-icon"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="relative">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-with-icon"
                placeholder="••••••••"
                required
              />
            </div>
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
                Signing in...
              </span>
            ) : (
              '🔐 Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link 
              href="/register" 
              className="font-bold text-gradient hover:underline"
            >
              Register Now
            </Link>
          </p>
        </div>

        {/* Demo Accounts */}
        <div className="mt-8 p-4 rounded-xl" style={{ 
          background: 'var(--bg-main)',
          border: '2px dashed var(--border)'
        }}>
          <p className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            🎯 Demo Accounts
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>👤 Customer:</span>
              <code className="font-mono">customer@cafe.com</code>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>👨‍🍳 Staff:</span>
              <code className="font-mono">staff@cafe.com</code>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>👔 Owner:</span>
              <code className="font-mono">owner@cafe.com</code>
            </div>
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Password: </span>
              <code className="font-mono font-bold">password123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}