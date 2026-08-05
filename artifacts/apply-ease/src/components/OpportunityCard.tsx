import React from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const categoryColors = {
  bursary: "bg-blue-100 text-blue-700",
  internship: "bg-emerald-100 text-emerald-700",
  scholarship: "bg-amber-100 text-amber-700",
  university: "bg-purple-100 text-purple-700",
};

export default function OpportunityCard({ opportunity }) {
  const deadline = opportunity.deadline
    ? new Date(opportunity.deadline).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
  const isClosed = opportunity.status === "closed";

  return (
    <Link
      to={`/opportunity/${opportunity.id}`}
      className="flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/40"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
            categoryColors[opportunity.category] || "bg-muted"
          }`}
        >
          {opportunity.category}
        </span>
        {isClosed && (
          <Badge variant="secondary" className="text-destructive">
            Closed
          </Badge>
        )}
      </div>
      <h3 className="mb-1 line-clamp-2 text-lg font-bold font-heading">
        {opportunity.title}
      </h3>
      <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Building2 className="h-3.5 w-3.5" />
        {opportunity.provider_name}
      </div>
      <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
        {opportunity.description}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {deadline && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {deadline}
          </span>
        )}
        {opportunity.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {opportunity.location}
          </span>
        )}
        {opportunity.amount && (
          <span className="font-medium text-foreground">
            {opportunity.amount}
          </span>
        )}
      </div>
    </Link>
  );
}
