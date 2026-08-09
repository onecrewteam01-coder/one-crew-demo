"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

/* Floating ambient particles inside the login panel context */
function AmbientParticles() {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      left: string;
      top: string;
      size: number;
      delay: number;
      duration: number;
    }>
  >([]);

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
        })),
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

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleConnecting, setIsGoogleConnecting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleGoogleClick = async () => {
    setIsGoogleConnecting(true);
    try {
      window.location.href = "http://localhost:5000/api/auth/google";
    } catch (err) {
      console.error("Google Auth initiation failed:", err);
      setIsGoogleConnecting(false);
    }
  };

  const isLoading = isSubmitting || isGoogleConnecting;

  const handleRegister = async () => {
    if (
      !form.fullName ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      alert("Please fill in all fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    let onboardingData = null;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("onboardingData");
        if (stored) {
          onboardingData = JSON.parse(stored);
        }
      } catch (err) {
        console.error("Failed to parse onboardingData from localStorage:", err);
      }
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          onboardingData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("onboardingData");
          localStorage.removeItem("onboarding_startupIdea");
        }
        alert("Registration successful!");
        router.push("/dashboard");
      } else {
        alert(data.error || "Registration failed.");
      }
    } catch (err) {
      console.error("Connection error to Express server:", err);
      alert("Could not reach the registration backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[420px] z-10 mx-auto px-4"
    >
      {/* Background glow behind card */}
      <div className="absolute -inset-1 rounded-3xl bg-white/[0.02] blur-2xl pointer-events-none" />

      {/* Main Glass Panel */}
      <div className="relative glass-panel rounded-2xl border border-white/10 bg-[#0e0e0e]/45 backdrop-blur-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col gap-5 select-none">
        {/* Particle Overlay */}
        <AmbientParticles />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
          className="relative z-10 flex flex-col gap-2.5"
        >
          <div className="relative z-10 flex flex-col items-center text-center gap-2">
            <h1 className="text-xl md:text-2xl font-light text-white tracking-tight">
              Create your account
            </h1>

            <p className="text-xs text-white/50 mt-1">
              Join OneCrew and build with your AI-powered founding team.
            </p>
          </div>



          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60">
              Full Name
            </label>

            <input
              type="text"
              required
              name="fullName"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/20 transition-all duration-300 focus:border-white/30 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60">
              Email
            </label>

            <input
              type="email"
              required
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/20 transition-all duration-300 focus:border-white/30 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/20 transition-all duration-300 focus:border-white/30 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20"
              />

              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                name="confirmPassword"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/20 transition-all duration-300 focus:border-white/30 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20"
              />

              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <div className="flex justify-center">
            <motion.button
              whileHover={isLoading ? {} : { scale: 1.01 }}
              whileTap={isLoading ? {} : { scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-mono text-xs font-semibold uppercase tracking-widest py-3 rounded-xl hover:bg-white/95 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full border border-black border-t-transparent animate-spin"></span>
                  CREATING ACCOUNT...
                </span>
              ) : (
                "Create Account"
              )}
            </motion.button>
          </div>

          {/* Login */}
          <div className="relative z-10 text-center text-xs text-white/50 border-t border-white/5 pt-4 mt-1 font-mono">
            <p>
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-white hover:text-white hover:underline font-medium transition-colors font-sans"
              >
                Log In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
