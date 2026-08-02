import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, documentsTable } from "@workspace/db";
import {
  CreateDocumentBody,
  CreateDocumentParams,
  DeleteDocumentParams,
  ListDocumentsParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/applicants/:id/documents", async (req, res): Promise<void> => {
  const params = ListDocumentsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const docs = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.applicantId, params.data.id))
    .orderBy(documentsTable.createdAt);
  res.json(docs);
});

router.post("/applicants/:id/documents", async (req, res): Promise<void> => {
  const params = CreateDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [doc] = await db
    .insert(documentsTable)
    .values({ ...parsed.data, applicantId: params.data.id })
    .returning();
  res.status(201).json(doc);
});

router.delete("/applicants/:id/documents/:docId", async (req, res): Promise<void> => {
  const params = DeleteDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(documentsTable)
    .where(
      and(
        eq(documentsTable.id, params.data.docId),
        eq(documentsTable.applicantId, params.data.id),
      ),
    )
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
