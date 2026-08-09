"use client";

import React from "react";

interface StepIntroProps {
  
  description: string;
  
  descriptionClassName?: string;
}

export function StepIntro({

  description,
  descriptionClassName = "max-w-lg",
}: StepIntroProps) {
  return (
    <div className="text-center space-y-0.25">
     

      <p className={`text-[15px] text-white/45 leading-relaxed mx-auto ${descriptionClassName}`}>
        {description}
      </p>
    </div>
  );
}
