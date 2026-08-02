import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, applicantsTable, documentsTable, applicationsTable, verificationRequestsTable } from "@workspace/db";
import {
  CreateApplicantBody,
  UpdateApplicantBody,
  GetApplicantParams,
  UpdateApplicantParams,
  GetApplicantSummaryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/applicants", async (_req, res): Promise<void> => {
  const applicants = await db.select().from(applicantsTable).orderBy(applicantsTable.createdAt);
  res.json(applicants);
});

router.post("/applicants", async (req, res): Promise<void> => {
  const parsed = CreateApplicantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [applicant] = await db.insert(applicantsTable).values(parsed.data).returning();
  res.status(201).json(applicant);
});

router.get("/applicants/:id", async (req, res): Promise<void> => {
  const params = GetApplicantParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [applicant] = await db.select().from(applicantsTable).where(eq(applicantsTable.id, params.data.id));
  if (!applicant) {
    res.status(404).json({ error: "Applicant not found" });
    return;
  }
  res.json(applicant);
});

router.patch("/applicants/:id", async (req, res): Promise<void> => {
  const params = UpdateApplicantParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateApplicantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [applicant] = await db
    .update(applicantsTable)
    .set(parsed.data)
    .where(eq(applicantsTable.id, params.data.id))
    .returning();
  if (!applicant) {
    res.status(404).json({ error: "Applicant not found" });
    return;
  }
  res.json(applicant);
});

router.get("/applicants/:id/summary", async (req, res): Promise<void> => {
  const params = GetApplicantSummaryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const applicantId = params.data.id;

  const [applicant] = await db.select().from(applicantsTable).where(eq(applicantsTable.id, applicantId));
  if (!applicant) {
    res.status(404).json({ error: "Applicant not found" });
    return;
  }

  const docs = await db.select().from(documentsTable).where(eq(documentsTable.applicantId, applicantId));
  const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.applicantId, applicantId));

  // Profile completeness: count filled fields
  const fields = [applicant.fullName, applicant.email, applicant.phone, applicant.dateOfBirth, applicant.address, applicant.idNumber, applicant.institution, applicant.course, applicant.yearOfStudy];
  const filled = fields.filter(Boolean).length;
  const completionPercent = Math.round((filled / fields.length) * 100);

  const byStatus: Record<string, number> = {};
  const byType: Record<string, number> = {};
  for (const app of apps) {
    byStatus[app.status] = (byStatus[app.status] ?? 0) + 1;
    byType[app.applicationType] = (byType[app.applicationType] ?? 0) + 1;
  }

  const appIds = apps.map((a) => a.id);
  let pendingVerifications = 0;
  if (appIds.length > 0) {
    for (const appId of appIds) {
      const reqs = await db
        .select()
        .from(verificationRequestsTable)
        .where(eq(verificationRequestsTable.applicationId, appId));
      pendingVerifications += reqs.filter((r) => r.status === "pending").length;
    }
  }

  res.json({
    applicantId,
    documentCount: docs.length,
    applicationCount: apps.length,
    completionPercent,
    byStatus,
    byType,
    pendingVerifications,
  });
});

export default router;
