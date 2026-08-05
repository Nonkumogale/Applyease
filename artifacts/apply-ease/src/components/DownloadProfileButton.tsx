import React, { useState } from "react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

export default function DownloadProfileButton({ form }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const buildProfileText = () => {
    const docs = form.documents || [];
    const lines = [
      "APPLYEASE — STUDENT PROFILE",
      "============================",
      "",
      `Full name: ${form.full_name || ""}`,
      `Email: ${form.email || ""}`,
      `Phone: ${form.phone || ""}`,
      `ID / Passport: ${form.id_number || ""}`,
      `Date of birth: ${form.date_of_birth || ""}`,
      `Education level: ${form.education_level === "high_school" ? "High school" : "University"}`,
      ...(form.education_level === "high_school"
        ? [
            `High school: ${form.school_name || ""}`,
            `Grade: ${form.grade || ""}`,
            `Upgrading: ${form.upgrading ? "Yes" : "No"}`,
            `Subjects:`,
            ...(form.subjects || []).map(
              (s) => `  - ${s.name || ""}: ${s.mark || ""}`
            ),
            `Career choices:`,
            ...(form.career_choices || []).map(
              (c) => `  - ${c || ""}`
            ),
          ]
        : [
            `Field of study: ${form.field_of_study || ""}`,
            `Institution: ${form.institution || ""}`,
            `Year of study: ${form.year_of_study || ""}`,
            `GPA / Average: ${form.gpa || ""}`,
          ]),
      `Address: ${form.address || ""}`,
      "",
      "Bio / Motivation:",
      form.bio || "",
      "",
      `Documents (${docs.length}):`,
      ...docs.map((d, i) => `  ${i + 1}. ${d.name}`),
    ];
    return lines.join("\n");
  };

  const handleDownload = async () => {
    setBusy(true);
    setError("");
    try {
      const zip = new JSZip();
      zip.file("profile.txt", buildProfileText());
      const docs = form.documents || [];
      for (const d of docs) {
        if (!d.file_url) continue;
        const res = await fetch(d.file_url);
        if (!res.ok) continue;
        const blob = await res.blob();
        const safeName = (d.name || `document_${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, "_");
        zip.file(safeName, blob);
      }
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `profile_${(form.full_name || "student").replace(/\s+/g, "_").toLowerCase()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("Could not build the ZIP. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" onClick={handleDownload} disabled={busy}>
        {busy ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {busy ? "Preparing ZIP..." : "Download profile (ZIP)"}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
