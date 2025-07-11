/**
 * Navi Loader - Customer SDK Script
 * Built with Turborepo + tsup
 */

interface NaviInstance {
  renderActivities: (containerId: string, options: RenderOptions) => NaviEmbedInstance;
}

interface RenderOptions {
  pathwayId: string;
  stakeholderId?: string;
  
  // For JWT creation - what we need from the customer
  organizationId?: string;  // Customer's org ID (for JWT aud claim)
  userId?: string;          // End user ID (for JWT sub claim)
  sessionId?: string;       // Session tracking
  
  // UI customization
  branding?: {
    primary?: string;
    secondary?: string;
    fontFamily?: string;
    logoUrl?: string;
  };
  
  // Iframe sizing - demonstrate different embed sizes
  size?: 'compact' | 'standard' | 'full' | 'custom';
  height?: number;  // Custom height in pixels
  width?: string;   // Custom width (e.g., '100%', '800px')
}

interface NaviEmbedInstance {
  destroy: () => void;
  iframe: HTMLIFrameElement;
  on: (event: string, callback: (data: any) => void) => void;
}

// Main loader class
class NaviLoader {
  private instances: Map<string, NaviEmbedInstance> = new Map();
  private eventHandlers: Map<string, Map<string, Function[]>> = new Map();
  
  constructor() {
    // Listen for messages from iframes
    window.addEventListener('message', this.handleMessage.bind(this));
  }
  
  createNavi(publishableKey: string): NaviInstance {
    return {
      renderActivities: (containerId: string, options: RenderOptions) => {
        return this.renderActivities(publishableKey, containerId, options);
      }
    };
  }
  
  private renderActivities(
    publishableKey: string,
    containerId: string,
    options: RenderOptions
  ): NaviEmbedInstance {
    const container = document.querySelector(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }
    
    // Generate unique instance ID
    const instanceId = `navi-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create iframe
    const iframe = this.createIframe(instanceId, publishableKey, options);
    
    // Create embed instance
    const instance: NaviEmbedInstance = {
      iframe,
      destroy: () => this.destroyInstance(instanceId),
      on: (event: string, callback: (data: any) => void) => {
        this.addEventListener(instanceId, event, callback);
      }
    };
    
    // Store instance
    this.instances.set(instanceId, instance);
    
    // Add to DOM
    container.appendChild(iframe);
    
    return instance;
  }
  
  private createIframe(
    instanceId: string,
    publishableKey: string,
    options: RenderOptions
  ): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    
    // Build embed URL - ALWAYS points to Navi portal origin (like Stripe)
    // Customer site: localhost:3001, Iframe: localhost:3000 (cross-origin!)
    const embedUrl = new URL(`http://localhost:3000/embed/${options.pathwayId}`);
    embedUrl.searchParams.set('pk', publishableKey);
    embedUrl.searchParams.set('instance_id', instanceId);
    
    // JWT creation parameters - what we'll need for real authentication
    if (options.organizationId) {
      embedUrl.searchParams.set('org_id', options.organizationId);
    }
    if (options.userId) {
      embedUrl.searchParams.set('user_id', options.userId);
    }
    if (options.sessionId) {
      embedUrl.searchParams.set('session_id', options.sessionId);
    }
    if (options.stakeholderId) {
      embedUrl.searchParams.set('stakeholder_id', options.stakeholderId);
    }
    
    if (options.branding) {
      embedUrl.searchParams.set('branding', JSON.stringify(options.branding));
    }
    
    // Configure iframe with size options
    iframe.src = embedUrl.toString();
    iframe.id = instanceId;
    
    // Apply sizing based on options
    const { width, height } = this.getIframeDimensions(options);
    
    iframe.style.cssText = `
      width: ${width};
      height: ${height};
      border: none;
      border-radius: 8px;
      transition: height 0.3s ease;
      background: #ffffff;
      display: block;
    `;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    
    return iframe;
  }
  
  private handleMessage(event: MessageEvent) {
    // Security: Only accept messages from Navi portal (cross-origin!)
    if (event.origin !== 'http://localhost:3000') {
      return;
    }
    
    const { source, instance_id, type, ...data } = event.data;
    
    // Only handle Navi messages
    if (source !== 'navi') {
      return;
    }
    
    const instance = this.instances.get(instance_id);
    if (!instance) {
      return;
    }
    
    // Handle specific message types
    switch (type) {
      case 'navi.height.changed':
        this.handleHeightChange(instance_id, data.height);
        break;
        
      case 'navi.ready':
      case 'navi.activity.loaded':
      case 'navi.activity.completed':
      case 'navi.pathway.completed':
      case 'navi.error':
        this.emitEvent(instance_id, type, data);
        break;
    }
  }
  
  private handleHeightChange(instanceId: string, height: number) {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.iframe.style.height = `${height}px`;
    }
  }
  
  private addEventListener(instanceId: string, event: string, callback: Function) {
    if (!this.eventHandlers.has(instanceId)) {
      this.eventHandlers.set(instanceId, new Map());
    }
    
    const handlers = this.eventHandlers.get(instanceId)!;
    if (!handlers.has(event)) {
      handlers.set(event, []);
    }
    
    handlers.get(event)!.push(callback);
  }
  
  private emitEvent(instanceId: string, type: string, data: any) {
    const handlers = this.eventHandlers.get(instanceId);
    if (!handlers || !handlers.has(type)) {
      return;
    }
    
    handlers.get(type)!.forEach(callback => {
      try {
        callback({ type, ...data });
      } catch (error) {
        console.error('Navi event handler error:', error);
      }
    });
  }
  
  private destroyInstance(instanceId: string) {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.iframe.remove();
      this.instances.delete(instanceId);
      this.eventHandlers.delete(instanceId);
    }
  }
  
  private getIframeDimensions(options: RenderOptions): { width: string; height: string } {
    // Custom dimensions
    if (options.size === 'custom') {
      return {
        width: options.width || '100%',
        height: `${options.height || 500}px`
      };
    }
    
    // Preset sizes for different use cases
    switch (options.size) {
      case 'compact':
        return { width: '100%', height: '300px' };
      case 'standard':
        return { width: '100%', height: '500px' };
      case 'full':
        return { width: '100%', height: '80vh' };
      default:
        return { width: '100%', height: '500px' }; // default to standard
    }
  }
}

// Initialize when script loads
(() => {
  // Prevent double loading
  if ((window as any).Navi) {
    return;
  }
  
  // Create global Navi function
  const loader = new NaviLoader();
  
  (window as any).Navi = function(publishableKey: string): NaviInstance {
    if (!publishableKey || !publishableKey.startsWith('pk_')) {
      throw new Error('Invalid publishable key. Must start with "pk_"');
    }
    
    return loader.createNavi(publishableKey);
  };
  
  // Add version and debug info
  (window as any).Navi.version = '1.0.0-poc';
  (window as any).Navi.debug = () => {
    console.log('🚀 Navi Loader initialized with Turborepo');
    console.log('📊 Active instances:', (loader as any).instances.size);
  };
  
  console.log('🚀 Navi Loader ready');
})(); 