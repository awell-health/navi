/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrandingService } from "./branding-service";
import { awellDefaultBranding } from "./defaults";

// Mock the storage dependencies
vi.mock("./storage/edge-store", () => ({
  edgeConfigBrandingStore: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn(),
    getAvailableOrgIds: vi.fn(),
  },
}));

vi.mock("./storage/kv-store", () => ({
  brandingStore: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn(),
    setMultiple: vi.fn(),
    getAllBranding: vi.fn(),
    getFontRegistry: vi.fn(),
    updateFontRegistry: vi.fn(),
  },
}));

describe("BrandingService", () => {
  let service: BrandingService;
  let mockEdgeStore: any;
  let mockKvStore: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    service = new BrandingService();

    // Get mocked instances
    const { edgeConfigBrandingStore } = await import("./storage/edge-store");
    const { brandingStore } = await import("./storage/kv-store");
    mockEdgeStore = edgeConfigBrandingStore;
    mockKvStore = brandingStore;
  });

  describe("getBrandingByOrgId", () => {
    it("should return empty object when orgId is empty", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const result = await service.getBrandingByOrgId("");

      expect(result).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(
        "🎨 No orgId provided, using empty branding"
      );

      consoleSpy.mockRestore();
    });

    it("should return empty object when orgId is null/undefined", async () => {
      const result1 = await service.getBrandingByOrgId(null as any);
      const result2 = await service.getBrandingByOrgId(undefined as any);

      expect(result1).toEqual({});
      expect(result2).toEqual({});
    });

    it("should return default branding when orgId is 'default'", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const result = await service.getBrandingByOrgId("default");

      expect(result).toEqual(awellDefaultBranding.branding);
      expect(consoleSpy).toHaveBeenCalledWith(
        "🎨 orgId is default, using default branding"
      );

      consoleSpy.mockRestore();
    });

    it("should handle Edge Config timeout gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      mockEdgeStore.get.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 100)
          )
      );

      const result = await service.getBrandingByOrgId("test-org");

      expect(result).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to fetch branding:",
        expect.any(Error)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "🎨 Falling back to empty branding due to error"
      );

      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it("should handle Edge Config network error gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      mockEdgeStore.get.mockRejectedValue(new Error("Network error"));

      const result = await service.getBrandingByOrgId("test-org");

      expect(result).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to fetch branding:",
        expect.any(Error)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "🎨 Falling back to empty branding due to error"
      );

      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it("should handle complete storage failure gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      mockEdgeStore.get.mockRejectedValue(new Error("Edge Config unavailable"));

      const result = await service.getBrandingByOrgId("test-org");

      expect(result).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to fetch branding:",
        expect.any(Error)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "🎨 Falling back to empty branding due to error"
      );

      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it("should handle corrupted branding data gracefully", async () => {
      const corruptedBranding = {
        primary: null,
        background: undefined,
        // Missing required structure
      };

      mockEdgeStore.get.mockResolvedValue(corruptedBranding);

      const result = await service.getBrandingByOrgId("test-org");
      expect(result).toEqual(corruptedBranding);
    });

    it("should fallback to KV when Edge Config returns null", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const kvBranding = { primary: "#from-kv" };

      mockEdgeStore.get.mockResolvedValue(null);
      mockKvStore.get.mockResolvedValue(kvBranding);

      const result = await service.getBrandingByOrgId("test-org");

      expect(result).toEqual(kvBranding);
      expect(consoleSpy).toHaveBeenCalledWith(
        "🔄 Branding not in Edge Config for test-org, trying KV store..."
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(
          /📊 Branding latency: \d+ms from KV Store for org: test-org/
        )
      );

      consoleSpy.mockRestore();
    });

    it("should measure and log performance correctly", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      mockEdgeStore.get.mockResolvedValue({ primary: "#edge" });

      await service.getBrandingByOrgId("test-org");

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(
          /📊 Branding latency: \d+ms from Edge Config for org: test-org/
        )
      );

      consoleSpy.mockRestore();
    });

    it("should warn about Edge Config latency exceeding budget", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Mock slow Edge Config response
      mockEdgeStore.get.mockImplementation(
        () =>
          new Promise(
            (resolve) => setTimeout(() => resolve({ primary: "#slow" }), 30) // 30ms > 20ms budget
          )
      );

      await service.getBrandingByOrgId("test-org");

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(
          /⚠️ Edge Config latency exceeded 20ms budget: \d+ms/
        )
      );

      consoleSpy.mockRestore();
    });
  });

  describe("setBrandingForOrg", () => {
    it("should throw error for empty orgId", async () => {
      await expect(service.setBrandingForOrg("", {})).rejects.toThrow(
        "Organization ID is required"
      );
    });

    it("should handle storage write failure gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockKvStore.set.mockRejectedValue(new Error("Write failed"));
      mockEdgeStore.set.mockRejectedValue(new Error("Write failed"));

      await expect(service.setBrandingForOrg("test-org", {})).rejects.toThrow(
        "Write failed"
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to set branding for test-org:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should successfully set branding in both stores", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const branding = { primary: "#test" };

      mockKvStore.set.mockResolvedValue(undefined);
      mockEdgeStore.set.mockResolvedValue(undefined);

      await expect(
        service.setBrandingForOrg("test-org", branding)
      ).resolves.toBeUndefined();

      expect(mockKvStore.set).toHaveBeenCalledWith("test-org", branding);
      expect(mockEdgeStore.set).toHaveBeenCalledWith("test-org", branding);
      expect(consoleSpy).toHaveBeenCalledWith(
        "🎨 Branding updated for: test-org (KV + Edge Config)"
      );

      consoleSpy.mockRestore();
    });

    it("should handle partial storage failure", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const branding = { primary: "#test" };

      // One store succeeds, one fails
      mockKvStore.set.mockResolvedValue(undefined);
      mockEdgeStore.set.mockRejectedValue(new Error("Edge Config unavailable"));

      await expect(
        service.setBrandingForOrg("test-org", branding)
      ).rejects.toThrow("Edge Config unavailable");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to set branding for test-org:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("deleteBrandingForOrg", () => {
    it("should handle empty orgId gracefully", async () => {
      await expect(service.deleteBrandingForOrg("")).resolves.toBeUndefined();
      expect(mockKvStore.delete).not.toHaveBeenCalled();
      expect(mockEdgeStore.delete).not.toHaveBeenCalled();
    });

    it("should handle storage delete failure gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockKvStore.delete.mockRejectedValue(new Error("Delete failed"));
      mockEdgeStore.delete.mockRejectedValue(new Error("Delete failed"));

      await expect(service.deleteBrandingForOrg("test-org")).rejects.toThrow(
        "Delete failed"
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to delete branding for test-org:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should successfully delete branding from both stores", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      mockKvStore.delete.mockResolvedValue(undefined);
      mockEdgeStore.delete.mockResolvedValue(undefined);

      await expect(
        service.deleteBrandingForOrg("test-org")
      ).resolves.toBeUndefined();

      expect(mockKvStore.delete).toHaveBeenCalledWith("test-org");
      expect(mockEdgeStore.delete).toHaveBeenCalledWith("test-org");
      expect(consoleSpy).toHaveBeenCalledWith(
        "🎨 Branding deleted for: test-org (KV + Edge Config, will use defaults)"
      );

      consoleSpy.mockRestore();
    });

    it("should handle partial storage failure during delete", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // One store succeeds, one fails
      mockKvStore.delete.mockResolvedValue(undefined);
      mockEdgeStore.delete.mockRejectedValue(
        new Error("Edge Config unavailable")
      );

      await expect(service.deleteBrandingForOrg("test-org")).rejects.toThrow(
        "Edge Config unavailable"
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to delete branding for test-org:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("hasCustomBranding", () => {
    it("should return false for empty orgId", async () => {
      const result = await service.hasCustomBranding("");
      expect(result).toBe(false);
    });

    it("should handle KV store check failure gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockKvStore.exists.mockRejectedValue(new Error("Check failed"));

      const result = await service.hasCustomBranding("test-org");

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to check branding existence for test-org:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should return true when branding exists", async () => {
      mockKvStore.exists.mockResolvedValue(true);

      const result = await service.hasCustomBranding("test-org");

      expect(result).toBe(true);
      expect(mockKvStore.exists).toHaveBeenCalledWith("test-org");
    });

    it("should return false when branding does not exist", async () => {
      mockKvStore.exists.mockResolvedValue(false);

      const result = await service.hasCustomBranding("test-org");

      expect(result).toBe(false);
    });
  });

  describe("importBranding", () => {
    it("should handle bulk import failure", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const brandingMap = { org1: {}, org2: {} };

      mockKvStore.setMultiple.mockRejectedValue(
        new Error("Bulk import failed")
      );

      await expect(service.importBranding(brandingMap)).rejects.toThrow(
        "Bulk import failed"
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to import branding:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should successfully import branding configurations", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const brandingMap = {
        org1: { primary: "#red" },
        org2: { primary: "#blue" },
      };

      mockKvStore.setMultiple.mockResolvedValue(undefined);

      await expect(
        service.importBranding(brandingMap)
      ).resolves.toBeUndefined();

      expect(mockKvStore.setMultiple).toHaveBeenCalledWith(brandingMap);
      expect(consoleSpy).toHaveBeenCalledWith(
        "🎨 Imported branding for 2 organizations"
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getBrandingInfo", () => {
    it("should return complete branding info with metadata", async () => {
      const customBranding = { primary: "#custom" };
      mockEdgeStore.get.mockResolvedValue(customBranding);
      mockKvStore.exists.mockResolvedValue(true);

      const result = await service.getBrandingInfo("test-org");

      expect(result).toEqual({
        branding: customBranding,
        orgId: "test-org",
        hasCustomBranding: true,
      });
    });

    it("should handle errors in metadata collection gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      mockEdgeStore.get.mockRejectedValue(new Error("Edge Config failed"));
      mockKvStore.exists.mockRejectedValue(new Error("Exists check failed"));

      const result = await service.getBrandingInfo("test-org");

      expect(result).toEqual({
        branding: {},
        orgId: "test-org",
        hasCustomBranding: false,
      });

      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it("should use default orgId for empty orgId input", async () => {
      mockEdgeStore.get.mockResolvedValue(null);
      mockKvStore.exists.mockResolvedValue(false);

      const result = await service.getBrandingInfo("");

      expect(result).toEqual({
        branding: {},
        orgId: awellDefaultBranding.orgId, // Should use the default orgId
        hasCustomBranding: false,
      });
    });

    it("should return branding from KV when Edge Config is empty", async () => {
      const kvBranding = { primary: "#from-kv" };
      mockEdgeStore.get.mockResolvedValue(null);
      mockKvStore.get.mockResolvedValue(kvBranding);
      mockKvStore.exists.mockResolvedValue(true);

      const result = await service.getBrandingInfo("test-org");

      expect(result).toEqual({
        branding: kvBranding,
        orgId: "test-org",
        hasCustomBranding: true,
      });
    });
  });

  // New tests for edge cases and additional functionality
  describe("Edge Cases and Error Handling", () => {
    it("should return empty branding when both stores fail", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      mockEdgeStore.get.mockRejectedValue(new Error("Edge Config timeout"));

      const result = await service.getBrandingByOrgId("test-org");

      expect(result).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to fetch branding:",
        expect.any(Error)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "🎨 Falling back to empty branding due to error"
      );

      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it("should handle null/undefined branding data gracefully", async () => {
      mockEdgeStore.get.mockResolvedValue(null);
      mockKvStore.get.mockResolvedValue(null);

      const result = await service.getBrandingByOrgId("test-org");

      expect(result).toEqual({});
    });

    it("should handle promise rejection in parallel operations", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Simulate one store succeeding and one failing during set operation
      mockKvStore.set.mockResolvedValue(undefined);
      mockEdgeStore.set.mockRejectedValue(new Error("API unavailable"));

      await expect(
        service.setBrandingForOrg("test-org", { primary: "#test" })
      ).rejects.toThrow("API unavailable");

      consoleSpy.mockRestore();
    });
  });
});
