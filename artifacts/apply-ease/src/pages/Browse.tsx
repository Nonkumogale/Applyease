import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import OpportunityCard from "@/components/OpportunityCard";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const categories = ["all", "bursary", "internship", "scholarship", "university"];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        const data = await apiClient.get('/opportunities');
        setOpportunities(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load opportunities:', error);
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    };
    loadOpportunities();
  }, []);

  const setCategory = (c) => {
    if (c === "all") setSearchParams({});
    else setSearchParams({ category: c });
  };

  const filtered = useMemo(() => {
    if (!opportunities || opportunities.length === 0) return [];
    return opportunities.filter((o) => {
      const matchCat =
        activeCategory === "all" || o.category === activeCategory;
      const matchQuery =
        !query ||
        o.title?.toLowerCase().includes(query.toLowerCase()) ||
        o.provider_name?.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [opportunities, activeCategory, query]);

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
        <h1 className="text-2xl font-bold font-heading">Browse opportunities</h1>
        <p className="text-muted-foreground">
          Verified bursaries, internships, scholarships, and universities.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                activeCategory === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative md:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed py-20 text-center text-muted-foreground">
          No opportunities found.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} />
          ))}
        </div>
      )}
    </div>
  );
}
