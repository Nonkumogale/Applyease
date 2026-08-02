import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, applicationsTable, applicationEventsTable } from "@workspace/db";
import {
  CreateApplicationBody,
  GetApplicationParams,
  UpdateApplicationParams,
  UpdateApplicationBody,
  DeleteApplicationParams,
  ListApplicationsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/applications", async (req, res): Promise<void> => {
  const qp = ListApplicationsQueryParams.safeParse(req.query);
  if (!qp.success) {
    res.status(400).json({ error: qp.error.message });
    return;
  }

  let query = db.select().from(applicationsTable).$dynamic();

  const conditions = [];
  if (qp.data.applicantId) {
    conditions.push(eq(applicationsTable.applicantId, qp.data.applicantId));
  }
  if (qp.data.type) {
    conditions.push(eq(applicationsTable.applicationType, qp.data.type));
  }
  if (qp.data.status) {
    conditions.push(eq(applicationsTable.status, qp.data.status));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const apps = await query.orderBy(applicationsTable.createdAt);
  res.json(apps);
});

router.post("/applications", async (req, res): Promise<void> => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [app] = await db.insert(applicationsTable).values(parsed.data).returning();

  // Auto-log creation event
  await db.insert(applicationEventsTable).values({
    applicationId: app.id,
    eventType: "created",
    description: `Application created for ${app.organizationName}`,
  });

  res.status(201).json(app);
});

router.get("/applications/:id", async (req, res): Promise<void> => {
  const params = GetApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [app] = await db
    .select()
    .from(applicationsTable)
    .where(eq(applicationsTable.id, params.data.id));
  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  res.json(app);
});

router.patch("/applications/:id", async (req, res): Promise<void> => {
  const params = UpdateApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Fetch current app to detect status change
  const [current] = await db
    .select()
    .from(applicationsTable)
    .where(eq(applicationsTable.id, params.data.id));
  if (!current) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const [app] = await db
    .update(applicationsTable)
    .set(parsed.data)
    .where(eq(applicationsTable.id, params.data.id))
    .returning();

  // Auto-log status change
  if (parsed.data.status && parsed.data.status !== current.status) {
    await db.insert(applicationEventsTable).values({
      applicationId: app.id,
      eventType: "status_changed",
      description: `Status changed from ${current.status} to ${parsed.data.status}`,
    });
  }

  res.json(app);
});

router.delete("/applications/:id", async (req, res): Promise<void> => {
  const params = DeleteApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(applicationsTable)
    .where(eq(applicationsTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
