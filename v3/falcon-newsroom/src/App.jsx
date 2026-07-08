import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AnimatedDropdown from "./components/ui/animated-dropdown";

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
  { id: "admin", label: "Admin", icon: "admin" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const navSections = [
  { id: "editorial", label: "Editorial desk", items: ["dashboard", "pitches", "stories"] },
  { id: "records", label: "Databases", items: ["articles", "interviewees"] },
  { id: "planning", label: "Planning", items: ["calendar", "analytics"] },
  { id: "system", label: "Workspace", items: ["admin", "settings"] },
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
    role: "viewer",
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
    id: "viewer",
    label: "Viewer",
    description: "Can view records, but cannot access stories, pitches, or admin tools.",
  },
];

const ADMIN_ROLE_OPTIONS = ADMIN_ROLES.map((role) => role.id);
const ADMIN_ROLE_FILTER_OPTIONS = ["All roles", ...ADMIN_ROLE_OPTIONS];

const trafficData = [
  { label: "Mon", views: 1280, visitors: 890 },
  { label: "Tue", views: 1620, visitors: 1120 },
  { label: "Wed", views: 2740, visitors: 1860 },
  { label: "Thu", views: 3680, visitors: 2520 },
  { label: "Fri", views: 3120, visitors: 2210 },
  { label: "Sat", views: 1880, visitors: 1305 },
  { label: "Sun", views: 2140, visitors: 1490 },
];

const sectionData = [
  { name: "News", value: 32 },
  { name: "Sports", value: 21 },
  { name: "Tech", value: 28 },
  { name: "Culture", value: 12 },
  { name: "Features", value: 7 },
];


const STORY_STATUSES = ["Assigned", "Reporting", "Drafting", "Submitted", "In Review", "Needs Revision", "Returned", "Ready for Publish", "Published"];
const STORY_FILTER_STATUSES = ["All statuses", ...STORY_STATUSES];
const STORY_FILTER_SECTIONS = ["All sections", "News", "Features", "Sports", "Culture", "Opinion", "Science & Technology", "Photo"];
const ACTIVE_STORY_STATUSES = STORY_STATUSES.filter((status) => status !== "Published");
const STORY_COLLABORATOR_ROLE_OPTIONS = [
  { id: "comment", label: "Can comment", description: "Can view and comment on the story." },
  { id: "edit", label: "Can edit", description: "Can view, comment, and attach work." },
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

const ACTIVE_PITCH_STATUSES = ["New", "Needs Review"];
const PITCH_STATUSES = [...ACTIVE_PITCH_STATUSES, "Approved", "On Hold"];
const PITCH_SECTIONS = ["All sections", "News", "Features", "Sports", "Culture", "Opinion", "Science & Technology", "Photo"];
const PITCH_WRITERS = ["Ava Patel", "Daniel Wu", "Iris Park", "Lena Brooks", "Marcus Lee", "Sofia Chen"];

const initialPitches = [
  {
    id: "p1",
    title: "How student clubs are rethinking recruitment",
    angle: "Look at how clubs are moving beyond hallway posters and using short-form video, interest forms, and peer referrals to find new members.",
    status: "Needs Review",
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
    status: "New",
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
    status: "Approved",
    section: "Sports",
    owner: "Daniel Wu",
    submittedAt: "May 11, 2026",
    notes: "Approved for a reported feature. Photo request should go in early.",
    editorFeedback: "Move forward. Keep the tone practical and avoid turning this into a medical advice piece.",
    comments: [{ id: "c4", author: "Ava", text: "Approved for next week's sports package.", time: "May 31, 2026" }],
    updatedAt: "May 31, 2026",
  },
  {
    id: "p4",
    title: "What makes a good cafeteria line move faster",
    angle: "Use observations and interviews to explain bottlenecks, lunch waves, and student suggestions.",
    status: "On Hold",
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
    status: "New",
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
    status: "Needs Review",
    section: "Culture",
    owner: "Ava Patel",
    submittedAt: "May 12, 2026",
    notes: "Could include photos of planner layouts if students agree.",
    editorFeedback: "Fun, but it needs a sharper nut graf. Find the larger behavior behind the trend.",
    comments: [{ id: "c6", author: "Iris", text: "I know two students who would talk about this.", time: "June 1, 2026" }],
    updatedAt: "June 1, 2026",
  },
];

const cx = (...classes) => classes.filter(Boolean).join(" ");
const fmt = (n) => n.toLocaleString("en-US");
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const FALLBACK_ACCOUNT = {
  email: "",
  firstName: "Newsroom",
  lastName: "User",
  role: "viewer",
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
  return value ? value[0].toUpperCase() + value.slice(1) : "Viewer";
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

function normalizeDisplayActivity(item = {}) {
  return {
    ...item,
    time: formatDisplayDate(item.time || item.createdAt),
  };
}

function normalizeStoryCollaborator(item = {}) {
  const email = asText(item.email).toLowerCase();
  const role = STORY_COLLABORATOR_ROLE_OPTIONS.some((option) => option.id === item.role) ? item.role : "comment";
  return {
    ...item,
    id: asText(item.id || item.userId || email),
    userId: asText(item.userId || item.id),
    email,
    name: asText(item.name) || email || "Collaborator",
    role,
    invitedAt: formatDisplayDate(item.invitedAt),
  };
}

function storyCollaboratorRoleLabel(role) {
  return STORY_COLLABORATOR_ROLE_OPTIONS.find((option) => option.id === role)?.label || "Can comment";
}

function storyCollaboratorRoleDescription(role) {
  return STORY_COLLABORATOR_ROLE_OPTIONS.find((option) => option.id === role)?.description || STORY_COLLABORATOR_ROLE_OPTIONS[0].description;
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
  return {
    ...pitch,
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
  return ADMIN_ROLE_OPTIONS.includes(value) ? value : "viewer";
}

function canManageEditorialWorkflow(role) {
  return ["admin", "editor"].includes(normalizeAppRole(role));
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
  if (role === "viewer") return false;
  if (role === "writer") return storyBelongsToUser(story, user) || Boolean(storyCollaboratorForUser(story, user));
  return true;
}

function canSubmitOwnStory(user, story) {
  if (normalizeAppRole(user?.role) !== "writer" || !storyBelongsToUser(story, user)) return false;
  return !["Submitted", "In Review", "Ready for Publish", "Published"].includes(story.status);
}

function canUnsubmitOwnStory(user, story) {
  return normalizeAppRole(user?.role) === "writer"
    && storyBelongsToUser(story, user)
    && story?.status === "Submitted";
}

function canUpdateOwnStorySubmission(user, story) {
  return canSubmitOwnStory(user, story) || canUnsubmitOwnStory(user, story);
}

function canManageStoryCollaborators(user, story) {
  const role = normalizeAppRole(user?.role);
  return ["admin", "editor"].includes(role) || (role === "writer" && storyBelongsToUser(story, user));
}

function canEditStoryAttachment(user, story) {
  if (canManageEditorialWorkflow(user?.role)) return true;
  if (normalizeAppRole(user?.role) !== "writer") return false;
  if (storyBelongsToUser(story, user)) return true;
  return storyCollaboratorForUser(story, user)?.role === "edit";
}

function canCommentOnStory(user, story) {
  if (canManageEditorialWorkflow(user?.role)) return true;
  return normalizeAppRole(user?.role) === "writer" && (storyBelongsToUser(story, user) || Boolean(storyCollaboratorForUser(story, user)));
}

function navItemsForRole(role) {
  const currentRole = normalizeAppRole(role);
  return navItems.filter((item) => {
    if (item.id === "admin") return currentRole === "admin";
    if (item.id === "pitches" || item.id === "stories") return currentRole !== "viewer";
    return true;
  });
}

function roleCanAccessPage(role, page) {
  return navItemsForRole(role).some((item) => item.id === page);
}

function defaultPageForRole(role) {
  const currentRole = normalizeAppRole(role);
  if (currentRole === "viewer") return "interviewees";
  if (currentRole === "writer") return "stories";
  return "dashboard";
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

function storyDocIsOpenable(story) {
  return storyAttachmentItems(story).length > 0;
}

function normalizeStoryAttachment(story, attachment) {
  if (!attachment) return null;
  if (attachment?.type === "drive" && attachment.url) {
    return {
      id: attachment.id || attachment.fileId || attachment.url,
      type: "drive",
      provider: "google-drive",
      url: attachment.webViewLink || attachment.url,
      name: attachment.name || story?.title || "Drive file",
      detail: attachment.typeLabel || workAttachmentTypeLabel(attachment),
      permissionStatus: attachment.permissionStatus || "not_shared",
      shareResults: Array.isArray(attachment.shareResults) ? attachment.shareResults : [],
      copyable: true,
    };
  }
  if (attachment?.type === "file" && attachment.url) {
    return {
      id: attachment.id || attachment.url,
      type: "file",
      url: attachment.url,
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
  return "";
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
    story.writer,
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
        setActivity(Array.isArray(payload.activity) ? payload.activity.map(normalizeDisplayActivity) : []);
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
  if (status === "Approved") return "green";
  if (status === "Needs Review") return "blue";
  if (status === "On Hold") return "amber";
  return "neutral";
}

function isActivePitch(pitch) {
  return ACTIVE_PITCH_STATUSES.includes(pitch.status);
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
  if (status === "Needs Review") return "bg-sky-400";
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

function matchesPitchFilters(pitch, query, section, statusFilter = "All Active") {
  if (!isActivePitch(pitch)) return false;
  const needle = query.trim().toLowerCase();
  if (needle && !pitchSearchText(pitch).includes(needle)) return false;
  if (section !== "All sections" && pitch.section !== section) return false;
  if (statusFilter !== "All Active" && pitch.status !== statusFilter) return false;
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

function nextActivePitchId(activePitches, currentId) {
  if (!activePitches.length) return null;
  const currentIndex = activePitches.findIndex((pitch) => pitch.id === currentId);
  if (currentIndex === -1) return activePitches[0].id;
  return activePitches[(currentIndex + 1) % activePitches.length]?.id || null;
}

function initialPitchDetailId() {
  const match = window.location.pathname.match(/^\/pitches\/([^/]+)/i);
  return match ? decodeURIComponent(match[1]) : null;
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
  console.assert(users.filter((user) => adminUserMatches(user, "", "viewer")).every((user) => user.role === "viewer"), "Admin role filter should limit visible staff.");
  console.assert(navItemsForRole("viewer").every((item) => !["pitches", "stories", "admin"].includes(item.id)), "Viewers should not see story, pitch, or admin navigation.");
  console.assert(navItemsForRole("writer").some((item) => item.id === "stories") && !navItemsForRole("writer").some((item) => item.id === "admin"), "Writers should see stories but not admin.");
}
runAdminPageTests();

function runPrototypeTests() {
  console.assert(navItems.length === 9, "Navigation should include the visible primary tabs.");
  console.assert(navItems.some((item) => item.id === "stories" && item.label === "Stories"), "Navigation should include Stories.");
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
  console.assert(storyVisibleToUser(ownedDraft, writerUser), "Writers should see their own stories.");
  console.assert(!storyVisibleToUser(otherDraft, writerUser), "Writers should not see other writers' stories.");
  console.assert(!storyVisibleToUser(sameNameDifferentEmail, writerUser), "Writers should not inherit ownership from matching display names.");
  console.assert(canSubmitOwnStory(writerUser, ownedDraft), "Writers should be able to submit their own active drafts.");
  console.assert(!canSubmitOwnStory({ ...writerUser, role: "editor" }, ownedDraft), "Editors should not use the writer submit action.");
  console.assert(canEditStoryAttachment({ ...writerUser, role: "editor" }, otherDraft), "Editors should be able to add work to any visible story.");
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
  console.assert(initialArticles.some((a) => a.status === "Published"), "Prototype needs published article data.");
  console.assert(initialTasks.every((t) => t.id && t.title && t.status), "Every task needs id, title, and status.");
  console.assert(PITCH_STATUSES.every((status) => initialPitches.some((pitch) => pitch.status === status)), "Pitch board needs examples for each status.");
  console.assert(matchesPitchFilters(initialPitches[0], "clubs", "All sections"), "Pitch search should include title and angle text.");
  console.assert(!matchesPitchFilters(initialPitches[2], "", "All sections"), "Approved pitches should stay out of the active board.");
  console.assert(groupActivePitchesByWriter(initialPitches.filter(isActivePitch)).every((group) => group.pitches.every(isActivePitch)), "Writer groups should include active pitches only.");
  console.assert(groupActivePitchesByWriter([
    { ...initialPitches[0], owner: "Alex Lee", ownerEmail: "alex.one@example.com", ownerUserId: "u1" },
    { ...initialPitches[1], owner: "Alex Lee", ownerEmail: "alex.two@example.com", ownerUserId: "u2" },
  ]).length === 2, "Pitch board should separate owners with matching names and different accounts.");
  console.assert(pitchNoteCount({ notes: "", comments: [] }) === 0, "Pitch note count should allow zero.");
  console.assert(sectionData.reduce((sum, s) => sum + s.value, 0) === 100, "Section analytics should total 100 percent.");
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

function Button({ children, icon, variant = "primary", className = "", onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100",
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

function Input({ value, onChange, placeholder, className = "" }) {
  return (
    <div className={cx("flex h-11 items-center gap-2 rounded-xl border border-white/[0.08] bg-black/25 px-3 text-sm text-zinc-500", className)}>
      <Icon name="search" className="h-4 w-4" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-zinc-200 outline-none placeholder:text-zinc-600" />
    </div>
  );
}

function Select({ value, onChange, options, className = "" }) {
  return (
    <div className={cx("relative", className)}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 pr-9 text-sm text-zinc-200 outline-none hover:bg-white/[0.06]">
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

function TooltipBox({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.12] bg-zinc-950/95 p-3 shadow-2xl shadow-black/40">
      <p className="mb-2 text-xs text-zinc-500">{label}</p>
      {payload.map((item) => (
        <div key={item.dataKey || item.name} className="flex min-w-36 items-center justify-between gap-6 text-sm">
          <span className="capitalize text-zinc-400">{item.dataKey || item.name}</span>
          <span className="font-medium text-zinc-100">{typeof item.value === "number" ? fmt(item.value) : item.value}</span>
        </div>
      ))}
    </div>
  );
}

function initialAppPage() {
  const pathPage = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, "");
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
  return match ? decodeURIComponent(match[1]) : null;
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

const landingWorkflowSteps = [
  {
    label: "Pitch",
    title: "Start from a real assignment queue.",
    body: "Editors see what writers are proposing, what needs a decision, and which drafts are ready to move.",
  },
  {
    label: "Draft",
    title: "Keep the article in Google Docs.",
    body: "Line edits and comments stay in the Doc, while Falcon keeps the link, status, deadline, and editor context close.",
  },
  {
    label: "Review",
    title: "Make the next step obvious.",
    body: "Submitted, in review, needs revision, ready for publish, returned, and published all read as plain workflow states.",
  },
  {
    label: "Publish",
    title: "Carry records into the archive.",
    body: "Article metadata, sources, interviewees, and publication details stay connected after the story leaves the draft queue.",
  },
];

const landingDeskRows = [
  ["Senior Parking Rules", "Submitted", "June 2, 2026"],
  ["Robotics Build Week", "Needs Revision", "May 20"],
  ["Cafeteria Menu Changes", "Ready for Publish", "May 21"],
];

function LandingPage() {
  const reduceMotion = useReducedMotion();
  const revealInitial = reduceMotion ? false : { opacity: 0, y: 18 };
  const revealAnimate = { opacity: 1, y: 0 };
  const revealTransition = { duration: 0.7, ease: [0.19, 1, 0.22, 1] };

  return (
    <main className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-title">
        <LandingDeskScene />
        <nav className="landing-nav" aria-label="Landing navigation">
          <a href="/" className="landing-mark" aria-label="Falcon Newsroom home">
            <span>F</span>
            <strong>Falcon Newsroom</strong>
          </a>
          <div className="landing-nav-links">
            <a href="#workflow">Workflow</a>
            <a href="#review">Docs review</a>
            <a href="/dashboard">Open app</a>
          </div>
        </nav>

        <div className="landing-hero-copy">
          <p className="landing-kicker">For student editors and advisers</p>
          <h1 id="landing-title">Falcon Newsroom</h1>
          <p className="landing-hero-lede">
            Move school journalism from scattered Classroom submissions to one live editorial desk.
          </p>
          <p className="landing-hero-body">
            Pitches, Google Doc drafts, deadlines, sources, and publish-ready review stay visible without pulling writers out of the tools they already use.
          </p>
          <div className="landing-mobile-queue" aria-hidden="true">
            <span>Draft queue: 3 ready</span>
          </div>
          <div className="landing-actions" aria-label="Primary actions">
            <a className="landing-action-primary" href="/dashboard">Open newsroom</a>
            <a className="landing-action-secondary" href="/stories">Review stories</a>
          </div>
        </div>
      </section>

      <section id="workflow" className="landing-section landing-section-flow" aria-labelledby="workflow-title">
        <div className="landing-section-heading">
          <p className="landing-kicker">Editorial flow</p>
          <h2 id="workflow-title">Every draft has a next move.</h2>
          <p>
            Falcon gives editors the review queue Google Classroom never quite becomes, while Google Docs remains the place for line edits and detailed feedback.
          </p>
        </div>
        <ol className="landing-workflow-list">
          {landingWorkflowSteps.map((step, index) => (
            <motion.li
              key={step.label}
              initial={revealInitial}
              whileInView={revealAnimate}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ ...revealTransition, delay: reduceMotion ? 0 : index * 0.06 }}
            >
              <span>{step.label}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      <section id="review" className="landing-section landing-section-review" aria-labelledby="review-title">
        <motion.div
          className="landing-review-copy"
          initial={revealInitial}
          whileInView={revealAnimate}
          viewport={{ once: true, amount: 0.35 }}
          transition={revealTransition}
        >
          <p className="landing-kicker">Docs stay central</p>
          <h2 id="review-title">Open the draft first. Update the workflow second.</h2>
          <p>
            Editors can jump straight into the Google Doc, return a draft, mark it ready, or link a missing Doc without turning review into another inbox.
          </p>
        </motion.div>
        <motion.div
          className="landing-doc-rail"
          aria-label="Google Doc workflow preview"
          initial={revealInitial}
          whileInView={revealAnimate}
          viewport={{ once: true, amount: 0.25 }}
          transition={revealTransition}
        >
          <div className="landing-doc-title">Robotics Build Week</div>
          <div className="landing-doc-meta">By Daniel Wu, editor: Ava Patel</div>
          <div className="landing-doc-action">Open Google Doc</div>
          <div className="landing-doc-action landing-doc-action-secondary">Status: Needs Revision</div>
          <p>Scene detail needed. Clarify the competition stakes before another editor pass.</p>
        </motion.div>
      </section>

      <section className="landing-section landing-section-fit" aria-labelledby="fit-title">
        <div className="landing-section-heading">
          <p className="landing-kicker">Why it fits a newsroom</p>
          <h2 id="fit-title">Designed around deadlines, not dashboards.</h2>
        </div>
        <div className="landing-fit-grid">
          <div>
            <h3>For editors</h3>
            <p>See which drafts need attention, who owns them, and where the feedback belongs.</p>
          </div>
          <div>
            <h3>For writers</h3>
            <p>Keep working in Docs while the submission stays visible to the newsroom.</p>
          </div>
          <div>
            <h3>For advisers</h3>
            <p>Check the publication pipeline without rebuilding the whole class workflow.</p>
          </div>
        </div>
      </section>

      <section className="landing-final" aria-labelledby="final-title">
        <div>
          <p className="landing-kicker">Ready for the copy desk</p>
          <h2 id="final-title">Give every story a visible path from pitch to publish.</h2>
        </div>
        <a className="landing-action-primary" href="/dashboard">Enter Falcon Newsroom</a>
      </section>
    </main>
  );
}

function LandingDeskScene() {
  return (
    <div className="landing-desk-scene" aria-hidden="true">
      <div className="landing-desk-grid" />
      <div className="landing-paper landing-paper-main">
        <div className="landing-paper-heading">
          <span>Draft queue</span>
          <strong>May issue</strong>
        </div>
        {landingDeskRows.map((row) => (
          <div className="landing-paper-row" key={row[0]}>
            <span>{row[0]}</span>
            <span>{row[1]}</span>
            <span>{formatDisplayDate(row[2]) || row[2]}</span>
          </div>
        ))}
      </div>
      <div className="landing-paper landing-paper-doc">
        <div className="landing-doc-lines">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="landing-editor-note">Comment: tighten the nut graf</div>
      </div>
      <div className="landing-deadline-strip">Deadline: June 2, 2026</div>
      <div className="landing-source-strip">Sources confirmed: 5</div>
    </div>
  );
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
  const [csrfToken, setCsrfToken] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const selectedArticle = articles.find((a) => a.id === selectedArticleId) || articles[0];
  const accountRole = normalizeAppRole(account?.role);
  const availableNavItems = navItemsForRole(accountRole);
  const availableNavSections = navSectionsForItems(availableNavItems);

  useEffect(() => {
    const syncLocationPath = () => setLocationPath(window.location.pathname);
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
      try {
        const response = await fetch(`${API_BASE}/api/auth/session`, {
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        const payload = await response.json();
        if (!active) return;
        if (!response.ok || payload?.ok === false) {
          throw new Error(payload?.error || "Unable to verify your session.");
        }
        if (!payload?.authenticated) {
          window.location.replace(loginRedirectForCurrentPath());
          return;
        }
        setAccount(normalizeDisplayUser(payload.user || FALLBACK_ACCOUNT));
        setCsrfToken(payload.csrfToken || "");
      } catch (error) {
        if (!active) return;
        setToast(error instanceof Error ? error.message : "Unable to verify your session.");
      }
    }

    loadSession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!account) return;
    if (!roleCanAccessPage(accountRole, page)) {
      const nextPage = defaultPageForRole(accountRole);
      setToast(`${accountRoleLabel(accountRole)} access does not include ${navItems.find((item) => item.id === page)?.label || page}.`);
      setPage(nextPage);
      pushAppPath(pagePath(nextPage));
    }
  }, [account, accountRole, page]);

  useEffect(() => {
    if (!account) return undefined;
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

    if (accountRole === "viewer") {
      setStories([]);
      setStoriesError("Stories are not available to viewers.");
      setStoriesLoading(false);
      return undefined;
    }

    loadStories();
    return () => controller.abort();
  }, [account, accountRole]);

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

  const updateStoryStatus = async (id, status) => {
    const currentStory = stories.find((story) => story.id === id);
    if (status === "Submitted" && canSubmitOwnStory(account, currentStory) && !storyAttachmentItems(currentStory).length) {
      setToast("Attach work before submitting this story.");
      return;
    }
    const canReturnStory = canManageEditorialWorkflow(accountRole) && status === "Returned";
    const canSendToTeacherApproval = canManageEditorialWorkflow(accountRole) && status === "Ready for Publish";
    const canUseWriterWorkflow =
      (status === "Submitted" && canSubmitOwnStory(account, currentStory)) ||
      (status === "Drafting" && canUnsubmitOwnStory(account, currentStory));
    if (!canReturnStory && !canSendToTeacherApproval && !canUseWriterWorkflow) {
      setToast(canManageEditorialWorkflow(accountRole) ? "Editors can return stories or send them to teacher approval." : "Writers can submit or unsubmit their own stories.");
      return;
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
        body: JSON.stringify({ status }),
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
      setToast(`Updated story to ${status}.`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Story status update failed.");
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

  const breadcrumbDetail = useMemo(() => {
    const normalizedPath = locationPath.toLowerCase();
    if (page === "stories" && normalizedPath.startsWith("/stories/")) {
      const id = initialStoryDetailId();
      return stories.find((story) => story.id === id)?.title || "Story review";
    }
    if (page === "pitches" && normalizedPath.startsWith("/pitches/")) {
      return "Pitch review";
    }
    return "";
  }, [locationPath, page, stories]);

  const pages = {
    dashboard: <DashboardPage articles={articles} tasks={tasks} setPage={setPage} setSelectedArticleId={setSelectedArticleId} />,
    pitches: <PitchBoardPage setToast={setToast} csrfToken={csrfToken} currentUser={account || FALLBACK_ACCOUNT} onStoryCreated={handleStoryCreatedFromPitch} />,
    stories: <StoriesPage stories={stories} loading={storiesLoading} error={storiesError} currentUser={account || FALLBACK_ACCOUNT} csrfToken={csrfToken} updateStoryStatus={updateStoryStatus} updateStoryDocLink={updateStoryDocLink} clearStoryAttachment={clearStoryAttachment} uploadStoryAttachment={uploadStoryAttachment} attachDriveFileToStory={attachDriveFileToStory} inviteStoryCollaborators={inviteStoryCollaborators} removeStoryCollaborator={removeStoryCollaborator} setToast={setToast} />,
    pipeline: <PipelinePage articles={articles} updateArticleStatus={updateArticleStatus} setSelectedArticleId={setSelectedArticleId} setPage={setPage} />,
    articles: <ArticlesPage extractorOpen={articleExtractorOpen} setExtractorOpen={setArticleExtractorOpen} setToast={setToast} />,
    interviewees: <IntervieweesPage currentUser={account || FALLBACK_ACCOUNT} csrfToken={csrfToken} setToast={setToast} />,
    tasks: <TasksPage tasks={tasks} updateTaskStatus={updateTaskStatus} />,
    calendar: <CalendarPage stories={stories} onOpenStory={(story) => { setPage("stories"); pushAppPath(storyDetailPath(story.id)); }} />,
    analytics: <AnalyticsPage />,
    admin: <AdminPage setToast={setToast} csrfToken={csrfToken} currentUser={account || FALLBACK_ACCOUNT} />,
    settings: <SettingsPage />,
  };

  return (
    <div className="h-screen overflow-hidden bg-[#08090c] text-zinc-100">
      <div className="relative flex h-screen overflow-hidden">
        <aside className="hidden h-screen w-72 shrink-0 flex-col overflow-hidden border-r border-white/[0.08] bg-[#08090c]/80 p-4 backdrop-blur-xl lg:flex">
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <button onClick={() => navigatePage("dashboard")} className="mb-7 flex w-full items-center gap-3 rounded-xl px-2 py-1 text-left hover:bg-white/[0.035] focus:outline-none focus:ring-2 focus:ring-white/15">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-500 text-sm font-bold text-black">F</div>
              <div>
                <div className="text-sm font-medium text-zinc-100">Falcon Newsroom</div>
                <div className="text-xs text-zinc-500">Poolesville Pulse</div>
              </div>
            </button>

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
              <div className="flex items-center gap-3 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-sm font-bold text-black">F</div>
                <span className="font-medium">Falcon</span>
              </div>
              <HeaderBreadcrumb page={page} detailLabel={breadcrumbDetail} navigatePage={navigatePage} />
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

function AccountMenu({ user, signingOut, onSignOut }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const displayName = accountDisplayName(user);
  const email = asText(user?.email);
  const initials = accountInitials(user);
  const roleLabel = accountRoleLabel(user?.role);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative border-t border-white/[0.08] pt-3">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open user menu"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-white/[0.035] focus:outline-none focus:ring-2 focus:ring-white/15"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-xs font-semibold text-zinc-100">
          {initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-zinc-100">{displayName}</span>
          <span className="mt-0.5 block truncate text-xs text-zinc-500">{roleLabel}</span>
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="User account"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute bottom-[calc(100%+0.5rem)] left-0 z-[1000] w-full min-w-64 overflow-hidden rounded-xl border border-white/[0.1] bg-[#0d0e12] shadow-2xl shadow-black/50"
          >
            {email ? <div className="truncate px-3 py-3 text-sm text-zinc-400">{email}</div> : null}
            <div className="h-px bg-white/[0.08]" />
            <button
              type="button"
              role="menuitem"
              disabled={signingOut}
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-white/[0.05] hover:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/15 disabled:cursor-not-allowed disabled:text-zinc-600"
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
  if (!message) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-white/[0.08] bg-zinc-950/95 p-4 shadow-2xl shadow-black/50 backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-zinc-200">{message}</p>
        </div>
        <button type="button" onClick={onDismiss} className="text-xs text-zinc-600 hover:text-zinc-300">
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}

function QuickCreateModal() {
  return null;
}

function DashboardPage({ articles, tasks, setPage, setSelectedArticleId }) {
  const [databaseStats, setDatabaseStats] = useState({
    articles: null,
    interviews: null,
    loading: true,
    error: "",
  });

  useEffect(() => {
    const controller = new AbortController();

    const loadDatabaseStats = async () => {
      try {
        const [articlesResponse, interviewsResponse] = await Promise.all([
          fetch(`${API_BASE}/api/article-records?page=1&limit=1`, {
            headers: { Accept: "application/json" },
            credentials: "include",
            signal: controller.signal,
          }),
          fetch(`${API_BASE}/api/interview-records`, {
            headers: { Accept: "application/json" },
            credentials: "include",
            signal: controller.signal,
          }),
        ]);
        const [articlesPayload, interviewsPayload] = await Promise.all([
          articlesResponse.json().catch(() => ({})),
          interviewsResponse.json().catch(() => ({})),
        ]);

        if (!articlesResponse.ok || articlesPayload.ok !== true) {
          throw new Error(articlesPayload.error || "Article records unavailable.");
        }
        if (!interviewsResponse.ok || interviewsPayload.ok !== true) {
          throw new Error(interviewsPayload.error || "Interview records unavailable.");
        }

        setDatabaseStats({
          articles: Number(articlesPayload.total) || 0,
          interviews: Number(interviewsPayload.total) || (Array.isArray(interviewsPayload.people) ? interviewsPayload.people.length : 0),
          loading: false,
          error: "",
        });
      } catch (err) {
        if (err.name === "AbortError") return;
        setDatabaseStats({
          articles: null,
          interviews: null,
          loading: false,
          error: err.message || "Database totals unavailable.",
        });
      }
    };

    loadDatabaseStats();
    return () => controller.abort();
  }, []);

  const articleTotal = databaseStats.loading ? "..." : databaseStats.error ? "-" : fmt(databaseStats.articles || 0);
  const interviewTotal = databaseStats.loading ? "..." : databaseStats.error ? "-" : fmt(databaseStats.interviews || 0);

  return (
    <PageShell title="Newsroom dashboard" eyebrow="Home / Command center">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon="article" label="Articles active" value={articleTotal} />
        <Metric icon="eye" label="Views this week" value="16,460" delta="+18.4%" />
        <Metric icon="people" label="Interviews logged" value={interviewTotal} />
        <Metric icon="task" label="Tasks due" value={tasks.filter((t) => t.status !== "Done").length} delta="2 high priority" warn />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="p-5">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="font-medium text-zinc-50">This week in traffic</h2>
              <p className="mt-1 text-sm text-zinc-500">Views and visitors across published stories.</p>
            </div>
            <StatusBadge tone="green">Live mock data</StatusBadge>
          </div>
          <div className="h-[320px]">
            <TrafficChart />
          </div>
        </Card>
        <Card className="p-5">
          <div className="mb-5">
            <h2 className="font-medium text-zinc-50">Top performing articles</h2>
            <p className="mt-1 text-sm text-zinc-500">Click any story to inspect details.</p>
          </div>
          <div className="space-y-2">
            {articles
              .slice()
              .sort((a, b) => b.views - a.views)
              .slice(0, 5)
              .map((article, idx) => (
                <button key={article.id} type="button" onClick={() => { setSelectedArticleId(article.id); setPage("articles"); }} className="group flex w-full items-center justify-between gap-4 rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-white/[0.08] hover:bg-white/[0.04]">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs text-zinc-500">{idx + 1}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-zinc-300 group-hover:text-zinc-50">{article.title}</p>
                      <p className="text-xs text-zinc-600">{article.section}</p>
                    </div>
                  </div>
                  <span className="text-sm text-zinc-400">{fmt(article.views)}</span>
                </button>
              ))}
          </div>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">Editorial activity</h2>
            <Button variant="ghost" onClick={() => setPage("tasks")}>
              View all
            </Button>
          </div>
          <ActivityFeed />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-medium">AI suggestions</h2>
          <div className="space-y-3">
            <Insight title="Follow-up opportunity" body="The Snapchat article has high search traffic. Assign an explainer about exporting memories." />
            <Insight title="Source diversity" body="Current tech coverage leans upperclassmen. Add freshman and sophomore interviews." />
            <Insight title="Publishing rhythm" body="Thursday afternoon had peak engagement. Schedule social posts then." />
          </div>
        </Card>
      </section>
    </PageShell>
  );
}

function Metric({ icon, label, value, delta, warn }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.045]">
          <Icon name={icon} />
        </div>
        {delta && <StatusBadge tone={warn ? "amber" : "green"}>{delta}</StatusBadge>}
      </div>
      <p className="mt-5 text-sm text-zinc-500">{label}</p>
      <h3 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-50">{value}</h3>
    </Card>
  );
}

function TrafficChart() {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
      <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fafafa" stopOpacity={0.22} />
            <stop offset="95%" stopColor="#fafafa" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
        <Tooltip content={<TooltipBox />} />
        <Area type="monotone" dataKey="views" stroke="#fafafa" strokeWidth={2} fill="url(#g)" />
        <Line type="monotone" dataKey="visitors" stroke="#a1a1aa" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ActivityFeed() {
  const feed = [
    "Sofia submitted Snapchat story for final review",
    "Marcus added two athlete interviews",
    "Ava moved parking article into Editing",
    "Daniel uploaded robotics build notes",
    "Maya approved the weekly publishing plan",
  ];
  const feedDate = monthDayYear(new Date());
  return (
    <div className="space-y-3">
      {feed.map((item, index) => (
        <div key={item} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
          <div className="mt-1 h-2 w-2 rounded-full bg-zinc-300" />
          <div>
            <p className="text-sm text-zinc-300">{item}</p>
            <p className="mt-1 text-xs text-zinc-600">{feedDate}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Insight({ title, body }) {
  return (
    <div className="rounded-xl border border-violet-400/15 bg-violet-400/[0.055] p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-100">
        <Icon name="sparkles" className="h-4 w-4 text-violet-300" />
        {title}
      </div>
      <p className="text-xs leading-5 text-zinc-500">{body}</p>
    </div>
  );
}

function PitchBoardPage({ setToast, csrfToken = "", currentUser, onStoryCreated = () => {} }) {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailPitchId, setDetailPitchId] = useState(initialPitchDetailId);
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("All sections");
  const [statusFilter, setStatusFilter] = useState("All Active");
  const [expandedWriters, setExpandedWriters] = useState(() => new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const canManagePitches = canManageEditorialWorkflow(currentUser?.role);

  const loadPitches = async (signal) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/pitches`, {
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
    loadPitches(controller.signal);
    return () => controller.abort();
  }, []);

  const activePitches = useMemo(
    () => pitches.filter((pitch) => matchesPitchFilters(pitch, query, section, statusFilter)),
    [pitches, query, section, statusFilter]
  );
  const writerGroups = useMemo(() => groupActivePitchesByWriter(activePitches), [activePitches]);
  const detailPitch = pitches.find((pitch) => pitch.id === detailPitchId && isActivePitch(pitch)) || null;

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

  const nextIdAfter = (id) => nextActivePitchId(activePitches.filter((pitch) => pitch.id !== id), id);

  const updatePitchStatus = async (id, status, message, approval = {}) => {
    if (!canManagePitches) {
      setToast("Only admins and editors can change pitch status.");
      return null;
    }
    const approvedDueDate = status === "Approved" ? dueDateValue(approval) : "";
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
      const updatedStory = status === "Approved" && payload.story ? storyWithApprovedDueDate(payload.story, approvedDueDate) : payload.story;
      setPitches((previous) => previous.map((pitch) => (pitch.id === id ? { ...pitch, ...updatedPitch } : pitch)));
      if (status === "Approved" && updatedStory) {
        onStoryCreated(updatedStory);
      }
      setToast(payload.warning || message || `Updated pitch to ${status}.`);
      return { ...payload, pitch: updatedPitch, ...(updatedStory ? { story: updatedStory } : {}) };
    } catch (statusError) {
      setToast(statusError instanceof Error ? statusError.message : "Pitch status update failed.");
      return null;
    }
  };

  const moveOutOfActiveBoard = async (id, status, message, approval = {}) => {
    const nextId = nextIdAfter(id);
    const result = await updatePitchStatus(id, status, message, approval);
    if (!result) return null;
    if (nextId) navigateToPitch(nextId);
    else navigateToBoard();
    return result;
  };

  const deletePitch = (id) => {
    const nextId = nextIdAfter(id);
    setPitches((previous) => previous.filter((pitch) => pitch.id !== id));
    if (nextId) navigateToPitch(nextId);
    else navigateToBoard();
    setToast("Deleted pitch.");
  };

  const selectNextPitch = (currentId) => {
    const nextId = nextActivePitchId(activePitches, currentId);
    if (nextId) navigateToPitch(nextId);
  };

  const createPitch = async (draft) => {
    const title = draft.title.trim();
    if (!title) return;
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
          title,
          angle: draft.angle.trim() || "Angle to be developed.",
          section: draft.section,
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
      setStatusFilter("All Active");
      setExpandedWriters((previous) => new Set([...previous, pitchOwnerGroupKey(nextPitch)]));
      setCreateOpen(false);
      setToast("Created a new pitch.");
    } catch (createError) {
      setToast(createError instanceof Error ? createError.message : "Could not create pitch.");
    }
  };

  const markNeedsReview = (id, message) => {
    return updatePitchStatus(id, "Needs Review", message || "Marked pitch as needs review.");
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

  const expandAll = () => setExpandedWriters(new Set(writerGroups.map((group) => group.key)));
  const collapseAll = () => setExpandedWriters(new Set());

  if (detailPitchId) {
    return (
      <PitchDetailPage
        pitch={detailPitch}
        activePitches={activePitches}
        onBack={navigateToBoard}
        onNeedsReview={markNeedsReview}
        onApprove={(id, approval) => moveOutOfActiveBoard(id, "Approved", "Approved pitch and moved it to Stories.", approval)}
        onHold={(id) => moveOutOfActiveBoard(id, "On Hold", "Held pitch and removed it from the active board.")}
        onDelete={deletePitch}
        onNext={selectNextPitch}
        onAddComment={addComment}
        onEditComment={editComment}
        onDeleteComment={deleteComment}
        canManagePitches={canManagePitches}
        csrfToken={csrfToken}
        setToast={setToast}
      />
    );
  }

  return (
    <PageShell
      title="Pitch Board"
      right={<Button icon="plus" onClick={() => setCreateOpen(true)}>New pitch</Button>}
    >
      {loading ? (
        <StateMessage icon="edit" title="Loading pitches" body="Pulling pitch records from MongoDB." />
      ) : error ? (
        <StateMessage icon="edit" title="Pitch board unavailable" body={error} />
      ) : null}
      <Card className="min-w-0 p-5">
        <div className="mb-5 flex flex-col gap-4">
          <div>
            <h2 className="font-medium text-zinc-50">Active editor queue</h2>
            <p className="mt-1 text-sm text-zinc-500">Only new and needs-review pitches appear here.</p>
          </div>
          <div className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_220px]">
            <Input value={query} onChange={handleQueryChange} placeholder="Search writer, title, section, or feedback" />
            <Select value={section} onChange={handleSectionChange} options={PITCH_SECTIONS} />
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.025]">
              {["All Active", "Needs Review", "New"].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => handleStatusFilterChange(filter)}
                  className={cx(
                    "inline-flex items-center gap-2 border-r border-white/[0.08] px-3 py-2 text-sm transition last:border-r-0",
                    statusFilter === filter ? "bg-white/[0.08] text-zinc-100" : "text-zinc-400 hover:bg-white/[0.045] hover:text-zinc-200"
                  )}
                >
                  {filter === "All Active" ? (
                    <span>{filter}</span>
                  ) : (
                    <PitchStatusText status={filter} />
                  )}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={expandAll}>Expand all</Button>
              <Button variant="ghost" onClick={collapseAll}>Collapse all</Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
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
              <h3 className="text-sm font-medium text-zinc-200">No active pitches found</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">Try a different search or filter, or create a new pitch for review.</p>
            </div>
          )}
        </div>
      </Card>

      <AnimatePresence>
        {createOpen && (
          <PitchCreateModal
            onClose={() => setCreateOpen(false)}
            onCreate={createPitch}
          />
        )}
      </AnimatePresence>
    </PageShell>
  );
}

function PitchWriterRow({ group, expanded, onToggle, onSelectPitch }) {
  const newCount = group.pitches.filter((pitch) => pitch.status === "New").length;
  const reviewCount = group.pitches.filter((pitch) => pitch.status === "Needs Review").length;

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
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <PitchCountLabel label="Active" count={group.pitches.length} />
          <PitchCountLabel label="New" count={newCount} />
          <PitchCountLabel label="Needs Review" count={reviewCount} />
        </div>
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

function PitchCountLabel({ label, count }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.035] px-2.5 py-1 text-xs text-zinc-400">
      <span className="font-medium text-zinc-100">{count}</span>
      <span>{label}</span>
    </span>
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
  activePitches,
  onBack,
  onNeedsReview,
  onApprove,
  onHold,
  onDelete,
  onNext,
  canManagePitches = false,
  csrfToken = "",
  setToast = () => {},
}) {
  const [feedbackDraft, setFeedbackDraft] = useState("");
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editingFeedbackText, setEditingFeedbackText] = useState("");
  const [openItemMenu, setOpenItemMenu] = useState(null);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalSubmitting, setApprovalSubmitting] = useState(false);

  useEffect(() => {
    setFeedbackDraft("");
    setEditingFeedbackId(null);
    setEditingFeedbackText("");
    setOpenItemMenu(null);
    setApprovalOpen(false);
    setApprovalSubmitting(false);
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
            <h3 className="text-lg font-semibold tracking-tight text-zinc-100">Pitch is not active</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500">This pitch may have been approved, held, deleted, or moved out of the active queue.</p>
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
      if (pitch.status === "New") {
        await onNeedsReview(pitch.id, "Added feedback and marked pitch as needs review.");
      } else {
        setToast("Added feedback.");
      }
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
        <main className="mx-auto w-full max-w-[940px] space-y-10">
          <div className="relative border-b border-white/[0.16] pb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">Pitch review</h1>
          </div>

          <section className="border-b border-white/[0.16] pb-10">
            <PitchStatusText status={pitch.status} />
            <h2 className="mt-8 text-4xl font-semibold leading-[1.12] tracking-tight text-zinc-50 md:text-5xl">
              {pitch.title}
            </h2>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              {pitch.angle}
            </p>
            {pitch.notes ? (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-zinc-300">Additional notes</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-500">{pitch.notes}</p>
              </div>
            ) : null}
          </section>

          <section className="border-b border-white/[0.16] pb-10">
            <div className="mb-5">
              <h3 className="text-lg font-semibold tracking-tight text-zinc-50">Editor feedback</h3>
              <p className="mt-1 text-sm text-zinc-500">Direction for revision, reporting focus, and next steps.</p>
            </div>
            <div className="space-y-4">
              {feedbackItems.map((feedback) => {
                const menuId = `feedback-${feedback.id}`;
                return (
                  <div key={feedback.id} className="group border-b border-white/[0.1] pb-4 last:border-b-0 last:pb-0">
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <div>
                        <span className="text-sm font-medium text-zinc-300">{feedback.author}</span>
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
                      <p className="text-sm leading-7 text-zinc-500">{feedback.text}</p>
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
            <h3 className="text-lg font-semibold tracking-tight text-zinc-50">Activity</h3>
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
        </main>

        <aside className="mx-auto w-full max-w-[940px] space-y-3 2xl:sticky 2xl:top-8 2xl:max-w-none">
          <div className="rounded-2xl border border-white/[0.12] bg-white/[0.035] p-5">
            <h3 className="text-sm font-medium text-zinc-300">Properties</h3>
            <div className="mt-4 divide-y divide-white/[0.1]">
              <PitchProperty label="Status">
                <PitchStatusText status={pitch.status} />
              </PitchProperty>
              <PitchProperty label="Writer">{pitch.owner}</PitchProperty>
              <PitchProperty label="Section">{pitch.section}</PitchProperty>
              <PitchProperty label="Submitted">{pitch.submittedAt}</PitchProperty>
            </div>
          </div>

          {canManagePitches ? (
          <div className="rounded-2xl border border-white/[0.12] bg-white/[0.035] p-5">
            <h3 className="text-sm font-medium text-zinc-300">Actions</h3>
            <div className="mt-4 space-y-2">
              <Button onClick={() => setApprovalOpen(true)} className="w-full">Approve</Button>
              <Button
                variant="ghost"
                disabled={pitch.status === "Needs Review"}
                onClick={() => onNeedsReview(pitch.id)}
                className="w-full"
              >
                Mark needs review
              </Button>
              <Button variant="ghost" onClick={() => onHold(pitch.id)} className="w-full">Hold</Button>
              <Button
                variant="ghost"
                disabled={activePitches.length <= 1}
                onClick={() => onNext(pitch.id)}
                className="w-full"
              >
                Next active pitch
              </Button>
              <Button variant="danger" icon="trash" onClick={() => onDelete(pitch.id)} className="w-full">Delete pitch</Button>
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
      setError("Set a due date before approving this pitch.");
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
            <h2 id="approve-pitch-title" className="text-lg font-semibold text-zinc-50">Approve pitch</h2>
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
            <Button disabled={submitting} onClick={submitApproval}>{submitting ? "Approving..." : "Approve"}</Button>
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

function PitchCreateModal({ onClose, onCreate }) {
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
            <p className="mt-1 text-sm text-zinc-500">Capture the angle before it becomes an assignment.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200">x</button>
        </div>

        <div className="grid gap-4">
          <label className="block max-w-xs">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Section</span>
            <select
              value={draft.section}
              onChange={(event) => updateDraft("section", event.target.value)}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 text-sm text-zinc-200 outline-none focus:border-white/[0.18]"
            >
              {PITCH_SECTIONS.filter((option) => option !== "All sections").map((option) => (
                <option key={option} value={option} className="bg-zinc-950">{option}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Title</span>
            <input
              required
              value={draft.title}
              onChange={(event) => updateDraft("title", event.target.value)}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-white/[0.18]"
              placeholder="Working story title"
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
              placeholder="Interview ideas, possible sources, photo ideas, visuals, or questions to check before assigning."
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
      <Select value={article.status} onChange={(status) => updateArticleStatus(article.id, status)} options={columns} className="mt-3" />
    </Card>
  );
}

function StoriesPage({ stories, loading = false, error = "", currentUser, csrfToken = "", updateStoryStatus, updateStoryDocLink, clearStoryAttachment, uploadStoryAttachment, attachDriveFileToStory, inviteStoryCollaborators, removeStoryCollaborator, setToast }) {
  const [query, setQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState("All sections");
  const [detailStoryId, setDetailStoryId] = useState(initialStoryDetailId);

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

  return (
    <PageShell
      title="Stories"
      eyebrow="Editorial workflow"
      description="Scan active drafts by review state, then open a story for notes, source checks, and approval actions."
      className="max-w-[1280px]"
    >
      <section className="mb-5 grid gap-3 xl:grid-cols-[minmax(260px,1fr)_180px] xl:items-center">
        <Input value={query} onChange={setQuery} placeholder="Search title, writer, section, or next step" className="h-10" />
        <Select value={sectionFilter} onChange={setSectionFilter} options={STORY_FILTER_SECTIONS} className="h-10" />
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
  const dueDateLabel = storyDueDateLabel(story);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-lg border border-white/[0.07] bg-black/20 px-3 py-2.5 text-left transition hover:border-white/[0.16] hover:bg-white/[0.045] focus:outline-none focus:ring-2 focus:ring-white/15"
      aria-label={`Open story ${story.title}`}
    >
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-medium leading-5 text-zinc-100">{story.title}</h3>
        <p className="mt-1 truncate text-xs text-zinc-500">By {story.writer}</p>
        <p className={cx("mt-2 text-xs", dueDateLabel ? "text-zinc-500" : "text-zinc-600")}>{dueDateLabel ? `Due ${dueDateLabel}` : "No due date set"}</p>
      </div>
      <div className="flex h-full min-h-16 items-center">
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
  const attachmentMenuRef = useRef(null);

  useEffect(() => {
    setDraftDocUrl("");
    setCommentDraft("");
    setAttachmentMenuOpen(false);
    setAttachmentDialog(null);
    setUploadingAttachment(false);
    setOpeningDrivePicker(false);
    setInviteDialogOpen(false);
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
  const canReturnStory = canManageStory && ["Submitted", "In Review", "Ready for Publish"].includes(story.status);
  const canSendToTeacherApproval = canManageStory && ["Submitted", "In Review"].includes(story.status);
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

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-6 md:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <main className="min-w-0">
          <header className="border-b border-white/[0.14] pb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">{story.title}</h1>
                <p className="mt-3 text-sm font-medium text-zinc-300">{story.writer} / {story.section}</p>
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
        </main>

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
              {canReturnStory ? (
                <Button onClick={() => updateStoryStatus(story.id, "Returned")} className="w-full rounded-full">Return to writer</Button>
              ) : null}
              {canSendToTeacherApproval ? (
                <Button variant="ghost" onClick={() => updateStoryStatus(story.id, "Ready for Publish")} className="w-full rounded-full">Send to teacher approval</Button>
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
  const [role, setRole] = useState("comment");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingEmail, setRemovingEmail] = useState("");
  const [error, setError] = useState("");
  const selectedRole = STORY_COLLABORATOR_ROLE_OPTIONS.find((option) => option.id === role) || STORY_COLLABORATOR_ROLE_OPTIONS[0];
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
            <span className="mb-2 block text-sm font-medium text-zinc-300">Role</span>
            <div className="relative">
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-white/[0.14] bg-black/20 px-4 pr-10 text-sm font-medium text-zinc-100 outline-none focus:border-white/[0.28]"
              >
                {STORY_COLLABORATOR_ROLE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id} className="bg-zinc-950">{option.label}</option>
                ))}
              </select>
              <Icon name="chevron" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            </div>
            <p className="mt-2 text-sm text-zinc-500">{selectedRole.description}</p>
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
          <h3 className="text-sm font-medium text-zinc-300">Currently invited ({inviteCount})</h3>
          <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.12]">
            {inviteCount ? collaborators.map((collaborator) => (
              <div key={collaborator.email || collaborator.id} className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3 last:border-b-0">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.08] text-xs font-semibold text-zinc-100">
                  {accountInitials(collaborator)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-100">{collaborator.email}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{storyCollaboratorRoleLabel(collaborator.role)}</p>
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
              <p className="px-4 py-5 text-sm text-zinc-600">No collaborators invited yet.</p>
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
  const compactPaddingClass = showRemove ? (showTrailingIcon ? "pr-9" : "pr-12") : "";

  return (
    <div className={cx("relative grid min-w-0 gap-3", compact ? "" : "sm:grid-cols-[minmax(0,1fr)_auto]")}>
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className={cx(
          "grid overflow-hidden rounded-xl border border-white/[0.16] bg-black/20 text-left transition hover:border-white/[0.26] hover:bg-white/[0.035] focus:outline-none focus:ring-2 focus:ring-white/20",
          compact ? cx(compactGridClass, compactPaddingClass) : "min-h-16 grid-cols-[minmax(0,1fr)_64px]"
        )}
      >
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
        {showTrailingIcon ? (
          <div className="grid place-items-center border-l border-white/[0.16] bg-white/[0.03] text-zinc-300">
            <Icon name={attachment.type === "file" ? "upload" : "link"} className="h-5 w-5" />
          </div>
        ) : null}
      </a>
      {showRemove ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRemove();
          }}
          aria-label="Remove attached work"
          className={cx(
            "absolute top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-zinc-400 transition hover:bg-white/[0.08] hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-white/20",
            showTrailingIcon ? "right-12" : "right-2"
          )}
        >
          <Icon name="x" className="h-4 w-4" />
        </button>
      ) : null}
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

function ArticlesPage({ extractorOpen = false, setExtractorOpen = () => {}, setToast = () => {} }) {
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
            <Input value={query} onChange={handleSearchChange} placeholder="Search title, author, section, tag, or interviewee" className="flex-1" />
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
                    className={cx(
                      "cursor-pointer border-t border-white/[0.06] hover:bg-white/[0.04]",
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
                body={hasActiveArticleFilter ? "Try a different title, author, section, tag, or interviewee search." : "No article records were returned by the database yet."}
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
                    className={cx(
                      "cursor-pointer border-t border-white/[0.06] transition hover:bg-white/[0.04]",
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
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-600">{label}</p>
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
          <h3 className="text-lg font-semibold tracking-tight text-zinc-100">Select a source</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Record details, article context, and editable source fields will appear here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex min-h-[560px] flex-col p-5">
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-600">Selected record</p>
        <h2 className="break-words text-2xl font-semibold tracking-tight text-zinc-50">{record.name}</h2>
      </div>

      {saveError ? <p className="mt-4 text-sm text-rose-300">{saveError}</p> : null}

      {editing ? (
        <div className="mt-8 space-y-5 border-t border-white/[0.08] pt-5">
          <div className="grid gap-3 2xl:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">First name</span>
              <input
                value={draft?.firstName || ""}
                onChange={(event) => setDraft((previous) => ({ ...(previous || {}), firstName: event.target.value }))}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 text-sm text-zinc-200 outline-none focus:border-white/[0.18]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Last name</span>
              <input
                value={draft?.lastName || ""}
                onChange={(event) => setDraft((previous) => ({ ...(previous || {}), lastName: event.target.value }))}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 text-sm text-zinc-200 outline-none focus:border-white/[0.18]"
              />
            </label>
          </div>
          <div className="grid gap-3 2xl:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Grade</span>
              <AnimatedDropdown
                text={draft?.grade || "Unknown"}
                items={sourceEditGradeOptions(draft?.grade).map((name) => ({ name, link: "#" }))}
                onSelect={(item) => setDraft((previous) => ({ ...(previous || {}), grade: item.name }))}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">House</span>
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

      <div className="mt-8 border-t border-white/[0.08] pt-7">
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-600">Article</p>
        {isValidHttpUrl(record.article?.url) ? (
          <a
            href={record.article.url}
            target="_blank"
            rel="noreferrer"
            className="block break-words text-base font-semibold leading-7 text-zinc-100 transition hover:text-white"
          >
            {record.article?.title || "Article title unavailable"}
          </a>
        ) : (
          <p className="break-words text-base font-semibold leading-7 text-zinc-100">
            {record.article?.title || "Article title unavailable"}
          </p>
        )}
        <p className="mt-3 text-sm text-zinc-500">{record.article?.publishedAt || "Date unavailable"}</p>
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
  const fullName = firstText(person.name, person.fullName, person.full_name);
  let firstName = firstText(person.firstName, person.first_name);
  let lastName = firstText(person.lastName, person.last_name);

  if ((!firstName || !lastName) && fullName) {
    const parts = fullName.split(/\s+/).filter(Boolean);
    if (!firstName) firstName = parts[0] || "";
    if (!lastName) lastName = parts.slice(1).join(" ");
  }

  return {
    id: firstText(person.id, person._id) || `extractor-row-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    firstName,
    lastName,
    grade: firstText(person.grade),
    house: firstText(person.house),
    url: articleUrl,
    dateAdded: firstText(person.dateAdded) || new Date().toISOString().slice(0, 10),
  };
}

function ArticleExtractorOverlay({ onClose, onSaved = async () => {} }) {
  const [url, setUrl] = useState("");
  const [articleUrl, setArticleUrl] = useState("");
  const [rows, setRows] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canClose = !extracting && !saving;
  const hasReviewRows = Boolean(articleUrl);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && canClose) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canClose, onClose]);

  const requestClose = () => {
    if (canClose) onClose();
  };

  const validateUrl = () => {
    const nextUrl = url.trim();
    if (!nextUrl) return "Enter an article URL.";
    return "";
  };

  const runExtract = async () => {
    const validationError = validateUrl();
    if (validationError) {
      setError(validationError);
      return;
    }

    setExtracting(true);
    setError("");

    try {
      const nextUrl = url.trim();
      const response = await fetch(`${API_BASE}/api/extract`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
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

      const resolvedArticleUrl = firstText(payload.article_url, payload.articleUrl, nextUrl);
      const nextRows = Array.isArray(payload.people)
        ? payload.people.map((person) => makeExtractorRow(person, resolvedArticleUrl))
        : [];

      setArticleUrl(resolvedArticleUrl);
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
    const rowArticleUrl = articleUrl || url.trim();
    setRows((currentRows) => [...currentRows, makeExtractorRow({}, rowArticleUrl)]);
    if (!articleUrl && rowArticleUrl) setArticleUrl(rowArticleUrl);
  };

  const deleteRow = (id) => {
    setRows((currentRows) => currentRows.filter((row) => row.id !== id));
  };

  const validateRows = () => {
    if (!articleUrl) return "Run extraction or add a row before saving.";
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
        },
        credentials: "include",
        body: JSON.stringify({
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

      await onSaved(payload.message ? `Saved. ${payload.message}` : "Saved interviewees.");
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <motion.div
        className="mx-auto flex min-h-full w-full max-w-6xl items-center py-6"
        initial={{ opacity: 0, scale: 0.97, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 18 }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-full overflow-hidden rounded-3xl border border-white/[0.22] bg-[#0b0c10] shadow-2xl shadow-black ring-1 ring-white/[0.06]">
          <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-5 py-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-50">AI article extractor</h2>
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
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Find interviewees, review the fields, then save them to the live article database.</p>
              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/[0.18] bg-black/25 p-2 transition focus-within:border-white/[0.32] md:flex-row">
                <input
                  value={url}
                  onChange={(event) => {
                    setUrl(event.target.value);
                    if (error) setError("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") runExtract();
                  }}
                  className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
                  placeholder="Paste an article URL..."
                />
                <Button onClick={runExtract} disabled={extracting || saving}>
                  {extracting ? "Extracting..." : "Extract"}
                </Button>
              </div>
              {error && <p className="mt-3 text-sm font-medium text-rose-300">{error}</p>}
            </div>

            {hasReviewRows && (
              <div className="mt-5">
                <div className="mb-5">
                  <div>
                    <h3 className="font-medium text-zinc-50">Review interviewees</h3>
                    <p className="mt-1 break-all text-sm text-zinc-500">{articleUrl}</p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
                  <table className="w-full min-w-[680px] text-left text-sm">
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
                      {rows.map((row) => (
                        <tr key={row.id} className="border-t border-white/[0.06]">
                          <td className="px-4 py-4">
                            <input
                              value={row.firstName}
                              onChange={(event) => updateRow(row.id, "firstName", event.target.value)}
                              className="w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 py-2 text-zinc-200 outline-none transition focus:border-white/[0.18]"
                              placeholder="First"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <input
                              value={row.lastName}
                              onChange={(event) => updateRow(row.id, "lastName", event.target.value)}
                              className="w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 py-2 text-zinc-200 outline-none transition focus:border-white/[0.18]"
                              placeholder="Last"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={row.grade}
                              onChange={(event) => updateRow(row.id, "grade", event.target.value)}
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
                              aria-label="Delete row"
                              title="Delete row"
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
                  <Button icon="task" onClick={saveRows} disabled={saving || extracting}>
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
                  <Select value={task.status} onChange={(next) => updateTaskStatus(task.id, next)} options={statuses} className="mt-3" />
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
        story,
        date,
        title: story.title,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.date - b.date || a.title.localeCompare(b.title));
}

function CalendarPage({ stories = [], onOpenStory = () => {} }) {
  const calendarEvents = useMemo(() => buildCalendarEvents(stories), [stories]);
  const firstEventDate = calendarEvents[0]?.date;
  const [hasNavigatedMonth, setHasNavigatedMonth] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const base = firstEventDate || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  useEffect(() => {
    if (!firstEventDate || hasNavigatedMonth) return;
    setVisibleMonth(new Date(firstEventDate.getFullYear(), firstEventDate.getMonth(), 1));
  }, [firstEventDate, hasNavigatedMonth]);

  const navigateCalendarMonth = (nextMonth) => {
    setHasNavigatedMonth(true);
    setVisibleMonth(nextMonth);
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
    <PageShell title="Publishing calendar">
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
                    </div>
                    <div className="space-y-1.5">
                      {items.slice(0, 4).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onOpenStory(item.story)}
                          title={item.title}
                          className="block w-full truncate rounded-md border border-white/[0.1] bg-white/[0.055] px-2 py-1.5 text-left text-xs font-medium text-zinc-100 transition hover:border-white/[0.2] hover:bg-white/[0.085] focus:outline-none focus:ring-2 focus:ring-white/15"
                        >
                          {item.title}
                        </button>
                      ))}
                      {items.length > 4 ? <p className="px-1 text-[10px] text-zinc-500">+{items.length - 4} more</p> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
function AnalyticsPage() {
  return (
    <PageShell title="Analytics" className="flex min-h-[calc(100vh-5rem)] max-w-[1640px] flex-col">
      <div className="flex flex-1 items-center justify-center text-center">
        <h2 className="text-lg font-semibold text-zinc-100">Analytics are under construction</h2>
      </div>
    </PageShell>
  );
}
function AdminPage({ setToast, csrfToken = "", currentUser }) {
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

  const toggleRole = (roleId) => {
    setCollapsedRoles((previous) => ({ ...previous, [roleId]: !previous[roleId] }));
  };

  return (
    <PageShell
      title="Admin"
      description="Manage staff access and roles for the newsroom."
      className="max-w-7xl"
      right={<Button icon="mail" onClick={() => setToast("Invite staff is ready for backend wiring.")}>Invite staff</Button>}
    >
      <section className="space-y-5">
        <Input value={search} onChange={setSearch} placeholder="Search staff" className="h-11 max-w-xl" />

        {loading ? (
          <AdminSurfaceMessage icon="admin" title="Loading users" body="Pulling users and roles from MongoDB." />
        ) : error ? (
          <AdminSurfaceMessage icon="admin" title="Admin users unavailable" body={error} />
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
              />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

function AdminSurfaceMessage({ icon, title, body }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025]">
      <StateMessage icon={icon} title={title} body={body} />
    </div>
  );
}

function AdminRoleSection({ group, collapsed, onToggle, onRoleChange }) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.025]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-white/[0.035] focus:outline-none focus-visible:bg-white/[0.035]"
      >
        <span className="flex min-w-0 items-center gap-3">
          <Icon name="chevron" className={cx("h-4 w-4 shrink-0 text-zinc-500 transition", collapsed ? "-rotate-90" : "rotate-0")} />
          <span className="min-w-0">
            <span className="text-sm font-semibold text-zinc-100">{group.label}</span>{" "}
            <span className="ml-3 text-sm text-zinc-500">{group.description}</span>
          </span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="overflow-hidden border-t border-white/[0.08]"
          >
            {group.users.length ? (
              <AdminStaffTable staff={group.users} onRoleChange={onRoleChange} />
            ) : (
              <div className="px-4 py-6 text-sm text-zinc-600">No staff in this role.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function AdminStaffTable({ staff, onRoleChange }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.14em] text-zinc-600">
          <tr>
            <th className="px-4 py-3 font-medium">Staff member</th>
            <th className="w-44 px-4 py-3 font-medium">Role</th>
            <th className="w-44 px-4 py-3 font-medium">Last seen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {staff.map((user) => (
            <AdminUserRow key={user.id} user={user} onRoleChange={onRoleChange} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminUserRow({ user, onRoleChange }) {
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
        <AdminRoleDropdown value={user.role} onChange={(nextRole) => onRoleChange(user.id, nextRole)} label={`${user.name} role`} />
      </td>
      <td className="px-4 py-3 text-zinc-500">{user.lastSeen || "Not recorded"}</td>
    </tr>
  );
}

function AdminRoleDropdown({ value, onChange, label }) {
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
      if (event.key === "Escape") setOpen(false);
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

  const menu = open && menuStyle
    ? createPortal(
        <motion.div
          ref={menuRef}
          role="listbox"
          aria-label={label}
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
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
              }}
              className={cx(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:outline-none",
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
        className="inline-flex h-10 w-32 items-center justify-between gap-2 rounded-xl border border-transparent bg-black/25 px-3 text-sm text-zinc-100 transition hover:bg-white/[0.05] focus:border-transparent focus:outline-none focus:ring-0 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-0 active:border-transparent active:outline-none active:ring-0"
      >
        <span className="truncate">{accountRoleLabel(value)}</span>
        <Icon name="chevron" className={cx("h-4 w-4 shrink-0 text-zinc-500 transition", open && "rotate-180")} />
      </button>
      {menu}
    </>
  );
}

function SettingsPage() {
  return (
    <PageShell title="Workspace settings" right={<Button>Save changes</Button>}>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-medium">Publication settings</h2>
          <p className="mt-1 text-sm text-zinc-500">Configure the school newspaper workspace.</p>
          <div className="mt-5 space-y-4">
            <Field label="Publication name" value="Poolesville Pulse" />
            <Field label="Website URL" value="https://poolesvillepulse.org" />
            <Field label="Allowed article domain" value="poolesvillepulse.org" />
            <Field label="Platform type" value="SNO Sites / WordPress" />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-medium">Multi-school readiness</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">The future version should add workspace IDs to every article, source, task, analytics snapshot, and user record so another school can connect its own newspaper site without sharing data with Poolesville Pulse.</p>
        </Card>
      </div>
    </PageShell>
  );
}

function Field({ label, value }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">{label}</span>
      <input defaultValue={value} className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 text-sm text-zinc-200 outline-none focus:border-white/[0.18]" />
    </label>
  );
}


export default function FalconNewsroomFullInteractiveUI() {
  return isLandingRoute() ? <LandingPage /> : <AppShell />;
}
