import { Button } from '@/components/ui/button';
import { type OrgBranding } from '@/lib/branding/types';
import { awellDefaultBranding } from '@/lib/branding/defaults';

interface WelcomePageProps {
  branding: OrgBranding['branding'] | null;
  onContinue?: () => void;
}

export function WelcomePage({ branding, onContinue }: WelcomePageProps) {
  // Use branding values or fall back to defaults
  const logoUrl = branding?.logoUrl;
  const title = branding?.welcomeTitle || awellDefaultBranding.branding.welcomeTitle;
  const subtitle = branding?.welcomeSubtitle || awellDefaultBranding.branding.welcomeSubtitle;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Optional organization logo */}
        {logoUrl && (
          <div className="flex justify-center">
            <img 
              src={logoUrl} 
              alt="Organization Logo" 
              className="h-12 w-auto"
              onError={(e) => {
                // Hide image if it fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        
        {/* Welcome title */}
        <h1 className="text-3xl font-bold text-foreground">
          {title}
        </h1>
        
        {/* Welcome subtitle */}
        <p className="text-lg text-muted-foreground">
          {subtitle}
        </p>
        
        {/* Continue button - uses themed primary colors */}
        <div className="pt-4">
          <Button 
            size="lg" 
            className="w-full"
            onClick={onContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </main>
  );
}

// Server-side component for embedding in HTML
export function generateWelcomePageHTML(branding: OrgBranding['branding'] | null): string {
  const logoUrl = branding?.logoUrl;
  const title = branding?.welcomeTitle || awellDefaultBranding.branding.welcomeTitle;
  const subtitle = branding?.welcomeSubtitle || awellDefaultBranding.branding.welcomeSubtitle;

  return `
<main class="min-h-screen bg-background flex items-center justify-center p-4" style="min-height: 100vh; background-color: var(--background); display: flex; align-items: center; justify-content: center; padding: 1rem; font-family: var(--font-body, system-ui, sans-serif); font-size: var(--font-size-base, 1rem); line-height: var(--line-height-base, 1.5);">
  <div class="max-w-md w-full space-y-6 text-center" style="max-width: 28rem; width: 100%; text-align: center;">
    ${logoUrl ? `
    <div style="display: flex; justify-content: center; margin-bottom: 1.5rem;">
      <img 
        src="${logoUrl}" 
        alt="Organization Logo" 
        style="height: 3rem; width: auto; max-width: 200px;"
        onerror="this.style.display='none'"
        loading="eager"
      />
    </div>
    ` : ''}
    
    <h1 style="font-size: 2rem; font-weight: var(--font-weight-bold, 700); color: var(--foreground); margin-bottom: 1rem; font-family: var(--font-heading, var(--font-body, system-ui, sans-serif));">
      ${title}
    </h1>
    
    <p style="font-size: 1.125rem; color: var(--muted-foreground); margin-bottom: 2rem;">
      ${subtitle}
    </p>
    
    <div style="padding-top: 1rem;">
      <button 
        onclick="portalApp?.loadNextActivity()" 
        style="
          width: 100%;
          background-color: var(--primary);
          color: var(--primary-foreground);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius);
          font-size: 1rem;
          font-weight: var(--font-weight-bold, 500);
          cursor: pointer;
          transition: background-color 0.2s;
          font-family: var(--font-body, system-ui, sans-serif);
        "
        onmouseover="this.style.backgroundColor='var(--primary-hover, var(--primary))'"
        onmouseout="this.style.backgroundColor='var(--primary)'"
      >
        Continue
      </button>
    </div>
  </div>
</main>
  `.trim();
} 