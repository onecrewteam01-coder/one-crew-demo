"use client";

import React from "react";
import { motion } from "framer-motion";
import { SelectionChip } from "@/components/onboarding/SelectionChip";
import type { ProfileValidationErrors, UserProfile } from "@/lib/profile";

interface ProfileSetupBasicsProps {
  profile: UserProfile;
  onChange: (patch: Partial<UserProfile>) => void;
  disabled?: boolean;
  errors: ProfileValidationErrors;
  touched: Partial<Record<keyof UserProfile, boolean>>;
  onBlurField: (field: keyof UserProfile) => void;
}

const inputClasses =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[13px] sm:text-sm text-white placeholder-white/20 transition-all duration-300 hover:border-white/25 focus:border-white/30 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed";

const inputErrorClasses = "border-red-500/40 focus:border-red-500/50 focus:ring-red-500/20";

const labelClasses = "block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-[11px] text-red-400/80">{message}</p>;
}

export function ProfileSetupBasics({
  profile,
  onChange,
  disabled,
  errors,
  touched,
  onBlurField,
}: ProfileSetupBasicsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[560px] mx-auto flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClasses}>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={profile.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            onBlur={() => onBlurField("fullName")}
            disabled={disabled}
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
            placeholder="e.g. 21"
            value={profile.age}
            onChange={(e) => onChange({ age: e.target.value })}
            onBlur={() => onBlurField("age")}
            disabled={disabled}
            aria-invalid={touched.age && !!errors.age}
            className={`${inputClasses} ${touched.age && errors.age ? inputErrorClasses : ""}`}
          />
          {touched.age && <FieldError message={errors.age} />}
        </div>

        <div>
          <label className={labelClasses}>University / College</label>
          <input
            type="text"
            placeholder="e.g. IIT Bombay"
            value={profile.university}
            onChange={(e) => onChange({ university: e.target.value })}
            onBlur={() => onBlurField("university")}
            disabled={disabled}
            aria-invalid={touched.university && !!errors.university}
            className={`${inputClasses} ${touched.university && errors.university ? inputErrorClasses : ""}`}
          />
          {touched.university && <FieldError message={errors.university} />}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClasses}>Degree / Branch (if applicable)</label>
          <input
            type="text"
            placeholder="e.g. B.Tech Computer Science"
            value={profile.degree}
            onChange={(e) => onChange({ degree: e.target.value })}
            onBlur={() => onBlurField("degree")}
            disabled={disabled}
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
            disabled={disabled}
            onClick={() => {
              onChange({ background: "Tech" });
              onBlurField("background");
            }}
          />
          <SelectionChip
            title="Non-Tech Background"
            selected={profile.background === "Non-Tech"}
            disabled={disabled}
            onClick={() => {
              onChange({ background: "Non-Tech" });
              onBlurField("background");
            }}
          />
        </div>
        {touched.background && <FieldError message={errors.background} />}
      </div>
    </motion.div>
  );
}
