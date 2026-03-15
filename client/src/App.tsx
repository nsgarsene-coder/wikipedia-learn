/**
 * App.tsx — Wikipedia Learn
 * Routing principal et providers globaux
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import RegisterPromptModal from "./components/RegisterPromptModal";

import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import MindmapPage from "./pages/MindmapPage";
import QuizPage from "./pages/QuizPage";
import AuthPage from "./pages/AuthPage";
import RevisionPage from "./pages/RevisionPage";
import AchievementsPage from "./pages/AchievementsPage";

function Router() {
  return (
    <Switch>
      {/* Home */}
      <Route path="/" component={Home} />

      {/* Search results — chapters of a topic */}
      <Route path="/search" component={SearchResults} />

      {/* Mindmap — nodes of a chapter */}
      <Route path="/topic/:topic/chapter/:chapter" component={MindmapPage} />

      {/* Quiz — questions for a node */}
      <Route path="/topic/:topic/chapter/:chapter/node/:node/quiz" component={QuizPage} />

      {/* Revision session */}
      <Route path="/revision/:topic" component={RevisionPage} />

      {/* Auth */}
      <Route path="/login">
        {() => <AuthPage mode="login" />}
      </Route>
      <Route path="/register">
        {() => <AuthPage mode="register" />}
      </Route>

      {/* Achievements */}
      <Route path="/achievements" component={AchievementsPage} />

      {/* Placeholder pages */}
      <Route path="/explore" component={Home} />
      <Route path="/library" component={Home} />
      <Route path="/archives" component={Home} />
      <Route path="/curation" component={Home} />
      <Route path="/privacy" component={Home} />

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <RegisterPromptModal />
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
