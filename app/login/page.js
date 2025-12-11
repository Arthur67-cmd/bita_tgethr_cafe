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
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Let's get Bita_Tgethr
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
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-bold text-gradient hover:underline"
            >
              Register Now
            </Link>
          </p>
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