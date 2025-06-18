import { describe, it, expect } from 'vitest';
import { validateBranding } from './validator';

describe('Branding Validator', () => {
  it('should validate valid branding with all optional fields', () => {
    const validBranding = {
      primary: '#FF6C4C',
      onPrimary: '#FFFFFF',
      background: '#FAFAFA',
      logoUrl: 'https://cdn.awell.health/logo.svg',
      faviconUrl: 'https://cdn.awell.health/favicon.ico',
      welcomeTitle: 'Welcome to Test Org',
      welcomeSubtitle: 'Your care journey starts here',
    };
    
    const result = validateBranding(validBranding);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.faviconUrl).toBe('https://cdn.awell.health/favicon.ico');
      expect(result.data.logoUrl).toBe('https://cdn.awell.health/logo.svg');
    }
  });
  
  it('should validate empty branding object', () => {
    const result = validateBranding({});
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid favicon URL', () => {
    const invalidBranding = {
      faviconUrl: 'not-a-url',
    };
    
    const result = validateBranding(invalidBranding);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('faviconUrl');
    }
  });
  
  it('should reject invalid logo URL', () => {
    const invalidBranding = {
      logoUrl: 'invalid-url',
    };
    
    const result = validateBranding(invalidBranding);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('logoUrl');
    }
  });
  
  it('should validate favicon with different protocols', () => {
    const validBrandings = [
      { faviconUrl: 'https://example.com/favicon.ico' },
      { faviconUrl: 'http://example.com/favicon.png' },
      { faviconUrl: 'https://cdn.example.com/assets/favicon.svg' },
    ];
    
    validBrandings.forEach(branding => {
      const result = validateBranding(branding);
      expect(result.success).toBe(true);
    });
  });
  
  it('should validate complete sunrise health branding', () => {
    const sunriseBranding = {
      primary: "#FF6C4C",
      onPrimary: "#FFFFFF",
      primaryHover: "#E95A3C",
      primaryDisabled: "#FFCFC4",
      secondary: "#004E7C",
      onSecondary: "#FFFFFF",
      background: "#FAFAFA",
      surface: "#FFFFFF",
      onSurface: "#1F1F1F",
      border: "#E0E0E0",
      logoUrl: "https://cdn.awell.health/sunrise-health/logo.svg",
      faviconUrl: "https://cdn.awell.health/sunrise-health/favicon.ico",
      welcomeTitle: "Welcome to Sunrise Health",
      welcomeSubtitle: "Your personalized care journey starts here",
    };
    
    const result = validateBranding(sunriseBranding);
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid CSS colors', () => {
    const invalidBranding = {
      primary: 'not-a-color',
    };
    
    const result = validateBranding(invalidBranding);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('primary');
    }
  });
}); 