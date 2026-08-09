"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import StepHeader from "@/components/onboarding/StepHeader";
import ContinueButton from "@/components/onboarding/ContinueButton";
import { ProfileSetupBasics } from "@/components/profile/ProfileSetupBasics";
import { ProfileSetupFinishing } from "@/components/profile/ProfileSetupFinishing";
import ProfileSetupLoading from "./loading";
import {
  emptyProfile,
  getStoredProfile,
  isProfileCoreValid,
  isProfileSetupComplete,
  markProfileSetupComplete,
  REQUIRED_PROFILE_FIELDS,
  saveStoredProfile,
  validateProfile,
  type ProfileValidationErrors,
  type UserProfile,
} from "@/lib/profile";

const TOTAL_STEPS = 2;

export default function ProfileSetupPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [touched, setTouched] = useState<Partial<Record<keyof UserProfile, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  const errors: ProfileValidationErrors = validateProfile(profile);

  // First-run gate: skip straight to the dashboard if this browser has
  // already been through profile setup once.
  useEffect(() => {
    let active = true;
    (async () => {
      if (await isProfileSetupComplete()) {
        router.replace("/dashboard");
        return;
      }
      const stored = await getStoredProfile();
      if (active) {
        setProfile(stored);
        setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  const patchProfile = (patch: Partial<UserProfile>) =>
    setProfile((prev) => ({ ...prev, ...patch }));

  const handleBlurField = (field: keyof UserProfile) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const markStepOneTouched = () =>
    setTouched((prev) => ({
      ...prev,
      ...Object.fromEntries(REQUIRED_PROFILE_FIELDS.map((f) => [f, true])),
      degree: true,
    }));

  const finishSetup = async () => {
    await saveStoredProfile(profile);
    await markProfileSetupComplete();
    router.push("/dashboard");
  };

  const handleContinue = () => {
    if (stepIndex === 0 && !isProfileCoreValid(errors)) {
      markStepOneTouched();
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (stepIndex === 0) {
        setStepIndex(1);
      } else {
        finishSetup();
      }
    }, 500);
  };

  const handleSkipOptional = () => {
    if (isSubmitting) return;
    finishSetup();
  };

  const handleBack = stepIndex > 0 ? () => setStepIndex(0) : undefined;

  if (!ready) {
    return <ProfileSetupLoading />;
  }

  const meta =
    stepIndex === 0
      ? {
          title: "Tell Us About You",
          subtitle: "A few basics to personalize your OneCrew workspace.",
        }
      : {
          title: "Finishing Touches",
          subtitle: "Add a photo and a short bio — both totally optional.",
        };

  return (
    <OnboardingLayout onBack={handleBack}>
      <div className="flex flex-col gap-[clamp(0.5rem,1.5vh,1rem)] pt-5 md:pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`header-${stepIndex}`}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <StepHeader
              currentStep={stepIndex + 1}
              totalSteps={TOTAL_STEPS}
              title={meta.title}
              subtitle={meta.subtitle}
            />
          </motion.div>
        </AnimatePresence>

        {/* Simple two-segment progress bar */}
        <div className="flex items-center gap-2 max-w-[220px] mx-auto w-full">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
                i <= stepIndex ? "bg-white/70" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`form-${stepIndex}`}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {stepIndex === 0 ? (
              <ProfileSetupBasics
                profile={profile}
                onChange={patchProfile}
                disabled={isSubmitting}
                errors={errors}
                touched={touched}
                onBlurField={handleBlurField}
              />
            ) : (
              <ProfileSetupFinishing profile={profile} onChange={patchProfile} disabled={isSubmitting} />
            )}
          </motion.div>
        </AnimatePresence>

        <ContinueButton
          onClick={handleContinue}
          disabled={isSubmitting}
          loading={isSubmitting}
          label={stepIndex === 0 ? "Continue" : "Finish Setup"}
        />

        {stepIndex === 1 && (
          <button
            type="button"
            onClick={handleSkipOptional}
            disabled={isSubmitting}
            className="mx-auto font-mono text-xs uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Skip for now
          </button>
        )}
      </div>
    </OnboardingLayout>
  );
}
