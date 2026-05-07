export type ViewKey = "home" | "search" | "mentor" | "library" | "planner" | "graph" | "focus" | "analytics";

export const VIEWS: { key: ViewKey; label: string; hint: string }[] = [
  { key: "home", label: "Home", hint: "Your momentum" },
  { key: "search", label: "AI Search", hint: "Semantic universe" },
  { key: "mentor", label: "Mentor", hint: "AI co-pilot" },
  { key: "library", label: "Library", hint: "Chapter materials" },
  { key: "planner", label: "Planner", hint: "Adaptive schedule" },
  { key: "graph", label: "Knowledge Graph", hint: "Concept map" },
  { key: "focus", label: "Focus", hint: "Deep work" },
  { key: "analytics", label: "Analytics", hint: "Mastery insights" },
];
