import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import ApplicationProgress from "@/components/ApplicationProgress";
import DocumentChecklist from "@/components/DocumentChecklist";
import ApplicationStatusEditor from "@/components/ApplicationStatusEditor";
import { Loader2, FolderOpen, ExternalLink, Calendar, Filter } from "lucide-react";

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const handleUpdate = (updated) => {
    setApps((prev) =>
      (prev || []).map((a) => (a.id === updated.id ? updated : a))
    );
  };

  const filtered = (apps || []).filter(
    (a) =>
      (filterStatus === "all" || a.status === filterStatus) &&
      (filterCategory === "all" || a.category === filterCategory)
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await apiClient.get('/auth/me');
        if (user && user.id) {
          const applications = await apiClient.get(`/applications?userId=${user.id}`);
          setApps(Array.isArray(applications) ? applications : []);
          
          const profiles = await apiClient.get(`/profiles?userId=${user.id}`);
          setProfile(Array.isArray(profiles) ? profiles[0] || null : null);
        }
      } catch (error) {
        console.error('Failed to load applications:', error);
        setApps([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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
        <h1 className="text-2xl font-bold font-heading">My applications</h1>
        <p className="text-muted-foreground">
          Track everything you've applied for.
        </p>
      </div>

      {apps.length === 0 ? (
        <div className="rounded-xl border border-dashed py-20 text-center">
          <FolderOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="mb-1 font-medium">No applications yet</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Browse opportunities to get started.
          </p>
          <Link
            to="/browse"
            className="text-sm font-medium text-primary underline"
          >
            Browse opportunities
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="ready">Ready</option>
              <option value="submitted">Submitted</option>
              <option value="verified">Under review</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            >
              <option value="all">All categories</option>
              <option value="bursary">Bursary</option>
              <option value="internship">Internship</option>
              <option value="scholarship">Scholarship</option>
              <option value="university">University</option>
            </select>
          </div>
          <div className="space-y-3">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-1">
                      <h3 className="font-semibold font-heading">
                        {a.opportunity_title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {a.provider_name} ·{" "}
                      <span className="capitalize">{a.category}</span>
                    </p>
                    {a.submitted_date && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Submitted {new Date(a.submitted_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {a.application_link && (
                      <a
                        href={a.application_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        Open form
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="mt-4 border-t pt-4">
                  <ApplicationProgress status={a.status} />
                </div>
                <div className="mt-4">
                  <ApplicationStatusEditor
                    application={a}
                    onUpdate={handleUpdate}
                  />
                </div>
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    Document checklist
                  </summary>
                  <div className="mt-3">
                    <DocumentChecklist application={a} profile={profile} />
                  </div>
                </details>
                {a.cover_letter && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                      View cover letter
                    </summary>
                    <div className="mt-2 max-h-48 overflow-y-auto whitespace-pre-line rounded-lg bg-muted p-3 text-sm">
                      {a.cover_letter}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
