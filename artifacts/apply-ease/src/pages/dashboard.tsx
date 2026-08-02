import { useGetDashboardSummary, useGetApplicant, useGetApplicantSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileText, Send, CheckSquare, Bell, ArrowRight, Activity, Clock } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Dashboard() {
  const currentUserId = 1;
  const { data: dashboard, isLoading: dashLoading } = useGetDashboardSummary({ query: { enabled: true, queryKey: ['dashboardSummary'] }});
  const { data: user, isLoading: userLoading } = useGetApplicant(currentUserId);
  const { data: userSummary, isLoading: summaryLoading } = useGetApplicantSummary(currentUserId);

  if (dashLoading || userLoading || summaryLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <div className="grid md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const applicationsCount = userSummary?.applicationCount || 0;
  const documentsCount = userSummary?.documentCount || 0;
  const pendingActionCount = userSummary?.pendingVerifications || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">Here is what's happening with your applications today.</p>
        </div>
        <Button asChild className="rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6">
          <Link href="/applications/new">
            <Send className="mr-2 h-4 w-4" /> New Application
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Applications</CardTitle>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Send size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-foreground">{applicationsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Total submitted & in progress</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/60 shadow-sm hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Documents Ready</CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <FileText size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-foreground">{documentsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Stored securely</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/60 shadow-sm hover-elevate border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-accent">Pending Actions</CardTitle>
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <Bell size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-foreground">{pendingActionCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Verifications needed</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/60 shadow-sm hover-elevate bg-primary text-primary-foreground border-none relative overflow-hidden">
          <div className="absolute right-[-20%] bottom-[-20%] w-32 h-32 bg-white/10 rounded-full blur-[20px]" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80">Profile Completeness</CardTitle>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <CheckSquare size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">{userSummary?.completionPercent || 0}%</div>
            <div className="w-full bg-black/20 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-accent h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${userSummary?.completionPercent || 0}%` }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/40 bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Activity size={20} className="text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {dashboard?.recentActivity && dashboard.recentActivity.length > 0 ? (
              <div className="divide-y divide-border/40">
                {dashboard.recentActivity.slice(0, 5).map((event) => (
                  <div key={event.id} className="p-4 flex gap-4 hover:bg-muted/30 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-foreground font-medium">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock size={12} /> {format(new Date(event.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <Activity size={32} className="opacity-20 mb-3" />
                <p>No activity yet.</p>
                <p className="text-sm mt-1">Submit your first application to see activity.</p>
              </div>
            )}
            <div className="p-4 border-t border-border/40 text-center">
              <Button variant="link" className="text-primary text-sm h-auto p-0" asChild>
                <Link href="/applications">View all applications <ArrowRight size={14} className="ml-1" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm bg-muted/30 border-dashed border-2">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-primary mb-4 border border-border">
              <Send size={24} />
            </div>
            <h3 className="font-display font-bold text-xl mb-2">Ready to apply?</h3>
            <p className="text-muted-foreground mb-6 max-w-[280px]">
              We have your profile. Just tell us where you're applying and we'll handle the rest.
            </p>
            <Button className="rounded-full px-8 bg-foreground hover:bg-foreground/90" asChild>
              <Link href="/applications/new">Start Application</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
