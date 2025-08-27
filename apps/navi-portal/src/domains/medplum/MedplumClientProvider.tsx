"use client";
import { MedplumStoreClient } from "./medplum-client";
import { MedplumClient } from "@medplum/core";
import type { Patient, Task } from "@medplum/fhirtypes";
import { Loader2 } from "lucide-react";
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

  // TODO: Replace these temporary values with actual Stytch auth when available
  // For now, using environment variables or hardcoded values for testing
  const medplumClientId =
    process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_ID || "your-medplum-client-id";

  // DANGER: This is a temporary secret in client code for testing. Do not use in production.
  const medplumSecret =
    process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_SECRET ||
    "your-medplum-client-secret";

  // Commented out for testing without Stytch auth - uncomment when Stytch is ready
  // const { medplumClientId, medplumSecret } = useAuthentication();

  const [medplumClient, setMedplumClient] = useState<MedplumStoreClient | null>(
    null
  );

  // Refs to store cleanup functions
  const unsubscribeRef = useRef<{ patients?: () => void; tasks?: () => void }>(
    {}
  );
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const clientRef = useRef<MedplumClient | null>(null);

  // Multi-tab coordination
  useEffect(() => {
    // Create broadcast channel for multi-tab communication
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      broadcastChannelRef.current = new BroadcastChannel("medplum-auth");

      broadcastChannelRef.current.onmessage = (event) => {
        if (event.data.type === "AUTH_COMPLETED") {
          console.log(
            "MedplumProvider: Auth completed in another tab, reusing token"
          );
          // Another tab completed authentication, try to reuse the token
          const { token, clientId, clientSecret } = event.data.payload;
          if (clientId === medplumClientId && clientSecret === medplumSecret) {
            // Reuse the authentication from the other tab
            clientRef.current?.setAccessToken(token);
          }
        } else if (event.data.type === "AUTH_EXPIRED") {
          console.log(
            "MedplumProvider: Auth expired in another tab, clearing token"
          );
          setMedplumClient(null);
        }
      };
    }

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, [medplumClientId, medplumSecret]);

  // Initialize Medplum client and store
  useEffect(() => {
    const initializeMedplumClient = async () => {
      try {
        setIsLoading(true);
        setError(null); // Clear any previous errors
        const medplumBaseUrl = process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL;
        const medplumWsBaseUrl = process.env.NEXT_PUBLIC_MEDPLUM_WS_BASE_URL;

        if (!medplumBaseUrl || !medplumWsBaseUrl) {
          console.error(
            "Medplum base URL or Medplum WebSocket base URL is not set",
            medplumBaseUrl,
            medplumWsBaseUrl
          );
          setError(new Error("Medplum URLs not configured"));
          return;
        }

        // TODO: Remove this check when proper auth is implemented
        // Check if we have valid credentials (not placeholder values)
        if (
          !medplumClientId ||
          medplumClientId === "your-medplum-client-id" ||
          !medplumSecret ||
          medplumSecret === "your-medplum-client-secret"
        ) {
          setError(new Error("Medplum credentials not configured"));
          return;
        }

        console.log(
          "Initializing Medplum client with baseUrl:",
          medplumBaseUrl
        );

        // Only create new client if we don't have one
        if (!clientRef.current) {
          clientRef.current = new MedplumClient({
            baseUrl: medplumBaseUrl,
            cacheTime: 10000,
          });
          if (!clientRef.current.isAuthenticated()) {
            await clientRef.current.startClientLogin(
              medplumClientId,
              medplumSecret
            );
          } else {
            console.log(
              "MedplumProvider: Client already authenticated, skipping login"
            );
          }
        }

        if (
          clientRef.current &&
          clientRef.current.getActiveLogin()?.profile?.reference !==
            `ClientApplication/${medplumClientId}`
        ) {
          console.log(
            "MedplumProvider: Reauthenticating in a different client login",
            medplumClientId
          );
          await clientRef.current.startClientLogin(
            medplumClientId,
            medplumSecret
          );
        }

        console.log("Creating Medplum store...");
        const store = new MedplumStoreClient(
          clientRef.current,
          medplumWsBaseUrl
        );
        await store.initialize(medplumClientId, medplumSecret);
        console.log("Medplum store initialized successfully");
        setMedplumClient(store);
      } catch (error) {
        console.error("Failed to initialize Medplum store:", error);
        setError(
          error instanceof Error
            ? error
            : new Error("Failed to initialize Medplum store")
        );
      } finally {
        setIsLoading(false);
      }
    };

    // TODO: Restore original auth condition when Stytch is ready
    // Original condition: if (medplumClientId && medplumSecret) {
    if (
      medplumClientId &&
      medplumSecret &&
      medplumClientId !== "your-medplum-client-id" &&
      medplumSecret !== "your-medplum-client-secret"
    ) {
      initializeMedplumClient();
    } else {
      // TODO: Remove when proper auth is implemented
      // If we don't have valid credentials, stop loading
      setIsLoading(false);
    }
  }, [medplumClientId, medplumSecret]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      // Unregister panel data store from medplumClient listeners

      if (unsubscribeRef.current.patients) {
        unsubscribeRef.current.patients();
        unsubscribeRef.current.patients = undefined;
      }
      if (unsubscribeRef.current.tasks) {
        unsubscribeRef.current.tasks();
        unsubscribeRef.current.tasks = undefined;
      }
    };
  }, []);

  const getPatient = useCallback(
    async (patientId: string) => {
      // TODO: Remove debugging when issue is resolved
      console.log("getPatient called - Debug info:", {
        isLoading,
        medplumClientExists: !!medplumClient,
        medplumClientIdSet:
          !!medplumClientId && medplumClientId !== "your-medplum-client-id",
        medplumSecretSet:
          !!medplumSecret && medplumSecret !== "your-medplum-client-secret",
        error: error?.message,
      });

      if (isLoading) {
        throw new Error("Medplum client is still initializing");
      }
      if (!medplumClient) {
        throw new Error("Medplum store not initialized");
      }
      return await medplumClient.getPatient(patientId);
    },
    [medplumClient, isLoading, medplumClientId, medplumSecret, error]
  );

  const getTasks = useCallback(async () => {
    if (isLoading) throw new Error("Medplum client is still initializing");
    if (!medplumClient) throw new Error("Medplum store not initialized");
    return await medplumClient.getTasks();
  }, [medplumClient, isLoading]);

  const getTasksForPatient = useCallback(async (patientId: string) => {
    if (isLoading) throw new Error("Medplum client is still initializing");
    if (!medplumClient) throw new Error("Medplum store not initialized");
    return await medplumClient.getTasksForPatient(patientId);
  }, [medplumClient, isLoading]);

  const value = {
    store: medplumClient,
    isLoading,
    error,
    getPatient,
    getTasks,
    getTasksForPatient,
  };

  // TODO: Restore medplumClientId/medplumSecret checks when Stytch auth is ready
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

  // TODO: Remove this check when proper auth is implemented
  if (
    !medplumClientId ||
    medplumClientId === "your-medplum-client-id" ||
    !medplumSecret ||
    medplumSecret === "your-medplum-client-secret"
  ) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Medplum Configuration Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please set your Medplum credentials in environment variables:
          </p>
          <div className="bg-gray-100 p-3 rounded text-sm text-left">
            <div>NEXT_PUBLIC_MEDPLUM_CLIENT_ID=your_client_id</div>
            <div>MEDPLUM_CLIENT_SECRET=your_client_secret</div>
          </div>
        </div>
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
