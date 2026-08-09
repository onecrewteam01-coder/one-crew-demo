// User Profile — shared types + persistence helpers
// ────────────────────────────────────────────────────────────────────────
// This is the ONLY file in the app allowed to touch `localStorage` for
// profile data. Every screen (profile-setup, profile page, dashboard
// header) calls these functions instead of reading/writing storage
// directly, and only ever imports the `UserProfile` type from here.
//
// The four I/O functions are `async` (Promise-returning) even though
// localStorage itself is synchronous. That's intentional: it means the
// call sites already `await` these calls, so migrating to a real
// `/api/profile` backend later is a change to the *bodies* of the
// functions below only — no consumer needs to change its shape.

export type TechBackground = "Tech" | "Non-Tech" | "";

export interface UserProfile {
  fullName: string;
  age: string;
  university: string;
  degree: string;
  background: TechBackground;
  bio: string;
  /** Base64 data URL of the uploaded image, or "" to fall back to initials. */
  avatarDataUrl: string;
}

export const emptyProfile: UserProfile = {
  fullName: "",
  age: "",
  university: "",
  degree: "",
  background: "",
  bio: "",
  avatarDataUrl: "",
};

const PROFILE_KEY = "onecrew_profile";
const PROFILE_SETUP_COMPLETE_KEY = "onecrew_profile_setup_complete";

export async function getStoredProfile(): Promise<UserProfile> {
  // ── Swap point: replace body with e.g. `return (await fetch("/api/profile")).json();`
  if (typeof window === "undefined") return emptyProfile;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return emptyProfile;
    return { ...emptyProfile, ...JSON.parse(raw) };
  } catch {
    return emptyProfile;
  }
}

export async function saveStoredProfile(profile: UserProfile): Promise<void> {
  // ── Swap point: replace body with e.g. `await fetch("/api/profile", { method: "PUT", body: ... })`
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function isProfileSetupComplete(): Promise<boolean> {
  // ── Swap point: replace body with e.g. `return (await fetch("/api/profile/status")).json();`
  if (typeof window === "undefined") return true; // avoid SSR false-redirects
  return localStorage.getItem(PROFILE_SETUP_COMPLETE_KEY) === "true";
}

export async function markProfileSetupComplete(): Promise<void> {
  // ── Swap point: replace body with e.g. `await fetch("/api/profile/complete", { method: "POST" })`
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_SETUP_COMPLETE_KEY, "true");
}

/** First letter of the first two words, e.g. "Aditi Rao" -> "AR". */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Validation ──────────────────────────────────────────────────────────
// One canonical rule set, used by both the profile-setup wizard (step 1)
// and the profile edit page, so the two surfaces can never drift apart.

export type ProfileValidationErrors = Partial<Record<keyof UserProfile, string>>;

export function validateProfile(profile: UserProfile): ProfileValidationErrors {
  const errors: ProfileValidationErrors = {};

  const name = profile.fullName.trim();
  if (!name) {
    errors.fullName = "Full name is required.";
  } else if (name.length < 2) {
    errors.fullName = "Full name looks too short.";
  } else if (name.length > 60) {
    errors.fullName = "Keep it under 60 characters.";
  }

  const ageValue = profile.age.trim();
  const ageNum = Number(ageValue);
  if (!ageValue) {
    errors.age = "Age is required.";
  } else if (!Number.isInteger(ageNum) || !Number.isFinite(ageNum)) {
    errors.age = "Enter a valid whole number.";
  } else if (ageNum < 13 || ageNum > 100) {
    errors.age = "Age must be between 13 and 100.";
  }

  const university = profile.university.trim();
  if (!university) {
    errors.university = "University / College is required.";
  } else if (university.length > 120) {
    errors.university = "Keep it under 120 characters.";
  }

  if (profile.degree.trim().length > 120) {
    errors.degree = "Keep it under 120 characters.";
  }

  if (!profile.background) {
    errors.background = "Select a background.";
  }

  if (profile.bio.length > 280) {
    errors.bio = "Bio must be 280 characters or fewer.";
  }

  return errors;
}

/** Fields required for step 1 of setup / mandatory on the edit page. */
export const REQUIRED_PROFILE_FIELDS: (keyof UserProfile)[] = [
  "fullName",
  "age",
  "university",
  "background",
];

export function isProfileCoreValid(errors: ProfileValidationErrors): boolean {
  return REQUIRED_PROFILE_FIELDS.every((field) => !errors[field]) && !errors.degree;
}

export function isProfileFullyValid(errors: ProfileValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}