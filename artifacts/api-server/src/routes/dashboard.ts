import { Router, type IRouter } from "express";
import { db, applicantsTable, applicationsTable, documentsTable, verificationRequestsTable, applicationEventsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [applicants, applications, documents, verificationReqs, recentEvents] = await Promise.all([
    db.select().from(applicantsTable),
    db.select().from(applicationsTable),
    db.select().from(documentsTable),
    db.select().from(verificationRequestsTable),
    db
      .select()
      .from(applicationEventsTable)
      .orderBy(desc(applicationEventsTable.createdAt))
      .limit(10),
  ]);

  const pendingVerifications = verificationReqs.filter((r) => r.status === "pending").length;

  const byStatus: Record<string, number> = {};
  const byType: Record<string, number> = {};
  for (const app of applications) {
    byStatus[app.status] = (byStatus[app.status] ?? 0) + 1;
    byType[app.applicationType] = (byType[app.applicationType] ?? 0) + 1;
  }

  res.json({
    totalApplications: applications.length,
    totalApplicants: applicants.length,
    totalDocuments: documents.length,
    pendingVerifications,
    byStatus,
    byType,
    recentActivity: recentEvents,
  });
});

export default router;
