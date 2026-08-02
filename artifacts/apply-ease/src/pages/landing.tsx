import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, FileText, CheckSquare, Sparkles, Bell } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-accent selection:text-white">
      <header className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle2 size={28} strokeWidth={2.5} className="text-accent" />
          <span className="font-display font-bold text-2xl tracking-tight">ApplyEase</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
        </nav>
        <div className="flex gap-4">
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/dashboard">Sign In</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">
            <Link href="/onboarding">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center max-w-4xl relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -z-10" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-medium mb-8 border border-primary/10">
            <Sparkles size={16} />
            <span>The personal concierge for ambitious students.</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold text-foreground leading-[1.1] tracking-tight mb-8">
            Stop filling out <br/>
            <span className="text-primary relative inline-block">
              the same forms.
              <svg className="absolute -bottom-2 left-0 w-full text-accent" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 9.5C48.5 3.5 142.5 -2.5 198 9.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-12 font-medium leading-relaxed">
            Upload your documents once. We manage your bursary, internship, and university applications, store portals, and track deadlines.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="h-14 px-8 rounded-full text-lg bg-accent hover:bg-accent/90 text-white shadow-xl shadow-accent/20 transition-all hover:scale-105 active:scale-95" asChild>
              <Link href="/onboarding">
                Start your profile <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg border-2" asChild>
              <Link href="/dashboard">View demo dashboard</Link>
            </Button>
          </div>
        </section>

        {/* Feature grid */}
        <section className="bg-white py-24 border-y border-border" id="features">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="flex flex-col gap-4 items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <FileText size={32} />
                </div>
                <h3 className="font-display font-bold text-xl">Centralised Documents</h3>
                <p className="text-muted-foreground leading-relaxed">Store your ID, transcripts, and CVs safely. Never dig through your downloads folder again.</p>
              </div>
              <div className="flex flex-col gap-4 items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-2">
                  <CheckSquare size={32} />
                </div>
                <h3 className="font-display font-bold text-xl">Track Everything</h3>
                <p className="text-muted-foreground leading-relaxed">Know exactly where every application stands. Keep deadlines and portal links in one view.</p>
              </div>
              <div className="flex flex-col gap-4 items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-2">
                  <Bell size={32} />
                </div>
                <h3 className="font-display font-bold text-xl">Actionable Alerts</h3>
                <p className="text-muted-foreground leading-relaxed">We'll let you know when an application needs a verification code or portal action.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 text-center text-muted-foreground">
        <div className="container mx-auto px-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-primary opacity-50">
            <CheckCircle2 size={20} />
            <span className="font-display font-bold text-lg">ApplyEase</span>
          </div>
          <p>© 2024 ApplyEase. For ambitious students.</p>
        </div>
      </footer>
    </div>
  );
}
