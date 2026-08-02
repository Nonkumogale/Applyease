import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateApplicant } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const step1Schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
});

const step2Schema = z.object({
  idNumber: z.string().min(6, "ID/Passport number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().optional(),
});

const step3Schema = z.object({
  institution: z.string().min(2, "Current/Target institution is required"),
  course: z.string().min(2, "Course of study is required"),
  yearOfStudy: z.string().min(1, "Year of study is required"),
});

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  
  const createApplicant = useCreateApplicant();

  const [formData, setFormData] = useState<any>({});

  const form1 = useForm({ resolver: zodResolver(step1Schema), defaultValues: { fullName: "", email: "", phone: "" } });
  const form2 = useForm({ resolver: zodResolver(step2Schema), defaultValues: { idNumber: "", dateOfBirth: "", address: "" } });
  const form3 = useForm({ resolver: zodResolver(step3Schema), defaultValues: { institution: "", course: "", yearOfStudy: "" } });

  const onSubmitStep1 = (data: z.infer<typeof step1Schema>) => {
    setFormData({ ...formData, ...data });
    setStep(2);
  };

  const onSubmitStep2 = (data: z.infer<typeof step2Schema>) => {
    setFormData({ ...formData, ...data });
    setStep(3);
  };

  const onSubmitStep3 = (data: z.infer<typeof step3Schema>) => {
    const finalData = { ...formData, ...data };
    
    createApplicant.mutate({
      data: {
        fullName: finalData.fullName,
        email: finalData.email,
        phone: finalData.phone,
        idNumber: finalData.idNumber,
        dateOfBirth: new Date(finalData.dateOfBirth).toISOString(),
        address: finalData.address,
        institution: finalData.institution,
        course: finalData.course,
        yearOfStudy: parseInt(finalData.yearOfStudy, 10),
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Profile created!",
          description: "Welcome to ApplyEase.",
        });
        setLocation("/dashboard");
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create profile. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className="hidden md:flex w-1/3 bg-primary p-12 flex-col justify-between text-primary-foreground relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-20%] w-[500px] h-[500px] rounded-full bg-white/5 blur-[80px]" />
        <div>
          <div className="flex items-center gap-2 mb-16">
            <CheckCircle2 size={32} strokeWidth={2.5} className="text-accent" />
            <span className="font-display font-bold text-3xl">ApplyEase</span>
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight mb-6">
            Your personal application concierge.
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Let's get your foundational details set up. You only have to do this once.
          </p>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className={`transition-all duration-300 ${step >= 1 ? "opacity-100" : "opacity-40"}`}>
            <p className="font-bold text-sm text-accent uppercase tracking-wider mb-1">Step 1</p>
            <p className="font-medium text-lg">Basic Information</p>
          </div>
          <div className={`transition-all duration-300 ${step >= 2 ? "opacity-100" : "opacity-40"}`}>
            <p className="font-bold text-sm text-accent uppercase tracking-wider mb-1">Step 2</p>
            <p className="font-medium text-lg">Identity Details</p>
          </div>
          <div className={`transition-all duration-300 ${step >= 3 ? "opacity-100" : "opacity-40"}`}>
            <p className="font-bold text-sm text-accent uppercase tracking-wider mb-1">Step 3</p>
            <p className="font-medium text-lg">Academic Profile</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-500">
        <div className="w-full max-w-md">
          {step === 1 && (
            <Form {...form1}>
              <form onSubmit={form1.handleSubmit(onSubmitStep1)} className="space-y-6">
                <div>
                  <h1 className="text-3xl font-display font-bold text-foreground mb-2">Hello there</h1>
                  <p className="text-muted-foreground">What should we call you?</p>
                </div>
                
                <FormField control={form1.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Legal Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} className="h-12 bg-white" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form1.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl><Input placeholder="john@example.com" type="email" {...field} className="h-12 bg-white" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form1.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input placeholder="+27 82 123 4567" {...field} className="h-12 bg-white" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <Button type="submit" className="w-full h-12 text-md rounded-xl group mt-8">
                  Continue <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </Form>
          )}

          {step === 2 && (
            <Form {...form2}>
              <form onSubmit={form2.handleSubmit(onSubmitStep2)} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div>
                  <h1 className="text-3xl font-display font-bold text-foreground mb-2">Identity Details</h1>
                  <p className="text-muted-foreground">We need this for official applications.</p>
                </div>
                
                <FormField control={form2.control} name="idNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID or Passport Number</FormLabel>
                    <FormControl><Input placeholder="Your ID number" {...field} className="h-12 bg-white" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form2.control} name="dateOfBirth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl><Input type="date" {...field} className="h-12 bg-white" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form2.control} name="address" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Residential Address (Optional)</FormLabel>
                    <FormControl><Input placeholder="123 Main St, City" {...field} className="h-12 bg-white" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <div className="flex gap-4 mt-8">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-12 w-24 rounded-xl">Back</Button>
                  <Button type="submit" className="flex-1 h-12 text-md rounded-xl group">
                    Continue <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {step === 3 && (
            <Form {...form3}>
              <form onSubmit={form3.handleSubmit(onSubmitStep3)} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div>
                  <h1 className="text-3xl font-display font-bold text-foreground mb-2">Academic Profile</h1>
                  <p className="text-muted-foreground">What are you studying?</p>
                </div>
                
                <FormField control={form3.control} name="institution" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution Name</FormLabel>
                    <FormControl><Input placeholder="University of..." {...field} className="h-12 bg-white" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form3.control} name="course" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course / Degree</FormLabel>
                    <FormControl><Input placeholder="BSc Computer Science" {...field} className="h-12 bg-white" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form3.control} name="yearOfStudy" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year of Study</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-white">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                        <SelectItem value="5">Postgraduate</SelectItem>
                        <SelectItem value="0">High School / Matric</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <div className="flex gap-4 mt-8">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="h-12 w-24 rounded-xl" disabled={createApplicant.isPending}>Back</Button>
                  <Button type="submit" className="flex-1 h-12 text-md rounded-xl bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20" disabled={createApplicant.isPending}>
                    {createApplicant.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                    Complete Setup
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
