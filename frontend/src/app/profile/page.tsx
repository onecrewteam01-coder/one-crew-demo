"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Check } from "lucide-react";
import ContinueButton from "@/components/onboarding/ContinueButton";
import { SelectionChip } from "@/components/onboarding/SelectionChip";
import { Avatar } from "@/components/profile/Avatar";
import ProfileLoading from "./loading";
import {
  emptyProfile,
  getStoredProfile,
  isProfileFullyValid,
  isProfileSetupComplete,
  saveStoredProfile,
  validateProfile,
  type ProfileValidationErrors,
  type UserProfile,
} from "@/lib/profile";

const inputClasses =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[13px] sm:text-sm text-white placeholder-white/20 transition-all duration-300 hover:border-white/25 focus:border-white/30 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed";

const inputErrorClasses = "border-red-500/40 focus:border-red-500/50 focus:ring-red-500/20";

const labelClasses = "block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-[11px] text-red-400/80">{message}</p>;
}

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [touched, setTouched] = useState<Partial<Record<keyof UserProfile, boolean>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [routeStatus, setRouteStatus] = useState<"checking" | "allowed">("checking");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const errors: ProfileValidationErrors = validateProfile(profile);

  // Route protection: this page edits an existing profile, so it
  // requires that profile setup has actually happened first — and we
  // don't render anything until that check resolves, to avoid a flash
  // of an empty form before the real data (or the redirect) lands.
  useEffect(() => {
    let active = true;
    isProfileSetupComplete().then(async (complete) => {
      if (!active) return;
      if (!complete) {
        router.replace("/profile-setup");
        return;
      }
      const stored = await getStoredProfile();
      if (active) {
        setProfile(stored);
        setRouteStatus("allowed");
      }
    });
    return () => {
      active = false;
    };
  }, [router]);

  const patch = (p: Partial<UserProfile>) => setProfile((prev) => ({ ...prev, ...p }));
  const handleBlurField = (field: keyof UserProfile) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Image must be under 3MB.");
      return;
    }

    setUploadError("");
    const reader = new FileReader();
    reader.onload = () => {
      patch({ avatarDataUrl: typeof reader.result === "string" ? reader.result : "" });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!isProfileFullyValid(errors)) {
      setTouched((prev) => ({
        ...prev,
        fullName: true,
        age: true,
        university: true,
        degree: true,
        background: true,
        bio: true,
      }));
      return;
    }
    setIsSaving(true);
    setTimeout(async () => {
      await saveStoredProfile(profile);
      setIsSaving(false);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2200);
    }, 500);
  };

  if (routeStatus !== "allowed") {
    return <ProfileLoading />;
  }

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-[#e5e2e1] selection:bg-white selection:text-black">
      {/* Cinematic overlay, consistent with login/register/onboarding */}
      <div className="absolute inset-0 z-0 pointer-events-none scanline-overlay opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.006] rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Header */}
      <header className="relative z-10 w-full px-6 py-3.5 md:px-10 flex justify-between items-center border-b border-white/5">
        <Link
          href="/"
          className="font-sora text-lg font-semibold tracking-tighter text-white glow-text hover:opacity-90 transition-opacity focus:outline-none"
        >
          OneCrew
        </Link>
        <Link
          href="/dashboard"
          className="font-mono text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors duration-300 flex items-center gap-1.5 group focus:outline-none"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
          Back to Dashboard
        </Link>
      </header>

      {/* Content */}
      <main className="relative z-10 w-full flex justify-center px-5 sm:px-6 py-10 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[640px] glass-panel rounded-2xl border border-white/10 bg-[#0e0e0e]/45 backdrop-blur-2xl p-6 md:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-7"
        >
          <div className="text-center">
            <h1 className="font-sora text-2xl md:text-[28px] font-semibold tracking-tight text-white glow-text">
              Your Profile
            </h1>
            <p className="text-xs text-white/50 mt-1.5">
              View and update the information your co-founding team sees.
            </p>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group focus:outline-none"
              aria-label="Change profile picture"
            >
              <Avatar name={profile.fullName} imageSrc={profile.avatarDataUrl} size={96} />
              <span className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="h-5 w-5 text-white" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <span className="font-mono text-[11px] uppercase tracking-widest text-white/40">
              {profile.avatarDataUrl ? "Change Photo" : "Upload Photo"}
            </span>
            {uploadError && <span className="text-[11px] text-red-400/80">{uploadError}</span>}
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClasses}>Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => patch({ fullName: e.target.value })}
                onBlur={() => handleBlurField("fullName")}
                placeholder="Enter your full name"
                aria-invalid={touched.fullName && !!errors.fullName}
                className={`${inputClasses} ${touched.fullName && errors.fullName ? inputErrorClasses : ""}`}
              />
              {touched.fullName && <FieldError message={errors.fullName} />}
            </div>

            <div>
              <label className={labelClasses}>Age</label>
              <input
                type="number"
                min={13}
                max={100}
                value={profile.age}
                onChange={(e) => patch({ age: e.target.value })}
                onBlur={() => handleBlurField("age")}
                placeholder="e.g. 21"
                aria-invalid={touched.age && !!errors.age}
                className={`${inputClasses} ${touched.age && errors.age ? inputErrorClasses : ""}`}
              />
              {touched.age && <FieldError message={errors.age} />}
            </div>

            <div>
              <label className={labelClasses}>University / College</label>
              <input
                type="text"
                value={profile.university}
                onChange={(e) => patch({ university: e.target.value })}
                onBlur={() => handleBlurField("university")}
                placeholder="e.g. IIT Bombay"
                aria-invalid={touched.university && !!errors.university}
                className={`${inputClasses} ${touched.university && errors.university ? inputErrorClasses : ""}`}
              />
              {touched.university && <FieldError message={errors.university} />}
            </div>

            <div className="sm:col-span-2">
              <label className={labelClasses}>Degree / Branch</label>
              <input
                type="text"
                value={profile.degree}
                onChange={(e) => patch({ degree: e.target.value })}
                onBlur={() => handleBlurField("degree")}
                placeholder="e.g. B.Tech Computer Science"
                aria-invalid={touched.degree && !!errors.degree}
                className={`${inputClasses} ${touched.degree && errors.degree ? inputErrorClasses : ""}`}
              />
              {touched.degree && <FieldError message={errors.degree} />}
            </div>
          </div>

          <div>
            <label className={labelClasses}>Background</label>
            <div className="flex flex-wrap gap-2.5">
              <SelectionChip
                title="Tech Background"
                selected={profile.background === "Tech"}
                onClick={() => {
                  patch({ background: "Tech" });
                  handleBlurField("background");
                }}
              />
              <SelectionChip
                title="Non-Tech Background"
                selected={profile.background === "Non-Tech"}
                onClick={() => {
                  patch({ background: "Non-Tech" });
                  handleBlurField("background");
                }}
              />
            </div>
            {touched.background && <FieldError message={errors.background} />}
          </div>

          <div>
            <label className={labelClasses}>Short Bio</label>
            <textarea
              rows={4}
              value={profile.bio}
              onChange={(e) => patch({ bio: e.target.value })}
              onBlur={() => handleBlurField("bio")}
              placeholder="Tell your future co-founders a little about yourself..."
              maxLength={280}
              aria-invalid={touched.bio && !!errors.bio}
              className={`${inputClasses} ${touched.bio && errors.bio ? inputErrorClasses : ""} leading-relaxed resize-none onboarding-textarea`}
            />
            <div className="mt-1 text-right font-mono text-[10px] text-white/25">
              {profile.bio.length}/280
            </div>
            {touched.bio && <FieldError message={errors.bio} />}
          </div>

          {/* Save */}
          <div className="flex flex-col items-center gap-2">
            <ContinueButton onClick={handleSave} loading={isSaving} label="Save Changes" />
            <AnimatePresence>
              {savedFlash && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-white/60"
                >
                  <Check className="h-3.5 w-3.5" /> Saved
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
