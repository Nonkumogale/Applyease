import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UploadCloud, FileCheck2, X, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ProfileCompletion from "@/components/ProfileCompletion";
import DownloadProfileButton from "@/components/DownloadProfileButton";

export default function MyProfile() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("ID");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    id_number: "",
    date_of_birth: "",
    education_level: "university",
    field_of_study: "",
    institution: "",
    year_of_study: "",
    gpa: "",
    school_name: "",
    upgrading: false,
    grade: "",
    subjects: [],
    career_choices: [],
    address: "",
    bio: "",
    documents: [],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const u = await apiClient.get('/auth/me');
        setUser(u);
        
        // Load profile
        const profiles = await apiClient.get(`/profiles?userId=${u.id}`);
        const p = profiles[0] || null;
        setProfile(p);
        
        if (p) {
          setForm((f) => ({
            ...f,
            ...p,
            documents: p.documents || [],
            email: p.email || (u ? u.email : ""),
            full_name: p.full_name || (u ? u.full_name || "" : ""),
          }));
        } else if (u) {
          setForm((f) => ({
            ...f,
            email: u.email || "",
            full_name: u.full_name || "",
          }));
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Upload file to your backend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', docType);
      
      const response = await apiClient.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const baseName = (form.full_name || "student").replace(/\s+/g, "_");
      setForm((f) => ({
        ...f,
        documents: [
          ...(f.documents || []),
          { name: `${baseName}.${docType}`, file_url: response.file_url, type: docType },
        ],
      }));
      toast({ title: "Document uploaded" });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: "Could not upload the document.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeDoc = (i) => {
    setForm((f) => ({
      ...f,
      documents: f.documents.filter((_, idx) => idx !== i),
    }));
  };

  const save = async () => {
    if (!form.full_name || !form.email) {
      toast({
        title: "Missing details",
        description: "Name and email are required.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      if (profile) {
        await apiClient.put(`/profiles/${profile.id}`, form);
      } else {
        await apiClient.post('/profiles', form);
      }
      toast({ title: "Profile saved" });
    } catch (err) {
      toast({
        title: "Save failed",
        description: "Could not save your profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
    <div>
      <h1 className="text-2xl font-bold font-heading">My profile</h1>
      <p className="text-muted-foreground">
        Fill this in once. We'll reuse your details and documents for every
        application.
      </p>
    </div>

    <ProfileCompletion form={form} />

    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="font-semibold font-heading">Personal details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Full name *</Label>
            <Input value={form.full_name} onChange={update("full_name")} />
          </div>
          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={update("email")} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={update("phone")} />
          </div>
          <div className="space-y-1.5">
            <Label>ID / Passport number</Label>
            <Input value={form.id_number} onChange={update("id_number")} />
          </div>
          <div className="space-y-1.5">
            <Label>Date of birth</Label>
            <Input
              type="date"
              value={form.date_of_birth}
              onChange={update("date_of_birth")}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input value={form.address} onChange={update("address")} />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="font-semibold font-heading">Academic details</h2>

        <div className="inline-flex rounded-lg border bg-muted p-1">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, education_level: "university" }))}
            className={
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors " +
              (form.education_level === "university"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            In university
          </button>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, education_level: "high_school" }))}
            className={
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors " +
              (form.education_level === "high_school"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            In high school
          </button>
        </div>

        {form.education_level === "high_school" ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>High school name</Label>
                <Input
                  value={form.school_name}
                  onChange={update("school_name")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Grade</Label>
                <select
                  value={form.grade}
                  onChange={update("grade")}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select grade</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Are you upgrading?</Label>
                <div className="flex h-9 items-center gap-4 pt-1.5">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="upgrading"
                      checked={form.upgrading === true}
                      onChange={() => setForm((f) => ({ ...f, upgrading: true }))}
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="upgrading"
                      checked={form.upgrading === false}
                      onChange={() => setForm((f) => ({ ...f, upgrading: false }))}
                    />
                    No
                  </label>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Subjects & marks</Label>
              <div className="space-y-2">
                {(form.subjects || []).map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={s.name}
                      onChange={(e) =>
                        setForm((f) => {
                          const subjects = [...(f.subjects || [])];
                          subjects[i] = { ...subjects[i], name: e.target.value };
                          return { ...f, subjects };
                        })
                      }
                      placeholder="Subject"
                    />
                    <Input
                      value={s.mark}
                      onChange={(e) =>
                        setForm((f) => {
                          const subjects = [...(f.subjects || [])];
                          subjects[i] = { ...subjects[i], mark: e.target.value };
                          return { ...f, subjects };
                        })
                      }
                      placeholder="%"
                      className="w-24"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          subjects: (f.subjects || []).filter((_, idx) => idx !== i),
                        }))
                      }
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      subjects: [...(f.subjects || []), { name: "", mark: "" }],
                    }))
                  }
                >
                  + Add subject
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Career choices</Label>
              <p className="text-xs text-muted-foreground">
                Add the careers you're aiming for — we'll use this to match you
                to opportunities.
              </p>
              <div className="space-y-2">
                {(form.career_choices || []).map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={c}
                      onChange={(e) =>
                        setForm((f) => {
                          const career_choices = [...(f.career_choices || [])];
                          career_choices[i] = e.target.value;
                          return { ...f, career_choices };
                        })
                      }
                      placeholder="e.g. Software engineering, Accounting, Medicine"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          career_choices: (f.career_choices || []).filter(
                            (_, idx) => idx !== i
                          ),
                        }))
                      }
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      career_choices: [...(f.career_choices || []), ""],
                    }))
                  }
                >
                  + Add career choice
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Field of study</Label>
              <Input
                value={form.field_of_study}
                onChange={update("field_of_study")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Institution</Label>
              <Input value={form.institution} onChange={update("institution")} />
            </div>
            <div className="space-y-1.5">
              <Label>Year of study</Label>
              <Input
                value={form.year_of_study}
                onChange={update("year_of_study")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>GPA / Average %</Label>
              <Input value={form.gpa} onChange={update("gpa")} />
            </div>
          </div>
        )}
        <div className="space-y-1.5">
          <Label>Short bio / motivation</Label>
          <Textarea
            rows={4}
            value={form.bio}
            onChange={update("bio")}
            placeholder="Tell us about yourself, your goals, and what you're passionate about..."
          />
        </div>
      </div>
    </div>

    {/* Documents */}
    <div className="rounded-xl border bg-card p-6">
      <h2 className="mb-1 font-semibold font-heading">Documents</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Upload your ID, latest results, CV, proof of address, etc.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1.5 sm:w-56">
          <Label>Document type</Label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="ID">ID / Passport</option>
            <option value="results">Latest results</option>
            <option value="Cv">CV / Resume</option>
            <option value="proof_of_address">Proof of address</option>
            <option value="other">Other</option>
          </select>
        </div>
        <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary hover:bg-accent">
          {uploading ? (
            <Loader2 className="mb-2 h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <UploadCloud className="mb-2 h-6 w-6 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            {uploading ? "Uploading..." : `Click to upload your ${docType === "Cv" ? "CV" : docType.replace("_", " ")}`}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">
            Saved as {(form.full_name || "student").replace(/\s+/g, "_")}.{docType}
          </span>
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {form.documents?.length > 0 && (
        <ul className="mt-4 space-y-2">
          {form.documents.map((d, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg bg-muted px-3 py-2"
            >
              <span className="flex items-center gap-2 text-sm">
                <FileCheck2 className="h-4 w-4 text-emerald-500" />
                {d.name}
                {d.type && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                    {d.type}
                  </span>
                )}
              </span>
              <button
                onClick={() => removeDoc(i)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>

    <div className="flex flex-wrap items-center justify-end gap-3">
      <DownloadProfileButton form={form} />
      <Button onClick={save} disabled={saving}>
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Save profile
      </Button>
    </div>
  </div>
  );
}
