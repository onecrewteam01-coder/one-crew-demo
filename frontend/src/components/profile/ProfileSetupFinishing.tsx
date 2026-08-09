"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { Avatar } from "@/components/profile/Avatar";
import type { UserProfile } from "@/lib/profile";

interface ProfileSetupFinishingProps {
  profile: UserProfile;
  onChange: (patch: Partial<UserProfile>) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

export function ProfileSetupFinishing({ profile, onChange, disabled }: ProfileSetupFinishingProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");

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
      onChange({ avatarDataUrl: typeof reader.result === "string" ? reader.result : "" });
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[560px] mx-auto flex flex-col gap-6"
    >
      {/* Avatar upload */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="relative group focus:outline-none disabled:cursor-not-allowed"
          aria-label="Upload profile picture"
        >
          <Avatar name={profile.fullName} imageSrc={profile.avatarDataUrl} size={84} />
          <span className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="h-5 w-5 text-white" />
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />
        <span className="font-mono text-[11px] uppercase tracking-widest text-white/40">
          {profile.avatarDataUrl ? "Change Photo" : "Upload Photo (Optional)"}
        </span>
        {uploadError && (
          <span className="text-[11px] text-red-400/80">{uploadError}</span>
        )}
        {!profile.avatarDataUrl && (
          <span className="text-[11px] text-white/30 text-center max-w-xs">
            No photo? We&apos;ll use your initials instead.
          </span>
        )}
      </div>

      {/* Bio */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
          Short Bio (Optional)
        </label>
        <textarea
          rows={4}
          placeholder="Tell your future co-founders a little about yourself..."
          value={profile.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          disabled={disabled}
          maxLength={280}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[13px] sm:text-sm text-white placeholder-white/20 leading-relaxed transition-all duration-300 hover:border-white/25 focus:border-white/30 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed resize-none onboarding-textarea"
        />
        <div className="mt-1 text-right font-mono text-[10px] text-white/25">
          {profile.bio.length}/280
        </div>
      </div>
    </motion.div>
  );
}
