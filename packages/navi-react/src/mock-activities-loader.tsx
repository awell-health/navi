import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavi } from './navi-provider';

export function MockActivitiesLoader() {
  const { publishableKey, pathwayId, branding, isLoading, error } = useNavi();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [events, setEvents] = useState<Array<{ type: string; data: any; timestamp: Date }>>([]);
  const [instanceId] = useState(() => `navi-${Math.random().toString(36).substr(2, 9)}`);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  const addEvent = (type: string, data: any) => {
    setEvents(prev => [...prev, { type, data, timestamp: new Date() }]);
  };

  // Build iframe URL with all parameters - memoized to prevent reloads
  // Must be called at top level before any conditional returns
  const embedUrl = useMemo(() => {
    if (!pathwayId || !publishableKey) return '';
    
    const url = new URL(`http://localhost:3000/embed/${pathwayId}`);
    url.searchParams.set('pk', publishableKey);
    url.searchParams.set('instance_id', instanceId);
    
    // Add mock JWT parameters for demonstration
    url.searchParams.set('org_id', 'org_awell_health');
    url.searchParams.set('user_id', 'user_patient_123');
    url.searchParams.set('session_id', sessionId);
    url.searchParams.set('stakeholder_id', 'stakeholder_demo');
    
    if (branding) {
      url.searchParams.set('branding', JSON.stringify(branding));
    }
    
    return url.toString();
  }, [pathwayId, publishableKey, instanceId, sessionId, branding]);

  useEffect(() => {
    // Listen for messages from iframe
    const handleMessage = (event: MessageEvent) => {
      // Security: Only accept messages from Navi portal
      if (event.origin !== 'http://localhost:3000') {
        return;
      }

      const { source, instance_id, type, ...data } = event.data;
      
      // Only handle Navi messages for this instance
      if (source !== 'navi' || instance_id !== instanceId) {
        return;
      }

      addEvent(type, data);

      // Handle specific message types
      switch (type) {
        case 'navi.height.changed':
          if (iframeRef.current && data.height) {
            iframeRef.current.style.height = `${data.height}px`;
          }
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [instanceId]);

  if (isLoading) {
    return (
      <div style={{ 
        padding: '2rem', 
        fontFamily: branding?.fontFamily || 'Inter, sans-serif',
        textAlign: 'center',
        color: branding?.secondary || '#64748b'
      }}>
        🔄 Loading Navi SDK...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '2rem', 
        fontFamily: branding?.fontFamily || 'Inter, sans-serif',
        color: '#ef4444',
        backgroundColor: '#fee2e2',
        borderRadius: '8px',
        border: '1px solid #fecaca'
      }}>
        <h3>❌ Error loading Navi SDK</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: branding?.fontFamily || 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#f8fafc',
        padding: '1rem',
        borderRadius: '8px 8px 0 0',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <h3 style={{ 
          margin: 0,
          color: branding?.primary || '#3b82f6',
          fontSize: '1.1rem'
        }}>
          🚀 Navi React SDK - Iframe Integration
        </h3>
        <p style={{
          margin: '0.5rem 0 0 0',
          fontSize: '0.875rem',
          color: branding?.secondary || '#64748b'
        }}>
          React component creating iframe to: <code>localhost:3000/embed/{pathwayId}</code>
        </p>
      </div>

      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        style={{
          width: '100%',
          height: '500px',
          border: 'none',
          borderRadius: '0 0 8px 8px',
          backgroundColor: '#ffffff',
          transition: 'height 0.3s ease'
        }}
        title="Navi Activities"
      />

      {/* Events Log */}
      {events.length > 0 && (
        <div style={{
          marginTop: '1rem',
          backgroundColor: '#f1f5f9',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #cbd5e1'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <h4 style={{ 
              margin: 0,
              color: branding?.primary || '#3b82f6',
              fontSize: '1rem'
            }}>
              📡 Iframe Events ({events.length})
            </h4>
            <button
              onClick={() => setEvents([])}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#e2e8f0',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>
          
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            fontSize: '0.75rem'
          }}>
            {events.slice(-5).map((event, index) => (
              <div key={index} style={{
                padding: '0.5rem',
                backgroundColor: '#ffffff',
                marginBottom: '0.25rem',
                borderRadius: '4px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.25rem'
                }}>
                  <span style={{ 
                    fontWeight: 'bold',
                    color: branding?.primary || '#3b82f6'
                  }}>
                    {event.type}
                  </span>
                  <span style={{ color: '#6b7280' }}>
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <pre style={{
                  margin: 0,
                  fontSize: '0.7rem',
                  color: '#374151',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {JSON.stringify(event.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 