"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import SearchBar from "./SearchBar";

export default function AgentWorkspace() {
  const [containerHeight, setContainerHeight] = useState(500);
  const [textHeight, setTextHeight] = useState(120);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Measure container and text block heights dynamically
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) setContainerHeight(containerRef.current.clientHeight);
      if (textRef.current) setTextHeight(textRef.current.clientHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    if (textRef.current) ro.observe(textRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute the max growth limit dynamically and hard-cap at 160px to avoid page overflow
  // 158px covers layout offsets: Search Box padding (34px) + chips margin (32px) + chips height (36px) + text margin (40px) + bottom buffer (16px)
  const dynamicMaxHeight = Math.min(
    136,
    Math.max(42, containerHeight - textHeight - 146)
  );

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col items-center min-h-[210px] sm:min-h-[250px] lg:min-h-[330px] overflow-visible px-2 sm:px-4"
    >
      {/* Centered Search Bar with dynamic max height restriction */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md sm:max-w-lg lg:max-w-[540px] z-20"
      >
        <SearchBar maxHeight={dynamicMaxHeight} />
      </motion.div>

      {/* Paragraph Text at the bottom with exact spacing and line height */}
      <motion.div
        ref={textRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25 }}
        className="w-full max-w-xl sm:max-w-2xl lg:max-w-4xl z-10 text-center px-4 sm:px-6 mt-6 sm:mt-8"
      >
        <p className="text-sm sm:text-base lg:text-lg text-white/70 font-normal leading-6 sm:leading-7">
          OneCrew is an agentic startup platform where specialized AI teams collaborate to build your product, execute tasks, manage every department, and keep your entire company synchronized—all from one intelligent workspace.
        </p>
      </motion.div>
    </div>
  );
}
