"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/landing/Navbar";
const ThreeBackground = dynamic(() => import("@/components/landing/ThreeBackground"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-[#050505] pointer-events-none" aria-hidden="true" />,
});
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import MeetCrew from "@/components/landing/MeetCrew";

export default function App() {
  const router = useRouter();

  const homeRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const meetRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const heading = ref.current.querySelector("h2");
      if (heading) {
        const elementTop = heading.getBoundingClientRect().top;
        // Position h2 ~130px from the top (leaving 80px for the navbar and 50px for section label/padding)
        const offsetPosition = elementTop + window.pageYOffset - 130;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      } else {
        const elementTop = ref.current.getBoundingClientRect().top;
        const offsetPosition = elementTop + window.pageYOffset - 80;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-[#e5e2e1] selection:bg-white selection:text-black overflow-x-hidden">
      {/* Immersive 3D Space Background & Decorative HUD Rings */}
      <ThreeBackground />

      {/* Primary Fixed Navigation Header */}
      <Navbar
        onNavigate={(section) => {
          if (section === "home") scrollTo(homeRef);
          if (section === "how") scrollTo(howRef);
          if (section === "meet") scrollTo(meetRef);
        }}
        onLogin={() => router.push("/login")}
      />

      {/* Main Flow Canvas — Three Cinematic Scenes */}
      <main className="relative z-10 w-full flex flex-col">
        <div
          ref={homeRef}
          className="w-full"
        >
          <Hero />
        </div>

        {/* Intentional section break: thin horizontal gradient rule */}
        <div className="w-full max-w-4xl mx-auto px-6 md:px-16 pointer-events-none" aria-hidden="true">
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        <div ref={howRef}>
          <HowItWorks />
        </div>

        <div ref={meetRef} className="relative z-10">
          <MeetCrew />
        </div>
      </main>
    </div>
  );
}
