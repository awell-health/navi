/**
 * Internal Organization Branding Interface
 *
 * Note: For external APIs and shared components, use BrandingConfig from navi-core.
 * This interface is for internal portal use and includes extended properties
 * for detailed theming that are not exposed in the public API.
 */
export interface OrgBranding {
  orgId: string;
  branding: {
    // Core palette
    primary?: string;
    onPrimary?: string;
    primaryHover?: string;
    primaryDisabled?: string;

    secondary?: string;
    onSecondary?: string;

    background?: string;
    surface?: string;
    onSurface?: string;
    border?: string;

    error?: string;
    onError?: string;
    success?: string;
    onSuccess?: string;

    // Typography - Font families
    fontFamilyBody?: string;
    fontFamilyHeading?: string;
    fontFamilyMono?: string;

    // Typography - Font sizes
    fontSizeXs?: string; // 0.75rem
    fontSizeSm?: string; // 0.875rem
    fontSizeBase?: string; // 1rem
    fontSizeLg?: string; // 1.125rem
    fontSizeXl?: string; // 1.25rem
    fontSize2xl?: string; // 1.5rem
    fontSize3xl?: string; // 1.875rem
    fontSize4xl?: string; // 2.25rem

    // Typography - Line heights
    lineHeightTight?: string; // 1.25
    lineHeightNormal?: string; // 1.5
    lineHeightRelaxed?: string; // 1.625

    // Typography - Font weights
    fontWeightNormal?: string; // 400
    fontWeightMedium?: string; // 500
    fontWeightSemibold?: string; // 600
    fontWeightBold?: string; // 700
    fontWeightExtrabold?: string; // 800

    // Radii
    radiusSm?: string;
    radiusMd?: string;
    radiusLg?: string;

    // Input tokens
    inputBackground?: string;
    inputText?: string;
    inputBorder?: string;
    inputBorderHover?: string;
    inputBorderFocus?: string;
    inputRadius?: string;

    // Button tokens
    buttonPaddingY?: string;
    buttonPaddingX?: string;
    buttonRadius?: string;

    // Control tokens
    controlBorder?: string;
    controlCheckedBg?: string;
    controlRadius?: string;

    // Shadow tokens
    shadowSm?: string;
    shadowMd?: string;

    // Spacing tokens
    stackSpacing?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

    // Component overrides
    navHeight?: string;

    // Welcome page customization
    logoUrl?: string;
    logoWidth?: string;
    logoHeight?: string;
    faviconUrl?: string;
    welcomeTitle?: string;
    welcomeSubtitle?: string;
  };
}

export interface ThemeTokens {
  // shadcn/ui compatible tokens
  "--primary": string;
  "--primary-foreground": string;
  "--secondary": string;
  "--secondary-foreground": string;
  "--background": string;
  "--foreground": string;
  "--card": string;
  "--card-foreground": string;
  "--popover": string;
  "--popover-foreground": string;
  "--muted": string;
  "--muted-foreground": string;
  "--accent": string;
  "--accent-foreground": string;
  "--destructive": string;
  "--destructive-foreground": string;
  "--border": string;
  "--input": string;
  "--ring": string;
  "--radius": string;

  // Custom tokens
  "--primary-dark"?: string;
  "--primary-disabled"?: string;
  "--shadow-sm"?: string;
  "--shadow-md"?: string;
  "--nav-height"?: string;
}
