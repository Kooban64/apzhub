export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ApzpenDomainError } from "@/lib/apzpen/domain";
import {
  customerAssignFinding,
  customerDownloadReport,
  customerMarkRemediating,
  customerRequestRetest,
  customerUploadEvidence,
  getCustomerPortalView,
} from "@/lib/apzpen/follow-on-service";
import { tryCompileApzpenPdf } from "@/lib/apzpen/report-pdf";
import type { ReportPackKind } from "@/lib/apzpen/reports";

function tokenFrom(request: NextRequest): string {
  const header = request.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  return request.nextUrl.searchParams.get("token")?.trim() ?? "";
}

function errorResponse(error: unknown): NextResponse {
  if (error instanceof ApzpenDomainError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.code === "NOT_FOUND" ? 404 : 400 },
    );
  }
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "Unexpected error" } },
    { status: 500 },
  );
}

export async function GET(request: NextRequest) {
  const token = tokenFrom(request);
  if (!token) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Grant token required" } },
      { status: 401 },
    );
  }

  const format = request.nextUrl.searchParams.get("format");
  const kind = (request.nextUrl.searchParams.get("kind") ??
    "executive") as ReportPackKind;

  try {
    if (format === "report" || format === "pdf") {
      const pack = customerDownloadReport({ token, kind });
      if (format === "pdf") {
        const pdf = await tryCompileApzpenPdf(pack);
        if (!pdf.ok) {
          return NextResponse.json(
            { error: { code: "PDF_FAILED", message: pdf.reason } },
            { status: 500 },
          );
        }
        return new NextResponse(new Uint8Array(pdf.bytes), {
          status: 200,
          headers: {
            "content-type": "application/pdf",
            "content-disposition": `attachment; filename="apzpen-${kind}.pdf"`,
            "x-apzpen-pdf-engine": pdf.engine,
          },
        });
      }
      return NextResponse.json({ data: { pack } });
    }

    const view = getCustomerPortalView(token);
    return NextResponse.json({
      data: {
        customerEmail: view.grant.customerEmail,
        permissions: view.grant.permissions,
        expiresAt: view.grant.expiresAt,
        engagement: {
          engagementId: view.engagement.engagementId,
          title: view.engagement.title,
          customerName: view.engagement.customerName,
          applicationName: view.engagement.applicationName,
          status: view.engagement.status,
          assessmentPosition: view.engagement.assessmentPosition,
          environment: view.engagement.environment,
          scheduleMode: view.engagement.scheduleMode,
          nextRunAt: view.engagement.nextRunAt,
        },
        posture: view.posture,
        findings: view.findings.map((f) => ({
          findingId: f.findingId,
          title: f.title,
          description: f.description,
          severity: f.severity,
          status: f.status,
          remediation: f.remediation,
          location: f.location,
          providerTool: f.providerTool,
          assignedTo: f.assignedTo,
          evidence: f.evidence,
        })),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const token = tokenFrom(request);
  if (!token) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Grant token required" } },
      { status: 401 },
    );
  }
  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    findingId?: string;
    assignedTo?: string;
    evidenceLabel?: string;
    evidenceRef?: string;
    evidenceKind?: string;
  };
  try {
    if (body.action === "request_retest" && body.findingId) {
      const finding = customerRequestRetest({
        token,
        findingId: body.findingId,
      });
      return NextResponse.json({ data: { finding } }, { status: 200 });
    }
    if (body.action === "mark_remediating" && body.findingId) {
      const finding = customerMarkRemediating({
        token,
        findingId: body.findingId,
      });
      return NextResponse.json({ data: { finding } }, { status: 200 });
    }
    if (body.action === "assign" && body.findingId && body.assignedTo) {
      const finding = customerAssignFinding({
        token,
        findingId: body.findingId,
        assignedTo: body.assignedTo,
      });
      return NextResponse.json({ data: { finding } }, { status: 200 });
    }
    if (
      body.action === "upload_evidence" &&
      body.findingId &&
      body.evidenceLabel &&
      body.evidenceRef
    ) {
      const finding = customerUploadEvidence({
        token,
        findingId: body.findingId,
        label: body.evidenceLabel,
        ref: body.evidenceRef,
        kind: body.evidenceKind,
      });
      return NextResponse.json({ data: { finding } }, { status: 200 });
    }
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION",
          message:
            "action must be request_retest | mark_remediating | assign | upload_evidence",
        },
      },
      { status: 400 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
