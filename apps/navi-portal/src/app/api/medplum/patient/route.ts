import { NextRequest, NextResponse } from "next/server";
import { fetchPatientByIdentifierAction } from "@/domains/medplum/actions";

export async function POST(req: NextRequest) {
  try {
    const { identifier } = (await req.json()) as { identifier?: string };
    if (!identifier) {
      return NextResponse.json(
        { error: "Missing identifier" },
        { status: 400 }
      );
    }
    const patient = await fetchPatientByIdentifierAction(identifier);
    return NextResponse.json(patient, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch patient" },
      { status: 500 }
    );
  }
}
