import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import CategoryCard from "@/components/CategoryCard";
import DashboardStats from "@/components/DashboardStats";
import {
  ArrowRight,
  FileCheck2,
  Sparkles,
  ShieldCheck,
  Bell,
  FileText,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = ["bursary", "internship", "scholarship", "university"];

const features = [
  {
    icon: FileText,
    tile: "bg-primary/10 text-primary",
    title: "Centralised documents",
    desc: "Store your ID, transcripts, and CVs safely. Never dig through your downloads folder again.",
  },
  {
    icon: CheckSquare,
    tile: "bg-accent/10 text-accent",
    title: "Track everything",
    desc: "Know exactly where every application stands. Keep deadlines and portal links in one view.",
  },
  {
    icon: Bell,
    tile: "bg-blue-500/10 text-blue-600",
    title: "Actionable alerts",
    desc: "We'll let you know when an application needs a verification code or portal action.",
  },
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await apiClient.get('/auth/me');
        setUser(u);
        
        if (u && u.id) {
          const profiles = await apiClient.get(`/profiles?userId=${u.id}`);
          setProfile(Array.isArray(profiles) ? profiles[0] || null : null);
        }
      } catch (error) {
        console.log('User not logged in');
      }
    };
    loadUser();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center px-2 pt-12 pb-20 text-center md:pt-20 md:pb-28">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-80 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[120px] md:h-[400px] md:w-[800px]" />

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          <span>The personal concierge for ambitious students.</span>
        </div>

        <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight font-display sm:text-5xl md:text-6xl lg:text-7xl">
          Apply once.
          <br />
          <span className="relative inline-block text-primary">
            We handle the rest.
            <svg
              className="absolute -bottom-2 left-0 w-full text-accent"
              viewBox="0 0 200 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 9.5C48.5 3.5 142.5 -2.5 198 9.5"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        <p className="mb-10 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground md:text-xl">
          Upload your documents once. We prepare your bursary, internship,
          scholarship, and university applications — and track every deadline
          along the way.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/profile">
            <Button
              size="lg"
              className="h-14 rounded-full bg-accent px-8 text-lg text-white shadow-xl shadow-accent/20 transition-all hover:scale-105 hover:bg-accent/90 active:scale-95"
            >
              Start your profile
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

        </div>
      </section>

      <DashboardStats />

      {/* Feature grid */}
      <section id="features" className="border-y border-border bg-card py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-3 md:gap-12">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <div
                    className={`mb-1 flex h-16 w-16 items-center justify-center rounded-2xl ${f.tile}`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold font-display">{f.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-20">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold font-display md:text-4xl">
            What are you applying for?
          </h2>
          <p className="text-muted-foreground">
            Pick a category and we'll show you verified opportunities.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <CategoryCard key={c} category={c} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="pb-16 md:pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: FileCheck2,
              title: "1. Build your profile",
              desc: "Upload your documents and details once. We reuse them for every application.",
            },
            {
              icon: Sparkles,
              title: "2. Pick an opportunity",
              desc: "Browse verified bursaries, internships, scholarships, and universities.",
            },
            {
              icon: ShieldCheck,
              title: "3. We prepare your application",
              desc: "We auto-generate a tailored cover letter and compile a ready-to-submit package.",
            },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="rounded-2xl border bg-card p-6 shadow-sm"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 font-semibold font-display">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
