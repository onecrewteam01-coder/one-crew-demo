"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { KeyRound, LogOut, User } from 'lucide-react';
import { Avatar } from '@/components/profile/Avatar';
import { getStoredProfile, type UserProfile, emptyProfile } from '@/lib/profile';

interface DashboardHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function DashboardHeader({ isSidebarOpen, onToggleSidebar }: DashboardHeaderProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    getStoredProfile().then((p) => {
      if (active) setProfile(p);
    });
    return () => {
      active = false;
    };
  }, []);

  // Close on outside click / Escape — standard dropdown a11y behavior.
  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="relative z-[200] flex flex-row justify-between items-center px-4 sm:px-8 py-3 bg-[#050507] border-b border-[#141416] gap-3 shrink-0">
      <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity">
        <div className="brand-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 className="font-mono text-sm sm:text-base font-bold tracking-wider text-slate-100 uppercase">ONECREW COCKPIT</h1>
        </div>
      </Link>
      <div className="flex items-center gap-2.5 font-mono text-[10px] sm:text-xs flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          className="inline-flex items-center gap-2 font-bold px-3 py-1.5 rounded-md bg-white text-black hover:bg-slate-200 transition-all cursor-pointer font-mono"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isSidebarOpen ? 'bg-green-600 animate-pulse' : 'bg-orange-500 animate-pulse'}`}></span>
          {isSidebarOpen ? (
            <>
              <span className="hidden sm:inline">HIDE_AGENT_HUB</span>
              <span className="sm:hidden">HUB</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">SHOW_AGENT_HUB</span>
              <span className="sm:hidden">HUB</span>
            </>
          )}
        </button>
        <div ref={menuRef} className="relative overflow-visible flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-label="Open profile menu"
            className="rounded-full transition-transform hover:scale-105 focus:outline-none focus:ring-1 focus:ring-white/30"
          >
            <Avatar name={profile.fullName} imageSrc={profile.avatarDataUrl} size={32} />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                role="menu"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 top-[calc(100%+10px)] w-56 rounded-xl border border-white/10 bg-[#0b0b0d]/95 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden z-[300]"
              >
                <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-white/5">
                  <Avatar name={profile.fullName} imageSrc={profile.avatarDataUrl} size={30} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {profile.fullName || 'Your Profile'}
                    </p>
                    <p className="text-[10.5px] text-white/40 truncate">
                      {profile.university || 'Complete your profile'}
                    </p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-[11px] font-mono uppercase tracking-wider text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <User className="h-3.5 w-3.5" />
                  View Profile
                </Link>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push('/');
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[11px] font-mono uppercase tracking-wider text-white/70 hover:bg-white/5 hover:text-red-300 transition-colors border-t border-white/5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}