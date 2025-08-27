import { NextRequest, NextResponse } from "next/server";
import { fetchPatientTasksAction } from "@/domains/medplum/actions";

export async function POST(req: NextRequest) {
  try {
    const { patientId } = (await req.json()) as { patientId?: string };
    if (!patientId) {
      return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
    }
    const tasks = await fetchPatientTasksAction(patientId);
    return NextResponse.json(tasks, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
