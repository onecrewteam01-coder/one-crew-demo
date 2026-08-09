"use client";

import React from "react";
import { getInitials } from "@/lib/profile";

interface AvatarProps {
  name: string;
  imageSrc?: string;
  /** Pixel size of the circle. Defaults to 36 (dashboard header scale). */
  size?: number;
  className?: string;
}

/**
 * Single source of truth for the circular profile avatar — used in the
 * dashboard header, the profile page, and the profile-setup flow. Shows
 * the uploaded image when present, otherwise falls back to initials on a
 * subtle glass background (matches SelectionCard's icon-tile styling).
 */
export function Avatar({ name, imageSrc, size = 36, className = "" }: AvatarProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-full border border-white/15 bg-white/[0.06] overflow-hidden flex items-center justify-center ${className}`}
    >
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={name ? `${name}'s profile picture` : "Profile picture"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          style={{ fontSize: Math.max(10, size * 0.36) }}
          className="font-mono font-semibold uppercase tracking-wider text-white/75 select-none"
        >
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}
