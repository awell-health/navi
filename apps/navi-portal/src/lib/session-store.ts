import { kv } from '@vercel/kv';
import type { SessionData } from '@/lib/auth/internal/types';

export class SessionStore {
  async set(sessionId: string, sessionData: SessionData): Promise<void> {
    try {
      await kv.set(`session:${sessionId}`, sessionData, { ex: 86400 }); // 24h TTL
      console.log('💾 Session stored (KV):', sessionId);
    } catch (error) {
      console.error('❌ Failed to store session in KV:', error);
      throw error;
    }
  }

  async get(sessionId: string): Promise<SessionData | null> {
    try {
      const sessionData = await kv.get(`session:${sessionId}`) as SessionData | null;
      
      if (!sessionData) {
        console.log('🔍 Session not found (KV):', sessionId);
        return null;
      }

      // Optional backup check for expiration (KV TTL should handle this)
      if (new Date(sessionData.expiresAt).getTime() < Date.now()) {
        console.log('⏰ Session expired (KV):', sessionId);
        await this.delete(sessionId);
        return null;
      }

      console.log('✅ Session retrieved (KV):', sessionId);
      return sessionData;
    } catch (error) {
      console.error('❌ Failed to retrieve session from KV:', error);
      return null;
    }
  }

  async delete(sessionId: string): Promise<void> {
    try {
      await kv.del(`session:${sessionId}`);
      console.log('🗑️  Session deleted (KV):', sessionId);
    } catch (error) {
      console.error('❌ Failed to delete session from KV:', error);
    }
  }

  // Get all active sessions (for debugging - simplified for development)
  async getAllSessions(): Promise<Record<string, SessionData>> {
    console.warn('⚠️  getAllSessions is limited in KV store - use for debugging only');
    return {};
  }

  // Clean up not needed with KV (TTL handles it automatically)
  cleanup(): void {
    console.log('🧹 KV cleanup not needed (TTL handles expiration)');
  }
}

// Export singleton instance
export const sessionStore = new SessionStore();

// For backward compatibility with the Map interface
export const sessions = {
  set: (sessionId: string, sessionData: SessionData) => sessionStore.set(sessionId, sessionData),
  get: (sessionId: string) => sessionStore.get(sessionId),
  delete: (sessionId: string) => sessionStore.delete(sessionId),
  has: async (sessionId: string) => (await sessionStore.get(sessionId)) !== null,
}; 