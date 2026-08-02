import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateApplication } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, GraduationCap, Briefcase, Award, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { ApplicationInputApplicationType } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const currentUserId = 1;

export default function ApplicationsNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  const createApplication = useCreateApplication();

  const [formData, setFormData] = useState({
    applicationType: "" as ApplicationInputApplicationType,
    organizationName: "",
    organizationEmail: "",
    applicationUrl: "",
    deadline: "",
    notes: ""
  });

  const types = [
    { id: "university", label: "University", icon: GraduationCap, color: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100", desc: "Undergrad or postgrad degrees" },
    { id: "bursary", label: "Bursary", icon: Building2, color: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100", desc: "Corporate or state funding" },
    { id: "scholarship", label: "Scholarship", icon: Award, color: "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100", desc: "Merit-based financial aid" },
    { id: "internship", label: "Internship", icon: Briefcase, color: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100", desc: "Work experience & grad programs" },
  ];

  const handleNext = () => {
    if (step === 1 && !formData.applicationType) {
      toast({ title: "Please select an application type", variant: "destructive" });
      return;
    }
    if (step === 2 && !formData.organizationName) {
      toast({ title: "Organization name is required", variant: "destructive" });
      return;
    }
    setStep(s => s + 1);
  };

  const handleSubmit = () => {
    createApplication.mutate({
      data: {
        applicantId: currentUserId,
        applicationType: formData.applicationType,
        organizationName: formData.organizationName,
        organizationEmail: formData.organizationEmail || undefined,
        applicationUrl: formData.applicationUrl || undefined,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
        notes: formData.notes || undefined,
      }
    }, {
      onSuccess: (data) => {
        toast({ title: "Application tracking started!" });
        setLocation(`/applications/${data.id}`);
      },
      onError: () => {
        toast({ title: "Something went wrong", variant: "destructive" });
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground" onClick={() => step > 1 ? setStep(step - 1) : setLocation("/applications")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-4 mb-2">
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-2 rounded-full transition-all duration-300 ${step >= i ? "w-8 bg-primary" : "w-4 bg-primary/20"}`} />
            ))}
          </div>
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Step {step} of 3</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
          {step === 1 && "What are you applying for?"}
          {step === 2 && "Organization Details"}
          {step === 3 && "Review & Start"}
        </h1>
      </div>

      <div className="min-h-[400px]">
        {step === 1 && (
          <div className="grid sm:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-300">
            {types.map((t) => {
              const Icon = t.icon;
              const isSelected = formData.applicationType === t.id;
              return (
                <div 
                  key={t.id}
                  onClick={() => setFormData({...formData, applicationType: t.id as any})}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${isSelected ? `border-primary ring-4 ring-primary/20 ${t.color.split(' ')[0]}` : `border-border bg-white hover:border-primary/50`}`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${isSelected ? "bg-white shadow-sm" : t.color}`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="font-display font-bold text-xl mb-1">{t.label}</h3>
                  <p className="text-muted-foreground text-sm">{t.desc}</p>
                </div>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <Card className="border-border/60 shadow-sm p-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="orgName" className="text-base font-semibold">Organization / Institution Name <span className="text-destructive">*</span></Label>
                  <Input 
                    id="orgName" 
                    placeholder="e.g. Standard Bank, University of Cape Town" 
                    className="h-12 text-lg"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                  />
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input 
                      id="deadline" 
                      type="date" 
                      className="h-11"
                      value={formData.deadline}
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url">Portal URL</Label>
                    <Input 
                      id="url" 
                      type="url" 
                      placeholder="https://..." 
                      className="h-11"
                      value={formData.applicationUrl}
                      onChange={(e) => setFormData({...formData, applicationUrl: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="hr@organization.com" 
                    className="h-11"
                    value={formData.organizationEmail}
                    onChange={(e) => setFormData({...formData, organizationEmail: e.target.value})}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Internal Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Any specific requirements or thoughts..." 
                    className="resize-none h-24"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <Card className="border-border/60 shadow-sm p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px]" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  {formData.applicationType === 'university' ? <GraduationCap size={32} /> :
                   formData.applicationType === 'internship' ? <Briefcase size={32} /> :
                   formData.applicationType === 'scholarship' ? <Award size={32} /> : <Building2 size={32} />}
                </div>
                <div>
                  <h3 className="font-display font-bold text-2xl">{formData.organizationName}</h3>
                  <p className="text-muted-foreground uppercase tracking-wider text-sm font-bold">{formData.applicationType}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-4 text-sm mt-8 border-t border-border/50 pt-6">
                <div>
                  <p className="text-muted-foreground mb-1">Deadline</p>
                  <p className="font-medium">{formData.deadline ? new Date(formData.deadline).toLocaleDateString() : 'Not set'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Portal Link</p>
                  <p className="font-medium text-primary truncate pr-4">
                    {formData.applicationUrl ? <a href={formData.applicationUrl} target="_blank" rel="noreferrer" className="hover:underline">{formData.applicationUrl}</a> : 'Not set'}
                  </p>
                </div>
              </div>
            </Card>
            
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-accent-foreground text-sm flex items-start gap-3">
              <div className="mt-0.5"><Building2 size={16} className="text-accent" /></div>
              <p>Once created, you can attach documents from your vault and securely store your portal credentials on the application dashboard.</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        {step < 3 ? (
          <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white h-12" onClick={handleNext}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button size="lg" className="rounded-full px-8 bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20 h-12" onClick={handleSubmit} disabled={createApplication.isPending}>
            {createApplication.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Start Tracking
          </Button>
        )}
      </div>
    </div>
  );
}
