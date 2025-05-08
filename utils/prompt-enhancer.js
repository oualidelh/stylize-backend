// File: backend/utils/prompt-enhancer.js
// Migrated from utils/prompt-enhancer.ts

import { stylePrompts } from "../lib/style-prompts.js";

/**
 * Options for enhancing prompts
 */
const defaultOptions = {
  enhanceBackground: true,
  fillEmptySpaces: true,
  addAtmosphericElements: true,
  preserveStyle: true,
  enhanceColors: true,
  enhanceDetails: true,
};

/**
 * Creates an enhanced prompt based on image analysis and selected style
 *
 * @param {string} style - The style option selected by the user
 * @param {object} analysis - The results of image content analysis
 * @param {object} options - Options for prompt enhancement
 * @returns {string} Enhanced prompt for the image model
 */
export function createEnhancedPrompt(style, analysis, options = {}) {
  // Get the base prompt for the selected style from imported stylePrompts
  const basePrompt = stylePrompts[style];

  // Set default options if not provided
  const {
    enhanceBackground = true,
    fillEmptySpaces = true,
    addAtmosphericElements = true,
    preserveStyle = true,
    enhanceColors = true,
    enhanceDetails = true,
  } = { ...defaultOptions, ...options };

  // Storage for prompt enhancements
  const enhancements = [];

  // Enhance based on main subject
  if (analysis.mainSubject && enhanceDetails) {
    switch (analysis.mainSubject) {
      case "tree":
        enhancements.push(
          `Enhance the tree with detailed ${style}-style foliage, textured bark, and natural proportions.`
        );
        break;
      case "person":
        enhancements.push(
          `Create a detailed ${style}-style character with appropriate clothing, facial features, and posture.`
        );
        break;
      case "water":
        enhancements.push(
          `Render detailed ${style}-style water with appropriate reflections, movement, and transparency effects.`
        );
        break;
      case "landscape":
        enhancements.push(
          `Create a detailed ${style}-style landscape with appropriate terrain features, vegetation, and perspective.`
        );
        break;
      case "object":
        enhancements.push(
          `Enhance the main object with detailed ${style}-style textures, lighting, and dimensionality.`
        );
        break;
    }
  }

  // Background enhancement based on detected elements
  if (enhanceBackground) {
    // If the image is mostly empty with just a sketch, create appropriate background
    if (analysis.emptiness > 0.6) {
      let backgroundPrompt = "";

      if (analysis.hasTree) {
        backgroundPrompt += `Create a cohesive ${style}-style natural environment around the tree - `;

        if (style === "ghibli") {
          backgroundPrompt +=
            "with rolling hills, wildflowers, and a dreamy sky with distinctive clouds. ";
        } else if (style === "anime") {
          backgroundPrompt +=
            "with distinctive anime-style grass, stone path, and dramatic sky with clouds. ";
        } else if (style === "cyberpunk") {
          backgroundPrompt +=
            "contrasting the natural element with futuristic city elements, neon lights, and technological details. ";
        } else {
          backgroundPrompt +=
            "with grass, path, other vegetation, and an appropriate sky. ";
        }
      } else if (analysis.hasPerson) {
        backgroundPrompt += `Create a contextually appropriate ${style}-style environment for the character - `;

        if (style === "cyberpunk") {
          backgroundPrompt +=
            "with neon city streets, technological elements, and atmospheric urban details. ";
        } else if (style === "anime" || style === "ghibli") {
          backgroundPrompt +=
            "with natural or urban elements that complement the character. ";
        } else {
          backgroundPrompt += "that establishes a clear setting and mood. ";
        }
      } else if (analysis.hasWater) {
        backgroundPrompt += `Expand the water into a complete ${style}-style aquatic scene with shore, sky, and complementary elements. `;
      } else {
        backgroundPrompt += `Add a contextually appropriate ${style}-style background that complements the existing elements. `;
      }

      enhancements.push(backgroundPrompt);
    }
    // If the image already has some background but needs enhancement
    else if (!analysis.hasBackground && analysis.emptiness > 0.3) {
      enhancements.push(
        `Enhance the existing elements with a complementary ${style}-style background that creates a complete scene.`
      );
    }
  }

  // Fill empty spaces with contextual elements
  if (fillEmptySpaces && analysis.emptiness > 0.3) {
    enhancements.push(
      `Fill all empty white spaces with contextually appropriate ${style}-style elements that complement the drawing.`
    );

    if (analysis.drawingComplexity === "simple") {
      enhancements.push(
        `Add complementary ${style}-style details and secondary elements to create a richer scene while preserving the original drawing's intent.`
      );
    }
  }

  // Add atmospheric elements based on style
  if (addAtmosphericElements) {
    switch (style) {
      case "ghibli":
        enhancements.push(
          "Add Ghibli's characteristic atmospheric elements - magical particles, gentle wind effects, and soft lighting."
        );
        break;
      case "anime":
        enhancements.push(
          "Include anime-style atmospheric effects like light rays, gentle wind patterns, and subtle environmental particles."
        );
        break;
      case "cyberpunk":
        enhancements.push(
          "Add cyberpunk atmospheric elements like digital particles, scanning lines, fog, and multiple colored light sources."
        );
        break;
      case "vangogh":
        enhancements.push(
          "Include Van Gogh's characteristic swirling sky patterns, dynamic brush movement, and emotional color contrasts."
        );
        break;
      case "realistic":
        enhancements.push(
          "Add realistic atmospheric effects like depth haze, natural shadows, and authentic lighting conditions."
        );
        break;
      default:
        enhancements.push(
          `Add appropriate ${style}-style atmospheric elements and lighting effects.`
        );
    }
  }

  // Color enhancement
  if (enhanceColors && analysis.dominantColors.length > 0) {
    // Extract dominant colors for color scheme guidance
    const colorList = analysis.dominantColors.join(", ").replace(/#/g, "");

    if (style === "vangogh" || style === "oil") {
      enhancements.push(
        `Use a harmonious color palette building from the drawing's existing colors (${colorList}) with rich, expressive color contrasts.`
      );
    } else if (style === "cyberpunk") {
      enhancements.push(
        `Use a neon-dominated color scheme with blues, purples, and hot pinks that complements the drawing's existing colors (${colorList}).`
      );
    } else {
      enhancements.push(
        `Use a harmonious color palette that builds from and complements the drawing's existing colors (${colorList}).`
      );
    }
  }

  // Ensure the style is preserved and dominant
  if (preserveStyle) {
    enhancements.push(
      `Ensure the entire image maintains a consistent ${style} visual style throughout all elements.`
    );
  }

  // Combine all enhancements with the base prompt
  const enhancedPrompt = basePrompt + " " + enhancements.join(" ");

  return enhancedPrompt;
}

/**
 * Analyzes line thickness and drawing complexity to customize strength parameter
 *
 * @param {object} analysis - The results of image content analysis
 * @returns {number} Recommended strength value between 0.1-1.0
 */
export function recommendStrength(analysis) {
  // Base strength - higher preserves more of the original drawing
  let strength = 0.7;

  // Adjust based on line weight - lighter lines need more transformation
  if (analysis.lineWeight === "light") {
    strength += 0.1; // More transformation to make light lines visible
  } else if (analysis.lineWeight === "heavy") {
    strength -= 0.1; // Less transformation to preserve distinct heavy lines
  }

  // Adjust based on drawing complexity
  if (analysis.drawingComplexity === "simple") {
    strength += 0.1; // Simple drawings need more transformation to look complete
  } else if (analysis.drawingComplexity === "complex") {
    strength -= 0.1; // Complex drawings need less transformation to preserve details
  }

  // Adjust based on emptiness - emptier images need more transformation
  if (analysis.emptiness > 0.7) {
    strength += 0.1; // More transformation for very empty images
  }

  // Ensure within bounds
  return Math.min(Math.max(strength, 0.3), 0.9);
}

/**
 * Analyzes drawing complexity to recommend iterations
 *
 * @param {object} analysis - The results of image content analysis
 * @returns {number} Recommended iterations value between 1-5
 */
export function recommendIterations(analysis) {
  // Base iterations
  let iterations = 2;

  // Adjust based on complexity
  if (analysis.drawingComplexity === "simple") {
    iterations = 3; // Simple drawings need more iterations
  } else if (analysis.drawingComplexity === "complex") {
    iterations = 2; // Complex drawings need fewer iterations to preserve details
  }

  // Adjust based on emptiness
  if (analysis.emptiness > 0.7) {
    iterations += 1; // Very empty images need more iterations
  }

  return iterations;
}
