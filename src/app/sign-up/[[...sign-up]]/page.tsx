import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, Wand2 } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-slate-950 overflow-hidden relative">
      
      {/* --- LEFT: VISUAL SIDE (Hidden on mobile) --- */}
      <div className="hidden lg:flex flex-col justify-between relative p-12 bg-slate-900 overflow-hidden">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_#9333ea_0%,_transparent_50%)] opacity-20 blur-[100px] animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_#2563eb_0%,_transparent_50%)] opacity-20 blur-[100px] animate-pulse delay-700"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight hover:opacity-80 transition-opacity w-fit">
            <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]">
               <Wand2 className="h-5 w-5" />
            </div>
            <span>Drix</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
           <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
             Create something <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">extraordinary.</span>
           </h1>
           <p className="text-slate-400 text-lg">
             Join thousands of creators using Drix to turn ideas into production-ready code in seconds.
           </p>
        </div>

        <div className="relative z-10 text-slate-500 text-sm">
          © {new Date().getFullYear()} Drix Inc.
        </div>
      </div>

      {/* --- RIGHT: FORM SIDE --- */}
      <div className="flex flex-col items-center justify-center p-6 relative">
         <div className="absolute top-6 left-6 lg:hidden">
             <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
                <ArrowLeft className="h-5 w-5" /> Back
             </Link>
         </div>

         {/* Glow Effect behind form */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>

         <SignUp 
            appearance={{
                elements: {
                    rootBox: "w-full max-w-md",
                    card: "bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8",
                    headerTitle: "text-white text-2xl font-bold",
                    headerSubtitle: "text-slate-400",
                    socialButtonsBlockButton: "bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all",
                    dividerLine: "bg-white/10",
                    dividerText: "text-slate-500",
                    formFieldLabel: "text-slate-300",
                    formFieldInput: "bg-slate-950/50 border border-slate-800 text-white focus:border-purple-500 transition-colors",
                    footerActionLink: "text-purple-400 hover:text-purple-300",
                    formButtonPrimary: "bg-gradient-to-r from-purple-600 to-pink-600 border-none shadow-lg hover:shadow-purple-500/20 transition-all text-white font-bold py-3"
                }
            }}
         />
      </div>
    </div>
  );
}