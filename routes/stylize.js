// File: backend/routes/stylize.js
import express from "express";
import { Client } from "@gradio/client";
import { stylePrompts } from "../lib/style-prompts.js";
import { analyzeImageContent } from "../utils/image-analyzer.js";
import {
  createEnhancedPrompt,
  recommendStrength,
  recommendIterations,
} from "../utils/prompt-enhancer.js";

const router = express.Router();

function base64ToBuffer(dataUrl) {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid base64 string");
  return Buffer.from(matches[2], "base64");
}

async function processImage({
  imageInput,
  prompt = "fantasy landscape",
  iterations = 1,
  seed = 0,
  strength = 0.5,
}) {
  try {
    console.log("Connecting to Gradio app...");
    const app = await Client.connect("sweetpotatoman/SDXL-Turbo-Img2Img-CPU");

    const buffer = base64ToBuffer(imageInput);
    const blob = new Blob([buffer], { type: "image/png" });

    const result = await app.predict("/predict", [
      blob,
      prompt,
      iterations,
      seed,
      strength,
    ]);

    if (Array.isArray(result.data) && result.data[0]?.url) {
      const imageRes = await fetch(result.data[0].url);
      const arrayBuffer = await imageRes.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = imageRes.headers.get("content-type") || "image/png";
      const dataUrl = `data:${mimeType};base64,${base64}`;

      return {
        success: true,
        imageDataUrl: dataUrl,
        imageUrl: result.data[0].url,
      };
    }

    if (typeof result.data === "string") {
      const isDataUrl = result.data.startsWith("data:");
      return {
        success: true,
        imageDataUrl: isDataUrl
          ? result.data
          : `data:image/png;base64,${result.data}`,
      };
    }

    throw new Error("Unexpected API response");
  } catch (error) {
    console.error("❌ processImage error:", error);
    return {
      success: false,
      error: error.message || "Processing failed",
    };
  }
}

async function getRandomSeed() {
  try {
    const app = await Client.connect("sweetpotatoman/SDXL-Turbo-Img2Img-CPU");
    const result = await app.predict("/get_random_value", []);
    return result?.data
      ? parseInt(result.data.toString(), 10)
      : Math.floor(Math.random() * 1_000_000);
  } catch {
    return Math.floor(Math.random() * 1_000_000);
  }
}

router.post("/", async (req, res) => {
  try {
    const {
      imageData,
      style,
      iterations,
      strength,
      seed,
      enhanceBackground = true,
      fillEmptySpaces = true,
    } = req.body;

    if (!imageData || !style) {
      return res.status(400).json({
        success: false,
        error: "Missing image or style",
      });
    }

    if (!Object.keys(stylePrompts).includes(style)) {
      return res.status(400).json({
        success: false,
        error: "Invalid style option",
      });
    }

    const analysis = await analyzeImageContent(imageData);
    const prompt = createEnhancedPrompt(style, analysis, {
      enhanceBackground,
      fillEmptySpaces,
      addAtmosphericElements: true,
      preserveStyle: true,
    });

    const safeIterations = iterations ?? recommendIterations(analysis);
    const safeStrength = strength ?? recommendStrength(analysis);
    const finalSeed = seed ?? (await getRandomSeed());

    const result = await processImage({
      imageInput: imageData,
      prompt,
      iterations: Math.min(Math.max(safeIterations, 1), 5),
      seed: finalSeed,
      strength: Math.min(Math.max(safeStrength, 0.1), 1.0),
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    return res.json({
      success: true,
      styledImage: result.imageDataUrl,
      originalPrompt: prompt,
      parameters: {
        iterations: safeIterations,
        strength: safeStrength,
        seed: finalSeed,
      },
      analysis,
    });
  } catch (err) {
    console.error("❌ POST handler error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Unknown error",
    });
  }
});

router.post("/cancel", async (req, res) => {
  try {
    console.log("Received stylization cancellation request");
    return res.json({
      success: true,
      message: "Stylization cancellation requested",
    });
  } catch (error) {
    console.error("Error cancelling stylization:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Unknown error occurred",
    });
  }
});

export default router;
