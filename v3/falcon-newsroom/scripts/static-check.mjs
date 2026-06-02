import { readFile } from "node:fs/promises";

const app = await readFile("src/App.jsx", "utf8");
const css = await readFile("src/styles.css", "utf8");
const main = await readFile("src/main.jsx", "utf8");
const authPages = await readFile("src/auth-pages.tsx", "utf8");
const authComponent = await readFile("src/components/ui/login-signup.tsx", "utf8");
const packageJson = await readFile("package.json", "utf8");
const viteConfig = await readFile("vite.config.js", "utf8");
const v3Backend = await readFile("server/auth_app.py", "utf8");
const devScript = await readFile("scripts/dev.mjs", "utf8");

const expectedAppSnippets = [
  "Falcon Newsroom",
  "LandingPage",
  "LandingDeskScene",
  "Move school journalism",
  "Open newsroom",
  "Review stories",
  "Pitch Board",
  "Stories",
  "StoriesPage",
  "initialStories",
  "Open Google Doc",
  "Copy link",
  "Link doc",
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
  "AccountMenu",
  "Sign out",
  "/api/auth/logout",
  "X-CSRF-Token",
  "loginRedirectForCurrentPath",
  "navItemsForRole",
  "roleCanAccessPage",
  "/api/admin/users",
  "/api/stories",
  "/api/pitches",
  "/api/activity",
  "/api/feedback",
  "useWorkflowActivity",
  "useEntityFeedback",
  "normalizeDisplayPitch",
  "formatDisplayDate",
  "onStoryCreated",
  "Approved pitch and moved it to Stories.",
  "canManageEditorialWorkflow",
];

for (const snippet of expectedAppSnippets) {
  if (!app.includes(snippet)) {
    throw new Error(`Missing expected App.jsx snippet: ${snippet}`);
  }
}

for (const snippet of ["Refresh</Button>", "Other interviewees in this article", "Why this structure works better", "Faculty / Staff", "Open pipeline", "+9 new", "+3 this week", "label: \"Pipeline\"", "label: \"Assignments\"", "label: \"Articles\"", "label: \"Interviewees\"", "Move to Development", "out of 2", "No pitches here", "Save Feedback", "PitchDetailBreadcrumb", "{ id: \"extractor\"", "ExtractorPage", "Mock extraction complete", "Quote evidence", "Confidence", "Review extracted interviewees", "Remove selected", "Deselect all", "Select all", "interviewee found.", "linked</StatusBadge>", "StoryQueueMetric", "STORY_FILTER_EDITORS", "editorFilter", "MiniStat", ">Owner</th>", ">Doc</th>", "StatusBadge tone={storyStatusTone", "{story.section} / Last edited", "fmt(story.wordCount)} words", "story.sourceCount} sources", "story.revisionCount} revisions", "withPitchActivity", "Draft last edited", "left feedback on this pitch", "No feedback yet.", "onAddFeedback", "onEditFeedback", "onDeleteFeedback", "writers={[accountDisplayName(currentUser)]}", "Approved pitch and removed it from the active board."]) {
  if (app.includes(snippet)) {
    throw new Error(`Found removed App.jsx snippet: ${snippet}`);
  }
}

for (const snippet of ["@tailwind base", "@tailwind components", "@tailwind utilities", ".landing-page", "oklch("]) {
  if (!css.includes(snippet)) {
    throw new Error(`Missing expected CSS snippet: ${snippet}`);
  }
}

const expectedAuthSnippets = [
  "LoginCardSection",
  "SignUpCardSection",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/google/start",
  "credentials: \"include\"",
  "safeRedirectTarget",
  "AUTH_BUFFER_MS",
  "Continue with Google",
  "Create your account",
  "Welcome back",
  "First name",
  "Last name",
  "Confirm password",
];

for (const snippet of expectedAuthSnippets) {
  if (!authComponent.includes(snippet)) {
    throw new Error(`Missing expected auth component snippet: ${snippet}`);
  }
}

for (const snippet of ["Github", "GitHub", "Frontend preview only", "Authentication is not connected yet", "Google sign-in is a frontend preview only", "Contact", "I agree", "rounded-lg border px-3 py-2", "axios"]) {
  if (authComponent.includes(snippet)) {
    throw new Error(`Auth component should be backend-connected without preview-only controls; found: ${snippet}`);
  }
}

for (const snippet of ["authRoutes", "\"/login\"", "\"/signup\"", "AuthPages"]) {
  if (!main.includes(snippet)) {
    throw new Error(`Missing auth route wiring in main.jsx: ${snippet}`);
  }
}

for (const snippet of ["window.history.pushState", "/api/auth/session", "SignUpCardSection", "LoginCardSection"]) {
  if (!authPages.includes(snippet)) {
    throw new Error(`Missing auth page behavior: ${snippet}`);
  }
}

for (const snippet of ["http://127.0.0.1:5003", "proxy"]) {
  if (!viteConfig.includes(snippet)) {
    throw new Error(`Missing v3 backend proxy config: ${snippet}`);
  }
}

for (const snippet of ["\"dev\": \"node ./scripts/dev.mjs\"", "dev:vite", "dev:auth", "venv\\\\Scripts\\\\python.exe -B -m server.auth_app"]) {
  if (!packageJson.includes(snippet)) {
    throw new Error(`Missing v3 backend npm script: ${snippet}`);
  }
}

for (const snippet of ["http://127.0.0.1:5003/api/health", "requiredCapabilities", "admin-users", "rbac-v4", "server.auth_app", "npx", "vite", "taskkill", "\"-B\""]) {
  if (!devScript.includes(snippet)) {
    throw new Error(`Missing combined v3 dev launcher behavior: ${snippet}`);
  }
}

for (const snippet of [
  "falcon-newsroom-v3-auth",
  "v3-rbac-activity-2026-06-02",
  "BACKEND_CAPABILITIES",
  "@app.post(\"/api/auth/register\")",
  "@app.post(\"/api/auth/login\")",
  "@app.get(\"/api/auth/session\")",
  "@app.post(\"/api/auth/logout\")",
  "@app.get(\"/api/auth/google/start\")",
  "@app.get(\"/api/admin/users\")",
  "@app.patch(\"/api/admin/users/<user_id>/role\")",
  "@app.get(\"/api/stories\")",
  "@app.patch(\"/api/stories/<story_id>\")",
  "@app.get(\"/api/pitches\")",
  "@app.patch(\"/api/pitches/<pitch_id>\")",
  "@app.get(\"/api/activity\")",
  "@app.get(\"/api/article-records\")",
  "@app.get(\"/api/interview-records\")",
  "ROLE_WRITER",
  "VALID_ROLES = {ROLE_ADMIN, ROLE_EDITOR, ROLE_WRITER, ROLE_VIEWER}",
  "ACTIVITY_COLLECTION",
  "FEEDBACK_COLLECTION",
  "IMPORTANT_ACTIVITY_EVENTS",
  "shared-feedback",
  "_month_day_year",
  "_create_story_from_pitch",
  "sourcePitchId",
  "require_roles(ROLE_ADMIN)",
  "_ensure_csrf_token",
  "X-CSRF-Token",
  "csrfToken",
  "USER_COLLECTION",
  "loginInfov2",
  "@app.get(\"/api/feedback\")",
  "@app.post(\"/api/feedback\")",
  "@app.patch(\"/api/feedback/<feedback_id>\")",
  "@app.delete(\"/api/feedback/<feedback_id>\")",
]) {
  if (!v3Backend.includes(snippet)) {
    throw new Error(`Missing v3 backend auth/API behavior: ${snippet}`);
  }
}

for (const snippet of ["from v2.app", "from v2 ", "import v2", "127.0.0.1:5000"]) {
  if (v3Backend.includes(snippet) || viteConfig.includes(snippet)) {
    throw new Error(`v3 must not depend on v2 backend wiring; found: ${snippet}`);
  }
}

console.log("Static smoke checks passed.");
