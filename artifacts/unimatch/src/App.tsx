import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Nav from "@/components/Nav";
import { AuthProvider } from "@/lib/auth";

import HomePage from "@/pages/HomePage";
import ComparePage from "@/pages/ComparePage";
import RankingsPage from "@/pages/RankingsPage";
import TrendingPage from "@/pages/TrendingPage";
import UniversityPage from "@/pages/UniversityPage";
import AiPicksPage from "@/pages/AiPicksPage";
import DashboardPage from "@/pages/DashboardPage";
import LawRankingsPage from "@/pages/LawRankingsPage";
import MbaRankingsPage from "@/pages/MbaRankingsPage";
import MedRankingsPage from "@/pages/MedRankingsPage";
import TradeRankingsPage from "@/pages/TradeRankingsPage";
import SchoolProfilePage from "@/pages/SchoolProfilePage";
import ContactPage from "@/pages/ContactPage";
import ProfilePage from "@/pages/ProfilePage";
import PublicProfilePage from "@/pages/PublicProfilePage";
import StudentJourneyPage from "@/pages/StudentJourneyPage";
import NotificationsPage from "@/pages/NotificationsPage";
import PostPage from "@/pages/PostPage";
import SocialPage from "@/pages/SocialPage";
import ChanceMe from "@/pages/ChanceMe";
import SearchPage from "@/pages/SearchPage";
import ExplorePage from "@/pages/ExplorePage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/compare" component={ComparePage} />
      <Route path="/rankings" component={RankingsPage} />
      <Route path="/law" component={LawRankingsPage} />
      <Route path="/med" component={MedRankingsPage} />
      <Route path="/mba" component={MbaRankingsPage} />
      <Route path="/trade" component={TradeRankingsPage} />
      <Route path="/trending" component={TrendingPage} />
      <Route path="/university/:id" component={UniversityPage} />
      <Route path="/school/:type/:id" component={SchoolProfilePage} />
      <Route path="/ai-picks" component={AiPicksPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/profile/:username" component={PublicProfilePage} />
      <Route path="/student-journey" component={StudentJourneyPage} />
      <Route path="/notifications" component={NotificationsPage} />
      <Route path="/post/:id" component={PostPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/social" component={SocialPage} />
      <Route path="/chance-me" component={ChanceMe} />
      <Route path="/search" component={SearchPage} />
      <Route path="/explore" component={ExplorePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <div className="min-h-[100dvh] bg-background text-foreground flex flex-col relative overflow-x-hidden selection:bg-primary/30">
              <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
              <Nav />
              <main className="flex-1 relative z-10 w-full">
                <Router />
              </main>
            </div>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
