"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setLoaded(true); }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0A3F2F]">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#145E48] rounded-full blur-[100px] opacity-40 animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#34D399] rounded-full blur-[120px] opacity-10 animate-float"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 h-screen flex flex-col">
        
        {/* Navbar */}
        <nav className={`flex justify-between items-center py-8 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          
          <div className="flex gap-6 text-sm font-medium text-white/80">
            <button onClick={() => router.push('/menu')} className="hover:text-white transition-colors">Menu</button>
            <button onClick={() => router.push('/login')} className="hover:text-white transition-colors">Staff</button>
          </div>
        </nav>

        {/* Hero Content */}
        <main className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
          
          <div className={`flex-1 text-center md:text-left transition-all duration-1000 delay-300 ${loaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-[#34D399] text-xs tracking-widest mb-6 backdrop-blur-md">
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
            </span>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              BITA-<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#34D399] to-white">TGETHR!</span>
            </h1>
            <p className="text-lg text-white/60 mb-10 max-w-md mx-auto md:mx-0">
              Experience coffee crafted with passion. 
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button onClick={() => router.push('/menu')} className="px-8 py-4 bg-white text-[#0A3F2F] font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-white/10">
                Order Now ➔
              </button>
              <button onClick={() => router.push('/register')} className="px-8 py-4 border border-white/30 text-white font-bold rounded-full hover:bg-white/10 backdrop-blur-sm transition-all">
                Join Rewards
              </button>
            </div>
          </div>

          <div className={`flex-1 hidden md:block transition-all duration-1000 delay-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="relative animate-float">
                <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl">
                    <div className="aspect-square bg-gradient-to-b from-white/10 to-transparent rounded-2xl flex items-center justify-center text-9xl">
                        🥤
                    </div>
                </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}