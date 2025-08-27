"use client";
import type { Patient, Task } from "@medplum/fhirtypes";
import { Loader2 } from "lucide-react";
import { env } from "@/env";
import {
  fetchPatientByIdentifierAction,
  fetchPatientTasksAction,
} from "@/domains/medplum/actions";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

type MedplumContextType = {
  isLoading: boolean;
  error: Error | null;

  // Data access methods (delegated to store)
  getPatient: (patientId: string) => Promise<Patient>;
  getTasks: () => Promise<Task[]>;
  getTasksForPatient: (patientId: string) => Promise<Task[]>;
};

const MedplumContext = createContext<MedplumContextType | null>(null);

export function MedplumClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // No client-side Medplum client; use server API routes
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Multi-tab coordination
  useEffect(() => {
    // Create broadcast channel for multi-tab communication
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      broadcastChannelRef.current = new BroadcastChannel("medplum-auth");

      broadcastChannelRef.current.onmessage = (event) => {
        if (event.data.type === "AUTH_COMPLETED") {
          // No-op
        } else if (event.data.type === "AUTH_EXPIRED") {
          // No-op
        }
      };
    }

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, []);

  // Initialize loading state
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null); // Clear any previous errors
        const medplumBaseUrl = env.NEXT_PUBLIC_MEDPLUM_BASE_URL;
        if (!medplumBaseUrl) {
          setError(new Error("Medplum URLs not configured"));
          return;
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Failed to initialize"));
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const getPatient = useCallback(
    async (patientId: string) => {
      if (isLoading) {
        throw new Error("Medplum client is still initializing");
      }
      const patient = await fetchPatientByIdentifierAction(patientId);
      if (!patient) throw new Error("Patient not found");
      return patient;
    },
    [isLoading]
  );

  const getTasks = useCallback(async () => {
    if (isLoading) throw new Error("Medplum client is still initializing");
    return [];
  }, [isLoading]);

  const getTasksForPatient = useCallback(
    async (patientId: string) => {
      if (isLoading) throw new Error("Medplum client is still initializing");
      const tasks = await fetchPatientTasksAction(patientId);
      return tasks;
    },
    [isLoading]
  );

  const value = {
    isLoading,
    error,
    getPatient,
    getTasks,
    getTasksForPatient,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2
          className="h-8 w-8 text-blue-500 animate-spin mb-2"
          aria-label="Setting up connections for Medplum..."
        />
      </div>
    );
  }

  return (
    <MedplumContext.Provider value={value}>{children}</MedplumContext.Provider>
  );
}

export function useMedplum() {
  const context = useContext(MedplumContext);
  if (!context) {
    throw new Error("useMedplum must be used within a MedplumProvider");
  }
  return context;
}
