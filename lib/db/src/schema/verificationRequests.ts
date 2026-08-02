import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { applicationsTable } from "./applications";

export const verificationRequestsTable = pgTable("verification_requests", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applicationsTable.id, { onDelete: "cascade" }),
  requestNote: text("request_note").notNull(),
  code: text("code"),
  status: text("status").notNull().default("pending"), // pending | submitted | expired
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
});

export const insertVerificationRequestSchema = createInsertSchema(verificationRequestsTable).omit({ id: true, requestedAt: true });
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;
export type VerificationRequest = typeof verificationRequestsTable.$inferSelect;
