import React, { useState } from "react";
import { apiClient } from "@/lib/api-client";
import StatusBadge from "@/components/StatusBadge";
import { Loader2, Check } from "lucide-react";

const STATUS_OPTIONS = [
  { key: "draft", label: "Draft" },
  { key: "ready", label: "Ready to submit" },
  { key: "submitted", label: "Submitted" },
  { key: "verified", label: "Under review / Verified" },
];

export default function ApplicationStatusEditor({ application, onUpdate }) {
  const [status, setStatus] = useState(application.status || "draft");
  const [code, setCode] = useState(application.verification_code || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const persist = async (next) => {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await apiClient.put(`/applications/${application.id}`, next);
      setStatus(updated.status);
      setCode(updated.verification_code || "");
      setSaved(true);
      onUpdate?.(updated);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      /* keep local edits; user can retry */
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = (e) => {
    const next = e.target.value;
    setStatus(next);
    persist({ status: next });
  };

  const handleCode = () => {
    persist({ verification_code: code });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={status} />
        <select
          value={status}
          onChange={handleStatus}
          disabled={saving}
          className="rounded-md border border-input bg-background px-2 py-1 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        {saving && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {saved && <span className="text-xs text-emerald-600">Saved</span>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Verification code (if any)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
        />
        <button
          onClick={handleCode}
          disabled={saving}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
          Save code
        </button>
      </div>
    </div>
  );
}
