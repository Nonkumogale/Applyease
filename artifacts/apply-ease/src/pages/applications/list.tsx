import { useListApplications, getListApplicationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { format } from "date-fns";
import { useState } from "react";
import { Plus, Search, Building2, GraduationCap, Briefcase, Award, ArrowRight, Loader2 } from "lucide-react";
import { ApplicationApplicationType, ApplicationStatus } from "@workspace/api-client-react";

const currentUserId = 1;

// Mock data as fallback
const mockApplications = [
  {
    id: "1",
    applicationType: "internship",
    organizationName: "Google",
    status: "submitted",
    deadline: "2026-12-31",
    appliedAt: "2026-08-01"
  },
  {
    id: "2",
    applicationType: "scholarship",
    organizationName: "Microsoft",
    status: "completed",
    deadline: "2026-11-15",
    appliedAt: "2026-07-15"
  },
  {
    id: "3",
    applicationType: "bursary",
    organizationName: "Apple",
    status: "in_progress",
    deadline: "2026-10-01",
    appliedAt: "2026-07-20"
  },
  {
    id: "4",
    applicationType: "university",
    organizationName: "Stanford University",
    status: "awaiting_verification",
    deadline: "2026-09-30",
    appliedAt: "2026-06-10"
  }
];

export default function ApplicationsList() {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const queryParams: any = { applicantId: currentUserId };
  if (filterType !== "all") queryParams.type = filterType;
  if (filterStatus !== "all") queryParams.status = filterStatus;

  const { data: applications, isLoading, error } = useListApplications(queryParams, {
    query: { enabled: true, queryKey: getListApplicationsQueryKey(queryParams) }
  });

  // Use mock data if API fails or returns nothing
  const displayApplications = (applications && Array.isArray(applications) && applications.length > 0)
    ? applications
    : mockApplications;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'awaiting_verification': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'university': return <GraduationCap size={20} className="text-blue-600" />;
      case 'internship': return <Briefcase size={20} className="text-purple-600" />;
      case 'scholarship': return <Award size={20} className="text-amber-600" />;
      case 'bursary': return <Building2 size={20} className="text-emerald-600" />;
      default: return <Building2 size={20} />;
    }
  };

  const formatLabel = (str: string) => str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  if (error) {
    console.error('Error loading applications:', error);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Applications</h1>
          <p className="text-muted-foreground mt-1">Track all your opportunities in one place.</p>
        </div>
        <Button asChild className="rounded-full shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/applications/new"><Plus className="mr-2 h-4 w-4" /> New Application</Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-muted/30 p-2 rounded-2xl border border-border/50">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search organizations..."
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px] bg-white rounded-xl">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.values(ApplicationApplicationType).map(t => (
                <SelectItem key={t} value={t}>{formatLabel(t)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px] bg-white rounded-xl">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.values(ApplicationStatus).map(s => (
                <SelectItem key={s} value={s}>{formatLabel(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
      ) : error ? (
        <div className="text-center py-12 border-2 border-red-200 bg-red-50 rounded-2xl">
          <p className="text-red-600 font-medium">Error loading applications</p>
          <p className="text-red-500 text-sm mt-2">Using mock data instead. Please check if the API server is running.</p>
        </div>
      ) : displayApplications?.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-border rounded-2xl bg-muted/10">
          <Building2 size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-display font-bold text-xl mb-2">No applications found</h3>
          <p className="text-muted-foreground mb-6">You haven't started any applications yet, or none match your filters.</p>
          <Button asChild className="rounded-full"><Link href="/applications/new">Start One Now</Link></Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {displayApplications?.map((app: any) => (
            <Link key={app.id} href={`/applications/${app.id}`}>
              <Card className="hover-elevate cursor-pointer transition-all border-border/60 shadow-sm overflow-hidden group">
                <CardContent className="p-0">
                  <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      {getTypeIcon(app.applicationType)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-foreground truncate">{app.organizationName}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(app.status)}`}>
                          {formatLabel(app.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 truncate">
                        <span className="font-medium text-foreground/70">{formatLabel(app.applicationType)}</span>
                        {app.deadline && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span>Deadline: {format(new Date(app.deadline), 'MMM d, yyyy')}</span>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="hidden sm:flex text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
