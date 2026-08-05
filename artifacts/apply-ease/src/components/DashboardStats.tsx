import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { FolderOpen, Send, Search, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardStats() {
  const [apps, setApps] = useState([]);
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const user = await apiClient.get('/auth/me');
        if (user && user.id) {
          const applications = await apiClient.get(`/applications?userId=${user.id}`);
          setApps(Array.isArray(applications) ? applications : []);
        } else {
          setApps([]);
        }
        const opportunities = await apiClient.get('/opportunities');
        setOpps(Array.isArray(opportunities) ? opportunities : []);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        setApps([]);
        setOpps([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (apps.length === 0 && opps.length === 0) return null;

  const submitted = apps.filter(
    (a: any) => a.status === "submitted" || a.status === "verified"
  ).length;
  const openOpps = opps.filter((o: any) => o.status === "open").length;

  const upcoming = opps
    .filter((o: any) => o.deadline && o.status === "open")
    .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  const nextDeadline = upcoming[0];

  const stats = [
    { label: "My applications", value: apps.length, icon: FolderOpen, to: "/applications" },
    { label: "Submitted", value: submitted, icon: Send, to: "/applications" },
    { label: "Open opportunities", value: openOpps, icon: Search, to: "/browse" },
  ];

  return (
    <section className="px-2 pb-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              to={s.to}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </Link>
          );
        })}
      </div>
      {nextDeadline && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border bg-accent/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            <p className="text-sm">
              <span className="font-semibold">Next deadline:</span>{" "}
              {nextDeadline.title} —{" "}
              {new Date(nextDeadline.deadline).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <Link to="/reminders">
            <Button size="sm" variant="outline">
              View reminders
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}
