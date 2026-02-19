export interface Template {
  id: string;
  name: string;
  category: "Business" | "Modern" | "Dashboard" | "Authentication" | "Blog" | "Slide Show";
  description: string;
  html: string;
}

export const TEMPLATES: Template[] = [
  // --- BUSINESS ---
  { id: "b1", name: "Stripe-style Landing Page", category: "Business", description: "Clean, high-trust landing page with sleek gradients and diagonal sections.", html: "" },
  { id: "b2", name: "Apple-esque Product Reveal", category: "Business", description: "Massive typography, deep blacks, and focus on high-quality product imagery.", html: "" },
  { id: "b3", name: "Linear-style Marketing", category: "Business", description: "Dark mode, ultra-crisp borders, glowing accents, and extreme minimalism.", html: "" },
  { id: "b4", name: "Shopify-style Storefront", category: "Business", description: "Conversion-optimized retail layout with clear calls to action and trust badges.", html: "" },

  // --- MODERN ---
  { id: "m1", name: "Vercel-style API Docs", category: "Modern", description: "Monochrome, developer-focused documentation layout with code blocks.", html: "" },
  { id: "m2", name: "Arc Browser Bento Grid", category: "Modern", description: "Playful, asymmetric bento-box grid with heavy border radii and soft shadows.", html: "" },
  { id: "m3", name: "Notion-style Workspace", category: "Modern", description: "Absolute minimalism, black-on-white text focus, and infinite canvas feel.", html: "" },
  { id: "m4", name: "Raycast-inspired UI", category: "Modern", description: "Keyboard-first, command-palette style floating interfaces.", html: "" },

  // --- DASHBOARD ---
  { id: "d1", name: "Supabase-style Admin", category: "Dashboard", description: "Dark mode admin panel with sidebar routing, tables, and system status.", html: "" },
  { id: "d2", name: "Plaid-style Financial Data", category: "Dashboard", description: "Data-heavy layout focused on metrics, line charts, and transaction lists.", html: "" },
  { id: "d3", name: "Trello-inspired Kanban", category: "Dashboard", description: "Drag-and-drop style horizontal scrolling columns for project management.", html: "" },
  { id: "d4", name: "Datadog Server Metrics", category: "Dashboard", description: "High-density data grid for monitoring active processes and server health.", html: "" },

  // --- AUTHENTICATION ---
  { id: "a1", name: "Auth0-style Login Modal", category: "Authentication", description: "Centered frosted glass login modal over a blurred background.", html: "" },
  { id: "a2", name: "Clerk-style Split Screen", category: "Authentication", description: "50% branding graphic, 50% clean, highly-accessible login form.", html: "" },
  { id: "a3", name: "GitHub-style Simple Auth", category: "Authentication", description: "No-nonsense, highly secure-looking centered box with social providers.", html: "" },

  // --- BLOG ---
  { id: "bl1", name: "Medium-style Reading", category: "Blog", description: "Narrow single-column layout optimized purely for typography and readability.", html: "" },
  { id: "bl2", name: "Substack Newsletter", category: "Blog", description: "Author-focused layout with sticky subscribe bars and related posts.", html: "" },
  { id: "bl3", name: "Dev.to Tech Blog", category: "Blog", description: "Tag-heavy, comment-focused layout designed for developer communities.", html: "" },

  // --- SLIDE SHOW ---
  { id: "s1", name: "Netflix-style Carousel", category: "Slide Show", description: "Horizontal scrolling media showcase with hover-to-expand effects.", html: "" },
  { id: "s2", name: "Airbnb-style Image Grid", category: "Slide Show", description: "Sleek, interactive image gallery for showcasing properties or portfolios.", html: "" },
  { id: "s3", name: "Apple Event 3D Flow", category: "Slide Show", description: "Cover-flow style 3D overlapping slide transitions for high-impact presentations.", html: "" },
];