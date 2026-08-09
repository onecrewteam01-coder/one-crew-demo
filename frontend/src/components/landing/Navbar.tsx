"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  onNavigate?: (section: "home" | "how" | "meet") => void;
  onLogin?: () => void;
}

export default function Navbar({ onNavigate, onLogin }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", key: "home" },
    { label: "How OneCrew Works", key: "how" },
    { label: "Meet Crew", key: "meet" },
  ] as const;

  return (
    <nav
      id="main-nav"
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out border-b ${
        scrolled
          ? "bg-[#050505]/85 backdrop-blur-2xl border-white/10 py-2 md:py-4 shadow-[0_12px_40px_rgba(0,0,0,0.9)]"
          : "bg-[#050505]/40 backdrop-blur-md border-white/[0.04] py-3 md:py-6"
      }`}
    >
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16">
        {/* Logo */}
        <div
          onClick={() => window.location.reload()}
          className="font-sora text-2xl font-semibold tracking-tighter text-white glow-text cursor-pointer select-none"
        >
          OneCrew
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate?.(item.key)}
              className="relative font-mono text-xs uppercase tracking-widest text-white/50 hover:text-white/95 transition-all duration-300 group"
            >
              {item.label}

              {/* underline */}
              <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </button>
          ))}
        </div>

        {/* Login Button */}
        {/* Desktop Login */}
        <div className="hidden md:block">
          <button
            onClick={onLogin}
            className="bg-white text-[#050505] px-6 py-2 rounded-full font-mono text-xs font-semibold uppercase tracking-widest shadow-[0_4px_12px_rgba(255,255,255,0.05)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:translate-y-0 transition-all duration-300"
          >
            Login
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white"
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#050505]/95 backdrop-blur-xl">
          <div className="flex flex-col px-6 py-6 gap-6">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate?.(item.key);
                  setMobileMenuOpen(false);
                }}
                className="text-left font-mono text-sm uppercase tracking-widest text-white/70 hover:text-white transition-colors"
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => {
                onLogin?.();
                setMobileMenuOpen(false);
              }}
              className="mt-2 rounded-full bg-white py-3 text-center font-mono text-xs font-semibold uppercase tracking-widest text-[#2f3131]"
            >
              Login
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
