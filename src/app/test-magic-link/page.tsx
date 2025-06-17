import Link from 'next/link';
import { Metadata } from 'next';
import { encryptToken } from '@/lib/auth/internal/session';
import type { TokenData } from '@/lib/auth/internal/types';

// Add metadata for better performance
export const metadata: Metadata = {
  title: 'Magic Link Test - Awell Health',
  description: 'Test page for magic link authentication performance testing',
  robots: 'noindex, nofollow', // Prevent indexing of test page
};

export default async function TestMagicLinkPage() {
  // Generate a valid token (expires in 10 minutes)
  const validPayload: TokenData = {
    patientId: 'test-patient-lighthouse',
    careflowId: 'test-careflow-lighthouse',
    orgId: 'test-org-lighthouse',
    tenantId: 'test-tenant-lighthouse',
    environment: 'test',
    exp: Date.now() + (10 * 60 * 1000) // 10 minutes from now
  };
  
  const validToken = await encryptToken(validPayload);
  
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      margin: 0,
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <h1>🔗 Magic Link Test Page</h1>
        <p>This page is used for Lighthouse CI testing of the magic link functionality.</p>
        
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <h2>✅ Valid Magic Link</h2>
          <p>Click the link below to test the magic link authentication:</p>
          <Link 
            href={`/magic/${validToken}`}
            prefetch={false}
            style={{
              display: 'inline-block',
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              textDecoration: 'none',
              borderRadius: '4px',
              marginTop: '10px',
              fontWeight: 500
            }}
          >
            Test Magic Link Authentication
          </Link>
        </div>
        
        <div style={{
          backgroundColor: '#fff3cd',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #ffeaa7'
        }}>
          <h2>ℹ️ About This Test</h2>
          <ul>
            <li>The magic link above contains a valid token</li>
            <li>It expires in 10 minutes from when this page was rendered</li>
            <li>Clicking it should show a &quot;Hello, Patient!&quot; page</li>
            <li>Invalid/expired tokens return 400 status codes</li>
            <li><strong>Performance:</strong> Link prefetching is disabled for optimal LCP</li>
          </ul>
        </div>
        
        <div style={{
          backgroundColor: '#d1ecf1',
          padding: '1rem',
          borderRadius: '4px',
          border: '1px solid #bee5eb'
        }}>
          <h2>📊 For Lighthouse CI</h2>
          <p>This page allows Lighthouse CI to:</p>
          <ul>
            <li>Measure performance of the initial page load</li>
            <li>Test accessibility of the link elements</li>
            <li>Verify the magic link flow works end-to-end</li>
            <li>Monitor LCP without interference from prefetch requests</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 