import React from "react";

const SHARED_FIELDS = [
  "full_name",
  "email",
  "phone",
  "id_number",
  "date_of_birth",
  "address",
  "bio",
];

const UNIVERSITY_FIELDS = ["field_of_study", "institution", "year_of_study", "gpa"];
const HIGH_SCHOOL_FIELDS = ["school_name", "grade"];

export default function ProfileCompletion({ form }) {
  const isHighSchool = form.education_level === "high_school";
  const academicFields = isHighSchool ? HIGH_SCHOOL_FIELDS : UNIVERSITY_FIELDS;
  const fields = [...SHARED_FIELDS, ...academicFields];
  const filled = fields.filter(
    (f) => form[f] && String(form[f]).trim()
  ).length;
  const docs = form.documents?.length || 0;
  const hasSubjects = (form.subjects?.length || 0) > 0;
  const total = fields.length + 2;
  const score = filled + (docs > 0 ? 1 : 0) + (hasSubjects || !isHighSchool ? 1 : 0);
  const percent = Math.round((score / total) * 100);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold font-heading">Profile completion</h2>
        <span className="text-sm font-semibold text-primary">{percent}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {docs} document{docs === 1 ? "" : "s"} uploaded · {filled}/
        {fields.length} fields filled
        {percent < 100
          ? " — a complete profile strengthens every application."
          : " — your profile is complete!"}
      </p>
    </div>
  );
}
