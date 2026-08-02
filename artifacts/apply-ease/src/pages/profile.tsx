import { useGetApplicant, useUpdateApplicant, useGetApplicantSummary, getGetApplicantQueryKey, getGetApplicantSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, User, Mail, Phone, MapPin, Building, GraduationCap, Calendar, Hash } from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const currentUserId = 1;

export default function Profile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: user, isLoading: userLoading } = useGetApplicant(currentUserId, {
    query: { enabled: true, queryKey: getGetApplicantQueryKey(currentUserId) }
  });
  
  const { data: summary, isLoading: summaryLoading } = useGetApplicantSummary(currentUserId, {
    query: { enabled: true, queryKey: getGetApplicantSummaryQueryKey(currentUserId) }
  });

  const updateApplicant = useUpdateApplicant();

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        idNumber: user.idNumber || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : "",
        address: user.address || "",
        institution: user.institution || "",
        course: user.course || "",
        yearOfStudy: user.yearOfStudy || "",
      });
    }
  }, [user]);

  const handleSave = () => {
    updateApplicant.mutate({
      id: currentUserId,
      data: {
        ...formData,
        yearOfStudy: formData.yearOfStudy ? parseInt(formData.yearOfStudy, 10) : undefined
      }
    }, {
      onSuccess: () => {
        toast({ title: "Profile updated successfully!" });
        setIsEditing(false);
        queryClient.invalidateQueries({ queryKey: getGetApplicantQueryKey(currentUserId) });
        queryClient.invalidateQueries({ queryKey: getGetApplicantSummaryQueryKey(currentUserId) });
      }
    });
  };

  if (userLoading || summaryLoading) {
    return <div className="flex justify-center p-24"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-primary text-primary-foreground p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/3" />
        <div className="flex items-center gap-6 z-10">
          <div className="w-24 h-24 rounded-full bg-primary-foreground/10 flex items-center justify-center border-4 border-primary-foreground/20 text-4xl font-display font-bold">
            {user?.fullName?.charAt(0) || "U"}
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">{user?.fullName}</h1>
            <p className="text-primary-foreground/80 flex items-center gap-2 mt-1">
              <GraduationCap size={16} /> {user?.institution || "No institution set"}
            </p>
          </div>
        </div>
        <div className="z-10 bg-primary-foreground/10 rounded-2xl p-4 min-w-[200px] text-center border border-primary-foreground/10">
          <p className="text-sm text-primary-foreground/70 mb-1 font-medium uppercase tracking-wider">Profile Completeness</p>
          <div className="flex items-end justify-center gap-2">
            <span className="text-4xl font-display font-bold">{summary?.completionPercent || 0}%</span>
            {summary?.completionPercent === 100 && <CheckCircle2 className="text-accent mb-2" size={20} />}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        {isEditing ? (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateApplicant.isPending} className="bg-primary hover:bg-primary/90 rounded-full px-6">
              {updateApplicant.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)} className="rounded-full px-6 bg-foreground hover:bg-foreground/90">
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/40 bg-muted/10">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <User size={20} className="text-primary" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid gap-2">
              <Label className="text-muted-foreground flex items-center gap-2"><User size={14} /> Full Name</Label>
              {isEditing ? (
                <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              ) : (
                <p className="font-medium">{user?.fullName}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label className="text-muted-foreground flex items-center gap-2"><Mail size={14} /> Email Address</Label>
              {isEditing ? (
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              ) : (
                <p className="font-medium">{user?.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label className="text-muted-foreground flex items-center gap-2"><Phone size={14} /> Phone Number</Label>
              {isEditing ? (
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              ) : (
                <p className="font-medium">{user?.phone || '—'}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label className="text-muted-foreground flex items-center gap-2"><Hash size={14} /> ID/Passport Number</Label>
              {isEditing ? (
                <Input value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} />
              ) : (
                <p className="font-medium">{user?.idNumber || '—'}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label className="text-muted-foreground flex items-center gap-2"><Calendar size={14} /> Date of Birth</Label>
              {isEditing ? (
                <Input type="date" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
              ) : (
                <p className="font-medium">{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : '—'}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label className="text-muted-foreground flex items-center gap-2"><MapPin size={14} /> Address</Label>
              {isEditing ? (
                <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              ) : (
                <p className="font-medium">{user?.address || '—'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm h-fit">
          <CardHeader className="border-b border-border/40 bg-muted/10">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Building size={20} className="text-accent" /> Academic Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Institution Name</Label>
              {isEditing ? (
                <Input value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} />
              ) : (
                <p className="font-medium">{user?.institution || '—'}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Course / Degree</Label>
              {isEditing ? (
                <Input value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} />
              ) : (
                <p className="font-medium">{user?.course || '—'}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Year of Study</Label>
              {isEditing ? (
                <Input type="number" min="0" max="10" value={formData.yearOfStudy} onChange={e => setFormData({...formData, yearOfStudy: e.target.value})} />
              ) : (
                <p className="font-medium">{user?.yearOfStudy === 0 ? 'High School' : user?.yearOfStudy ? `Year ${user.yearOfStudy}` : '—'}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
