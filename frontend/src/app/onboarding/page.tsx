"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import StepHeader from "@/components/onboarding/StepHeader";
import MoonProgressIndicator, {
  charCountToProgress,
} from "@/components/onboarding/ProgressIndicator";
import ContinueButton from "@/components/onboarding/ContinueButton";
import { Step2Form } from "@/components/onboarding/Step2CompetitiveAdvantage";
import { Step3Form } from "@/components/onboarding/Step3MVPPlanning";
import { Step4NameChoice } from "@/components/onboarding/Step4NameChoice";
import { Step4IdentityDetails } from "@/components/onboarding/Step4IdentityDetails";
import { Step4GeneratedNames } from "@/components/onboarding/Step4GeneratedNames";
import { Step5ProductTypes } from "@/components/onboarding/Step5ProductTypes";
import { Step5TargetConsumers } from "@/components/onboarding/Step5TargetConsumers";
import { Step5StartupStage } from "@/components/onboarding/Step5StartupStage";
import { Step6TechStack } from "@/components/onboarding/Step6TechStack";
import { Step6AIPreferences } from "@/components/onboarding/Step6AIPreferences";
import { Step6Authentication } from "@/components/onboarding/Step6Authentication";
import { Step6Database } from "@/components/onboarding/Step6Database";
import { Step7Form } from "@/components/onboarding/Step7Business";
import { Step8Form } from "@/components/onboarding/Step8AdditionalInformation";

// ── Step IDs (stable, not index-based) ────────────────────────────────────────
type StepId =
  | "advantage"
  | "mvp"
  | "nameChoice"
  | "identityDetails"
  | "generatedNames"
  | "productType"
  | "targetConsumers"
  | "startupStage"
  | "techStack"
  | "aiPreference"
  | "authentication"
  | "database"
  | "business"
  | "additional";

interface StepMeta {
  title: string;
  subtitle: string;
}

const STEP_META: Record<StepId, StepMeta> = {
  advantage: {
    title: "Competitive Advantage",
    subtitle: "What makes your startup different from existing alternatives?",
  },
  mvp: {
    title: "MVP Planning",
    subtitle: "Describe the smallest version of your product that delivers real value.",
  },
  nameChoice: {
    title: "Startup Identity",
    subtitle: "Let's create a memorable identity for your startup.",
  },
  identityDetails: {
    title: "Brand Identity",
    subtitle: "Shape the personality and visual direction of your startup.",
  },
  generatedNames: {
  title: "Choose Your Startup Name",
  subtitle:
    "Select one of the AI-generated startup names or generate a new set.",
},
  productType: {
    title: "Product Configuration",
    subtitle: "Tell us what kind of product you're building.",
  },
  targetConsumers: {
    title: "Target Customers",
    subtitle: "Help us understand who your product is for.",
  },
  startupStage: {
    title: "Startup Stage",
    subtitle: "Tell us how far along your startup is.",
  },
  techStack: {
    title: "Technical Preferences",
    subtitle: "Choose all the technologies you'd like to use.",
  },
  aiPreference: {
    title: "AI Features",
    subtitle: "Tell us whether AI is part of your product.",
  },
  authentication: {
    title: "Authentication",
    subtitle: "Select every authentication method your product will support",
  },
  database: {
    title: "Database",
    subtitle: "Choose your preferred database.",
  },
  business: {
    title: "Business Revenue Model",
    subtitle: "Tell us how your startup plans to generate revenue.",
  },
  additional: {
    title: "Additional Information",
    subtitle: "Share any additional details that will help us understand your startup (optional).",
  },
};

export default function OnboardingPage() {
  const router = useRouter();

  // ── Step state ──────────────────────────────────────────────────────────────
  const [stepIndex, setStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  // ── Step 1 — Competitive Advantage ─────────────────────────────────────────
  const [step2Advantage, setStep2Advantage] = useState("");

  // ── Step 2 — MVP Planning ───────────────────────────────────────────────────
  const [step3Mvp, setStep3Mvp] = useState("");
  const [step3Future, setStep3Future] = useState("");

  // ── Step 3 — Name Choice ────────────────────────────────────────────────────
  const [step4NameMode, setStep4NameMode] = useState<"exist" | "generate">("exist");
  const [step4Name, setStep4Name] = useState("");

  // ── Step 3b — Identity Details (only when nameMode === "exist") ────────────
  const [step4Personalities, setStep4Personalities] = useState<string[]>([]);
  const [step4PersonalityOther, setStep4PersonalityOther] = useState("");
  const [step4Colors, setStep4Colors] = useState<string[]>([]);
  const [step4ColorOther, setStep4ColorOther] = useState("");
  const [step4Brands, setStep4Brands] = useState("");
  const [step4Words, setStep4Words] = useState("");

  // ── Step 3c — Generated Names ─────────────────────────────────────────────
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [selectedGeneratedName, setSelectedGeneratedName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Step 4 Product Type ───────────────────────────────────────────────────
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [productTypeOther, setProductTypeOther] = useState("");

  // ── Step 4b Target Consumers ───────────────────────────────────────────────────
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerOther, setCustomerOther] = useState("");

  // ── Step 4c Startup Stage ───────────────────────────────────────────────────
  const [startupStage, setStartupStage] = useState("");

  // ── Step 5 Tech Stack ──────────────────────────────────────────────────
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [stackOther, setStackOther] = useState("");

  // ── Step 5b AI Preference ──────────────────────────────────────────────────
  const [aiPreference, setAiPreference] = useState("");

  // ── Step 5c Authentication ──────────────────────────────────────────────────
  const [selectedAuth, setSelectedAuth] = useState<string[]>([]);
  const [authOther, setAuthOther] = useState("");

  // ── Step 5d Database ──────────────────────────────────────────────────
  const [selectedDatabase, setSelectedDatabase] = useState("");
  const [databaseOther, setDatabaseOther] = useState("");

  // ── Business Revenue ───────────────────────────────────────────────────────
  const [selectedRevenueModels, setSelectedRevenueModels] = useState<string[]>([]);
  const [revenueOther, setRevenueOther] = useState("");

  // ── Additional Information ─────────────────────────────────────────────────
  const [additionalInformation, setAdditionalInformation] = useState("");

  // ── Dynamic step list based on nameMode ────────────────────────────────────
  const getSteps = useCallback((): StepId[] => {
    const base: StepId[] = ["advantage", "mvp", "nameChoice", "identityDetails"];
      if (step4NameMode === "generate") {
        base.push("generatedNames");
      }
    base.push( "productType", "targetConsumers", "startupStage", "techStack", "aiPreference", "authentication", "database", "business", "additional");
    return base;
  }, [step4NameMode]);

  const steps = getSteps();
  const currentStepId = steps[stepIndex];

  // ── Display step: nameChoice + identityDetails both count as step 3 ─────────
  const DISPLAY_MAP: Record<StepId, number> = {
    advantage: 1,
    mvp: 2,
    nameChoice: 3,
    identityDetails: 3,
    generatedNames: 3,
    productType: 4,
    targetConsumers: 4,
    startupStage: 4,
    techStack: 5,
    aiPreference: 5,
    authentication: 5,
    database: 5,
    business: 6,
    additional: 7,
  };
  const TOTAL_DISPLAY_STEPS = 7;
  const displayStep = DISPLAY_MAP[currentStepId];

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex]);

  

  // ── Chip controllers ────────────────────────────────────────────────────────
  const handleTogglePersonality = useCallback((trait: string) => {
    setStep4Personalities((prev) =>
      prev.includes(trait)
        ? prev.filter((t) => t !== trait)
        : prev.length < 3
          ? [...prev, trait]
          : prev,
    );
  }, []);

  const handleToggleColor = useCallback((color: string) => {
    setStep4Colors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  }, []);

 const handleRegenerateNames = useCallback(async () => {
  setIsGenerating(true);
  // Simulate waiting for an API
  await new Promise((resolve) => setTimeout(resolve, 2000));
    // TODO: Replace with backend API response
  setGeneratedNames([
    "NovaFlow",
    "LumixAI",
    "Nexora",
    "SparkForge",
    "CloudMint",
  ]);
  setSelectedGeneratedName("");
  setIsGenerating(false);
}, []);

  const toggleProductType = (value: string) => {
    setSelectedProductTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const toggleCustomer = (value: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const toggleStack = (value: string) => {
    setSelectedStacks((prev) => {
      if (value === "Let OneCrew Decide") {
        return prev.includes(value) ? [] : [value];
      }
      const filtered = prev.filter((item) => item !== "Let OneCrew Decide");
      return filtered.includes(value)
        ? filtered.filter((item) => item !== value)
        : [...filtered, value];
    });
  };

  const toggleAuth = (value: string) => {
    setSelectedAuth((prev) => {
      if (value === "Not Required") {
        return prev.includes(value) ? [] : ["Not Required"];
      }
      const updated = prev.filter((item) => item !== "Not Required");
      if (updated.includes(value)) {
        return updated.filter((item) => item !== value);
      }
      return [...updated, value];
    });
  };

  const toggleRevenueModel = (value: string) => {
    setSelectedRevenueModels((prev) => {
      if (value === "Not Sure") {
        return prev.includes(value) ? [] : ["Not Sure"];
      }
      const filtered = prev.filter((item) => item !== "Not Sure");
      return filtered.includes(value)
        ? filtered.filter((item) => item !== value)
        : [...filtered, value];
    });
  };

  // ── Moon-phase progress (0–1) ───────────────────────────────────────────────
  const getStepProgress = (): number => {
    switch (currentStepId) {
      case "advantage":
        return charCountToProgress(step2Advantage.length, 60);
      case "mvp":
        return charCountToProgress(step3Mvp.length, 60);
      case "nameChoice": {
        // First half of the shared step-3 moon (0 → 0.5), fills smoothly
        if (step4NameMode === "generate") return 0.5; // instantly half-full
        // For "exist": fill proportionally up to 0.5 as name is typed (15 chars = full half)
        const nameProgress = Math.min(1, step4Name.trim().length / 15);
        return nameProgress * 0.5;
      }
      case "identityDetails": {
        // Second half of the shared step-3 moon (0.5 → 1)
        const personalityProgress = Math.min(1, step4Personalities.length / 3);
        const colorDone = step4Colors.length > 0 ? 1 : 0;
         const progress = personalityProgress * 0.7 + colorDone * 0.3;
          if (step4NameMode === "generate") {
            // Ends at 75%
            return 0.5 + progress * 0.25;
          }

          // Ends at 100%
          return 0.5 + progress * 0.5;
      }
      case "generatedNames":
        return selectedGeneratedName ? 1 : 0.75;
      case "productType": {
        const productDone =
          selectedProductTypes.length > 0 &&
          (!selectedProductTypes.includes("Other") ||
            productTypeOther.trim().length > 0);

        return productDone ? 1/3 : 0;
      }
      case "targetConsumers": {
        const customerDone =
          selectedCustomers.length > 0 &&
          (!selectedCustomers.includes("Other") ||
            customerOther.trim().length > 0);

        return customerDone ? 2/3 : 1/3;
      }
      case "startupStage": {
        return startupStage ? 1 : 2/3;
      }
      case "techStack": {
        const done =
          selectedStacks.length > 0 &&
          (!selectedStacks.includes("Other") ||
            stackOther.trim().length > 0);

        return done ? 0.25 : 0;
      }

      case "aiPreference": {
        return aiPreference ? 0.5 : 0.25;
      }

      case "authentication": {
        const done =
          selectedAuth.length > 0 &&
          (!selectedAuth.includes("Other") ||
            authOther.trim().length > 0);

        return done ? 0.75 : 0.5;
      }

      case "database": {
        const done =
          selectedDatabase &&
          (selectedDatabase !== "Other" ||
            databaseOther.trim().length > 0);

        return done ? 1 : 0.75;
      }
      case "business": {
        if (selectedRevenueModels.length > 0 && (!selectedRevenueModels.includes("Other") || revenueOther.trim().length > 0)) return 1;
        return 0;
      }
      case "additional":
        return 1;
      default:
        return 0;
    }
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const checkCanContinue = (): boolean => {
    switch (currentStepId) {
      case "advantage":
        return step2Advantage.trim().length > 0;
      case "mvp":
        return step3Mvp.trim().length > 0;
      case "nameChoice":
        if (step4NameMode === "exist") return step4Name.trim().length > 0;
        return true; // generate always valid
      case "identityDetails":
        return step4Personalities.length > 0;
      case "generatedNames":
        return selectedGeneratedName.length > 0;
      case "productType":
        return (
          selectedProductTypes.length > 0 &&
          (!selectedProductTypes.includes("Other") ||
            productTypeOther.trim().length > 0)
        );

      case "targetConsumers":
        return (
          selectedCustomers.length > 0 &&
          (!selectedCustomers.includes("Other") ||
            customerOther.trim().length > 0)
        );

      case "startupStage":
        return startupStage.length > 0;

      case "techStack":
        return (
          selectedStacks.length > 0 &&
          (!selectedStacks.includes("Other") ||
            stackOther.trim().length > 0)
        );

      case "aiPreference":
        return aiPreference.length > 0;

      case "authentication":
        return (
          selectedAuth.length > 0 &&
          (!selectedAuth.includes("Other") ||
            authOther.trim().length > 0)
        );

      case "database":
        return (
          !!selectedDatabase &&
          (selectedDatabase !== "Other" ||
            databaseOther.trim().length > 0)
        );
      case "business":
        return selectedRevenueModels.length > 0 && (!selectedRevenueModels.includes("Other") || revenueOther.trim().length > 0);
      case "additional":
        return true;
      default:
        return false;
    }
  };

  // ── Continue handler ────────────────────────────────────────────────────────
  const handleContinue = () => {
    if (!checkCanContinue()) return;
    setIsPulsing(true);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsPulsing(false);
      setIsSubmitting(false);

      // Recompute steps at the moment of navigation (nameMode may have just changed)
      const currentSteps = getSteps();
      const nextIndex = stepIndex + 1;

      if (nextIndex < currentSteps.length) {
        const nextStep = currentSteps[nextIndex]; 
        if (
          nextStep === "generatedNames" &&
          generatedNames.length === 0
        ) {
          handleRegenerateNames();
        }
        setStepIndex(nextIndex);
      } else {
        if (typeof window !== "undefined") {
          const onboardingData = {
            startupName: step4NameMode === "exist" ? step4Name : selectedGeneratedName,
            startupIdea: localStorage.getItem("onboarding_startupIdea") || "",
            competitiveAdvantage: step2Advantage,
            mvpDescription: step3Mvp,
            futureFeatures: step3Future,
            nameMode: step4NameMode,
            customStartupName: step4Name,
            generatedStartupName: selectedGeneratedName,
            generatedNames: generatedNames,
            brandPersonalities: step4Personalities,
            brandPersonalityOther: step4PersonalityOther,
            brandColors: step4Colors,
            brandColorOther: step4ColorOther,
            admiredBrands: step4Brands,
            associatedWords: step4Words,
            productTypes: selectedProductTypes,
            productTypeOther: productTypeOther,
            targetAudience: selectedCustomers,
            targetAudienceOther: customerOther,
            startupStage: startupStage,
            techStacks: selectedStacks,
            techStackOther: stackOther,
            aiPreference: aiPreference,
            authMethods: selectedAuth,
            authMethodOther: authOther,
            preferredDatabase: selectedDatabase,
            databaseOther: databaseOther,
            revenueModels: selectedRevenueModels,
            revenueModelOther: revenueOther,
            additionalInfo: additionalInformation
          };
          localStorage.setItem("onboardingData", JSON.stringify(onboardingData));
        }
        router.push("/Register");
      }
    }, 1950);
  };

  const handleBack =
    stepIndex > 0
      ? () => setStepIndex((i) => i - 1)
      : undefined;

  // ── Form renderer ───────────────────────────────────────────────────────────
  const renderForm = () => {
    switch (currentStepId) {
      case "advantage":
        return (
          <Step2Form
            value={step2Advantage}
            onChange={setStep2Advantage}
            disabled={isSubmitting}
          />
        );
      case "mvp":
        return (
          <Step3Form
            mvpValue={step3Mvp}
            onMvpChange={setStep3Mvp}
            futureValue={step3Future}
            onFutureChange={setStep3Future}
            disabled={isSubmitting}
          />
        );
      case "nameChoice":
        return (
          <Step4NameChoice
            nameMode={step4NameMode}
            onNameModeChange={setStep4NameMode}
            startupName={step4Name}
            onStartupNameChange={setStep4Name}
            disabled={isSubmitting}
          />
        );
      case "identityDetails":
        return (
          <Step4IdentityDetails
            selectedPersonalities={step4Personalities}
            onTogglePersonality={handleTogglePersonality}
            personalityOther={step4PersonalityOther}
            onPersonalityOtherChange={setStep4PersonalityOther}
            selectedColors={step4Colors}
            onToggleColor={handleToggleColor}
            colorOther={step4ColorOther}
            onColorOtherChange={setStep4ColorOther}
            admiredBrands={step4Brands}
            onAdmiredBrandsChange={setStep4Brands}
            associateWords={step4Words}
            onAssociateWordsChange={setStep4Words}
            disabled={isSubmitting}
          />
        );
      case "generatedNames":
        return (
          <Step4GeneratedNames
            generatedNames={generatedNames}
            selectedName={selectedGeneratedName}
            onSelectName={setSelectedGeneratedName}
            onRegenerate={handleRegenerateNames}
            isGenerating={isGenerating}
            disabled={isSubmitting}
          />
        );
      case "productType":
        return (
          <Step5ProductTypes
            selectedProductTypes={selectedProductTypes}
            onToggleProductType={toggleProductType}
            productTypeOther={productTypeOther}
            onProductTypeOtherChange={setProductTypeOther}
            disabled={isSubmitting}
          />
        );
      case "targetConsumers":
        return (
          <Step5TargetConsumers
            selectedCustomers={selectedCustomers}
            onToggleCustomer={toggleCustomer}
            customerOther={customerOther}
            onCustomerOtherChange={setCustomerOther}
            disabled={isSubmitting}
          />
        );
      case "startupStage":
        return (
          <Step5StartupStage
            startupStage={startupStage}
            onStartupStageChange={setStartupStage}
            disabled={isSubmitting}
          />
        );
      case "techStack":
        return (
          <Step6TechStack
            selectedStacks={selectedStacks}
            onToggleStack={toggleStack}
            stackOther={stackOther}
            onStackOtherChange={setStackOther}
            disabled={isSubmitting}
          />
        );

      case "aiPreference":
        return (
          <Step6AIPreferences
            aiPreference={aiPreference}
            onAiPreferenceChange={setAiPreference}
            disabled={isSubmitting}
          />
        );

      case "authentication":
        return (
          <Step6Authentication
            selectedAuth={selectedAuth}
            onToggleAuth={toggleAuth}
            authOther={authOther}
            onAuthOtherChange={setAuthOther}
            disabled={isSubmitting}
          />
        );

      case "database":
        return (
          <Step6Database
            selectedDatabase={selectedDatabase}
            onSelectDatabase={setSelectedDatabase}
            databaseOther={databaseOther}
            onDatabaseOtherChange={setDatabaseOther}
            disabled={isSubmitting}
          />
        );
      case "business":
        return (
          <Step7Form
            selectedRevenueModels={selectedRevenueModels}
            onToggleRevenueModel={toggleRevenueModel}
            revenueOther={revenueOther}
            onRevenueOtherChange={setRevenueOther}
            disabled={isSubmitting}
          />
        );
      case "additional":
        return (
          <Step8Form
            value={additionalInformation}
            onChange={setAdditionalInformation}
            disabled={isSubmitting}
          />
        );
    }
  };

  const meta = STEP_META[currentStepId];
  const stepProgress = getStepProgress();
  const overallProgress = (displayStep - 1 + stepProgress) / TOTAL_DISPLAY_STEPS;

  return (
    <OnboardingLayout onBack={handleBack}>
      <div className={`flex flex-col gap-[clamp(0.375rem,1vh,0.75rem)] ${displayStep < 7 ? "pt-1 md:pt-2" : ""}`}>
        {/* ── Step label + Heading + Subtitle ─────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`header-${currentStepId}`}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <StepHeader
              currentStep={displayStep}
              totalSteps={TOTAL_DISPLAY_STEPS}
              title={meta.title}
              subtitle={meta.subtitle}
            />
          </motion.div>
        </AnimatePresence>

        {/* ── Moon-phase constellation progress ───────────────────────────── */}
        <div className="w-full">
          <MoonProgressIndicator
            currentStep={displayStep}
            totalSteps={TOTAL_DISPLAY_STEPS}
            stepProgress={stepProgress}
            isPulsing={isPulsing}
            suppressFullMoon={[ "nameChoice","productType","targetConsumers","techStack","aiPreference", "authentication",].includes(currentStepId)||(currentStepId === "identityDetails" && step4NameMode  === "generate")}
          />
        </div>

        {/* ── Percentage readout ───────────────────────────────────────────── */}
        <div className="flex items-center gap-1">
          <div className="flex-grow h-px bg-white/5" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/30 shrink-0">
            {Math.round(overallProgress * 100)}% complete
          </span>
          <div className="flex-grow h-px bg-white/5" />
        </div>

        {/* ── Active step form ─────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`form-${currentStepId}`}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderForm()}
          </motion.div>
        </AnimatePresence>

        {/* ── Continue button ──────────────────────────────────────────────── */}
        <ContinueButton
          onClick={handleContinue}
          disabled={!checkCanContinue()}
          loading={isSubmitting}
        />
      </div>
    </OnboardingLayout>
  );
}
