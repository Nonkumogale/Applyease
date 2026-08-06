import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  X,
  Save,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const emptyForm = {
  title: "",
  category: "bursary",
  provider_name: "",
  provider_email: "",
  description: "",
  requirements: "",
  application_link: "",
  deadline: "",
  location: "",
  amount: "",
  status: "open",
};

export default function AdminOpportunities() {
  const { toast } = useToast();
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/opportunities?sort=-created_date');
      setOpps(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load opportunities:', error);
      setOpps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (o) => {
    setForm({ ...emptyForm, ...o });
    setEditingId(o.id);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title || !form.provider_name || !form.application_link) {
      toast({
        title: "Missing details",
        description: "Title, provider, and application link are required.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await apiClient.put(`/opportunities/${editingId}`, form);
        toast({ title: "Opportunity updated" });
      } else {
        await apiClient.post('/opportunities', form);
        toast({ title: "Opportunity added" });
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast({
        title: "Save failed",
        description: "Could not save the opportunity.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (o) => {
    if (!confirm(`Delete "${o.title}"?`)) return;
    try {
      await apiClient.delete(`/opportunities/${o.id}`);
      toast({ title: "Opportunity deleted" });
      load();
    } catch (err) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">
            Manage opportunities
          </h1>
          <p className="text-muted-foreground">
            Curate the catalog students can apply to.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add opportunity
        </Button>
      </div>

      {showForm && (
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold font-heading">
              {editingId ? "Edit opportunity" : "New opportunity"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} onChange={update("title")} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <select
                value={form.category}
                onChange={update("category")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="bursary">Bursary</option>
                <option value="internship">Internship</option>
                <option value="scholarship">Scholarship</option>
                <option value="university">University</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Provider name *</Label>
              <Input
                value={form.provider_name}
                onChange={update("provider_name")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Provider email</Label>
              <Input
                type="email"
                value={form.provider_email}
                onChange={update("provider_email")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Application link *</Label>
              <Input
                value={form.application_link}
                onChange={update("application_link")}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Deadline</Label>
              <Input
                type="date"
                value={form.deadline}
                onChange={update("deadline")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={form.location} onChange={update("location")} />
            </div>
            <div className="space-y-1.5">
              <Label>Amount / Value</Label>
              <Input value={form.amount} onChange={update("amount")} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={update("status")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={update("description")}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Requirements</Label>
            <Textarea
              rows={3}
              value={form.requirements}
              onChange={update("requirements")}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </div>
      )}

      {opps.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          No opportunities yet. Add your first one.
        </div>
      ) : (
        <div className="space-y-3">
          {opps.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold font-heading">{o.title}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                    {o.category}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      o.status === "open"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {o.provider_name}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(o)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(o)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
