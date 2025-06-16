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
    
    // Typography
    fontFamilyBody?: string;
    fontFamilyHeading?: string;
    fontWeightBold?: string;
    fontSizeBase?: string;
    lineHeightBase?: string;
    
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
    space1?: string;
    space2?: string;
    space3?: string;
    space4?: string;
    
    // Component overrides
    navHeight?: string;
    
    // Welcome page customization
    logoUrl?: string;
    welcomeTitle?: string;
    welcomeSubtitle?: string;
  };
}

export interface ThemeTokens {
  // shadcn/ui compatible tokens
  '--primary': string;
  '--primary-foreground': string;
  '--secondary': string;
  '--secondary-foreground': string;
  '--background': string;
  '--foreground': string;
  '--card': string;
  '--card-foreground': string;
  '--popover': string;
  '--popover-foreground': string;
  '--muted': string;
  '--muted-foreground': string;
  '--accent': string;
  '--accent-foreground': string;
  '--destructive': string;
  '--destructive-foreground': string;
  '--border': string;
  '--input': string;
  '--ring': string;
  '--radius': string;
  
  // Custom tokens
  '--primary-hover'?: string;
  '--shadow-sm'?: string;
  '--shadow-md'?: string;
  '--nav-height'?: string;
} 