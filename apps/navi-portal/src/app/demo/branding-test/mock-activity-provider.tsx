"use client";

import React, { createContext, useContext } from "react";

// Mock ActivityService class
class MockActivityService {
  calculateProgress() {
    return { completed: 0, total: 3, percentage: 0 };
  }

  emit() {
    // No-op for demo
  }

  canTransitionTo() {
    return true;
  }
}

// Mock context type matching the real ActivityProvider
interface MockActivityContextType {
  // Data
  activities: never[];
  activeActivity: null;

  // State
  isLoading: false;
  error: null;

  // UI-specific state
  visitedActivities: Set<string>;
  newActivities: Set<string>;

  // Actions (all no-ops for demo)
  setActiveActivity: (activityId: string) => void;
  markActivityAsViewed: (activityId: string) => void;
  refetchActivities: () => Promise<void>;
  completeActivity: (
    activityId: string,
    data: Record<string, unknown>,
    activityType?: string
  ) => Promise<void>;

  // Service instance
  service: MockActivityService;

  // Computed values
  progress: { completed: number; total: number; percentage: number };
}

const MockActivityContext = createContext<MockActivityContextType | null>(null);

interface MockActivityProviderProps {
  children: React.ReactNode;
}

export function MockActivityProvider({ children }: MockActivityProviderProps) {
  const mockService = new MockActivityService();

  const contextValue: MockActivityContextType = {
    // Data
    activities: [],
    activeActivity: null,

    // State
    isLoading: false,
    error: null,

    // UI-specific state
    visitedActivities: new Set(),
    newActivities: new Set(),

    // Actions (all no-ops for demo)
    setActiveActivity: () => {},
    markActivityAsViewed: () => {},
    refetchActivities: async () => {},
    completeActivity: async () => {},

    // Service instance
    service: mockService,

    // Computed values
    progress: mockService.calculateProgress(),
  };

  return (
    <MockActivityContext.Provider value={contextValue}>
      {children}
    </MockActivityContext.Provider>
  );
}

// Hook that matches the real useActivity hook
export function useActivity() {
  const context = useContext(MockActivityContext);
  if (!context) {
    throw new Error("useActivity must be used within a MockActivityProvider");
  }
  return context;
}
