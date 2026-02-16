"use server";

import { db } from "@/db";
import { chats, messages, users, files } from "@/db/schema"; 
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server"; // ✅ Added for user authentication

// ==========================================================
// 🛠️ CHAT MANAGEMENT (CRUD)
// ==========================================================

export async function createChat(userId: string, title: string, templateHtml?: string) {
  const [newChat] = await db.insert(chats).values({ userId, title }).returning();
  
  if (templateHtml) {
    // Inject the initial system/AI message
    await db.insert(messages).values({ 
      chatId: newChat.id, 
      role: "ai", 
      content: "Project initialized.", 
      htmlContent: templateHtml 
    });
    // Create the initial file
    await db.insert(files).values([{ 
      chatId: newChat.id, 
      name: "index.html", 
      content: templateHtml, 
      type: "html" 
    }]);
  }
  return newChat;
}

export async function getUserChats(userId: string, section: "all" | "starred" | "trash" = "all") {
  let whereClause = and(eq(chats.userId, userId), eq(chats.isDeleted, false)); 
  
  if (section === "starred") {
    whereClause = and(eq(chats.userId, userId), eq(chats.isStarred, true), eq(chats.isDeleted, false));
  } else if (section === "trash") {
    whereClause = and(eq(chats.userId, userId), eq(chats.isDeleted, true));
  }

  const userChats = await db.select().from(chats).where(whereClause).orderBy(desc(chats.createdAt));

  // Attach a preview snippet (content of index.html) to each chat
  const resultsWithPreview = await Promise.all(userChats.map(async (chat) => {
    const mainFile = await db.select()
      .from(files)
      .where(and(eq(files.chatId, chat.id), eq(files.name, "index.html")))
      .limit(1);
      
    return { 
      ...chat, 
      previewHtml: mainFile[0]?.content || "<div class='p-4 text-xs text-slate-400'>No preview available</div>" 
    };
  }));

  return resultsWithPreview;
}

export async function toggleChatStar(chatId: number, currentStatus: boolean) {
  await db.update(chats).set({ isStarred: !currentStatus }).where(eq(chats.id, chatId));
  revalidatePath("/");
}

export async function renameChat(chatId: number, newTitle: string) {
  await db.update(chats).set({ title: newTitle }).where(eq(chats.id, chatId));
  revalidatePath("/");
}

export async function deleteChat(chatId: number) {
  await moveToTrash(chatId);
}

export async function moveToTrash(chatId: number) {
  await db.update(chats).set({ isDeleted: true }).where(eq(chats.id, chatId));
  revalidatePath("/");
}

export async function restoreFromTrash(chatId: number) {
  await db.update(chats).set({ isDeleted: false }).where(eq(chats.id, chatId));
  revalidatePath("/");
}

export async function permanentDeleteChat(chatId: number) {
  // Delete related data first to avoid foreign key constraints
  await db.delete(messages).where(eq(messages.chatId, chatId));
  await db.delete(files).where(eq(files.chatId, chatId));
  await db.delete(chats).where(eq(chats.id, chatId));
  revalidatePath("/");
}

// ==========================================================
// 📂 FILE & MESSAGE HANDLING
// ==========================================================

export async function getProjectFiles(chatId: number) {
  return await db.select().from(files).where(and(eq(files.chatId, chatId), eq(files.type, 'html')));
}

export async function saveFile(chatId: number, fileName: string, content: string, type: string) {
  const existing = await db.select().from(files).where(and(eq(files.chatId, chatId), eq(files.name, fileName)));
  
  if (existing.length > 0) {
    await db.update(files).set({ content }).where(eq(files.id, existing[0].id));
  } else {
    await db.insert(files).values({ chatId, name: fileName, content, type });
  }
}

export async function saveMessage(chatId: number, role: "user" | "ai", content: string, html?: string) {
    await db.insert(messages).values({ chatId, role, content, htmlContent: html });
}

export async function getChatMessages(chatId: number) {
    return await db.select().from(messages).where(eq(messages.chatId, chatId)).orderBy(messages.id);
}

// ==========================================================
// 🚀 SMART INFINITE TEMPLATE ENGINE
// ==========================================================

export interface GeneratedTemplate {
  id: string;
  name: string;
  description: string;
  html: string;
}

// --- 1. BOILERPLATE WRAPPER ---
function wrapHtml(bodyContent: string, title: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&family=Playfair+Display:ital,wght@0,600;1,600&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            serif: ['Playfair Display', 'serif'],
            mono: ['Space Grotesk', 'monospace'],
          }
        }
      }
    }
  </script>
</head>
<body class="antialiased selection:bg-blue-500 selection:text-white">
  ${bodyContent}
  <script>
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if(btn && menu) {
        btn.addEventListener('click', () => menu.classList.toggle('hidden'));
    }
  </script>
</body>
</html>`;
}

// --- 2. EXTENDED TEMPLATE LIBRARY ---
const LIBRARY = [
  {
    type: "Gaming",
    keywords: ["game", "gaming", "esport", "fps", "rpg", "stream", "twitch", "play"],
    desc: "Dark mode, high energy, neon accents.",
    html: `<div class="bg-slate-950 text-white min-h-screen font-sans"><nav class="border-b border-white/10 bg-slate-900/50 backdrop-blur-md fixed w-full z-50"><div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between"><div class="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">[[TOPIC]]</div><button class="bg-purple-600 hover:bg-purple-700 px-6 py-2 skew-x-[-10deg] font-bold transition">JOIN NOW</button></div></nav><header class="relative pt-32 pb-20 overflow-hidden"><div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-slate-950 to-slate-950"></div><div class="max-w-7xl mx-auto px-6 relative z-10 text-center"><h1 class="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-6">Level <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Up</span></h1><p class="text-slate-400 text-xl max-w-2xl mx-auto mb-10">The ultimate destination for [[TOPIC]]. Join the revolution.</p><div class="flex justify-center gap-4"><button class="bg-white text-slate-950 px-8 py-4 font-black uppercase hover:scale-105 transition">Play Free</button></div></div></header></div>`
  },
  {
    type: "Agency",
    keywords: ["agency", "marketing", "studio", "creative", "design", "web", "social"],
    desc: "Bold typography, grid layouts, brutalist touches.",
    html: `<div class="bg-zinc-100 text-zinc-900 min-h-screen font-sans"><nav class="p-8 flex justify-between items-center mix-blend-difference text-white fixed w-full z-50"><span class="text-xl font-bold tracking-tighter">[[TOPIC]].</span><span class="text-sm font-mono">(MENU)</span></nav><header class="h-screen flex flex-col justify-center px-6 md:px-20"><h1 class="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-8">WE BUILD<br><span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">BRANDS.</span></h1><p class="text-xl font-medium max-w-lg leading-relaxed">[[TOPIC]] is a full-service creative powerhouse defining the digital zeitgeist.</p><div class="mt-12 w-24 h-24 rounded-full bg-black text-white flex items-center justify-center font-bold animate-spin-slow cursor-pointer hover:scale-110 transition">SCROLL</div></header></div>`
  },
  {
    type: "Travel",
    keywords: ["travel", "tour", "trip", "hotel", "resort", "beach", "holiday", "fly"],
    desc: "Full-screen imagery, elegant serifs.",
    html: `<div class="bg-white text-slate-900 font-sans"><div class="relative h-screen"><img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80" class="absolute inset-0 w-full h-full object-cover brightness-75"/><nav class="relative z-10 p-8 flex justify-between text-white"><span class="text-2xl font-serif italic">[[TOPIC]]</span><button class="border border-white px-6 py-2 rounded-full hover:bg-white hover:text-black transition">Book Now</button></nav><div class="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4"><h1 class="text-6xl md:text-8xl font-serif italic mb-6">Escape Reality</h1><p class="text-xl max-w-lg">Discover the world's most breathtaking destinations with [[TOPIC]].</p></div></div></div>`
  },
  {
    type: "Medical",
    keywords: ["health", "doctor", "medical", "clinic", "dental", "dentist", "care", "hospital"],
    desc: "Clean, sterile, trustworthy, blue/teal palette.",
    html: `<div class="bg-white text-slate-800 min-h-screen font-sans"><nav class="border-b border-slate-100 p-6 flex justify-between items-center max-w-7xl mx-auto"><div class="flex items-center gap-2 text-teal-600"><i class="fa-solid fa-heart-pulse text-2xl"></i><span class="text-xl font-bold text-slate-900">[[TOPIC]]</span></div><button class="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition">Book Appointment</button></nav><main class="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center"><div class="space-y-6"><span class="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-bold">#1 Rated Care</span><h1 class="text-5xl font-bold leading-tight">Your Health, <br>Our Priority.</h1><p class="text-lg text-slate-500">Compassionate care utilizing the latest technology for you and your family.</p><div class="flex gap-4"><button class="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold">Our Services</button><button class="border border-slate-200 px-8 py-3 rounded-lg font-bold hover:bg-slate-50">Contact Us</button></div></div><div class="bg-slate-100 rounded-3xl h-96 w-full relative overflow-hidden"><img src="https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=800&q=80" class="absolute inset-0 w-full h-full object-cover"/></div></main></div>`
  },
  {
    type: "Food",
    keywords: ["food", "restaurant", "cafe", "coffee", "bar", "bakery", "pizza", "burger"],
    desc: "Warm tones, appetizing imagery, menu focused.",
    html: `<div class="bg-orange-50 text-stone-900 min-h-screen font-sans"><nav class="p-6 flex justify-between items-center"><h1 class="text-2xl font-black uppercase tracking-widest text-orange-600">[[TOPIC]]</h1><i class="fa-solid fa-bars text-xl"></i></nav><main class="container mx-auto px-6 py-12 flex flex-col items-center text-center"><div class="w-full max-w-4xl h-[500px] rounded-[2rem] overflow-hidden relative shadow-2xl mb-12"><img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80" class="absolute inset-0 w-full h-full object-cover"/></div><h1 class="text-6xl font-black mb-6 leading-none">TASTE <br> THE <span class="text-orange-600">MAGIC</span></h1><p class="text-xl text-stone-500 max-w-lg mb-8">Fresh ingredients, secret recipes, and an unforgettable vibe.</p><button class="bg-stone-900 text-white px-10 py-4 rounded-full font-bold hover:bg-orange-600 transition">Order Online</button></main></div>`
  },
  {
    type: "SaaS",
    keywords: ["saas", "tech", "app", "software", "startup", "finance", "crypto", "ai"],
    desc: "Clean, modern, corporate, trust signals.",
    html: `<div class="bg-white text-slate-900 min-h-screen font-sans"><nav class="px-6 py-5 border-b border-slate-100"><div class="max-w-7xl mx-auto flex justify-between items-center"><h1 class="text-xl font-bold text-blue-600">[[TOPIC]]</h1><div class="hidden md:flex gap-6 text-sm font-medium text-slate-500"><a href="#">Features</a><a href="#">Pricing</a></div><button class="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-bold">Get Started</button></div></nav><main class="max-w-5xl mx-auto mt-20 px-6 text-center"><div class="inline-block p-2 px-4 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-6">v2.0 is Live 🚀</div><h1 class="text-5xl md:text-7xl font-bold tracking-tight mb-8">Scale your business <br> <span class="text-blue-600">faster than ever.</span></h1><p class="text-xl text-slate-500 max-w-2xl mx-auto mb-10">The all-in-one platform for growth. Join 10,000+ teams using [[TOPIC]] today.</p><div class="flex justify-center gap-4"><button class="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-200/50 hover:bg-blue-700 transition">Start Free Trial</button></div><div class="mt-16 bg-slate-100 rounded-t-3xl border border-slate-200 h-80 w-full"></div></main></div>`
  }
];

export async function generateTemplateOptions(topic: string): Promise<GeneratedTemplate[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey || "");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  let validResults: GeneratedTemplate[] = [];

  // Attempt AI Generation (Only if Key exists)
  if (apiKey) {
    try {
      const prompt = `Create a website template for "${topic}". Return RAW HTML only. Do not use Markdown code blocks. Use Tailwind CSS. Structure: Navbar, Hero, Features.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      let html = text.replace(/```html|```/g, "").trim();
      if (html.includes("<!DOCTYPE html>")) {
        html = html.substring(html.indexOf("<!DOCTYPE html>"));
      }
      
      validResults.push({
        id: "ai-gen",
        name: `Custom AI: ${topic}`,
        description: "Uniquely generated for you.",
        html: wrapHtml(html, topic) 
      });
    } catch (e) {
      console.log("AI Generation failed, falling back to Smart Library.");
    }
  }

  // Smart Matching Logic
  const lowerTopic = topic.toLowerCase().trim();
  let match = LIBRARY.find(t => t.keywords.some(k => lowerTopic.includes(k)));
  
  if (!match) {
    const charCodeSum = topic.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    const index = charCodeSum % LIBRARY.length;
    match = LIBRARY[index];
  }

  const templateA = {
    id: "smart-1",
    name: `${match.type} Layout`,
    description: match.desc,
    html: wrapHtml(match.html.replaceAll("[[TOPIC]]", topic), topic)
  };

  const fallbackIndex = (LIBRARY.indexOf(match) + 1) % LIBRARY.length;
  const matchB = LIBRARY[fallbackIndex];
  
  const templateB = {
    id: "smart-2",
    name: `${matchB.type} Style`,
    description: "A different approach for your idea.",
    html: wrapHtml(matchB.html.replaceAll("[[TOPIC]]", topic), topic)
  };

  return [...validResults, templateA, templateB];
}

// ==========================================================
// 🧙‍♂️ WIZARD & QUESTION GENERATION (NEW)
// ==========================================================

export interface WizardQuestion {
  id: number;
  question: string;
  options: string[];
}

export async function generateProjectQuestions(topic: string): Promise<WizardQuestion[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("No API Key");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert web consultant. A client wants to build a website about: "${topic}".
    Generate exactly 8 multiple-choice questions to understand their specific needs, design taste, and functionality requirements.
    
    Return ONLY a raw JSON array. No markdown. Format:
    [
      { "id": 1, "question": "What is the primary goal?", "options": ["Sell products", "Portfolio", "Blog"] }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to generate questions:", e);
    // Fallback questions if AI fails
    return [
      { id: 1, question: "What is the main purpose of the site?", options: ["Business", "Personal", "Portfolio", "Blog"] },
      { id: 2, question: "What is your preferred color scheme?", options: ["Light & Airy", "Dark & Modern", "Colorful", "Monochrome"] },
      { id: 3, question: "Who is the target audience?", options: ["Youth", "Professionals", "Seniors", "Everyone"] },
      { id: 4, question: "What features are most important?", options: ["Contact Form", "Gallery", "Online Store", "Blog Section"] },
      { id: 5, question: "Which layout style do you prefer?", options: ["Minimalist", "Grid-based", "Fullscreen Imagery", "Typography-focused"] },
      { id: 6, question: "Do you have a logo?", options: ["Yes, I will upload it", "No, I need one", "Just use text"] },
      { id: 7, question: "What tone should the content have?", options: ["Professional", "Friendly", "Luxurious", "Playful"] },
      { id: 8, question: "How many pages do you envision?", options: ["One Page (Landing)", "Small (1-5 pages)", "Medium (5-10 pages)", "Large (10+ pages)"] }
    ];
  }
}

export async function createProjectFromAnswers(topic: string, qaPairs: { question: string; answer: string }[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Compile the answers into a master prompt for the AI
  let masterPrompt = `I need you to build a complete website for "${topic}".\n\nHere are the detailed requirements based on a client interview:\n`;
  
  qaPairs.forEach((qa, index) => {
    masterPrompt += `${index + 1}. ${qa.question}: ${qa.answer}\n`;
  });

  masterPrompt += "\nPlease generate the full HTML structure using Tailwind CSS based on these requirements. Return only the raw HTML.";

  // Create the new chat/project
  // We pass 'undefined' for templateHtml because we want the AI to generate it fresh based on the prompt
  const chat = await createChat(userId, topic, undefined); 
  
  // Save the Master Prompt as the user's first message
  // This ensures the AI has the context when the chat loads
  await saveMessage(chat.id, "user", masterPrompt);

  return { chatId: chat.id, prompt: masterPrompt };
}