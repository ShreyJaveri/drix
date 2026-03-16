"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, Check } from "lucide-react";
import { generateProjectQuestions, createProjectFromAnswers, WizardQuestion } from "@/app/actions";
import { useRouter } from "next/navigation";

export function TemplateWizard() {
  const router = useRouter();
  
  // STATES
  const [step, setStep] = useState<"input" | "loading" | "questions" | "building">("input");
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<WizardQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; answer: string }[]>([]);

  // 1. START: User enters topic -> Get Questions
  const handleStart = async () => {
    if (!topic) return;
    setStep("loading");
    try {
      const qs = await generateProjectQuestions(topic);
      setQuestions(qs);
      setStep("questions");
    } catch (error) {
      console.error(error);
      setStep("input"); // Reset on error
    }
  };

  // 2. ANSWER: User picks an option -> Next Question
  const handleAnswer = (answer: string) => {
    const currentQ = questions[currentQIndex];
    const newAnswers = [...answers, { question: currentQ.question, answer }];
    setAnswers(newAnswers);

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      // All done!
      handleSubmit(newAnswers);
    }
  };

  // 3. SUBMIT: Send all data to backend -> Redirect
  const handleSubmit = async (finalAnswers: typeof answers) => {
    setStep("building");
    try {
      const result = await createProjectFromAnswers(topic, finalAnswers);
      
      // ✅ FIXED: Redirect to the Editor page correctly
      router.push(`/editor/${result.chatId}?chatId=${result.chatId}`); 
      
    } catch (error) {
      console.error("Build failed", error);
      setStep("input"); // Allow retry on failure
    }
  };

  // RENDER HELPERS
  const variants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <div className="max-w-2xl mx-auto mt-20 p-6 bg-white rounded-2xl shadow-xl border border-slate-100 min-h-[400px] flex flex-col justify-center">
      
      {/* STEP 1: TOPIC INPUT */}
      {step === "input" && (
        <div className="space-y-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900">What do you want to build?</h1>
          <p className="text-slate-500">Enter a topic (e.g., "Dental Clinic", "NFT Marketplace", "Personal Blog")</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input 
              value={topic} 
              onChange={(e) => setTopic(e.target.value)} 
              placeholder="e.g. Modern Coffee Shop"
              className="text-lg p-6 text-slate-900 bg-white border-slate-200"
            />
            <Button onClick={handleStart} size="lg" className="bg-blue-600 hover:bg-blue-700 h-full aspect-square">
              <ArrowRight />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: LOADING SPINNER */}
      {step === "loading" && (
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-lg font-medium text-slate-600">Analyzing requirements...</p>
        </div>
      )}

      {/* STEP 3: QUESTIONS WIZARD */}
      {step === "questions" && (
        <div className="space-y-8">
          <div className="flex justify-between items-center text-sm font-medium text-slate-400 uppercase tracking-wider">
            <span>Question {currentQIndex + 1} of {questions.length}</span>
            <span>{Math.round(((currentQIndex) / questions.length) * 100)}% Completed</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQIndex}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                {questions[currentQIndex].question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {questions[currentQIndex].options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className="p-4 text-left border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-between group"
                  >
                    <span className="font-medium text-slate-700 group-hover:text-blue-700">{option}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* STEP 4: BUILDING */}
      {step === "building" && (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">All set!</h2>
          <p className="text-slate-500">We are generating your custom <b>{topic}</b> website now.</p>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-blue-600 animate-progress w-full origin-left"></div>
          </div>
        </div>
      )}
    </div>
  );
}