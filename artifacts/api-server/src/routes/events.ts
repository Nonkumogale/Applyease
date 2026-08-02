import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, applicationEventsTable } from "@workspace/db";
import {
  CreateApplicationEventParams,
  CreateApplicationEventBody,
  ListApplicationEventsParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/applications/:id/events", async (req, res): Promise<void> => {
  const params = ListApplicationEventsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const events = await db
    .select()
    .from(applicationEventsTable)
    .where(eq(applicationEventsTable.applicationId, params.data.id))
    .orderBy(applicationEventsTable.createdAt);
  res.json(events);
});

router.post("/applications/:id/events", async (req, res): Promise<void> => {
  const params = CreateApplicationEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateApplicationEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [event] = await db
    .insert(applicationEventsTable)
    .values({ ...parsed.data, applicationId: params.data.id })
    .returning();
  res.status(201).json(event);
});

export default router;
