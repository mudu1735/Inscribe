import { readFile } from "node:fs/promises";

const app = await readFile("src/App.jsx", "utf8");
const css = await readFile("src/styles.css", "utf8");
const main = await readFile("src/main.jsx", "utf8");
const authPages = await readFile("src/auth-pages.tsx", "utf8");
const authComponent = await readFile("src/components/ui/login-signup.tsx", "utf8");
const packageJson = await readFile("package.json", "utf8");
const viteConfig = await readFile("vite.config.js", "utf8");
const vercelConfig = await readFile("vercel.json", "utf8");
const staticHeaders = await readFile("public/_headers", "utf8");
const v3Backend = await readFile("server/auth_app.py", "utf8");
const articleExtractor = await readFile("server/article_extractor.py", "utf8");
const devScript = await readFile("scripts/dev.mjs", "utf8");
const requirements = await readFile("requirements.txt", "utf8");

const expectedAppSnippets = [
  "Inscribe",
  "V3LandingPage",
  "product-dashboard.png",
  "journalism workflow tool.",
  "product-stories.png",
  "A calmer editorial desk for your school.",
  "Pitch Board",
  "PITCH_ROUND_STATUSES",
  "New round",
  "Open for submissions",
  "Closed for submissions",
  "Select for story",
  "Put on hold",
  "menuMaxHeight=\"min(24rem, calc(100dvh - 7rem))\"",
  "onDelete={(item) => deleteRound",
  "Stories",
  "StoriesPage",
  "navSections",
  "uniqueTextValues",
  "initialStories",
  "Google Docs",
  "Copy link",
  "Add or create",
  "Enter link",
  "File upload",
  "Attach link",
  "StoryAttachmentDialog",
  "uploadStoryAttachment",
  "clearStoryAttachment",
  "Submitted",
  "Needs Revision",
  "Your work",
  "No work attached yet",
  "Remove attached work",
  "Add comment",
  "PitchBoardPage",
  "initialAppPage",
  "New pitch",
  "Add story",
  "StoryCreateModal",
  "AnimatedOptionDropdown",
  "Pitch review",
  "Editor feedback",
  "Add feedback",
  "Mark in progress",
  "Submit for review",
  "Additional notes",
  "HeaderBreadcrumb",
  "pitchFeedbackItems",
  "groupActivePitchesByWriter",
  "pitchOwnerGroupKey",
  "PitchDetailPage",
  "PitchStatusText",
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
  "canManageSourceRecords",
  "Delete source record",
  "buildInterviewRecordRows",
  "handleGradeChange",
  "handleHouseChange",
  "handleRecordSelect",
  "Save changes",
  "Invite users",
  "Invite collaborators",
  "Collaborators",
  "Send invite",
  "STORY_COLLABORATOR_ROLE_OPTIONS",
  "canManageStoryCollaborators",
  "inviteStoryCollaborators",
  "removeStoryCollaborator",
  "First name",
  "Last name",
  "Review interviewees",
  "Add another source row",
  "paginationPageButtonClass",
  "DashboardTaskRow",
  "See all",
  "/api/dashboard",
  "/api/story-invitations/",
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
  "storyVisibleToUser",
  "canSubmitOwnStory",
  "canUnsubmitOwnStory",
  "canUpdateOwnStorySubmission",
  "canEditStoryAttachment",
  "storyAttachmentItems",
  "storyAttachmentInfo",
  "mergeStoryAttachmentState",
  "workAttachmentTypeLabel",
  "loadGooglePickerApi",
  "attachDriveFileToStory",
  "/api/drive/picker-config",
  "/api/drive/picker-token",
  "/drive-attachment",
  "Google Drive",
  "MULTISELECT_ENABLED",
  "Choose files",
  "Attach work before submitting this story.",
  "canClickSubmitStory",
  "disabled={!canClickSubmitStory}",
  "drivePermissionText",
  "event.preventDefault();",
  "grid-cols-[minmax(0,1fr)_44px]",
  "z-[1000]",
  "Private comments",
  "Unsubmit",
  "Send to teacher approval",
  "normalizeDisplayPitch",
  "formatDisplayDate",
  "storyDueDateLabel",
  "storyWithApprovedDueDate",
  "approvalDueDate",
  "onStoryCreated",
  "Selected pitch for a story.",
  "canManageEditorialWorkflow",
  "Workspace access code",
  "Names database",
  "Replace names database",
  "/api/admin/names/upload",
  "AdministrationSettings",
  "settingsSectionForPath",
  "workspaceSettingsDraft",
  "OwnerWorkspacesPage",
  "APP_ROLE_OPTIONS",
  "/api/owner/workspaces",
  "New workspace",
  "All workspaces",
];

for (const snippet of expectedAppSnippets) {
  if (!app.includes(snippet)) {
    throw new Error(`Missing expected App.jsx snippet: ${snippet}`);
  }
}

for (const snippet of ["Refresh</Button>", "Other interviewees in this article", "Why this structure works better", "Faculty / Staff", "Open pipeline", "+9 new", "+3 this week", "label: \"Pipeline\"", "label: \"Assignments\"", "label: \"Articles\"", "label: \"Interviewees\"", "Move to Development", "out of 2", "No pitches here", "Save Feedback", "PitchDetailBreadcrumb", "{ id: \"extractor\"", "ExtractorPage", "Mock extraction complete", "Quote evidence", "Confidence", "Review extracted interviewees", "Remove selected", "Deselect all", "Select all", "interviewee found.", "linked</StatusBadge>", "StoryQueueMetric", "STORY_FILTER_EDITORS", "editorFilter", "MiniStat", ">Owner</th>", ">Doc</th>", "StatusBadge tone={storyStatusTone", "{story.section} / Last edited", "fmt(story.wordCount)} words", "story.sourceCount} sources", "story.revisionCount} revisions", "withPitchActivity", "Draft last edited", "left feedback on this pitch", "No feedback yet.", "onAddFeedback", "onEditFeedback", "onDeleteFeedback", "writers={[accountDisplayName(currentUser)]}", "Approved pitch and removed it from the active board.", "Submit becomes available on stories assigned to you.", "Visible to the story team.", "Submit story", "Will share on submit", "Auto-share failed", "Shared with editors"]) {
  if (app.includes(snippet)) {
    throw new Error(`Found removed App.jsx snippet: ${snippet}`);
  }
}

for (const snippet of ["Publishing setup", "Your account", "{ id: \"admin\", label: \"Admin\""]) {
  if (app.includes(snippet)) {
    throw new Error(`Found removed settings snippet: ${snippet}`);
  }
}

for (const snippet of ["@tailwind base", "@tailwind components", "@tailwind utilities", ".v3-landing", "oklch("]) {
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
  "origin: window.location.origin",
  "intent: isSignup ? \"signup\" : \"login\"",
  "credentials: \"include\"",
  "safeRedirectTarget",
  "requestedNext",
  "nextRedirect || serverRedirect",
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

for (const snippet of ["window.history.pushState", "/api/auth/session", "SignUpCardSection", "LoginCardSection", 'role === "owner"', 'return "/owner"']) {
  if (!authPages.includes(snippet)) {
    throw new Error(`Missing auth page behavior: ${snippet}`);
  }
}

for (const snippet of ["http://127.0.0.1:5003", "proxy", "port: 5173", "strictPort: true"]) {
  if (!viteConfig.includes(snippet)) {
    throw new Error(`Missing v3 backend proxy config: ${snippet}`);
  }
}

for (const snippet of ["\"dev\": \"node ./scripts/dev.mjs\"", "dev:vite", "dev:auth", "python -B -m server.auth_app", "--port 5173 --strictPort"]) {
  if (!packageJson.includes(snippet)) {
    throw new Error(`Missing v3 backend npm script: ${snippet}`);
  }
}

for (const snippet of ["http://127.0.0.1:5003/api/health", "requiredCapabilities", "admin-users", "article-date-sort-v2", "backendBuildId", "payload?.buildId === backendBuildId", "guest-role-v1", "rbac-v4", "owner-workspaces", "server.auth_app", "npx", "vite", "taskkill", "Could not stop the stale v3 auth backend", "\"-B\"", "\"--port\", \"5173\", \"--strictPort\""]) {
  if (!devScript.includes(snippet)) {
    throw new Error(`Missing combined v3 dev launcher behavior: ${snippet}`);
  }
}

for (const snippet of [
  "falcon-newsroom-v3-auth",
  "v3-rbac-guest-2026-07-20",
  "BACKEND_CAPABILITIES",
  "BACKEND_BUILD_ID",
  '"buildId": BACKEND_BUILD_ID',
  '"article-date-sort-v2"',
  "@app.post(\"/api/auth/register\")",
  "@app.post(\"/api/auth/login\")",
  "@app.get(\"/api/auth/session\")",
  "@app.post(\"/api/auth/logout\")",
  "@app.patch(\"/api/workspace\")",
  "workspace-settings",
  "names-database",
  "@app.get(\"/api/admin/names\")",
  "@app.post(\"/api/admin/names/upload\")",
  "@app.get(\"/api/auth/google/start\")",
  "FRONTEND_ORIGIN",
  "DEFAULT_DEV_FRONTEND_ORIGIN",
  "_frontend_redirect_url",
  "_google_missing_config",
  "_make_google_state",
  "_load_google_state",
  "GOOGLE_INTENT_SIGNUP",
  "GOOGLE_DRIVE_SCOPE",
  "GOOGLE_PICKER_API_KEY",
  "api_drive_picker_config",
  "api_drive_picker_token",
  "api_attach_drive_file",
  "_share_drive_file_with_editors",
  "_story_attachments_to_api",
  "_merged_attachment_items",
  "_attachment_item_key",
  "_attachment_identifiers",
  "_attachment_pull_condition",
  "permissions",
  "allow_create=intent == GOOGLE_INTENT_SIGNUP",
  "URLSafeTimedSerializer",
  "GOOGLE_STATE_MAX_AGE_SECONDS",
  "googleId",
  "@app.get(\"/api/admin/users\")",
  "@app.patch(\"/api/admin/users/<user_id>/role\")",
  "@app.get(\"/api/stories\")",
  "@app.post(\"/api/stories\")",
  "@app.patch(\"/api/stories/<story_id>\")",
  "@app.post(\"/api/stories/<story_id>/attachment\")",
  "@app.post(\"/api/stories/<story_id>/collaborators\")",
  "@app.delete(\"/api/stories/<story_id>/collaborators/<path:email>\")",
  "VALID_STORY_COLLABORATOR_ROLES",
  "_story_collaborators",
  "_can_manage_story_collaborators",
  "_can_edit_story_content",
  "@app.post(\"/api/stories/<story_id>/drive-attachment\")",
  "@app.get(\"/api/stories/<story_id>/attachment\")",
  "@app.get(\"/api/stories/<story_id>/attachments/<attachment_id>\")",
  "@app.delete(\"/api/stories/<story_id>/attachments/<attachment_id>\")",
  "@app.get(\"/api/pitches\")",
  "@app.get(\"/api/pitch-rounds\")",
  "@app.post(\"/api/pitch-rounds\")",
  "@app.patch(\"/api/pitch-rounds/<round_id>\")",
  "@app.delete(\"/api/pitch-rounds/<round_id>\")",
  "@app.patch(\"/api/pitches/<pitch_id>\")",
  "@app.get(\"/api/activity\")",
  "@app.get(\"/api/dashboard\")",
  "@app.post(\"/api/story-invitations/<story_id>/<decision>\")",
  "personal-dashboard",
  "pitch-owner-submit",
  "story-invitations",
  "@app.get(\"/api/article-records\")",
  "@app.get(\"/api/interview-records\")",
  "@app.delete(\"/api/interview-records/<record_id>\")",
  "ROLE_WRITER",
  "ROLE_SCHEMA_CAPABILITY",
  "VALID_ROLES = {ROLE_ADMIN, ROLE_EDITOR, ROLE_WRITER, ROLE_GUEST}",
  "ROLE_OWNER",
  "OWNER_EMAILS",
  "owner-workspaces",
  "require_owner",
  "_workspace_members_query",
  "joining_role = ROLE_ADMIN if member_count == 0 else ROLE_GUEST",
  "@app.get(\"/api/owner/workspaces\")",
  "@app.post(\"/api/owner/workspaces\")",
  "@app.patch(\"/api/owner/workspaces/<workspace_id>\")",
  "@app.post(\"/api/owner/workspaces/<workspace_id>/open\")",
  "ACTIVITY_COLLECTION",
  "FEEDBACK_COLLECTION",
  "IMPORTANT_ACTIVITY_EVENTS",
  "shared-feedback",
  "_month_day_year",
  "_normalize_pitch_status",
  "_pitch_owned_by_user",
  "_activity_actor_is_user",
  "_dashboard_status_activity_relevant",
  "Writers can only submit their own pitch for review.",
  "_create_story_from_pitch",
  "sourcePitchId",
  "ownerUserId",
  "require_roles(ROLE_ADMIN)",
  "_ensure_csrf_token",
  "X-CSRF-Token",
  "csrfToken",
  "USER_COLLECTION",
  "loginInfov2",
  "Invalid email or password.",
  "_story_status_transition_decision",
  "Only editors and admins can move stories through review.",
  "That story status change skips the required newsroom workflow.",
  "Only an accepted story author can submit or unsubmit this story.",
  "Only story authors or editors can invite co-authors.",
  "Attach work before submitting this story.",
  "MAX_STORY_ATTACHMENT_BYTES",
  "gridfs.GridFS",
  "@app.get(\"/api/feedback\")",
  "@app.post(\"/api/feedback\")",
  "def api_create_feedback",
  "require_roles(ROLE_ADMIN, ROLE_EDITOR, ROLE_WRITER)",
  "@app.patch(\"/api/feedback/<feedback_id>\")",
  "@app.delete(\"/api/feedback/<feedback_id>\")",
  "DUE_DATE_FIELDS",
  "def _story_deadline",
  "\"dueDate\": deadline",
  "followup_update[\"dueDate\"] = story_deadline",
  "update[\"dueDate\"] = next_deadline",
  "Due date is required before selecting a pitch.",
  "update[\"dueDate\"] = approval_deadline",
  "_create_story_from_pitch(updated, user_doc, approval_deadline, approval_message)",
  "@app.delete(\"/api/pitches/<pitch_id>\")",
  "_pitch_detail_updates",
  "_upsert_published_article",
  "_validated_publication_url",
  "_publication_url_conflicts",
  "_interviewee_search_query",
  "_extracted_article_date_sort",
  "The article publication date could not be normalized for sorting.",
]) {
  if (!v3Backend.includes(snippet)) {
    throw new Error(`Missing v3 backend auth/API behavior: ${snippet}`);
  }
}

for (const snippet of ["frame-ancestors 'none'", "X-Frame-Options", "Permissions-Policy"]) {
  if (!viteConfig.includes(snippet) || !vercelConfig.includes(snippet) || !staticHeaders.includes(snippet)) {
    throw new Error(`Missing static frontend security header: ${snippet}`);
  }
}

for (const snippet of [
  "authVersion",
  "passwordCredentialRevokedReason",
  "google_oauth_nonces",
  "googleOAuthStateNonces",
  "expireAfterSeconds=GOOGLE_STATE_MAX_AGE_SECONDS",
  "oauth_state_col.find_one_and_delete",
  "DUMMY_PASSWORD_HASH",
  "TRUST_PROXY_HEADERS",
  "Content-Security-Policy",
  "DRIVE_FILE_ID_RE",
  "MAX_STORY_ATTACHMENTS",
  "MAX_DRIVE_SHARE_RECIPIENTS",
  "DRIVE_SHARE_TOTAL_TIMEOUT_SECONDS",
  "activeBatchId",
  "uploadBatchId",
  "csv.reader(StringIO(decoded), strict=True)",
  "_validate_xlsx_archive",
  "include_join_code = _current_user_role",
  "SECURITY_RATE_COLLECTION",
  "ADMIN_MUTATION_LOCK_COLLECTION",
  "_acquire_admin_mutation_lock",
  "_record_shared_rate_failure",
  "AUTH_ACCOUNT_RATE_LIMIT_MAX",
  "REGISTRATION_RATE_LIMIT_MAX",
  "/api/workspace/join-code/rotate",
  "/api/admin/users/<user_id>/membership",
  '"$isNumber": "$authVersion"',
  "OAUTH_TOKEN_PREFIX",
  "_encrypt_oauth_token",
  "cryptography.fernet",
  "EXTRACTION_TOKEN_MAX_AGE_SECONDS",
  "_consume_extraction_rate_limit",
  "canonicalize_article_url",
  "_validated_extraction_people",
]) {
  if (!v3Backend.includes(snippet)) {
    throw new Error(`Missing backend security hardening: ${snippet}`);
  }
}

for (const snippet of [
  "_pinned_http_get",
  "server_hostname=validated.host",
  "MAX_RESOLVED_IPS",
  "decode_content=True",
]) {
  if (!articleExtractor.includes(snippet)) {
    throw new Error(`Missing extractor network hardening: ${snippet}`);
  }
}

for (const snippet of [
  "temporary_col.rename",
  "names_col.count_documents({})",
  "No account is registered for this email. Create an account first.",
  "ALLOW_PASSWORD_REGISTRATION",
  "REQUIRE_VERIFIED_EMAIL",
  "Password self-registration is disabled",
  "This password account has not been verified",
  "Verify this account before granting staff access",
  '"emailVerified"',
  "_serialize_workspace(workspace, include_join_code=True)",
]) {
  if (v3Backend.includes(snippet)) {
    throw new Error(`Found insecure legacy backend behavior: ${snippet}`);
  }
}

const redirectStart = authComponent.indexOf("function safeRedirectTarget");
const redirectEnd = authComponent.indexOf("\n}\n\nasync function parseAuthResponse", redirectStart);
if (redirectStart < 0 || redirectEnd < 0) {
  throw new Error("Could not locate safeRedirectTarget for security regression checks.");
}
const redirectSource = authComponent
  .slice(redirectStart, redirectEnd + 2)
  .replace("target: string | undefined", "target");
const safeRedirectTarget = new Function("window", "URL", `${redirectSource}\nreturn safeRedirectTarget;`)(
  { location: { origin: "https://falcon.example" } },
  URL,
);
const backslashPayload = "/" + "\\" + "evil.example";
for (const payload of [backslashPayload, "//evil.example", "https://evil.example", "/dashboard\n/evil"]) {
  if (safeRedirectTarget(payload, "/fallback") !== "/fallback") {
    throw new Error(`Unsafe redirect payload was accepted: ${JSON.stringify(payload)}`);
  }
}
if (safeRedirectTarget("/stories?tab=mine#top") !== "/stories?tab=mine#top") {
  throw new Error("Same-origin redirect targets should remain available.");
}

for (const pin of [
  "Flask==3.1.3",
  "requests==2.33.0",
  "pymongo==4.16.0",
  "python-dotenv==1.2.2",
  "urllib3==2.7.0",
  "Werkzeug==3.1.6",
  "cryptography==49.0.0",
]) {
  if (!requirements.includes(pin)) {
    throw new Error(`Missing security-reviewed dependency pin: ${pin}`);
  }
}

console.log("Static smoke checks passed.");
