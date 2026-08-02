import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { applicationsTable } from "./applications";

export const applicationEventsTable = pgTable("application_events", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applicationsTable.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(), // created | status_changed | document_attached | credential_saved | verification_requested | verification_submitted | note_added | submitted | completed | failed
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertApplicationEventSchema = createInsertSchema(applicationEventsTable).omit({ id: true, createdAt: true });
export type InsertApplicationEvent = z.infer<typeof insertApplicationEventSchema>;
export type ApplicationEvent = typeof applicationEventsTable.$inferSelect;
