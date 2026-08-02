import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { applicantsTable } from "./applicants";

export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  applicantId: integer("applicant_id").notNull().references(() => applicantsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  documentType: text("document_type").notNull(), // id_document | transcript | cv | motivation_letter | recommendation | proof_of_income | proof_of_enrollment | other
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ id: true, createdAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documentsTable.$inferSelect;
