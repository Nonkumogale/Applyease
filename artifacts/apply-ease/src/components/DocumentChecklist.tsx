import React, { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Check, Plus, Trash2, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DocumentChecklist({ application, profile }) {
  const [items, setItems] = useState(application.document_checklist || []);
  const [newLabel, setNewLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const persist = async (next) => {
    setSaving(true);
    try {
      await apiClient.put(`/applications/${application.id}`, {
        document_checklist: next,
      });
    } catch {
      toast({
        title: "Couldn't save checklist",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggle = (i) => {
    const next = items.map((it, idx) =>
      idx === i ? { ...it, checked: !it.checked } : it
    );
    setItems(next);
    persist(next);
  };

  const remove = (i) => {
    const next = items.filter((_, idx) => idx !== i);
    setItems(next);
    persist(next);
  };

  const add = () => {
    if (!newLabel.trim()) return;
    const next = [...items, { label: newLabel.trim(), checked: false }];
    setItems(next);
    setNewLabel("");
    persist(next);
  };

  const completed = items.filter((i) => i.checked).length;
  const profileDocs = profile?.documents || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {completed}/{items.length} uploaded
        </span>
        {saving && (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No checklist items yet. Add the documents you need to submit.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <button
                onClick={() => toggle(i)}
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                  item.checked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-transparent hover:border-primary"
                )}
              >
                {item.checked && <Check className="h-3 w-3" />}
              </button>
              <span
                className={cn(
                  "flex-1 text-sm",
                  item.checked && "text-muted-foreground line-through"
                )}
              >
                {item.label}
              </span>
              <button
                onClick={() => remove(i)}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a document..."
          className="flex h-8 flex-1 rounded-md border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button size="sm" onClick={add} disabled={!newLabel.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {profileDocs.length > 0 && (
        <div className="border-t pt-2">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Your uploaded documents:
          </p>
          <ul className="space-y-1">
            {profileDocs.map((d, i) => (
              <li
                key={i}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <FileText className="h-3 w-3" />
                {d.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
