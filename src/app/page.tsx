"use client";

import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Layers, Play, Cpu, Code } from "lucide-react";
import { ThreeScene } from "@/components/ThreeScene"; 
import { CustomCursor, BorderBeamCard } from "@/components/InsaneUI"; // ✅ Import new UI

export default function LandingPage() {
  const { userId } = useAuth();

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-white overflow-x-hidden font-sans cursor-none selection:bg-purple-500/30">
      
      {/* 1. CUSTOM CURSOR & 3D BG */}
      <CustomCursor />
      <ThreeScene />

      {/* 2. OVERLAY */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-radial-gradient from-transparent to-black/90" />

      {/* 3. NAVBAR */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/5 backdrop-blur-sm transition-all duration-300 hover:bg-black/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:rotate-12 transition-transform">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-lg tracking-tight group-hover:text-purple-300 transition-colors">Drix</span>
          </div>

          <div className="flex gap-6 items-center">
            {userId ? (
               <div className="flex gap-4 items-center">
                 <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition cursor-none">Workspace</Link>
                 <div className="cursor-none"><UserButton afterSignOutUrl="/" /></div>
               </div>
            ) : (
               <div className="flex gap-4 items-center">
                 <Link href="/sign-in" className="text-sm font-medium text-slate-300 hover:text-white transition cursor-none">Log In</Link>
                 <Link href="/sign-up">
                   <button className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-purple-50 transition shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 cursor-none">
                     Get Started
                   </button>
                 </Link>
               </div>
            )}
          </div>
        </div>
      </nav>

      {/* 4. HERO */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-xs font-medium text-purple-200 shadow-xl hover:bg-white/10 transition-colors cursor-none">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
             </span>
             v2.0 Architecture Online
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 drop-shadow-2xl"
        >
           Code at the <br />
           speed of <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 animate-pulse">Thought.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-xl mx-auto text-slate-400 text-lg md:text-xl leading-relaxed mb-10"
        >
           The first reliability-focused AI builder. Generate semantic, type-safe Next.js code that actually works in production.
        </motion.p>

        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.6 }}
           className="flex flex-col sm:flex-row gap-4 items-center"
        >
           <Link href={userId ? "/dashboard" : "/sign-up"}>
              <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full font-bold text-lg shadow-[0_10px_40px_-10px_rgba(124,58,237,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(124,58,237,0.7)] transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 cursor-none">
                 <span className="flex items-center gap-2">
                    Start Building Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </span>
              </button>
           </Link>
           <Link 
              href="https://drive.google.com/file/d/1FwDk3FS-lbS0-jcyQB92EodZq4_xMxbY/view?usp=sharing" 
              target="_blank"
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-medium text-lg hover:bg-white/10 backdrop-blur-md transition inline-flex items-center gap-2 hover:border-white/30 cursor-none"
            >
              <Play className="w-4 h-4 fill-white" /> Watch Demo
           </Link>
        </motion.div>
      </section>

      {/* 5. INSANE CARDS SECTION */}
      <section className="relative z-10 py-32 px-6">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* CARD 1 */}
                <BorderBeamCard className="h-full">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <Cpu className="text-emerald-400 w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">Production Core</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Outputs clean, semantic HTML5 & Tailwind. No black-box 'AI spaghetti' code. 
                        Your code is optimized for Vercel Edge Networks.
                    </p>
                </BorderBeamCard>

                {/* CARD 2 */}
                <BorderBeamCard className="h-full">
                     <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        <Layers className="text-blue-400 w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">Visual Control</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Manipulate the DOM visually while retaining full code access. 
                        It's like Figma and VS Code had a baby.
                    </p>
                </BorderBeamCard>

                {/* CARD 3 */}
                <BorderBeamCard className="h-full">
                     <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        <Code className="text-purple-400 w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">Zero Lock-in</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Export your project as a standard Next.js app or static HTML. 
                        You own the code, forever.
                    </p>
                </BorderBeamCard>

            </div>
         </div>
      </section>

      {/* 6. TAILWIND ANIMATION CONFIG (Add to globals.css if needed, but inline works too) */}
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        @keyframes meteor {
          0% { transform: rotate(215deg) translateX(0); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: rotate(215deg) translateX(-500px); opacity: 0; }
        }
        .animate-meteor-effect {
          animation: meteor 5s linear infinite;
        }
      `}</style>

    </div>
  );
}