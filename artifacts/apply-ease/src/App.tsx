import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import Landing from '@/pages/landing';
import Onboarding from '@/pages/onboarding';
import Dashboard from '@/pages/dashboard';
import Documents from '@/pages/documents';
import ApplicationsList from '@/pages/applications/list';
import ApplicationsNew from '@/pages/applications/new';
import ApplicationDetail from '@/pages/applications/detail';
import Profile from '@/pages/profile';
import AppLayout from '@/components/layout/AppLayout';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public / Landing Route */}
      <Route path="/" component={Landing} />
      
      {/* Onboarding */}
      <Route path="/onboarding" component={Onboarding} />

      {/* App Routes */}
      <Route path="/dashboard"><AppLayout><Dashboard /></AppLayout></Route>
      <Route path="/documents"><AppLayout><Documents /></AppLayout></Route>
      <Route path="/applications"><AppLayout><ApplicationsList /></AppLayout></Route>
      <Route path="/applications/new"><AppLayout><ApplicationsNew /></AppLayout></Route>
      <Route path="/applications/:id"><AppLayout><ApplicationDetail /></AppLayout></Route>
      <Route path="/profile"><AppLayout><Profile /></AppLayout></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
