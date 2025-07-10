import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import CareflowActivitiesClient from "./careflow-activities-client";
import { ApolloProvider } from "../../../../../lib/awell-client/provider";

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

  // Verify session exists
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("awell.sid");

  console.log("🍪 Session cookie:", sessionCookie ? "Found" : "Not found");

  if (!sessionCookie) {
    console.log("❌ No session cookie found, redirecting to 404");
    notFound();
  }

  return (
    <ApolloProvider>
      <CareflowActivitiesClient careflowId={careflow_id} />
    </ApolloProvider>
  );
}

// Force dynamic rendering for fresh data
export const dynamic = "force-dynamic";
