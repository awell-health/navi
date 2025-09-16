import CareflowActivitiesClient from "./careflow-activities-client";
import { ApolloProvider } from "../../../../../lib/awell-client/provider";
import { SessionProvider } from "@/lib/session-provider";

interface CareflowActivitiesPageProps {
  params: Promise<{
    careflow_id: string;
    stakeholder_id: string;
  }>;
}

export default async function CareflowActivitiesPage({
  params,
}: CareflowActivitiesPageProps) {
  const { careflow_id, stakeholder_id } = await params;
  console.log("🏥 Careflow Activities Page Loading");
  console.log("📋 URL Params:", { careflow_id, stakeholder_id });

  return (
    <SessionProvider>
      <ApolloProvider>
        {/* Note: onActivityActivate handler will be provided by CareflowActivitiesClient */}
        <CareflowActivitiesClient
          careflowId={careflow_id}
          stakeholderId={stakeholder_id}
        />
      </ApolloProvider>
    </SessionProvider>
  );
}

// Force dynamic rendering for fresh data
export const dynamic = "force-dynamic";
