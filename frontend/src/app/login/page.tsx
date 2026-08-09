import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login | One Crew",
  description: "Securely sign in to One Crew - The AI-powered founding team for Indian founders.",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen max-h-screen h-screen w-full bg-[#050505] text-[#e5e2e1] overflow-hidden flex flex-col justify-between selection:bg-white selection:text-black">
      

      {/* Cinematic Depth Overlay & Scanlines */}
      <div className="absolute inset-0 z-1 pointer-events-none scanline-overlay opacity-25" />

      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.015] rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 w-full px-6 py-6 md:px-16 md:py-8 max-w-7xl mx-auto flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3.5">
          <Link
            id="header-logo"
            href="/"
            className="font-sora text-2xl font-semibold tracking-tighter text-white glow-text hover:opacity-90 transition-opacity focus:outline-none"
          >
            OneCrew
          </Link>
          
          {/* Relocated Secure Access Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-white/80 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Secure Access
          </div>
        </div>

        {/* Back Link */}
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-white/70 hover:text-white transition-colors duration-300 flex items-center gap-1.5 group focus:outline-none"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Back
        </Link>
      </header>

      {/* Centered Login Card */}
      <main className="relative z-10 w-full flex-grow flex items-center justify-center pb-12">
        <LoginForm />
      </main>

    </div>
  );
}