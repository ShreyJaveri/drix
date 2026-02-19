"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

// =======================================================
// 1. THE MAGNETIC GLOW CURSOR
// =======================================================
export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      // Check if hovering over a clickable element
      const computedStyle = window.getComputedStyle(target);
      setIsPointer(computedStyle.cursor === "pointer");
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <motion.div
        className="absolute h-8 w-8 rounded-full bg-white mix-blend-difference"
        animate={{
          x: position.x - 16,
          y: position.y - 16,
          scale: isPointer ? 2.5 : 1,
          opacity: 1
        }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      />
      <motion.div
         className="absolute h-96 w-96 rounded-full bg-purple-500/20 blur-[100px]"
         animate={{
           x: position.x - 192,
           y: position.y - 192,
         }}
         transition={{ type: "tween", ease: "backOut", duration: 0.5 }}
      />
    </div>
  );
};

// =======================================================
// 2. THE "BORDER BEAM" CARD
// =======================================================
export const BorderBeamCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
      <div className={cn("relative rounded-3xl p-[1px] overflow-hidden group/card", className)}>
        {/* ROTATING BORDER BEAM */}
        <div className="absolute inset-0 animate-spin-slow [mask-image:linear-gradient(transparent,white,transparent)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-sm opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-1/2 h-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
        </div>
        
        {/* INNER CONTENT */}
        <div className="relative h-full bg-black/40 backdrop-blur-xl rounded-[23px] border border-white/10 p-8 z-10 transition-colors group-hover/card:bg-black/60">
             {/* GRID PATTERN OVERLAY */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
             {children}
             
             {/* METEOR EFFECT */}
             <Meteors number={10} />
        </div>
      </div>
    );
};

// =======================================================
// 3. METEOR SHOWER EFFECT
// =======================================================
export const Meteors = ({ number = 20 }: { number?: number }) => {
  const [meteors, setMeteors] = useState<number[]>([]);
  
  useEffect(() => {
    setMeteors(new Array(number).fill(true));
  }, [number]);

  return (
    <>
      {meteors.map((_, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent",
          )}
          style={{
            top: Math.floor(Math.random() * 100) + "%", // Random Position
            left: Math.floor(Math.random() * 100) + "%",
            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
            animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
          }}
        ></span>
      ))}
    </>
  );
};