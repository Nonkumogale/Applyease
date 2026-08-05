import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Loader2,
  Mail,
  AlertTriangle,
  Clock,
  ExternalLink,
  CalendarClock,
  CalendarPlus,
} from "lucide-react";

function googleCalendarUrl(r) {
  const d = new Date(r.deadline);
  const start = d.toISOString().slice(0, 10).replace(/-/g, "");
  const endD = new Date(d.getTime() + 86400000);
  const end = endD.toISOString().slice(0, 10).replace(/-/g, "");
  const text = encodeURIComponent(`${r.title} deadline — ApplyMate`);
  const details = encodeURIComponent(
    `Application deadline for ${r.title} (${r.provider}).` +
      (r.application_link ? `\nApply here: ${r.application_link}` : "")
  );
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}`;
}

function daysUntil(dateStr) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - now) / 86400000);
}

function urgency(days) {
  if (days < 0) return { label: "Past due", cls: "bg-red-100 text-red-700", Icon: AlertTriangle };
  if (days <= 3) return { label: `${days}d left`, cls: "bg-red-100 text-red-700", Icon: AlertTriangle };
  if (days <= 7) return { label: `${days}d left`, cls: "bg-amber-100 text-amber-700", Icon: Clock };
  return { label: `${days}d left`, cls: "bg-emerald-100 text-emerald-700", Icon: Clock };
}

export default function Reminders() {
  const [user, setUser] = useState(null);
  const [reminders, setReminders] = useState(null);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await apiClient.get('/auth/me');
        setUser(u);
      } catch (error) {
        console.log('User not logged in');
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        // Load applications
        const apps = await apiClient.get(`/applications?userId=${user.id}&sort=-created_date`);
        
        // Load opportunities
        const opps = await apiClient.get('/opportunities?sort=-created_date&limit=200');
        const oppMap = {};
        opps.forEach((o) => (oppMap[o.id] = o));
        
        const upcoming = apps
          .filter((a) => a.status !== "submitted" && a.status !== "verified")
          .map((a) => {
            const opp = oppMap[a.opportunity_id];
            const deadline = opp?.deadline;
            return {
              id: a.id,
              opportunity_id: a.opportunity_id,
              title: a.opportunity_title,
              provider: a.provider_name,
              category: a.category,
              status: a.status,
              application_link: a.application_link || opp?.application_link,
              deadline,
              days: deadline ? daysUntil(deadline) : null,
            };
          })
          .filter((r) => r.deadline)
          .sort((a, b) => a.days - b.days);
        setReminders(upcoming);
      } catch (error) {
        console.error('Failed to load reminders:', error);
        setReminders([]);
      }
    })();
  }, [user]);

  const sendEmail = async () => {
    if (!user?.email) return;
    setSending(true);
    try {
      const lines = reminders
        .map(
          (r) =>
            `• ${r.title} (${r.provider}) — deadline ${new Date(
              r.deadline
            ).toLocaleDateString()} — ${
              r.days >= 0 ? `${r.days} days left` : "past due"
            }`
        )
        .join("\n");
      const body = `Hi ${user.full_name || "there"},\n\nHere are your upcoming application deadlines:\n\n${lines}\n\nDon't miss out — log in to ApplyMate and submit on time.\n\n— ApplyMate`;
      
      // Use your own email service endpoint
      await apiClient.post('/email/send', {
        to: user.email,
        subject: "Your upcoming application deadlines",
        body,
      });
      
      toast({
        title: "Reminders sent",
        description: `Check your inbox at ${user.email}.`,
      });
    } catch (error) {
      toast({
        title: "Couldn't send reminders",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Deadline reminders</h1>
          <p className="text-muted-foreground">
            Never miss an opportunity — we track every upcoming deadline.
          </p>
        </div>
        {reminders && reminders.length > 0 && (
          <Button
            onClick={sendEmail}
            disabled={sending}
            className="rounded-full"
          >
            {sending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Email me these reminders
          </Button>
        )}
      </div>

      {!reminders ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="rounded-xl border border-dashed py-20 text-center">
          <CalendarClock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="mb-1 font-medium">No upcoming deadlines</p>
          <p className="mb-4 text-sm text-muted-foreground">
            You're all caught up. Browse more opportunities to keep going.
          </p>
          <Link
            to="/browse"
            className="text-sm font-medium text-primary underline"
          >
            Browse opportunities
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => {
            const u = urgency(r.days);
            const Icon = u.Icon;
            return (
              <div
                key={r.id}
                className="rounded-xl border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold font-heading">{r.title}</h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${u.cls}`}
                      >
                        <Icon className="h-3 w-3" />
                        {u.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {r.provider} · <span className="capitalize">{r.category}</span>
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarClock className="h-3 w-3" />
                      Due {new Date(r.deadline).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={googleCalendarUrl(r)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      <CalendarPlus className="h-3.5 w-3.5" />
                      Google Calendar
                    </a>
                    {r.application_link && (
                      <a
                        href={r.application_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        Open form
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <Link
                      to={`/opportunity/${r.opportunity_id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
