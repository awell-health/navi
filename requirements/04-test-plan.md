# Branding & Theming Prototype - Test Guide

## 🎯 What This Prototype Demonstrates

✅ **Single-Request Theming**: Magic link returns HTML with theme CSS inlined  
✅ **Custom Branding**: Sunrise Health sample org theming applied  
✅ **Welcome Page**: Themed customer welcome screen with logo, title, subtitle, button  
✅ **Performance**: Sub-1000ms FCP with themed components  
✅ **Fallback**: Graceful fallback to Awell default theme  

## 🚀 How to Test

### 1. Start the Dev Server
```bash
pnpm dev
```

### 2. Generate Fresh Test Tokens
```bash
pnpm run generate-tokens
```

This will output **three different magic links** with fresh tokens (valid for 5 minutes):

### 3. Test Sunrise Health (Bright & Friendly)
Use the **🌅 SUNRISE HEALTH** link from the token output.

**What You'll See:**
- 🎨 **Bright Orange Theme**: Primary color `#FF6C4C`, light backgrounds
- 🔤 **Custom Fonts**: Inter (body) + Poppins (headings) from Google Fonts
- 📝 **Custom Copy**: "Welcome to Sunrise Health"
- 🖼️ **Organization Logo**: Sunrise Health branding
- 🎛️ **Debug Panel**: Shows "Custom (sunrise-health)" applied

### 4. Test TechCorp (Dark & Professional)
Use the **🏢 TECHCORP SYSTEMS** link from the token output.

**What You'll See:**
- 🌙 **Dark Theme**: Navy background `#020617`, slate surfaces
- 🔤 **Monospace Font**: JetBrains Mono (body) + Inter (headings)
- 📝 **Tech Copy**: "Welcome to TechCorp Systems"
- 🎨 **Indigo Accents**: Bright indigo secondary color
- 🎛️ **Debug Panel**: Shows "Custom (techcorp)" applied

### 5. Test Default Fallback (Awell)
Use the **🔧 DEFAULT FALLBACK** link from the token output.

**What You'll See:**
- 🎨 **Clean Blue Theme**: Default blue primary (`#1d4ed8`)
- 🔤 **System Fonts**: No custom fonts, uses system defaults
- 📝 **Generic Copy**: "Welcome to your care journey"
- 🚫 **No Logo**: No organization branding
- 🎛️ **Debug Panel**: Shows "Default (Awell)" fallback

### 5. Test Continue Button
Click the **Continue** button to see:
- ✅ **Success Screen**: Confirms theming worked
- 📊 **Prototype Status**: Shows implementation checklist
- 🎨 **Themed Success UI**: Uses same CSS variables

## 🔍 What to Inspect

### Browser DevTools - Elements Tab
1. **Inlined Theme CSS**: Look for `<style id="awell-theme">` in `<head>`
2. **CSS Variables**: Check `:root` contains custom values like `--primary: #FF6C4C`
3. **No Separate Requests**: Network tab shows only the initial magic link request

### Browser DevTools - Network Tab
1. **Single Request**: Only one request to `/magic/[token]`
2. **Inlined CSS**: No separate stylesheet requests for theming
3. **Fast Response**: Initial request should be <100ms

### Console Logs
1. **Theme Applied**: Look for "🎨 Theme applied: Custom (sunrise-health)"
2. **Portal Initialized**: Confirms successful theming integration

## 🎨 Branding Configuration

The sample org branding is defined in `src/lib/edge-config.ts`:

```typescript
const sampleOrgBranding = {
  primary: "#FF6C4C",           // Orange primary color
  onPrimary: "#FFFFFF",         // White text on primary
  background: "#FAFAFA",        // Light gray background
  welcomeTitle: "Welcome to Sunrise Health",
  welcomeSubtitle: "Your personalized care journey starts here",
  logoUrl: "https://cdn.awell.health/sunrise-health/logo.svg",
  // ... 50+ more design tokens
};
```

## ✅ Success Criteria Validation

- **Performance**: FCP includes fully themed UI (no flash of unstyled content)
- **Single Request**: No separate API calls for theming  
- **CSS Variables**: All components use `var(--token)` syntax
- **Fallback**: Works gracefully when org branding missing
- **shadcn/ui**: Button component properly themed with custom colors

## 🚀 Next Steps

After validating the prototype:
1. **Performance Testing**: Lighthouse CI validation
2. **Real Edge Config**: Replace mock with Vercel Edge Config
3. **Additional Components**: Add more shadcn/ui components
4. **Theme Publishing**: Implement theme-publish.js script
5. **Production Magic Links**: Connect to real session/JWT system

## 🛠️ Implementation Details

- **Magic Link Route**: `/src/app/magic/[token]/route.ts`
- **Theme System**: `/src/lib/theme/` utilities
- **Welcome Component**: `/src/components/welcome/welcome-page.tsx` 
- **Edge Config Mock**: `/src/lib/edge-config.ts`
- **Tests**: `/src/lib/theme/generator.test.ts` 