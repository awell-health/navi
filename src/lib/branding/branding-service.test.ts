/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrandingService } from './branding-service';
import { awellDefaultBranding } from './defaults';

// Mock the storage dependencies
vi.mock('./storage/edge-store', () => ({
  edgeConfigBrandingStore: {
    get: vi.fn(),
    exists: vi.fn(),
  },
}));

vi.mock('./storage/kv-store', () => ({
  brandingStore: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn(),
    setMultiple: vi.fn(),
  },
}));

vi.mock('./sample-data', () => ({
  sampleBrandingData: {
    'test-org': { primary: '#test' },
  },
}));

describe('BrandingService', () => {
  let service: BrandingService;
  let mockEdgeStore: any;
  let mockKvStore: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    service = new BrandingService();
    
    // Get mocked instances
    const { edgeConfigBrandingStore } = await import('./storage/edge-store');
    const { brandingStore } = await import('./storage/kv-store');
    mockEdgeStore = edgeConfigBrandingStore;
    mockKvStore = brandingStore;
  });

  describe('getBrandingByOrgId', () => {
    it('should return defaults when orgId is empty', async () => {
      const result = await service.getBrandingByOrgId('');
      expect(result).toEqual(awellDefaultBranding.branding);
    });

    it('should return defaults when orgId is null/undefined', async () => {
      const result1 = await service.getBrandingByOrgId(null as any);
      const result2 = await service.getBrandingByOrgId(undefined as any);
      
      expect(result1).toEqual(awellDefaultBranding.branding);
      expect(result2).toEqual(awellDefaultBranding.branding);
    });

    it('should handle Edge Config timeout gracefully', async () => {
      mockEdgeStore.get.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );
      mockKvStore.get.mockResolvedValue(null);
      mockKvStore.exists.mockResolvedValue(false);

      const result = await service.getBrandingByOrgId('test-org');
      expect(result).toEqual(awellDefaultBranding.branding);
    });

    it('should handle Edge Config network error gracefully', async () => {
      mockEdgeStore.get.mockRejectedValue(new Error('Network error'));
      mockKvStore.get.mockResolvedValue(null);
      mockKvStore.exists.mockResolvedValue(false);

      const result = await service.getBrandingByOrgId('test-org');
      expect(result).toEqual(awellDefaultBranding.branding);
    });

    it('should handle KV store failure gracefully', async () => {
      mockEdgeStore.get.mockResolvedValue(null);
      mockKvStore.get.mockRejectedValue(new Error('KV unavailable'));
      mockKvStore.exists.mockRejectedValue(new Error('KV unavailable'));

      const result = await service.getBrandingByOrgId('test-org');
      expect(result).toEqual(awellDefaultBranding.branding);
    });

    it('should handle corrupted branding data gracefully', async () => {
      const corruptedBranding = {
        primary: null,
        background: undefined,
        // Missing required structure
      };
      
      mockEdgeStore.get.mockResolvedValue(corruptedBranding);

      const result = await service.getBrandingByOrgId('test-org');
      expect(result).toEqual(corruptedBranding);
    });

    it('should fallback to KV when Edge Config returns null', async () => {
      const kvBranding = { primary: '#from-kv' };
      
      mockEdgeStore.get.mockResolvedValue(null);
      mockKvStore.get.mockResolvedValue(kvBranding);
      mockKvStore.exists.mockResolvedValue(false); // For seeding

      const result = await service.getBrandingByOrgId('test-org');
      expect(result).toEqual(kvBranding);
    });

    it('should measure and log performance correctly', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      mockEdgeStore.get.mockResolvedValue({ primary: '#edge' });

      await service.getBrandingByOrgId('test-org');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/📊 Branding latency: \d+ms from Edge Config for org: test-org/)
      );
      
      consoleSpy.mockRestore();
    });

    it('should warn about Edge Config latency exceeding budget', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock slow Edge Config response
      mockEdgeStore.get.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({ primary: '#slow' }), 30) // 30ms > 20ms budget
        )
      );

      await service.getBrandingByOrgId('test-org');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/⚠️ Edge Config latency exceeded 20ms budget: \d+ms/)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('setBrandingForOrg', () => {
    it('should throw error for empty orgId', async () => {
      await expect(service.setBrandingForOrg('', {})).rejects.toThrow('Organization ID is required');
    });

    it('should handle KV store write failure', async () => {
      mockKvStore.set.mockRejectedValue(new Error('Write failed'));
      
      await expect(service.setBrandingForOrg('test-org', {})).rejects.toThrow('Write failed');
    });

    it('should successfully set branding', async () => {
      const branding = { primary: '#test' };
      mockKvStore.set.mockResolvedValue(undefined);
      
      await expect(service.setBrandingForOrg('test-org', branding)).resolves.toBeUndefined();
      expect(mockKvStore.set).toHaveBeenCalledWith('test-org', branding);
    });
  });

  describe('deleteBrandingForOrg', () => {
    it('should handle empty orgId gracefully', async () => {
      await expect(service.deleteBrandingForOrg('')).resolves.toBeUndefined();
      expect(mockKvStore.delete).not.toHaveBeenCalled();
    });

    it('should handle KV store delete failure gracefully', async () => {
      mockKvStore.delete.mockRejectedValue(new Error('Delete failed'));
      
      await expect(service.deleteBrandingForOrg('test-org')).rejects.toThrow('Delete failed');
    });
  });

  describe('hasCustomBranding', () => {
    it('should return false for empty orgId', async () => {
      const result = await service.hasCustomBranding('');
      expect(result).toBe(false);
    });

    it('should handle KV store check failure gracefully', async () => {
      mockKvStore.exists.mockRejectedValue(new Error('Check failed'));
      
      const result = await service.hasCustomBranding('test-org');
      expect(result).toBe(false);
    });
  });

  describe('importBranding', () => {
    it('should handle bulk import failure', async () => {
      const brandingMap = { 'org1': {}, 'org2': {} };
      mockKvStore.setMultiple.mockRejectedValue(new Error('Bulk import failed'));
      
      await expect(service.importBranding(brandingMap)).rejects.toThrow('Bulk import failed');
    });
  });

  describe('getBrandingInfo', () => {
    it('should return complete branding info with metadata', async () => {
      const customBranding = { primary: '#custom' };
      mockEdgeStore.get.mockResolvedValue(customBranding);
      mockKvStore.exists.mockResolvedValue(true);

      const result = await service.getBrandingInfo('test-org');
      
      expect(result).toEqual({
        branding: customBranding,
        orgId: 'test-org',
        hasCustomBranding: true,
      });
    });

    it('should handle errors in metadata collection gracefully', async () => {
      mockEdgeStore.get.mockRejectedValue(new Error('Edge Config failed'));
      mockKvStore.get.mockRejectedValue(new Error('KV failed'));
      mockKvStore.exists.mockRejectedValue(new Error('Exists check failed'));

      const result = await service.getBrandingInfo('test-org');
      
      expect(result).toEqual({
        branding: awellDefaultBranding.branding,
        orgId: 'test-org',
        hasCustomBranding: false,
      });
    });
  });
}); 