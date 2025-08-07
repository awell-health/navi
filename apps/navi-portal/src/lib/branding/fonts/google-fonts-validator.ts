/**
 * Google Fonts API Validation Module
 *
 * Provides comprehensive validation against the official Google Fonts API data,
 * including support for variable fonts, weight validation, and style checking.
 */

import googleFontsData from "./google-fonts-api.json";

/**
 * Google Fonts API data structure
 */
interface GoogleFontData {
  weights: string[];
  styles: string[];
  subsets: string[];
  axes?: Array<{
    tag: string;
    min: number;
    max: number;
    defaultValue: number;
  }>;
}

/**
 * Type-safe access to Google Fonts API data
 */
const GOOGLE_FONTS_API: Record<string, GoogleFontData> = googleFontsData;

/**
 * Get all available Google Font family names
 */
export function getAvailableGoogleFonts(): string[] {
  return Object.keys(GOOGLE_FONTS_API);
}

/**
 * Check if a font family is available in Google Fonts
 */
export function isValidGoogleFont(fontFamily: string): boolean {
  return fontFamily in GOOGLE_FONTS_API;
}

/**
 * Get font metadata for a specific Google Font
 */
export function getGoogleFontData(fontFamily: string): GoogleFontData | null {
  return GOOGLE_FONTS_API[fontFamily] || null;
}

/**
 * Check if a font supports variable weights
 */
export function supportsVariableWeight(fontFamily: string): boolean {
  const fontData = getGoogleFontData(fontFamily);
  return fontData?.weights.includes("variable") || false;
}

/**
 * Get available weights for a font (excluding 'variable')
 */
export function getAvailableWeights(fontFamily: string): string[] {
  const fontData = getGoogleFontData(fontFamily);
  if (!fontData) return [];

  return fontData.weights.filter((weight) => weight !== "variable");
}

/**
 * Get available styles for a font
 */
export function getAvailableStyles(fontFamily: string): string[] {
  const fontData = getGoogleFontData(fontFamily);
  return fontData?.styles || [];
}

/**
 * Validate a weight array against available weights for a font
 */
export function validateWeights(
  fontFamily: string,
  weights: string[]
): {
  valid: string[];
  invalid: string[];
} {
  const fontData = getGoogleFontData(fontFamily);
  if (!fontData) {
    return { valid: [], invalid: weights };
  }

  const availableWeights = fontData.weights;
  const valid: string[] = [];
  const invalid: string[] = [];

  weights.forEach((weight) => {
    if (availableWeights.includes(weight)) {
      valid.push(weight);
    } else {
      invalid.push(weight);
    }
  });

  return { valid, invalid };
}

/**
 * Validate a style array against available styles for a font
 */
export function validateStyles(
  fontFamily: string,
  styles: string[]
): {
  valid: string[];
  invalid: string[];
} {
  const fontData = getGoogleFontData(fontFamily);
  if (!fontData) {
    return { valid: [], invalid: styles };
  }

  const availableStyles = fontData.styles;
  const valid: string[] = [];
  const invalid: string[] = [];

  styles.forEach((style) => {
    if (availableStyles.includes(style)) {
      valid.push(style);
    } else {
      invalid.push(style);
    }
  });

  return { valid, invalid };
}

/**
 * Get fallback weights for fonts that don't support variable weight
 */
export function getFallbackWeights(fontFamily: string): string[] {
  const availableWeights = getAvailableWeights(fontFamily);

  // Prefer common weights if available
  const preferredWeights = ["400", "700"];
  const fallbacks: string[] = [];

  preferredWeights.forEach((weight) => {
    if (availableWeights.includes(weight)) {
      fallbacks.push(weight);
    }
  });

  // If none of the preferred weights are available, use the first available weights
  if (fallbacks.length === 0 && availableWeights.length > 0) {
    fallbacks.push(availableWeights[0]);
  }

  return fallbacks;
}

/**
 * Comprehensive font configuration validation
 */
export function validateFontConfig(
  fontFamily: string,
  weights: string[],
  styles: string[]
): {
  isValid: boolean;
  normalizedFontFamily: string;
  validatedWeights: string[];
  validatedStyles: string[];
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Normalize font family name (handle underscores)
  const normalizedFontFamily = fontFamily.replace(/_/g, " ");

  // Check if font exists
  if (!isValidGoogleFont(normalizedFontFamily)) {
    errors.push(
      `Font "${normalizedFontFamily}" is not available in Google Fonts`
    );
    return {
      isValid: false,
      normalizedFontFamily,
      validatedWeights: [],
      validatedStyles: [],
      errors,
      warnings,
    };
  }

  // Validate weights
  let finalWeights = weights;
  if (weights.includes("variable")) {
    if (!supportsVariableWeight(normalizedFontFamily)) {
      warnings.push(
        `Font "${normalizedFontFamily}" does not support variable weights, falling back to standard weights`
      );
      finalWeights = getFallbackWeights(normalizedFontFamily);
    } else {
      finalWeights = ["variable"]; // Use only variable if supported
    }
  } else {
    const weightValidation = validateWeights(normalizedFontFamily, weights);
    if (weightValidation.invalid.length > 0) {
      errors.push(
        `Invalid weights for "${normalizedFontFamily}": ${weightValidation.invalid.join(
          ", "
        )}`
      );
    }
    finalWeights = weightValidation.valid;
  }

  // Validate styles
  const styleValidation = validateStyles(normalizedFontFamily, styles);
  if (styleValidation.invalid.length > 0) {
    errors.push(
      `Invalid styles for "${normalizedFontFamily}": ${styleValidation.invalid.join(
        ", "
      )}`
    );
  }
  const finalStyles = styleValidation.valid;

  // Ensure we have at least some valid configuration
  if (finalWeights.length === 0) {
    errors.push(`No valid weights available for "${normalizedFontFamily}"`);
  }

  if (finalStyles.length === 0) {
    errors.push(`No valid styles available for "${normalizedFontFamily}"`);
  }

  return {
    isValid: errors.length === 0,
    normalizedFontFamily,
    validatedWeights: finalWeights,
    validatedStyles: finalStyles,
    errors,
    warnings,
  };
}

/**
 * Get total count of available Google Fonts
 */
export function getGoogleFontsCount(): number {
  return Object.keys(GOOGLE_FONTS_API).length;
}

/**
 * Search for fonts by name (case-insensitive partial matching)
 */
export function searchGoogleFonts(query: string, limit = 10): string[] {
  const normalizedQuery = query.toLowerCase();
  return getAvailableGoogleFonts()
    .filter((font) => font.toLowerCase().includes(normalizedQuery))
    .slice(0, limit);
}
