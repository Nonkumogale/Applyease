import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, credentialsTable, applicationEventsTable } from "@workspace/db";
import {
  GetCredentialsParams,
  SaveCredentialsParams,
  SaveCredentialsBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/applications/:id/credentials", async (req, res): Promise<void> => {
  const params = GetCredentialsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [credential] = await db
    .select()
    .from(credentialsTable)
    .where(eq(credentialsTable.applicationId, params.data.id));
  if (!credential) {
    res.status(404).json({ error: "Credentials not found" });
    return;
  }
  res.json(credential);
});

router.post("/applications/:id/credentials", async (req, res): Promise<void> => {
  const params = SaveCredentialsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = SaveCredentialsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Upsert: delete old credentials if exist
  await db
    .delete(credentialsTable)
    .where(eq(credentialsTable.applicationId, params.data.id));

  const [credential] = await db
    .insert(credentialsTable)
    .values({ ...parsed.data, applicationId: params.data.id })
    .returning();

  // Log event
  await db.insert(applicationEventsTable).values({
    applicationId: params.data.id,
    eventType: "credential_saved",
    description: `Portal credentials saved for ${parsed.data.loginEmail}`,
  });

  res.status(201).json(credential);
});

export default router;
