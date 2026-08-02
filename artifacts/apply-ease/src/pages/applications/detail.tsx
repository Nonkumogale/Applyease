import { useState } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetApplication, 
  useUpdateApplication,
  useGetCredentials,
  useSaveCredentials,
  useListVerificationRequests,
  useSubmitVerificationCode,
  useListApplicationEvents,
  getGetApplicationQueryKey,
  getGetCredentialsQueryKey,
  getListVerificationRequestsQueryKey,
  getListApplicationEventsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, GraduationCap, Briefcase, Award, Clock, ArrowLeft, 
  Key, ShieldAlert, Activity, ExternalLink, Copy, Check, Loader2, Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApplicationUpdateStatus } from "@workspace/api-client-react";

export default function ApplicationDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [copied, setCopied] = useState("");
  const [credForm, setCredForm] = useState({ loginEmail: "", loginPassword: "", notes: "" });
  const [isCredEditing, setIsCredEditing] = useState(false);
  const [verifCode, setVerifCode] = useState("");
  const [activeVerifId, setActiveVerifId] = useState<number | null>(null);

  const { data: app, isLoading: appLoading } = useGetApplication(id, { query: { enabled: !!id, queryKey: getGetApplicationQueryKey(id) } });
  const { data: creds } = useGetCredentials(id, { query: { enabled: !!id, queryKey: getGetCredentialsQueryKey(id) } });
  const { data: verifs } = useListVerificationRequests(id, { query: { enabled: !!id, queryKey: getListVerificationRequestsQueryKey(id) } });
  const { data: events } = useListApplicationEvents(id, { query: { enabled: !!id, queryKey: getListApplicationEventsQueryKey(id) } });

  const updateApp = useUpdateApplication();
  const saveCreds = useSaveCredentials();
  const submitVerif = useSubmitVerificationCode();

  const handleStatusChange = (status: ApplicationUpdateStatus) => {
    updateApp.mutate({ id, data: { status } }, {
      onSuccess: (data) => {
        toast({ title: "Status updated", description: `Application is now ${formatLabel(status)}` });
        queryClient.setQueryData(getGetApplicationQueryKey(id), old => old ? { ...old, status: data.status } : old);
        queryClient.invalidateQueries({ queryKey: getListApplicationEventsQueryKey(id) });
      }
    });
  };

  const handleSaveCreds = () => {
    saveCreds.mutate({ id, data: credForm }, {
      onSuccess: () => {
        toast({ title: "Credentials saved safely" });
        setIsCredEditing(false);
        queryClient.invalidateQueries({ queryKey: getGetCredentialsQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListApplicationEventsQueryKey(id) });
      }
    });
  };

  const handleSubmitVerif = (reqId: number) => {
    if (!verifCode) return;
    submitVerif.mutate({ id, reqId, data: { code: verifCode } }, {
      onSuccess: () => {
        toast({ title: "Code submitted to portal!" });
        setVerifCode("");
        setActiveVerifId(null);
        queryClient.invalidateQueries({ queryKey: getListVerificationRequestsQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListApplicationEventsQueryKey(id) });
      }
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const formatLabel = (str: string) => str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const getTypeIcon = (type?: string) => {
    switch(type) {
      case 'university': return <GraduationCap size={24} className="text-blue-600" />;
      case 'internship': return <Briefcase size={24} className="text-purple-600" />;
      case 'scholarship': return <Award size={24} className="text-amber-600" />;
      case 'bursary': return <Building2 size={24} className="text-emerald-600" />;
      default: return <Building2 size={24} />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'awaiting_verification': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (appLoading) return <div className="flex justify-center p-24"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  if (!app) return <div>Application not found</div>;

  const pendingVerifs = verifs?.filter(v => v.status === 'pending') || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Button variant="ghost" className="text-muted-foreground hover:text-foreground -ml-4" asChild>
        <Link href="/applications"><ArrowLeft className="mr-2 h-4 w-4" /> Back to List</Link>
      </Button>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center shrink-0">
            {getTypeIcon(app.applicationType)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-display font-bold tracking-tight">{app.organizationName}</h1>
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusColor(app.status)}`}>
                {formatLabel(app.status)}
              </span>
            </div>
            <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">{formatLabel(app.applicationType)}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select value={app.status} onValueChange={(val: any) => handleStatusChange(val)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ApplicationUpdateStatus).map(s => (
                <SelectItem key={s} value={s}>{formatLabel(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {app.applicationUrl && (
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <a href={app.applicationUrl} target="_blank" rel="noreferrer">
                Go to Portal <ExternalLink size={16} />
              </a>
            </Button>
          )}
        </div>
      </div>

      {pendingVerifs.length > 0 && (
        <div className="bg-accent/10 border-2 border-accent border-dashed rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-accent/10 pointer-events-none">
            <ShieldAlert size={120} />
          </div>
          <h3 className="font-display font-bold text-xl text-accent-foreground mb-2 flex items-center gap-2 z-10 relative">
            <ShieldAlert size={20} /> Action Required: Portal Verification
          </h3>
          <p className="text-accent-foreground/80 mb-6 max-w-2xl z-10 relative">
            The application portal has sent a verification code to our proxy email. Please submit it below so we can continue the process.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4 z-10 relative">
            {pendingVerifs.map(v => (
              <Card key={v.id} className="border-accent/20 bg-white/60 backdrop-blur-sm shadow-sm">
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground mb-3">{v.requestNote}</p>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter 6-digit code" 
                      value={activeVerifId === v.id ? verifCode : ""}
                      onChange={(e) => { setActiveVerifId(v.id); setVerifCode(e.target.value); }}
                      className="bg-white border-accent/20 focus-visible:ring-accent"
                    />
                    <Button 
                      className="bg-accent hover:bg-accent/90 shrink-0"
                      onClick={() => handleSubmitVerif(v.id)}
                      disabled={submitVerif.isPending && activeVerifId === v.id}
                    >
                      {submitVerif.isPending && activeVerifId === v.id ? <Loader2 className="animate-spin" /> : "Submit"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Clock size={20} className="text-primary" /> Application Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {events && events.length > 0 ? (
                <div className="p-6">
                  <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-4">
                    {events.map((event, idx) => (
                      <div key={event.id} className="relative pl-6">
                        <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${idx === 0 ? 'bg-primary' : 'bg-muted-foreground'}`} />
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                          <h4 className="font-bold text-foreground">{formatLabel(event.eventType)}</h4>
                          <span className="text-xs text-muted-foreground font-medium">
                            {format(new Date(event.createdAt), 'MMM d, yyyy • h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">No activity recorded yet.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Key size={20} className="text-amber-500" /> Portal Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!creds && !isCredEditing ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-500">
                    <Key size={20} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">No credentials saved yet. Store them here to never forget how to log in.</p>
                  <Button variant="outline" className="w-full" onClick={() => setIsCredEditing(true)}>Add Credentials</Button>
                </div>
              ) : isCredEditing ? (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Login Email/Username</Label>
                    <Input 
                      value={credForm.loginEmail} 
                      onChange={e => setCredForm({...credForm, loginEmail: e.target.value})} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Password</Label>
                    <Input 
                      type="password" 
                      value={credForm.loginPassword} 
                      onChange={e => setCredForm({...credForm, loginPassword: e.target.value})} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Notes (Optional)</Label>
                    <Input 
                      value={credForm.notes} 
                      onChange={e => setCredForm({...credForm, notes: e.target.value})} 
                      placeholder="e.g. Requires SSO"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCredEditing(false)}>Cancel</Button>
                    <Button type="button" className="flex-1" onClick={handleSaveCreds} disabled={saveCreds.isPending}>
                      {saveCreds.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center group">
                    <div className="overflow-hidden">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Login</p>
                      <p className="font-medium font-mono text-sm truncate">{creds?.loginEmail}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(creds?.loginEmail || '', 'email')}>
                      {copied === 'email' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center group pt-4 border-t border-border/50">
                    <div className="overflow-hidden">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Password</p>
                      <p className="font-medium font-mono text-sm tracking-widest truncate">••••••••••••</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(creds?.loginPassword || '', 'pass')}>
                      {copied === 'pass' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </Button>
                  </div>
                  
                  {creds?.notes && (
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Notes</p>
                      <p className="text-sm text-foreground/80">{creds.notes}</p>
                    </div>
                  )}
                  
                  <Button variant="outline" className="w-full mt-2" onClick={() => {
                    setCredForm({ loginEmail: creds?.loginEmail || "", loginPassword: creds?.loginPassword || "", notes: creds?.notes || "" });
                    setIsCredEditing(true);
                  }}>Edit Credentials</Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Activity size={20} className="text-blue-500" /> Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Contact Email</p>
                <p className="text-sm font-medium">{app.organizationEmail || 'None provided'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Deadline</p>
                <p className="text-sm font-medium">{app.deadline ? format(new Date(app.deadline), 'MMMM d, yyyy') : 'No deadline set'}</p>
              </div>
              {app.notes && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm">{app.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
