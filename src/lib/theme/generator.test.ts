import { describe, it, expect } from 'vitest';
import { generateThemeCSS, brandingToTokens } from './generator';
import { awellDefaultTheme } from './defaults';

describe('Theme Generator', () => {
  it('should generate default theme CSS when no branding provided', () => {
    const css = generateThemeCSS(null);
    
    expect(css).toContain(':root {');
    expect(css).toContain('--primary: #1d4ed8');
    expect(css).toContain('--background: #ffffff');
    expect(css).toContain('}');
  });
  
  it('should apply custom branding over defaults', () => {
    const customBranding = {
      primary: '#FF6C4C',
      onPrimary: '#FFFFFF',
      background: '#FAFAFA',
    };
    
    const tokens = brandingToTokens(customBranding);
    
    expect(tokens['--primary']).toBe('#FF6C4C');
    expect(tokens['--primary-foreground']).toBe('#FFFFFF');
    expect(tokens['--background']).toBe('#FAFAFA');
    
    // Should keep default values for non-specified tokens
    expect(tokens['--secondary']).toBe(awellDefaultTheme['--secondary']);
  });
  
  it('should handle variable references in radius values', () => {
    const customBranding = {
      radiusMd: '6px', // Simple value
    };
    
    const tokens = brandingToTokens(customBranding);
    expect(tokens['--radius']).toBe('6px');
  });
  
  it('should generate sample org branding correctly', () => {
    const sampleBranding = {
      primary: '#FF6C4C',
      onPrimary: '#FFFFFF',
      background: '#FAFAFA',
      surface: '#FFFFFF',
      onSurface: '#1F1F1F',
      border: '#E0E0E0',
      welcomeTitle: 'Welcome to Sunrise Health',
    };
    
    const css = generateThemeCSS(sampleBranding);
    
    expect(css).toContain('--primary: #FF6C4C');
    expect(css).toContain('--background: #FAFAFA');
    expect(css).toContain('--border: #E0E0E0');
  });
}); 