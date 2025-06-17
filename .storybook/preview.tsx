import type { Preview } from '@storybook/react-vite'
import React, { useEffect } from 'react'
import '../src/app/globals.css'
import { generateThemeCSS } from '../src/lib/theme/generator'

// Load Google Fonts for healthcare themes
if (typeof document !== 'undefined') {
  const fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Source+Sans+Pro:wght@400;600;700&family=Merriweather:wght@400;700&display=swap';
  fontLink.rel = 'stylesheet';
  fontLink.id = 'storybook-fonts';
  
  // Remove existing font link if present
  const existingFontLink = document.getElementById('storybook-fonts');
  if (existingFontLink) {
    existingFontLink.remove();
  }
  
  document.head.appendChild(fontLink);
}

// Sample healthcare organization themes
const healthcareThemes = {
  'awell-default': null, // Uses default theme
  'sunrise-health': {
    primary: "#FF6C4C",
    onPrimary: "#FFFFFF", 
    primaryHover: "#E95A3C",
    background: "#FAFAFA",
    surface: "#FFFFFF",
    onSurface: "#1F1F1F",
    border: "#E0E0E0",
    error: "#D32F2F",
    onError: "#FFFFFF",
    success: "#1E8E3E",
    onSuccess: "#FFFFFF",
    fontFamilyBody: '"Inter", system-ui, sans-serif',
    fontFamilyHeading: '"Poppins", system-ui, sans-serif',
    radiusSm: "0px",
    radiusMd: "6px",
    radiusLg: "12px",
  },
  'techcorp': {
    primary: "#0F172A",
    onPrimary: "#F8FAFC", 
    primaryHover: "#1E293B",
    background: "#626677",
    surface: "#0F172A",
    onSurface: "#E2E8F0",
    border: "#334155",
    error: "#EF4444",
    onError: "#FFFFFF",
    success: "#10B981",
    onSuccess: "#FFFFFF",
    fontFamilyBody: '"JetBrains Mono", "SF Mono", "Monaco", monospace',
    fontFamilyHeading: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    radiusSm: "0px",
    radiusMd: "0px",
    radiusLg: "0px",
  },
  'healthcare-blue': {
    primary: "#1E40AF",
    onPrimary: "#FFFFFF",
    primaryHover: "#1D4ED8", 
    background: "#F8FAFC",
    surface: "#FFFFFF",
    onSurface: "#0F172A",
    border: "#CBD5E1",
    error: "#DC2626",
    onError: "#FFFFFF",
    success: "#059669",
    onSuccess: "#FFFFFF",
    fontFamilyBody: '"Source Sans Pro", system-ui, sans-serif',
    fontFamilyHeading: '"Merriweather", serif',
    radiusSm: "8px",
    radiusMd: "12px",
    radiusLg: "20px",
  }
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    layout: 'fullscreen',
    backgrounds: {
      disable: true, // Disable default backgrounds since we handle this with themes
    },
  },
  globalTypes: {
    theme: {
      name: 'Healthcare Theme',
      description: 'Switch between different healthcare organization themes',
      defaultValue: 'awell-default',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'awell-default', title: 'Awell Default', left: '🏥' },
          { value: 'sunrise-health', title: 'Sunrise Health', left: '🌅' },
          { value: 'techcorp', title: 'TechCorp Systems', left: '🏢' },
          { value: 'healthcare-blue', title: 'Healthcare Blue', left: '💙' },
        ],
        showName: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'awell-default';
      const branding = healthcareThemes[theme as keyof typeof healthcareThemes];
      
      useEffect(() => {
        // Remove existing theme
        const existingStyle = document.getElementById('storybook-theme');
        if (existingStyle) {
          existingStyle.remove();
        }
        
        // Apply new theme
        const themeCSS = generateThemeCSS(branding);
        const styleElement = document.createElement('style');
        styleElement.id = 'storybook-theme';
        styleElement.textContent = themeCSS;
        document.head.appendChild(styleElement);
        
        // Apply theme to body for background
        document.body.style.backgroundColor = 'var(--background)';
        document.body.style.color = 'var(--foreground)';
      }, [theme, branding]);
      
      return (
        <div style={{ 
          padding: '2rem',
          minHeight: '100vh',
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
          fontFamily: 'var(--font-body, system-ui, sans-serif)'
        }}>
          <Story />
        </div>
      );
    },
  ],
};

export default preview;