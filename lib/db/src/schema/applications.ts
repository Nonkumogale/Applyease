import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { applicantsTable } from "./applicants";

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  applicantId: integer("applicant_id").notNull().references(() => applicantsTable.id, { onDelete: "cascade" }),
  applicationType: text("application_type").notNull(), // bursary | internship | scholarship | university
  status: text("status").notNull().default("pending"), // pending | in_progress | submitted | awaiting_verification | completed | failed
  organizationName: text("organization_name").notNull(),
  organizationEmail: text("organization_email"),
  applicationUrl: text("application_url"),
  notes: text("notes"),
  deadline: text("deadline"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;
