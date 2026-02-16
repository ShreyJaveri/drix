export type TemplateCategory = "Gaming" | "Business" | "Portfolio" | "E-commerce" | "SaaS";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  html: string;
}

export const TEMPLATES: Template[] = [
  // --- GAMING CATEGORY ---
  {
    id: "gaming-clan",
    name: "Esports Clan",
    category: "Gaming",
    description: "Dark mode, neon accents, and roster grid. Perfect for teams.",
    html: `
<div class="bg-slate-950 min-h-screen font-sans text-white selection:bg-purple-500 selection:text-white">
  <nav class="border-b border-white/10 bg-slate-900/50 backdrop-blur-md fixed w-full z-50">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div class="text-2xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">VIPER.GG</div>
      <div class="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest text-slate-400">
        <a href="#" class="hover:text-white transition-colors">Roster</a>
        <a href="#" class="hover:text-white transition-colors">Matches</a>
        <a href="#" class="hover:text-white transition-colors">Merch</a>
      </div>
      <button class="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-none skew-x-[-10deg] font-bold transition">JOIN CLAN</button>
    </div>
  </nav>

  <header class="relative pt-32 pb-20 overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-slate-950"></div>
    <div class="max-w-7xl mx-auto px-6 relative z-10 text-center">
      <h1 class="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-6">Dominate <br> <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">The Arena</span></h1>
      <p class="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">We are the premiere esports organization competing in FPS and MOBA titles worldwide.</p>
      <div class="flex justify-center gap-4">
        <button class="bg-white text-slate-950 px-8 py-4 font-black uppercase tracking-wider hover:scale-105 transition">Watch Live</button>
        <button class="border border-white/20 px-8 py-4 font-black uppercase tracking-wider hover:bg-white/10 transition">Meet Team</button>
      </div>
    </div>
  </header>

  <section class="py-20 border-t border-white/5 bg-slate-900/30">
    <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-slate-900 border border-white/10 p-8 hover:border-purple-500/50 transition group">
        <h3 class="text-slate-500 text-sm font-bold uppercase mb-2">Championships</h3>
        <p class="text-5xl font-black text-white group-hover:text-purple-400 transition">24</p>
      </div>
      <div class="bg-slate-900 border border-white/10 p-8 hover:border-pink-500/50 transition group">
        <h3 class="text-slate-500 text-sm font-bold uppercase mb-2">Win Rate</h3>
        <p class="text-5xl font-black text-white group-hover:text-pink-400 transition">87%</p>
      </div>
      <div class="bg-slate-900 border border-white/10 p-8 hover:border-red-500/50 transition group">
        <h3 class="text-slate-500 text-sm font-bold uppercase mb-2">Active Players</h3>
        <p class="text-5xl font-black text-white group-hover:text-red-400 transition">12</p>
      </div>
    </div>
  </section>
  <script>
    // Add hover sound effect logic here later
    console.log("Gaming Template Loaded");
  </script>
</div>`
  },
  {
    id: "gaming-streamer",
    name: "Streamer Hub",
    category: "Gaming",
    description: "Personal brand site for streamers. Links, schedule, and clips.",
    html: `
<div class="bg-black min-h-screen text-white font-sans">
  <div class="max-w-md mx-auto py-20 px-6 text-center">
    <div class="relative inline-block mb-8">
      <div class="absolute inset-0 bg-green-500 blur-xl opacity-50 rounded-full"></div>
      <img src="https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&q=80" class="relative w-32 h-32 rounded-full border-4 border-black object-cover" />
    </div>
    <h1 class="text-3xl font-bold mb-2">NeonSniper</h1>
    <p class="text-zinc-400 mb-8">Pro FPS Player & Content Creator. Live every day at 6PM EST.</p>
    
    <div class="space-y-4">
      <a href="#" class="block w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-4 rounded-xl flex items-center justify-between transition group">
        <span class="font-bold">Twitch</span>
        <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      </a>
      <a href="#" class="block w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-4 rounded-xl flex items-center justify-between transition">
        <span class="font-bold">YouTube</span>
      </a>
      <a href="#" class="block w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-4 rounded-xl flex items-center justify-between transition">
        <span class="font-bold">Discord Community</span>
      </a>
      <a href="#" class="block w-full bg-green-600 hover:bg-green-700 text-black p-4 rounded-xl font-bold transition">
        Partner Merch
      </a>
    </div>
  </div>
</div>`
  },

  // --- BUSINESS / FINTECH ---
  {
    id: "fintech-bank",
    name: "Modern Banking",
    category: "Business",
    description: "Trustworthy, clean, corporate design for finance apps.",
    html: `
<div class="bg-white min-h-screen font-sans text-slate-900">
  <nav class="flex items-center justify-between px-10 py-6">
    <div class="text-2xl font-bold text-slate-900 tracking-tight">NovaBank</div>
    <div class="hidden md:flex gap-8 text-sm font-medium text-slate-600">
      <a href="#">Personal</a>
      <a href="#">Business</a>
      <a href="#">Company</a>
    </div>
    <div class="flex gap-4">
      <button class="text-slate-900 font-medium">Log In</button>
      <button class="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition">Open Account</button>
    </div>
  </nav>

  <main class="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-16">
    <div class="flex-1">
      <h1 class="text-6xl font-bold tracking-tight leading-[1.1] mb-8">Banking built for <br> <span class="text-blue-600">builders.</span></h1>
      <p class="text-xl text-slate-500 mb-10 max-w-lg">Experience the future of finance with zero fees, instant transfers, and AI-powered insights.</p>
      <div class="flex gap-4">
        <button class="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200">Get Started</button>
        <button class="text-slate-600 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition border">View Demo</button>
      </div>
      <div class="mt-12 flex items-center gap-4 text-sm text-slate-500">
        <div class="flex -space-x-2">
          <div class="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>
          <div class="w-8 h-8 rounded-full bg-slate-300 border-2 border-white"></div>
          <div class="w-8 h-8 rounded-full bg-slate-400 border-2 border-white"></div>
        </div>
        <p>Trusted by 10,000+ companies</p>
      </div>
    </div>
    <div class="flex-1 bg-slate-100 rounded-[3rem] p-8 aspect-square relative overflow-hidden">
       <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-48 bg-slate-900 rounded-2xl shadow-2xl p-6 text-white flex flex-col justify-between rotate-[-6deg] hover:rotate-0 transition duration-500">
          <div class="flex justify-between">
            <div class="w-8 h-8 bg-white/20 rounded-full"></div>
            <span class="font-mono opacity-50">**** 4291</span>
          </div>
          <div>
            <p class="text-xs opacity-50 uppercase">Balance</p>
            <p class="text-2xl font-mono">$124,500.00</p>
          </div>
       </div>
    </div>
  </main>
</div>`
  },

  // --- E-COMMERCE ---
  {
    id: "fashion-store",
    name: "Luxury Fashion",
    category: "E-commerce",
    description: "Minimalist, image-heavy layout for clothing brands.",
    html: `
<div class="bg-stone-50 min-h-screen font-serif text-stone-900">
  <div class="bg-stone-900 text-white text-center text-xs py-2 uppercase tracking-widest">Free shipping on orders over $200</div>
  <nav class="flex justify-between items-center p-8">
    <button class="uppercase tracking-widest text-xs font-bold">Menu</button>
    <div class="text-2xl font-bold tracking-widest uppercase">Atelier</div>
    <button class="uppercase tracking-widest text-xs font-bold">Cart (0)</button>
  </nav>

  <header class="px-4 mb-20">
    <div class="relative h-[80vh] w-full overflow-hidden rounded-sm">
      <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80" class="absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 bg-black/10 flex flex-col items-center justify-center text-white">
        <h2 class="text-6xl md:text-8xl italic mb-6">Summer '26</h2>
        <button class="border border-white px-10 py-3 uppercase tracking-widest text-xs hover:bg-white hover:text-black transition">Shop Collection</button>
      </div>
    </div>
  </header>

  <section class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
    <div class="group cursor-pointer">
      <div class="aspect-[3/4] bg-stone-200 mb-4 overflow-hidden relative">
         <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80" class="object-cover w-full h-full group-hover:scale-105 transition duration-700" />
      </div>
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-lg font-medium">The Linen Blazer</h3>
          <p class="text-stone-500 text-sm">Italian Cotton</p>
        </div>
        <span class="text-lg">$280</span>
      </div>
    </div>
    <div class="group cursor-pointer md:mt-20">
      <div class="aspect-[3/4] bg-stone-200 mb-4 overflow-hidden relative">
         <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80" class="object-cover w-full h-full group-hover:scale-105 transition duration-700" />
      </div>
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-lg font-medium">Silk Evening Dress</h3>
          <p class="text-stone-500 text-sm">Midnight Blue</p>
        </div>
        <span class="text-lg">$450</span>
      </div>
    </div>
  </section>
</div>`
  }
];