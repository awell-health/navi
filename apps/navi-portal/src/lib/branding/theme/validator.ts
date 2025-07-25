import { z } from "zod";

// CSS color validation regex (hex, rgb, hsl, named colors)
const cssColorSchema = z
  .string()
  .regex(
    /^(#[0-9A-Fa-f]{3,8}|rgb\(.*\)|rgba\(.*\)|hsl\(.*\)|hsla\(.*\)|oklch\(.*\)|[a-zA-Z]+)$/,
    "Invalid CSS color format"
  );

// CSS unit validation (px, rem, em, %, etc.)
const cssUnitSchema = z
  .string()
  .regex(
    /^[0-9]*\.?[0-9]+(px|rem|em|%|vh|vw|pt|pc|in|cm|mm|ex|ch|lh|vmin|vmax)$/,
    "Invalid CSS unit format"
  );

// Font family validation
const fontFamilySchema = z.string().min(1).max(200);

// URL validation
const urlSchema = z.string().url().optional();

export const brandingSchema = z.object({
  // Core palette
  primary: cssColorSchema.optional(),
  onPrimary: cssColorSchema.optional(),
  primaryHover: cssColorSchema.optional(),
  primaryDisabled: cssColorSchema.optional(),

  secondary: cssColorSchema.optional(),
  onSecondary: cssColorSchema.optional(),

  background: cssColorSchema.optional(),
  surface: cssColorSchema.optional(),
  onSurface: cssColorSchema.optional(),
  border: cssColorSchema.optional(),

  error: cssColorSchema.optional(),
  onError: cssColorSchema.optional(),
  success: cssColorSchema.optional(),
  onSuccess: cssColorSchema.optional(),

  // Typography
  fontFamilyBody: fontFamilySchema.optional(),
  fontFamilyHeading: fontFamilySchema.optional(),
  fontWeightBold: z.string().optional(),
  fontSizeBase: cssUnitSchema.optional(),
  lineHeightBase: z.string().optional(),

  // Radii
  radiusSm: cssUnitSchema.optional(),
  radiusMd: cssUnitSchema.optional(),
  radiusLg: cssUnitSchema.optional(),

  // Input tokens
  inputBackground: cssColorSchema.optional(),
  inputText: cssColorSchema.optional(),
  inputBorder: cssColorSchema.optional(),
  inputBorderHover: cssColorSchema.optional(),
  inputBorderFocus: cssColorSchema.optional(),
  inputRadius: cssUnitSchema.optional(),

  // Button tokens
  buttonPaddingY: cssUnitSchema.optional(),
  buttonPaddingX: cssUnitSchema.optional(),
  buttonRadius: cssUnitSchema.optional(),

  // Control tokens
  controlBorder: cssColorSchema.optional(),
  controlCheckedBg: cssColorSchema.optional(),
  controlRadius: cssUnitSchema.optional(),

  // Shadow tokens
  shadowSm: z.string().optional(),
  shadowMd: z.string().optional(),

  // Spacing tokens
  space1: cssUnitSchema.optional(),
  space2: cssUnitSchema.optional(),
  space3: cssUnitSchema.optional(),
  space4: cssUnitSchema.optional(),

  // Component overrides
  navHeight: cssUnitSchema.optional(),

  // Welcome page customization
  logoUrl: urlSchema,
  faviconUrl: urlSchema,
  welcomeTitle: z.string().max(100).optional(),
  welcomeSubtitle: z.string().max(200).optional(),
});

export const orgBrandingSchema = z.object({
  orgId: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z0-9\-_]+$/, "Invalid orgId format"),
  branding: brandingSchema,
});

export type ValidatedBranding = z.infer<typeof brandingSchema>;
export type ValidatedOrgBranding = z.infer<typeof orgBrandingSchema>;

export function validateBranding(
  data: unknown
):
  | { success: true; data: ValidatedBranding }
  | { success: false; error: string } {
  try {
    const result = brandingSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return { success: false, error: errorMessages };
    }
    return { success: false, error: "Unknown validation error" };
  }
}

export function validateOrgBranding(
  data: unknown
):
  | { success: true; data: ValidatedOrgBranding }
  | { success: false; error: string } {
  try {
    const result = orgBrandingSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return { success: false, error: errorMessages };
    }
    return { success: false, error: "Unknown validation error" };
  }
}
