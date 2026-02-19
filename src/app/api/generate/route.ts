import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ProjectFile {
  name: string;
  content: string;
  type: string;
}

// Fallback models
const MODELS = ["gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.0-flash"] ;

export async function POST(req: Request) {
  try {
    const { prompt, currentFiles, activeFile } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY; 
    
    if (!apiKey) {
        return NextResponse.json({ message: "API Key is missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const files = currentFiles as ProjectFile[];
    const mainFile = files.find(f => f.name === "index.html") || files[0];
    const fileToEdit = files.find((f) => f.name === activeFile);
    
    const currentContent = fileToEdit ? fileToEdit.content : "";
    
    const styleReference = mainFile && mainFile.name !== activeFile 
        ? `\n\n--- STYLE REFERENCE (The Main Site: ${mainFile.name}) ---\n${mainFile.content.slice(0, 5000)}\n\n` 
        : "";

    // --- 🕹️ INTERACTIVE, RESPONSIVE & ALL-IN-ONE PROMPT ---
    const systemPrompt = `
      You are an expert **Full-Stack Creative Developer** specializing in **Tailwind CSS** and **Vanilla JavaScript**.
      
      **GOAL:** Create or Edit "${activeFile}" to be a fully interactive, responsive, single-file application.
      
      **CONTEXT (Current File Content):**
      \`\`\`html
      ${currentContent.slice(0, 10000)} 
      \`\`\`

      **STYLE REFERENCE (Match this design for consistency):**
      ${styleReference}

      **USER REQUEST:** "${prompt}"

      **🛠️ MANDATORY ARCHITECTURE RULES:**
      1. **ALL-IN-ONE:** Output a single HTML file with Tailwind (CDN) and Vanilla JS scripts embedded.
      2. **JAVASCRIPT INTERACTIVITY:** You MUST include a \`<script>\` tag before </body> to handle logic:
         - **Mobile Menus:** Always include a working hamburger menu toggle for mobile views.
         - **Modals/Tabs:** If the UI has tabs or popups, they must function using JS.
         - **Scroll Effects:** Use Intersection Observer for fade-in/slide-up animations.
         - **Gaming UI Logic:** Add hover listeners for "glow" effects or sound-visualizer placeholders.
      3. **MOBILE-FIRST RESPONSIVENESS:** - Use \`flex-col md:flex-row\` for layouts.
         - Use \`text-2xl md:text-5xl\` for scaling fonts.
         - Ensure the navigation bar does not disappear on mobile—it should transition into a toggleable menu.
      4. **DESIGN QUALITY:** Professional Gaming/SaaS UI. Use dark themes, high-contrast neon accents, glassmorphism (\`backdrop-blur\`), and 'Inter' font.

      **OUTPUT FORMAT:**
      Return ONLY the raw HTML code. Start with \`<!DOCTYPE html>\`. 
      No markdown blocks. No explanations.
    `;

    // Try models in sequence
    let text = "";
    let error = null;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        text = response.text();
        if (text) break; 
      } catch (err: any) {
        console.warn(`⚠️ Model ${modelName} failed:`, err.message);
        error = err;
      }
    }

    if (!text) throw error || new Error("All models failed.");

    // Cleanup Output
    let html = text.replace(/```html|```/g, "").trim();
    if (html.includes("<!DOCTYPE html>")) {
        html = html.substring(html.indexOf("<!DOCTYPE html>"));
    }

    return NextResponse.json({ html });

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ message: "Failed to generate." }, { status: 500 });
  }
}