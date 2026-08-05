import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  ExternalLink,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState(null);
  const [error, setError] = useState("");
  const [checklist, setChecklist] = useState([]);

  const buildDefaultChecklist = (category) => {
    const base = [
      { label: "ID / Passport", checked: false },
      { label: "Latest results / transcript", checked: false },
      { label: "Proof of address", checked: false },
      { label: "CV / Resume", checked: false },
      { label: "Cover letter", checked: false },
    ];
    if (category === "bursary") {
      base.push(
        { label: "Parent/Guardian ID", checked: false },
        { label: "Proof of income", checked: false }
      );
    }
    return base;
  };

  const toggleChecklist = (i) => {
    setChecklist((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, checked: !it.checked } : it))
    );
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const o = await apiClient.get(`/opportunities/${id}`);
        setOpp(o);
        setChecklist(buildDefaultChecklist(o.category));
      } catch (error) {
        console.error('Failed to load opportunity:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await apiClient.get('/auth/me');
        const profiles = await apiClient.get(`/profiles?userId=${user.id}`);
        setProfile(profiles[0] || null);
      } catch (error) {
        console.log('No profile found');
      }
    };
    loadProfile();
  }, []);

  const generateCoverLetter = async () => {
    if (!profile) {
      navigate("/profile");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      // Use your own LLM API endpoint
      const response = await apiClient.post('/llm/generate-cover-letter', {
        opportunity: {
          title: opp.title,
          category: opp.category,
          provider_name: opp.provider_name,
          description: opp.description || "",
          requirements: opp.requirements || "",
        },
        applicant: {
          full_name: profile.full_name,
          field_of_study: profile.field_of_study || "N/A",
          institution: profile.institution || "N/A",
          year_of_study: profile.year_of_study || "N/A",
          gpa: profile.gpa || "N/A",
          bio: profile.bio || "N/A",
        }
      });
      setCoverLetter(response.cover_letter || response.response || JSON.stringify(response));
    } catch (e) {
      setError("Could not generate the cover letter. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const saveApplication = async (status) => {
    try {
      await apiClient.post('/applications', {
        opportunity_id: opp.id,
        opportunity_title: opp.title,
        category: opp.category,
        provider_name: opp.provider_name,
        status,
        cover_letter: coverLetter || "",
        application_link: opp.application_link || "",
        submitted_date:
          status === "submitted"
            ? new Date().toISOString().slice(0, 10)
            : undefined,
        document_checklist: checklist,
      });
      navigate("/applications");
    } catch (e) {
      setError("Could not save your application. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Opportunity not found.
      </div>
    );
  }

  const deadline = opp.deadline
    ? new Date(opp.deadline).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      <Link
        to="/browse"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to browse
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">
              {opp.category}
            </span>
            <h1 className="text-3xl font-bold font-heading">{opp.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {opp.provider_name}
              </span>
              {deadline && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Deadline: {deadline}
                </span>
              )}
              {opp.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {opp.location}
                </span>
              )}
            </div>
          </div>

          {opp.description && (
            <div>
              <h2 className="mb-2 text-lg font-semibold font-heading">
                About this opportunity
              </h2>
              <p className="whitespace-pre-line text-muted-foreground">
                {opp.description}
              </p>
            </div>
          )}

          {opp.requirements && (
            <div>
              <h2 className="mb-2 text-lg font-semibold font-heading">
                Requirements
              </h2>
              <p className="whitespace-pre-line text-muted-foreground">
                {opp.requirements}
              </p>
            </div>
          )}

          {/* Cover letter generator */}
          <div className="rounded-xl border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold font-heading">
                Your application package
              </h2>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>

            {!profile && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  You need to build your profile first before we can prepare an
                  application.{" "}
                  <Link to="/profile" className="font-semibold underline">
                    Build profile
                  </Link>
                </div>
              </div>
            )}

            {coverLetter && (
              <div className="mb-4">
                <h3 className="mb-1 text-sm font-semibold">Generated cover letter</h3>
                <div className="max-h-72 overflow-y-auto whitespace-pre-line rounded-lg bg-muted p-4 text-sm">
                  {coverLetter}
                </div>
              </div>
            )}

            <div className="mb-4">
              <h3 className="mb-1 text-sm font-semibold">Document checklist</h3>
              <p className="mb-3 text-xs text-muted-foreground">
                Tick off the documents you've uploaded for this application.
              </p>
              <ul className="space-y-1.5">
                {checklist.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <button
                      onClick={() => toggleChecklist(i)}
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
                        "text-sm",
                        item.checked && "text-muted-foreground line-through"
                      )}
                    >
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <p className="mb-3 text-sm text-destructive">{error}</p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={generateCoverLetter}
                disabled={generating || !profile}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : coverLetter ? (
                  "Regenerate cover letter"
                ) : (
                  "Generate cover letter"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-3 font-semibold font-heading">Apply now</h3>
            {opp.amount && (
              <p className="mb-3 text-sm">
                <span className="text-muted-foreground">Value: </span>
                <span className="font-medium">{opp.amount}</span>
              </p>
            )}
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={() => saveApplication("submitted")}
                disabled={!coverLetter}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Save & mark submitted
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => saveApplication("draft")}
              >
                Save as draft
              </Button>
              {opp.application_link && (
                <a href={opp.application_link} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="w-full">
                    Open official form
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {coverLetter
                ? "Save & mark submitted after sending via the official form, or save as a draft to finish later."
                : "Generate a cover letter to mark as submitted, or save as a draft to come back later."}
            </p>
          </div>

          {profile?.documents?.length > 0 && (
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-3 font-semibold font-heading">
                Your documents ({profile.documents.length})
              </h3>
              <ul className="space-y-1.5 text-sm">
                {profile.documents.map((d, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {d.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
