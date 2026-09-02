import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import AnimatedDropdown from "./components/ui/animated-dropdown";
import V4LandingPage from "./V4LandingPage";

const iconPaths = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  pipeline: (
    <>
      <path d="M4 6h16" />
      <path d="M4 12h10" />
      <path d="M4 18h7" />
      <circle cx="18" cy="12" r="3" />
      <path d="m20 14 2 2" />
    </>
  ),
  article: (
    <>
      <path d="M4 6h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z" />
      <path d="M8 10h8" />
      <path d="M8 14h3" />
      <path d="M14 14h2" />
    </>
  ),
  people: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
      <path d="M16 3.1a4 4 0 0 1 0 7.8" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" />
    </>
  ),
  task: (
    <>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </>
  ),
  calendar: (
    <>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
    </>
  ),
  analytics: (
    <>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16V9" />
      <path d="M12 16V6" />
      <path d="M16 16v-4" />
    </>
  ),
  admin: (
    <>
      <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4Z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.3 7A2 2 0 1 1 7.1 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  more: (
    <>
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
      <path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" />
    </>
  ),
  filter: (
    <>
      <path d="M4 5h16" />
      <path d="M7 12h10" />
      <path d="M10 19h4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
    </>
  ),
  x: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </>
  ),
  upload: (
    <>
      <path d="M12 3v12" />
      <path d="m7 8 5-5 5 5" />
      <path d="M5 21h14" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
};

function Icon({ name, className = "h-4 w-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "pitches", label: "Pitch Board", icon: "edit" },
  { id: "stories", label: "Stories", icon: "article" },
  { id: "articles", label: "Articles Database", icon: "article" },
  { id: "interviewees", label: "Interviewee Database", icon: "people" },
  { id: "calendar", label: "Calendar", icon: "calendar" },
  { id: "analytics", label: "Analytics", icon: "analytics" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const navSections = [
  { id: "editorial", label: "Editorial desk", items: ["dashboard", "pitches", "stories"] },
  { id: "records", label: "Databases", items: ["articles", "interviewees"] },
  { id: "planning", label: "Planning", items: ["calendar", "analytics"] },
  { id: "system", label: "Workspace", items: ["settings"] },
];

function navItemForPage(page) {
  return navItems.find((item) => item.id === page) || navItems[0];
}

function navSectionForPage(page) {
  return navSections.find((section) => section.items.includes(page)) || navSections[0];
}

const initialArticles = [
  {
    id: "a1",
    title: "New Snapchat Memory Plan Upsets Users",
    section: "Science & Technology",
    authors: ["Sofia Chen"],
    status: "Published",
    priority: "High",
    deadline: "May 10",
    published: "May 7, 2026",
    views: 18472,
    visitors: 12604,
    interviews: 4,
    tags: ["Technology", "Social Media"],
    editor: "Ava Patel",
    summary:
      "Students respond to Snapchat's paid memory storage change and its effect on years of saved photos.",
  },
  {
    id: "a2",
    title: "Spring Sports Preview: Falcons Enter Playoff Push",
    section: "Sports",
    authors: ["Marcus Lee"],
    status: "Ready",
    priority: "Normal",
    deadline: "May 12",
    published: "Draft",
    views: 11238,
    visitors: 8032,
    interviews: 3,
    tags: ["Sports", "Playoffs"],
    editor: "Noah Kim",
    summary:
      "A preview of postseason expectations across varsity teams with quotes from athletes and coaches.",
  },
  {
    id: "a3",
    title: "Senior Parking Rules Draw Mixed Reactions",
    section: "News",
    authors: ["Ava Patel"],
    status: "Editing",
    priority: "Normal",
    deadline: "May 14",
    published: "Draft",
    views: 9430,
    visitors: 6901,
    interviews: 5,
    tags: ["School Policy"],
    editor: "Maya Johnson",
    summary:
      "Students debate new parking restrictions and whether they improve arrival safety.",
  },
  {
    id: "a4",
    title: "Inside the Robotics Team's Final Build Week",
    section: "Features",
    authors: ["Daniel Wu"],
    status: "Drafting",
    priority: "High",
    deadline: "May 16",
    published: "Draft",
    views: 0,
    visitors: 0,
    interviews: 2,
    tags: ["STEM", "Clubs"],
    editor: "Ava Patel",
    summary: "A behind-the-scenes look at crunch time before competition.",
  },
  {
    id: "a5",
    title: "Cafeteria Menu Changes Coming Next Fall",
    section: "News",
    authors: ["Lena Brooks"],
    status: "Reporting",
    priority: "Low",
    deadline: "May 18",
    published: "Draft",
    views: 0,
    visitors: 0,
    interviews: 1,
    tags: ["Food", "School"],
    editor: "Noah Kim",
    summary: "Food services weighs in on planned options and student feedback.",
  },
  {
    id: "a6",
    title: "Prom Fashion Trends Take Over Instagram",
    section: "Culture",
    authors: ["Iris Park"],
    status: "Idea",
    priority: "Normal",
    deadline: "May 22",
    published: "Idea",
    views: 0,
    visitors: 0,
    interviews: 0,
    tags: ["Prom", "Culture"],
    editor: "Maya Johnson",
    summary: "A visual culture piece on how students choose and share prom outfits.",
  },
];

const initialTasks = [
  {
    id: "t1",
    title: "Fact-check Snapchat pricing details",
    article: "New Snapchat Memory Plan Upsets Users",
    owner: "Sofia Chen",
    status: "Review",
    priority: "High",
    due: "June 2, 2026",
  },
  {
    id: "t2",
    title: "Add two coach quotes",
    article: "Spring Sports Preview",
    owner: "Marcus Lee",
    status: "In Progress",
    priority: "Normal",
    due: "May 11",
  },
  {
    id: "t3",
    title: "Review parking policy quotes",
    article: "Senior Parking Rules",
    owner: "Ava Patel",
    status: "Todo",
    priority: "Normal",
    due: "May 13",
  },
  {
    id: "t4",
    title: "Upload robotics feature image",
    article: "Robotics Final Build Week",
    owner: "Daniel Wu",
    status: "Blocked",
    priority: "High",
    due: "May 15",
  },
  {
    id: "t5",
    title: "Write social caption for published article",
    article: "Snapchat Memory Plan",
    owner: "Iris Park",
    status: "Done",
    priority: "Low",
    due: "June 1, 2026",
  },
];

const users = [
  {
    id: "u1",
    name: "Ava Patel",
    email: "ava@school.edu",
    role: "admin",
    lastSeen: "June 2, 2026",
  },
  {
    id: "u2",
    name: "Sofia Chen",
    email: "sofia@school.edu",
    role: "admin",
    lastSeen: "June 2, 2026",
  },
  {
    id: "u3",
    name: "Maya Johnson",
    email: "maya@school.edu",
    role: "admin",
    lastSeen: "June 2, 2026",
  },
  {
    id: "u4",
    name: "Noah Kim",
    email: "noah@school.edu",
    role: "editor",
    lastSeen: "June 1, 2026",
  },
  {
    id: "u5",
    name: "Mina Rao",
    email: "mina@school.edu",
    role: "writer",
    lastSeen: "May 30, 2026",
  },
  {
    id: "u6",
    name: "Daniel Wu",
    email: "daniel@school.edu",
    role: "writer",
    lastSeen: "May 29, 2026",
  },
  {
    id: "u7",
    name: "Iris Park",
    email: "iris@school.edu",
    role: "",
    lastSeen: "May 26, 2026",
  },
];

const ADMIN_ROLES = [
  {
    id: "admin",
    label: "Admin",
    description: "Full workspace access, including users, settings, publishing, and all editorial tools.",
  },
  {
    id: "editor",
    label: "Editor",
    description: "Can view every story and manage editorial workflow, but cannot manage users.",
  },
  {
    id: "writer",
    label: "Writer",
    description: "Can view assigned story work and owned pitches.",
  },
  {
    id: "guest",
    label: "Guest",
    description: "Can view records, but cannot access stories, pitches, or admin tools.",
  },
];

const ADMIN_ROLE_OPTIONS = ADMIN_ROLES.map((role) => role.id);
const APP_ROLE_OPTIONS = [...ADMIN_ROLE_OPTIONS, "owner"];
const ADMIN_ROLE_FILTER_OPTIONS = ["All roles", ...ADMIN_ROLE_OPTIONS];

const STORY_STATUSES = ["Assigned", "Reporting", "Drafting", "Submitted", "In Review", "Needs Revision", "Returned", "Ready for Publish", "Published"];
const STORY_FILTER_STATUSES = ["All statuses", ...STORY_STATUSES];
const STORY_FILTER_SECTIONS = ["All sections", "News", "Features", "Sports", "Culture", "Opinion", "Science & Technology", "Photo"];
const ACTIVE_STORY_STATUSES = STORY_STATUSES.filter((status) => status !== "Published");
const STORY_AUTHOR_EDITABLE_STATUSES = ["Assigned", "Reporting", "Drafting", "Needs Revision", "Returned"];
const STORY_EDITOR_EDITABLE_STATUSES = [...STORY_AUTHOR_EDITABLE_STATUSES, "Submitted", "In Review"];
const STORY_COLLABORATOR_ROLE_OPTIONS = [
  { id: "edit", label: "Co-author", description: "Can edit the story, attach work, comment, invite authors, and submit." },
];
const STORY_WORKFLOW_COLUMNS = [
  {
    id: "progress",
    title: "In Progress",
    description: "Assigned, reporting, drafting, or back with the writer.",
    statuses: ["Assigned", "Reporting", "Drafting", "Needs Revision", "Returned"],
  },
  {
    id: "ready",
    title: "Ready for Review",
    description: "Submitted drafts that need an editor pass.",
    statuses: ["Submitted", "In Review"],
  },
  {
    id: "approval",
    title: "Teacher Approval",
    description: "Editor-reviewed stories waiting for adviser sign-off.",
    statuses: ["Ready for Publish"],
  },
];

const initialStories = [
  {
    id: "s1",
    title: "Senior Parking Rules Draw Mixed Reactions",
    section: "News",
    writer: "Ava Patel",
    editor: "Maya Johnson",
    status: "Submitted",
    priority: "High",
    deadline: "June 2, 2026",
    dueSoon: true,
    submittedAt: "May 18, 2026, 8:42 AM",
    lastEdited: "June 2, 2026",
    googleDocUrl: "",
    revisionCount: 2,
    wordCount: 842,
    sourceCount: 5,
    unread: true,
    summary: "Students debate new senior parking restrictions and whether the changes actually improve arrival safety.",
    nextStep: "Open the draft, check the policy quote, and leave line comments before returning it.",
    editorNote: "Strong reporting base. Needs a tighter nut graf and one quote from administration.",
  },
  {
    id: "s2",
    title: "Spring Sports Preview: Falcons Enter Playoff Push",
    section: "Sports",
    writer: "Marcus Lee",
    editor: "Noah Kim",
    status: "In Review",
    priority: "Normal",
    deadline: "June 3, 2026",
    dueSoon: true,
    submittedAt: "May 17, 2026, 5:18 PM",
    lastEdited: "June 2, 2026",
    googleDocUrl: "",
    revisionCount: 1,
    wordCount: 1104,
    sourceCount: 3,
    unread: false,
    summary: "A postseason preview across varsity teams with quotes from athletes and coaches.",
    nextStep: "Resolve coach quote placement and confirm the playoff schedule before marking ready.",
    editorNote: "The structure is working. Check that every team mention has a concrete reason to be included.",
  },
  {
    id: "s3",
    title: "Inside the Robotics Team's Final Build Week",
    section: "Features",
    writer: "Daniel Wu",
    editor: "Ava Patel",
    status: "Needs Revision",
    priority: "High",
    deadline: "May 20",
    dueSoon: true,
    submittedAt: "May 16, 2026, 9:03 PM",
    lastEdited: "June 1, 2026",
    googleDocUrl: "",
    revisionCount: 3,
    wordCount: 1328,
    sourceCount: 4,
    unread: true,
    summary: "A behind-the-scenes feature following the robotics team through a tense final build week.",
    nextStep: "Writer needs to add scene detail and clarify the competition stakes before another editor pass.",
    editorNote: "Return with comments focused on chronology, technical clarity, and photo captions.",
  },
  {
    id: "s4",
    title: "Cafeteria Menu Changes Coming Next Fall",
    section: "News",
    writer: "Lena Brooks",
    editor: "Noah Kim",
    status: "Ready for Publish",
    priority: "Normal",
    deadline: "May 21",
    dueSoon: false,
    submittedAt: "May 15, 2026, 3:24 PM",
    lastEdited: "June 2, 2026",
    googleDocUrl: "",
    revisionCount: 2,
    wordCount: 763,
    sourceCount: 3,
    unread: false,
    summary: "Food services weighs in on planned options and students describe what they want changed.",
    nextStep: "Final copy edit, headline check, and move into SNO/WordPress.",
    editorNote: "Ready once the caption confirms which lunch line photo will run.",
  },
  {
    id: "s5",
    title: "Prom Fashion Trends Take Over Instagram",
    section: "Culture",
    writer: "Iris Park",
    editor: "Maya Johnson",
    status: "Returned",
    priority: "Low",
    deadline: "May 24",
    dueSoon: false,
    submittedAt: "May 14, 2026, 1:02 PM",
    lastEdited: "May 30, 2026",
    googleDocUrl: "",
    revisionCount: 1,
    wordCount: 516,
    sourceCount: 1,
    unread: false,
    summary: "A culture piece on how students choose, photograph, and share prom outfits.",
    nextStep: "Writer needs to restore the shared Google Doc link and add at least two student voices.",
    editorNote: "Doc link missing. Keep it returned until the submission is accessible.",
  },
  {
    id: "s7",
    title: "Exam Week Sleep Survey Finds Uneven Study Habits",
    section: "News",
    writer: "Mina Rao",
    editor: "Ava Patel",
    status: "Submitted",
    priority: "Normal",
    deadline: "June 2, 2026",
    dueSoon: true,
    submittedAt: "May 18, 2026, 10:05 AM",
    lastEdited: "June 2, 2026",
    googleDocUrl: "",
    revisionCount: 1,
    wordCount: 934,
    sourceCount: 4,
    unread: true,
    summary: "Survey results and counselor interviews show how students adjust sleep during exam season.",
    nextStep: "Check that survey numbers are clearly attributed and ask for one counselor verification.",
    editorNote: "Promising data story. Needs a cleaner chart note before teacher approval.",
  },
  {
    id: "s8",
    title: "Student Musicians Prepare for Spring Showcase",
    section: "Culture",
    writer: "Jordan Ellis",
    editor: "Maya Johnson",
    status: "Drafting",
    priority: "Normal",
    deadline: "June 3, 2026",
    dueSoon: true,
    submittedAt: "May 18, 2026, 9:20 AM",
    lastEdited: "June 2, 2026",
    googleDocUrl: "",
    revisionCount: 0,
    wordCount: 488,
    sourceCount: 2,
    unread: false,
    summary: "A preview of the spring music showcase through student rehearsals and setlist decisions.",
    nextStep: "Writer is adding rehearsal color and one quote from the choir director.",
    editorNote: "Keep the focus on preparation instead of a basic event listing.",
  },
  {
    id: "s9",
    title: "Varsity Baseball Leans on Younger Pitchers",
    section: "Sports",
    writer: "Ethan Miller",
    editor: "Noah Kim",
    status: "Reporting",
    priority: "High",
    deadline: "May 20",
    dueSoon: true,
    submittedAt: "May 17, 2026, 7:11 PM",
    lastEdited: "June 2, 2026",
    googleDocUrl: "",
    revisionCount: 0,
    wordCount: 312,
    sourceCount: 2,
    unread: false,
    summary: "A sports analysis story on how underclassmen pitchers are changing the team's playoff depth.",
    nextStep: "Needs coach context and one stat check before draft review.",
    editorNote: "Good angle. Ask for exact innings pitched, not vague workload language.",
  },
  {
    id: "s10",
    title: "Library Adds Quiet Hours During AP Testing",
    section: "News",
    writer: "Priya Shah",
    editor: "Ava Patel",
    status: "Ready for Publish",
    priority: "Normal",
    deadline: "May 20",
    dueSoon: true,
    submittedAt: "May 16, 2026, 2:46 PM",
    lastEdited: "June 2, 2026",
    googleDocUrl: "",
    revisionCount: 2,
    wordCount: 621,
    sourceCount: 3,
    unread: false,
    summary: "Library staff explain new quiet-hour rules and how students can reserve study space.",
    nextStep: "Send to adviser once the sidebar confirms room reservation instructions.",
    editorNote: "Clean and useful. Needs teacher approval before it goes live.",
  },
  {
    id: "s11",
    title: "Robotics Mentors Build Summer Outreach Plan",
    section: "Science & Technology",
    writer: "Kai Nguyen",
    editor: "Mina Rao",
    status: "Assigned",
    priority: "Low",
    deadline: "May 23",
    dueSoon: false,
    submittedAt: "May 15, 2026, 8:30 AM",
    lastEdited: "June 1, 2026",
    googleDocUrl: "",
    revisionCount: 0,
    wordCount: 0,
    sourceCount: 0,
    unread: false,
    summary: "Assignment for a short feature on how robotics students plan to teach middle school workshops.",
    nextStep: "Writer should schedule two mentor interviews and collect photos from the first planning meeting.",
    editorNote: "Set a reporting checkpoint before drafting starts.",
  },
  {
    id: "s12",
    title: "Opinion: Hallway Phone Rules Need Clearer Enforcement",
    section: "Opinion",
    writer: "Nora Kim",
    editor: "Maya Johnson",
    status: "Submitted",
    priority: "Normal",
    deadline: "May 21",
    dueSoon: false,
    submittedAt: "May 17, 2026, 4:09 PM",
    lastEdited: "June 2, 2026",
    googleDocUrl: "",
    revisionCount: 1,
    wordCount: 708,
    sourceCount: 2,
    unread: true,
    summary: "An opinion column arguing that hallway phone rules are inconsistently communicated.",
    nextStep: "Check fairness language and ask for a clear distinction between reporting and opinion.",
    editorNote: "The stance is clear. Tone needs one pass before approval.",
  },
  {
    id: "s13",
    title: "Photo Essay: Cafeteria Rush Between Lunch Waves",
    section: "Photo",
    writer: "Luca Bennett",
    editor: "Noah Kim",
    status: "In Review",
    priority: "High",
    deadline: "June 2, 2026",
    dueSoon: true,
    submittedAt: "May 18, 2026, 11:22 AM",
    lastEdited: "June 2, 2026",
    googleDocUrl: "",
    revisionCount: 1,
    wordCount: 284,
    sourceCount: 3,
    unread: true,
    summary: "Photo captions and short observations document the pressure points in the lunch line.",
    nextStep: "Confirm all photo subjects are cleared and tighten the caption sequence.",
    editorNote: "Strong visuals. Verify names before sending to teacher.",
  },
  {
    id: "s14",
    title: "Environmental Club Pushes Compost Pilot",
    section: "Features",
    writer: "Olivia Grant",
    editor: "Ava Patel",
    status: "Needs Revision",
    priority: "Normal",
    deadline: "May 22",
    dueSoon: false,
    submittedAt: "May 16, 2026, 6:40 PM",
    lastEdited: "June 1, 2026",
    googleDocUrl: "",
    revisionCount: 2,
    wordCount: 1018,
    sourceCount: 5,
    unread: false,
    summary: "Environmental Club members describe a composting pilot and the logistical hurdles ahead.",
    nextStep: "Writer needs to add facilities perspective and clarify what is approved.",
    editorNote: "Return with comments on scope, evidence, and exact timeline.",
  },
  {
    id: "s15",
    title: "Theater Crew Designs a Minimalist Set",
    section: "Culture",
    writer: "Sam Rivera",
    editor: "Maya Johnson",
    status: "Drafting",
    priority: "Low",
    deadline: "May 25",
    dueSoon: false,
    submittedAt: "May 15, 2026, 12:18 PM",
    lastEdited: "May 31, 2026",
    googleDocUrl: "",
    revisionCount: 0,
    wordCount: 557,
    sourceCount: 2,
    unread: false,
    summary: "A behind-the-scenes look at how stage crew builds a set with limited materials.",
    nextStep: "Draft should add scene detail from rehearsal and one technical explanation.",
    editorNote: "Good candidate for a photo-led package.",
  },
  {
    id: "s16",
    title: "Math Team Qualifies for Regional Tournament",
    section: "News",
    writer: "Grace Lin",
    editor: "Mina Rao",
    status: "Ready for Publish",
    priority: "Normal",
    deadline: "May 22",
    dueSoon: false,
    submittedAt: "May 14, 2026, 9:55 PM",
    lastEdited: "June 2, 2026",
    googleDocUrl: "",
    revisionCount: 2,
    wordCount: 678,
    sourceCount: 3,
    unread: false,
    summary: "Math team members describe their regional qualification and preparation routine.",
    nextStep: "Awaiting adviser approval after headline and photo credit check.",
    editorNote: "Ready for final sign-off.",
  },
  {
    id: "s17",
    title: "Students Debate Later Start Time Proposal",
    section: "News",
    writer: "Talia Green",
    editor: "Noah Kim",
    status: "Reporting",
    priority: "High",
    deadline: "May 24",
    dueSoon: false,
    submittedAt: "May 13, 2026, 3:02 PM",
    lastEdited: "June 2, 2026",
    googleDocUrl: "",
    revisionCount: 0,
    wordCount: 401,
    sourceCount: 3,
    unread: false,
    summary: "Students and staff weigh possible benefits and scheduling conflicts around a later start time.",
    nextStep: "Needs district context and one parent voice before draft review.",
    editorNote: "Treat this as a reported explainer, not a reaction roundup.",
  },
  {
    id: "s18",
    title: "Senior Map Tracks College Decisions",
    section: "Features",
    writer: "Hannah Cole",
    editor: "Ava Patel",
    status: "Assigned",
    priority: "Low",
    deadline: "May 27",
    dueSoon: false,
    submittedAt: "May 12, 2026, 1:47 PM",
    lastEdited: "May 31, 2026",
    googleDocUrl: "",
    revisionCount: 0,
    wordCount: 0,
    sourceCount: 0,
    unread: false,
    summary: "A data-assisted feature mapping where seniors plan to study, work, or take gap years.",
    nextStep: "Writer needs form results and privacy-safe display rules before drafting.",
    editorNote: "Keep individual student details opt-in only.",
  },
  {
    id: "s19",
    title: "Lacrosse Captains Reset After Rivalry Loss",
    section: "Sports",
    writer: "Miles Carter",
    editor: "Noah Kim",
    status: "Submitted",
    priority: "Normal",
    deadline: "May 21",
    dueSoon: false,
    submittedAt: "May 18, 2026, 7:58 AM",
    lastEdited: "June 2, 2026",
    googleDocUrl: "",
    revisionCount: 1,
    wordCount: 849,
    sourceCount: 4,
    unread: true,
    summary: "Team captains explain how the lacrosse roster is responding after a close rivalry game.",
    nextStep: "Review for sports cliches and verify the final score before teacher approval.",
    editorNote: "Lead with the adjustment, not the loss.",
  },
  {
    id: "s20",
    title: "AI Club Hosts First Prompt Design Workshop",
    section: "Science & Technology",
    writer: "Sofia Chen",
    editor: "Mina Rao",
    status: "In Review",
    priority: "Normal",
    deadline: "May 23",
    dueSoon: false,
    submittedAt: "May 17, 2026, 8:33 PM",
    lastEdited: "June 2, 2026",
    googleDocUrl: "",
    revisionCount: 1,
    wordCount: 779,
    sourceCount: 3,
    unread: false,
    summary: "AI Club members explain how they teach prompt writing while addressing classroom concerns.",
    nextStep: "Check that the story explains student safeguards and avoids promotional language.",
    editorNote: "Good balance. One quote needs stronger attribution.",
  },
  {
    id: "s6",
    title: "New Snapchat Memory Plan Upsets Users",
    section: "Science & Technology",
    writer: "Sofia Chen",
    editor: "Ava Patel",
    status: "Published",
    priority: "Normal",
    deadline: "Published",
    dueSoon: false,
    submittedAt: "May 7, 2026, 10:15 AM",
    lastEdited: "May 7, 2026",
    googleDocUrl: "",
    revisionCount: 4,
    wordCount: 987,
    sourceCount: 4,
    unread: false,
    summary: "Students respond to Snapchat's paid memory storage changes and the effect on saved photos.",
    nextStep: "Published. Keep the document available for corrections and follow-up reporting.",
    editorNote: "Archive doc is linked for transparency and future corrections.",
  },
];

const PITCH_ROUND_STATUSES = ["Draft", "Open", "Reviewing", "Closed"];
const PITCH_STATUS_IN_PROGRESS = "In Progress";
const PITCH_STATUS_READY = "Ready for Review";
const PITCH_STATUS_SELECTED = "Selected";
const PITCH_STATUS_ON_HOLD = "On Hold";
const PITCH_STATUSES = [PITCH_STATUS_IN_PROGRESS, PITCH_STATUS_READY, PITCH_STATUS_SELECTED, PITCH_STATUS_ON_HOLD];
const PITCH_SECTIONS = ["All sections", "News", "Features", "Sports", "Culture", "Opinion", "Science & Technology", "Photo"];
const PITCH_WRITERS = ["Ava Patel", "Daniel Wu", "Iris Park", "Lena Brooks", "Marcus Lee", "Sofia Chen"];

const initialPitches = [
  {
    id: "p1",
    title: "How student clubs are rethinking recruitment",
    angle: "Look at how clubs are moving beyond hallway posters and using short-form video, interest forms, and peer referrals to find new members.",
    status: "Ready for Review",
    section: "Features",
    owner: "Iris Park",
    submittedAt: "May 14, 2026",
    notes: "Could work well with a sidebar showing what clubs learned from fall signups.",
    editorFeedback: "Strong service angle. Narrow the reporting to three clubs and include one adviser voice.",
    comments: [
      { id: "c1", author: "Ava", text: "Ask each club for one specific tactic that changed attendance.", time: "June 2, 2026" },
      { id: "c2", author: "Iris", text: "I can report this by Friday if the robotics lead replies.", time: "June 2, 2026" },
    ],
    updatedAt: "June 2, 2026",
  },
  {
    id: "p2",
    title: "The quiet cost of exam season",
    angle: "A reported piece on sleep, study habits, and how students balance grades with work, family, and activities.",
    status: "In Progress",
    section: "News",
    owner: "Marcus Lee",
    submittedAt: "May 13, 2026",
    notes: "Needs a counselor interview and a student survey before drafting.",
    editorFeedback: "",
    comments: [{ id: "c3", author: "Noah", text: "Could pair with a simple schedule graphic.", time: "June 1, 2026" }],
    updatedAt: "June 1, 2026",
  },
  {
    id: "p3",
    title: "Athletes managing recovery after long seasons",
    angle: "Interview trainers, coaches, and athletes about rest, injury prevention, and pressure to keep playing.",
    status: PITCH_STATUS_SELECTED,
    section: "Sports",
    owner: "Daniel Wu",
    submittedAt: "May 11, 2026",
    notes: "Selected for a reported feature. Photo request should go in early.",
    editorFeedback: "Move forward. Keep the tone practical and avoid turning this into a medical advice piece.",
    selectedStoryId: "s3",
    comments: [{ id: "c4", author: "Ava", text: "Selected for next week's sports package.", time: "May 31, 2026" }],
    updatedAt: "May 31, 2026",
  },
  {
    id: "p4",
    title: "What makes a good cafeteria line move faster",
    angle: "Use observations and interviews to explain bottlenecks, lunch waves, and student suggestions.",
    status: PITCH_STATUS_ON_HOLD,
    section: "News",
    owner: "Lena Brooks",
    submittedAt: "May 10, 2026",
    notes: "Hold until food services can confirm interview availability.",
    editorFeedback: "Keep this on hold. It needs access before it can become a fair story.",
    comments: [{ id: "c5", author: "Maya", text: "Revisit after the schedule changes are announced.", time: "May 30, 2026" }],
    updatedAt: "May 30, 2026",
  },
  {
    id: "p5",
    title: "Photo essay: the building before first period",
    angle: "A quiet visual piece following custodians, bus arrivals, practice groups, and early study spots.",
    status: "In Progress",
    section: "Photo",
    owner: "Sofia Chen",
    submittedAt: "May 14, 2026",
    notes: "Needs permission checks for early morning access.",
    editorFeedback: "",
    comments: [],
    updatedAt: "June 2, 2026",
  },
  {
    id: "p6",
    title: "Why students are choosing handwritten planners again",
    angle: "Explore whether paper planning is a backlash to notifications or just a useful habit that stuck.",
    status: "Ready for Review",
    section: "Culture",
    owner: "Ava Patel",
    submittedAt: "May 12, 2026",
    notes: "Could include photos of planner layouts if students agree.",
    editorFeedback: "Fun, but it needs a sharper nut graf. Find the larger behavior behind the trend.",
    comments: [{ id: "c6", author: "Iris", text: "I know two students who would talk about this.", time: "June 1, 2026" }],
    updatedAt: "June 1, 2026",
  },
  {
    id: "p7",
    title: "The case for a quieter lunch period",
    angle: "A student-centered look at whether a lower-volume lunch period would change how students use the commons.",
    status: PITCH_STATUS_ON_HOLD,
    section: "Opinion",
    owner: "Ava Patel",
    submittedAt: "May 9, 2026",
    notes: "",
    editorFeedback: "",
    comments: [],
    updatedAt: "May 30, 2026",
  },
];

const cx = (...classes) => classes.filter(Boolean).join(" ");
const fmt = (n) => n.toLocaleString("en-US");
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const FALLBACK_ACCOUNT = {
  email: "",
  firstName: "Newsroom",
  lastName: "User",
  role: "",
};
const ARTICLE_PAGE_SIZE = 10;
const EXTRACTOR_ADDED_BY = "Editor";
const EXTRACTOR_GRADE_OPTIONS = ["", "9", "10", "11", "12", "Staff"];
const EXTRACTOR_HOUSE_OPTIONS = ["", "SMCS", "Global", "Humanities", "ISP"];
const GOOGLE_PICKER_SCRIPT_SRC = "https://apis.google.com/js/api.js";
let googlePickerLoadPromise = null;

function asText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeSectionLabel(value) {
  return asText(value).replace(/\s+/g, " ");
}

function uniqueTextValues(values) {
  const seen = new Set();
  const result = [];
  values.forEach((value) => {
    const text = asText(value);
    const key = text.toLowerCase();
    if (!text || seen.has(key)) return;
    seen.add(key);
    result.push(text);
  });
  return result;
}

function navSectionsForItems(items) {
  const itemById = new Map(items.map((item) => [item.id, item]));
  return navSections
    .map((section) => ({
      ...section,
      items: section.items.map((id) => itemById.get(id)).filter(Boolean),
    }))
    .filter((section) => section.items.length);
}

function loadExternalScript(src) {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      if (existing.dataset.loaded === "true") resolve();
      else {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
      }
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });
}

function loadGooglePickerApi() {
  if (typeof window === "undefined") return Promise.reject(new Error("Google Picker requires a browser."));
  if (window.google?.picker) return Promise.resolve();
  if (!googlePickerLoadPromise) {
    googlePickerLoadPromise = loadExternalScript(GOOGLE_PICKER_SCRIPT_SRC).then(() => new Promise((resolve, reject) => {
      if (!window.gapi?.load) {
        reject(new Error("Google Picker script did not load."));
        return;
      }
      window.gapi.load("picker", {
        callback: resolve,
        onerror: () => reject(new Error("Could not load Google Picker.")),
        ontimeout: () => reject(new Error("Google Picker timed out.")),
        timeout: 10000,
      });
    }));
  }
  return googlePickerLoadPromise;
}

function firstText(...values) {
  for (const value of values) {
    const text = asText(value);
    if (text) return text;
  }
  return "";
}

function accountDisplayName(user) {
  const firstName = asText(user?.firstName);
  const lastName = asText(user?.lastName);
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || asText(user?.name) || asText(user?.email) || "Newsroom user";
}

function accountInitials(user) {
  const nameParts = accountDisplayName(user).split(/\s+/).filter(Boolean);
  const source = nameParts.length >= 2 ? [nameParts[0], nameParts[nameParts.length - 1]] : nameParts;
  const initials = source.map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return initials || "FN";
}

function accountRoleLabel(role) {
  const value = asText(role);
  return value ? value[0].toUpperCase() + value.slice(1) : "";
}

function monthDayYear(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDisplayDate(value) {
  const raw = asText(value);
  if (!raw) return "";
  const lower = raw.toLowerCase();
  const now = new Date();
  if (["today", "just now", "this morning", "updated just now"].includes(lower)) {
    return monthDayYear(now);
  }
  if (lower === "yesterday") {
    const date = new Date(now);
    date.setDate(date.getDate() - 1);
    return monthDayYear(date);
  }
  if (lower === "tomorrow") {
    const date = new Date(now);
    date.setDate(date.getDate() + 1);
    return monthDayYear(date);
  }
  const relativeMatch = lower.match(/^(\d+)\s+(min|mins|minute|minutes|hr|hrs|hour|hours|day|days|week|weeks)\s+ago$/);
  if (relativeMatch) {
    const amount = Number(relativeMatch[1]);
    const unit = relativeMatch[2];
    const date = new Date(now);
    if (unit.startsWith("day")) date.setDate(date.getDate() - amount);
    else if (unit.startsWith("week")) date.setDate(date.getDate() - amount * 7);
    return monthDayYear(date);
  }
  const isoDateOnlyMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateOnlyMatch) {
    const date = new Date(Number(isoDateOnlyMatch[1]), Number(isoDateOnlyMatch[2]) - 1, Number(isoDateOnlyMatch[3]));
    return monthDayYear(date);
  }
  const monthDayMatch = raw.match(/^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}$/i);
  if (monthDayMatch) {
    const parsedMonthDay = Date.parse(`${raw}, ${now.getFullYear()}`);
    if (!Number.isNaN(parsedMonthDay)) return monthDayYear(new Date(parsedMonthDay));
  }
  const parsed = Date.parse(raw.replace(/,\s*\d{1,2}:\d{2}\s*(AM|PM)$/i, ""));
  if (!Number.isNaN(parsed)) return monthDayYear(new Date(parsed));
  return raw;
}

function inputDateValue(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function defaultApprovalDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return inputDateValue(date);
}

function parseCalendarDate(value, fallbackYear = new Date().getFullYear()) {
  const raw = asText(value);
  if (!raw || ["published", "draft", "idea"].includes(raw.toLowerCase())) return null;
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const date = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const monthDayMatch = raw.match(/^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}$/i);
  const candidate = monthDayMatch ? `${raw}, ${fallbackYear}` : raw.replace(/,\s*\d{1,2}:\d{2}\s*(AM|PM)$/i, "");
  const parsed = Date.parse(candidate);
  if (Number.isNaN(parsed)) return null;
  const date = new Date(parsed);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function calendarDateKey(date) {
  return inputDateValue(date);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function monthYearLabel(date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

function buildCalendarCells(monthDate) {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const firstVisible = new Date(firstOfMonth);
  firstVisible.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstVisible);
    date.setDate(firstVisible.getDate() + index);
    return {
      date,
      key: calendarDateKey(date),
      day: date.getDate(),
      inMonth: date.getMonth() === monthDate.getMonth(),
      isToday: calendarDateKey(date) === calendarDateKey(new Date()),
    };
  });
}
function normalizeDisplayFeedback(item = {}) {
  return {
    ...item,
    time: formatDisplayDate(item.time || item.createdAt || item.updatedAt),
  };
}

function activityTimestamp(item = {}) {
  const parsed = Date.parse(item.occurredAt || item.createdAt || item.time || "");
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortActivitiesNewestFirst(items = []) {
  return [...items].sort((left, right) => {
    const timestampDifference = activityTimestamp(right) - activityTimestamp(left);
    if (timestampDifference) return timestampDifference;
    return asText(right.id).localeCompare(asText(left.id));
  });
}

function normalizeDisplayActivity(item = {}) {
  return {
    ...item,
    time: formatDisplayDate(item.occurredAt || item.time || item.createdAt),
  };
}

function normalizeStoryCollaborator(item = {}) {
  const email = asText(item.email).toLowerCase();
  const role = asText(item.role).toLowerCase() || "view";
  return {
    ...item,
    id: asText(item.id || item.userId || email),
    userId: asText(item.userId || item.id),
    email,
    name: asText(item.name) || email || "Collaborator",
    role,
    status: asText(item.status).toLowerCase() || "invalid",
    invitedAt: formatDisplayDate(item.invitedAt),
  };
}

function storyCollaboratorRoleLabel(role) {
  return STORY_COLLABORATOR_ROLE_OPTIONS.find((option) => option.id === role)?.label || "Collaborator";
}

function storyCollaboratorRoleDescription(role) {
  return STORY_COLLABORATOR_ROLE_OPTIONS.find((option) => option.id === role)?.description || "Can view and comment, but cannot edit or submit the story.";
}

function storyEditingCollaboratorForUser(story, user) {
  const collaborator = storyCollaboratorForUser(story, user);
  return collaborator?.status === "accepted" && collaborator?.role === "edit" ? collaborator : null;
}
function dueDateValue(record = {}) {
  return firstText(
    record.deadline,
    record.dueDate,
    record.approvalDueDate,
    record.due,
    record.dateDue,
    record.deadlineDate,
    record.due_date,
    record.deadline_date,
    record.approval_due_date
  );
}

function storyDeadlineValue(story = {}) {
  return dueDateValue(story);
}

function storyDueDateLabel(story = {}) {
  const deadline = storyDeadlineValue(story);
  return formatDisplayDate(deadline) || deadline;
}

function storyAuthorNames(story = {}) {
  const acceptedCoauthors = Array.isArray(story.collaborators)
    ? story.collaborators
        .filter((collaborator) => collaborator?.status === "accepted" && collaborator?.role === "edit")
        .map((collaborator) => collaborator.name)
    : [];
  return uniqueTextValues([story.writer, ...toList(story.authors), ...acceptedCoauthors]);
}

function storyWithApprovedDueDate(story, approvedDueDate) {
  const dueDate = firstText(approvedDueDate);
  if (!story || !dueDate || storyDeadlineValue(story)) return story;
  return { ...story, deadline: dueDate, dueDate };
}

function normalizeDisplayStory(story = {}) {
  const displayDeadline = storyDueDateLabel(story);
  return {
    ...story,
    submittedAt: formatDisplayDate(story.submittedAt),
    lastEdited: formatDisplayDate(story.lastEdited),
    deadline: displayDeadline,
    dueDate: displayDeadline,
    feedback: Array.isArray(story.feedback) ? story.feedback.map(normalizeDisplayFeedback) : story.feedback,
    comments: Array.isArray(story.comments) ? story.comments.map(normalizeDisplayFeedback) : story.comments,
    collaborators: Array.isArray(story.collaborators) ? story.collaborators.map(normalizeStoryCollaborator) : [],
  };
}

function normalizeDisplayPitch(pitch = {}) {
  const legacyStatus = {
    New: "In Progress",
    Submitted: "Ready for Review",
    "Needs Review": "Ready for Review",
    Approved: PITCH_STATUS_SELECTED,
    Selected: PITCH_STATUS_SELECTED,
    "Selected for Story": PITCH_STATUS_SELECTED,
    "Not Selected": PITCH_STATUS_ON_HOLD,
    "Not selected": PITCH_STATUS_ON_HOLD,
  };
  return {
    ...pitch,
    status: legacyStatus[pitch.status] || pitch.status,
    submittedAt: formatDisplayDate(pitch.submittedAt),
    updatedAt: formatDisplayDate(pitch.updatedAt),
    feedback: Array.isArray(pitch.feedback) ? pitch.feedback.map(normalizeDisplayFeedback) : pitch.feedback,
    comments: Array.isArray(pitch.comments) ? pitch.comments.map(normalizeDisplayFeedback) : pitch.comments,
  };
}

function normalizeDisplayUser(user = {}) {
  return {
    ...user,
    lastSeen: formatDisplayDate(user.lastSeen),
  };
}

function normalizeAppRole(role) {
  const value = asText(role).toLowerCase();
  return APP_ROLE_OPTIONS.includes(value) ? value : "guest";
}

function canManageEditorialWorkflow(role) {
  return ["owner", "admin", "editor"].includes(normalizeAppRole(role));
}

function pitchBelongsToUser(pitch, user) {
  if (!pitch || !user) return false;
  const pitchUserIds = [pitch.ownerUserId, pitch.writerUserId, pitch.ownerId, pitch.writerId]
    .map((value) => asText(value).toLowerCase())
    .filter(Boolean);
  const pitchEmails = [pitch.ownerEmail, pitch.writerEmail]
    .map((value) => asText(value).toLowerCase())
    .filter(Boolean);
  const userIds = [user.id, user._id]
    .map((value) => asText(value).toLowerCase())
    .filter(Boolean);
  const userEmail = asText(user.email).toLowerCase();
  return userIds.some((value) => pitchUserIds.includes(value)) || Boolean(userEmail && pitchEmails.includes(userEmail));
}

function storyBelongsToUser(story, user) {
  if (!story || !user) return false;
  const storyUserIds = [story.writerUserId, story.ownerUserId, story.writerId, story.ownerId]
    .map((value) => asText(value).toLowerCase())
    .filter(Boolean);
  const storyEmails = [story.writerEmail, story.ownerEmail]
    .map((value) => asText(value).toLowerCase())
    .filter(Boolean);
  const userIds = [user.id, user._id]
    .map((value) => asText(value).toLowerCase())
    .filter(Boolean);
  const userEmail = asText(user.email).toLowerCase();
  return userIds.some((value) => storyUserIds.includes(value)) || Boolean(userEmail && storyEmails.includes(userEmail));
}

function storyCollaboratorForUser(story, user) {
  if (!story || !user || !Array.isArray(story.collaborators)) return null;
  const userIds = [user.id, user._id]
    .map((value) => asText(value).toLowerCase())
    .filter(Boolean);
  const userEmail = asText(user.email).toLowerCase();
  return story.collaborators.find((collaborator) => {
    const collaboratorIds = [collaborator.id, collaborator.userId]
      .map((value) => asText(value).toLowerCase())
      .filter(Boolean);
    const collaboratorEmail = asText(collaborator.email).toLowerCase();
    return userIds.some((value) => collaboratorIds.includes(value)) || Boolean(userEmail && collaboratorEmail === userEmail);
  }) || null;
}

function storyVisibleToUser(story, user) {
  const role = normalizeAppRole(user?.role);
  if (role === "guest") return false;
  if (role === "writer") return storyBelongsToUser(story, user) || storyCollaboratorForUser(story, user)?.status === "accepted";
  return true;
}

function canSubmitOwnStory(user, story) {
  const role = normalizeAppRole(user?.role);
  const isAuthor = storyBelongsToUser(story, user) || Boolean(storyEditingCollaboratorForUser(story, user));
  if (!["writer", "editor", "admin"].includes(role) || !isAuthor) return false;
  return !["Submitted", "In Review", "Ready for Publish", "Published"].includes(story.status);
}

function canUnsubmitOwnStory(user, story) {
  const role = normalizeAppRole(user?.role);
  const isAuthor = storyBelongsToUser(story, user) || Boolean(storyEditingCollaboratorForUser(story, user));
  return ["writer", "editor", "admin"].includes(role) && isAuthor && story?.status === "Submitted";
}

function canUpdateOwnStorySubmission(user, story) {
  return canSubmitOwnStory(user, story) || canUnsubmitOwnStory(user, story);
}

function canManageStoryCollaborators(user, story) {
  const role = normalizeAppRole(user?.role);
  if (["Ready for Publish", "Published"].includes(story?.status)) return false;
  return ["owner", "admin", "editor"].includes(role) || (role === "writer" && (storyBelongsToUser(story, user) || Boolean(storyEditingCollaboratorForUser(story, user))));
}

function canEditStoryAttachment(user, story) {
  if (canManageEditorialWorkflow(user?.role)) return STORY_EDITOR_EDITABLE_STATUSES.includes(story?.status);
  if (normalizeAppRole(user?.role) !== "writer") return false;
  if (!STORY_AUTHOR_EDITABLE_STATUSES.includes(story?.status)) return false;
  return storyBelongsToUser(story, user) || Boolean(storyEditingCollaboratorForUser(story, user));
}

function canCommentOnStory(user, story) {
  if (canManageEditorialWorkflow(user?.role)) return true;
  return normalizeAppRole(user?.role) === "writer" && (storyBelongsToUser(story, user) || storyCollaboratorForUser(story, user)?.status === "accepted");
}

function navItemsForRole(role) {
  const currentRole = normalizeAppRole(role);
  return navItems.filter((item) => {
    if (item.id === "pitches" || item.id === "stories") return currentRole !== "guest";
    return true;
  });
}

function roleCanAccessPage(role, page) {
  return navItemsForRole(role).some((item) => item.id === page);
}

function defaultPageForRole(role) {
  const currentRole = normalizeAppRole(role);
  if (currentRole === "owner") return "dashboard";
  if (currentRole === "guest") return "interviewees";
  if (currentRole === "writer") return "stories";
  return "dashboard";
}

function isOwnerRoute(pathname = window.location.pathname) {
  return pathname.toLowerCase().replace(/\/+$/, "") === "/owner";
}

function loginRedirectForCurrentPath() {
  const current = `${window.location.pathname}${window.location.search}`;
  if (!current || current === "/" || current.startsWith("/login") || current.startsWith("/signup")) {
    return "/login";
  }
  return `/login?next=${encodeURIComponent(current)}`;
}

function toList(value) {
  if (Array.isArray(value)) {
    return value.map(asText).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,]+/g)
      .map(asText)
      .filter(Boolean);
  }
  return [];
}

function normalizeUrl(value) {
  const url = asText(value);
  if (!url) return "";
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return url;
  }
}

function urlJoinKey(value) {
  const url = normalizeUrl(value);
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, "");
    return `${parsed.protocol}//${parsed.host}${path}${parsed.search}`.toLowerCase();
  } catch {
    return url.replace(/\/+$/, "").toLowerCase();
  }
}

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function safeResourceUrl(value, { allowRelative = false } = {}) {
  const url = asText(value);
  if (!url || /[\\\u0000-\u001f\u007f]/.test(url)) return "";
  if (allowRelative && url.startsWith("/") && !url.startsWith("//")) {
    try {
      const resolved = new URL(url, window.location.origin);
      return resolved.origin === window.location.origin ? `${resolved.pathname}${resolved.search}${resolved.hash}` : "";
    } catch {
      return "";
    }
  }
  return isValidHttpUrl(url) ? url : "";
}

function safeInternalRedirect(value, fallback = "/dashboard") {
  const target = asText(value);
  if (!target || /[\\\u0000-\u001f\u007f]/.test(target)) return fallback;
  try {
    const resolved = new URL(target, window.location.origin);
    if (resolved.origin !== window.location.origin) return fallback;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}

function storyDocIsOpenable(story) {
  return storyAttachmentItems(story).length > 0;
}

function normalizeStoryAttachment(story, attachment) {
  if (!attachment) return null;
  const attachmentUrl = attachment?.type === "file"
    ? safeResourceUrl(attachment.url, { allowRelative: true })
    : safeResourceUrl(attachment.webViewLink || attachment.url);
  if (attachment?.type === "drive" && attachmentUrl) {
    return {
      id: attachment.id || attachment.fileId || attachment.url,
      type: "drive",
      provider: "google-drive",
      url: attachmentUrl,
      name: attachment.name || story?.title || "Drive file",
      detail: attachment.typeLabel || workAttachmentTypeLabel(attachment),
      permissionStatus: attachment.permissionStatus || "not_shared",
      shareResults: Array.isArray(attachment.shareResults) ? attachment.shareResults : [],
      copyable: true,
    };
  }
  if (attachment?.type === "file" && attachmentUrl) {
    return {
      id: attachment.id || attachment.url,
      type: "file",
      url: attachmentUrl,
      name: workAttachmentTitle(story, attachment),
      detail: workAttachmentTypeLabel(attachment),
      copyable: false,
    };
  }
  const url = attachment?.type === "link" ? attachment.url : story?.googleDocUrl;
  if (!isValidHttpUrl(url)) return null;
  return {
    id: attachment?.id || url,
    type: "link",
    url,
    name: workAttachmentTitle(story, attachment),
    detail: workAttachmentTypeLabel({ ...attachment, type: "link", url }),
    copyable: true,
  };
}

function storyAttachmentItems(story) {
  const rawAttachments = Array.isArray(story?.attachments) ? story.attachments : [];
  const attachments = rawAttachments
    .map((attachment) => normalizeStoryAttachment(story, attachment))
    .filter(Boolean);
  if (attachments.length) return attachments;
  const single = normalizeStoryAttachment(story, story?.attachment || null);
  return single ? [single] : [];
}

function storyAttachmentInfo(story) {
  return storyAttachmentItems(story)[0] || null;
}

function rawStoryAttachmentItems(story) {
  if (Array.isArray(story?.attachments)) return story.attachments.filter(Boolean);
  if (story?.attachment) return [story.attachment];
  return [];
}

function storyAttachmentMergeKey(attachment) {
  const item = attachment || {};
  const type = asText(item.type).toLowerCase();
  const fileId = asText(item.fileId);
  const url = asText(item.webViewLink || item.url);
  if ((type === "drive" || type === "link") && url) return `url:${url}`;
  if (type === "file" && fileId) return `${type}:${fileId}`;
  return asText(item.id || item.attachmentId || url || item.name);
}

function mergeStoryAttachmentState(previousStory, updatedStory) {
  const mergedAttachments = [];
  const seen = new Set();
  for (const item of [...rawStoryAttachmentItems(previousStory), ...rawStoryAttachmentItems(updatedStory)]) {
    const key = storyAttachmentMergeKey(item);
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    mergedAttachments.push(item);
  }
  if (!mergedAttachments.length) return updatedStory;
  return {
    ...updatedStory,
    attachments: mergedAttachments,
    attachment: mergedAttachments[0],
  };
}

function workAttachmentTitle(story, attachment) {
  const name = asText(attachment?.name);
  if (name && !["story link", "story doc", "uploaded story file", "story upload"].includes(name.toLowerCase())) {
    return name;
  }
  return story?.title || "Attached work";
}

function workAttachmentTypeLabel(attachment) {
  const name = asText(attachment?.name).toLowerCase();
  const url = asText(attachment?.url).toLowerCase();
  const contentType = asText(attachment?.contentType).toLowerCase();
  const source = `${name} ${url} ${contentType}`;
  const hasExtension = (...extensions) => new RegExp(`\\.(${extensions.join("|")})(?:[\\s?#]|$)`).test(source);

  if (source.includes("docs.google.com/document")) return "Google Doc";
  if (source.includes("docs.google.com/presentation")) return "Google Slides";
  if (source.includes("docs.google.com/spreadsheets")) return "Google Sheet";
  if (source.includes("application/pdf") || hasExtension("pdf")) return "PDF";
  if (source.includes("wordprocessingml") || hasExtension("docx?", "odt")) return "Document";
  if (source.includes("presentationml") || hasExtension("pptx?", "odp")) return "Slides";
  if (source.includes("spreadsheetml") || hasExtension("xlsx?", "ods", "csv")) return "Spreadsheet";
  if (source.includes("image/") || hasExtension("png", "jpe?g", "webp", "gif", "heic")) return "Image";
  if (source.includes("text/") || hasExtension("txt", "md", "rtf")) return "Text file";
  return attachment?.type === "file" ? "Uploaded file" : "Linked document";
}

function storyAttachmentCopyUrl(story, selectedAttachment = null) {
  const attachment = selectedAttachment || storyAttachmentInfo(story);
  if (!attachment?.url) return "";
  if (attachment.type === "file" && attachment.url.startsWith("/")) {
    return `${window.location.origin}${attachment.url}`;
  }
  return attachment.url;
}

function drivePermissionText(status) {
  const normalizedStatus = asText(status).toLowerCase().replace(/[\s-]+/g, "_");
  return {
    shared: "Shared with newsroom editors",
    partial: "Shared with some editors",
    failed: "Editor sharing needs attention",
    not_shared: "Not yet shared with editors",
  }[normalizedStatus] || "";
}

function formatFileSize(size) {
  const bytes = Number(size) || 0;
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

function storyStatusTextClass(status) {
  if (status === "Ready for Publish" || status === "Published") return "text-emerald-300";
  if (status === "Needs Revision") return "text-amber-300";
  if (status === "Returned") return "text-rose-300";
  if (status === "In Review" || status === "Drafting") return "text-violet-300";
  if (status === "Reporting" || status === "Assigned") return "text-zinc-300";
  if (status === "Submitted") return "text-sky-300";
  return "text-zinc-300";
}

function storyBadgeTone(status) {
  if (status === "Ready for Publish" || status === "Published") return "green";
  if (status === "Needs Revision") return "amber";
  if (status === "Returned") return "rose";
  if (status === "In Review" || status === "Drafting") return "violet";
  if (status === "Submitted") return "blue";
  return "neutral";
}

function storyColumnForStatus(status) {
  return STORY_WORKFLOW_COLUMNS.find((column) => column.statuses.includes(status)) || STORY_WORKFLOW_COLUMNS[0];
}

function storyColumnForStory(story) {
  return storyColumnForStatus(story?.status);
}

function isActiveStory(story) {
  return ACTIVE_STORY_STATUSES.includes(story.status);
}

function storySearchText(story) {
  return [
    story.title,
    storyAuthorNames(story).join(" "),
    story.editor,
    story.section,
    story.status,
    story.summary,
    story.nextStep,
    story.editorNote,
  ]
    .join(" ")
    .toLowerCase();
}

function storyMatchesFilters(story, query, status, section) {
  const needle = query.trim().toLowerCase();
  if (needle && !storySearchText(story).includes(needle)) return false;
  if (status !== "All statuses" && story.status !== status) return false;
  if (section !== "All sections" && story.section !== section) return false;
  return true;
}

function storyCommentCount(story) {
  return (Array.isArray(story.feedback) ? story.feedback.length : 0) + (Array.isArray(story.comments) ? story.comments.length : 0) + (story.editorNote ? 1 : 0);
}

function storyWorkflowAction(story) {
  if (!story) return null;
  if (story.status === "Submitted") return { label: "Unsubmit", nextStatus: "Drafting" };
  if (["In Review", "Ready for Publish", "Published"].includes(story.status)) return null;
  return { label: "Submit", nextStatus: "Submitted" };
}

function storyFeedbackItems(story) {
  const items = [];
  if (story?.editorNote) {
    items.push({ id: `${story.id}-editor-note`, author: story.editor || "Editor", text: story.editorNote, time: story.lastEdited || "Recently" });
  }
  if (Array.isArray(story?.feedback)) {
    items.push(...story.feedback);
  }
  return items;
}

function storySourceItems(story) {
  if (Array.isArray(story?.sources) && story.sources.length) return story.sources;
  const count = Number(story?.sourceCount) || 0;
  if (!count) return [];
  return Array.from({ length: Math.min(count, 4) }, (_, index) => ({
    id: `${story.id}-source-${index}`,
    name: ["Student voice", "Adviser or staff source", "Primary document", "Follow-up source"][index] || `Source ${index + 1}`,
    status: index < Math.max(1, count - 1) ? "Confirmed" : "Needs check",
    note: ["Quote verified", "Availability confirmed", "Policy or record linked", "Waiting on response"][index] || "Tracking note",
  }));
}

function storyActivityItems(story) {
  return Array.isArray(story?.activity) ? story.activity : [];
}

function useWorkflowActivity(entityType, entityId, refreshKey = "") {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!entityType || !entityId) {
      setActivity([]);
      setError("");
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    async function loadActivity() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ entityType, entityId });
        const response = await fetch(`${API_BASE}/api/activity?${params.toString()}`, {
          headers: { Accept: "application/json" },
          credentials: "include",
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.ok === false) {
          throw new Error(payload?.error || "Activity is unavailable.");
        }
        setActivity(Array.isArray(payload.activity) ? sortActivitiesNewestFirst(payload.activity.map(normalizeDisplayActivity)) : []);
      } catch (fetchError) {
        if (fetchError.name === "AbortError") return;
        setActivity([]);
        setError(fetchError instanceof Error ? fetchError.message : "Activity is unavailable.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadActivity();
    return () => controller.abort();
  }, [entityType, entityId, refreshKey]);

  return { activity, loading, error };
}

function useEntityFeedback(entityType, entityId, refreshKey = "") {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!entityType || !entityId) {
      setFeedback([]);
      setError("");
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    async function loadFeedback() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ entityType, entityId });
        const response = await fetch(`${API_BASE}/api/feedback?${params.toString()}`, {
          headers: { Accept: "application/json" },
          credentials: "include",
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.ok === false) {
          throw new Error(payload?.error || "Feedback is unavailable.");
        }
        setFeedback(Array.isArray(payload.feedback) ? payload.feedback.map(normalizeDisplayFeedback) : []);
      } catch (fetchError) {
        if (fetchError.name === "AbortError") return;
        setFeedback([]);
        setError(fetchError instanceof Error ? fetchError.message : "Feedback is unavailable.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadFeedback();
    return () => controller.abort();
  }, [entityType, entityId, refreshKey]);

  return { feedback, setFeedback, loading, error };
}

function optionsWithCurrent(options, value) {
  const current = asText(value);
  if (!current || options.includes(current)) return options;
  return [...options, current];
}

const MONTH_DATE_RE = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}$/;

function normalizePublishedDate(...values) {
  const text = firstText(...values);
  if (!text || text.length > 80) return "";
  if (MONTH_DATE_RE.test(text)) return text;
  const parsed = Date.parse(text);
  if (Number.isNaN(parsed)) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(parsed));
}

function normalizeInterviewee(raw = {}) {
  const firstName = firstText(raw.firstName, raw.first_name);
  const lastName = firstText(raw.lastName, raw.last_name);
  const name = firstText(raw.name, `${firstName} ${lastName}`.trim(), raw.fullName, raw.full_name);
  return {
    id: firstText(raw.id, raw._id, `${name}-${raw.dateAdded || raw.date || raw.time || ""}`),
    name,
    firstName,
    lastName,
    grade: firstText(raw.grade),
    house: firstText(raw.house),
    url: normalizeUrl(firstText(raw.url, raw.articleUrl, raw.article_url)),
    dateAdded: firstText(raw.dateAdded, raw.date, raw.dateInterviewed, raw.time),
    addedBy: firstText(raw.addedBy, raw.added_by, raw.user, raw.createdBy),
    quote: firstText(raw.quote, raw.evidence, raw.quoteEvidence),
  };
}

function normalizeArticleRecord(raw = {}) {
  const authors = toList(raw.authors).length ? toList(raw.authors) : toList(raw.author);
  const tags = uniqueTextValues(toList(raw.tags).length ? toList(raw.tags) : toList(raw.categories));
  const url = normalizeUrl(firstText(raw.url, raw.articleUrl, raw.article_url));
  const section = firstText(raw.section, raw.category);
  const interviewees = Array.isArray(raw.interviewees) ? raw.interviewees.map(normalizeInterviewee) : [];

  return {
    id: firstText(raw.id, raw._id, url, raw.title, raw.articleTitle),
    title: firstText(raw.title, raw.articleTitle, "Untitled article"),
    url,
    authors,
    byline: authors.length ? `By ${authors.join(", ")}` : "Byline unavailable",
    publishedAt: normalizePublishedDate(raw.publishedAt, raw.datePublished, raw.date, raw.published),
    section,
    tags,
    filterGroups: uniqueTextValues([section, firstText(raw.category), ...tags]),
    interviewees,
  };
}

function articleSearchText(article) {
  return [
    article.title,
    article.authors.join(" "),
    article.section,
    article.tags.join(" "),
    article.interviewees.map((person) => [person.name, person.firstName, person.lastName].join(" ")).join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function matchesArticleFilters(article, query, section) {
  const needle = query.trim().toLowerCase();
  if (needle && !articleSearchText(article).includes(needle)) return false;
  if (section !== "All sections" && !article.filterGroups.includes(section)) return false;
  return true;
}

function dateSortValue(value) {
  const text = asText(value);
  if (!text) return 0;
  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function buildPaginationItems(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (currentPage <= 2) {
    return [1, 2, "end-ellipsis", totalPages];
  }
  if (currentPage >= totalPages - 1) {
    return [1, "start-ellipsis", totalPages - 1, totalPages];
  }
  return [1, "start-ellipsis", currentPage - 1, currentPage, currentPage + 1, "end-ellipsis", totalPages];
}

function resultCountParts(page, limit, total) {
  if (!total) return { start: 0, end: 0, total: 0 };
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return { start, end, total };
}

function articleCountLabel(count) {
  return `${count} ${count === 1 ? "article" : "articles"}`;
}

function paginationPageButtonClass(isActive) {
  return cx(
    "flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition",
    isActive
      ? "border-white/[0.16] bg-white/[0.08] text-zinc-50"
      : "border-white/[0.08] bg-white/[0.025] text-zinc-300 hover:bg-white/[0.06] hover:text-zinc-100"
  );
}

function normalizeSourceGrade(value) {
  const text = firstText(value, "Unknown");
  if (text.toLowerCase() === "unknown") return "Unknown";
  if (["staff", "faculty", "faculty / staff", "faculty/staff"].includes(text.toLowerCase())) {
    return "Staff";
  }
  return text;
}

function normalizeSourceHouse(value) {
  return firstText(value, "Unknown");
}

function splitSourceName(name) {
  const parts = asText(name).split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0] || "", lastName: "" };
  }
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function normalizeInterviewRecordRow(record, articleByUrl, index = 0) {
  const source = normalizeInterviewee(record);
  const url = normalizeUrl(firstText(source.url, record.url, record.articleUrl, record.article_url));
  const linkedArticle = articleByUrl.get(urlJoinKey(url)) || {};
  const articleTitle = firstText(
    linkedArticle.title,
    record.articleTitle,
    record.article_title,
    record.title,
    "Article title unavailable"
  );
  const publishedAt = normalizePublishedDate(
    linkedArticle.publishedAt,
    record.datePublished,
    record.publishedAt,
    record.published,
    record.articleDate
  );
  const name = firstText(source.name, "Unknown source");
  const firstName = firstText(source.firstName, splitSourceName(name).firstName);
  const lastName = firstText(source.lastName, splitSourceName(name).lastName);
  const grade = normalizeSourceGrade(source.grade);
  const house = normalizeSourceHouse(source.house);

  return {
    id: firstText(source.id, record.id, record._id, `${url || articleTitle}-${name}-${index}`),
    name,
    firstName,
    lastName,
    grade,
    house,
    dateAdded: source.dateAdded,
    addedBy: source.addedBy,
    quote: source.quote,
    article: {
      title: articleTitle,
      publishedAt,
      url,
    },
    searchText: [
      name,
      firstName,
      lastName,
      grade,
      house,
      articleTitle,
      publishedAt,
    ].join(" ").toLowerCase(),
  };
}

function buildInterviewRecordRows(interviewRecords = [], articleRecords = []) {
  const articles = articleRecords.map(normalizeArticleRecord);
  const articleByUrl = new Map();
  articles.forEach((article) => {
    const key = urlJoinKey(article.url);
    if (key) articleByUrl.set(key, article);
  });

  return interviewRecords
    .map((record, index) => normalizeInterviewRecordRow(record, articleByUrl, index))
    .sort((a, b) => sortByPublishedDate(a, b, "desc"));
}

function sortByPublishedDate(a, b, direction = "desc") {
  const aValue = dateSortValue(a.article?.publishedAt);
  const bValue = dateSortValue(b.article?.publishedAt);
  if (!aValue && bValue) return 1;
  if (aValue && !bValue) return -1;
  const diff = aValue - bValue;
  if (diff !== 0) return direction === "asc" ? diff : -diff;
  return firstText(a.article?.title).localeCompare(firstText(b.article?.title));
}

function interviewRecordMatchesFilters(record, query, grade, house) {
  const needle = query.trim().toLowerCase();
  if (needle && !record.searchText.includes(needle)) return false;
  if (grade !== "All grades" && record.grade !== grade) return false;
  if (house !== "All houses" && record.house !== house) return false;
  return true;
}

function updateInterviewRecordRow(record, draft) {
  const firstName = firstText(draft.firstName, record.firstName);
  const lastName = firstText(draft.lastName, record.lastName);
  const name = firstText(`${firstName} ${lastName}`.trim(), record.name, "Unknown source");
  const grade = normalizeSourceGrade(draft.grade);
  const house = normalizeSourceHouse(draft.house);
  return {
    ...record,
    name,
    firstName,
    lastName,
    grade,
    house,
    searchText: [
      name,
      firstName,
      lastName,
      grade,
      house,
      record.article?.title,
      record.article?.publishedAt,
    ].join(" ").toLowerCase(),
  };
}

function sourceEditGradeOptions(currentGrade) {
  const base = ["9", "10", "11", "12", "Staff"];
  const current = normalizeSourceGrade(currentGrade);
  const ordered = [...base, current].filter((grade) => grade && grade !== "Unknown");
  return [...new Set(ordered), "Unknown"];
}

function sourceEditHouseOptions(currentHouse) {
  const base = ["Humanities", "Global", "ISP", "SMCS"];
  const current = normalizeSourceHouse(currentHouse);
  const ordered = [...base, current].filter((house) => house && house !== "Unknown");
  return [...new Set(ordered), "Unknown"];
}

function buildGradeOptions(sources) {
  const grades = new Set(sources.map((source) => source.grade));
  const base = ["All grades", "9", "10", "11", "12"];
  if (grades.has("Staff")) base.push("Staff");
  const extras = Array.from(grades)
    .filter((grade) => grade && !base.includes(grade) && grade !== "Unknown")
    .sort((a, b) => a.localeCompare(b));
  return grades.has("Unknown") ? [...base, ...extras, "Unknown"] : [...base, ...extras];
}

function buildHouseOptions(sources) {
  const houses = new Set(sources.map((source) => source.house));
  const base = ["All houses", "Humanities", "Global", "ISP", "SMCS"];
  const extras = Array.from(houses)
    .filter((house) => house && !base.includes(house) && house !== "Unknown")
    .sort((a, b) => a.localeCompare(b));
  return houses.has("Unknown") ? [...base, ...extras, "Unknown"] : [...base, ...extras];
}

function pitchStatusTone(status) {
  if (status === PITCH_STATUS_SELECTED) return "green";
  if (status === "Ready for Review") return "blue";
  if (status === PITCH_STATUS_ON_HOLD) return "amber";
  return "neutral";
}

function isRoundPitch(pitch) {
  return Boolean(pitch?.id);
}

function pitchNoteCount(pitch) {
  return (pitch.notes ? 1 : 0) + pitchFeedbackItems(pitch).length + (Array.isArray(pitch.comments) ? pitch.comments.length : 0);
}

function pitchFeedbackItems(pitch) {
  const items = [];
  if (pitch?.editorFeedback) {
    items.push({
      id: "editor-feedback",
      author: "Editor",
      text: pitch.editorFeedback,
      time: pitch.updatedAt || "Earlier",
      source: "legacy",
    });
  }
  if (Array.isArray(pitch?.feedback)) {
    items.push(...pitch.feedback);
  }
  return items;
}

function pitchStatusDotClass(status) {
  if (status === PITCH_STATUS_SELECTED) return "bg-emerald-400";
  if (status === "Ready for Review") return "bg-sky-400";
  if (status === PITCH_STATUS_ON_HOLD) return "bg-amber-400";
  return "bg-zinc-400";
}

function PitchStatusText({ status, count }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-zinc-400">
      <span className={cx("h-2 w-2 rounded-full", pitchStatusDotClass(status))} />
      <span>{count !== undefined ? `${count} ` : ""}{status}</span>
    </span>
  );
}

function pitchSearchText(pitch) {
  return [
    pitch.title,
    pitch.angle,
    pitch.status,
    pitch.section,
    pitch.owner,
    pitch.submittedAt,
    pitch.notes,
    pitch.editorFeedback,
    pitchFeedbackItems(pitch).map((item) => `${item.author} ${item.text}`).join(" "),
    pitch.comments.map((comment) => `${comment.author} ${comment.text}`).join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function matchesPitchFilters(pitch, query, section, statusFilter = "All pitches") {
  const needle = query.trim().toLowerCase();
  if (needle && !pitchSearchText(pitch).includes(needle)) return false;
  if (section !== "All sections" && pitch.section !== section) return false;
  if (statusFilter !== "All pitches" && pitch.status !== statusFilter) return false;
  return true;
}

function pitchOwnerGroupKey(pitch) {
  return asText(pitch.ownerUserId) || asText(pitch.ownerEmail).toLowerCase() || asText(pitch.owner).toLowerCase() || "unassigned";
}

function groupActivePitchesByWriter(pitches) {
  const grouped = new Map();
  pitches.forEach((pitch) => {
    const writer = pitch.owner || "Unassigned";
    const key = pitchOwnerGroupKey(pitch);
    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        writer,
        email: asText(pitch.ownerEmail),
        pitches: [],
      });
    }
    grouped.get(key).pitches.push(pitch);
  });
  const writerNameCounts = new Map();
  grouped.forEach((group) => {
    const nameKey = group.writer.toLowerCase();
    writerNameCounts.set(nameKey, (writerNameCounts.get(nameKey) || 0) + 1);
  });
  return Array.from(grouped.values())
    .map((group) => ({
      ...group,
      hasDuplicateName: writerNameCounts.get(group.writer.toLowerCase()) > 1,
      pitches: group.pitches.slice().sort((a, b) => dateSortValue(b.submittedAt) - dateSortValue(a.submittedAt)),
    }))
    .sort((a, b) => {
      const countDiff = b.pitches.length - a.pitches.length;
      return countDiff || a.writer.localeCompare(b.writer);
    });
}

function nextPitchId(pitches, currentId) {
  if (!pitches.length) return null;
  const currentIndex = pitches.findIndex((pitch) => pitch.id === currentId);
  if (currentIndex === -1) return pitches[0].id;
  return pitches[(currentIndex + 1) % pitches.length]?.id || null;
}

function initialPitchDetailId() {
  const match = window.location.pathname.match(/^\/pitches\/([^/]+)/i);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function pitchDetailPath(id) {
  return `/pitches/${encodeURIComponent(id)}`;
}

function runArticleMappingTests() {
  const withStringAuthor = normalizeArticleRecord({
    title: "A",
    articleUrl: "https://poolesvillepulse.org/a",
    author: "Sofia Chen, Marcus Lee",
    date: "May 7, 2026",
    tags: "News, Sports",
    interviewees: [{ firstName: "Mia", lastName: "Thompson" }],
  });
  console.assert(withStringAuthor.authors.length === 2, "String authors should normalize into an array.");
  console.assert(withStringAuthor.url.includes("poolesvillepulse.org"), "articleUrl should normalize to url.");
  console.assert(withStringAuthor.publishedAt === "May 7, 2026", "date fallback should populate published date.");
  console.assert(matchesArticleFilters(withStringAuthor, "thompson", "All sections"), "Search should include interviewee names.");
  console.assert(matchesArticleFilters(withStringAuthor, "sofia", "News"), "Search should include authors and tags.");
  console.assert(uniqueTextValues(["News", "news", "Features"]).join("|") === "News|Features", "Section and tag pills should be case-insensitively deduped.");

  const sparse = normalizeArticleRecord({});
  console.assert(Array.isArray(sparse.authors), "Missing authors should produce an empty array.");
  console.assert(Array.isArray(sparse.interviewees), "Missing interviewees should produce an empty array.");
  console.assert(!isValidHttpUrl("not a url"), "Invalid URLs should be detected.");

  const sourceRows = buildInterviewRecordRows(
    [
      { id: "i1", firstName: "Mia", lastName: "Thompson", grade: "11", house: "Global", url: "https://poolesvillepulse.org/a" },
      { id: "i2", firstName: "Mia", lastName: "Thompson", grade: "11", house: "Global", url: "https://poolesvillepulse.org/b" },
    ],
    [
      { title: "A", url: "https://poolesvillepulse.org/a", datePublished: "May 7, 2026" },
      { title: "B", url: "https://poolesvillepulse.org/b", datePublished: "May 8, 2026" },
    ]
  );
  console.assert(sourceRows.length === 2, "Duplicate names should remain separate interview records.");
  console.assert(sourceRows[0].article.title === "B", "Interview records should sort newest article first by default.");
  console.assert(interviewRecordMatchesFilters(sourceRows[0], "thompson", "All grades", "All houses"), "Interview record search should include name.");
  console.assert(normalizeSourceGrade("faculty / staff") === "Staff", "Faculty/staff labels should display as Staff.");
  console.assert(sourceEditGradeOptions("Unknown").join("|") === "9|10|11|12|Staff|Unknown", "Grade edit options should keep Unknown last.");
}
runArticleMappingTests();

function adminSearchQuery(value) {
  return asText(value).toLowerCase();
}

function adminUserMatches(user, query, roleFilter) {
  const roleMatches = roleFilter === "All roles" || user.role === roleFilter;
  const nameMatches = !query || user.name.toLowerCase().includes(query);
  return roleMatches && nameMatches;
}

function groupAdminUsersByRole(staff, roleFilter = "All roles") {
  return ADMIN_ROLES
    .filter((role) => roleFilter === "All roles" || role.id === roleFilter)
    .map((role) => ({
      ...role,
      users: staff.filter((user) => user.role === role.id),
    }));
}


function runAdminPageTests() {
  const groupedRoles = groupAdminUsersByRole(users);
  console.assert(groupedRoles.length === 4, "Admin page should return to four role groups when search is clear.");
  console.assert(groupedRoles.every((group) => group.users.every((user) => user.role === group.id)), "Admin role groups should only contain matching users.");
  console.assert(users.filter((user) => adminUserMatches(user, adminSearchQuery("maya"), "All roles")).map((user) => user.name).join("") === "Maya Johnson", "Admin search should match staff by name.");
  console.assert(users.filter((user) => adminUserMatches(user, adminSearchQuery("school"), "All roles")).length === 0, "Admin search should not match email text.");
  console.assert(users.filter((user) => adminUserMatches(user, "", "guest")).every((user) => user.role === "guest"), "Admin role filter should limit visible staff.");
  console.assert(navItemsForRole("guest").every((item) => !["pitches", "stories", "admin"].includes(item.id)), "Guests should not see story, pitch, or admin navigation.");
  console.assert(navItemsForRole("writer").some((item) => item.id === "stories") && !navItemsForRole("writer").some((item) => item.id === "admin"), "Writers should see stories but not admin.");
  console.assert(APP_ROLE_OPTIONS.includes("owner") && !ADMIN_ROLE_OPTIONS.includes("owner"), "Owner should be an app role, not a workspace role option.");
  console.assert(navItemsForRole("owner").length === navItems.length, "Owners should see the complete workspace navigation after opening a workspace.");
  console.assert(defaultPageForRole("owner") === "dashboard", "Opened owner workspaces should start on the dashboard.");
}
runAdminPageTests();

function runPrototypeTests() {
  console.assert(navItems.length === 8, "Navigation should include the visible primary tabs.");
  console.assert(navItems.some((item) => item.id === "stories" && item.label === "Stories"), "Navigation should include Stories.");
  console.assert(!navItems.some((item) => item.id === "admin"), "Administration should live inside Settings.");
  console.assert(initialStories.every((story) => STORY_STATUSES.includes(story.status)), "Every story should use a supported workflow status.");
  console.assert(initialStories.some((story) => story.status === "Submitted"), "Stories page needs submitted examples.");
  console.assert(initialStories.some((story) => story.status === "Needs Revision"), "Stories page needs revision examples.");
  const approvedPitchStory = normalizeDisplayStory({ id: "approved-pitch-story", title: "Approved pitch story", status: "Assigned", dueDate: "2026-07-14" });
  console.assert(approvedPitchStory.deadline === "July 14, 2026", "Approved pitch due dates should display on stories without timezone drift.");
  console.assert(storyDueDateLabel({ due_date: "2026-07-15" }) === "July 15, 2026", "Stories should recognize legacy due date field names.");
  console.assert(storyMatchesFilters(initialStories[0], "parking", "All statuses", "All sections"), "Stories search should include title text.");
  console.assert(initialStories.every((story) => !storyDocIsOpenable(story)), "Default story records should start without attached Google Docs.");
  console.assert(!storyDocIsOpenable(initialStories.find((story) => story.id === "s5")), "Missing Google Doc links should be treated as unavailable.");
  const writerUser = { id: "writer-1", email: "ava@example.com", name: "Ava Patel", role: "writer" };
  const ownedDraft = { ...initialStories[0], writer: "Ava Patel", writerEmail: "ava@example.com", writerUserId: "writer-1", status: "Drafting" };
  const otherDraft = { ...ownedDraft, writer: "Marcus Lee", writerEmail: "marcus@example.com", writerUserId: "writer-2" };
  const sameNameDifferentEmail = { ...ownedDraft, writer: "Ava Patel", writerEmail: "ava2@example.com", writerUserId: "writer-2" };
  const commentOnlyCollaboration = normalizeDisplayStory({
    ...otherDraft,
    collaborators: [{ userId: "writer-1", email: "ava@example.com", role: "comment", status: "accepted" }],
  });
  console.assert(storyVisibleToUser(ownedDraft, writerUser), "Writers should see their own stories.");
  console.assert(!storyVisibleToUser(otherDraft, writerUser), "Writers should not see other writers' stories.");
  console.assert(!storyVisibleToUser(sameNameDifferentEmail, writerUser), "Writers should not inherit ownership from matching display names.");
  console.assert(canSubmitOwnStory(writerUser, ownedDraft), "Writers should be able to submit their own active drafts.");
  console.assert(canSubmitOwnStory({ ...writerUser, role: "editor" }, ownedDraft), "Editors should be able to submit stories they author.");
  console.assert(canSubmitOwnStory({ ...writerUser, role: "admin" }, ownedDraft), "Admins should be able to submit stories they author.");
  console.assert(canEditStoryAttachment({ ...writerUser, role: "editor" }, otherDraft), "Editors should be able to add work to any visible story.");
  console.assert(!canEditStoryAttachment({ ...writerUser, role: "editor" }, { ...otherDraft, status: "Ready for Publish" }), "Approved stories should lock work attachments until they are returned.");
  console.assert(!canManageStoryCollaborators(writerUser, { ...ownedDraft, status: "Published" }), "Published stories should lock collaborator management.");
  console.assert(storyVisibleToUser(commentOnlyCollaboration, writerUser), "Accepted collaborators should retain story visibility.");
  console.assert(!canSubmitOwnStory(writerUser, commentOnlyCollaboration) && !canEditStoryAttachment(writerUser, commentOnlyCollaboration) && !canManageStoryCollaborators(writerUser, commentOnlyCollaboration), "Comment-only collaborators should not receive author controls.");
  console.assert(storyWorkflowAction(ownedDraft)?.nextStatus === "Submitted", "Story workflow action should submit writer drafts.");
  console.assert(canUnsubmitOwnStory(writerUser, { ...ownedDraft, status: "Submitted" }), "Writers should be able to unsubmit their own submitted stories.");
  console.assert(storyWorkflowAction({ ...ownedDraft, status: "Submitted" })?.nextStatus === "Drafting", "Submitted stories should show an unsubmit action.");
  console.assert(storyAttachmentInfo({ attachment: { type: "file", url: "/api/stories/s1/attachment", name: "draft.pdf", size: 2048 } })?.detail === "PDF", "File attachments should show document type.");
  console.assert(storyAttachmentItems({
    attachments: [
      { id: "drive-1", type: "drive", url: "https://docs.google.com/document/d/1", name: "Draft doc", typeLabel: "Doc" },
      { id: "file-1", type: "file", url: "/api/stories/s1/attachments/file-1", name: "photo.png", contentType: "image/png" },
    ],
  }).length === 2, "Stories should keep multiple attached work items.");
  console.assert(mergeStoryAttachmentState(
    { attachments: [{ id: "drive-1", type: "drive", url: "https://docs.google.com/document/d/1", name: "Draft doc", typeLabel: "Doc" }] },
    { attachments: [{ id: "file-1", type: "file", url: "/api/stories/s1/attachments/file-1", name: "photo.png", contentType: "image/png" }] }
  ).attachments.length === 2, "Story attachment updates should merge new work with existing work.");
  console.assert(drivePermissionText("shared") === "Shared with newsroom editors" && drivePermissionText("manual") === "", "Drive attachments should explain only actionable editor-sharing states.");

  console.assert(initialArticles.some((a) => a.status === "Published"), "Prototype needs published article data.");
  console.assert(initialTasks.every((t) => t.id && t.title && t.status), "Every task needs id, title, and status.");
  console.assert(PITCH_STATUSES.every((status) => initialPitches.some((pitch) => pitch.status === status)), "Pitch board needs examples for each status.");
  console.assert(matchesPitchFilters(initialPitches[0], "clubs", "All sections"), "Pitch search should include title and angle text.");
  console.assert(matchesPitchFilters(initialPitches[2], "", "All sections"), "Selected pitches should stay on their round board.");
  console.assert(matchesPitchFilters(initialPitches[6], "", "All sections", PITCH_STATUS_ON_HOLD), "On hold pitches should stay on their round board.");
  console.assert(groupActivePitchesByWriter(initialPitches).every((group) => group.pitches.every(isRoundPitch)), "Writer groups should include pitches from the selected round.");
  console.assert(groupActivePitchesByWriter([
    { ...initialPitches[0], owner: "Alex Lee", ownerEmail: "alex.one@example.com", ownerUserId: "u1" },
    { ...initialPitches[1], owner: "Alex Lee", ownerEmail: "alex.two@example.com", ownerUserId: "u2" },
  ]).length === 2, "Pitch board should separate owners with matching names and different accounts.");
  console.assert(pitchNoteCount({ notes: "", comments: [] }) === 0, "Pitch note count should allow zero.");
}
runPrototypeTests();

function StatusBadge({ children, tone = "neutral" }) {
  const styles = {
    neutral: "border-white/[0.08] bg-white/[0.045] text-zinc-300",
    green: "border-emerald-400/15 bg-emerald-400/10 text-emerald-300",
    amber: "border-amber-400/15 bg-amber-400/10 text-amber-300",
    rose: "border-rose-400/15 bg-rose-400/10 text-rose-300",
    violet: "border-violet-400/15 bg-violet-400/10 text-violet-300",
    blue: "border-sky-400/15 bg-sky-400/10 text-sky-300",
  };
  return <span className={cx("inline-flex rounded-full border px-2.5 py-1 text-xs", styles[tone])}>{children}</span>;
}

function Button({ children, icon, variant = "primary", className = "", onClick, disabled = false, type = "button", ...buttonProps }) {
  return (
    <button
      {...buttonProps}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090c] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 motion-reduce:transform-none motion-reduce:transition-none",
        variant === "primary" && "bg-zinc-100 text-black hover:bg-white",
        variant === "ghost" && "border border-white/[0.08] bg-white/[0.035] text-zinc-300 hover:bg-white/[0.07] hover:text-zinc-50",
        variant === "danger" && "border border-rose-400/15 bg-rose-400/10 text-rose-300 hover:bg-rose-400/15",
        className
      )}
    >
      {icon && <Icon name={icon} className="h-4 w-4" />}
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return <div className={cx("rounded-2xl border border-white/[0.08] bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur", className)}>{children}</div>;
}

function PageShell({ title, description, children, right, titleAction, className = "" }) {
  return (
    <div
      className={cx("mx-auto px-5 py-6 md:px-8", className || "max-w-[1640px]")}
    >
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="relative">
          {titleAction ? <div className="mb-2 md:absolute md:-left-12 md:top-1 md:mb-0">{titleAction}</div> : null}
          <h1 className="break-words text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">{title}</h1>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">{description}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, label = "", className = "" }) {
  return (
    <div className={cx("flex h-11 items-center gap-2 rounded-xl border border-white/[0.08] bg-black/25 px-3 text-sm text-zinc-500 transition focus-within:border-white/[0.18] focus-within:ring-2 focus-within:ring-white/[0.06]", className)}>
      <Icon name="search" className="h-4 w-4" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label || placeholder} className="w-full bg-transparent text-zinc-200 outline-none placeholder:text-zinc-600" />
    </div>
  );
}

function Select({ value, onChange, options, label = "", className = "" }) {
  return (
    <div className={cx("relative", className)}>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label || "Select an option"} className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 pr-9 text-sm text-zinc-200 outline-none transition hover:bg-white/[0.06] focus-visible:border-white/[0.18] focus-visible:ring-2 focus-visible:ring-white/[0.06]">
        {options.map((option) => (
          <option key={option} className="bg-zinc-950" value={option}>
            {option}
          </option>
        ))}
      </select>
      <Icon name="chevron" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
    </div>
  );
}

function AnimatedOptionDropdown({ value, options, onChange, className = "" }) {
  return (
    <AnimatedDropdown
      text={value}
      items={options.map((name) => ({ name, link: "#" }))}
      onSelect={(item) => onChange(item.name)}
      className={className}
    />
  );
}

function SectionCombobox({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const inputId = useId();
  const listId = useId();
  const sectionOptions = useMemo(
    () => uniqueTextValues([...options.map(normalizeSectionLabel), value]),
    [options, value]
  );
  const normalizedQuery = normalizeSectionLabel(query);
  const filteredOptions = useMemo(() => {
    const search = normalizedQuery.toLowerCase();
    return sectionOptions.filter((option) => !search || option.toLowerCase().includes(search));
  }, [normalizedQuery, sectionOptions]);
  const exactOption = sectionOptions.find((option) => option.toLowerCase() === normalizedQuery.toLowerCase());
  const canCreate = Boolean(normalizedQuery) && !exactOption && normalizedQuery.toLowerCase() !== "all sections";

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open]);

  const selectSection = (section) => {
    const nextSection = normalizeSectionLabel(section);
    if (!nextSection) return;
    onChange(nextSection);
    setOpen(false);
    setQuery("");
  };

  const openMenu = () => {
    if (!open) setQuery("");
    setOpen(true);
  };

  return (
    <div className="block max-w-xs">
      <label htmlFor={inputId} className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Section</label>
      <div ref={containerRef} className={cx("relative", open && "z-20")}>
        <div className="relative">
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            value={open ? query : value}
            onFocus={openMenu}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                setOpen(false);
                setQuery("");
              }
              if (event.key === "Enter" && normalizedQuery) {
                const nextSection = exactOption || (canCreate ? normalizedQuery : "");
                if (!nextSection) return;
                event.preventDefault();
                selectSection(nextSection);
              }
            }}
            maxLength={80}
            placeholder={open ? "Search or create a section…" : "Choose a section"}
            className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 pr-10 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-white/[0.18] focus:ring-2 focus:ring-white/10"
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={open ? "Close section menu" : "Open section menu"}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              if (open) {
                setOpen(false);
                setQuery("");
              } else {
                inputRef.current?.focus();
                openMenu();
              }
            }}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-zinc-500 transition hover:text-zinc-200"
          >
            <Icon name="chevron" className={cx("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>
        </div>

        {open ? (
          <div id={listId} role="listbox" className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-64 overflow-y-auto rounded-xl border border-white/[0.08] bg-zinc-950 p-1 shadow-2xl shadow-black/40">
            {filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={option.toLowerCase() === String(value || "").toLowerCase()}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSection(option)}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-zinc-50"
              >
                {option}
              </button>
            ))}
            {canCreate ? (
              <button
                type="button"
                role="option"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSection(normalizedQuery)}
                className="mt-1 flex w-full items-center gap-2 border-t border-white/[0.08] px-3 py-2.5 text-left text-sm text-zinc-200 transition hover:bg-white/[0.06]"
              >
                <Icon name="plus" className="h-4 w-4 text-emerald-300" />
                <span>Create “{normalizedQuery}”</span>
              </button>
            ) : null}
            {!filteredOptions.length && !canCreate ? (
              <p className="px-3 py-2 text-sm text-zinc-600">Type a section name to create it.</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}


function initialAppPage() {
  const pathPage = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, "");
  if (pathPage === "admin" || pathPage.startsWith("settings/")) return "settings";
  if (pathPage.startsWith("pitches/")) return "pitches";
  if (pathPage.startsWith("stories/")) return "stories";
  return navItems.some((item) => item.id === pathPage) ? pathPage : "dashboard";
}

function pagePath(page) {
  return `/${page}`;
}

function storyDetailPath(id) {
  return `/stories/${encodeURIComponent(id)}`;
}

function initialStoryDetailId() {
  const match = window.location.pathname.match(/^\/stories\/([^/]+)/i);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function pushAppPath(path) {
  if (window.location.pathname !== path) {
    window.history.pushState(null, "", path);
  }
  window.dispatchEvent(new Event("falcon-route-change"));
}

function isLandingRoute() {
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, "") || "/";
  return path === "/" || path === "/landing";
}

function AppShell() {
  const [page, setPage] = useState(initialAppPage);
  const [locationPath, setLocationPath] = useState(window.location.pathname);
  const [articles, setArticles] = useState(initialArticles);
  const [stories, setStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [storiesError, setStoriesError] = useState("");
  const [tasks, setTasks] = useState(initialTasks);
  const [articleExtractorOpen, setArticleExtractorOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState("a1");
  const [toast, setToast] = useState("");
  const [account, setAccount] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [sessionAttempt, setSessionAttempt] = useState(0);

  const selectedArticle = articles.find((a) => a.id === selectedArticleId) || articles[0];
  const accountRole = normalizeAppRole(account?.role);
  const hasWorkspace = accountRole === "owner" ? Boolean(asText(workspace?.id)) : Boolean(asText(account?.workspaceId));
  const workspaceName = asText(workspace?.name) || "Workspace";
  const availableNavItems = navItemsForRole(accountRole);
  const availableNavSections = navSectionsForItems(availableNavItems);

  useEffect(() => {
    const syncLocationPath = () => {
      setLocationPath(window.location.pathname);
      setPage(initialAppPage());
    };
    window.addEventListener("popstate", syncLocationPath);
    window.addEventListener("falcon-route-change", syncLocationPath);
    return () => {
      window.removeEventListener("popstate", syncLocationPath);
      window.removeEventListener("falcon-route-change", syncLocationPath);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [page, locationPath]);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      setSessionLoading(true);
      setSessionError("");
      try {
        const response = await fetch(`${API_BASE}/api/auth/session`, {
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        const payload = await response.json().catch(() => ({}));
        if (!active) return;
        if (!response.ok || payload?.ok === false) {
          throw new Error(payload?.error || "Unable to verify your session.");
        }
        if (!payload?.authenticated) {
          window.location.replace(loginRedirectForCurrentPath());
          return;
        }
        setAccount(normalizeDisplayUser(payload.user || FALLBACK_ACCOUNT));
        setWorkspace(payload.workspace || null);
        setCsrfToken(payload.csrfToken || "");
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : "Unable to verify your session.";
        setSessionError(message);
        setToast(message);
      } finally {
        if (active) setSessionLoading(false);
      }
    }

    loadSession();
    return () => {
      active = false;
    };
  }, [sessionAttempt]);

  useEffect(() => {
    if (!account) return;
    if (accountRole !== "owner" && isOwnerRoute(locationPath)) {
      const nextPage = defaultPageForRole(accountRole);
      setPage(nextPage);
      pushAppPath(pagePath(nextPage));
      return;
    }
    if (accountRole === "owner" && !hasWorkspace && !isOwnerRoute(locationPath)) {
      pushAppPath("/owner");
      return;
    }
    if (!hasWorkspace || (accountRole === "owner" && isOwnerRoute(locationPath))) return;
    if (!roleCanAccessPage(accountRole, page)) {
      const nextPage = defaultPageForRole(accountRole);
      setToast(`${accountRoleLabel(accountRole)} access does not include ${navItems.find((item) => item.id === page)?.label || page}.`);
      setPage(nextPage);
      pushAppPath(pagePath(nextPage));
    }
  }, [account, accountRole, hasWorkspace, locationPath, page]);

  useEffect(() => {
    if (!account || !hasWorkspace || (accountRole === "owner" && isOwnerRoute(locationPath))) return undefined;
    const controller = new AbortController();

    async function loadStories() {
      setStoriesLoading(true);
      setStoriesError("");
      try {
        const response = await fetch(`${API_BASE}/api/stories`, {
          headers: { Accept: "application/json" },
          credentials: "include",
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.ok === false) {
          throw new Error(payload?.error || "Stories are unavailable.");
        }
        setStories(Array.isArray(payload.stories) ? payload.stories.map(normalizeDisplayStory) : []);
      } catch (error) {
        if (error.name === "AbortError") return;
        setStories([]);
        setStoriesError(error instanceof Error ? error.message : "Stories are unavailable.");
      } finally {
        if (!controller.signal.aborted) setStoriesLoading(false);
      }
    }

    if (accountRole === "guest") {
      setStories([]);
      setStoriesError("Stories are not available to guests.");
      setStoriesLoading(false);
      return undefined;
    }

    loadStories();
    return () => controller.abort();
  }, [account, accountRole, hasWorkspace, locationPath]);

  const navigatePage = (nextPage) => {
    if (account && !roleCanAccessPage(accountRole, nextPage)) {
      setToast(`${accountRoleLabel(accountRole)} access does not include ${navItems.find((item) => item.id === nextPage)?.label || nextPage}.`);
      return;
    }
    setPage(nextPage);
    pushAppPath(pagePath(nextPage));
  };


  const updateArticleStatus = (id, status) => {
    setArticles((prev) => prev.map((article) => (article.id === id ? { ...article, status } : article)));
    setToast(`Moved story to ${status}.`);
  };

  const updateStoryStatus = async (id, status, options = {}) => {
    const currentStory = stories.find((story) => story.id === id);
    if (status === "Submitted" && canSubmitOwnStory(account, currentStory) && !storyAttachmentItems(currentStory).length) {
      setToast("Attach work before submitting this story.");
      return false;
    }
    const canStartReview = canManageEditorialWorkflow(accountRole) && currentStory?.status === "Submitted" && status === "In Review";
    const canReturnStory = canManageEditorialWorkflow(accountRole) && currentStory?.status === "In Review" && status === "Returned";
    const canSendToTeacherApproval = canManageEditorialWorkflow(accountRole) && currentStory?.status === "In Review" && status === "Ready for Publish";
    const publicationUrl = asText(options.publicationUrl);
    const canPublish =
      ["owner", "admin"].includes(accountRole) &&
      currentStory?.status === "Ready for Publish" &&
      status === "Published" &&
      isValidHttpUrl(publicationUrl);
    const canUseWriterWorkflow =
      (status === "Submitted" && canSubmitOwnStory(account, currentStory)) ||
      (status === "Drafting" && canUnsubmitOwnStory(account, currentStory));
    if (!canStartReview && !canReturnStory && !canSendToTeacherApproval && !canPublish && !canUseWriterWorkflow) {
      setToast(
        status === "Published"
          ? "Only admins can publish a story from Ready for Publish using a valid http or https URL."
          : canManageEditorialWorkflow(accountRole)
            ? "Follow the review sequence before moving this story."
            : "Writers can submit or unsubmit their own stories."
      );
      return false;
    }
    try {
      const response = await fetch(`${API_BASE}/api/stories/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ status, ...(canPublish ? { publicationUrl } : {}) }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        if (payload?.story) {
          const failedStory = normalizeDisplayStory(payload.story);
          setStories((prev) => prev.map((story) => (story.id === id ? { ...story, ...failedStory } : story)));
        }
        throw new Error(payload?.error || "Story status update failed.");
      }
      const updatedStory = normalizeDisplayStory(payload.story || { id, status, lastEdited: "Updated just now" });
      setStories((prev) => prev.map((story) => (story.id === id ? { ...story, ...updatedStory } : story)));
      setToast(status === "Published" ? "Published story and added it to the article archive." : `Updated story to ${status}.`);
      return true;
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Story status update failed.");
      return false;
    }
  };

  const updateStoryDocLink = async (id, googleDocUrl) => {
    const currentStory = stories.find((story) => story.id === id);
    if (!canEditStoryAttachment(account, currentStory)) {
      setToast("You can only update content for stories you can access.");
      return false;
    }
    try {
      const response = await fetch(`${API_BASE}/api/stories/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ documentUrl: googleDocUrl }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Could not attach link.");
      }
      const updatedStory = normalizeDisplayStory(payload.story || { id, googleDocUrl, lastEdited: "Updated just now" });
      setStories((prev) => prev.map((story) => (
        story.id === id ? { ...story, ...mergeStoryAttachmentState(story, updatedStory) } : story
      )));
      setToast("Attached link.");
      return true;
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not attach link.");
      return false;
    }
  };

  const clearStoryAttachment = async (id, attachmentId = "") => {
    const currentStory = stories.find((story) => story.id === id);
    if (!canEditStoryAttachment(account, currentStory)) {
      setToast("You can only update content for stories you can access.");
      return false;
    }
    try {
      const response = await fetch(
        attachmentId
          ? `${API_BASE}/api/stories/${encodeURIComponent(id)}/attachments/${encodeURIComponent(attachmentId)}`
          : `${API_BASE}/api/stories/${encodeURIComponent(id)}`,
        {
          method: attachmentId ? "DELETE" : "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
          },
          credentials: "include",
          body: attachmentId ? undefined : JSON.stringify({ documentUrl: "" }),
        }
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Could not remove attachment.");
      }
      const updatedStory = normalizeDisplayStory(payload.story || { id, googleDocUrl: "", attachment: null, lastEdited: "Updated just now" });
      setStories((prev) => prev.map((story) => (
        story.id === id ? { ...story, ...updatedStory } : story
      )));
      setToast("Removed attachment.");
      return true;
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not remove attachment.");
      return false;
    }
  };

  const uploadStoryAttachment = async (id, file) => {
    const currentStory = stories.find((story) => story.id === id);
    if (!canEditStoryAttachment(account, currentStory)) {
      setToast("You can only upload files for stories you can access.");
      return false;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${API_BASE}/api/stories/${encodeURIComponent(id)}/attachment`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Could not upload file.");
      }
      const updatedStory = normalizeDisplayStory(payload.story || { id, lastEdited: "Updated just now" });
      setStories((prev) => prev.map((story) => (
        story.id === id ? { ...story, ...mergeStoryAttachmentState(story, updatedStory) } : story
      )));
      setToast("Uploaded file.");
      return true;
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not upload file.");
      return false;
    }
  };

  const attachDriveFileToStory = async (id, file) => {
    const currentStory = stories.find((story) => story.id === id);
    if (!canEditStoryAttachment(account, currentStory)) {
      setToast("You can only attach Drive files for stories you can access.");
      return false;
    }
    try {
      const response = await fetch(`${API_BASE}/api/stories/${encodeURIComponent(id)}/drive-attachment`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify(file),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Could not attach Google Drive file.");
      }
      const updatedStory = normalizeDisplayStory(payload.story || { id, lastEdited: "Updated just now" });
      setStories((prev) => prev.map((story) => (
        story.id === id ? { ...story, ...mergeStoryAttachmentState(story, updatedStory) } : story
      )));
      setToast(payload.warning || "Attached Google Drive file.");
      return true;
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not attach Google Drive file.");
      return false;
    }
  };

  const inviteStoryCollaborators = async (id, invite) => {
    try {
      const response = await fetch(`${API_BASE}/api/stories/${encodeURIComponent(id)}/collaborators`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify(invite),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Could not invite collaborators.");
      }
      const updatedStory = normalizeDisplayStory(payload.story || { id, collaborators: payload.collaborators || [] });
      setStories((prev) => prev.map((story) => (story.id === id ? { ...story, ...updatedStory } : story)));
      setToast("Invite sent.");
      return updatedStory;
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not invite collaborators.");
      return null;
    }
  };

  const removeStoryCollaborator = async (id, email) => {
    try {
      const response = await fetch(`${API_BASE}/api/stories/${encodeURIComponent(id)}/collaborators/${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Could not remove collaborator.");
      }
      const updatedStory = normalizeDisplayStory(payload.story || { id, collaborators: payload.collaborators || [] });
      setStories((prev) => prev.map((story) => (story.id === id ? { ...story, ...updatedStory } : story)));
      setToast("Removed collaborator.");
      return updatedStory;
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not remove collaborator.");
      return null;
    }
  };
  const updateTaskStatus = (id, status) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, status } : task)));
    setToast(`Updated task to ${status}.`);
  };

  const joinWorkspace = async (code) => {
    try {
      const response = await fetch(`${API_BASE}/api/workspaces/join`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ code }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Could not join this workspace.");
      }
      setAccount(normalizeDisplayUser(payload.user));
      setWorkspace(payload.workspace || null);
      setToast(`Joined ${payload.workspace?.name || "workspace"}.`);
      return true;
    } catch (error) {
      throw error instanceof Error ? error : new Error("Could not join this workspace.");
    }
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
      });
      let payload = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Sign out failed.");
      }
      setAccount(null);
      setCsrfToken("");
      window.location.replace("/login");
    } catch (error) {
      setSigningOut(false);
      setToast(error instanceof Error ? error.message : "Sign out failed.");
    }
  };

  const handleStoryCreatedFromPitch = (story) => {
    const nextStory = normalizeDisplayStory(story);
    if (!nextStory?.id) return;
    setStories((prev) => {
      if (prev.some((item) => item.id === nextStory.id)) {
        return prev.map((item) => (item.id === nextStory.id ? { ...item, ...nextStory } : item));
      }
      return [nextStory, ...prev];
    });
  };

  const createStory = async (draft) => {
    const title = asText(draft.title);
    const section = normalizeSectionLabel(draft.section);
    const summary = asText(draft.summary);
    const deadline = asText(draft.deadline);
    if (!title || !section || section.toLowerCase() === "all sections") {
      setToast("Add a title and section before creating the story.");
      return false;
    }
    try {
      const response = await fetch(`${API_BASE}/api/stories`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ title, section, summary, deadline }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Could not create story.");
      }
      const nextStory = normalizeDisplayStory(payload.story);
      if (!nextStory?.id) throw new Error("The new story did not return an id.");
      setStories((prev) => [nextStory, ...prev.filter((story) => story.id !== nextStory.id)]);
      setStoriesError("");
      setToast("Added a new story.");
      return true;
    } catch (createError) {
      setToast(createError instanceof Error ? createError.message : "Could not create story.");
      return false;
    }
  };

  const breadcrumbDetail = useMemo(() => {
    const normalizedPath = locationPath.toLowerCase();
    if (page === "stories" && normalizedPath.startsWith("/stories/")) {
      const id = initialStoryDetailId();
      return stories.find((story) => story.id === id)?.title || "Story review";
    }
    if (page === "pitches" && normalizedPath.startsWith("/pitches/")) {
      return "Pitch review";
    }
    if (page === "settings") {
      if (normalizedPath === "/admin" || normalizedPath.includes("/administration")) return "Administration";
      if (normalizedPath.includes("/names")) return "Names database";
    }
    return "";
  }, [locationPath, page, stories]);

  const pages = {
    dashboard: <DashboardPage currentUser={account} csrfToken={csrfToken} setPage={setPage} setToast={setToast} onStoryAccepted={handleStoryCreatedFromPitch} />,
    pitches: <PitchBoardPage setToast={setToast} csrfToken={csrfToken} currentUser={account || FALLBACK_ACCOUNT} hasWorkspace={hasWorkspace} onStoryCreated={handleStoryCreatedFromPitch} />,
    stories: <StoriesPage stories={stories} loading={storiesLoading} error={storiesError} currentUser={account || FALLBACK_ACCOUNT} csrfToken={csrfToken} updateStoryStatus={updateStoryStatus} updateStoryDocLink={updateStoryDocLink} clearStoryAttachment={clearStoryAttachment} uploadStoryAttachment={uploadStoryAttachment} attachDriveFileToStory={attachDriveFileToStory} inviteStoryCollaborators={inviteStoryCollaborators} removeStoryCollaborator={removeStoryCollaborator} setToast={setToast} createStory={createStory} />,
    pipeline: <PipelinePage articles={articles} updateArticleStatus={updateArticleStatus} setSelectedArticleId={setSelectedArticleId} setPage={setPage} />,
    articles: <ArticlesPage extractorOpen={articleExtractorOpen} setExtractorOpen={setArticleExtractorOpen} setToast={setToast} csrfToken={csrfToken} />,
    interviewees: <IntervieweesPage currentUser={account || FALLBACK_ACCOUNT} csrfToken={csrfToken} setToast={setToast} />,
    tasks: <TasksPage tasks={tasks} updateTaskStatus={updateTaskStatus} />,
    calendar: <CalendarPage stories={stories} currentUser={account || FALLBACK_ACCOUNT} csrfToken={csrfToken} setToast={setToast} onOpenStory={(story) => { setPage("stories"); pushAppPath(storyDetailPath(story.id)); }} />,
    analytics: <AnalyticsPage />,
    settings: <SettingsPage workspace={workspace} currentUser={account || FALLBACK_ACCOUNT} csrfToken={csrfToken} setToast={setToast} onWorkspaceUpdated={setWorkspace} locationPath={locationPath} />,
  };

  if (!account && sessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#08090c] px-6 text-zinc-100" aria-label="Loading Inscribe">
        <div className="w-full max-w-sm" role="status">
          <div className="h-2 w-24 animate-pulse rounded bg-white/[0.12]" />
          <div className="mt-5 h-7 w-64 animate-pulse rounded bg-white/[0.08]" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-white/[0.05]" />
        </div>
      </div>
    );
  }

  if (!account && sessionError) {
    return (
      <main className="flex h-screen items-center justify-center bg-[#08090c] px-6 text-zinc-100">
        <section className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-white/[0.025] p-6" aria-labelledby="session-error-title">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-300/20 bg-rose-300/[0.06] text-rose-200">
            <Icon name="x" className="h-4 w-4" />
          </div>
          <h1 id="session-error-title" className="mt-5 text-xl font-semibold text-zinc-50">Could not open your newsroom</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{sessionError}</p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">Check that the newsroom server is running, then try again. You can also return to login and start a new session.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={() => setSessionAttempt((attempt) => attempt + 1)}>Retry</Button>
            <Button variant="ghost" onClick={() => window.location.assign(loginRedirectForCurrentPath())}>Go to login</Button>
          </div>
        </section>
      </main>
    );
  }

  if (!account) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#08090c] px-6 text-sm text-zinc-400" role="status">
        Taking you to login...
      </div>
    );
  }

  if (accountRole === "owner" && (isOwnerRoute(locationPath) || !hasWorkspace)) {
    return (
      <OwnerWorkspacesPage
        user={account}
        csrfToken={csrfToken}
        signingOut={signingOut}
        onSignOut={handleSignOut}
      />
    );
  }

  if (!hasWorkspace) {
    return <WorkspaceJoinShell user={account} signingOut={signingOut} onJoin={joinWorkspace} onSignOut={handleSignOut} />;
  }

  return (
    <div className="h-screen overflow-hidden bg-[#08090c] text-zinc-100">
      <div className="relative flex h-screen overflow-hidden">
        <aside className="hidden h-screen w-72 shrink-0 flex-col overflow-hidden border-r border-white/[0.08] bg-[#08090c]/80 p-4 backdrop-blur-xl lg:flex">
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <button type="button" onClick={() => accountRole === "owner" ? pushAppPath("/owner") : navigatePage("dashboard")} className="group mb-7 flex w-full items-center gap-2 rounded-xl border-0 bg-transparent px-2 py-1 text-left outline-none focus:outline-none focus-visible:outline-none">
              <img src="/app-logo.png" alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 truncate text-sm font-medium text-zinc-100 group-focus-visible:underline group-focus-visible:underline-offset-4">{workspaceName}</div>
            </button>
            {accountRole === "owner" ? (
              <button type="button" onClick={() => pushAppPath("/owner")} className="mb-5 flex items-center gap-2 px-3 text-xs text-zinc-500 transition hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                <Icon name="dashboard" className="h-3.5 w-3.5" />
                All workspaces
              </button>
            ) : null}

            <nav className="space-y-5" aria-label="Primary navigation">
              {availableNavSections.map((section) => (
                <div key={section.id}>
                  <div className="mb-2 px-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-zinc-400">{section.label}</div>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <button key={item.id} onClick={() => navigatePage(item.id)} className={cx("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-white/15", page === item.id ? "border border-white/[0.08] bg-white/[0.07] text-zinc-50 shadow-lg shadow-black/20" : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200")}>
                        <Icon name={item.icon} className="h-4 w-4" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
          <AccountMenu user={account || FALLBACK_ACCOUNT} signingOut={signingOut} onSignOut={handleSignOut} />
        </aside>

        <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <header className="relative z-[100] shrink-0 border-b border-white/[0.08] bg-[#08090c]/75 px-5 py-4 backdrop-blur-2xl md:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 lg:hidden">
                <img src="/app-logo.png" alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
                <span className="max-w-[55vw] truncate font-medium">{workspaceName}</span>
              </div>
              <div className="flex items-center gap-3">
                <HeaderBreadcrumb page={page} detailLabel={breadcrumbDetail} navigatePage={navigatePage} />
                {accountRole === "owner" ? (
                  <button type="button" onClick={() => pushAppPath("/owner")} className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-xs text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 lg:hidden">
                    Workspaces
                  </button>
                ) : null}
              </div>
            </div>
          </header>

          <div className="shrink-0 border-b border-white/[0.08] bg-[#08090c]/90 px-4 py-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {availableNavItems.map((item) => (
                <button key={item.id} onClick={() => navigatePage(item.id)} className={cx("flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs", page === item.id ? "border-white/[0.12] bg-white/[0.08] text-zinc-50" : "border-white/[0.06] text-zinc-500")}>
                  <Icon name={item.icon} className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-3 max-w-sm">
              <AccountMenu user={account || FALLBACK_ACCOUNT} signingOut={signingOut} onSignOut={handleSignOut} />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
            {pages[page]}
          </div>
        </main>
      </div>
      <Toast message={toast} onDismiss={() => setToast("")} />
    </div>
  );
}

function OwnerWorkspacesPage({ user, csrfToken = "", signingOut = false, onSignOut = () => {} }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [surfaceError, setSurfaceError] = useState("");
  const [notice, setNotice] = useState("");
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState({ name: "", publicationUrl: "" });
  const [editingId, setEditingId] = useState("");
  const [editDraft, setEditDraft] = useState({ name: "", publicationUrl: "" });
  const [busyId, setBusyId] = useState("");
  const [rotateConfirmId, setRotateConfirmId] = useState("");

  const requestHeaders = (json = false) => ({
    Accept: "application/json",
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
  });

  const sortWorkspaces = (items) => [...items].sort((left, right) => asText(left.name).localeCompare(asText(right.name)));

  const loadWorkspaces = async (signal) => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(`${API_BASE}/api/owner/workspaces`, {
        headers: { Accept: "application/json" },
        credentials: "include",
        signal,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) throw new Error(payload?.error || "Could not load workspaces.");
      setWorkspaces(sortWorkspaces(Array.isArray(payload.workspaces) ? payload.workspaces : []));
    } catch (error) {
      if (error.name === "AbortError") return;
      setLoadError(error instanceof Error ? error.message : "Could not load workspaces.");
      setWorkspaces([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadWorkspaces(controller.signal);
    return () => controller.abort();
  }, []);

  const replaceWorkspace = (workspace) => {
    setWorkspaces((current) => sortWorkspaces(current.map((item) => item.id === workspace.id ? { ...item, ...workspace } : item)));
  };

  const createWorkspace = async () => {
    if (creating) return;
    if (!createDraft.name.trim()) {
      setSurfaceError("Workspace name is required.");
      return;
    }
    setCreating(true);
    setSurfaceError("");
    setNotice("");
    try {
      const response = await fetch(`${API_BASE}/api/owner/workspaces`, {
        method: "POST",
        headers: requestHeaders(true),
        credentials: "include",
        body: JSON.stringify(createDraft),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) throw new Error(payload?.error || "Could not create workspace.");
      setWorkspaces((current) => sortWorkspaces([...current, payload.workspace]));
      setCreateDraft({ name: "", publicationUrl: "" });
      setCreateOpen(false);
      setNotice(`${payload.workspace?.name || "Workspace"} created. Its join code is ready to share.`);
    } catch (error) {
      setSurfaceError(error instanceof Error ? error.message : "Could not create workspace.");
    } finally {
      setCreating(false);
    }
  };

  const openWorkspace = async (workspace) => {
    if (busyId) return;
    setBusyId(`open:${workspace.id}`);
    setSurfaceError("");
    try {
      const response = await fetch(`${API_BASE}/api/owner/workspaces/${encodeURIComponent(workspace.id)}/open`, {
        method: "POST",
        headers: requestHeaders(),
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) throw new Error(payload?.error || "Could not open workspace.");
      window.location.assign(safeInternalRedirect(payload.redirect));
    } catch (error) {
      setSurfaceError(error instanceof Error ? error.message : "Could not open workspace.");
      setBusyId("");
    }
  };

  const beginEditing = (workspace) => {
    setEditingId(workspace.id);
    setEditDraft({ name: asText(workspace.name), publicationUrl: asText(workspace.publicationUrl) });
    setRotateConfirmId("");
    setSurfaceError("");
    setNotice("");
  };

  const saveWorkspace = async (workspace) => {
    if (busyId) return;
    if (!editDraft.name.trim()) {
      setSurfaceError("Workspace name is required.");
      return;
    }
    setBusyId(`save:${workspace.id}`);
    setSurfaceError("");
    try {
      const response = await fetch(`${API_BASE}/api/owner/workspaces/${encodeURIComponent(workspace.id)}`, {
        method: "PATCH",
        headers: requestHeaders(true),
        credentials: "include",
        body: JSON.stringify(editDraft),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) throw new Error(payload?.error || "Could not save workspace.");
      replaceWorkspace(payload.workspace);
      setEditingId("");
      setNotice(`${payload.workspace?.name || "Workspace"} updated.`);
    } catch (error) {
      setSurfaceError(error instanceof Error ? error.message : "Could not save workspace.");
    } finally {
      setBusyId("");
    }
  };

  const rotateJoinCode = async (workspace) => {
    if (rotateConfirmId !== workspace.id) {
      setRotateConfirmId(workspace.id);
      return;
    }
    if (busyId) return;
    setBusyId(`rotate:${workspace.id}`);
    setSurfaceError("");
    try {
      const response = await fetch(`${API_BASE}/api/owner/workspaces/${encodeURIComponent(workspace.id)}/join-code/rotate`, {
        method: "POST",
        headers: requestHeaders(),
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) throw new Error(payload?.error || "Could not rotate join code.");
      replaceWorkspace(payload.workspace);
      setRotateConfirmId("");
      setNotice(`New join code created for ${payload.workspace?.name || "workspace"}.`);
    } catch (error) {
      setSurfaceError(error instanceof Error ? error.message : "Could not rotate join code.");
    } finally {
      setBusyId("");
    }
  };

  const copyJoinCode = async (workspace) => {
    if (!workspace.joinCode) return;
    try {
      await navigator.clipboard.writeText(workspace.joinCode);
      setNotice(`Copied the join code for ${workspace.name}.`);
      setSurfaceError("");
    } catch {
      setSurfaceError("Could not copy the join code. Select it and copy it manually.");
    }
  };

  return (
    <div className="min-h-screen bg-[#08090c] text-zinc-100">
      <header className="border-b border-white/[0.08]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/app-logo.png" alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-zinc-100">Inscribe</div>

            </div>
          </div>
          <AccountMenu variant="header" user={user} signingOut={signingOut} onSignOut={onSignOut} />
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-5 py-10 md:px-8 md:py-14">
        <div className="flex flex-col gap-5 border-b border-white/[0.1] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">Workspaces</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Open a newsroom, update its settings, or create a new workspace.</p>
          </div>
          <Button icon="plus" onClick={() => { setCreateOpen((open) => !open); setSurfaceError(""); setNotice(""); }}>
            {createOpen ? "Cancel" : "New workspace"}
          </Button>
        </div>

        {createOpen ? (
          <section className="border-b border-white/[0.1] py-7" aria-labelledby="create-workspace-title">
            <div className="max-w-2xl">
              <h2 id="create-workspace-title" className="text-lg font-semibold text-zinc-100">Create workspace</h2>
              <p className="mt-1 text-sm text-zinc-500">A unique join code is generated automatically.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <SettingsField id="owner-create-name" label="Workspace name" value={createDraft.name} onChange={(name) => setCreateDraft((draft) => ({ ...draft, name }))} autoComplete="organization" />
                <SettingsField id="owner-create-url" label="Publication website (optional)" value={createDraft.publicationUrl} onChange={(publicationUrl) => setCreateDraft((draft) => ({ ...draft, publicationUrl }))} type="url" autoComplete="url" />
              </div>
              <div className="mt-5">
                <Button onClick={createWorkspace} disabled={creating}>{creating ? "Creating" : "Create workspace"}</Button>
              </div>
            </div>
          </section>
        ) : null}

        {surfaceError ? <div className="mt-5 border border-rose-300/20 bg-rose-300/[0.05] px-4 py-3 text-sm text-rose-200" role="alert">{surfaceError}</div> : null}
        {notice ? <div className="mt-5 border border-white/[0.1] bg-white/[0.025] px-4 py-3 text-sm text-zinc-300" role="status">{notice}</div> : null}

        <section className="pt-7" aria-labelledby="workspace-list-title">
          <div className="mb-3 hidden grid-cols-[minmax(0,1.25fr)_minmax(120px,0.42fr)_minmax(80px,0.28fr)_minmax(120px,0.42fr)_minmax(220px,220px)] gap-4 px-3 text-xs uppercase tracking-[0.14em] text-zinc-600 md:grid">
            <span id="workspace-list-title">Workspace</span>
            <span className="text-center">Date created</span>
            <span className="text-center">Members</span>
            <span className="text-center">Join code</span>
            <span aria-hidden="true" />
          </div>

          {loading ? (
            <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]" role="status" aria-label="Loading workspaces">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="grid animate-pulse gap-4 px-3 py-6 md:grid-cols-[minmax(0,1.25fr)_minmax(120px,0.42fr)_minmax(80px,0.28fr)_minmax(120px,0.42fr)_minmax(220px,220px)] md:items-center md:gap-4">
                  <div><div className="h-4 w-44 rounded bg-white/[0.09]" /><div className="mt-3 h-3 w-64 max-w-full rounded bg-white/[0.05]" /></div>
                  <div className="h-3 w-24 rounded bg-white/[0.05]" />
                  <div className="h-3 w-20 rounded bg-white/[0.05]" />
                  <div className="h-4 w-24 rounded bg-white/[0.06]" />
                  <div className="h-9 w-40 rounded bg-white/[0.06]" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <StateMessage icon="x" title="Could not load workspaces" body={loadError} action={<Button variant="ghost" onClick={() => loadWorkspaces()}>Try again</Button>} />
          ) : workspaces.length === 0 ? (
            <StateMessage icon="dashboard" title="No workspaces yet" body="Create the first workspace to generate its join code." action={<Button onClick={() => setCreateOpen(true)}>Create workspace</Button>} />
          ) : (
            <div className="border-y border-white/[0.1]">
              {workspaces.map((workspace) => {
                const editing = editingId === workspace.id;
                const opening = busyId === `open:${workspace.id}`;
                const saving = busyId === `save:${workspace.id}`;
                const rotating = busyId === `rotate:${workspace.id}`;
                return (
                  <article key={workspace.id} className="border-b border-white/[0.08] last:border-b-0">
                    <div className="grid gap-4 px-3 py-5 md:grid-cols-[minmax(0,1.25fr)_minmax(120px,0.42fr)_minmax(80px,0.28fr)_minmax(120px,0.42fr)_minmax(220px,220px)] md:items-center md:gap-4">
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-zinc-100">{workspace.name}</h2>
                        <p className="mt-1 truncate text-xs text-zinc-500">{workspace.publicationUrl || "Publication website not set"}</p>

                      </div>
                      <div className="text-sm text-zinc-400 md:text-center"><span className="md:hidden">Date created: </span>{workspace.createdAt ? formatDisplayDate(workspace.createdAt) : "Unavailable"}</div>
                      <div className="text-sm text-zinc-400 md:text-center"><span className="md:hidden">Members: </span>{workspace.memberCount || 0}</div>
                      <button type="button" onClick={() => copyJoinCode(workspace)} className="w-fit justify-self-start font-mono text-sm tracking-[0.12em] text-zinc-300 underline-offset-4 hover:text-zinc-50 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 md:justify-self-center" aria-label={`Copy join code ${workspace.joinCode} for ${workspace.name}`}>
                        {workspace.joinCode || "Unavailable"}
                      </button>
                      <div className="flex flex-wrap justify-start gap-2 md:flex-nowrap md:justify-end">
                        <Button onClick={() => openWorkspace(workspace)} disabled={Boolean(busyId)}>{opening ? "Opening" : "Open"}</Button>
                        <Button variant="ghost" icon="settings" onClick={() => editing ? setEditingId("") : beginEditing(workspace)} disabled={Boolean(busyId)}>{editing ? "Close" : "Settings"}</Button>
                      </div>
                    </div>

                    {editing ? (
                      <div className="border-t border-white/[0.08] bg-white/[0.018] px-3 py-6">
                        <div className="max-w-3xl">
                          <h3 className="text-sm font-semibold text-zinc-200">Workspace settings</h3>
                          <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <SettingsField id={`owner-edit-name-${workspace.id}`} label="Workspace name" value={editDraft.name} onChange={(name) => setEditDraft((draft) => ({ ...draft, name }))} autoComplete="organization" />
                            <SettingsField id={`owner-edit-url-${workspace.id}`} label="Publication website (optional)" value={editDraft.publicationUrl} onChange={(publicationUrl) => setEditDraft((draft) => ({ ...draft, publicationUrl }))} type="url" autoComplete="url" />
                          </div>
                          <div className="mt-5 flex flex-col gap-4 border-t border-white/[0.08] pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="text-xs text-zinc-600">Workspace join code</div>
                              <div className="mt-1 font-mono text-sm tracking-[0.12em] text-zinc-300">{workspace.joinCode}</div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button variant="ghost" onClick={() => rotateJoinCode(workspace)} disabled={Boolean(busyId)}>
                                {rotating ? "Rotating" : rotateConfirmId === workspace.id ? "Confirm rotation" : "Rotate code"}
                              </Button>
                              <Button onClick={() => saveWorkspace(workspace)} disabled={Boolean(busyId)}>{saving ? "Saving" : "Save changes"}</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function WorkspaceJoinShell({ user, signingOut, onJoin, onSignOut }) {
  const reduceMotion = useReducedMotion();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const cleanCode = code.replace(/[^a-z0-9]/gi, "").toUpperCase();
    if (!cleanCode) {
      setError("Enter the code shared by your newsroom.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onJoin(cleanCode);
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : "Could not join this workspace.");
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#08090c] text-zinc-100">
      <div className="flex h-full">
        <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-white/[0.08] bg-[#08090c] p-4 lg:flex">
          <div className="flex items-center gap-3 px-2 py-1">
            <img src="/app-logo.png" alt="" className="h-9 w-9 shrink-0 rounded-xl object-cover" />
            <div className="text-sm font-medium text-zinc-100">Inscribe</div>
          </div>
          <div className="flex-1" aria-hidden="true" />
          <AccountMenu user={user} signingOut={signingOut} onSignOut={onSignOut} />
        </aside>

        <main className="relative flex min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.08] px-5 py-4 lg:hidden">
            <img src="/app-logo.png" alt="" className="h-9 w-9 shrink-0 rounded-xl object-cover" />
            <span className="text-sm font-medium">Inscribe</span>
          </header>

          <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-12">
            <motion.section
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md"
              aria-labelledby="join-workspace-title"
            >
              <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.045] text-zinc-300">
                <Icon name="people" className="h-5 w-5" />
              </div>
              <h1 id="join-workspace-title" className="text-2xl font-semibold tracking-tight text-zinc-50">Join a newsroom</h1>
              <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">Enter the workspace code from your adviser or editor. You will join as a guest.</p>

              <form onSubmit={submit} className="mt-8 border-y border-white/[0.09] py-6">
                <label htmlFor="workspace-code" className="mb-2 block text-sm font-medium text-zinc-300">Workspace code</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="workspace-code"
                    autoFocus
                    autoComplete="off"
                    spellCheck="false"
                    value={code}
                    onChange={(event) => {
                      setCode(event.target.value.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 12));
                      if (error) setError("");
                    }}
                    placeholder="ABC2345"
                    aria-describedby={error ? "workspace-code-error" : "workspace-code-help"}
                    aria-invalid={Boolean(error)}
                    className="h-11 min-w-0 flex-1 rounded-xl border border-white/[0.12] bg-black/25 px-3 font-mono text-sm uppercase tracking-[0.16em] text-zinc-100 outline-none transition placeholder:tracking-[0.12em] placeholder:text-zinc-700 focus:border-white/[0.28] focus:ring-2 focus:ring-white/[0.06]"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !code}
                    className="h-11 shrink-0 rounded-xl bg-zinc-100 px-5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-100/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
                  >
                    {submitting ? "Joining..." : "Join workspace"}
                  </button>
                </div>
                {error ? <p id="workspace-code-error" className="mt-3 text-sm text-rose-300" role="alert">{error}</p> : <p id="workspace-code-help" className="mt-3 text-xs leading-5 text-zinc-600">Codes are not case-sensitive.</p>}
              </form>
            </motion.section>
          </div>

          <div className="border-t border-white/[0.08] p-4 lg:hidden">
            <AccountMenu user={user} signingOut={signingOut} onSignOut={onSignOut} />
          </div>
        </main>
      </div>
    </div>
  );
}

function AccountMenu({ user, signingOut, onSignOut, variant = "sidebar" }) {
  const reduceMotion = useReducedMotion();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const menuItemRef = useRef(null);
  const displayName = accountDisplayName(user);
  const email = asText(user?.email);
  const initials = accountInitials(user);
  const roleLabel = accountRoleLabel(user?.role);
  const headerVariant = variant === "header";

  useEffect(() => {
    if (!open) return undefined;

    const frame = window.requestAnimationFrame(() => {
      if (!signingOut) menuItemRef.current?.focus();
    });

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        window.requestAnimationFrame(() => triggerRef.current?.focus());
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, signingOut]);

  return (
    <div ref={menuRef} className={headerVariant ? "relative" : "relative border-t border-white/[0.08] pt-3"}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={open ? "Close user menu" : "Open user menu"}
        onClick={() => setOpen((current) => !current)}
        className={`${headerVariant ? "justify-center p-1.5" : "w-full px-2 py-2 text-left"} flex items-center gap-3 rounded-lg transition hover:bg-white/[0.035] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 motion-reduce:transition-none`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-xs font-semibold text-zinc-100">
          {initials}
        </span>
        {!headerVariant ? <span className="block min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-zinc-100">{displayName}</span>
          {roleLabel ? <span className="mt-0.5 block truncate text-xs text-zinc-500">{roleLabel}</span> : null}
        </span> : null}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label="User account"
            initial={reduceMotion ? false : { opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.14, ease: "easeOut" }}
            className={`${headerVariant ? "right-0 top-[calc(100%+0.5rem)] w-56" : "bottom-[calc(100%+0.5rem)] left-0 w-full min-w-64"} absolute z-[1000] overflow-hidden rounded-xl border border-white/[0.1] bg-[#0d0e12] shadow-2xl shadow-black/50`}
          >
            {headerVariant ? (
              <div className="px-3 py-3">
                <div className="truncate text-sm font-medium text-zinc-100">{displayName}</div>
                {email ? <div className="mt-0.5 truncate text-xs text-zinc-500">{email}</div> : null}
              </div>
            ) : email ? <div className="truncate px-3 py-3 text-sm text-zinc-400">{email}</div> : null}
            <div className="h-px bg-white/[0.08]" />
            <button
              ref={menuItemRef}
              type="button"
              role="menuitem"
              disabled={signingOut}
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className={`${headerVariant ? "py-2 text-xs" : "py-2.5 text-sm"} flex w-full items-center gap-2 px-3 text-left text-zinc-300 transition hover:bg-white/[0.05] hover:text-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:text-zinc-600 motion-reduce:transition-none`}
            >
              <Icon name="logout" className="h-4 w-4" />
              {signingOut ? "Signing out" : "Sign out"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HeaderBreadcrumb({ page, detailLabel, navigatePage }) {
  const currentItem = navItemForPage(page);
  const currentSection = navSectionForPage(page);
  const hasDetail = Boolean(asText(detailLabel));

  return (
    <nav className="hidden min-w-0 flex-1 items-center gap-3 lg:flex" aria-label="Page breadcrumb">
      <span className="text-sm text-zinc-500">{currentSection.label}</span>
      <span className="text-zinc-700">/</span>
      {hasDetail ? (
        <>
          <button type="button" onClick={() => navigatePage(currentItem.id)} className="text-sm text-zinc-400 transition hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-white/15">
            {currentItem.label}
          </button>
          <span className="text-zinc-700">/</span>
          <span className="truncate text-sm font-medium text-zinc-50">{detailLabel}</span>
        </>
      ) : (
        <span className="truncate text-sm font-medium text-zinc-50">{currentItem.label}</span>
      )}
    </nav>
  );
}

function Toast({ message, onDismiss }) {
  const reduceMotion = useReducedMotion();
  if (!message) return null;
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.18 }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-white/[0.08] bg-zinc-950/95 p-4 shadow-2xl shadow-black/50 backdrop-blur"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-zinc-200">{message}</p>
        </div>
        <button type="button" onClick={onDismiss} className="rounded text-xs text-zinc-600 hover:text-zinc-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}

function QuickCreateModal() {
  return null;
}

function DashboardPage({ currentUser, csrfToken = "", setPage, setToast, onStoryAccepted }) {
  const [dashboard, setDashboard] = useState({ tasks: [], activity: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [respondingTo, setRespondingTo] = useState("");
  const [showAllActivity, setShowAllActivity] = useState(false);
  const firstName = asText(currentUser?.firstName) || accountDisplayName(currentUser).split(/\s+/)[0] || "there";

  const loadDashboard = async (signal) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/dashboard`, {
        headers: { Accept: "application/json" },
        credentials: "include",
        signal,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) throw new Error(payload?.error || "Your dashboard is unavailable.");
      setDashboard({
        tasks: Array.isArray(payload.tasks) ? payload.tasks : [],
        activity: Array.isArray(payload.activity) ? sortActivitiesNewestFirst(payload.activity.map(normalizeDisplayActivity)) : [],
      });
    } catch (err) {
      if (err.name !== "AbortError") setError(err instanceof Error ? err.message : "Your dashboard is unavailable.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return undefined;
    const controller = new AbortController();
    loadDashboard(controller.signal);
    return () => controller.abort();
  }, [currentUser?.id]);

  const openItem = (item) => {
    if (!item?.entityId) return;
    if (item.entityType === "pitch") {
      setPage("pitches");
      pushAppPath(pitchDetailPath(item.entityId));
    } else {
      setPage("stories");
      pushAppPath(storyDetailPath(item.entityId));
    }
  };

  const respondToInvitation = async (item, decision) => {
    if (!item?.entityId || respondingTo) return;
    setRespondingTo(`${item.entityId}:${decision}`);
    try {
      const response = await fetch(`${API_BASE}/api/story-invitations/${encodeURIComponent(item.entityId)}/${decision}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) throw new Error(payload?.error || "Could not respond to the invitation.");
      if (payload.story) onStoryAccepted?.(payload.story);
      setToast(decision === "accept" ? "Invitation accepted. You can now edit this story." : "Invitation declined.");
      await loadDashboard();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Could not respond to the invitation.");
    } finally {
      setRespondingTo("");
    }
  };

  const emptyMessage = (kind) => kind === "tasks"
    ? "You are caught up. New assignments and review requests will appear here."
    : "Status decisions, feedback, and invitations that need your attention will appear here.";
  const visibleActivity = showAllActivity ? dashboard.activity : dashboard.activity.slice(0, 6);
  const hasHiddenActivity = dashboard.activity.length > 6;
  const dashboardErrorMessage = error === "Failed to fetch"
    ? "Some dashboard data couldn't be loaded."
    : error;

  return (
    <PageShell
      title={`Hi ${firstName}`}
      description="Here's what needs your attention today."
      className="max-w-[1440px]"
    >
      {error ? (
        <div className="mb-6 flex">
          <div role="alert" className="inline-flex w-full max-w-xl items-start gap-3 rounded-xl border border-rose-400/15 bg-rose-400/[0.07] px-3.5 py-2.5 sm:w-auto sm:items-center">
            <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-rose-300/20 bg-rose-300/[0.08] text-xs font-semibold text-rose-300">!</span>
            <p className="min-w-0 flex-1 break-words text-sm leading-5 text-rose-100">{dashboardErrorMessage}</p>
            <button type="button" onClick={() => loadDashboard()} disabled={loading} className="shrink-0 rounded-md px-1.5 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-300/[0.08] hover:text-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/30 disabled:cursor-not-allowed disabled:opacity-50">
              Retry
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid min-h-[560px] gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-0">
        <section aria-labelledby="dashboard-tasks" className="min-w-0 lg:pr-10">
          <div className="flex items-baseline justify-between border-b border-white/[0.14] pb-3">
            <h2 id="dashboard-tasks" className="text-base font-semibold text-zinc-100">Tasks</h2>
            <span className="text-xs tabular-nums text-zinc-500">{dashboard.tasks.length} open</span>
          </div>
          <div>
            {loading ? (
              <DashboardSkeleton rows={5} />
            ) : dashboard.tasks.length ? dashboard.tasks.map((item) => (
              <DashboardTaskRow
                key={item.id}
                item={item}
                busy={respondingTo.startsWith(`${item.entityId}:`)}
                onOpen={() => openItem(item)}
                onRespond={(decision) => respondToInvitation(item, decision)}
              />
            )) : (
              <DashboardEmpty icon="task" text={emptyMessage("tasks")} />
            )}
          </div>
        </section>

        <section aria-labelledby="dashboard-activity" className="min-w-0 lg:border-l lg:border-white/[0.1] lg:pl-10">
          <div className="flex items-baseline justify-between border-b border-white/[0.14] pb-3">
            <h2 id="dashboard-activity" className="text-base font-semibold text-zinc-100">Recent activity</h2>
            {hasHiddenActivity ? (
              <button type="button" onClick={() => setShowAllActivity((current) => !current)} className="text-xs font-medium text-zinc-400 transition hover:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                {showAllActivity ? "Show less" : "See all"}
              </button>
            ) : null}
          </div>
          <div className={cx(showAllActivity && "lg:max-h-[calc(100vh-230px)] lg:overflow-y-auto lg:overscroll-contain lg:pr-2")}>
            {loading ? (
              <DashboardSkeleton rows={6} />
            ) : visibleActivity.length ? visibleActivity.map((item) => (
              <DashboardActivityRow
                key={item.id}
                item={item}
                busy={respondingTo.startsWith(`${item.entityId}:`)}
                onOpen={() => openItem(item)}
                onRespond={(decision) => respondToInvitation(item, decision)}
              />
            )) : (
              <DashboardEmpty icon="mail" text={emptyMessage("activity")} />
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function DashboardTaskRow({ item, busy, onOpen, onRespond }) {
  const invitation = item.kind === "invitation";
  return (
    <div className="border-b border-white/[0.08] py-4">
      <div className="flex items-start gap-3">
        <span className={cx("mt-1.5 h-2 w-2 shrink-0 rounded-full", item.priority === "high" ? "bg-amber-300" : "bg-zinc-500")} />
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
          <span className="block truncate text-sm font-medium text-zinc-100">{item.title}</span>
          <span className="mt-1 block text-sm leading-5 text-zinc-500">{item.detail}</span>
          <span className="mt-1.5 block text-xs text-zinc-600">{item.dueDate ? `Due ${formatDisplayDate(item.dueDate)}` : formatDisplayDate(item.time)}</span>
        </button>
      </div>
      {invitation ? (
        <div className="mt-3 flex gap-2 pl-5">
          <Button onClick={() => onRespond("accept")} disabled={busy} className="h-8 px-3 text-xs">Accept</Button>
          <Button variant="ghost" onClick={() => onRespond("decline")} disabled={busy} className="h-8 px-3 text-xs">Decline</Button>
        </div>
      ) : null}
    </div>
  );
}

function DashboardActivityRow({ item, busy, onOpen, onRespond }) {
  const invitation = item.kind === "invitation";
  return (
    <div className="border-b border-white/[0.08] py-3.5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.055] text-zinc-400">
          <Icon name={invitation ? "mail" : item.kind === "comment" ? "edit" : "clock"} className="h-3.5 w-3.5" />
        </span>
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
          <span className="flex min-w-0 items-baseline justify-between gap-3">
            {item.title ? <span className="min-w-0 truncate text-xs font-medium text-zinc-300">{item.title}</span> : <span />}
            <span className="shrink-0 text-xs text-zinc-500">{formatDisplayDate(item.time)}</span>
          </span>
          <span className="mt-0.5 block text-sm leading-5 text-zinc-500">{item.text}</span>
        </button>
      </div>
      {invitation ? (
        <div className="mt-2 flex gap-2 pl-10">
          <button type="button" disabled={busy} onClick={() => onRespond("accept")} className="text-xs font-medium text-zinc-200 hover:text-white disabled:text-zinc-600">Accept</button>
          <button type="button" disabled={busy} onClick={() => onRespond("decline")} className="text-xs text-zinc-500 hover:text-zinc-200 disabled:text-zinc-700">Decline</button>
        </div>
      ) : null}
    </div>
  );
}

function DashboardSkeleton({ rows }) {
  return Array.from({ length: rows }, (_, index) => (
    <div key={index} className="border-b border-white/[0.08] py-4" aria-hidden="true">
      <div className="h-3 w-2/5 animate-pulse rounded bg-white/[0.07]" />
      <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-white/[0.04]" />
    </div>
  ));
}

function DashboardEmpty({ icon, text }) {
  return (
    <div className="flex items-start gap-3 py-8 text-zinc-600">
      <Icon name={icon} className="mt-0.5 h-4 w-4" />
      <p className="max-w-md text-sm leading-6">{text}</p>
    </div>
  );
}


function PitchBoardPage({ setToast, csrfToken = "", currentUser, hasWorkspace = true, onStoryCreated = () => {} }) {
  const [pitches, setPitches] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [selectedRoundId, setSelectedRoundId] = useState("");
  const [roundLoading, setRoundLoading] = useState(true);
  const [roundError, setRoundError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailPitchId, setDetailPitchId] = useState(initialPitchDetailId);
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("All sections");
  const [statusFilter, setStatusFilter] = useState("All pitches");
  const [expandedWriters, setExpandedWriters] = useState(() => new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [roundCreateOpen, setRoundCreateOpen] = useState(false);
  const [roundSaving, setRoundSaving] = useState(false);
  const canManagePitches = canManageEditorialWorkflow(currentUser?.role);

  const loadRounds = async (signal) => {
    if (!hasWorkspace) {
      setRounds([]);
      setSelectedRoundId("");
      setRoundError("Open a workspace first.");
      setRoundLoading(false);
      return;
    }
    setRoundLoading(true);
    setRoundError("");
    try {
      const response = await fetch(`${API_BASE}/api/pitch-rounds`, {
        headers: { Accept: "application/json" },
        credentials: "include",
        signal,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Pitch rounds are unavailable.");
      }
      const nextRounds = Array.isArray(payload.rounds) ? payload.rounds : [];
      setRounds(nextRounds);
      setSelectedRoundId((previous) => {
        if (previous && nextRounds.some((round) => round.id === previous)) return previous;
        return nextRounds.find((round) => round.status === "Open")?.id || nextRounds[0]?.id || "";
      });
    } catch (loadError) {
      if (loadError.name === "AbortError") return;
      setRounds([]);
      setSelectedRoundId("");
      setRoundError(loadError instanceof Error ? loadError.message : "Pitch rounds are unavailable.");
    } finally {
      if (!signal?.aborted) setRoundLoading(false);
    }
  };

  const loadPitches = async (signal, roundId = selectedRoundId) => {
    setLoading(true);
    setError("");
    try {
      const query = roundId ? `?roundId=${encodeURIComponent(roundId)}` : "";
      const response = await fetch(`${API_BASE}/api/pitches${query}`, {
        headers: { Accept: "application/json" },
        credentials: "include",
        signal,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Pitch board is unavailable.");
      }
      setPitches(Array.isArray(payload.pitches) ? payload.pitches.map(normalizeDisplayPitch) : []);
    } catch (loadError) {
      if (loadError.name === "AbortError") return;
      setPitches([]);
      setError(loadError instanceof Error ? loadError.message : "Pitch board is unavailable.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const syncFromPath = () => setDetailPitchId(initialPitchDetailId());
    window.addEventListener("popstate", syncFromPath);
    window.addEventListener("falcon-route-change", syncFromPath);
    return () => {
      window.removeEventListener("popstate", syncFromPath);
      window.removeEventListener("falcon-route-change", syncFromPath);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadRounds(controller.signal);
    return () => controller.abort();
  }, [hasWorkspace]);

  useEffect(() => {
    if (!selectedRoundId) {
      setPitches([]);
      setLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    loadPitches(controller.signal, selectedRoundId);
    return () => controller.abort();
  }, [selectedRoundId]);

  const roundPitches = useMemo(
    () => pitches.filter((pitch) => matchesPitchFilters(pitch, query, section, statusFilter)),
    [pitches, query, section, statusFilter]
  );
  const pitchSectionOptions = useMemo(
    () => uniqueTextValues([
      ...PITCH_SECTIONS.filter((option) => option !== "All sections"),
      ...pitches.map((pitch) => pitch.section),
    ]),
    [pitches]
  );
  const writerGroups = useMemo(() => groupActivePitchesByWriter(roundPitches), [roundPitches]);
  const detailPitch = pitches.find((pitch) => pitch.id === detailPitchId) || null;
  const currentRound = rounds.find((round) => round.id === selectedRoundId) || null;

  const navigateToBoard = () => {
    setDetailPitchId(null);
    pushAppPath("/pitches");
  };

  const navigateToPitch = (id) => {
    setDetailPitchId(id);
    pushAppPath(pitchDetailPath(id));
  };

  const updatePitch = (id, updater) => {
    setPitches((previous) =>
      previous.map((pitch) => {
        if (pitch.id !== id) return pitch;
        const nextPitch = typeof updater === "function" ? updater(pitch) : { ...pitch, ...updater };
        return normalizeDisplayPitch({ ...nextPitch, updatedAt: "Just now" });
      })
    );
  };

  const nextIdAfter = (id) => nextPitchId(roundPitches.filter((pitch) => pitch.id !== id), id);

  const updatePitchStatus = async (id, status, message, approval = {}) => {
    const targetPitch = pitches.find((pitch) => pitch.id === id);
    const ownerCanSubmit = status === PITCH_STATUS_READY && pitchBelongsToUser(targetPitch, currentUser);
    if (!canManagePitches && !ownerCanSubmit) {
      setToast("Only the pitch owner can submit it for review.");
      return null;
    }
    const selectedDueDate = status === PITCH_STATUS_SELECTED ? dueDateValue(approval) : "";
    try {
      const response = await fetch(`${API_BASE}/api/pitches/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ status, ...approval }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Pitch status update failed.");
      }
      const updatedPitch = normalizeDisplayPitch(payload.pitch || { id, status, updatedAt: "Just now" });
      const updatedStory = status === PITCH_STATUS_SELECTED && payload.story ? storyWithApprovedDueDate(payload.story, selectedDueDate) : payload.story;
      setPitches((previous) => previous.map((pitch) => (pitch.id === id ? { ...pitch, ...updatedPitch } : pitch)));
      if (status === PITCH_STATUS_SELECTED && updatedStory) {
        onStoryCreated(updatedStory);
      }
      loadRounds();
      setToast(payload.warning || message || `Updated pitch to ${status}.`);
      return { ...payload, pitch: updatedPitch, ...(updatedStory ? { story: updatedStory } : {}) };
    } catch (statusError) {
      setToast(statusError instanceof Error ? statusError.message : "Pitch status update failed.");
      return null;
    }
  };

  const updateRoundStatus = async (status) => {
    if (!currentRound || !canManagePitches) return;
    setRoundSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/pitch-rounds/${encodeURIComponent(currentRound.id)}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) throw new Error(payload?.error || "Could not update round.");
      setRounds((previous) => previous.map((round) => (round.id === currentRound.id ? payload.round : round)));
      setToast(status === "Open" ? "Opened submissions." : status === "Reviewing" ? "Closed submissions." : "Closed round.");
    } catch (roundUpdateError) {
      setToast(roundUpdateError instanceof Error ? roundUpdateError.message : "Could not update round.");
    } finally {
      setRoundSaving(false);
    }
  };

  const createRound = async (name) => {
    const cleanName = asText(name);
    if (!hasWorkspace) {
      setToast("Open a workspace first.");
      return;
    }
    if (!cleanName || roundSaving) return;
    setRoundSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/pitch-rounds`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ name: cleanName }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) throw new Error(payload?.error || `Could not create round (${response.status}).`);
      setRounds((previous) => [payload.round, ...previous]);
      setSelectedRoundId(payload.round.id);
      setRoundCreateOpen(false);
      setToast("Created round.");
    } catch (roundCreateError) {
      setToast(roundCreateError instanceof Error ? roundCreateError.message : "Could not create round.");
    } finally {
      setRoundSaving(false);
    }
  };

  const deleteRound = async (round) => {
    if (!round || !canManagePitches || roundSaving || round.isLegacy) return;
    const pitchCount = Number(round.pitchCount || 0);
    const confirmation = pitchCount
      ? `Delete “${round.name}”? It still contains ${pitchCount} ${pitchCount === 1 ? "pitch" : "pitches"}. Only empty rounds can be deleted.`
      : `Delete “${round.name}”? This cannot be undone.`;
    if (!window.confirm(confirmation)) return;
    setRoundSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/pitch-rounds/${encodeURIComponent(round.id)}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) throw new Error(payload?.error || "Could not delete round.");
      const remainingRounds = rounds.filter((candidate) => candidate.id !== round.id);
      setRounds(remainingRounds);
      setSelectedRoundId((previous) => {
        if (previous !== round.id) return previous;
        return remainingRounds.find((candidate) => candidate.status === "Open")?.id || remainingRounds[0]?.id || "";
      });
      setToast("Deleted round.");
    } catch (roundDeleteError) {
      setToast(roundDeleteError instanceof Error ? roundDeleteError.message : "Could not delete round.");
    } finally {
      setRoundSaving(false);
    }
  };

  const updatePitchDetails = async (id, draft) => {
    const targetPitch = pitches.find((pitch) => pitch.id === id);
    if (!pitchBelongsToUser(targetPitch, currentUser) || targetPitch?.status !== "In Progress") {
      setToast("Only the pitch owner can edit an in-progress pitch.");
      return false;
    }
    const updates = {
      title: asText(draft.title),
      angle: asText(draft.angle),
      section: asText(draft.section),
      notes: asText(draft.notes),
    };
    if (!updates.title || !updates.angle || !PITCH_SECTIONS.includes(updates.section) || updates.section === "All sections") {
      setToast("Add a title, angle, and valid section before saving.");
      return false;
    }
    try {
      const response = await fetch(`${API_BASE}/api/pitches/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Could not update pitch.");
      }
      const updatedPitch = normalizeDisplayPitch(payload.pitch || { ...targetPitch, ...updates, updatedAt: "Just now" });
      setPitches((previous) => previous.map((pitch) => (pitch.id === id ? { ...pitch, ...updatedPitch } : pitch)));
      setToast("Updated pitch.");
      return true;
    } catch (updateError) {
      setToast(updateError instanceof Error ? updateError.message : "Could not update pitch.");
      return false;
    }
  };

  const deletePitch = async (id) => {
    const targetPitch = pitches.find((pitch) => pitch.id === id);
    const ownerCanDelete = pitchBelongsToUser(targetPitch, currentUser) && targetPitch?.status === "In Progress";
    if (!canManagePitches && !ownerCanDelete) {
      setToast("Only editors, admins, or the owner of an in-progress pitch can delete it.");
      return false;
    }
    const confirmed = window.confirm(`Delete “${targetPitch?.title || "this pitch"}”? This cannot be undone.`);
    if (!confirmed) return false;
    const nextId = nextIdAfter(id);
    try {
      const response = await fetch(`${API_BASE}/api/pitches/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Could not delete pitch.");
      }
      setPitches((previous) => previous.filter((pitch) => pitch.id !== id));
      if (nextId) navigateToPitch(nextId);
      else navigateToBoard();
      setToast("Deleted pitch.");
      return true;
    } catch (deleteError) {
      setToast(deleteError instanceof Error ? deleteError.message : "Could not delete pitch.");
      return false;
    }
  };

  const createPitch = async (draft) => {
    const title = draft.title.trim();
    const section = normalizeSectionLabel(draft.section);
    if (!title || !section) return;
    try {
      const response = await fetch(`${API_BASE}/api/pitches`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          roundId: selectedRoundId,
          title,
          angle: draft.angle.trim() || "Angle to be developed.",
          section,
          notes: draft.notes.trim(),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Could not create pitch.");
      }
      const nextPitch = normalizeDisplayPitch(payload.pitch);
      setPitches((previous) => [nextPitch, ...previous]);
      setQuery("");
      setSection("All sections");
      setStatusFilter("All pitches");
      setExpandedWriters((previous) => new Set([...previous, pitchOwnerGroupKey(nextPitch)]));
      setCreateOpen(false);
      setToast("Created a new pitch.");
    } catch (createError) {
      setToast(createError instanceof Error ? createError.message : "Could not create pitch.");
    }
  };

  const submitForReview = (id, message) => {
    return updatePitchStatus(id, PITCH_STATUS_READY, message || "Submitted pitch for review.");
  };

  const markInProgress = (id, message) => {
    return updatePitchStatus(id, PITCH_STATUS_IN_PROGRESS, message || "Returned pitch to in progress.");
  };

  const addComment = (id, text) => {
    updatePitch(id, (pitch) => ({
      ...pitch,
      comments: [
        { id: `c${Date.now()}`, author: "Editor", text, time: formatDisplayDate("Just now") },
        ...pitch.comments,
      ],
    }));
    setToast("Added comment.");
  };

  const editComment = (id, commentId, text) => {
    updatePitch(id, (pitch) => ({
      ...pitch,
      comments: pitch.comments.map((comment) =>
        comment.id === commentId ? { ...comment, text, time: formatDisplayDate("Just now") } : comment
      ),
    }));
    setToast("Updated comment.");
  };

  const deleteComment = (id, commentId) => {
    updatePitch(id, (pitch) => ({ ...pitch, comments: pitch.comments.filter((comment) => comment.id !== commentId) }));
    setToast("Deleted comment.");
  };

  const handleQueryChange = (value) => setQuery(value);
  const handleSectionChange = (value) => setSection(value);
  const handleStatusFilterChange = (value) => setStatusFilter(value);

  const toggleWriter = (writer) => {
    setExpandedWriters((previous) => {
      const next = new Set(previous);
      if (next.has(writer)) next.delete(writer);
      else next.add(writer);
      return next;
    });
  };

  if (detailPitchId && loading) {
    return (
      <PageShell title="Loading pitch" eyebrow="Pitches" right={<Button variant="ghost" onClick={navigateToBoard}>Back to board</Button>}>
        <StateMessage icon="edit" title="Loading pitch" body="Pulling the latest pitch and feedback from the newsroom." />
      </PageShell>
    );
  }

  if (detailPitchId && error) {
    return (
      <PageShell title="Pitch unavailable" eyebrow="Pitches" right={<Button variant="ghost" onClick={navigateToBoard}>Back to board</Button>}>
        <StateMessage icon="edit" title="Could not load pitch" body={error} />
      </PageShell>
    );
  }

  if (detailPitchId) {
    const ownsEditablePitch = pitchBelongsToUser(detailPitch, currentUser) && detailPitch?.status === "In Progress";
    return (
      <PitchDetailPage
        pitch={detailPitch}
        onBack={navigateToBoard}
        onSubmitForReview={submitForReview}
        onMarkInProgress={markInProgress}
        onApprove={(id, approval) => updatePitchStatus(id, PITCH_STATUS_SELECTED, "Selected pitch for a story.", approval)}
        onHold={(id) => updatePitchStatus(id, PITCH_STATUS_ON_HOLD, "Put pitch on hold.")}
        onUpdate={updatePitchDetails}
        onDelete={deletePitch}
        onAddComment={addComment}
        onEditComment={editComment}
        onDeleteComment={deleteComment}
        canManagePitches={canManagePitches}
        canSubmitForReview={pitchBelongsToUser(detailPitch, currentUser)}
        canEditPitch={ownsEditablePitch}
        canDeletePitch={canManagePitches || ownsEditablePitch}
        csrfToken={csrfToken}
        setToast={setToast}
      />
    );
  }

  return (
    <PageShell
      title="Pitch Board"
      right={(
        <div className="flex items-center gap-2">
          {canManagePitches && hasWorkspace ? <Button variant="ghost" onClick={() => setRoundCreateOpen(true)}>New round</Button> : null}
          <Button icon="plus" disabled={!hasWorkspace || !currentRound || currentRound.status !== "Open"} onClick={() => setCreateOpen(true)}>New pitch</Button>
        </div>
      )}
    >

      <div className="min-w-0">
        <div className="mb-6 flex flex-col gap-5">
          <div className="flex flex-col gap-3 border-b border-white/[0.08] pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <div className="w-full min-w-0 sm:w-auto sm:min-w-[250px] sm:max-w-[360px]">
                <AnimatedDropdown
                  text={roundLoading ? "Loading rounds…" : currentRound ? `${currentRound.name}${currentRound.isLegacy ? " · Legacy" : ""}` : "No rounds"}
                  items={rounds.map((round) => ({
                    name: `${round.name}${round.isLegacy ? " · Legacy" : ""}`,
                    value: round.id,
                    link: "#",
                    deletable: canManagePitches && !round.isLegacy,
                  }))}
                  onSelect={(item) => setSelectedRoundId(item.value || "")}
                  onDelete={(item) => deleteRound(rounds.find((round) => round.id === item.value))}
                  disabled={roundLoading || !rounds.length}
                  ariaLabel="Choose a pitch round"
                  className="w-full"
                  menuClassName="max-h-[min(24rem,calc(100dvh-7rem))] overflow-y-auto"
                  menuMaxHeight="min(24rem, calc(100dvh - 7rem))"
                />
              </div>
              {canManagePitches && currentRound && !currentRound.isLegacy ? (
                (() => {
                  const submissionsOpen = currentRound.status === "Open";
                  return (
                    <Button
                      variant="ghost"
                      className="gap-2"
                      disabled={roundSaving}
                      aria-pressed={submissionsOpen}
                      aria-label={`${submissionsOpen ? "Open" : "Closed"} for submissions. Click to ${submissionsOpen ? "close" : "open"} submissions.`}
                      onClick={() => updateRoundStatus(submissionsOpen ? "Reviewing" : "Open")}
                    >
                      <span
                        aria-hidden="true"
                        className={cx("h-2 w-2 rounded-full", submissionsOpen ? "bg-emerald-400" : "bg-red-400")}
                      />
                      {submissionsOpen ? "Open for submissions" : "Closed for submissions"}
                    </Button>
                  );
                })()
              ) : null}
            </div>
          </div>
          <div className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_220px]">
            <Input value={query} onChange={handleQueryChange} placeholder="Search writer, title, or section" />
            <AnimatedOptionDropdown value={section} onChange={handleSectionChange} options={["All sections", ...pitchSectionOptions]} className="w-full" />
          </div>
          <div>
            <div className="flex gap-5 overflow-x-auto border-b border-white/[0.08]">
              {["All pitches", PITCH_STATUS_READY, PITCH_STATUS_IN_PROGRESS, PITCH_STATUS_SELECTED, PITCH_STATUS_ON_HOLD].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => handleStatusFilterChange(filter)}
                  className={cx(
                    "whitespace-nowrap border-b-2 pb-2 text-sm transition",
                    statusFilter === filter ? "border-zinc-100 text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-200"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.08]" aria-busy={loading}>
          {loading ? <PitchBoardSkeleton /> : null}
          {!loading && error && (
            <StateMessage
              icon="edit"
              title="Could not load pitches"
              body={error}
              action={<Button variant="ghost" onClick={() => loadPitches(undefined, selectedRoundId)}>Try again</Button>}
            />
          )}
          {!loading && !error && writerGroups.map((group) => (
            <PitchWriterRow
              key={group.key}
              group={group}
              expanded={expandedWriters.has(group.key)}
              onToggle={() => toggleWriter(group.key)}
              onSelectPitch={navigateToPitch}
            />
          ))}
          {!loading && !error && !writerGroups.length && (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 h-px w-10 bg-zinc-600" />
              <h3 className="text-sm font-medium text-zinc-200">No pitches in this round</h3>
            </div>
          )}
        </div>
      </div>

      {roundError ? <p className="mt-4 text-sm text-rose-300">{roundError}</p> : null}

      <AnimatePresence>
        {createOpen && (
          <PitchCreateModal
            onClose={() => setCreateOpen(false)}
            onCreate={createPitch}
            sections={pitchSectionOptions}
          />
        )}
        {roundCreateOpen && (
          <PitchRoundCreateModal
            submitting={roundSaving}
            onClose={() => {
              if (!roundSaving) setRoundCreateOpen(false);
            }}
            onCreate={createRound}
          />
        )}
      </AnimatePresence>
    </PageShell>
  );
}

function PitchBoardSkeleton() {
  return (
    <div role="status" aria-label="Loading pitches">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="border-b border-white/[0.06] px-4 py-4 last:border-b-0" aria-hidden="true">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-4 w-full max-w-48 animate-pulse rounded bg-white/[0.08]" />
            </div>
            <div className="hidden shrink-0 gap-2 sm:flex">
              <div className="h-7 w-20 animate-pulse rounded-lg bg-white/[0.05]" />
              <div className="h-7 w-24 animate-pulse rounded-lg bg-white/[0.05]" />
              <div className="h-7 w-28 animate-pulse rounded-lg bg-white/[0.05]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PitchWriterRow({ group, expanded, onToggle, onSelectPitch }) {
  return (
    <div className="border-b border-white/[0.06] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 bg-white/[0.015] px-4 py-4 text-left transition hover:bg-white/[0.04]"
        aria-expanded={expanded}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Icon name="chevron" className={cx("h-4 w-4 shrink-0 text-zinc-500 transition", expanded && "rotate-180")} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-zinc-100">{group.writer}</span>
            {group.hasDuplicateName && group.email ? (
              <span className="block truncate text-xs text-zinc-500">{group.email}</span>
            ) : null}
          </span>
        </div>
        <span className="shrink-0 text-sm text-zinc-500">{group.pitches.length} {group.pitches.length === 1 ? "pitch" : "pitches"}</span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden bg-black/15"
          >
            <div className="px-4 pb-4">
              <div className="hidden grid-cols-[8.5rem_minmax(0,1fr)_9rem_10rem] gap-4 border-b border-white/[0.06] px-3 py-3 text-xs uppercase tracking-[0.14em] text-zinc-600 md:grid">
                <span>Status</span>
                <span>Pitch title</span>
                <span>Section</span>
                <span>Submitted</span>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {group.pitches.map((pitch) => (
                  <PitchQueueRow
                    key={pitch.id}
                    pitch={pitch}
                    onSelect={() => onSelectPitch(pitch.id)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PitchQueueRow({ pitch, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="grid w-full grid-cols-1 gap-2 rounded-xl py-3 text-left transition hover:bg-white/[0.045] md:grid-cols-[8.5rem_minmax(0,1fr)_9rem_10rem] md:items-center md:gap-4 md:px-3"
    >
      <div>
        <PitchStatusText status={pitch.status} />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium leading-5 text-zinc-100">{pitch.title}</div>
      </div>
      <div className="text-sm text-zinc-500">{pitch.section}</div>
      <div className="text-sm text-zinc-500">{pitch.submittedAt}</div>
    </button>
  );
}

function PitchDetailPage({
  pitch,
  onBack,
  onSubmitForReview,
  onMarkInProgress,
  onApprove,
  onHold,
  onUpdate,
  onDelete,
  canManagePitches = false,
  canSubmitForReview = false,
  canEditPitch = false,
  canDeletePitch = false,
  csrfToken = "",
  setToast = () => {},
}) {
  const [feedbackDraft, setFeedbackDraft] = useState("");
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editingFeedbackText, setEditingFeedbackText] = useState("");
  const [openItemMenu, setOpenItemMenu] = useState(null);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalSubmitting, setApprovalSubmitting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    setFeedbackDraft("");
    setEditingFeedbackId(null);
    setEditingFeedbackText("");
    setOpenItemMenu(null);
    setApprovalOpen(false);
    setApprovalSubmitting(false);
    setEditOpen(false);
    setEditSubmitting(false);
  }, [pitch?.id]);

  useEffect(() => {
    if (!openItemMenu) return undefined;

    const closeMenu = (event) => {
      if (event.target?.closest?.("[data-pitch-action-menu]")) return;
      setOpenItemMenu(null);
    };

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpenItemMenu(null);
    };

    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [openItemMenu]);

  const pitchActivity = useWorkflowActivity("pitch", pitch?.id || "", pitch?.status || "");
  const pitchFeedback = useEntityFeedback("pitch", pitch?.id || "", `${pitch?.updatedAt || ""}:${pitch?.status || ""}`);

  if (!pitch) {
    return (
      <PageShell
        title="Pitch unavailable"
        right={<Button variant="ghost" onClick={onBack}>Back to board</Button>}
      >
        <Card className="flex min-h-[420px] items-center justify-center p-6">
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-5 h-px w-12 bg-zinc-600" />
            <h3 className="text-lg font-semibold tracking-tight text-zinc-100">Pitch not found</h3>
          </div>
        </Card>
      </PageShell>
    );
  }

  const feedbackItems = pitchFeedback.feedback;
  const { loading: feedbackLoading, error: feedbackError } = pitchFeedback;
  const { activity: activityItems, loading: activityLoading, error: activityError } = pitchActivity;

  const submitFeedback = async () => {
    const text = feedbackDraft.trim();
    if (!text) return;
    try {
      const response = await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          entityType: "pitch",
          entityId: pitch.id,
          text,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Could not add feedback.");
      }
      const nextFeedback = normalizeDisplayFeedback(payload.feedback || { id: `feedback-${Date.now()}`, text, author: "Editor", time: "Just now" });
      pitchFeedback.setFeedback((previous) => [nextFeedback, ...previous]);
      setFeedbackDraft("");
      setToast("Added feedback.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not add feedback.");
    }
  };

  const approvePitch = async (approval) => {
    if (approvalSubmitting) return;
    setApprovalSubmitting(true);
    const result = await onApprove(pitch.id, approval);
    if (!result) setApprovalSubmitting(false);
  };

  const savePitchEdits = async (draft) => {
    if (editSubmitting) return;
    setEditSubmitting(true);
    const saved = await onUpdate(pitch.id, draft);
    setEditSubmitting(false);
    if (saved) setEditOpen(false);
  };
  const startEditingFeedback = (feedback) => {
    setEditingFeedbackId(feedback.id);
    setEditingFeedbackText(feedback.text);
    setOpenItemMenu(null);
  };

  const saveFeedbackEdit = async () => {
    const text = editingFeedbackText.trim();
    if (!text || !editingFeedbackId) return;
    try {
      const response = await fetch(`${API_BASE}/api/feedback/${encodeURIComponent(editingFeedbackId)}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ text }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Could not update feedback.");
      }
      const updatedFeedback = normalizeDisplayFeedback(payload.feedback || { id: editingFeedbackId, text, time: "Just now" });
      pitchFeedback.setFeedback((previous) => previous.map((feedback) => (
        feedback.id === editingFeedbackId ? { ...feedback, ...updatedFeedback } : feedback
      )));
      setEditingFeedbackId(null);
      setEditingFeedbackText("");
      setToast("Updated feedback.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not update feedback.");
    }
  };

  const deleteFeedbackItem = async (feedbackId) => {
    try {
      const response = await fetch(`${API_BASE}/api/feedback/${encodeURIComponent(feedbackId)}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Could not delete feedback.");
      }
      pitchFeedback.setFeedback((previous) => previous.filter((feedback) => feedback.id !== feedbackId));
      setToast("Deleted feedback.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not delete feedback.");
    }
  };

  return (
    <motion.div
      key={pitch.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="mx-auto min-h-full max-w-[1640px] px-5 py-8 md:px-8"
    >
      <div className="grid gap-10 2xl:grid-cols-[minmax(0,1fr)_360px] 2xl:items-start">
        <section className="mx-auto w-full max-w-[940px] space-y-10" aria-label="Pitch review details">
          <section className="border-b border-white/[0.16] pb-10">
            <p className="mb-4 text-sm font-semibold text-zinc-400">Pitch review</p>
            <h1 className="max-w-[24ch] text-3xl font-semibold leading-[1.16] tracking-tight text-zinc-50 md:text-4xl">
              {pitch.title}
            </h1>
            <p className="mt-5 max-w-[70ch] text-base leading-7 text-zinc-400 md:text-[1.0625rem]">
              {pitch.angle}
            </p>
            {pitch.notes ? (
              <div className="mt-7 max-w-[70ch]">
                <h2 className="text-sm font-semibold text-zinc-300">Additional notes</h2>
                <p className="mt-2 text-[0.9375rem] leading-6 text-zinc-500">{pitch.notes}</p>
              </div>
            ) : null}
          </section>

          <section className="border-b border-white/[0.16] pb-10">
            <div className="mb-5">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-50">Editor feedback</h2>
              <p className="mt-1.5 text-[0.9375rem] leading-6 text-zinc-500">Direction for revision, reporting focus, and next steps.</p>
            </div>
            <div className="space-y-4">
              {feedbackItems.map((feedback) => {
                const menuId = `feedback-${feedback.id}`;
                return (
                  <div key={feedback.id} className="group border-b border-white/[0.1] pb-4 last:border-b-0 last:pb-0">
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <div>
                        <span className="text-sm font-semibold text-zinc-300">{feedback.author}</span>
                        <span className="ml-2 text-xs text-zinc-600">{feedback.time}</span>
                      </div>
                      {editingFeedbackId === feedback.id ? (
                        <div className="flex shrink-0 gap-3">
                          <button type="button" onClick={saveFeedbackEdit} className="text-xs font-medium text-zinc-300 hover:text-zinc-50">Save</button>
                          <button type="button" onClick={() => setEditingFeedbackId(null)} className="text-xs text-zinc-600 hover:text-zinc-300">Cancel</button>
                        </div>
                      ) : canManagePitches ? (
                        <PitchItemMenu
                          label="Feedback actions"
                          open={openItemMenu === menuId}
                          onToggle={() => setOpenItemMenu((current) => current === menuId ? null : menuId)}
                          onEdit={() => startEditingFeedback(feedback)}
                          onDelete={() => {
                            setOpenItemMenu(null);
                            deleteFeedbackItem(feedback.id);
                          }}
                        />
                      ) : null}
                    </div>
                    {editingFeedbackId === feedback.id ? (
                      <textarea
                        value={editingFeedbackText}
                        onChange={(event) => setEditingFeedbackText(event.target.value)}
                        rows={3}
                        className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/25 px-3 py-2 text-sm leading-6 text-zinc-300 outline-none focus:border-white/[0.18]"
                      />
                    ) : (
                      <p className="max-w-[70ch] text-[0.9375rem] leading-6 text-zinc-500">{feedback.text}</p>
                    )}
                  </div>
                );
              })}
              {feedbackLoading ? <p className="text-sm text-zinc-600">Loading feedback...</p> : null}
              {feedbackError ? <p className="text-sm text-zinc-600">{feedbackError}</p> : null}
            </div>
            {canManagePitches ? (
            <div className="mt-6 flex items-end gap-2 rounded-xl border border-white/[0.12] bg-white/[0.025] p-2">
              <textarea
                value={feedbackDraft}
                onChange={(event) => setFeedbackDraft(event.target.value)}
                rows={2}
                className="min-h-[68px] w-full resize-none bg-transparent px-2 py-2 text-sm leading-6 text-zinc-300 outline-none placeholder:text-zinc-600"
                placeholder="Add feedback for revision, reporting focus, or next steps"
              />
              <button
                type="button"
                onClick={submitFeedback}
                aria-label="Add feedback"
                className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-black transition hover:bg-white active:scale-[0.98]"
              >
                <Icon name="plus" className="h-4 w-4" />
              </button>
            </div>
            ) : null}
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-50">Activity</h2>
            <div className="mt-5 space-y-4">
              {activityLoading ? (
                <p className="text-sm text-zinc-600">Loading workflow activity...</p>
              ) : activityError ? (
                <p className="text-sm text-zinc-600">{activityError}</p>
              ) : activityItems.length ? activityItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-500" />
                  <div>
                    <p className="text-sm text-zinc-400">{item.text}</p>
                    <p className="mt-1 text-xs text-zinc-600">{item.time}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-zinc-600">No workflow status changes recorded yet.</p>
              )}
            </div>
          </section>
        </section>

        <aside className="mx-auto w-full max-w-[940px] space-y-3 2xl:sticky 2xl:top-8 2xl:max-w-none">
          <div className="rounded-2xl border border-white/[0.12] bg-white/[0.035] p-5">
            <h2 className="text-base font-semibold text-zinc-100">Properties</h2>
            <div className="mt-4 divide-y divide-white/[0.1]">
              <PitchProperty label="Status">
                <PitchStatusText status={pitch.status} />
              </PitchProperty>
              <PitchProperty label="Writer">{pitch.owner}</PitchProperty>
              <PitchProperty label="Section">{pitch.section}</PitchProperty>
              <PitchProperty label="Submitted">{pitch.submittedAt}</PitchProperty>
            </div>
            {canSubmitForReview && [PITCH_STATUS_IN_PROGRESS, PITCH_STATUS_READY].includes(pitch.status) ? (
              <div className="mt-5 border-t border-white/[0.1] pt-5">
                {pitch.status === PITCH_STATUS_READY ? <p className="text-sm text-zinc-500">Submitted for review.</p> : null}
                <Button className="mt-4 w-full" disabled={pitch.status === PITCH_STATUS_READY} onClick={() => onSubmitForReview(pitch.id)}>
                  {pitch.status === PITCH_STATUS_READY ? "Submitted for review" : "Submit for review"}
                </Button>
                {canEditPitch ? (
                  <div className="mt-2 grid gap-2">
                    <Button variant="ghost" onClick={() => setEditOpen(true)} className="w-full">Edit pitch</Button>
                    {!canManagePitches && canDeletePitch ? (
                      <Button variant="danger" icon="trash" onClick={() => onDelete(pitch.id)} className="w-full">Delete pitch</Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {canManagePitches ? (
          <div className="rounded-2xl border border-white/[0.12] bg-white/[0.035] p-5">
            <h2 className="text-base font-semibold text-zinc-100">Actions</h2>
            <div className="mt-4 space-y-2">
              <Button disabled={pitch.status !== PITCH_STATUS_READY} onClick={() => setApprovalOpen(true)} className="w-full">Select for story</Button>
              <Button
                variant="ghost"
                disabled={[PITCH_STATUS_IN_PROGRESS, PITCH_STATUS_SELECTED].includes(pitch.status)}
                onClick={() => onMarkInProgress(pitch.id)}
                className="w-full"
              >
                Mark in progress
              </Button>
              <Button variant="ghost" disabled={[PITCH_STATUS_SELECTED, PITCH_STATUS_ON_HOLD].includes(pitch.status)} onClick={() => onHold(pitch.id)} className="w-full">Put on hold</Button>
              {canDeletePitch && pitch.status !== PITCH_STATUS_SELECTED ? <Button variant="danger" icon="trash" onClick={() => onDelete(pitch.id)} className="w-full">Delete pitch</Button> : null}
            </div>
          </div>
          ) : null}
        </aside>
      </div>
      <ApprovePitchModal
        open={approvalOpen}
        pitch={pitch}
        submitting={approvalSubmitting}
        onClose={() => {
          if (!approvalSubmitting) setApprovalOpen(false);
        }}
        onApprove={approvePitch}
      />
      <AnimatePresence>
        {editOpen && pitch ? (
          <PitchEditModal
            pitch={pitch}
            submitting={editSubmitting}
            onClose={() => {
              if (!editSubmitting) setEditOpen(false);
            }}
            onSave={savePitchEdits}
          />
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

function ApprovePitchModal({ open, pitch, submitting, onClose, onApprove }) {
  const [dueDate, setDueDate] = useState(defaultApprovalDueDate());
  const [message, setMessage] = useState("");
  const [inviteEmails, setInviteEmails] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setDueDate(defaultApprovalDueDate());
    setMessage("");
    setInviteEmails("");
    setError("");
  }, [open, pitch?.id]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose, submitting]);

  if (!open || !pitch) return null;

  const submitApproval = () => {
    if (!dueDate) {
      setError("Set a due date before selecting this pitch.");
      return;
    }
    setError("");
    onApprove({
      dueDate,
      deadline: dueDate,
      approvalDueDate: dueDate,
      approvalMessage: message.trim(),
      inviteEmails: inviteEmails.trim(),
    });
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="approve-pitch-title"
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-lg rounded-2xl border border-white/[0.12] bg-zinc-950 p-5 shadow-2xl shadow-black/60"
        >
          <div>
            <h2 id="approve-pitch-title" className="text-lg font-semibold text-zinc-50">Select for story</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">{pitch.title}</p>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block text-sm font-medium text-zinc-300">
              Due date
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-white/[0.1] bg-black/25 px-3 text-sm text-zinc-200 outline-none focus:border-white/[0.24]"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-300">
              Optional message
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                className="mt-2 w-full resize-none rounded-xl border border-white/[0.1] bg-black/25 px-3 py-2 text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-white/[0.24]"
                placeholder="Add context for the writer or invited users"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-300">
              Invite users
              <textarea
                value={inviteEmails}
                onChange={(event) => setInviteEmails(event.target.value)}
                rows={2}
                className="mt-2 w-full resize-none rounded-xl border border-white/[0.1] bg-black/25 px-3 py-2 text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-white/[0.24]"
                placeholder="Emails separated by commas"
              />
            </label>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" disabled={submitting} onClick={onClose}>Cancel</Button>
            <Button disabled={submitting} onClick={submitApproval}>{submitting ? "Selecting..." : "Select pitch"}</Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
function PitchItemMenu({ label, open, onToggle, onEdit, onDelete }) {
  return (
    <div className="relative shrink-0" data-pitch-action-menu>
      <button
        type="button"
        aria-label={label}
        onClick={onToggle}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
      >
        <Icon name="more" className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 top-9 z-20 w-32 overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-950/95 p-1 shadow-2xl shadow-black/40 backdrop-blur">
          <button type="button" onClick={onEdit} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/[0.06] hover:text-zinc-50">
            Edit
          </button>
          <button type="button" onClick={onDelete} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-300 hover:bg-rose-400/10 hover:text-rose-200">
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PitchProperty({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-zinc-500">{label}</span>
      <div className="min-w-0 text-right text-sm font-medium text-zinc-300">{children}</div>
    </div>
  );
}

function PitchRoundCreateModal({ submitting = false, onClose, onCreate }) {
  const [name, setName] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!submitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-pitch-round-title"
    >
      <motion.form
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0b0c10] p-5 shadow-2xl shadow-black"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onCreate(name);
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="new-pitch-round-title" className="text-lg font-semibold text-zinc-50">New round</h2>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Close new round" className="rounded-lg px-2 py-1 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200 disabled:opacity-45">x</button>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-zinc-300">Name</span>
          <input
            required
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-white/[0.18]"
            placeholder="May pitches"
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" disabled={submitting} onClick={onClose}>Cancel</Button>
          <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-xl bg-zinc-100 px-3.5 py-2 text-sm font-medium text-black transition hover:bg-white disabled:cursor-wait disabled:opacity-45">
            {submitting ? "Creating..." : "Create round"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function PitchCreateModal({ onClose, onCreate, sections = [] }) {
  const [draft, setDraft] = useState({
    title: "",
    angle: "",
    notes: "",
    section: "News",
  });

  const updateDraft = (field, value) => {
    setDraft((previous) => ({ ...previous, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.form
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#0b0c10] p-5 shadow-2xl shadow-black"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onCreate(draft);
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-50">New pitch</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200">x</button>
        </div>

        <div className="grid gap-4">
          <SectionCombobox
            value={draft.section}
            options={sections}
            onChange={(value) => updateDraft("section", value)}
          />

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Title</span>
            <input
              required
              value={draft.title}
              onChange={(event) => updateDraft("title", event.target.value)}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-white/[0.18]"
              placeholder="Title"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Description</span>
            <textarea
              required
              rows={4}
              value={draft.angle}
              onChange={(event) => updateDraft("angle", event.target.value)}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/25 px-3 py-3 text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-white/[0.18]"
              placeholder="What is the story?"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Additional notes</span>
            <textarea
              rows={3}
              value={draft.notes}
              onChange={(event) => updateDraft("notes", event.target.value)}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/25 px-3 py-3 text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-white/[0.18]"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-zinc-100 px-3.5 py-2 text-sm font-medium text-black transition hover:bg-white">
            Create pitch
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function PitchEditModal({ pitch, submitting = false, onClose, onSave }) {
  const [draft, setDraft] = useState({
    title: pitch?.title || "",
    angle: pitch?.angle || "",
    notes: pitch?.notes || "",
    section: pitch?.section || "News",
  });

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, submitting]);

  const updateDraft = (field, value) => {
    setDraft((previous) => ({ ...previous, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!submitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-pitch-title"
    >
      <motion.form
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#0b0c10] p-5 shadow-2xl shadow-black"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draft);
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="edit-pitch-title" className="text-lg font-semibold text-zinc-50">Edit pitch</h2>
            <p className="mt-1 text-sm text-zinc-500">Revise the reporting plan before submitting it for review.</p>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Close pitch editor" className="rounded-lg px-2 py-1 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200 disabled:opacity-45">x</button>
        </div>

        <div className="grid gap-4">
          <label className="block max-w-xs">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Section</span>
            <AnimatedOptionDropdown
              value={draft.section}
              options={PITCH_SECTIONS.filter((option) => option !== "All sections")}
              onChange={(value) => updateDraft("section", value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Title</span>
            <input
              required
              autoFocus
              value={draft.title}
              onChange={(event) => updateDraft("title", event.target.value)}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-white/[0.18]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Angle</span>
            <textarea
              required
              rows={4}
              value={draft.angle}
              onChange={(event) => updateDraft("angle", event.target.value)}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/25 px-3 py-3 text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-white/[0.18]"
              placeholder="What is the story, and why now?"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Additional notes</span>
            <textarea
              rows={3}
              value={draft.notes}
              onChange={(event) => updateDraft("notes", event.target.value)}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/25 px-3 py-3 text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-white/[0.18]"
              placeholder="Interview ideas, possible sources, visuals, or questions to check."
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" disabled={submitting} onClick={onClose}>Cancel</Button>
          <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-xl bg-zinc-100 px-3.5 py-2 text-sm font-medium text-black transition hover:bg-white disabled:cursor-wait disabled:opacity-45">
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function PipelinePage({ articles, updateArticleStatus, setSelectedArticleId, setPage }) {
  const columns = ["Idea", "Reporting", "Drafting", "Editing", "Ready", "Published"];
  return (
    <PageShell title="Story pipeline" eyebrow="Workflow / Editorial board" right={<div className="flex gap-2"><Button variant="ghost" icon="filter">Filter</Button><Button icon="plus">New story</Button></div>}>
      <div className="grid min-h-[650px] gap-4 overflow-x-auto xl:grid-cols-6">
        {columns.map((column) => (
          <div key={column} className="min-w-[250px] rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-sm font-medium text-zinc-300">{column}</h2>
              <span className="rounded-full bg-white/[0.06] px-2 py-1 text-xs text-zinc-500">{articles.filter((a) => a.status === column).length}</span>
            </div>
            <div className="space-y-3">
              {articles.filter((a) => a.status === column).map((article) => (
                <StoryCard key={article.id} article={article} columns={columns} updateArticleStatus={updateArticleStatus} open={() => { setSelectedArticleId(article.id); setPage("articles"); }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function StoryCard({ article, columns, updateArticleStatus, open }) {
  return (
    <Card className="p-4 transition hover:bg-white/[0.055]">
      <button type="button" onClick={open} className="w-full text-left">
        <div className="mb-3 flex items-center justify-between">
          <StatusBadge tone={article.priority === "High" ? "amber" : "neutral"}>{article.priority}</StatusBadge>
          <span className="text-xs text-zinc-600">{formatDisplayDate(article.deadline) || article.deadline}</span>
        </div>
        <h3 className="line-clamp-2 text-sm font-medium leading-5 text-zinc-100">{article.title}</h3>
        <p className="mt-2 text-xs text-zinc-500">{article.section} - {article.editor}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-600">
          <span>{article.interviews} interviews</span>
          <span>{article.authors.join(", ")}</span>
        </div>
      </button>
      <Select value={article.status} onChange={(status) => updateArticleStatus(article.id, status)} options={columns} label={`Change status for ${article.title}`} className="mt-3" />
    </Card>
  );
}

function StoriesPage({ stories, loading = false, error = "", currentUser, csrfToken = "", updateStoryStatus, updateStoryDocLink, clearStoryAttachment, uploadStoryAttachment, attachDriveFileToStory, inviteStoryCollaborators, removeStoryCollaborator, setToast, createStory }) {
  const [query, setQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState("All sections");
  const [detailStoryId, setDetailStoryId] = useState(initialStoryDetailId);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const syncFromPath = () => setDetailStoryId(initialStoryDetailId());
    window.addEventListener("popstate", syncFromPath);
    window.addEventListener("falcon-route-change", syncFromPath);
    return () => {
      window.removeEventListener("popstate", syncFromPath);
      window.removeEventListener("falcon-route-change", syncFromPath);
    };
  }, []);

  const scopedStories = useMemo(() => stories.filter((story) => storyVisibleToUser(story, currentUser)), [stories, currentUser]);
  const activeStories = useMemo(() => scopedStories.filter(isActiveStory), [scopedStories]);
  const storySectionOptions = useMemo(
    () => uniqueTextValues([
      ...STORY_FILTER_SECTIONS.filter((option) => option !== "All sections"),
      ...stories.map((story) => story.section),
    ]),
    [stories]
  );
  const visibleStories = useMemo(
    () =>
      activeStories.filter((story) => {
        return storyMatchesFilters(story, query, "All statuses", sectionFilter);
      }),
    [activeStories, query, sectionFilter]
  );
  const detailStory = scopedStories.find((story) => story.id === detailStoryId) || null;

  const copyStoryDoc = async (story, attachment = null) => {
    const copyUrl = storyAttachmentCopyUrl(story, attachment);
    if (!copyUrl) {
      setToast("This story does not have an attached link or file yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(copyUrl);
      setToast("Copied link.");
    } catch {
      setToast("Could not copy the link from this browser.");
    }
  };

  const navigateToStories = () => {
    setDetailStoryId(null);
    pushAppPath("/stories");
  };

  const navigateToStory = (story) => {
    setDetailStoryId(story.id);
    pushAppPath(storyDetailPath(story.id));
  };

  if (detailStoryId && loading) {
    return (
      <PageShell title="Loading story" eyebrow="Stories" titleAction={<Button variant="ghost" onClick={navigateToStories}>Back</Button>}>
        <StateMessage icon="article" title="Loading story" body="Pulling the latest draft, comments, and workflow state." />
      </PageShell>
    );
  }

  if (detailStoryId && error) {
    return (
      <PageShell title="Story unavailable" eyebrow="Stories" titleAction={<Button variant="ghost" onClick={navigateToStories}>Back</Button>}>
        <StateMessage icon="article" title="Could not load story" body={error} />
      </PageShell>
    );
  }

  if (detailStoryId) {
    return (
      <StoryDetailPage
        story={detailStory}
        onBack={navigateToStories}
        currentUser={currentUser}
        csrfToken={csrfToken}
        updateStoryStatus={updateStoryStatus}
        updateStoryDocLink={updateStoryDocLink}
        clearStoryAttachment={clearStoryAttachment}
        uploadStoryAttachment={uploadStoryAttachment}
        attachDriveFileToStory={attachDriveFileToStory}
        inviteStoryCollaborators={inviteStoryCollaborators}
        removeStoryCollaborator={removeStoryCollaborator}
        copyStoryDoc={copyStoryDoc}
        setToast={setToast}
      />
    );
  }

  const canCreateStory = normalizeAppRole(currentUser?.role) !== "guest";

  return (
    <>
      <PageShell
        title="Stories"
        className="max-w-[1380px]"
        right={canCreateStory ? <Button icon="plus" onClick={() => setCreateOpen(true)}>Add story</Button> : null}
      >
        <section className="mb-5 grid gap-3 xl:grid-cols-[minmax(260px,1fr)_180px] xl:items-center">
          <Input value={query} onChange={setQuery} placeholder="Search title, writer, section, or next step" className="h-10" />
          <AnimatedOptionDropdown value={sectionFilter} onChange={setSectionFilter} options={["All sections", ...storySectionOptions]} className="w-full" />
        </section>

      {loading ? (
        <StateMessage icon="article" title="Loading stories" body="Pulling story assignments from MongoDB." />
      ) : error ? (
        <StateMessage icon="article" title="Stories unavailable" body={error} />
      ) : null}

        <section className="grid gap-4 lg:grid-cols-3" aria-label="Story workflow board">
          {!loading && !error && STORY_WORKFLOW_COLUMNS.map((column) => {
            const columnStories = visibleStories.filter((story) => column.statuses.includes(story.status));
            return (
              <StoryKanbanColumn
                key={column.id}
                column={column}
                stories={columnStories}
                total={activeStories.filter((story) => column.statuses.includes(story.status)).length}
                onOpenStory={navigateToStory}
              />
            );
          })}
        </section>
      </PageShell>

      <AnimatePresence>
        {createOpen ? (
          <StoryCreateModal
            onClose={() => setCreateOpen(false)}
            sections={storySectionOptions}
            onCreate={async (draft) => {
              const created = await createStory(draft);
              if (created) setCreateOpen(false);
              return created;
            }}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function StoryCreateModal({ onClose, onCreate, sections = [] }) {
  const [draft, setDraft] = useState({
    title: "",
    section: "News",
    summary: "",
    deadline: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const updateDraft = (field, value) => {
    setDraft((previous) => ({ ...previous, [field]: value }));
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onCreate(draft);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <motion.form
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#0b0c10] p-5 shadow-2xl shadow-black"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-story-title"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="create-story-title" className="text-lg font-semibold text-zinc-50">Add story</h2>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Close story form" className="rounded-lg px-2 py-1 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200 disabled:opacity-45">x</button>
        </div>

        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Title</span>
            <input
              required
              autoFocus
              value={draft.title}
              onChange={(event) => updateDraft("title", event.target.value)}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-white/[0.18]"
            />
          </label>

          <SectionCombobox
            value={draft.section}
            options={sections}
            onChange={(value) => updateDraft("section", value)}
          />

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Summary</span>
            <textarea
              rows={4}
              value={draft.summary}
              onChange={(event) => updateDraft("summary", event.target.value)}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/25 px-3 py-3 text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-white/[0.18]"
              placeholder="What is this story about?"
            />
          </label>

          <label className="block max-w-xs">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Due date</span>
            <input
              type="date"
              value={draft.deadline}
              onChange={(event) => updateDraft("deadline", event.target.value)}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 text-sm text-zinc-200 outline-none focus:border-white/[0.18]"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add story"}</Button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function StoryKanbanColumn({ column, stories, total, onOpenStory }) {
  return (
    <section className="min-w-0 rounded-xl border border-white/[0.08] bg-white/[0.025]">
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-3 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-100">{column.title}</h2>
          <p className="mt-1 text-xs leading-5 text-zinc-500">{column.description}</p>
        </div>
        <span className="text-xs font-medium text-zinc-500">{total}</span>
      </div>
      <div className="space-y-2 p-2">
        {stories.map((story) => (
          <StoryOverviewCard key={story.id} story={story} onOpen={() => onOpenStory(story)} />
        ))}
        {!stories.length ? (
          <div className="rounded-lg border border-dashed border-white/[0.08] px-3 py-8 text-center text-sm text-zinc-600">
            No stories in this lane.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function StoryOverviewCard({ story, onOpen }) {
  const authorNames = storyAuthorNames(story);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-lg border border-white/[0.07] bg-black/20 px-3 py-2.5 text-left transition hover:border-white/[0.16] hover:bg-white/[0.045] focus:outline-none focus:ring-2 focus:ring-white/15"
      aria-label={`Open story ${story.title}`}
    >
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-medium leading-5 text-zinc-100">{story.title}</h3>
        <p className="mt-1 break-words text-xs leading-5 text-zinc-500">By {authorNames.length ? authorNames.join(", ") : "Unassigned"}</p>
      </div>
      <div className="flex h-full items-center">
        <span className="inline-flex h-8 w-8 items-center justify-center text-zinc-500 transition group-hover:text-zinc-100">
          <Icon name="chevron" className="h-4 w-4 -rotate-90" />
        </span>
      </div>
    </button>
  );
}

function StoryDetailPage({ story, onBack, currentUser, csrfToken = "", updateStoryStatus, updateStoryDocLink, clearStoryAttachment, uploadStoryAttachment, attachDriveFileToStory, inviteStoryCollaborators, removeStoryCollaborator, copyStoryDoc, setToast }) {
  const [draftDocUrl, setDraftDocUrl] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [attachmentDialog, setAttachmentDialog] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [openingDrivePicker, setOpeningDrivePicker] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [publicationOpen, setPublicationOpen] = useState(false);
  const [publicationUrl, setPublicationUrl] = useState("");
  const [publicationError, setPublicationError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const attachmentMenuRef = useRef(null);

  useEffect(() => {
    setDraftDocUrl("");
    setCommentDraft("");
    setAttachmentMenuOpen(false);
    setAttachmentDialog(null);
    setUploadingAttachment(false);
    setOpeningDrivePicker(false);
    setInviteDialogOpen(false);
    setPublicationOpen(false);
    setPublicationUrl(asText(story?.publicationUrl));
    setPublicationError("");
    setPublishing(false);
  }, [story?.id]);

  useEffect(() => {
    if (!attachmentMenuOpen) return undefined;
    const closeOnOutsidePointer = (event) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target)) {
        setAttachmentMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [attachmentMenuOpen]);

  const storyActivity = useWorkflowActivity("story", story?.id || "", story?.status || "");
  const storyComments = useEntityFeedback("story", story?.id || "", story?.status || "");

  if (!story) {
    return (
      <PageShell
        title="Story unavailable"
        eyebrow="Stories"
        description="This story may have been removed from the active queue."
        titleAction={<Button variant="ghost" onClick={onBack}>Back</Button>}
      >
        <StateMessage icon="article" title="Story not found" body="Return to the Stories board and choose another active story." />
      </PageShell>
    );
  }

  const attachments = storyAttachmentItems(story);
  const workflowAction = storyWorkflowAction(story);
  const canManageStory = canManageEditorialWorkflow(currentUser?.role);
  const canAttachContent = canEditStoryAttachment(currentUser, story);
  const canCommentStory = canCommentOnStory(currentUser, story);
  const canManageCollaborators = canManageStoryCollaborators(currentUser, story);
  const hasSubmissionWork = attachments.length > 0;
  const canUseWriterSubmission = canUpdateOwnStorySubmission(currentUser, story) && Boolean(workflowAction);
  const canClickSubmitStory = canUseWriterSubmission && (workflowAction.nextStatus !== "Submitted" || hasSubmissionWork);
  const currentRole = normalizeAppRole(currentUser?.role);
  const canStartReview = canManageStory && story.status === "Submitted";
  const canReturnStory = canManageStory && story.status === "In Review";
  const canSendToTeacherApproval = canManageStory && story.status === "In Review";
  const canPublishStory = currentRole === "admin" && story.status === "Ready for Publish";
  const commentItems = [
    ...storyFeedbackItems(story),
    ...(Array.isArray(story.comments) ? story.comments : []),
    ...storyComments.feedback,
  ];
  const dueDateLabel = storyDueDateLabel(story);
  const { activity: activityItems, loading: activityLoading, error: activityError } = storyActivity;
  const { loading: commentsLoading, error: commentsError } = storyComments;

  const openAttachmentDialog = (mode) => {
    setAttachmentMenuOpen(false);
    setAttachmentDialog(mode);
    const linkedAttachment = attachments.find((item) => item.type === "link");
    setDraftDocUrl(linkedAttachment?.url || "");
  };

  const linkStoryDoc = async (url) => {
    const nextUrl = url.trim();
    if (!isValidHttpUrl(nextUrl)) {
      setToast("Paste a valid http or https link.");
      return;
    }
    const saved = await updateStoryDocLink(story.id, nextUrl);
    if (saved) {
      setDraftDocUrl("");
      setAttachmentDialog(null);
    }
  };

  const uploadStoryFile = async (files) => {
    const selectedFiles = (
      Array.isArray(files) || typeof files?.length === "number"
        ? Array.from(files || [])
        : files ? [files] : []
    ).filter(Boolean);
    if (!selectedFiles.length) {
      setToast("Choose at least one file before uploading.");
      return;
    }
    setUploadingAttachment(true);
    let uploadedCount = 0;
    for (const file of selectedFiles) {
      const saved = await uploadStoryAttachment(story.id, file);
      if (!saved) break;
      uploadedCount += 1;
    }
    setUploadingAttachment(false);
    if (uploadedCount === selectedFiles.length) {
      setAttachmentDialog(null);
      if (selectedFiles.length > 1) setToast(`Uploaded ${selectedFiles.length} files.`);
    }
  };

  const openDrivePicker = async () => {
    if (!canAttachContent || openingDrivePicker) return;
    setAttachmentMenuOpen(false);
    setOpeningDrivePicker(true);
    try {
      const [configResponse, tokenResponse] = await Promise.all([
        fetch(`${API_BASE}/api/drive/picker-config?next=${encodeURIComponent(window.location.pathname)}`, {
          headers: { Accept: "application/json" },
          credentials: "include",
        }),
        fetch(`${API_BASE}/api/drive/picker-token?next=${encodeURIComponent(window.location.pathname)}`, {
          headers: { Accept: "application/json" },
          credentials: "include",
        }),
      ]);
      const config = await configResponse.json().catch(() => ({}));
      const tokenPayload = await tokenResponse.json().catch(() => ({}));
      if (!configResponse.ok || !config.enabled) {
        throw new Error(config.error || "Google Drive picker is not configured.");
      }
      if (!tokenResponse.ok || !tokenPayload.ok || !tokenPayload.accessToken) {
        if (tokenPayload.reauthUrl) {
          window.location.assign(tokenPayload.reauthUrl);
          return;
        }
        throw new Error(tokenPayload.error || "Sign in with Google again to use Drive attachments.");
      }

      await loadGooglePickerApi();
      const pickerApi = window.google?.picker;
      if (!pickerApi) throw new Error("Google Picker is unavailable.");

      const docsView = new pickerApi.DocsView(pickerApi.ViewId.DOCS)
        .setIncludeFolders(false)
        .setSelectFolderEnabled(false);
      const picker = new pickerApi.PickerBuilder()
        .setDeveloperKey(config.apiKey)
        .setAppId(config.appId)
        .setOAuthToken(tokenPayload.accessToken)
        .setOrigin(window.location.origin)
        .enableFeature(pickerApi.Feature.MULTISELECT_ENABLED)
        .addView(docsView)
        .setCallback(async (data) => {
          if (data[pickerApi.Response.ACTION] !== pickerApi.Action.PICKED) return;
          const pickedDocs = data[pickerApi.Response.DOCUMENTS] || [];
          if (!pickedDocs.length) return;
          let attachedCount = 0;
          for (const picked of pickedDocs) {
            const saved = await attachDriveFileToStory(story.id, {
              fileId: picked[pickerApi.Document.ID] || picked.id,
              name: picked[pickerApi.Document.NAME] || picked.name,
              mimeType: picked[pickerApi.Document.MIME_TYPE] || picked.mimeType,
              url: picked[pickerApi.Document.URL] || picked.url,
            });
            if (saved) attachedCount += 1;
          }
          if (!attachedCount) setToast("Google Drive files were selected, but they could not be attached.");
          if (attachedCount > 1) setToast(`Attached ${attachedCount} Google Drive files.`);
        })
        .build();
      picker.setVisible(true);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not open Google Drive picker.");
    } finally {
      setOpeningDrivePicker(false);
    }
  };

  const addComment = async () => {
    const text = commentDraft.trim();
    if (!canCommentStory) {
      setToast("You can only comment on stories you can access.");
      return;
    }
    if (!text) {
      setToast("Write a comment before adding it.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          entityType: "story",
          entityId: story.id,
          text,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Could not add comment.");
      }
      const nextComment = normalizeDisplayFeedback(payload.feedback || { id: `story-comment-${Date.now()}`, text, author: accountDisplayName(currentUser), time: "Just now" });
      storyComments.setFeedback((previous) => [nextComment, ...previous]);
      setCommentDraft("");
      setToast("Added comment.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not add comment.");
    }
  };

  const publishStory = async () => {
    const nextUrl = publicationUrl.trim();
    if (!isValidHttpUrl(nextUrl)) {
      setPublicationError("Enter the published story’s full http or https URL.");
      return;
    }
    setPublishing(true);
    setPublicationError("");
    const saved = await updateStoryStatus(story.id, "Published", { publicationUrl: nextUrl });
    setPublishing(false);
    if (saved) setPublicationOpen(false);
  };

  return (
    <div className="mx-auto max-w-[1380px] px-5 py-6 md:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <article className="min-w-0" aria-labelledby="story-detail-title">
          <header className="border-b border-white/[0.14] pb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 id="story-detail-title" className="break-words text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">{story.title}</h1>
                <p className="mt-3 text-sm font-medium text-zinc-300">{storyAuthorNames(story).join(", ") || "Unassigned"} | {story.section}</p>
                {dueDateLabel ? <p className="mt-2 text-sm text-zinc-500">Due {dueDateLabel}</p> : null}
              </div>
              {canManageCollaborators ? (
                <Button variant="ghost" onClick={() => setInviteDialogOpen(true)} className="shrink-0">
                  Invite users
                </Button>
              ) : null}
            </div>
          </header>

          <section className="border-b border-white/[0.12] py-8">
            <h2 className="text-sm font-semibold text-zinc-100">Story summary</h2>
            <p className="mt-4 max-w-3xl break-words text-lg leading-8 text-zinc-100">{story.summary}</p>
          </section>

          <section className="py-8">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-50">Activity</h2>
            <div className="mt-5 space-y-4">
              {activityLoading ? (
                <p className="text-sm text-zinc-600">Loading workflow activity...</p>
              ) : activityError ? (
                <p className="text-sm text-zinc-600">{activityError}</p>
              ) : activityItems.length ? activityItems.map((item, index) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={cx("mt-2 h-1.5 w-1.5 rounded-full", index === 0 ? "bg-zinc-300" : "bg-zinc-600")} />
                  <div className="min-w-0">
                    <p className={cx("break-words text-sm", index === 0 ? "font-medium text-zinc-300" : "text-zinc-500")}>{item.text}</p>
                    <p className="mt-1 text-xs text-zinc-600">{item.time}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-zinc-600">No workflow status changes recorded yet.</p>
              )}
            </div>
          </section>
        </article>

        <aside className="min-w-0 space-y-4">
          <section className="min-w-0 rounded-xl border border-white/[0.12] bg-white/[0.025] p-4 shadow-xl shadow-black/15">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-medium text-zinc-100">Your work</h2>
              <span className="text-sm text-zinc-500">{story.status}</span>
            </div>
            {attachments.length ? (
              <div className="space-y-2">
                {attachments.map((item) => (
                  <StoryAttachment
                    key={item.id || item.url}
                    story={story}
                    attachment={item}
                    onCopy={() => copyStoryDoc(story, item)}
                    onRemove={canAttachContent && item.id ? () => clearStoryAttachment(story.id, item.id) : null}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/[0.14] px-4 py-3 text-sm text-zinc-400" aria-label="Content unavailable">
                No work attached yet
              </div>
            )}

            {canAttachContent ? (
              <div ref={attachmentMenuRef} className="relative mt-4">
                <Button variant="ghost" icon="plus" onClick={() => setAttachmentMenuOpen((current) => !current)} className="w-full rounded-full">
                  Add or create
                </Button>
                {attachmentMenuOpen ? (
                  <div className="absolute right-0 top-11 z-20 w-full overflow-hidden rounded-xl border border-white/[0.1] bg-zinc-950/95 p-1 shadow-2xl shadow-black/40 backdrop-blur">
                    <button type="button" onClick={openDrivePicker} disabled={openingDrivePicker} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-zinc-50 disabled:cursor-wait disabled:text-zinc-600">
                      <Icon name="upload" className="h-4 w-4" />
                      {openingDrivePicker ? "Opening Drive" : "Google Drive"}
                    </button>
                    <button type="button" onClick={() => openAttachmentDialog("link")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-zinc-50">
                      <Icon name="link" className="h-4 w-4" />
                      Enter link
                    </button>
                    <button type="button" onClick={() => openAttachmentDialog("upload")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-zinc-50">
                      <Icon name="upload" className="h-4 w-4" />
                      File upload
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 space-y-2">
              {canStartReview ? (
                <Button onClick={() => updateStoryStatus(story.id, "In Review")} className="w-full rounded-full">Start editor review</Button>
              ) : null}
              {canReturnStory ? (
                <Button onClick={() => updateStoryStatus(story.id, "Returned")} className="w-full rounded-full">Return to writer</Button>
              ) : null}
              {canSendToTeacherApproval ? (
                <Button variant="ghost" onClick={() => updateStoryStatus(story.id, "Ready for Publish")} className="w-full rounded-full">Send to teacher approval</Button>
              ) : null}
              {canPublishStory ? (
                <Button onClick={() => setPublicationOpen((open) => !open)} className="w-full rounded-full">
                  {publicationOpen ? "Cancel publishing" : "Publish story"}
                </Button>
              ) : null}
              {canPublishStory && publicationOpen ? (
                <div className="rounded-xl border border-white/[0.1] bg-black/20 p-3">
                  <label htmlFor={`publication-url-${story.id}`} className="block text-sm font-medium text-zinc-300">Published story URL</label>
                  <input
                    id={`publication-url-${story.id}`}
                    type="url"
                    value={publicationUrl}
                    onChange={(event) => {
                      setPublicationUrl(event.target.value);
                      if (publicationError) setPublicationError("");
                    }}
                    placeholder="https://publication.example/story"
                    autoComplete="url"
                    aria-describedby={publicationError ? `publication-error-${story.id}` : undefined}
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.1] bg-black/25 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/[0.24]"
                  />
                  {publicationError ? <p id={`publication-error-${story.id}`} className="mt-2 text-sm text-rose-300">{publicationError}</p> : null}
                  <Button disabled={publishing} onClick={publishStory} className="mt-3 w-full rounded-full">
                    {publishing ? "Publishing..." : "Confirm publication"}
                  </Button>
                </div>
              ) : null}
              {canUseWriterSubmission ? (
                <Button
                  onClick={() => updateStoryStatus(story.id, workflowAction.nextStatus)}
                  disabled={!canClickSubmitStory}
                  className="w-full rounded-full"
                >
                  {workflowAction.label}
                </Button>
              ) : null}
            </div>
          </section>

          {canCommentStory ? (
          <section className="min-w-0 rounded-xl border border-white/[0.12] bg-white/[0.025] p-4 shadow-xl shadow-black/15">
            <h2 className="text-base font-medium text-zinc-100">Private comments</h2>
            <div className="mt-4 space-y-3">
              {commentItems.map((comment) => (
                <div key={comment.id} className="border-b border-white/[0.08] pb-3 last:border-b-0 last:pb-0">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium text-zinc-300">{comment.author}</span>
                    <span className="shrink-0 text-xs text-zinc-600">{comment.time}</span>
                  </div>
                  <p className="break-words text-sm leading-6 text-zinc-500">{comment.text}</p>
                </div>
              ))}
              {commentsLoading ? <p className="text-sm text-zinc-600">Loading comments...</p> : null}
              {commentsError ? <p className="text-sm text-zinc-600">{commentsError}</p> : null}
              {!commentsLoading && !commentsError && !commentItems.length ? (
                <p className="text-sm text-zinc-600">No comments yet.</p>
              ) : null}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                placeholder="Add comment..."
                className="h-10 min-w-0 flex-1 rounded-full border border-white/[0.14] bg-transparent px-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/[0.28]"
              />
              <button
                type="button"
                onClick={addComment}
                aria-label="Add comment"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/[0.12] text-zinc-400 transition hover:border-white/[0.24] hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <Icon name="plus" className="h-4 w-4" />
              </button>
            </div>
          </section>
          ) : null}
        </aside>
      </div>
      <AnimatePresence>
        {inviteDialogOpen ? (
          <StoryInviteDialog
            story={story}
            collaborators={story.collaborators || []}
            onClose={() => setInviteDialogOpen(false)}
            onInvite={(invite) => inviteStoryCollaborators?.(story.id, invite)}
            onRemove={(email) => removeStoryCollaborator?.(story.id, email)}
          />
        ) : null}
        {attachmentDialog ? (
          <StoryAttachmentDialog
            mode={attachmentDialog}
            story={story}
            value={draftDocUrl}
            onValueChange={setDraftDocUrl}
            uploading={uploadingAttachment}
            onClose={() => setAttachmentDialog(null)}
            onSubmitLink={linkStoryDoc}
            onSubmitFile={uploadStoryFile}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function StoryInviteDialog({ story, collaborators = [], onClose, onInvite, onRemove }) {
  const [emails, setEmails] = useState("");
  const [role] = useState("edit");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingEmail, setRemovingEmail] = useState("");
  const [error, setError] = useState("");
  const inviteCount = Array.isArray(collaborators) ? collaborators.length : 0;

  const submitInvite = async (event) => {
    event.preventDefault();
    const nextEmails = emails.trim();
    if (!nextEmails) {
      setError("Enter at least one email address.");
      return;
    }
    setSaving(true);
    setError("");
    const updated = await onInvite?.({ emails: nextEmails, role, message: message.trim() });
    setSaving(false);
    if (updated) {
      setEmails("");
      setMessage("");
    } else {
      setError("Invite could not be sent.");
    }
  };

  const removeCollaborator = async (email) => {
    if (!email || removingEmail) return;
    setRemovingEmail(email);
    setError("");
    const updated = await onRemove?.(email);
    if (!updated) setError("Collaborator could not be removed.");
    setRemovingEmail("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.form
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        onClick={(event) => event.stopPropagation()}
        onSubmit={submitInvite}
        className="w-full max-w-xl rounded-xl border border-white/[0.13] bg-[#0d0e12] p-5 shadow-2xl shadow-black"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-50">Invite collaborators</h2>
            <p className="mt-1 truncate text-sm text-zinc-600">{story.title}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200" aria-label="Close invite dialog">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-300">Email addresses</span>
            <input
              autoFocus
              value={emails}
              onChange={(event) => setEmails(event.target.value)}
              placeholder="Enter email addresses"
              className="h-12 w-full rounded-xl border border-white/[0.14] bg-black/20 px-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/[0.28]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-300">Message (optional)</span>
            <div className="relative">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value.slice(0, 200))}
                placeholder="Add a message..."
                rows={4}
                className="w-full resize-none rounded-xl border border-white/[0.14] bg-black/20 px-4 py-3 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/[0.28]"
              />
              <span className="absolute bottom-3 right-4 text-xs text-zinc-600">{message.length}/200</span>
            </div>
          </label>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-zinc-300">Collaborators</h3>
          <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.12]">
            {inviteCount ? collaborators.map((collaborator) => (
              <div key={collaborator.email || collaborator.id} className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3 last:border-b-0">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.08] text-xs font-semibold text-zinc-100">
                  {accountInitials(collaborator)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-100">{collaborator.email}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{collaborator.status === "pending" ? "Invitation pending" : storyCollaboratorRoleLabel(collaborator.role)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeCollaborator(collaborator.email)}
                  disabled={removingEmail === collaborator.email}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-100 disabled:cursor-wait disabled:opacity-50"
                  aria-label={`Remove ${collaborator.email}`}
                >
                  <Icon name="x" className="h-4 w-4" />
                </button>
              </div>
            )) : (
              <p className="px-4 py-5 text-sm text-zinc-600">No additional authors yet.</p>
            )}
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving || Boolean(removingEmail)}>Cancel</Button>
          <button
            type="submit"
            disabled={saving || Boolean(removingEmail)}
            className="inline-flex items-center justify-center rounded-xl bg-zinc-100 px-5 py-2 text-sm font-semibold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Sending" : "Send invite"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
function StoryAttachmentDialog({ mode, story, value, onValueChange, uploading, onClose, onSubmitLink, onSubmitFile }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const isLinkMode = mode === "link";
  const selectedFileSummary = selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} files selected`;
  const selectedFileDetail = selectedFiles.length === 1
    ? formatFileSize(selectedFiles[0].size)
    : selectedFiles.map((file) => file.name).join(", ");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.form
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="w-full max-w-md rounded-xl border border-white/[0.12] bg-[#0d0e12] p-5 shadow-2xl shadow-black"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          if (isLinkMode) {
            onSubmitLink(value);
          } else {
            onSubmitFile(selectedFiles);
          }
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-zinc-50">{isLinkMode ? "Add link" : "Upload file"}</h2>
            <p className="mt-1 truncate text-sm text-zinc-500">{story.title}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200" aria-label="Close attachment dialog">
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>

        {isLinkMode ? (
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Link</span>
            <input
              autoFocus
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              placeholder="https://..."
              className="h-11 w-full rounded-xl border border-white/[0.1] bg-black/25 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/[0.26]"
            />
          </label>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.16] bg-black/20 px-4 py-8 text-center transition hover:border-white/[0.28] hover:bg-white/[0.03]">
            <Icon name="upload" className="mb-3 h-5 w-5 text-zinc-400" />
            <span className="max-w-full truncate text-sm font-medium text-zinc-200">{selectedFiles.length ? selectedFileSummary : "Choose files"}</span>
            <span className="mt-1 line-clamp-2 max-w-full break-words text-xs text-zinc-600">{selectedFiles.length ? selectedFileDetail : "PDF, document, image, or text file"}</span>
            <input
              type="file"
              multiple
              className="sr-only"
              onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
            />
          </label>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={uploading}>Cancel</Button>
          <button
            type="submit"
            disabled={uploading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 text-sm font-medium text-black transition hover:bg-white disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            <Icon name={isLinkMode ? "link" : "upload"} className="h-4 w-4" />
            {uploading ? "Uploading..." : isLinkMode ? "Attach link" : "Upload"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function StoryAttachment({ story, attachment: providedAttachment = null, onCopy, onRemove = null, compact = false }) {
  const attachment = providedAttachment || storyAttachmentInfo(story);
  if (!attachment) return null;

  const showTrailingIcon = !compact || attachment.type === "file";
  const showRemove = compact && Boolean(onRemove);
  const compactGridClass = showTrailingIcon ? "min-h-14 grid-cols-[minmax(0,1fr)_54px]" : "min-h-14 grid-cols-1";

  const attachmentDetails = (
    <div className={cx("min-w-0", compact ? "px-3 py-2.5" : "px-4 py-3")}>
      <div className="truncate text-sm font-medium text-zinc-100">{attachment.name}</div>
      <div className="mt-1 text-xs text-zinc-500">{attachment.detail}</div>
      {attachment.type === "drive" && drivePermissionText(attachment.permissionStatus) ? (
        <div className={cx(
          "mt-1 text-xs",
          attachment.permissionStatus === "failed" ? "text-amber-300" : "text-zinc-600"
        )}>
          {drivePermissionText(attachment.permissionStatus)}
        </div>
      ) : null}
    </div>
  );

  const trailingIcon = showTrailingIcon ? (
    <div className="grid place-items-center border-l border-white/[0.16] bg-white/[0.03] text-zinc-300">
      <Icon name={attachment.type === "file" ? "upload" : "link"} className="h-5 w-5" />
    </div>
  ) : null;

  if (showRemove) {
    return (
      <div className="grid min-h-14 min-w-0 grid-cols-[minmax(0,1fr)_44px] overflow-hidden rounded-xl border border-white/[0.16] bg-black/20">
        <a
          href={attachment.url}
          target="_blank"
          rel="noreferrer"
          className={cx(
            "grid min-w-0 text-left transition hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/20",
            showTrailingIcon ? "grid-cols-[minmax(0,1fr)_54px]" : "grid-cols-1"
          )}
        >
          {attachmentDetails}
          {trailingIcon}
        </a>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove attached work"
          className="grid h-full w-11 place-items-center border-l border-white/[0.16] bg-white/[0.015] text-zinc-400 transition hover:bg-white/[0.08] hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/20"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={cx("grid min-w-0 gap-3", compact ? "" : "sm:grid-cols-[minmax(0,1fr)_auto]")}>
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className={cx(
          "grid overflow-hidden rounded-xl border border-white/[0.16] bg-black/20 text-left transition hover:border-white/[0.26] hover:bg-white/[0.035] focus:outline-none focus:ring-2 focus:ring-white/20",
          compact ? compactGridClass : "min-h-16 grid-cols-[minmax(0,1fr)_64px]"
        )}
      >
        {attachmentDetails}
        {trailingIcon}
      </a>
      {compact || !attachment.copyable ? null : <Button variant="ghost" icon="link" onClick={onCopy} className="self-center">Copy link</Button>}
    </div>
  );
}
function StoryTextBlock({ label, children }) {
  return (
    <div>
      <div className="text-xs text-zinc-500">{label}</div>
      <p className="mt-2 break-words text-sm leading-6 text-zinc-300">{children}</p>
    </div>
  );
}

function StorySideLine({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-zinc-500">{label}</span>
      <span className="min-w-0 text-right font-medium text-zinc-200">{value}</span>
    </div>
  );
}

function ArticlesPage({ extractorOpen = false, setExtractorOpen = () => {}, setToast = () => {}, csrfToken = "" }) {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("All sections");
  const [dateSort, setDateSort] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sections, setSections] = useState(["All sections"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadArticles = async (signal) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(ARTICLE_PAGE_SIZE),
        search: query,
        section,
        sort: dateSort,
      });
      const response = await fetch(`${API_BASE}/api/article-records?${params.toString()}`, {
        headers: { Accept: "application/json" },
        credentials: "include",
        signal,
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Article API returned HTML instead of JSON. Make sure the v3 backend is running on port 5003.");
      }

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.ok !== true) {
        throw new Error(payload.error || `Failed to load articles (${response.status})`);
      }

      const records = Array.isArray(payload.articles)
        ? payload.articles.map(normalizeArticleRecord)
        : [];
      setArticles(records);
      setTotalRecords(Number(payload.total) || 0);
      setTotalPages(Math.max(1, Number(payload.totalPages) || 1));
      if (Number(payload.page) && Number(payload.page) !== currentPage) {
        setCurrentPage(Number(payload.page));
      }
      if (Array.isArray(payload.sections)) {
        setSections(["All sections", ...uniqueTextValues(payload.sections).filter((name) => name.toLowerCase() !== "all sections")]);
      }
      setSelectedArticle(null);
    } catch (err) {
      if (err.name === "AbortError") return;
      setArticles([]);
      setTotalRecords(0);
      setTotalPages(1);
      setSelectedArticle(null);
      setError(err.message || "Failed to load articles.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadArticles(controller.signal);
    return () => controller.abort();
  }, [currentPage, query, section, dateSort]);

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
  };

  const handleSectionChange = (value) => {
    setSection(value);
    setCurrentPage(1);
    setSelectedArticle(null);
  };

  const handleSearchChange = (value) => {
    setQuery(value);
    setCurrentPage(1);
    setSelectedArticle(null);
  };

  const handleDateSortChange = () => {
    setDateSort((current) => (current === "desc" ? "asc" : "desc"));
    setCurrentPage(1);
    setSelectedArticle(null);
  };

  const handlePageChange = (page) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    if (nextPage === currentPage) return;
    setCurrentPage(nextPage);
    setSelectedArticle(null);
  };

  const handleExtractorSaved = async (message) => {
    await loadArticles();
    setToast(message || "Saved extracted interviewees.");
  };

  const hasActiveArticleFilter = Boolean(query.trim()) || section !== "All sections";
  const paginationItems = buildPaginationItems(currentPage, totalPages);
  const resultCount = resultCountParts(currentPage, ARTICLE_PAGE_SIZE, totalRecords);

  return (
    <PageShell
      title="Articles database"
      eyebrow="Archive / Live articleRecords"
      right={
        <Button onClick={() => setExtractorOpen(true)}>
          Add with AI
        </Button>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
        <div>
          <div className="mb-4 flex flex-col gap-3 md:flex-row">
            <Input value={query} onChange={handleSearchChange} placeholder="Search title, author, section, or tag" className="flex-1" />
            <AnimatedDropdown
              text={section}
              items={sections.map((name) => ({ name, link: "#" }))}
              onSelect={(item) => handleSectionChange(item.name)}
              className="md:w-56"
            />
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.14em] text-zinc-600">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      onClick={handleDateSortChange}
                      className="inline-flex items-center gap-1.5 rounded-md text-left transition hover:text-zinc-300"
                      aria-label={`Sort by date published ${dateSort === "desc" ? "oldest to newest" : "newest to oldest"}`}
                    >
                      Date Published
                      <span className="text-zinc-600">{dateSort === "desc" ? "\u2193" : "\u2191"}</span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: ARTICLE_PAGE_SIZE }, (_, index) => (
                  <tr key={index} className="border-t border-white/[0.06]">
                    <td className="px-4 py-4">
                      <div className="h-4 w-4/5 animate-pulse rounded bg-white/[0.08]" />
                      <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-white/[0.05]" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-28 animate-pulse rounded bg-white/[0.06]" />
                    </td>
                  </tr>
                ))}
                {!loading && articles.map((article) => (
                  <tr
                    key={article.id}
                    onClick={() => handleArticleClick(article)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleArticleClick(article);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View article details for ${article.title}`}
                    className={cx(
                      "cursor-pointer border-t border-white/[0.06] hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/20",
                      selectedArticle?.id === article.id && "bg-white/[0.055]"
                    )}
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium text-zinc-100">{article.title}</div>
                      <div className="mt-1 text-xs text-zinc-500">{article.authors.length ? article.authors.join(", ") : "Byline unavailable"}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-zinc-500">{article.publishedAt || "Date unavailable"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && error && (
              <StateMessage
                icon="article"
                title="Could not load article records"
                body={error}
                action={<Button variant="ghost" onClick={() => loadArticles()}>Try again</Button>}
              />
            )}
            {!loading && !error && articles.length === 0 && (
              <StateMessage
                icon={hasActiveArticleFilter ? "search" : "article"}
                title={hasActiveArticleFilter ? "No matching articles" : "No articles found"}
                body={hasActiveArticleFilter ? "Try a different title, author, section, or tag search." : "No article records were returned by the database yet."}
              />
            )}
          </div>
          {!loading && !error && totalRecords > 0 && (
            <div className="mt-4 flex flex-col gap-3 px-1 pb-1 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
              <div>
                Showing{" "}
                <span className="font-semibold text-zinc-100">
                  {fmt(resultCount.start)}
                  {"\u2013"}
                  {fmt(resultCount.end)}
                </span>{" "}
                of <span className="font-semibold text-zinc-100">{fmt(resultCount.total)}</span>
              </div>
              <div className="flex items-center gap-2 md:justify-end">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 text-zinc-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  {"\u2039"}
                </button>
                {paginationItems.map((item) => item === "start-ellipsis" || item === "end-ellipsis" ? (
                  <span key={item} className="flex h-10 min-w-8 items-center justify-center px-1 text-zinc-600">...</span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handlePageChange(item)}
                    className={paginationPageButtonClass(item === currentPage)}
                    aria-current={item === currentPage ? "page" : undefined}
                  >
                    {item}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 text-zinc-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  {"\u203a"}
                </button>
              </div>
            </div>
          )}
        </div>
        <ArticleDetailPanel article={selectedArticle} loading={loading} />
      </div>
      <AnimatePresence>
        {extractorOpen && (
          <ArticleExtractorOverlay
            onClose={() => setExtractorOpen(false)}
            onSaved={handleExtractorSaved}
            csrfToken={csrfToken}
          />
        )}
      </AnimatePresence>
    </PageShell>
  );
}

function StateMessage({ icon, title, body, action }) {
  return (
    <div className="border-t border-white/[0.06] p-8 text-center">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-zinc-400">
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <h3 className="font-medium text-zinc-100">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function ArticleDetailPanel({ article, loading }) {
  if (loading) {
    return (
      <Card className="p-5">
        <div className="h-6 w-2/3 animate-pulse rounded bg-white/[0.08]" />
        <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-white/[0.05]" />
        <div className="mt-8 grid gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
          ))}
        </div>
      </Card>
    );
  }

  if (!article) {
    return (
      <Card className="flex min-h-[560px] items-center justify-center p-5">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-5 h-px w-16 bg-white/20" />
          <h3 className="text-lg font-semibold tracking-tight text-zinc-100">Select an article</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Article details, linked interviewees, tags, authors, and publication metadata will appear here.
          </p>
        </div>
      </Card>
    );
  }

  const canOpen = isValidHttpUrl(article.url);
  const articleLabelPills = uniqueTextValues([article.section, ...article.tags]);
  return (
    <Card className="p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold leading-7 tracking-tight text-zinc-50">{article.title}</h2>
          <p className="mt-2 text-sm text-zinc-400">{article.byline}</p>
          <p className="mt-1 text-sm text-zinc-600">{article.publishedAt || "Publish date unavailable"}</p>
        </div>
        {canOpen ? (
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3.5 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.07] hover:text-zinc-50"
          >
            <Icon name="link" className="h-4 w-4" />
            Open
          </a>
        ) : (
          <span className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-sm font-medium text-zinc-600">
            <Icon name="link" className="h-4 w-4" />
            No URL
          </span>
        )}
      </div>

      {articleLabelPills.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-600">Section / Tags</p>
          <div className="flex flex-wrap gap-2">
            {articleLabelPills.map((label, index) => (
              <StatusBadge key={label} tone="neutral">{label}</StatusBadge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="mb-3">
          <h3 className="font-medium text-zinc-50">Interviewees</h3>
        </div>
        {article.interviewees.length ? (
          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.14em] text-zinc-600">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">House</th>
                </tr>
              </thead>
              <tbody>
                {article.interviewees.map((person, index) => (
                  <tr key={person.id || `${person.name}-${index}`} className="border-t border-white/[0.06]">
                    <td className="px-4 py-4">
                      <div className="font-medium text-zinc-100">{person.name || "Name unavailable"}</div>
                    </td>
                    <td className="px-4 py-4 text-zinc-500">{person.grade || "-"}</td>
                    <td className="px-4 py-4 text-zinc-500">{person.house || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] p-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-zinc-500">
              <Icon name="people" className="h-5 w-5" />
            </div>
            <p className="font-medium text-zinc-200">No interviewees recorded for this article yet.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function IntervieweesPage({ currentUser, csrfToken = "", setToast = () => {} }) {
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("All grades");
  const [house, setHouse] = useState("All houses");
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateSort, setDateSort] = useState("desc");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const canManageSourceRecords = canManageEditorialWorkflow(currentUser?.role);

  const resetInspector = () => {
    setSelectedRecord(null);
    setEditing(false);
    setDraft(null);
    setSaveError("");
  };

  const loadSources = async (signal) => {
    setLoading(true);
    setError("");
    try {
      const [peopleResponse, articlesResponse] = await Promise.all([
        fetch(`${API_BASE}/api/interview-records`, {
          headers: { Accept: "application/json" },
          credentials: "include",
          signal,
        }),
        fetch(`${API_BASE}/api/article-records?page=1&limit=5000`, {
          headers: { Accept: "application/json" },
          credentials: "include",
          signal,
        }),
      ]);

      const peopleType = peopleResponse.headers.get("content-type") || "";
      const articleType = articlesResponse.headers.get("content-type") || "";
      if (!peopleType.includes("application/json") || !articleType.includes("application/json")) {
        throw new Error("Source APIs returned HTML instead of JSON. Make sure the v3 backend is running on port 5003.");
      }

      const [peoplePayload, articlesPayload] = await Promise.all([
        peopleResponse.json().catch(() => ({})),
        articlesResponse.json().catch(() => ({})),
      ]);

      if (!peopleResponse.ok || peoplePayload.ok !== true) {
        throw new Error(peoplePayload.error || `Failed to load interview records (${peopleResponse.status})`);
      }
      if (!articlesResponse.ok || articlesPayload.ok !== true) {
        throw new Error(articlesPayload.error || `Failed to load article records (${articlesResponse.status})`);
      }

      const nextRecords = buildInterviewRecordRows(
        Array.isArray(peoplePayload.people) ? peoplePayload.people : [],
        Array.isArray(articlesPayload.articles) ? articlesPayload.articles : []
      );
      setRecords(nextRecords);
      resetInspector();
      setCurrentPage(1);
    } catch (err) {
      if (err.name === "AbortError") return;
      setRecords([]);
      resetInspector();
      setError(err.message || "Failed to load source records.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadSources(controller.signal);
    return () => controller.abort();
  }, []);

  const gradeOptions = useMemo(() => buildGradeOptions(records), [records]);
  const houseOptions = useMemo(() => buildHouseOptions(records), [records]);
  const filtered = useMemo(
    () => records
      .filter((record) => interviewRecordMatchesFilters(record, query, grade, house))
      .sort((a, b) => sortByPublishedDate(a, b, dateSort)),
    [records, query, grade, house, dateSort]
  );
  const totalRecords = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / ARTICLE_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageRecords = filtered.slice((safeCurrentPage - 1) * ARTICLE_PAGE_SIZE, safeCurrentPage * ARTICLE_PAGE_SIZE);
  const resultCount = resultCountParts(safeCurrentPage, ARTICLE_PAGE_SIZE, totalRecords);
  const paginationItems = buildPaginationItems(safeCurrentPage, totalPages);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleSearchChange = (value) => {
    setQuery(value);
    setCurrentPage(1);
    resetInspector();
  };

  const handleGradeChange = (value) => {
    setGrade(value);
    setCurrentPage(1);
    resetInspector();
  };

  const handleHouseChange = (value) => {
    setHouse(value);
    setCurrentPage(1);
    resetInspector();
  };

  const handleDateSort = () => {
    setDateSort((value) => (value === "desc" ? "asc" : "desc"));
    setCurrentPage(1);
    resetInspector();
  };

  const handlePageChange = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    if (nextPage === safeCurrentPage) return;
    setCurrentPage(nextPage);
    resetInspector();
  };

  const handleRecordSelect = (record) => {
    setSelectedRecord(record);
    setEditing(false);
    setDraft(null);
    setSaveError("");
  };

  const handleEditStart = () => {
    if (!selectedRecord) return;
    setDraft({
      firstName: selectedRecord.firstName,
      lastName: selectedRecord.lastName,
      grade: selectedRecord.grade,
      house: selectedRecord.house,
    });
    setEditing(true);
    setSaveError("");
  };

  const handleEditCancel = () => {
    setEditing(false);
    setDraft(null);
    setSaveError("");
  };

  const handleSaveRecord = async () => {
    if (!selectedRecord || !draft) return;
    if (!canManageSourceRecords) {
      setSaveError("Only editors and admins can edit source records.");
      return;
    }
    setSaving(true);
    setSaveError("");
    const nextRecord = updateInterviewRecordRow(selectedRecord, draft);
    try {
      const response = await fetch(`${API_BASE}/api/interview-records/${encodeURIComponent(selectedRecord.id)}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          firstName: nextRecord.firstName,
          lastName: nextRecord.lastName,
          grade: nextRecord.grade === "Unknown" ? "" : nextRecord.grade,
          house: nextRecord.house === "Unknown" ? "" : nextRecord.house,
          url: nextRecord.article?.url || "",
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.ok !== true) {
        throw new Error(payload.error || `Failed to save record (${response.status})`);
      }
      setRecords((previous) => previous.map((record) => record.id === selectedRecord.id ? nextRecord : record));
      setSelectedRecord(nextRecord);
      setEditing(false);
      setDraft(null);
    } catch (err) {
      setSaveError(err.message || "Could not save the selected record.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!selectedRecord || deleting) return;
    if (!canManageSourceRecords) {
      setSaveError("Only editors and admins can delete source records.");
      return;
    }
    const confirmed = window.confirm(`Delete source record for ${selectedRecord.name}? This removes it from the interviewee database.`);
    if (!confirmed) return;

    setDeleting(true);
    setSaveError("");
    try {
      const response = await fetch(`${API_BASE}/api/interview-records/${encodeURIComponent(selectedRecord.id)}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.ok !== true) {
        throw new Error(payload.error || `Failed to delete record (${response.status})`);
      }
      setRecords((previous) => previous.filter((record) => record.id !== selectedRecord.id));
      resetInspector();
      setToast("Deleted source record.");
    } catch (err) {
      setSaveError(err.message || "Could not delete the selected record.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageShell title="Interviewees & source database" eyebrow="Sources / People">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="mb-4 grid gap-3 xl:grid-cols-[1fr_10rem_11rem]">
            <Input value={query} onChange={handleSearchChange} placeholder="Search name, grade, house, or article" />
            <AnimatedDropdown
              text={grade}
              items={gradeOptions.map((name) => ({ name, link: "#" }))}
              onSelect={(item) => handleGradeChange(item.name)}
            />
            <AnimatedDropdown
              text={house}
              items={houseOptions.map((name) => ({ name, link: "#" }))}
              onSelect={(item) => handleHouseChange(item.name)}
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            <table className="w-full table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[20%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[34%]" />
                <col className="w-[22%]" />
              </colgroup>
              <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.14em] text-zinc-600">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">House</th>
                  <th className="px-4 py-3">Article title</th>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      onClick={handleDateSort}
                      className="inline-flex items-center gap-1 whitespace-nowrap text-left transition hover:text-zinc-300"
                    >
                      Date published
                      <span className="text-zinc-600">{dateSort === "desc" ? "\u2193" : "\u2191"}</span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: ARTICLE_PAGE_SIZE }, (_, index) => (
                  <tr key={index} className="border-t border-white/[0.06]">
                    <td className="px-4 py-4"><div className="h-4 w-24 animate-pulse rounded bg-white/[0.08]" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-8 animate-pulse rounded bg-white/[0.05]" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 animate-pulse rounded bg-white/[0.05]" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-full max-w-56 animate-pulse rounded bg-white/[0.05]" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 animate-pulse rounded bg-white/[0.05]" /></td>
                  </tr>
                ))}
                {!loading && pageRecords.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() => handleRecordSelect(record)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleRecordSelect(record);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View source record for ${record.name}`}
                    className={cx(
                      "cursor-pointer border-t border-white/[0.06] transition hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/20",
                      selectedRecord?.id === record.id && "bg-white/[0.055]"
                    )}
                  >
                    <td className="min-w-0 px-4 py-4 align-top">
                      <div className="truncate font-medium text-zinc-100">{record.name}</div>
                    </td>
                    <td className="min-w-0 px-4 py-4 align-top text-zinc-500">
                      <div className="truncate">{record.grade || "Unknown"}</div>
                    </td>
                    <td className="min-w-0 px-4 py-4 align-top text-zinc-500">
                      <div className="truncate">{record.house || "Unknown"}</div>
                    </td>
                    <td className="min-w-0 px-4 py-4 align-top text-zinc-400">
                      <div className="whitespace-normal break-words leading-5">{record.article?.title || "Article title unavailable"}</div>
                    </td>
                    <td className="min-w-0 px-4 py-4 align-top text-zinc-500">
                      <div className="truncate">{record.article?.publishedAt || "Date unavailable"}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && error && (
              <StateMessage
                icon="people"
                title="Could not load sources"
                body={error}
                action={<Button variant="ghost" onClick={() => loadSources()}>Try again</Button>}
              />
            )}
            {!loading && !error && records.length === 0 && (
              <StateMessage
                icon="people"
                title="No sources found"
                body="No interview records were returned by the database yet."
              />
            )}
            {!loading && !error && records.length > 0 && filtered.length === 0 && (
              <StateMessage
                icon="search"
                title="No matching sources"
                body="Try a different name, grade, house, or article search."
              />
            )}
          </div>

          {!loading && !error && totalRecords > 0 && (
            <div className="mt-4 flex flex-col gap-3 px-1 pb-1 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
              <div>
                Showing{" "}
                <span className="font-semibold text-zinc-100">
                  {fmt(resultCount.start)}
                  {"\u2013"}
                  {fmt(resultCount.end)}
                </span>{" "}
                of <span className="font-semibold text-zinc-100">{fmt(resultCount.total)}</span>
              </div>
              <div className="flex items-center gap-2 md:justify-end">
                <button
                  type="button"
                  onClick={() => handlePageChange(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 text-zinc-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  {"\u2039"}
                </button>
                {paginationItems.map((item) => item === "start-ellipsis" || item === "end-ellipsis" ? (
                  <span key={item} className="flex h-10 min-w-8 items-center justify-center px-1 text-zinc-600">...</span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handlePageChange(item)}
                    className={paginationPageButtonClass(item === safeCurrentPage)}
                    aria-current={item === safeCurrentPage ? "page" : undefined}
                  >
                    {item}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handlePageChange(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                  className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 text-zinc-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  {"\u203a"}
                </button>
              </div>
            </div>
          )}
        </div>
        <InterviewRecordInspector
          record={selectedRecord}
          loading={loading}
          editing={editing}
          draft={draft}
          setDraft={setDraft}
          onEdit={handleEditStart}
          onCancel={handleEditCancel}
          onSave={handleSaveRecord}
          onDelete={handleDeleteRecord}
          saving={saving}
          deleting={deleting}
          saveError={saveError}
          canManage={canManageSourceRecords}
        />
      </div>
    </PageShell>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 py-5">
      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-zinc-600">{label}</p>
      <p className="min-w-0 truncate text-sm text-zinc-200">{value || "Unknown"}</p>
    </div>
  );
}

function InterviewRecordInspector({ record, loading, editing, draft, setDraft, onEdit, onCancel, onSave, onDelete, saving, deleting, saveError, canManage = false }) {
  if (loading) {
    return (
      <Card className="p-5">
        <div className="h-6 w-2/3 animate-pulse rounded bg-white/[0.08]" />
        <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-white/[0.05]" />
        <div className="mt-8 grid gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
          ))}
        </div>
      </Card>
    );
  }

  if (!record) {
    return (
      <Card className="flex min-h-[560px] items-center justify-center p-5">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-5 h-px w-16 bg-white/20" />
          <h3 className="text-[0.95rem] font-semibold tracking-tight text-zinc-100">Select a source</h3>
          <p className="mt-3 text-xs leading-5 text-zinc-500">
            Record details, article context, and editable source fields will appear here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex min-h-[560px] flex-col p-5">
      <div>
        <h2 className="break-words text-[1.7rem] font-semibold tracking-tight text-zinc-50">{record.name}</h2>
      </div>

      {saveError ? <p className="mt-4 text-xs text-rose-300">{saveError}</p> : null}

      {editing ? (
        <div className="mt-8 space-y-5 border-t border-white/[0.08] pt-5">
          <div className="grid gap-3 2xl:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.16em] text-zinc-600">First name</span>
              <input
                value={draft?.firstName || ""}
                onChange={(event) => setDraft((previous) => ({ ...(previous || {}), firstName: event.target.value }))}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 text-xs text-zinc-200 outline-none focus:border-white/[0.18]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.16em] text-zinc-600">Last name</span>
              <input
                value={draft?.lastName || ""}
                onChange={(event) => setDraft((previous) => ({ ...(previous || {}), lastName: event.target.value }))}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 text-xs text-zinc-200 outline-none focus:border-white/[0.18]"
              />
            </label>
          </div>
          <div className="grid gap-3 2xl:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.16em] text-zinc-600">Grade</span>
              <AnimatedDropdown
                text={draft?.grade || "Unknown"}
                items={sourceEditGradeOptions(draft?.grade).map((name) => ({ name, link: "#" }))}
                onSelect={(item) => setDraft((previous) => ({ ...(previous || {}), grade: item.name }))}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.16em] text-zinc-600">House</span>
              <AnimatedDropdown
                text={draft?.house || "Unknown"}
                items={sourceEditHouseOptions(draft?.house).map((name) => ({ name, link: "#" }))}
                onSelect={(item) => setDraft((previous) => ({ ...(previous || {}), house: item.name }))}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-white/[0.06] border-y border-white/[0.08]">
          <ReadOnlyField label="Grade" value={record.grade} />
          <ReadOnlyField label="House" value={record.house} />
        </div>
      )}

      <div className="mt-8 pt-7">
        <p className="mb-3 text-[0.65rem] uppercase tracking-[0.18em] text-zinc-600">Article</p>
        {isValidHttpUrl(record.article?.url) ? (
          <a
            href={record.article.url}
            target="_blank"
            rel="noreferrer"
            className="block break-words text-[1rem] font-semibold leading-6 text-zinc-100 transition hover:text-white"
          >
            {record.article?.title || "Article title unavailable"}
          </a>
        ) : (
          <p className="break-words text-[0.85rem] font-semibold leading-6 text-zinc-100">
            {record.article?.title || "Article title unavailable"}
          </p>
        )}
        <p className="mt-3 text-xs text-zinc-500">{record.article?.publishedAt || "Date unavailable"}</p>
      </div>

      {canManage ? (
        <div className="mt-auto flex justify-end gap-2 pt-10">
          {editing ? (
            <>
              <Button variant="ghost" onClick={onCancel} disabled={saving || deleting}>Cancel</Button>
              <button
                type="button"
                onClick={onSave}
                disabled={saving || deleting}
                className="inline-flex items-center justify-center rounded-xl bg-zinc-100 px-3.5 py-2 text-sm font-medium text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={onEdit}>Edit</Button>
              <Button variant="danger" onClick={onDelete} disabled={deleting || saving}>
                {deleting ? "Deleting" : "Delete"}
              </Button>
            </>
          )}
        </div>
      ) : null}
    </Card>
  );
}

function Progress({ label, value }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-600">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-zinc-200" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function makeExtractorRow(person = {}, articleUrl = "") {
  const fullName = extractorSafeText(firstText(person.name, person.fullName, person.full_name), 200);
  let firstName = extractorSafeText(firstText(person.firstName, person.first_name), 100);
  let lastName = extractorSafeText(firstText(person.lastName, person.last_name), 100);

  if ((!firstName || !lastName) && fullName) {
    const parts = fullName.split(/\s+/).filter(Boolean);
    if (!firstName) firstName = parts[0] || "";
    if (!lastName) lastName = parts.slice(1).join(" ");
  }

  return {
    id: firstText(person.id, person._id) || `extractor-row-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    firstName,
    lastName,
    grade: extractorSafeText(firstText(person.grade), 40),
    house: extractorSafeText(firstText(person.house), 80),
    url: articleUrl,
    dateAdded: extractorSafeText(firstText(person.dateAdded), 40) || new Date().toISOString().slice(0, 10),
  };
}

function extractorSafeText(value, maxLength = 500) {
  return asText(value).replace(/\s+/g, " ").slice(0, maxLength);
}

function extractorSafeList(value, maxItems = 12, maxLength = 120) {
  const rawValues = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? [value]
      : toList(value);
  return uniqueTextValues(rawValues.map((item) => (
    item && typeof item === "object"
      ? extractorSafeText(firstText(item.name, item.fullName, item.full_name), maxLength)
      : extractorSafeText(item, maxLength)
  ))).slice(0, maxItems);
}

function absoluteHttpUrl(value) {
  try {
    const parsed = new URL(asText(value));
    if ((parsed.protocol !== "http:" && parsed.protocol !== "https:") || !parsed.hostname) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

function normalizeExtractorWarnings(...sources) {
  const warnings = [];
  sources.forEach((source) => {
    const items = Array.isArray(source) ? source : source ? [source] : [];
    items.forEach((item) => {
      const value = item && typeof item === "object"
        ? firstText(item.message, item.warning, item.detail, item.code)
        : item;
      const text = extractorSafeText(value, 500);
      if (text) warnings.push(text);
    });
  });
  return uniqueTextValues(warnings).slice(0, 10);
}

function normalizeExtractorMetadata(payload, fallbackUrl) {
  const candidate = payload?.articleMetadata || payload?.article_metadata || payload?.article;
  const metadata = candidate && typeof candidate === "object" && !Array.isArray(candidate) ? candidate : {};
  const canonicalUrl = absoluteHttpUrl(firstText(
    metadata.canonicalUrl,
    metadata.canonical_url,
    metadata.url,
    payload?.canonicalUrl,
    payload?.canonical_url,
    payload?.articleUrl,
    payload?.article_url,
  )) || fallbackUrl;
  return {
    url: canonicalUrl,
    title: extractorSafeText(firstText(metadata.title, payload?.articleTitle, payload?.title), 300),
    authors: extractorSafeList(metadata.authors ?? metadata.author ?? payload?.authors ?? payload?.author, 12, 120),
    publishedAt: extractorSafeText(firstText(
      metadata.datePublished,
      metadata.date_published,
      metadata.publishedAt,
      metadata.published_at,
      metadata.date,
      payload?.datePublished,
      payload?.publishedAt,
    ), 100),
    tags: extractorSafeList(metadata.tags ?? metadata.categories ?? payload?.tags ?? payload?.categories, 16, 80),
  };
}

function normalizeIntervieweeExtraction(payload) {
  const candidate = payload?.intervieweeExtraction || payload?.interviewee_extraction;
  const extraction = candidate && typeof candidate === "object" && !Array.isArray(candidate) ? candidate : {};
  const people = [extraction.people, extraction.interviewees, payload?.people, payload?.interviewees]
    .find((value) => Array.isArray(value)) || [];
  return {
    people: people.filter((person) => person && typeof person === "object"),
    mode: extractorSafeText(firstText(extraction.mode, extraction.method, payload?.extractionMode), 80),
    message: extractorSafeText(firstText(extraction.message, extraction.note, extraction.warning), 500),
    warnings: normalizeExtractorWarnings(extraction.warnings, extraction.warning),
  };
}

function ArticleExtractorOverlay({ onClose, onSaved = async () => {}, csrfToken = "" }) {
  const [url, setUrl] = useState("");
  const [articleUrl, setArticleUrl] = useState("");
  const [extractionToken, setExtractionToken] = useState("");
  const [articleMetadata, setArticleMetadata] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [intervieweeExtraction, setIntervieweeExtraction] = useState(null);
  const [rows, setRows] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef(null);
  const urlInputRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const canCloseRef = useRef(true);
  const returnFocusRef = useRef(typeof document !== "undefined" ? document.activeElement : null);
  const titleId = useId();
  const descriptionId = useId();
  const urlInputId = useId();
  const errorId = useId();

  const canClose = !extracting && !saving;
  const hasReviewRows = Boolean(articleUrl && extractionToken);
  const hasValidNamedRows = rows.length > 0 && rows.every((row) => asText(row.firstName) && asText(row.lastName));
  const canSave = Boolean(extractionToken && articleUrl && hasValidNamedRows) && !extracting && !saving;

  useEffect(() => {
    onCloseRef.current = onClose;
    canCloseRef.current = canClose;
  }, [canClose, onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => urlInputRef.current?.focus());
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && canCloseRef.current) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...(dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) || [])].filter((element) => element.getAttribute("aria-hidden") !== "true");
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus?.();
    };
  }, []);

  const clearExtractionResult = () => {
    setArticleUrl("");
    setExtractionToken("");
    setArticleMetadata(null);
    setWarnings([]);
    setIntervieweeExtraction(null);
    setRows([]);
  };

  const requestClose = () => {
    if (!canClose) return;
    clearExtractionResult();
    setUrl("");
    setError("");
    onClose();
  };

  const validateUrl = () => {
    const nextUrl = url.trim();
    if (!nextUrl) return "Enter an article URL.";
    if (!absoluteHttpUrl(nextUrl)) return "Enter a complete article URL beginning with http:// or https://.";
    return "";
  };

  const runExtract = async () => {
    const validationError = validateUrl();
    if (validationError) {
      setError(validationError);
      return;
    }

    clearExtractionResult();
    setExtracting(true);
    setError("");

    try {
      const nextUrl = absoluteHttpUrl(url);
      const response = await fetch(`${API_BASE}/api/extract`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ url: nextUrl }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Extractor API returned HTML instead of JSON. Make sure the Flask backend is running.");
      }

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.ok !== true) {
        throw new Error(payload.error || `Extraction failed (${response.status})`);
      }

      const rawToken = payload.extractionToken ?? payload.extraction_token;
      const token = typeof rawToken === "string" ? rawToken.trim().slice(0, 8192) : "";
      if (!token) {
        throw new Error("Extraction completed without a save token. Run the extraction again.");
      }

      const metadata = normalizeExtractorMetadata(payload, nextUrl);
      const extraction = normalizeIntervieweeExtraction(payload);
      const resolvedArticleUrl = metadata.url || nextUrl;
      const extractedRows = extraction.people.map((person) => makeExtractorRow(person, resolvedArticleUrl));
      const manualMode = extractedRows.length === 0;
      const nextRows = manualMode ? [makeExtractorRow({}, resolvedArticleUrl)] : extractedRows;

      setArticleUrl(resolvedArticleUrl);
      setExtractionToken(token);
      setArticleMetadata(metadata);
      setWarnings(normalizeExtractorWarnings(
        payload.warnings,
        payload.warning,
        payload.articleMetadata?.warnings,
        payload.article_metadata?.warnings,
        extraction.warnings,
      ));
      setIntervieweeExtraction({
        mode: extraction.mode,
        message: extraction.message,
        manualMode,
      });
      setRows(nextRows);
    } catch (err) {
      setError(err.message || "Extraction failed.");
    } finally {
      setExtracting(false);
    }
  };

  const updateRow = (id, field, value) => {
    setRows((currentRows) => currentRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    if (!articleUrl || !extractionToken) return;
    setRows((currentRows) => [...currentRows, makeExtractorRow({}, articleUrl)]);
  };

  const deleteRow = (id) => {
    setRows((currentRows) => currentRows.filter((row) => row.id !== id));
  };

  const validateRows = () => {
    if (!extractionToken || !articleUrl) return "Run extraction before saving.";
    if (!rows.length) return "Add at least one row before saving.";
    for (const row of rows) {
      if (!row.firstName.trim() || !row.lastName.trim()) {
        return "First name and last name are required for each row.";
      }
    }
    return "";
  };

  const saveRows = async () => {
    const validationError = validateRows();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/save`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          extractionToken,
          articleUrl,
          addedBy: EXTRACTOR_ADDED_BY,
          people: rows.map((row) => ({
            firstName: row.firstName.trim(),
            lastName: row.lastName.trim(),
            grade: row.grade,
            house: row.house,
            dateAdded: row.dateAdded,
          })),
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Save API returned HTML instead of JSON. Make sure the Flask backend is running.");
      }

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.ok !== true) {
        throw new Error(payload.error || `Save failed (${response.status})`);
      }

      const saveMessage = extractorSafeText(payload.message, 300);
      await onSaved(saveMessage ? `Saved. ${saveMessage}` : "Saved interviewees.");
      clearExtractionResult();
      setUrl("");
      onClose();
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <motion.div
        className="mx-auto flex min-h-full w-full max-w-6xl items-center py-6"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97, y: 18 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          aria-busy={extracting || saving}
          className="w-full overflow-hidden rounded-3xl border border-white/[0.22] bg-[#0b0c10] shadow-2xl shadow-black ring-1 ring-white/[0.06]"
        >
          <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-5 py-4">
            <div>
              <h2 id={titleId} className="text-xl font-semibold tracking-tight text-zinc-50">AI article extractor</h2>
            </div>
            <button
              type="button"
              onClick={requestClose}
              disabled={!canClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-zinc-400 transition hover:bg-white/[0.07] hover:text-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Close extractor"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 py-5">
            <div className="mx-auto max-w-3xl py-4 text-center">
              <h3 className="text-2xl font-semibold tracking-tight text-zinc-50">Paste a published article URL</h3>
              <p id={descriptionId} className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Find interviewees, review the fields, then save them to the live article database.</p>
              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/[0.18] bg-black/25 p-2 transition focus-within:border-white/[0.32] md:flex-row">
                <label htmlFor={urlInputId} className="sr-only">Published article URL</label>
                <input
                  ref={urlInputRef}
                  id={urlInputId}
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  required
                  value={url}
                  onChange={(event) => {
                    setUrl(event.target.value);
                    clearExtractionResult();
                    if (error) setError("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !extracting && !saving) runExtract();
                  }}
                  disabled={extracting || saving}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : descriptionId}
                  className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
                  placeholder="https://example.com/article"
                />
                <Button onClick={runExtract} disabled={extracting || saving}>
                  {extracting ? "Extracting..." : "Extract"}
                </Button>
              </div>
              {error && <p id={errorId} role="alert" className="mt-3 text-sm font-medium text-rose-300">{error}</p>}
            </div>

            {hasReviewRows && (
              <div className="mt-5">
                <div className="mb-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-600">Article metadata</p>
                      <h3 className="mt-2 text-lg font-semibold text-zinc-50">{articleMetadata?.title || "Title unavailable"}</h3>
                      <p className="mt-2 break-all text-sm text-zinc-500">{articleUrl}</p>
                    </div>
                    <dl className="grid shrink-0 gap-3 text-sm sm:grid-cols-2 lg:w-[28rem]">
                      <div>
                        <dt className="text-xs text-zinc-600">Authors</dt>
                        <dd className="mt-1 text-zinc-300">{articleMetadata?.authors?.length ? articleMetadata.authors.join(", ") : "Unavailable"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-zinc-600">Published</dt>
                        <dd className="mt-1 text-zinc-300">{articleMetadata?.publishedAt || "Unavailable"}</dd>
                      </div>
                    </dl>
                  </div>
                  {articleMetadata?.tags?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2" aria-label="Article tags">
                      {articleMetadata.tags.map((tag) => <span key={tag} className="rounded-full border border-white/[0.08] bg-black/20 px-2.5 py-1 text-xs text-zinc-400">{tag}</span>)}
                    </div>
                  ) : null}
                  {warnings.length ? (
                    <div className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.06] px-4 py-3 text-left" role="status">
                      <p className="text-sm font-medium text-amber-200">Review notes</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-5 text-amber-100/75">
                        {warnings.map((warning) => <li key={warning}>{warning}</li>)}
                      </ul>
                    </div>
                  ) : null}
                  {intervieweeExtraction?.manualMode ? (
                    <p className="mt-4 rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm leading-6 text-zinc-400" role="status">
                      No interviewees were detected. A blank source row is ready for manual entry.
                      {intervieweeExtraction.message ? ` ${intervieweeExtraction.message}` : ""}
                    </p>
                  ) : intervieweeExtraction?.message ? (
                    <p className="mt-4 text-sm leading-6 text-zinc-500" role="status">{intervieweeExtraction.message}</p>
                  ) : null}
                </div>

                <div className="mb-3">
                  <div>
                    <h3 className="font-medium text-zinc-50">Review interviewees</h3>
                    {intervieweeExtraction?.manualMode ? (
                      <p className="mt-1 text-sm text-zinc-500">Add the source name before saving.</p>
                    ) : null}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <caption className="sr-only">Interviewees to save for this article</caption>
                    <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.14em] text-zinc-600">
                      <tr>
                        <th className="px-4 py-3">First name</th>
                        <th className="px-4 py-3">Last name</th>
                        <th className="w-36 px-4 py-3">Grade</th>
                        <th className="w-44 px-4 py-3">House</th>
                        <th className="w-24 px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, rowIndex) => (
                        <tr key={row.id} className="border-t border-white/[0.06]">
                          <td className="px-4 py-4">
                            <input
                              value={row.firstName}
                              onChange={(event) => updateRow(row.id, "firstName", event.target.value)}
                              aria-label={`First name for source row ${rowIndex + 1}`}
                              className="w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 py-2 text-zinc-200 outline-none transition focus:border-white/[0.18]"
                              placeholder="First"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <input
                              value={row.lastName}
                              onChange={(event) => updateRow(row.id, "lastName", event.target.value)}
                              aria-label={`Last name for source row ${rowIndex + 1}`}
                              className="w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 py-2 text-zinc-200 outline-none transition focus:border-white/[0.18]"
                              placeholder="Last"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={row.grade}
                              onChange={(event) => updateRow(row.id, "grade", event.target.value)}
                              aria-label={`Grade for source row ${rowIndex + 1}`}
                              className="h-10 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-3 text-zinc-200 outline-none transition focus:border-white/[0.18]"
                            >
                              {optionsWithCurrent(EXTRACTOR_GRADE_OPTIONS, row.grade).map((option) => (
                                <option key={option || "blank-grade"} value={option}>{option || "-"}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={row.house}
                              onChange={(event) => updateRow(row.id, "house", event.target.value)}
                              aria-label={`House for source row ${rowIndex + 1}`}
                              className="h-10 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-3 text-zinc-200 outline-none transition focus:border-white/[0.18]"
                            >
                              {optionsWithCurrent(EXTRACTOR_HOUSE_OPTIONS, row.house).map((option) => (
                                <option key={option || "blank-house"} value={option}>{option || "-"}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => deleteRow(row.id)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-400/15 bg-rose-400/10 text-rose-300 transition hover:bg-rose-400/15"
                              aria-label={`Delete source row ${rowIndex + 1}`}
                              title={`Delete source row ${rowIndex + 1}`}
                            >
                              <Icon name="trash" className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t border-white/[0.06]">
                        <td colSpan={5} className="p-3">
                          <button
                            type="button"
                            onClick={addRow}
                            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-white/[0.18] bg-transparent px-4 py-4 text-sm font-medium text-zinc-500 transition hover:border-white/[0.32] hover:bg-white/[0.025] hover:text-zinc-200"
                          >
                            <Icon name="plus" className="h-4 w-4" />
                            Add another source row
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button variant="ghost" onClick={requestClose} disabled={!canClose}>Cancel</Button>
                  <Button icon="task" onClick={saveRows} disabled={!canSave} title={!extractionToken ? "Run extraction before saving" : !hasValidNamedRows ? "Add first and last names for every source" : undefined}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TasksPage({ tasks, updateTaskStatus }) {
  const statuses = ["Todo", "In Progress", "Blocked", "Review", "Done"];
  return (
    <PageShell title="Assignments" eyebrow="Tasks / Deadlines" right={<Button icon="plus">New assignment</Button>}>
      <div className="grid gap-4 xl:grid-cols-5">
        {statuses.map((status) => (
          <Card key={status} className="p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-sm font-medium">{status}</h2>
              <span className="rounded-full bg-white/[0.06] px-2 py-1 text-xs text-zinc-500">{tasks.filter((t) => t.status === status).length}</span>
            </div>
            <div className="space-y-3">
              {tasks.filter((t) => t.status === status).map((task) => (
                <div key={task.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <StatusBadge tone={task.priority === "High" ? "amber" : "neutral"}>{task.priority}</StatusBadge>
                    <span className="text-xs text-zinc-600">{formatDisplayDate(task.due) || task.due}</span>
                  </div>
                  <h3 className="text-sm font-medium leading-5">{task.title}</h3>
                  <p className="mt-2 text-xs text-zinc-500">{task.article}</p>
                  <p className="mt-3 text-xs text-zinc-600">Owner: {task.owner}</p>
                  <Select value={task.status} onChange={(next) => updateTaskStatus(task.id, next)} options={statuses} label={`Change status for ${task.title}`} className="mt-3" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

function buildCalendarEvents(stories = []) {
  const currentYear = new Date().getFullYear();
  return stories
    .map((story) => {
      const date = parseCalendarDate(storyDeadlineValue(story), currentYear);
      if (!date) return null;
      return {
        id: `story-${story.id}`,
        kind: "story",
        story,
        date,
        title: story.title,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.date - b.date || a.title.localeCompare(b.title));
}

function normalizeCalendarEvent(raw = {}) {
  const date = parseCalendarDate(raw.date);
  if (!date) return null;
  return {
    ...raw,
    id: asText(raw.id),
    kind: "manual",
    date,
    title: asText(raw.title) || "Untitled event",
    allDay: raw.allDay !== false,
    startTime: asText(raw.startTime),
    endTime: asText(raw.endTime),
    description: asText(raw.description),
    createdBy: asText(raw.createdBy),
  };
}

function calendarEventSort(left, right) {
  const dateDifference = left.date - right.date;
  if (dateDifference) return dateDifference;
  if (left.kind !== right.kind) return left.kind === "manual" ? -1 : 1;
  const timeDifference = asText(left.startTime).localeCompare(asText(right.startTime));
  return timeDifference || left.title.localeCompare(right.title);
}

function calendarEventTimeLabel(value) {
  const [hour, minute] = asText(value).split(":").map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return "";
  const date = new Date(2000, 0, 1, hour, minute);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

function CalendarEventModal({ open, initialDate, event = null, onClose, onSave, onDelete, saving = false, deleting = false, canManage = true }) {
  const isEditing = Boolean(event);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(initialDate || inputDateValue(new Date()));
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(event?.title || "");
    setDate(event?.date ? inputDateValue(event.date) : initialDate || inputDateValue(new Date()));
    setAllDay(event ? event.allDay : true);
    setStartTime(event?.startTime || "09:00");
    setEndTime(event?.endTime || "10:00");
    setDescription(event?.description || "");
    setError("");
  }, [event, initialDate, open]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open, saving]);

  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Add a title for this event.");
      return;
    }
    if (!date) {
      setError("Choose a date for this event.");
      return;
    }
    if (!allDay && (!startTime || !endTime || endTime <= startTime)) {
      setError("Choose a start and end time, or mark the event as all day.");
      return;
    }
    setError("");
    try {
      await onSave({
        title: title.trim(),
        date,
        allDay,
        startTime: allDay ? "" : startTime,
        endTime: allDay ? "" : endTime,
        description: description.trim(),
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not add event.");
    }
  };

  const deleteEvent = async () => {
    if (!isEditing || !canManage || !onDelete) return;
    if (!window.confirm(`Delete “${event.title}”? This cannot be undone.`)) return;
    setError("");
    try {
      await onDelete();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete event.");
    }
  };

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-event-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-lg rounded-2xl border border-white/[0.12] bg-[#0b0c10] p-5 shadow-2xl shadow-black/60 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="calendar-event-title" className="text-xl font-semibold text-zinc-50">{isEditing ? "Edit event" : "Add event"}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close event dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 disabled:opacity-45"
          >
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-zinc-300">
            Title
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isEditing && !canManage}
              placeholder="e.g. Staff meeting"
              maxLength={120}
              className="mt-2 h-11 w-full rounded-xl border border-white/[0.1] bg-black/25 px-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-white/[0.24]"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="block text-sm font-medium text-zinc-300">
              Date
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                disabled={isEditing && !canManage}
                className="mt-2 h-11 w-full rounded-xl border border-white/[0.1] bg-black/25 px-3 text-sm text-zinc-200 outline-none focus:border-white/[0.24]"
              />
            </label>
            <label className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.1] bg-black/25 px-3 text-sm text-zinc-300 sm:mb-0">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(event) => setAllDay(event.target.checked)}
                disabled={isEditing && !canManage}
                className="h-4 w-4 accent-zinc-100"
              />
              All day
            </label>
          </div>

          {!allDay ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-zinc-300">
                Starts
                <input
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  disabled={isEditing && !canManage}
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.1] bg-black/25 px-3 text-sm text-zinc-200 outline-none focus:border-white/[0.24]"
                />
              </label>
              <label className="block text-sm font-medium text-zinc-300">
                Ends
                <input
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  disabled={isEditing && !canManage}
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.1] bg-black/25 px-3 text-sm text-zinc-200 outline-none focus:border-white/[0.24]"
                />
              </label>
            </div>
          ) : null}

          <label className="block text-sm font-medium text-zinc-300">
            Description <span className="font-normal text-zinc-600">(optional)</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isEditing && !canManage}
              rows={3}
              maxLength={2000}
              placeholder="Add a little context"
              className="mt-2 w-full resize-none rounded-xl border border-white/[0.1] bg-black/25 px-3 py-2 text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-white/[0.24]"
            />
          </label>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </div>

        {(!isEditing || canManage) ? (
          <div className="mt-6 flex justify-end gap-2">
            {!isEditing ? <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button> : null}
            {isEditing ? <Button variant="danger" icon="trash" onClick={deleteEvent} disabled={saving || deleting}>{deleting ? "Deleting..." : "Delete"}</Button> : null}
            <Button type="submit" disabled={saving || deleting}>{saving ? (isEditing ? "Saving..." : "Adding...") : isEditing ? "Save changes" : "Add event"}</Button>
          </div>
        ) : null}
      </motion.form>
    </motion.div>,
    document.body
  );
}

function CalendarPage({ stories = [], currentUser = FALLBACK_ACCOUNT, csrfToken = "", onOpenStory = () => {}, setToast = () => {} }) {
  const storyEvents = useMemo(() => buildCalendarEvents(stories), [stories]);
  const [manualEvents, setManualEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [hasNavigatedMonth, setHasNavigatedMonth] = useState(false);
  const [expandedDays, setExpandedDays] = useState(() => new Set());
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventDialogDate, setEventDialogDate] = useState(inputDateValue(new Date()));
  const [editingCalendarEvent, setEditingCalendarEvent] = useState(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState("");
  const canCreateManualEvent = ["owner", "admin", "editor", "writer"].includes(normalizeAppRole(currentUser?.role));
  const calendarEvents = useMemo(
    () => [...storyEvents, ...manualEvents].sort(calendarEventSort),
    [manualEvents, storyEvents]
  );
  const firstEventDate = calendarEvents[0]?.date;
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const base = firstEventDate || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  useEffect(() => {
    const controller = new AbortController();
    async function loadEvents() {
      setEventsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/calendar-events`, {
          headers: { Accept: "application/json" },
          credentials: "include",
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.ok === false) {
          throw new Error(payload?.error || "Calendar events are unavailable.");
        }
        setManualEvents(Array.isArray(payload.events) ? payload.events.map(normalizeCalendarEvent).filter(Boolean) : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setManualEvents([]);
          setToast(error instanceof Error ? error.message : "Calendar events are unavailable.");
        }
      } finally {
        if (!controller.signal.aborted) setEventsLoading(false);
      }
    }
    loadEvents();
    return () => controller.abort();
  }, [setToast]);

  useEffect(() => {
    if (!firstEventDate || hasNavigatedMonth) return;
    setVisibleMonth(new Date(firstEventDate.getFullYear(), firstEventDate.getMonth(), 1));
  }, [firstEventDate, hasNavigatedMonth]);

  const navigateCalendarMonth = (nextMonth) => {
    setHasNavigatedMonth(true);
    setExpandedDays(new Set());
    setVisibleMonth(nextMonth);
  };

  const openEventDialog = (date = inputDateValue(new Date())) => {
    if (!canCreateManualEvent) return;
    setEventDialogDate(date);
    setEventDialogOpen(true);
  };

  const canManageCalendarEvent = (event) => {
    const role = normalizeAppRole(currentUser?.role);
    return ["owner", "admin", "editor"].includes(role) || (role === "writer" && asText(event?.createdByUserId) === asText(currentUser?.id));
  };

  const saveManualEvent = async (draft, eventToUpdate = null) => {
    if (!canCreateManualEvent || savingEvent) return;
    setSavingEvent(true);
    try {
      const response = await fetch(
        eventToUpdate ? `${API_BASE}/api/calendar-events/${encodeURIComponent(eventToUpdate.id)}` : `${API_BASE}/api/calendar-events`,
        {
          method: eventToUpdate ? "PATCH" : "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
          },
          credentials: "include",
          body: JSON.stringify(draft),
        }
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || (eventToUpdate ? "Could not update event." : "Could not add event."));
      }
      const nextEvent = normalizeCalendarEvent(payload.event);
      if (!nextEvent) throw new Error(eventToUpdate ? "Could not update event." : "Could not add event.");
      setManualEvents((current) => eventToUpdate
        ? current.map((item) => item.id === nextEvent.id ? nextEvent : item)
        : [...current, nextEvent]
      );
      const nextDate = parseCalendarDate(draft.date);
      if (nextDate) navigateCalendarMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
      setEventDialogOpen(false);
      setEditingCalendarEvent(null);
      setToast(eventToUpdate ? "Event updated." : "Event added to the calendar.");
    } finally {
      setSavingEvent(false);
    }
  };

  const openExistingCalendarEvent = (event) => {
    setEditingCalendarEvent(event);
  };

  const deleteManualEvent = async (event) => {
    if (!event || !canManageCalendarEvent(event) || deletingEventId) return;
    setDeletingEventId(event.id);
    try {
      const response = await fetch(`${API_BASE}/api/calendar-events/${encodeURIComponent(event.id)}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Could not delete event.");
      }
      setManualEvents((current) => current.filter((item) => item.id !== event.id));
      setEditingCalendarEvent(null);
      setToast("Event deleted.");
    } finally {
      setDeletingEventId("");
    }
  };

  const toggleExpandedDay = (dayKey) => {
    setExpandedDays((current) => {
      const next = new Set(current);
      if (next.has(dayKey)) next.delete(dayKey);
      else next.add(dayKey);
      return next;
    });
  };

  const cells = useMemo(() => buildCalendarCells(visibleMonth), [visibleMonth]);
  const eventsByDay = useMemo(() => {
    const grouped = new Map();
    calendarEvents.forEach((event) => {
      const key = calendarDateKey(event.date);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(event);
    });
    return grouped;
  }, [calendarEvents]);
  return (
    <PageShell
      title="Calendar"
      right={canCreateManualEvent ? <Button icon="plus" onClick={() => openEventDialog()}>Add event</Button> : null}
    >
      <section className="space-y-4">
        <div className="flex flex-col gap-3 border-b border-white/[0.12] pb-4 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-50">{monthYearLabel(visibleMonth)}</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => navigateCalendarMonth(addMonths(visibleMonth, -1))}>Previous</Button>
            <Button variant="ghost" onClick={() => navigateCalendarMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>Today</Button>
            <Button variant="ghost" onClick={() => navigateCalendarMonth(addMonths(visibleMonth, 1))}>Next</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-7 border-b border-white/[0.12] text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="border-r border-white/[0.08] px-3 py-2 last:border-r-0">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((cell, index) => {
                const items = eventsByDay.get(cell.key) || [];
                const expanded = expandedDays.has(cell.key);
                const visibleItems = expanded ? items : items.slice(0, 4);
                const eventListId = `calendar-events-${cell.key}`;
                return (
                  <div
                    key={cell.key}
                    className={cx(
                      "min-h-32 border-r border-b border-white/[0.08] p-2 text-left last:border-r-0",
                      index % 7 === 6 && "border-r-0",
                      cell.inMonth ? "bg-white/[0.018]" : "bg-black/20 text-zinc-700"
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className={cx("flex h-7 w-7 items-center justify-center rounded-full text-xs", cell.isToday ? "bg-zinc-100 text-black" : cell.inMonth ? "text-zinc-300" : "text-zinc-700")}>{cell.day}</span>
                      {canCreateManualEvent ? (
                        <button
                          type="button"
                          onClick={() => openEventDialog(cell.key)}
                          aria-label={`Add event on ${monthDayYear(cell.date)}`}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-600 transition hover:bg-white/[0.08] hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
                        >
                          <Icon name="plus" className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                    <div id={eventListId} className="space-y-1.5">
                      {visibleItems.map((item) => (
                        item.kind === "story" ? (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => onOpenStory(item.story)}
                            title={item.title}
                            className="block w-full truncate rounded-md border border-white/[0.1] bg-white/[0.055] px-2 py-1.5 text-left text-xs font-medium text-zinc-100 transition hover:border-white/[0.2] hover:bg-white/[0.085] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 motion-reduce:transition-none"
                          >
                            {item.title}
                          </button>
                        ) : (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => openExistingCalendarEvent(item)}
                            title={item.description || item.title}
                            className="flex w-full min-w-0 items-center gap-1.5 rounded-md border border-white/[0.1] bg-white/[0.055] px-2 py-1.5 text-left text-xs font-medium text-zinc-100 transition hover:border-white/[0.2] hover:bg-white/[0.085] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 motion-reduce:transition-none"
                          >
                            {!item.allDay && item.startTime ? <span className="shrink-0 text-[10px] text-zinc-500">{calendarEventTimeLabel(item.startTime)}</span> : null}
                            <span className="truncate">{item.title}</span>
                          </button>
                        )
                      ))}
                      {items.length > 4 ? (
                        <button
                          type="button"
                          onClick={() => toggleExpandedDay(cell.key)}
                          aria-expanded={expanded}
                          aria-controls={eventListId}
                          aria-label={expanded ? `Show fewer deadlines for ${monthDayYear(cell.date)}` : `Show ${items.length - 4} more deadlines for ${monthDayYear(cell.date)}`}
                          className="rounded px-1 py-0.5 text-[10px] font-medium text-zinc-500 transition hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 motion-reduce:transition-none"
                        >
                          {expanded ? "Show fewer" : `+${items.length - 4} more`}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {eventsLoading ? <p className="text-xs text-zinc-600">Loading saved events...</p> : null}
      </section>
      <AnimatePresence>
        {eventDialogOpen || editingCalendarEvent ? (
          <CalendarEventModal
            open={eventDialogOpen || Boolean(editingCalendarEvent)}
            initialDate={editingCalendarEvent ? inputDateValue(editingCalendarEvent.date) : eventDialogDate}
            event={editingCalendarEvent}
            canManage={!editingCalendarEvent || canManageCalendarEvent(editingCalendarEvent)}
            onClose={() => {
              setEventDialogOpen(false);
              setEditingCalendarEvent(null);
            }}
            onSave={(draft) => saveManualEvent(draft, editingCalendarEvent)}
            onDelete={() => deleteManualEvent(editingCalendarEvent)}
            saving={savingEvent}
            deleting={deletingEventId === editingCalendarEvent?.id}
          />
        ) : null}
      </AnimatePresence>
    </PageShell>
  );
}

function AnalyticsPage() {
  return (
    <PageShell title="Analytics">
      <p className="pt-2 text-sm text-zinc-500">Coming soon.</p>
    </PageShell>
  );
}

function AdministrationSettings({ setToast, csrfToken = "", currentUser = FALLBACK_ACCOUNT }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [collapsedRoles, setCollapsedRoles] = useState({});

  const loadStaff = async (signal) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Accept: "application/json" },
        credentials: "include",
        signal,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Admin users are unavailable.");
      }
      setStaff(Array.isArray(payload.users) ? payload.users.map(normalizeDisplayUser) : []);
    } catch (loadError) {
      if (loadError.name === "AbortError") return;
      setStaff([]);
      setError(loadError instanceof Error ? loadError.message : "Admin users are unavailable.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadStaff(controller.signal);
    return () => controller.abort();
  }, []);

  const query = adminSearchQuery(search);
  const visibleStaff = useMemo(
    () => staff.filter((user) => adminUserMatches(user, query, "All roles")),
    [staff, query]
  );
  const visibleGroups = useMemo(() => groupAdminUsersByRole(visibleStaff), [visibleStaff]);
  const visibleCount = visibleGroups.reduce((total, group) => total + group.users.length, 0);

  const updateUserRole = async (userId, nextRole) => {
    const user = staff.find((item) => item.id === userId);
    if (!user || user.role === nextRole) return;
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${encodeURIComponent(userId)}/role`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ role: nextRole }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Role update failed.");
      }
      const updatedUser = normalizeDisplayUser(payload.user || { ...user, role: nextRole });
      setStaff((prev) => prev.map((item) => (item.id === userId ? { ...item, ...updatedUser } : item)));
      setToast(`${user.name} moved to ${accountRoleLabel(nextRole)}.`);
    } catch (updateError) {
      setToast(updateError instanceof Error ? updateError.message : "Role update failed.");
    }
  };

  const removeUserMembership = async (userId) => {
    const user = staff.find((item) => item.id === userId);
    if (!user || accountsReferToSameUser(user, currentUser)) return;
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${encodeURIComponent(userId)}/membership`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) throw new Error(payload?.error || "Membership removal failed.");
      setStaff((previous) => previous.filter((item) => item.id !== userId));
      setToast(`${user.name} was removed from this workspace.`);
    } catch (removeError) {
      setToast(removeError instanceof Error ? removeError.message : "Membership removal failed.");
    }
  };

  const toggleRole = (roleId) => {
    setCollapsedRoles((previous) => ({ ...previous, [roleId]: !previous[roleId] }));
  };

  return (
    <div>
      <p className="mb-5 text-sm leading-6 text-zinc-500">Manage newsroom access and assign workspace roles.</p>
      <section className="space-y-5">
        <Input value={search} onChange={setSearch} placeholder="Search staff" label="Search staff by name" className="h-11 w-full" />

        {loading ? (
          <AdminSettingsSkeleton />
        ) : error ? (
          <AdminSurfaceMessage
            icon="admin"
            title="Could not load staff"
            body={error}
            action={<Button variant="ghost" onClick={() => loadStaff()}>Try again</Button>}
          />
        ) : visibleCount === 0 ? (
          <AdminSurfaceMessage icon="search" title="No matching staff" body="Try a different staff name." />
        ) : (
          <div className="space-y-3 pb-20">
            {visibleGroups.map((group) => (
              <AdminRoleSection
                key={group.id}
                group={group}
                collapsed={Boolean(collapsedRoles[group.id])}
                onToggle={() => toggleRole(group.id)}
                onRoleChange={updateUserRole}
                onRemove={removeUserMembership}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InviteStaffModal({ workspace, setToast, onRotate, onClose }) {
  const reduceMotion = useReducedMotion();
  const closeButtonRef = useRef(null);
  const returnFocusRef = useRef(document.activeElement);
  const onCloseRef = useRef(onClose);
  const [copyError, setCopyError] = useState("");
  const [copied, setCopied] = useState("");
  const [rotationPending, setRotationPending] = useState(false);
  const [rotating, setRotating] = useState(false);
  const workspaceName = asText(workspace?.name) || "your newsroom";
  const joinCode = asText(workspace?.joinCode);
  const signupUrl = `${window.location.origin}/signup`;
  const inviteMessage = joinCode
    ? `Join ${workspaceName} on Inscribe. Sign up at ${signupUrl}, then enter workspace code ${joinCode}.`
    : "The workspace join code is currently unavailable. Close this dialog and reload Administration before inviting staff.";
  const mailtoHref = joinCode
    ? `mailto:?subject=${encodeURIComponent(`Join ${workspaceName} on Inscribe`)}&body=${encodeURIComponent(inviteMessage)}`
    : "";

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = closeButtonRef.current?.closest('[role="dialog"]');
      const focusable = [...(dialog?.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') || [])]
        .filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus?.();
    };
  }, []);

  const copyText = async (value, copiedLabel, toastMessage) => {
    if (!value) return;
    setCopyError("");
    try {
      await navigator.clipboard.writeText(value);
      setCopied(copiedLabel);
      setToast(toastMessage);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopyError("Copy failed. Select the text in this dialog and copy it manually.");
    }
  };

  const rotateCode = async () => {
    if (rotating) return;
    if (!rotationPending) {
      setRotationPending(true);
      window.setTimeout(() => setRotationPending(false), 6000);
      return;
    }
    setRotating(true);
    setCopyError("");
    try {
      await onRotate();
      setRotationPending(false);
    } catch (error) {
      setCopyError(error instanceof Error ? error.message : "Join code rotation failed.");
    } finally {
      setRotating(false);
    }
  };

  return createPortal(
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.16 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-staff-title"
      aria-describedby="invite-staff-description"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl rounded-2xl border border-white/[0.12] bg-[#0b0c10] p-5 shadow-2xl shadow-black/60 sm:p-6"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <h2 id="invite-staff-title" className="text-xl font-semibold text-zinc-50">Invite staff</h2>
            <p id="invite-staff-description" className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Share the code or send a ready-to-use email. New members join as guests until an admin assigns a role.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close invite staff dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 motion-reduce:transition-none"
          >
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-white/[0.1] bg-black/25 p-4">
          <p className="text-xs font-medium text-zinc-500">Workspace join code</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <code className="select-all break-all text-xl font-semibold tracking-[0.16em] text-zinc-100">{joinCode || "Unavailable"}</code>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => copyText(joinCode, "code", "Copied workspace join code.")} disabled={!joinCode}>
                {copied === "code" ? "Copied" : "Copy code"}
              </Button>
              <Button variant="ghost" onClick={rotateCode} disabled={rotating}>
                {rotating ? "Rotating..." : rotationPending ? "Confirm rotation" : "Rotate code"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="staff-invite-message" className="text-xs font-medium text-zinc-500">Invite message</label>
          <textarea
            id="staff-invite-message"
            readOnly
            rows={4}
            value={inviteMessage}
            className="mt-2 w-full resize-none rounded-xl border border-white/[0.1] bg-black/25 px-3 py-3 text-sm leading-6 text-zinc-300 outline-none focus:border-white/[0.2]"
          />
        </div>

        {copyError ? <p className="mt-3 text-sm text-rose-300" role="alert">{copyError}</p> : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="ghost" onClick={() => copyText(inviteMessage, "message", "Copied staff invite message.")} disabled={!joinCode}>
            {copied === "message" ? "Copied message" : "Copy message"}
          </Button>
          {mailtoHref ? (
            <a
              href={mailtoHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-3.5 py-2 text-sm font-medium text-black transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 motion-reduce:transition-none"
            >
              <Icon name="mail" className="h-4 w-4" />
              Open email
            </a>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-zinc-100 px-3.5 py-2 text-sm font-medium text-black opacity-45" aria-disabled="true">
              <Icon name="mail" className="h-4 w-4" />
              Open email
            </span>
          )}
        </div>
      </motion.section>
    </motion.div>,
    document.body
  );
}

function AdminSettingsSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading staff</span>
      <div className="space-y-3 animate-pulse" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-4">
            <div className="h-4 w-4 shrink-0 rounded bg-white/[0.07]" />
            <div className="h-4 w-24 shrink-0 rounded bg-white/[0.08]" />
            <div className="h-3 w-full max-w-72 rounded bg-white/[0.045]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSurfaceMessage({ icon, title, body, action }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025]">
      <StateMessage icon={icon} title={title} body={body} action={action} />
    </div>
  );
}

function AdminRoleSection({ group, collapsed, onToggle, onRoleChange, onRemove, currentUser }) {
  const reduceMotion = useReducedMotion();
  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.025]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-white/[0.035] focus:outline-none focus-visible:bg-white/[0.035] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/20"
      >
        <span className="flex min-w-0 items-center gap-3">
          <Icon name="chevron" className={cx("h-4 w-4 shrink-0 text-zinc-500 transition motion-reduce:transition-none", collapsed ? "-rotate-90" : "rotate-0")} />
          <span className="min-w-0">
            <span className="text-sm font-semibold text-zinc-100">{group.label}</span>{" "}
            <span className="ml-3 text-sm text-zinc-500">{group.description}</span>
          </span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
            className="overflow-hidden border-t border-white/[0.08]"
          >
            {group.users.length ? (
              <AdminStaffTable staff={group.users} onRoleChange={onRoleChange} onRemove={onRemove} currentUser={currentUser} />
            ) : (
              <div className="px-4 py-6 text-sm text-zinc-600">No staff in this role.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function accountsReferToSameUser(left, right) {
  const leftIds = [left?.id, left?._id].map((value) => asText(value).toLowerCase()).filter(Boolean);
  const rightIds = [right?.id, right?._id].map((value) => asText(value).toLowerCase()).filter(Boolean);
  if (leftIds.some((id) => rightIds.includes(id))) return true;
  const leftEmail = asText(left?.email).toLowerCase();
  const rightEmail = asText(right?.email).toLowerCase();
  return Boolean(leftEmail && rightEmail && leftEmail === rightEmail);
}

function AdminStaffTable({ staff, onRoleChange, onRemove, currentUser }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.14em] text-zinc-600">
          <tr>
            <th className="px-4 py-3 font-medium">Staff member</th>
            <th className="w-44 px-4 py-3 font-medium">Role</th>
            <th className="w-44 px-4 py-3 font-medium">Last seen</th>
            <th className="w-48 px-4 py-3 font-medium">Access</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {staff.map((user) => (
            <AdminUserRow key={user.id} user={user} onRoleChange={onRoleChange} onRemove={onRemove} isCurrentUser={accountsReferToSameUser(user, currentUser)} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminUserRow({ user, onRoleChange, onRemove, isCurrentUser = false }) {
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);
  const requestRemoval = () => {
    if (!confirmingRemoval) {
      setConfirmingRemoval(true);
      window.setTimeout(() => setConfirmingRemoval(false), 6000);
      return;
    }
    setConfirmingRemoval(false);
    onRemove(user.id);
  };
  return (
    <tr className="transition hover:bg-white/[0.025]">
      <td className="px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs font-semibold text-zinc-200">
            {accountInitials(user)}
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium text-zinc-100">{user.name}</div>
            <div className="mt-0.5 truncate text-xs text-zinc-500">{user.email || "Email unavailable"}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {isCurrentUser ? (
          <div>
            <span className="text-sm text-zinc-300">{accountRoleLabel(user.role)}</span>
            <span className="mt-1 block text-xs text-zinc-600">Current account</span>
          </div>
        ) : (
          <AdminRoleDropdown value={user.role} onChange={(nextRole) => onRoleChange(user.id, nextRole)} label={`${user.name} role`} />
        )}
      </td>
      <td className="px-4 py-3 text-zinc-500">{user.lastSeen || "Not recorded"}</td>
      <td className="px-4 py-3">
        {isCurrentUser ? (
          <span className="text-xs text-zinc-600">Protected</span>
        ) : (
          <button
            type="button"
            onClick={requestRemoval}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/30"
            aria-label={`${confirmingRemoval ? "Confirm removal and data deletion for" : "Remove"} ${user.name} from workspace`}
            title={confirmingRemoval ? "This also deletes the member’s workspace pitches, stories, attachments, and related records." : undefined}
          >
            {confirmingRemoval ? "Confirm & delete data" : "Remove"}
          </button>
        )}
      </td>
    </tr>
  );
}

function AdminRoleDropdown({ value, onChange, label }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const menuHeight = ADMIN_ROLE_OPTIONS.length * 41 + 10;
      const menuWidth = Math.max(rect.width, 136);
      const pad = 12;
      const hasRoomBelow = window.innerHeight - rect.bottom >= menuHeight + pad;
      const shouldOpenUp = !hasRoomBelow && rect.top > menuHeight + pad;
      const top = shouldOpenUp
        ? Math.max(pad, rect.top - menuHeight - 8)
        : Math.min(window.innerHeight - menuHeight - pad, rect.bottom + 8);
      const left = Math.min(Math.max(pad, rect.left), window.innerWidth - menuWidth - pad);

      setMenuStyle({
        left: `${left}px`,
        top: `${Math.max(pad, top)}px`,
        width: `${menuWidth}px`,
        transformOrigin: shouldOpenUp ? "bottom" : "top",
      });
    };

    const handlePointerDown = (event) => {
      if (buttonRef.current?.contains(event.target) || menuRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) || !menuRef.current) return;
      const options = [...menuRef.current.querySelectorAll('[role="option"]')];
      if (!options.length) return;
      event.preventDefault();
      const currentIndex = Math.max(0, options.indexOf(document.activeElement));
      const nextIndex = event.key === "Home"
        ? 0
        : event.key === "End"
          ? options.length - 1
          : event.key === "ArrowDown"
            ? (currentIndex + 1) % options.length
            : (currentIndex - 1 + options.length) % options.length;
      options[nextIndex].focus();
    };

    updatePosition();
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !menuStyle) return;
    const frame = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector('[role="option"][aria-selected="true"]')?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [menuStyle, open]);

  const menu = open && menuStyle
    ? createPortal(
        <motion.div
          ref={menuRef}
          role="listbox"
          aria-label={label}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: reduceMotion ? 0 : 0.14, ease: "easeOut" }}
          style={menuStyle}
          className="fixed z-[100] overflow-hidden rounded-xl bg-zinc-950 p-1 shadow-2xl shadow-black/60"
        >
          {ADMIN_ROLE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === value}
              onClick={() => {
                if (option !== value) onChange(option);
                setOpen(false);
                buttonRef.current?.focus();
              }}
              className={cx(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/20",
                option === value ? "bg-white/[0.08] text-zinc-50" : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
              )}
            >
              <span>{accountRoleLabel(option)}</span>
              {option === value && <span className="h-1.5 w-1.5 rounded-full bg-zinc-100" />}
            </button>
          ))}
        </motion.div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 w-32 items-center justify-between gap-2 rounded-xl border border-transparent bg-black/25 px-3 text-sm text-zinc-100 transition hover:bg-white/[0.05] focus:outline-none focus-visible:border-white/[0.16] focus-visible:ring-2 focus-visible:ring-white/15 active:border-transparent active:outline-none"
      >
        <span className="truncate">{accountRoleLabel(value)}</span>
        <Icon name="chevron" className={cx("h-4 w-4 shrink-0 text-zinc-500 transition motion-reduce:transition-none", open && "rotate-180")} />
      </button>
      {menu}
    </>
  );
}

export default function FalconNewsroomFullInteractiveUI() {
  return isLandingRoute() ? <V4LandingPage /> : <AppShell />;
}
function workspaceSettingsDraft(workspace = {}) {
  return {
    name: asText(workspace?.name),
    publicationUrl: asText(workspace?.publicationUrl),
  };
}

function SettingsField({ id, label, hint, value, onChange, disabled = false, type = "text", autoComplete = "off" }) {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-200">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-describedby={hintId}
        className="h-11 w-full rounded-xl border border-white/[0.1] bg-black/25 px-3.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 hover:border-white/[0.15] focus:border-white/[0.24] focus:ring-2 focus:ring-white/[0.06] disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-zinc-500 disabled:hover:border-white/[0.1]"
      />
      {hint ? <span id={hintId} className="mt-2 block text-xs leading-5 text-zinc-500">{hint}</span> : null}
    </label>
  );
}

const SETTINGS_SECTIONS = [
  { id: "workspace", label: "Workspace", icon: "settings", path: "/settings" },
  { id: "names", label: "Names database", icon: "people", path: "/settings/names", adminOnly: true },
  { id: "administration", label: "Administration", icon: "admin", path: "/settings/administration", adminOnly: true },
];

function settingsSectionForPath(pathname = "") {
  const path = pathname.toLowerCase().replace(/\/+$/, "") || "/settings";
  if (path === "/admin" || path.includes("/administration")) return "administration";
  if (path.includes("/names")) return "names";
  return "workspace";
}

function SettingsNavigation({ activeSection, canManageWorkspace }) {
  const sections = SETTINGS_SECTIONS.filter((section) => canManageWorkspace || !section.adminOnly);
  return (
    <nav className="flex w-full flex-wrap gap-x-6 gap-y-1 overflow-visible border-b border-white/[0.08]" aria-label="Settings sections">
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => pushAppPath(section.path)}
          aria-current={activeSection === section.id ? "page" : undefined}
          className={cx(
            "-mb-px flex shrink-0 items-center gap-2.5 border-b-2 px-1 pb-3 pt-1 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
            activeSection === section.id ? "border-zinc-100 text-zinc-50" : "border-transparent text-zinc-500 hover:border-white/[0.18] hover:text-zinc-200"
          )}
        >
          <Icon name={section.icon} className="h-4 w-4 shrink-0" />
          <span>{section.label}</span>
        </button>
      ))}
    </nav>
  );
}

function WorkspaceSettings({ draft, updateDraft, loading, saving, canManageWorkspace, isDirty, loadError, saveError, saveSettings, joinCode, copied, copyCode }) {
  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-50">Workspace</h2>
        </div>
        {canManageWorkspace ? (
          <div className="flex items-center gap-3">
            {isDirty && !saving ? <span className="hidden text-xs text-zinc-500 sm:inline">Unsaved changes</span> : null}
            <Button onClick={saveSettings} disabled={loading || saving || !isDirty}>{saving ? "Saving..." : "Save changes"}</Button>
          </div>
        ) : <StatusBadge>Admin managed</StatusBadge>}
      </div>

      {loadError ? <div className="mt-5 rounded-xl border border-rose-400/15 bg-rose-400/[0.07] px-4 py-3 text-sm text-rose-300" role="alert">{loadError}</div> : null}
      {saveError ? <div className="mt-5 rounded-xl border border-amber-400/15 bg-amber-400/[0.07] px-4 py-3 text-sm text-amber-200" role="alert">{saveError}</div> : null}

      <section className="py-7" aria-labelledby="workspace-details-title">
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <SettingsField id="workspace-name" label="Workspace name" value={draft.name} onChange={(value) => updateDraft("name", value)} disabled={loading || !canManageWorkspace} autoComplete="organization" />
          <SettingsField id="publication-url" label="Publication website" value={draft.publicationUrl} onChange={(value) => updateDraft("publicationUrl", value)} disabled={loading || !canManageWorkspace} type="url" autoComplete="url" />
        </div>
      </section>

      {canManageWorkspace ? <section className="border-t border-white/[0.08] pt-7" aria-labelledby="workspace-access-title">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_280px] md:items-center">
          <div>
            <h3 id="workspace-access-title" className="text-sm font-semibold text-zinc-200">Workspace access code</h3>
            <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500">Share this with people joining {draft.name || "your newsroom"}. </p>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.09] bg-black/20 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs text-zinc-500">Join code</p>
              <p className="mt-1 truncate font-mono text-lg font-semibold tracking-[0.16em] text-zinc-100">{joinCode || (loadError ? "Unavailable" : "Loading...")}</p>
            </div>
            <Button variant="ghost" onClick={copyCode} disabled={!joinCode}>{copied ? "Copied" : "Copy"}</Button>
          </div>
        </div>
      </section> : null}
    </div>
  );
}

function readableFileSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function NamesDatabaseSettings({ csrfToken = "", setToast = () => {} }) {
  const fileInputRef = useRef(null);
  const [summary, setSummary] = useState({ count: 0, updatedAt: "", updatedBy: "", sourceFile: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`${API_BASE}/api/admin/names`, {
      headers: { Accept: "application/json" },
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.ok === false) throw new Error(payload?.error || "Could not load names database details.");
        setSummary(payload);
      })
      .catch((loadError) => {
        if (loadError.name !== "AbortError") setError(loadError instanceof Error ? loadError.message : "Could not load names database details.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const selectFile = (file) => {
    setResult(null);
    setError("");
    if (!file) return;
    const extension = file.name.toLowerCase().split(".").pop();
    if (!["csv", "xlsx"].includes(extension)) {
      setSelectedFile(null);
      setError("Choose a CSV or .xlsx Excel file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSelectedFile(null);
      setError("The names file must be 10 MB or smaller.");
      return;
    }
    setSelectedFile(file);
  };

  const uploadNames = async () => {
    if (!selectedFile || uploading) return;
    setUploading(true);
    setError("");
    setResult(null);
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const response = await fetch(`${API_BASE}/api/admin/names/upload`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) throw new Error(payload?.error || "Could not replace the names database.");
      setSummary(payload);
      setResult(payload);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setToast(`Names database replaced with ${Number(payload.count || 0).toLocaleString()} records.`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not replace the names database.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    selectFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-50">Names database</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">Keep the student and staff roster used by the AI extractor current.</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-2xl font-semibold tabular-nums text-zinc-100">{loading ? "..." : Number(summary.count || 0).toLocaleString()}</p>
          <p className="text-xs text-zinc-600">names available</p>
        </div>
      </div>

      <section className="py-7" aria-labelledby="replace-roster-title">
        <div className="mb-5">
          <h3 id="replace-roster-title" className="text-sm font-semibold text-zinc-200">Replace roster</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-500">A successful upload overwrites the current names collection. The existing list stays in place if validation fails.</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="sr-only"
          onChange={(event) => selectFile(event.target.files?.[0])}
        />
        <div
          onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragActive(false); }}
          onDrop={handleDrop}
          className={cx(
            "rounded-2xl border border-dashed px-6 py-10 text-center transition duration-200",
            dragActive ? "border-zinc-300 bg-white/[0.07]" : "border-white/[0.14] bg-black/15"
          )}
        >
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-zinc-300">
            <Icon name="upload" className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-medium text-zinc-200">Drop a spreadsheet here</p>
          <p className="mt-1 text-xs leading-5 text-zinc-600">CSV or Excel .xlsx, up to 10 MB</p>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 text-sm font-medium text-zinc-300 underline decoration-zinc-600 underline-offset-4 transition hover:text-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20">Choose a file</button>
        </div>

        {selectedFile ? (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/[0.09] bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Icon name="article" className="h-5 w-5 shrink-0 text-zinc-400" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-100">{selectedFile.name}</p>
                <p className="mt-0.5 text-xs text-zinc-600">{readableFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>Remove</Button>
              <Button icon="upload" onClick={uploadNames} disabled={uploading}>{uploading ? "Replacing..." : "Replace names database"}</Button>
            </div>
          </div>
        ) : null}

        {error ? <div className="mt-4 rounded-xl border border-rose-400/15 bg-rose-400/[0.07] px-4 py-3 text-sm text-rose-300" role="alert">{error}</div> : null}
        {result ? (
          <div className="mt-4 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.07] px-4 py-3 text-sm text-emerald-200" role="status">
            Replaced with {Number(result.count || 0).toLocaleString()} names. {result.skipped ? `${result.skipped} incomplete or duplicate rows were skipped.` : "Every row was imported."}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 border-t border-white/[0.08] pt-7 md:grid-cols-[minmax(0,1fr)_240px]" aria-labelledby="file-format-title">
        <div>
          <h3 id="file-format-title" className="text-sm font-semibold text-zinc-200">Spreadsheet format</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500">The first row must contain column headers.</p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/[0.08]">
            <div className="grid min-w-[520px] grid-cols-5 bg-white/[0.04] text-xs text-zinc-400">
              {["firstName", "lastName", "grade", "house", "type"].map((field) => <span key={field} className="border-r border-white/[0.07] px-3 py-2.5 last:border-r-0">{field}</span>)}
            </div>
            <div className="grid min-w-[520px] grid-cols-5 text-xs text-zinc-600">
              {["Maya", "Johnson", "11", "Global", "Student"].map((value) => <span key={value} className="border-r border-white/[0.07] px-3 py-2.5 last:border-r-0">{value}</span>)}
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-zinc-600">Required: firstName and lastName. Optional: grade, house, type, email, and title.</p>
        </div>
        <div className="md:border-l md:border-white/[0.08] md:pl-6">
          <p className="text-xs font-medium text-zinc-400">Last replacement</p>
          <p className="mt-2 text-sm text-zinc-300">{summary.updatedAt ? formatDisplayDate(summary.updatedAt) : "No upload recorded"}</p>
          {summary.updatedBy ? <p className="mt-1 text-xs text-zinc-600">by {summary.updatedBy}</p> : null}
          {summary.sourceFile ? <p className="mt-3 break-all text-xs text-zinc-600">{summary.sourceFile}</p> : null}
        </div>
      </section>
    </div>
  );
}

function SettingsPage({ workspace, currentUser, csrfToken = "", setToast = () => {}, onWorkspaceUpdated = () => {}, locationPath = "/settings" }) {
  const startingSettings = workspaceSettingsDraft(workspace);
  const [draft, setDraft] = useState(startingSettings);
  const [savedSettings, setSavedSettings] = useState(startingSettings);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [copied, setCopied] = useState(false);
  const canManageWorkspace = ["owner", "admin"].includes(normalizeAppRole(currentUser?.role));
  const requestedSection = settingsSectionForPath(locationPath);
  const activeSection = canManageWorkspace ? requestedSection : "workspace";
  const isDirty = Object.keys(savedSettings).some((key) => draft[key] !== savedSettings[key]);

  useEffect(() => {
    if (!canManageWorkspace && requestedSection !== "workspace") {
      window.history.replaceState(null, "", "/settings");
      window.dispatchEvent(new Event("falcon-route-change"));
      return;
    }
    if (locationPath.toLowerCase().replace(/\/+$/, "") === "/admin") {
      window.history.replaceState(null, "", canManageWorkspace ? "/settings/administration" : "/settings");
      window.dispatchEvent(new Event("falcon-route-change"));
    }
  }, [canManageWorkspace, locationPath, requestedSection]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`${API_BASE}/api/workspace`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.ok === false) throw new Error(payload?.error || "Could not load workspace settings.");
        if (!active) return;
        const nextSettings = workspaceSettingsDraft(payload.workspace);
        setDraft(nextSettings);
        setSavedSettings(nextSettings);
        setJoinCode(asText(payload.workspace?.joinCode));
        onWorkspaceUpdated(payload.workspace);
      })
      .catch((error) => {
        if (active) setLoadError(error instanceof Error ? error.message : "Could not load workspace settings.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const updateDraft = (key, value) => {
    setSaveError("");
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const validateSettings = () => {
    if (!asText(draft.name)) return "Workspace name is required.";
    try {
      const publicationUrl = new URL(asText(draft.publicationUrl));
      if (!publicationUrl.hostname || !["http:", "https:"].includes(publicationUrl.protocol)) throw new Error();
    } catch {
      return "Enter a valid publication URL beginning with http:// or https://.";
    }
    return "";
  };

  const saveSettings = async () => {
    if (!canManageWorkspace || saving || !isDirty) return;
    const validationError = validateSettings();
    if (validationError) {
      setSaveError(validationError);
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const response = await fetch(`${API_BASE}/api/workspace`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          name: asText(draft.name),
          publicationUrl: asText(draft.publicationUrl).replace(/\/$/, ""),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) throw new Error(payload?.error || "Could not save workspace settings.");
      const nextSettings = workspaceSettingsDraft(payload.workspace);
      setDraft(nextSettings);
      setSavedSettings(nextSettings);
      setJoinCode(asText(payload.workspace?.joinCode));
      onWorkspaceUpdated(payload.workspace);
      setToast("Workspace settings saved.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save workspace settings.");
    } finally {
      setSaving(false);
    }
  };

  const copyCode = async () => {
    if (!joinCode) return;
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setLoadError("Copy failed. Select the code and copy it manually.");
    }
  };

  return (
    <PageShell title="Settings" description="" className="max-w-[1380px]">
      <SettingsNavigation activeSection={activeSection} canManageWorkspace={canManageWorkspace} />
      <section
        className={cx(
          "mt-7 min-w-0",
          activeSection !== "administration" && "rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-2xl shadow-black/15 sm:p-7"
        )}
      >
          {activeSection === "workspace" ? (
            <WorkspaceSettings
              draft={draft}
              updateDraft={updateDraft}
              loading={loading}
              saving={saving}
              canManageWorkspace={canManageWorkspace}
              isDirty={isDirty}
              loadError={loadError}
              saveError={saveError}
              saveSettings={saveSettings}
              joinCode={joinCode}
              copied={copied}
              copyCode={copyCode}
            />
          ) : null}
          {activeSection === "names" ? <NamesDatabaseSettings csrfToken={csrfToken} setToast={setToast} /> : null}
          {activeSection === "administration" ? (
            <AdministrationSettings
              setToast={setToast}
              csrfToken={csrfToken}
              currentUser={currentUser}
            />
          ) : null}
      </section>
    </PageShell>
  );
}
