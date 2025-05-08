// File: backend/lib/style-prompts.js
// Migrated from lib/style-prompts.ts

/**
 * Available style options for the app
 * @typedef {'ghibli'|'anime'|'pixar'|'disney'|'realistic'|'watercolor'|'oil'|'vangogh'|'cyberpunk'} StyleOption
 */

/**
 * Base prompts for different art styles
 * These serve as the foundation for our enhanced prompts
 */
export const stylePrompts = {
  ghibli:
    "Create a Studio Ghibli style artwork with Ghibli's characteristic soft colors, magical atmosphere, and natural elements.",

  anime:
    "Transform this into anime-style digital art with clean lines, vibrant colors, and characteristic anime stylization.",

  pixar:
    "Create a Pixar-style 3D render with rich texturing, vibrant colors, and Pixar's characteristic lighting and dimensionality.",

  disney:
    "Transform this into a Disney animation style artwork with Disney's characteristic expressive features, rich colors, and magical atmosphere.",

  realistic:
    "Create a photorealistic digital painting with natural lighting, detailed textures, and realistic proportions while maintaining the original composition.",

  watercolor:
    "Transform this into a delicate watercolor painting with characteristic transparency, soft edges, gentle color bleeding, and visible paper texture.",

  oil: "Create an oil painting with rich textures, visible brushstrokes, deep colors, and classical composition techniques.",

  vangogh:
    "Transform this into Van Gogh's post-impressionist style with swirling patterns, bold brushwork, emotional color use, and distinctive stroke directionality.",

  cyberpunk:
    "Create a cyberpunk digital artwork with neon lighting, high tech-low life aesthetic, urban dystopian elements, and digital glitch effects.",
};
