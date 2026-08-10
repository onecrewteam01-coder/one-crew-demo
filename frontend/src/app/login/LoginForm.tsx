"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

/* Floating ambient particles inside the login panel context */
function AmbientParticles() {
  const [particles, setParticles] = useState<Array<{
    id: number; left: string; top: string; size: number; delay: number; duration: number;
  }>>([]);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setParticles(
        Array.from({ length: 15 }, (_, i) => ({
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          size: 1 + Math.random() * 1.5,
          delay: Math.random() * 5,
          duration: 5 + Math.random() * 4,
        }))
      );
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: 0,
            animation: `particleDrift ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleConnecting, setIsGoogleConnecting] = useState(false);



  // 1. Update the Email/Password submission function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/dashboard");
      } else {
        alert(data.msg || "Authentication failed.");
      }
    } catch (err) {
      console.error("Connection error to Express server:", err);
      alert("Could not reach the authentication backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Update the Google Auth click function
  const handleGoogleClick = async () => {
    setIsGoogleConnecting(true);

    try {
      // Point this directly to the Express Google Auth initiation endpoint you tested earlier
      window.location.href = `${API_URL}/api/auth/google`;
    } catch (err) {
      console.error("Google Auth initiation failed:", err);
      setIsGoogleConnecting(false);
    }
  };
  const isLoading = isSubmitting || isGoogleConnecting;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[420px] z-10 mx-auto px-4 group"
    >
      {/* Multi-layered dynamic background glows that animate on mount and hover */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-white/3 via-white/1 to-white/0 blur-3xl pointer-events-none z-0 transition-all duration-500 group-hover:opacity-30 group-hover:scale-105"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ delay: 0.2, duration: 1.2, ease: "easeOut" }}
        className="absolute -inset-1 rounded-3xl bg-white/[0.02] blur-2xl pointer-events-none z-0 transition-all duration-500 group-hover:bg-white/[0.04] group-hover:scale-105"
      />

      {/* Main Glass Panel */}
      <div className="relative glass-panel rounded-2xl border border-white/10 bg-[#0e0e0e]/45 backdrop-blur-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col gap-5 transition-all duration-500 hover:border-white/20">

        {/* Particle Overlay */}
        <AmbientParticles />

        {/* Top Header Section */}
        <div className="relative z-10 flex flex-col items-center text-center gap-2.5">
          <div className="mt-1">
            <h1 className="font-sora text-xl md:text-2xl font-semibold tracking-tight text-white glow-text">
              Welcome Back
            </h1>
            <p className="text-xs text-white/50 font-light mt-1.5 max-w-[280px] leading-relaxed font-sans">
              Sign in to access your AI-powered co-founding team.
            </p>
          </div>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-4 font-sans">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60">
              Email Address
            </label>
            <input
              type="email"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[13px] sm:text-sm text-white placeholder-white/20 transition-all duration-300 hover:border-white/25 focus:border-white/30 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 focus:shadow-[0_0_15px_rgba(255,255,255,0.03)] font-sans disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 pr-10 text-[13px] sm:text-sm text-white placeholder-white/20 transition-all duration-300 hover:border-white/25 focus:border-white/30 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 focus:shadow-[0_0_15px_rgba(255,255,255,0.03)] font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer focus:outline-none disabled:cursor-not-allowed"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex justify-between items-center text-[11px] font-mono mt-1">
            <label className="flex items-center gap-2 cursor-pointer text-white/50 hover:text-white/80 transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                disabled={isLoading}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20 bg-white/5 text-white focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
              />
              <span>Remember me</span>
            </label>
            <Link
              href="#"
              className="text-white/50 hover:text-white transition-colors hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={isLoading ? {} : { scale: 1.01 }}
            whileTap={isLoading ? {} : { scale: 0.99 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-mono text-xs font-semibold uppercase tracking-widest py-3 rounded-xl hover:bg-white/95 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 cursor-pointer mt-2 disabled:opacity-55 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border border-black border-t-transparent animate-spin"></span>
                SIGNING IN...
              </span>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center z-10 py-1">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-3 text-[9px] font-mono uppercase tracking-wider text-white/30">
            Or continue with
          </span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        {/* Social Authentication (Only Google, as requested) */}
        <div className="relative z-10 flex flex-col gap-3">
          <motion.button
            whileHover={isLoading ? {} : { scale: 1.01 }}
            whileTap={isLoading ? {} : { scale: 0.99 }}
            id="google-login-btn"
            type="button"
            disabled={isLoading}
            onClick={handleGoogleClick}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs text-white/80 hover:bg-white/10 hover:border-white/20 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.03)] transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
          >
            {isGoogleConnecting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border border-white border-t-transparent animate-spin"></span>
                CONNECTING...
              </span>
            ) : (
              <>
                <svg
                  className="w-4 h-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="font-mono uppercase tracking-wider text-[11px]">Continue with Google</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Footer Navigation */}
        <div className="relative z-10 text-center text-xs text-white/50 border-t border-white/5 pt-4 mt-1 font-mono">
          Don&apos;t have an account?{" "}
          <Link
            href="/Register"
            className="text-white hover:text-white hover:underline font-medium transition-colors font-sans"
          >
            Create Account
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
