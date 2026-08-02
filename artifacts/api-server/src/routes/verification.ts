import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, verificationRequestsTable, applicationsTable, applicationEventsTable } from "@workspace/db";
import {
  CreateVerificationRequestParams,
  CreateVerificationRequestBody,
  ListVerificationRequestsParams,
  SubmitVerificationCodeParams,
  SubmitVerificationCodeBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/applications/:id/verification-requests", async (req, res): Promise<void> => {
  const params = ListVerificationRequestsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const reqs = await db
    .select()
    .from(verificationRequestsTable)
    .where(eq(verificationRequestsTable.applicationId, params.data.id))
    .orderBy(verificationRequestsTable.requestedAt);
  res.json(reqs);
});

router.post("/applications/:id/verification-requests", async (req, res): Promise<void> => {
  const params = CreateVerificationRequestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateVerificationRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Update application status to awaiting_verification
  await db
    .update(applicationsTable)
    .set({ status: "awaiting_verification" })
    .where(eq(applicationsTable.id, params.data.id));

  const [request] = await db
    .insert(verificationRequestsTable)
    .values({
      applicationId: params.data.id,
      requestNote: parsed.data.requestNote,
      status: "pending",
    })
    .returning();

  // Log event
  await db.insert(applicationEventsTable).values({
    applicationId: params.data.id,
    eventType: "verification_requested",
    description: `Verification code requested: ${parsed.data.requestNote}`,
  });

  res.status(201).json(request);
});

router.post("/applications/:id/verification-requests/:reqId/submit", async (req, res): Promise<void> => {
  const params = SubmitVerificationCodeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = SubmitVerificationCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [request] = await db
    .update(verificationRequestsTable)
    .set({ code: parsed.data.code, status: "submitted", submittedAt: new Date() })
    .where(
      and(
        eq(verificationRequestsTable.id, params.data.reqId),
        eq(verificationRequestsTable.applicationId, params.data.id),
      ),
    )
    .returning();

  if (!request) {
    res.status(404).json({ error: "Verification request not found" });
    return;
  }

  // Update application back to in_progress
  await db
    .update(applicationsTable)
    .set({ status: "in_progress" })
    .where(eq(applicationsTable.id, params.data.id));

  // Log event
  await db.insert(applicationEventsTable).values({
    applicationId: params.data.id,
    eventType: "verification_submitted",
    description: `Verification code submitted`,
  });

  res.json(request);
});

export default router;
