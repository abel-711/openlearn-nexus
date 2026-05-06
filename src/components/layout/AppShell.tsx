import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { AuroraBackground } from "./AuroraBackground";
import { Sidebar } from "./Sidebar";
import { CommandBar } from "./CommandBar";
import { ContextPanel } from "./ContextPanel";
import { ViewKey } from "@/lib/workspace";
import { HomeView } from "../workspace/HomeView";
import { SearchView } from "../workspace/SearchView";
import { MentorView } from "../workspace/MentorView";
import { PlannerView } from "../workspace/PlannerView";
import { GraphView } from "../workspace/GraphView";
import { FocusView } from "../workspace/FocusView";
import { AnalyticsView } from "../workspace/AnalyticsView";

export const AppShell = () => {
  const [view, setView] = useState<ViewKey>("home");
  const [collapsed, setCollapsed] = useState(false);
  const [askedQuery, setAskedQuery] = useState<string | undefined>();
  const [mentorSeed, setMentorSeed] = useState<string | undefined>();

  const handleAsk = (q: string) => {
    const lower = q.toLowerCase();
    if (lower.startsWith("explain") || lower.startsWith("ask") || lower.includes("mentor")) {
      setMentorSeed(q);
      setView("mentor");
    } else if (lower.includes("plan")) setView("planner");
    else if (lower.includes("graph")) setView("graph");
    else { setAskedQuery(q); setView("search"); }
  };

  return (
    <div className="relative min-h-screen text-foreground">
      <AuroraBackground />
      <div className="flex min-h-screen">
        <Sidebar view={view} onChange={setView} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <CommandBar onAsk={handleAsk} />
          <div className="flex min-h-0 flex-1">
            <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 12, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.99 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {view === "home" && <HomeView onNavigate={setView} />}
                  {view === "search" && <SearchView initialQuery={askedQuery} />}
                  {view === "mentor" && <MentorView initial={mentorSeed} />}
                  {view === "planner" && <PlannerView />}
                  {view === "graph" && <GraphView />}
                  {view === "focus" && <FocusView />}
                  {view === "analytics" && <AnalyticsView />}
                </motion.div>
              </AnimatePresence>
            </main>
            <ContextPanel />
          </div>
        </div>
      </div>
    </div>
  );
};
