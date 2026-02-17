"use client";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, Wand2, ArrowRight, Sparkles, Loader2, X, 
  Briefcase, ShoppingBag, User, Globe, CheckCircle2, 
  LayoutTemplate, Palette, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createChat } from "@/app/actions"; 

// --- WIZARD CONFIGURATION ---
const WIZARD_STEPS = [
  {
    id: "type",
    title: "What are you building?",
    subtitle: "Select the primary purpose of your website.",
    multi: false,
    options: [
      { value: "Personal Portfolio", label: "Portfolio", icon: <User className="w-6 h-6"/>, desc: "Showcase work & resume." },
      { value: "SaaS Landing Page", label: "SaaS Landing", icon: <Globe className="w-6 h-6"/>, desc: "High conversion product page." },
      { value: "E-Commerce Store", label: "Online Store", icon: <ShoppingBag className="w-6 h-6"/>, desc: "Sell products directly." },
      { value: "Corporate Business Site", label: "Business", icon: <Briefcase className="w-6 h-6"/>, desc: "Professional company profile." },
    ]
  },
  {
    id: "style",
    title: "Choose a Design Style",
    subtitle: "Define the look and feel.",
    multi: false,
    options: [
      { value: "Minimalist", label: "Minimalist", icon: <LayoutTemplate className="w-6 h-6"/>, desc: "Clean, whitespace, simple type." },
      { value: "Brutalist / Bold", label: "Brutalist", icon: <Layers className="w-6 h-6"/>, desc: "High contrast, sharp edges, loud." },
      { value: "Professional Corporate", label: "Corporate", icon: <Briefcase className="w-6 h-6"/>, desc: "Trustworthy blue tones, structured." },
      { value: "Playful & Vibrant", label: "Playful", icon: <Palette className="w-6 h-6"/>, desc: "Round shapes, fun colors." },
    ]
  },
  {
    id: "features",
    title: "What sections do you need?",
    subtitle: "Select all that apply.",
    multi: true,
    options: [
      { value: "Hero Section", label: "Hero Header", desc: "Main title & CTA." },
      { value: "Features Grid", label: "Features Grid", desc: "List key benefits." },
      { value: "Testimonials", label: "Testimonials", desc: "Social proof slider." },
      { value: "Pricing Table", label: "Pricing", desc: "Subscription cards." },
      { value: "Contact Form", label: "Contact Form", desc: "Input fields & submit." },
      { value: "FAQ Accordion", label: "FAQ", desc: "Expandable questions." },
      { value: "Footer", label: "Footer", desc: "Links & copyright." },
    ]
  }
];

export default function Dashboard() {
  const router = useRouter();
  const { userId } = useAuth(); // <--- FIXED: Added userId retrieval
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Store answers. Initialize 'features' as an array for multi-select.
  const [answers, setAnswers] = useState<{ type: string; style: string; features: string[] }>({
    type: "",
    style: "",
    features: ["Hero Section", "Footer"] // Default selections
  });

  const currentStep = WIZARD_STEPS[currentStepIndex];

  // --- HANDLERS ---

  const handleSelection = (value: string) => {
    if (currentStep.multi) {
      setAnswers(prev => {
        const exists = prev.features.includes(value);
        return {
          ...prev,
          features: exists 
            ? prev.features.filter(f => f !== value) 
            : [...prev.features, value]
        };
      });
    } else {
      setAnswers(prev => ({ ...prev, [currentStep.id]: value }));
    }
  };

  const handleNext = () => {
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      finishWizard();
    }
  };

  const finishWizard = async () => {
    setLoading(true);

    // 1. CONSTRUCT THE MASTER PROMPT
    const finalPrompt = `Create a ${answers.style} website for a ${answers.type}. 
    The design should be fully responsive and use Tailwind CSS.
    It MUST include the following sections: ${answers.features.join(", ")}.
    Use placeholder images from Unsplash where appropriate. 
    Ensure the code is written in a single HTML file with embedded CSS/JS.`;

    try {
      // 2. CREATE DATABASE ENTRY
      // <--- FIXED: Passed userId! as first argument
      const newChatId = await createChat(userId!, `${answers.type} Project`) || Date.now(); 

      // 3. REDIRECT TO EDITOR (Editor will read URL and start AI)
      router.push(`/editor/${newChatId}?initialPrompt=${encodeURIComponent(finalPrompt)}`);
      
    } catch (error) {
      console.error("Error creating project:", error);
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-4">
      
      {/* HEADER */}
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Your Dashboard</h1>
        <p className="text-slate-500 text-lg">Manage your projects or start something new.</p>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        
        {/* 1. Blank Project */}
        <div 
            onClick={async () => {
                // <--- FIXED: Passed userId! as first argument
                const id = await createChat(userId!, "Untitled Project");
                router.push(`/editor/${id}`);
            }}
            className="group relative bg-white p-10 rounded-3xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center gap-4"
        >
            <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <Plus className="h-8 w-8"/>
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">Blank Canvas</h3>
                <p className="text-sm text-slate-500 mt-2">Start from scratch manually.</p>
            </div>
        </div>

        {/* 2. AI Template Wizard */}
        <div 
            onClick={() => setIsWizardOpen(true)}
            className="group relative bg-gradient-to-br from-indigo-600 to-purple-600 p-10 rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all cursor-pointer flex flex-col items-center text-center gap-4 text-white overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform shadow-inner">
                <Wand2 className="h-8 w-8 text-white"/>
            </div>
            <div className="relative z-10">
                <h3 className="text-xl font-bold">AI Templates</h3>
                <p className="text-white/80 mt-2">Answer questions & generate a full site.</p>
            </div>
        </div>
      </div>

      {/* --- WIZARD OVERLAY --- */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Wizard Header */}
                <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center"><Sparkles className="h-4 w-4"/></div>
                        <div>
                            <h2 className="font-bold text-slate-800">Template Wizard</h2>
                            <p className="text-xs text-slate-500">Step {currentStepIndex + 1} of {WIZARD_STEPS.length}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsWizardOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-5 h-5"/></button>
                </div>

                {/* Wizard Content */}
                <div className="p-8 flex-1 overflow-y-auto">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{currentStep.title}</h3>
                        <p className="text-slate-500">{currentStep.subtitle}</p>
                    </div>
                    
                    <div className={currentStep.id === 'features' ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                        {currentStep.options.map((opt) => {
                            // Determine selection state
                            // @ts-ignore
                            const isSelected = currentStep.multi ? answers.features.includes(opt.value) : answers[currentStep.id] === opt.value;

                            return (
                                <div 
                                    key={opt.value} 
                                    onClick={() => handleSelection(opt.value)}
                                    className={`
                                        relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 flex flex-col gap-2 text-left group
                                        ${isSelected ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-500' : 'border-slate-100 hover:border-purple-200 hover:bg-slate-50'}
                                    `}
                                >
                                    <div className="flex justify-between items-start w-full">
                                        {/* Icon (if exists) or Checkbox (if multi) */}
                                        <div className={`transition-colors ${isSelected ? "text-purple-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                                            {/* @ts-ignore */}
                                            {opt.icon ? opt.icon : (
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white'}`}>
                                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                </div>
                                            )}
                                        </div>
                                        {/* Checkmark for Single Select */}
                                        {!currentStep.multi && isSelected && <CheckCircle2 className="w-5 h-5 text-purple-600" />}
                                    </div>
                                    
                                    <div>
                                        <span className={`block font-bold ${isSelected ? 'text-purple-900' : 'text-slate-800'}`}>{opt.label}</span>
                                        <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Wizard Footer */}
                <div className="p-6 border-t bg-slate-50 flex justify-between items-center">
                    {currentStepIndex > 0 ? (
                        <Button variant="ghost" onClick={() => setCurrentStepIndex(s => s - 1)}>Back</Button>
                    ) : (
                        <div/> 
                    )}

                    <div className="flex gap-2">
                        {/* Dots Indicator */}
                        <div className="flex gap-1 mr-4 items-center">
                            {WIZARD_STEPS.map((_, idx) => (
                                <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentStepIndex ? 'w-4 bg-purple-600' : 'w-1.5 bg-slate-300'}`} />
                            ))}
                        </div>

                        <Button 
                            onClick={handleNext} 
                            // Disable if nothing selected (unless multi-select which has defaults)
                            // @ts-ignore
                            disabled={loading || (!currentStep.multi && !answers[currentStep.id])}
                            className="bg-slate-900 text-white hover:bg-slate-800 px-6"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                            {currentStepIndex === WIZARD_STEPS.length - 1 ? "Generate Website" : "Next Step"} 
                            {!loading && <ArrowRight className="w-4 h-4 ml-2"/>}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
      )}
    </div>
  );
}