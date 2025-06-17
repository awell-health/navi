'use server';

import { cookies } from 'next/headers';
import { cache } from 'react';
import { sessionStore } from '@/lib/session-store';
import { getBrandingByOrgId } from '@/lib/edge-config';
import { generateThemeCSS } from '@/lib/theme/generator';
import { awellDefaultBranding } from '@/lib/theme/defaults';
import type { OrgBranding } from '@/lib/theme/types';

interface BrandingResult {
  themeCSS: string;
  orgId: string;
  hasCustomBranding: boolean;
  branding: OrgBranding['branding'] | null;
}

// Cached server action for branding data
export const getBrandingAction = cache(async (): Promise<BrandingResult> => {
  console.log('🎨 Server Action: Fetching branding data...');
  
  try {
    // Get session from cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('awell.sid');
    
    let branding: OrgBranding['branding'] | null = null;
    let orgId = awellDefaultBranding.orgId;
    let hasCustomBranding = false;

    if (sessionCookie) {
      console.log('🔍 Server Action: Looking up session:', sessionCookie.value);
      
      // Get session data
      const session = await sessionStore.get(sessionCookie.value);
      
      if (session) {
        console.log('✅ Server Action: Session found, fetching branding for org:', session.orgId);
        branding = await getBrandingByOrgId(session.orgId);
        orgId = session.orgId;
        hasCustomBranding = !!branding;
      } else {
        console.log('⚠️  Server Action: Session not found in store, using default branding');
      }
    } else {
      console.log('⚠️  Server Action: No session cookie found, using default branding');
    }

    // If no custom branding, use defaults
    if (!branding) {
      console.log('🎨 Server Action: Using default branding');
      branding = awellDefaultBranding.branding;
      hasCustomBranding = false;
      orgId = awellDefaultBranding.orgId;
    }

    // Generate theme CSS (just the CSS, not wrapped in <style> tags)
    const themeCSS = generateThemeCSS(branding);

    console.log('📤 Server Action: Returning branding data:', { 
      orgId, 
      hasCustomBranding,
      cssLength: themeCSS.length 
    });

    return {
      themeCSS,
      orgId,
      hasCustomBranding,
      branding
    };

  } catch (error) {
    console.error('❌ Server Action: Error fetching branding:', error);
    
    // Even on error, return default branding (just CSS, not wrapped in <style>)
    const defaultThemeCSS = generateThemeCSS(awellDefaultBranding.branding);
    
    return {
      themeCSS: defaultThemeCSS,
      orgId: awellDefaultBranding.orgId,
      hasCustomBranding: false,
      branding: awellDefaultBranding.branding
    };
  }
});