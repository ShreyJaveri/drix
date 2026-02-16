import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function testConnection() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ Error: GEMINI_API_KEY is missing in .env.local");
    return;
  }

  console.log("🔑 Testing API Key:", apiKey.slice(0, 5) + "...");
  console.log("🤖 Target Model: gemini-2.5-flash");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Explicitly use the 2.5 model
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    console.log("✅ SUCCESS! Response:", response.text());
  } catch (error) {
    console.error("\n❌ FAILED. Error Details:");
    console.error("-------------------------");
    // This will print the raw error from Google
    console.error(error.message); 
    
    if (error.message.includes("429")) {
        console.error("👉 DIAGNOSIS: QUOTA EXHAUSTED. You have run out of free requests for today.");
    } else if (error.message.includes("404")) {
        console.error("👉 DIAGNOSIS: MODEL NOT FOUND. 'gemini-2.5-flash' might be mistyped or not enabled in your Google Cloud Project.");
    } else if (error.message.includes("403") || error.message.includes("API key not valid")) {
        console.error("👉 DIAGNOSIS: INVALID KEY. Check your API key in Google AI Studio.");
    }
  }
}

testConnection();