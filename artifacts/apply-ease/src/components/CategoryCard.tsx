import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Briefcase, Award, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const plurals = {
  bursary: "bursaries",
  internship: "internships",
  scholarship: "scholarships",
  university: "universities",
};

const styles = {
  bursary: {
    icon: GraduationCap,
    gradient: "from-blue-500 to-indigo-600",
    desc: "Financial aid for your studies",
  },
  internship: {
    icon: Briefcase,
    gradient: "from-emerald-500 to-teal-600",
    desc: "Gain real work experience",
  },
  scholarship: {
    icon: Award,
    gradient: "from-amber-500 to-orange-600",
    desc: "Merit-based funding awards",
  },
  university: {
    icon: Landmark,
    gradient: "from-purple-500 to-fuchsia-600",
    desc: "Apply to institutions directly",
  },
};

export default function CategoryCard({ category }) {
  const s = styles[category] || styles.bursary;
  const Icon = s.icon;
  return (
    <Link
      to={`/browse?category=${category}`}
      className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
          s.gradient
        )}
      />
      <div
        className={cn(
          "mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
          s.gradient
        )}
      >
        <Icon className="h-7 w-7" strokeWidth={2} />
      </div>
      <h3 className="mb-1 text-xl font-bold capitalize font-heading">
        {category}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">{s.desc}</p>
      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
        Browse {plurals[category] || `${category}s`}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
