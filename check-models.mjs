import fs from 'fs';
import path from 'path';
import https from 'https';

// 1. Get the API Key from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
let apiKey = null;

try {
  const envFile = fs.readFileSync(envPath, 'utf8');
  // Regex to find GEMINI_API_KEY="xyz" or GEMINI_API_KEY=xyz
  const match = envFile.match(/GEMINI_API_KEY\s*=\s*"?([^"\r\n]+)"?/);
  if (match) apiKey = match[1];
} catch (err) {
  console.error("❌ Error reading .env.local file. Make sure it exists!");
  process.exit(1);
}

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY not found in .env.local");
  process.exit(1);
}

console.log(`🔑 Using Key: ${apiKey.slice(0, 10)}...`);

// 2. Fetch the list of models from Google
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => { data += chunk; });

  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error(`\n❌ API Error (${res.statusCode}):`);
      console.error(data);
      return;
    }

    const response = JSON.parse(data);
    const models = response.models || [];

    // Filter for "generateContent" models (the ones you can use for chat)
    const chatModels = models
      .filter(m => m.supportedGenerationMethods.includes("generateContent"))
      .map(m => m.name.replace("models/", ""));

    console.log("\n✅ AVAILABLE MODELS FOR YOUR KEY:");
    console.log("---------------------------------");
    chatModels.forEach(name => console.log(`• ${name}`));
    console.log("---------------------------------");
    
    // Check if your desired model is there
    if (chatModels.includes("gemini-2.5-flash")) {
      console.log("🎉 GOOD NEWS: gemini-2.5-flash IS available!");
    } else {
      console.log("⚠️ BAD NEWS: gemini-2.5-flash is NOT in this list.");
      console.log("👉 Please update your route.ts to use one of the models listed above.");
    }
  });

}).on('error', (err) => {
  console.error("Network Error:", err.message);
});