import { readFile } from "node:fs/promises";

const app = await readFile("src/App.jsx", "utf8");
const css = await readFile("src/styles.css", "utf8");
const main = await readFile("src/main.jsx", "utf8");
const authPages = await readFile("src/auth-pages.tsx", "utf8");
const authComponent = await readFile("src/components/ui/login-signup.tsx", "utf8");

const expectedAppSnippets = [
  "Falcon Newsroom",
  "Pitch Board",
  "Stories",
  "StoriesPage",
  "initialStories",
  "Open Google Doc",
  "Copy link",
  "Submitted",
  "Needs Revision",
  "Doc unavailable",
  "PitchBoardPage",
  "initialAppPage",
  "New pitch",
  "Pitch review",
  "Editor feedback",
  "Add feedback",
  "Mark needs review",
  "Additional notes",
  "HeaderBreadcrumb",
  "pitchFeedbackItems",
  "groupActivePitchesByWriter",
  "PitchDetailPage",
  "PitchStatusText",
  "Expand all",
  "Collapse all",
  "Next active pitch",
  "Delete pitch",
  "Activity",
  "AI article extractor",
  "ArticleExtractorOverlay",
  "Articles Database",
  "Interviewee Database",
  "Story pipeline",
  "Analytics",
  "QuickCreateModal",
  "ResponsiveContainer",
  "runPrototypeTests",
  "normalizeArticleRecord",
  "/api/article-records",
  "/api/extract",
  "/api/save",
  "No interviewees recorded for this article yet.",
  "target=\"_blank\"",
  "AnimatedDropdown",
  "setDateSort",
  "Select an article",
  "handleSectionChange",
  "handleSearchChange",
  "ARTICLE_PAGE_SIZE",
  "buildPaginationItems",
  "resultCountParts",
  "totalRecords",
  "Select a source",
  "InterviewRecordInspector",
  "buildInterviewRecordRows",
  "handleGradeChange",
  "handleHouseChange",
  "handleRecordSelect",
  "Edit record",
  "Save changes",
  "Article information",
  "First name",
  "Last name",
  "Review interviewees",
  "Add another source row",
  "paginationPageButtonClass",
  "databaseStats",
];

for (const snippet of expectedAppSnippets) {
  if (!app.includes(snippet)) {
    throw new Error(`Missing expected App.jsx snippet: ${snippet}`);
  }
}

for (const snippet of ["Refresh</Button>", "Other interviewees in this article", "Why this structure works better", "Faculty / Staff", "Open pipeline", "+9 new", "+3 this week", "label: \"Pipeline\"", "label: \"Assignments\"", "label: \"Articles\"", "label: \"Interviewees\"", "Move to Development", "out of 2", "No pitches here", "Save Feedback", "PitchDetailBreadcrumb", "{ id: \"extractor\"", "ExtractorPage", "Mock extraction complete", "Quote evidence", "Confidence", "Review extracted interviewees", "Remove selected", "Deselect all", "Select all", "interviewee found.", "linked</StatusBadge>"]) {
  if (app.includes(snippet)) {
    throw new Error(`Found removed App.jsx snippet: ${snippet}`);
  }
}

for (const snippet of ["@tailwind base", "@tailwind components", "@tailwind utilities"]) {
  if (!css.includes(snippet)) {
    throw new Error(`Missing Tailwind directive: ${snippet}`);
  }
}

const expectedAuthSnippets = [
  "LoginCardSection",
  "SignUpCardSection",
  "Continue with Google",
  "Frontend preview only",
  "Authentication is not connected yet",
  "Create your account",
  "Welcome back",
];

for (const snippet of expectedAuthSnippets) {
  if (!authComponent.includes(snippet)) {
    throw new Error(`Missing expected auth component snippet: ${snippet}`);
  }
}

for (const snippet of ["Github", "GitHub", "fetch(", "axios"]) {
  if (authComponent.includes(snippet)) {
    throw new Error(`Auth component should remain Google-only and frontend-only; found: ${snippet}`);
  }
}

for (const snippet of ["authRoutes", "\"/login\"", "\"/signup\"", "AuthPages"]) {
  if (!main.includes(snippet)) {
    throw new Error(`Missing auth route wiring in main.jsx: ${snippet}`);
  }
}

for (const snippet of ["window.history.pushState", "SignUpCardSection", "LoginCardSection"]) {
  if (!authPages.includes(snippet)) {
    throw new Error(`Missing auth page behavior: ${snippet}`);
  }
}

console.log("Static smoke checks passed.");
