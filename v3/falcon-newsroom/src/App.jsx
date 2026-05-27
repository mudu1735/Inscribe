import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    due: "Today",
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
    due: "Yesterday",
  },
];

const users = [
  {
    id: "u1",
    name: "Ava Patel",
    email: "ava@school.edu",
    role: "Admin",
    lastSeen: "12 min ago",
  },
  {
    id: "u2",
    name: "Sofia Chen",
    email: "sofia@school.edu",
    role: "Admin",
    lastSeen: "1 hr ago",
  },
  {
    id: "u3",
    name: "Maya Johnson",
    email: "maya@school.edu",
    role: "Admin",
    lastSeen: "Today",
  },
  {
    id: "u4",
    name: "Noah Kim",
    email: "noah@school.edu",
    role: "Editor",
    lastSeen: "Yesterday",
  },
  {
    id: "u5",
    name: "Mina Rao",
    email: "mina@school.edu",
    role: "Editor",
    lastSeen: "3 days ago",
  },
  {
    id: "u6",
    name: "Daniel Wu",
    email: "daniel@school.edu",
    role: "Viewer",
    lastSeen: "4 days ago",
  },
  {
    id: "u7",
    name: "Iris Park",
    email: "iris@school.edu",
    role: "Viewer",
    lastSeen: "1 week ago",
  },
];

const ADMIN_ROLES = [
  {
    id: "Admin",
    label: "Admin",
    description: "Full workspace access, including users, settings, publishing, and all editorial tools.",
  },
  {
    id: "Editor",
    label: "Editor",
    description: "Can create, edit, review, and publish newsroom content, but cannot manage users.",
  },
  {
    id: "Viewer",
    label: "Viewer",
    description: "Read-only access to newsroom content and records.",
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

const calendarItems = [
  { day: 10, title: "Snapchat follow-up", type: "Publish", section: "Tech" },
  { day: 12, title: "Sports preview", type: "Review", section: "Sports" },
  { day: 14, title: "Parking story", type: "Edit", section: "News" },
  { day: 16, title: "Robotics photos", type: "Media", section: "Features" },
  { day: 18, title: "Cafeteria interview", type: "Interview", section: "News" },
  { day: 22, title: "Prom trends pitch", type: "Pitch", section: "Culture" },
];

const STORY_STATUSES = ["Submitted", "In Review", "Needs Revision", "Ready for Publish", "Returned", "Published"];
const STORY_FILTER_STATUSES = ["All statuses", ...STORY_STATUSES];
const STORY_FILTER_SECTIONS = ["All sections", "News", "Features", "Sports", "Culture", "Opinion", "Science & Technology", "Photo"];
const STORY_FILTER_EDITORS = ["All editors", "Ava Patel", "Maya Johnson", "Noah Kim"];

const initialStories = [
  {
    id: "s1",
    title: "Senior Parking Rules Draw Mixed Reactions",
    section: "News",
    writer: "Ava Patel",
    editor: "Maya Johnson",
    status: "Submitted",
    priority: "High",
    deadline: "Today",
    dueSoon: true,
    submittedAt: "May 18, 2026, 8:42 AM",
    lastEdited: "12 min ago",
    googleDocUrl: "https://docs.google.com/document/d/1FalconSeniorParkingDraft/edit",
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
    deadline: "Tomorrow",
    dueSoon: true,
    submittedAt: "May 17, 2026, 5:18 PM",
    lastEdited: "38 min ago",
    googleDocUrl: "https://docs.google.com/document/d/1FalconSportsPreviewDraft/edit",
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
    lastEdited: "Yesterday",
    googleDocUrl: "https://docs.google.com/document/d/1FalconRoboticsBuildWeek/edit",
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
    lastEdited: "2 hours ago",
    googleDocUrl: "https://docs.google.com/document/d/1FalconCafeteriaMenuReady/edit",
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
    lastEdited: "3 days ago",
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
    googleDocUrl: "https://docs.google.com/document/d/1FalconSnapchatPublished/edit",
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
      { id: "c1", author: "Ava", text: "Ask each club for one specific tactic that changed attendance.", time: "10 min ago" },
      { id: "c2", author: "Iris", text: "I can report this by Friday if the robotics lead replies.", time: "4 min ago" },
    ],
    updatedAt: "4 min ago",
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
    comments: [{ id: "c3", author: "Noah", text: "Could pair with a simple schedule graphic.", time: "Yesterday" }],
    updatedAt: "Yesterday",
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
    comments: [{ id: "c4", author: "Ava", text: "Approved for next week's sports package.", time: "2 days ago" }],
    updatedAt: "2 days ago",
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
    comments: [{ id: "c5", author: "Maya", text: "Revisit after the schedule changes are announced.", time: "3 days ago" }],
    updatedAt: "3 days ago",
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
    updatedAt: "This morning",
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
    comments: [{ id: "c6", author: "Iris", text: "I know two students who would talk about this.", time: "1 day ago" }],
    updatedAt: "1 day ago",
  },
];

const cx = (...classes) => classes.filter(Boolean).join(" ");
const fmt = (n) => n.toLocaleString("en-US");
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const ARTICLE_PAGE_SIZE = 10;
const EXTRACTOR_ADDED_BY = "Editor";
const EXTRACTOR_GRADE_OPTIONS = ["", "9", "10", "11", "12", "Staff"];
const EXTRACTOR_HOUSE_OPTIONS = ["", "SMCS", "Global", "Humanities", "ISP"];

function asText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function firstText(...values) {
  for (const value of values) {
    const text = asText(value);
    if (text) return text;
  }
  return "";
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
  return isValidHttpUrl(story.googleDocUrl);
}

function storyStatusTone(status) {
  if (status === "Ready for Publish") return "green";
  if (status === "Needs Revision") return "amber";
  if (status === "Returned") return "rose";
  if (status === "In Review") return "violet";
  if (status === "Submitted") return "blue";
  return "neutral";
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

function storyMatchesFilters(story, query, status, section, editor) {
  const needle = query.trim().toLowerCase();
  if (needle && !storySearchText(story).includes(needle)) return false;
  if (status !== "All statuses" && story.status !== status) return false;
  if (section !== "All sections" && story.section !== section) return false;
  if (editor !== "All editors" && story.editor !== editor) return false;
  return true;
}

function storyNeedsAttention(story) {
  return ["Submitted", "In Review"].includes(story.status) || !storyDocIsOpenable(story);
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
  const tags = toList(raw.tags).length ? toList(raw.tags) : toList(raw.categories);
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
    filterGroups: [section, firstText(raw.category), ...tags].filter(Boolean),
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

function groupActivePitchesByWriter(pitches) {
  const grouped = new Map();
  pitches.forEach((pitch) => {
    const writer = pitch.owner || "Unassigned";
    if (!grouped.has(writer)) grouped.set(writer, []);
    grouped.get(writer).push(pitch);
  });
  return Array.from(grouped.entries())
    .map(([writer, writerPitches]) => ({
      writer,
      pitches: writerPitches.slice().sort((a, b) => dateSortValue(b.submittedAt) - dateSortValue(a.submittedAt)),
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

function withPitchActivity(pitch, text) {
  return {
    ...pitch,
    activity: [
      { id: `a${Date.now()}`, text, time: "Just now" },
      ...(pitch.activity || []),
    ],
  };
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
  console.assert(groupedRoles.length === 3, "Admin page should return to three role groups when search is clear.");
  console.assert(groupedRoles.every((group) => group.users.every((user) => user.role === group.id)), "Admin role groups should only contain matching users.");
  console.assert(users.filter((user) => adminUserMatches(user, adminSearchQuery("maya"), "All roles")).map((user) => user.name).join("") === "Maya Johnson", "Admin search should match staff by name.");
  console.assert(users.filter((user) => adminUserMatches(user, adminSearchQuery("school"), "All roles")).length === 0, "Admin search should not match email text.");
  console.assert(users.filter((user) => adminUserMatches(user, "", "Viewer")).every((user) => user.role === "Viewer"), "Admin role filter should limit visible staff.");
}
runAdminPageTests();

function runPrototypeTests() {
  console.assert(navItems.length === 9, "Navigation should include the visible primary tabs.");
  console.assert(navItems.some((item) => item.id === "stories" && item.label === "Stories"), "Navigation should include Stories.");
  console.assert(initialStories.every((story) => STORY_STATUSES.includes(story.status)), "Every story should use a supported workflow status.");
  console.assert(initialStories.some((story) => story.status === "Submitted"), "Stories page needs submitted examples.");
  console.assert(initialStories.some((story) => story.status === "Needs Revision"), "Stories page needs revision examples.");
  console.assert(storyMatchesFilters(initialStories[0], "parking", "All statuses", "All sections", "All editors"), "Stories search should include title text.");
  console.assert(!storyDocIsOpenable(initialStories.find((story) => story.id === "s5")), "Missing Google Doc links should be treated as unavailable.");
  console.assert(initialArticles.some((a) => a.status === "Published"), "Prototype needs published article data.");
  console.assert(initialTasks.every((t) => t.id && t.title && t.status), "Every task needs id, title, and status.");
  console.assert(PITCH_STATUSES.every((status) => initialPitches.some((pitch) => pitch.status === status)), "Pitch board needs examples for each status.");
  console.assert(matchesPitchFilters(initialPitches[0], "clubs", "All sections"), "Pitch search should include title and angle text.");
  console.assert(!matchesPitchFilters(initialPitches[2], "", "All sections"), "Approved pitches should stay out of the active board.");
  console.assert(groupActivePitchesByWriter(initialPitches.filter(isActivePitch)).every((group) => group.pitches.every(isActivePitch)), "Writer groups should include active pitches only.");
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

function PageShell({ title, eyebrow, children, right, titleAction, className = "" }) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={cx("mx-auto px-5 py-6 md:px-8", className || "max-w-[1640px]")}
    >
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="relative">
          {eyebrow ? <div className="mb-2 text-xs text-zinc-500">{eyebrow}</div> : null}
          {titleAction ? <div className="mb-2 md:absolute md:-left-12 md:top-1 md:mb-0">{titleAction}</div> : null}
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">{title}</h1>
        </div>
        {right}
      </div>
      {children}
    </motion.div>
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
  return navItems.some((item) => item.id === pathPage) ? pathPage : "dashboard";
}

function pagePath(page) {
  return `/${page}`;
}

function pushAppPath(path) {
  if (window.location.pathname !== path) {
    window.history.pushState(null, "", path);
  }
  window.dispatchEvent(new Event("falcon-route-change"));
}

function AppShell() {
  const [page, setPage] = useState(initialAppPage);
  const [locationPath, setLocationPath] = useState(window.location.pathname);
  const [articles, setArticles] = useState(initialArticles);
  const [stories, setStories] = useState(initialStories);
  const [tasks, setTasks] = useState(initialTasks);
  const [globalSearch, setGlobalSearch] = useState("");
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [articleExtractorOpen, setArticleExtractorOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState("a1");
  const [toast, setToast] = useState("Prototype ready: live article records load when the backend is running.");

  const selectedArticle = articles.find((a) => a.id === selectedArticleId) || articles[0];

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

  const navigatePage = (nextPage) => {
    setPage(nextPage);
    pushAppPath(pagePath(nextPage));
  };

  const openArticleExtractor = () => {
    setQuickCreateOpen(false);
    navigatePage("articles");
    setArticleExtractorOpen(true);
  };

  const updateArticleStatus = (id, status) => {
    setArticles((prev) => prev.map((article) => (article.id === id ? { ...article, status } : article)));
    setToast(`Moved story to ${status}.`);
  };

  const updateStoryStatus = (id, status) => {
    setStories((prev) => prev.map((story) => (story.id === id ? { ...story, status, lastEdited: "Updated just now" } : story)));
    setToast(`Updated story to ${status}.`);
  };

  const updateTaskStatus = (id, status) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, status } : task)));
    setToast(`Updated task to ${status}.`);
  };

  const createDemoArticle = () => {
    const next = {
      id: `a${Date.now()}`,
      title: "New Article Idea from Quick Create",
      section: "News",
      authors: ["Unassigned"],
      status: "Idea",
      priority: "Normal",
      deadline: "May 25",
      published: "Idea",
      views: 0,
      visitors: 0,
      interviews: 0,
      tags: ["Pitch"],
      editor: "Ava Patel",
      summary: "A newly created mock story pitch ready to assign.",
    };
    setArticles((prev) => [next, ...prev]);
    setSelectedArticleId(next.id);
    setPage("articles");
    setQuickCreateOpen(false);
    setToast("Created a new article idea.");
  };

  const pages = {
    dashboard: <DashboardPage articles={articles} tasks={tasks} setPage={setPage} setSelectedArticleId={setSelectedArticleId} />,
    pitches: <PitchBoardPage setToast={setToast} />,
    stories: <StoriesPage stories={stories} updateStoryStatus={updateStoryStatus} setToast={setToast} />,
    pipeline: <PipelinePage articles={articles} updateArticleStatus={updateArticleStatus} setSelectedArticleId={setSelectedArticleId} setPage={setPage} />,
    articles: <ArticlesPage extractorOpen={articleExtractorOpen} setExtractorOpen={setArticleExtractorOpen} setToast={setToast} />,
    interviewees: <IntervieweesPage />,
    tasks: <TasksPage tasks={tasks} updateTaskStatus={updateTaskStatus} />,
    calendar: <CalendarPage />,
    analytics: <AnalyticsPage articles={articles} selectedArticle={selectedArticle} setSelectedArticleId={setSelectedArticleId} />,
    admin: <AdminPage setToast={setToast} />,
    settings: <SettingsPage />,
  };

  return (
    <div className="h-screen overflow-hidden bg-[#08090c] text-zinc-100">
      <div className="relative flex h-screen overflow-hidden">
        <aside className="hidden h-screen w-72 shrink-0 overflow-hidden border-r border-white/[0.08] bg-[#08090c]/80 p-4 backdrop-blur-xl lg:block">
          <button onClick={() => navigatePage("dashboard")} className="mb-7 flex w-full items-center gap-3 rounded-xl px-2 py-1 text-left hover:bg-white/[0.035]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-500 text-sm font-bold text-black">F</div>
            <div>
              <div className="text-sm font-medium text-zinc-100">Falcon Newsroom</div>
              <div className="text-xs text-zinc-500">Poolesville Pulse</div>
            </div>
          </button>

          <Input value={globalSearch} onChange={setGlobalSearch} placeholder="Search workspace" className="mb-5" />

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => navigatePage(item.id)} className={cx("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition", page === item.id ? "border border-white/[0.08] bg-white/[0.07] text-zinc-50 shadow-lg shadow-black/20" : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200")}>
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <header className="shrink-0 border-b border-white/[0.08] bg-[#08090c]/75 px-5 py-4 backdrop-blur-2xl md:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-sm font-bold text-black">F</div>
                <span className="font-medium">Falcon</span>
              </div>
              <HeaderBreadcrumb page={page} locationPath={locationPath} navigatePage={navigatePage} />
              <div className="flex items-center gap-2">
                <Button variant="ghost" icon="bell" className="hidden sm:inline-flex">
                  Alerts
                </Button>
                <Button icon="plus" onClick={() => setQuickCreateOpen(true)}>
                  Create
                </Button>
                <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06] text-xs font-semibold">AP</div>
              </div>
            </div>
          </header>

          <div className="shrink-0 border-b border-white/[0.08] bg-[#08090c]/90 px-4 py-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => navigatePage(item.id)} className={cx("flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs", page === item.id ? "border-white/[0.12] bg-white/[0.08] text-zinc-50" : "border-white/[0.06] text-zinc-500")}>
                  <Icon name={item.icon} className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {pages[page]}
          </div>
        </main>
      </div>

      <AnimatePresence>{quickCreateOpen && <QuickCreateModal onClose={() => setQuickCreateOpen(false)} createDemoArticle={createDemoArticle} openArticleExtractor={openArticleExtractor} />}</AnimatePresence>
      <Toast message={toast} onDismiss={() => setToast("")} />
    </div>
  );
}

function HeaderBreadcrumb({ page, locationPath, navigatePage }) {
  const pageLabel = navItems.find((item) => item.id === page)?.label || "Dashboard";
  const isPitchDetail = page === "pitches" && locationPath.toLowerCase().startsWith("/pitches/");

  return (
    <div className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">
      <span className="text-sm text-zinc-500">Workspace</span>
      <span className="text-zinc-700">/</span>
      {isPitchDetail ? (
        <>
          <button type="button" onClick={() => navigatePage("pitches")} className="text-sm text-zinc-400 transition hover:text-zinc-100">
            Pitch Board
          </button>
          <span className="text-zinc-700">/</span>
          <span className="truncate text-sm font-medium text-zinc-50">Pitch review</span>
        </>
      ) : (
        <span className="truncate text-sm font-medium text-zinc-50">{pageLabel}</span>
      )}
    </div>
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

function QuickCreateModal({ onClose, createDemoArticle, openArticleExtractor }) {
  const actions = [
    { icon: "article", label: "Article idea", helper: "Create a local story card", action: createDemoArticle },
    { icon: "task", label: "Assignment", helper: "Start a mock assignment", action: onClose },
    { icon: "people", label: "Interviewee", helper: "Open a mock source flow", action: onClose },
    { icon: "calendar", label: "Calendar event", helper: "Plan a mock deadline", action: onClose },
    { icon: "article", label: "Extract from URL", helper: "Open the live extractor", action: openArticleExtractor },
    { icon: "upload", label: "Import CSV", helper: "Start a mock import", action: onClose },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} className="w-full max-w-xl rounded-3xl border border-white/[0.1] bg-[#0b0c10] p-5 shadow-2xl shadow-black" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-50">Create something new</h2>
            <p className="mt-1 text-sm text-zinc-500">Prototype actions use local state only.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200">
            x
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((item) => (
            <button key={item.label} type="button" onClick={item.action} className="group rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 text-left transition hover:bg-white/[0.07]">
              <Icon name={item.icon} className="mb-4 h-5 w-5 text-zinc-400 group-hover:text-zinc-100" />
              <p className="font-medium text-zinc-100">{item.label}</p>
              <p className="mt-1 text-xs text-zinc-500">{item.helper}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
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
  return (
    <div className="space-y-3">
      {feed.map((item, index) => (
        <div key={item} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
          <div className="mt-1 h-2 w-2 rounded-full bg-zinc-300" />
          <div>
            <p className="text-sm text-zinc-300">{item}</p>
            <p className="mt-1 text-xs text-zinc-600">{index + 1}h ago</p>
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

function PitchBoardPage({ setToast }) {
  const [pitches, setPitches] = useState(initialPitches);
  const [detailPitchId, setDetailPitchId] = useState(initialPitchDetailId);
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("All sections");
  const [statusFilter, setStatusFilter] = useState("All Active");
  const [expandedWriters, setExpandedWriters] = useState(() => new Set());
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const syncFromPath = () => setDetailPitchId(initialPitchDetailId());
    window.addEventListener("popstate", syncFromPath);
    window.addEventListener("falcon-route-change", syncFromPath);
    return () => {
      window.removeEventListener("popstate", syncFromPath);
      window.removeEventListener("falcon-route-change", syncFromPath);
    };
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
        return { ...nextPitch, updatedAt: "Just now" };
      })
    );
  };

  const nextIdAfter = (id) => nextActivePitchId(activePitches.filter((pitch) => pitch.id !== id), id);

  const moveOutOfActiveBoard = (id, status, message) => {
    const nextId = nextIdAfter(id);
    updatePitch(id, (pitch) => withPitchActivity({ ...pitch, status }, `Status changed to ${status}.`));
    if (nextId) navigateToPitch(nextId);
    else navigateToBoard();
    setToast(message);
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

  const createPitch = (draft) => {
    const title = draft.title.trim();
    if (!title) return;
    const nextPitch = {
      id: `p${Date.now()}`,
      title,
      angle: draft.angle.trim() || "Angle to be developed.",
      status: "New",
      section: draft.section,
      owner: draft.owner,
      submittedAt: "Today",
      notes: draft.notes.trim(),
      editorFeedback: "",
      feedback: [],
      comments: [],
      activity: [{ id: `a${Date.now()}`, text: `${draft.owner} created this pitch.`, time: "Just now" }],
      updatedAt: "Just now",
    };
    setPitches((previous) => [nextPitch, ...previous]);
    setQuery("");
    setSection("All sections");
    setStatusFilter("All Active");
    setExpandedWriters((previous) => new Set([...previous, nextPitch.owner]));
    setCreateOpen(false);
    setToast("Created a new pitch.");
  };

  const markNeedsReview = (id) => {
    updatePitch(id, (pitch) => withPitchActivity({ ...pitch, status: "Needs Review" }, "Status changed to Needs Review."));
    setToast("Marked pitch as needs review.");
  };

  const addFeedback = (id, text) => {
    updatePitch(id, (pitch) => {
      const shouldMarkNeedsReview = pitch.status === "New";
      return withPitchActivity(
        {
          ...pitch,
          status: shouldMarkNeedsReview ? "Needs Review" : pitch.status,
          feedback: [
            { id: `f${Date.now()}`, author: "Editor", text, time: "Just now" },
            ...(pitch.feedback || []),
          ],
        },
        shouldMarkNeedsReview ? "Editor added feedback and marked the pitch Needs Review." : "Editor added feedback."
      );
    });
    setToast("Added feedback.");
  };

  const editFeedback = (id, feedbackId, text) => {
    updatePitch(id, (pitch) => {
      const nextPitch = feedbackId === "editor-feedback"
        ? { ...pitch, editorFeedback: text }
        : {
            ...pitch,
            feedback: (pitch.feedback || []).map((feedback) =>
              feedback.id === feedbackId ? { ...feedback, text, time: "Edited just now" } : feedback
            ),
          };
      return withPitchActivity(nextPitch, "Editor edited feedback.");
    });
    setToast("Updated feedback.");
  };

  const deleteFeedback = (id, feedbackId) => {
    updatePitch(id, (pitch) => {
      const nextPitch = feedbackId === "editor-feedback"
        ? { ...pitch, editorFeedback: "" }
        : { ...pitch, feedback: (pitch.feedback || []).filter((feedback) => feedback.id !== feedbackId) };
      return withPitchActivity(nextPitch, "Editor deleted feedback.");
    });
    setToast("Deleted feedback.");
  };

  const addComment = (id, text) => {
    updatePitch(id, (pitch) =>
      withPitchActivity(
        {
          ...pitch,
          comments: [
            { id: `c${Date.now()}`, author: "Editor", text, time: "Just now" },
            ...pitch.comments,
          ],
        },
        "Editor added a comment."
      )
    );
    setToast("Added comment.");
  };

  const editComment = (id, commentId, text) => {
    updatePitch(id, (pitch) =>
      withPitchActivity(
        {
          ...pitch,
          comments: pitch.comments.map((comment) =>
            comment.id === commentId ? { ...comment, text, time: "Edited just now" } : comment
          ),
        },
        "Editor edited a comment."
      )
    );
    setToast("Updated comment.");
  };

  const deleteComment = (id, commentId) => {
    updatePitch(id, (pitch) =>
      withPitchActivity(
        { ...pitch, comments: pitch.comments.filter((comment) => comment.id !== commentId) },
        "Editor deleted a comment."
      )
    );
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

  const expandAll = () => setExpandedWriters(new Set(writerGroups.map((group) => group.writer)));
  const collapseAll = () => setExpandedWriters(new Set());

  if (detailPitchId) {
    return (
      <PitchDetailPage
        pitch={detailPitch}
        activePitches={activePitches}
        onBack={navigateToBoard}
        onAddFeedback={addFeedback}
        onEditFeedback={editFeedback}
        onDeleteFeedback={deleteFeedback}
        onNeedsReview={markNeedsReview}
        onApprove={(id) => moveOutOfActiveBoard(id, "Approved", "Approved pitch and removed it from the active board.")}
        onHold={(id) => moveOutOfActiveBoard(id, "On Hold", "Held pitch and removed it from the active board.")}
        onDelete={deletePitch}
        onNext={selectNextPitch}
        onAddComment={addComment}
        onEditComment={editComment}
        onDeleteComment={deleteComment}
      />
    );
  }

  return (
    <PageShell
      title="Pitch Board"
      right={<Button icon="plus" onClick={() => setCreateOpen(true)}>New pitch</Button>}
    >
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
          {writerGroups.map((group) => (
            <PitchWriterRow
              key={group.writer}
              group={group}
              expanded={expandedWriters.has(group.writer)}
              onToggle={() => toggleWriter(group.writer)}
              onSelectPitch={navigateToPitch}
            />
          ))}
          {!writerGroups.length && (
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
            writers={PITCH_WRITERS}
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
          <span className="truncate text-sm font-medium text-zinc-100">{group.writer}</span>
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
  onAddFeedback,
  onEditFeedback,
  onDeleteFeedback,
  onNeedsReview,
  onApprove,
  onHold,
  onDelete,
  onNext,
}) {
  const [feedbackDraft, setFeedbackDraft] = useState("");
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editingFeedbackText, setEditingFeedbackText] = useState("");
  const [openItemMenu, setOpenItemMenu] = useState(null);

  useEffect(() => {
    setFeedbackDraft("");
    setEditingFeedbackId(null);
    setEditingFeedbackText("");
    setOpenItemMenu(null);
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

  const feedbackItems = pitchFeedbackItems(pitch);

  const submitFeedback = () => {
    const text = feedbackDraft.trim();
    if (!text) return;
    onAddFeedback(pitch.id, text);
    setFeedbackDraft("");
  };

  const startEditingFeedback = (feedback) => {
    setEditingFeedbackId(feedback.id);
    setEditingFeedbackText(feedback.text);
    setOpenItemMenu(null);
  };

  const saveFeedbackEdit = () => {
    const text = editingFeedbackText.trim();
    if (!text) return;
    onEditFeedback(pitch.id, editingFeedbackId, text);
    setEditingFeedbackId(null);
    setEditingFeedbackText("");
  };

  const activityItems = [
    ...(pitch.activity || []),
    ...feedbackItems.map((feedback) => ({
      id: `activity-${feedback.id}`,
      text: `${feedback.author} left feedback on this pitch.`,
      time: feedback.time,
    })),
    { id: "submitted", text: `${pitch.owner} submitted this pitch.`, time: pitch.submittedAt },
  ];

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
                      ) : (
                        <PitchItemMenu
                          label="Feedback actions"
                          open={openItemMenu === menuId}
                          onToggle={() => setOpenItemMenu((current) => current === menuId ? null : menuId)}
                          onEdit={() => startEditingFeedback(feedback)}
                          onDelete={() => {
                            setOpenItemMenu(null);
                            onDeleteFeedback(pitch.id, feedback.id);
                          }}
                        />
                      )}
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
              {!feedbackItems.length && (
                <p className="rounded-xl border border-dashed border-white/[0.08] px-4 py-5 text-sm text-zinc-600">
                  No feedback yet.
                </p>
              )}
            </div>
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
          </section>

          <section>
            <h3 className="text-lg font-semibold tracking-tight text-zinc-50">Activity</h3>
            <div className="mt-5 space-y-4">
              {activityItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-500" />
                  <div>
                    <p className="text-sm text-zinc-400">{item.text}</p>
                    <p className="mt-1 text-xs text-zinc-600">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="mx-auto w-full max-w-[940px] space-y-3 2xl:sticky 2xl:top-8 2xl:max-w-none">
          <div className="rounded-2xl border border-white/[0.12] bg-white/[0.035] p-5">
            <h3 className="text-sm font-medium text-zinc-300">Actions</h3>
            <div className="mt-4 space-y-2">
              <Button onClick={() => onApprove(pitch.id)} className="w-full">Approve</Button>
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
        </aside>
      </div>
    </motion.div>
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

function PitchCreateModal({ writers, onClose, onCreate }) {
  const [draft, setDraft] = useState({
    title: "",
    angle: "",
    notes: "",
    section: "News",
    owner: writers[0] || "Unassigned",
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
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">Writer</span>
              <select
                value={draft.owner}
                onChange={(event) => updateDraft("owner", event.target.value)}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 text-sm text-zinc-200 outline-none focus:border-white/[0.18]"
              >
                {writers.map((writer) => (
                  <option key={writer} value={writer} className="bg-zinc-950">{writer}</option>
                ))}
              </select>
            </label>
            <label className="block">
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
          </div>

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
          <span className="text-xs text-zinc-600">{article.deadline}</span>
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

function StoriesPage({ stories, updateStoryStatus, setToast }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [sectionFilter, setSectionFilter] = useState("All sections");
  const [editorFilter, setEditorFilter] = useState("All editors");
  const [selectedStoryId, setSelectedStoryId] = useState(stories[0]?.id || "");

  const visibleStories = useMemo(
    () => stories.filter((story) => storyMatchesFilters(story, query, statusFilter, sectionFilter, editorFilter)),
    [stories, query, statusFilter, sectionFilter, editorFilter]
  );
  const selectedStory = stories.find((story) => story.id === selectedStoryId) || visibleStories[0] || stories[0];
  const needsAttention = stories.filter(storyNeedsAttention).length;
  const dueSoon = stories.filter((story) => story.dueSoon && story.status !== "Published").length;
  const unreadSubmissions = stories.filter((story) => story.unread).length;

  const selectStory = (story) => {
    setSelectedStoryId(story.id);
  };

  const copyStoryDoc = async (story) => {
    if (!storyDocIsOpenable(story)) {
      setToast("This story does not have an available Google Doc link yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(story.googleDocUrl);
      setToast("Copied Google Doc link.");
    } catch {
      setToast("Could not copy the Google Doc link from this browser.");
    }
  };

  return (
    <PageShell
      title="Stories"
      eyebrow="Editorial queue / Google Docs review"
      right={
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" icon="filter" onClick={() => {
            setStatusFilter("Submitted");
            setSectionFilter("All sections");
            setEditorFilter("All editors");
          }}>
            New submissions
          </Button>
          <Button variant="ghost" icon="link" onClick={() => selectedStory && copyStoryDoc(selectedStory)}>
            Copy selected doc
          </Button>
        </div>
      }
    >
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <StoryQueueMetric label="Needs attention" value={needsAttention} helper="Submitted, in-review, or missing-doc stories" tone="blue" />
        <StoryQueueMetric label="Due soon" value={dueSoon} helper="Deadlines marked today or tomorrow" tone="amber" />
        <StoryQueueMetric label="Unread submissions" value={unreadSubmissions} helper="New writer activity waiting for an editor" tone="green" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row">
            <Input value={query} onChange={setQuery} placeholder="Search title, writer, editor, section, or next step" className="flex-1" />
            <AnimatedDropdown
              text={statusFilter}
              items={STORY_FILTER_STATUSES.map((name) => ({ name, link: "#" }))}
              onSelect={(item) => setStatusFilter(item.name)}
              className="lg:w-52"
            />
            <AnimatedDropdown
              text={sectionFilter}
              items={STORY_FILTER_SECTIONS.map((name) => ({ name, link: "#" }))}
              onSelect={(item) => setSectionFilter(item.name)}
              className="lg:w-52"
            />
            <AnimatedDropdown
              text={editorFilter}
              items={STORY_FILTER_EDITORS.map((name) => ({ name, link: "#" }))}
              onSelect={(item) => setEditorFilter(item.name)}
              className="lg:w-48"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.035] text-xs uppercase text-zinc-600">
                <tr>
                  <th className="px-4 py-3">Story</th>
                  <th className="hidden px-4 py-3 md:table-cell">Owner</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Deadline</th>
                  <th className="px-4 py-3">Doc</th>
                </tr>
              </thead>
              <tbody>
                {visibleStories.map((story) => {
                  const hasDoc = storyDocIsOpenable(story);
                  return (
                    <tr
                      key={story.id}
                      onClick={() => selectStory(story)}
                      className={cx(
                        "cursor-pointer border-t border-white/[0.06] transition hover:bg-white/[0.04]",
                        selectedStory?.id === story.id && "bg-white/[0.055]"
                      )}
                    >
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-start gap-3">
                          <span className={cx("mt-1 h-2.5 w-2.5 rounded-full", story.unread ? "bg-sky-400" : "bg-zinc-700")} />
                          <div className="min-w-0">
                            <div className="font-medium leading-5 text-zinc-100">{story.title}</div>
                            <div className="mt-1 text-xs text-zinc-500">{story.section} / Last edited {story.lastEdited}</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <StatusBadge tone={storyStatusTone(story.status)}>{story.status}</StatusBadge>
                              <StatusBadge tone={story.priority === "High" ? "amber" : "neutral"}>{story.priority}</StatusBadge>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-4 align-top text-zinc-400 md:table-cell">
                        <div>{story.writer}</div>
                        <div className="mt-1 text-xs text-zinc-600">Editor: {story.editor}</div>
                      </td>
                      <td className="hidden px-4 py-4 align-top lg:table-cell">
                        <span className={cx("text-sm", story.dueSoon ? "text-amber-300" : "text-zinc-500")}>{story.deadline}</span>
                        <div className="mt-1 text-xs text-zinc-600">{story.submittedAt}</div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        {hasDoc ? (
                          <a
                            href={story.googleDocUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/[0.07] hover:text-zinc-50"
                          >
                            <Icon name="link" className="h-3.5 w-3.5" />
                            Open Google Doc
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-xl border border-rose-400/15 bg-rose-400/10 px-3 py-2 text-xs font-medium text-rose-300">
                            <Icon name="x" className="h-3.5 w-3.5" />
                            Doc unavailable
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!visibleStories.length && (
              <StateMessage
                icon="search"
                title="No stories match these filters"
                body="Clear a filter or search for another writer, editor, section, status, or next step."
              />
            )}
          </div>
        </Card>

        <StoryDetailPanel
          story={selectedStory}
          updateStoryStatus={updateStoryStatus}
          copyStoryDoc={copyStoryDoc}
        />
      </div>
    </PageShell>
  );
}

function StoryQueueMetric({ label, value, helper, tone }) {
  const toneClasses = {
    blue: "text-sky-300",
    amber: "text-amber-300",
    green: "text-emerald-300",
  };
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={cx("mt-2 text-3xl font-semibold", toneClasses[tone])}>{value}</div>
      <div className="mt-2 text-xs leading-5 text-zinc-600">{helper}</div>
    </div>
  );
}

function StoryDetailPanel({ story, updateStoryStatus, copyStoryDoc }) {
  if (!story) {
    return (
      <Card className="flex min-h-[560px] items-center justify-center p-5">
        <div className="max-w-sm text-center">
          <h3 className="text-lg font-semibold text-zinc-100">Select a story</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-500">Story metadata and Google Doc actions will appear here.</p>
        </div>
      </Card>
    );
  }

  const hasDoc = storyDocIsOpenable(story);
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <StatusBadge tone={storyStatusTone(story.status)}>{story.status}</StatusBadge>
            <StatusBadge tone={story.dueSoon ? "amber" : "neutral"}>{story.deadline}</StatusBadge>
          </div>
          <h2 className="text-xl font-semibold leading-7 text-zinc-50">{story.title}</h2>
          <p className="mt-2 text-sm text-zinc-500">{story.section} / {story.writer} / Editor: {story.editor}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {hasDoc ? (
            <a
              href={story.googleDocUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 text-sm font-medium text-black transition hover:bg-white"
            >
              <Icon name="link" className="h-4 w-4" />
              Open Google Doc
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-12 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-rose-400/15 bg-rose-400/10 px-4 text-sm font-medium text-rose-300 opacity-75"
            >
              <Icon name="x" className="h-4 w-4" />
              Google Doc unavailable
            </button>
          )}
          <Button variant="ghost" icon="link" onClick={() => copyStoryDoc(story)} disabled={!hasDoc}>
            Copy link
          </Button>
        </div>
      </div>

      <div className="grid gap-4 border-b border-white/[0.08] py-5 sm:grid-cols-3">
        <MiniStat label="Words" value={fmt(story.wordCount)} />
        <MiniStat label="Sources" value={story.sourceCount} />
        <MiniStat label="Revisions" value={story.revisionCount} />
      </div>

      <div className="space-y-5 py-5">
        <div>
          <div className="text-xs text-zinc-600">Summary</div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{story.summary}</p>
        </div>
        <div>
          <div className="text-xs text-zinc-600">Next step</div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{story.nextStep}</p>
        </div>
        <div>
          <div className="text-xs text-zinc-600">Editor note</div>
          <p className="mt-2 rounded-2xl border border-white/[0.08] bg-black/25 p-3 text-sm leading-6 text-zinc-400">{story.editorNote}</p>
        </div>
      </div>

      <div className="border-t border-white/[0.08] pt-5">
        <label className="text-xs text-zinc-600">
          Workflow status
          <Select value={story.status} onChange={(status) => updateStoryStatus(story.id, status)} options={STORY_STATUSES} className="mt-2" />
        </label>
        <div className="mt-4 grid gap-3 text-sm text-zinc-500 sm:grid-cols-2">
          <Field label="Submitted" value={story.submittedAt} />
          <Field label="Last edited" value={story.lastEdited} />
        </div>
      </div>
    </Card>
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
        throw new Error("Article API returned HTML instead of JSON. Make sure the Flask backend is running on port 5000.");
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
        setSections(["All sections", ...payload.sections.filter((name) => name && name !== "All sections")]);
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
        <Card className="p-5">
          <div className="mb-4">
            <div>
              <h2 className="font-medium text-zinc-50">Articles database</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Loaded 10 at a time from the existing backend article records API.
              </p>
            </div>
          </div>
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
        </Card>
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

      {(article.section || article.tags.length > 0) && (
        <div className="mt-5">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-600">Section / Tags</p>
          <div className="flex flex-wrap gap-2">
            {article.section && <StatusBadge tone="blue">{article.section}</StatusBadge>}
            {article.tags.map((tag) => <StatusBadge key={tag}>{tag}</StatusBadge>)}
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

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-50">{value}</p>
    </div>
  );
}

function IntervieweesPage() {
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
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        throw new Error("Source APIs returned HTML instead of JSON. Make sure the Flask backend is running on port 5000.");
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
    setSaving(true);
    setSaveError("");
    const nextRecord = updateInterviewRecordRow(selectedRecord, draft);
    try {
      const response = await fetch(`${API_BASE}/api/interview-records/${encodeURIComponent(selectedRecord.id)}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
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

  return (
    <PageShell title="Interviewees & source database" eyebrow="Sources / People">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-medium text-zinc-50">Source database</h2>
              <p className="mt-1 text-sm text-zinc-500">
                One row per interviewee record linked to one article.
              </p>
            </div>
          </div>

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
        </Card>
        <InterviewRecordInspector
          record={selectedRecord}
          loading={loading}
          editing={editing}
          draft={draft}
          setDraft={setDraft}
          onEdit={handleEditStart}
          onCancel={handleEditCancel}
          onSave={handleSaveRecord}
          saving={saving}
          saveError={saveError}
        />
      </div>
    </PageShell>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-600">{label}</p>
      <p className="mt-2 truncate text-sm text-zinc-200">{value || "Unknown"}</p>
    </div>
  );
}

function InterviewRecordInspector({ record, loading, editing, draft, setDraft, onEdit, onCancel, onSave, saving, saveError }) {
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
    <Card className="p-5">
      <div className="mb-6 flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-xs uppercase tracking-[0.16em] text-zinc-600">Selected record</p>
          <h2 className="break-words text-xl font-semibold tracking-tight text-zinc-50">{record.name}</h2>
          <p className="mt-2 text-sm text-zinc-500">Grade {record.grade || "Unknown"} - {record.house || "Unknown"}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-medium text-zinc-50">Source information</h3>
          {!editing && <Button variant="ghost" icon="edit" className="shrink-0" onClick={onEdit}>Edit record</Button>}
        </div>
        {editing ? (
          <div className="space-y-4">
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
            {saveError && <p className="text-sm text-rose-300">{saveError}</p>}
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" onClick={onCancel}>Cancel</Button>
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-xl bg-zinc-100 px-3.5 py-2 text-sm font-medium text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            <ReadOnlyField label="Name" value={record.name} />
            <ReadOnlyField label="Grade" value={record.grade} />
            <ReadOnlyField label="House" value={record.house} />
          </div>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-white/[0.08] bg-black/20 p-4">
        <h3 className="mb-4 font-medium text-zinc-50">Article information</h3>
        <div>
          {isValidHttpUrl(record.article?.url) ? (
            <a
              href={record.article.url}
              target="_blank"
              rel="noreferrer"
              className="block break-words text-sm font-medium leading-6 text-zinc-100 transition hover:text-white"
            >
              {record.article?.title || "Article title unavailable"}
            </a>
          ) : (
            <p className="break-words text-sm font-medium leading-6 text-zinc-100">
              {record.article?.title || "Article title unavailable"}
            </p>
          )}
          <p className="mt-1 text-sm text-zinc-500">{record.article?.publishedAt || "Date unavailable"}</p>
        </div>
      </div>
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
                    <span className="text-xs text-zinc-600">{task.due}</span>
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

function CalendarPage() {
  const days = Array.from({ length: 35 }, (_, i) => i + 1);
  return (
    <PageShell title="Publishing calendar" eyebrow="Schedule / Deadlines" right={<div className="flex gap-2"><Button variant="ghost" icon="filter">Section filter</Button><Button icon="plus">New event</Button></div>}>
      <Card className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">May 2026</h2>
            <p className="mt-1 text-sm text-zinc-500">Editorial deadlines, interviews, reviews, and publish dates.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost">Week</Button>
            <Button>Month</Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.16em] text-zinc-600">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-2">{d}</div>)}</div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const items = calendarItems.filter((e) => e.day === day);
            return (
              <div key={day} className="min-h-32 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 text-left">
                <div className="mb-2 text-xs text-zinc-600">{day <= 31 ? day : ""}</div>
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <div key={item.title} className="rounded-lg border border-white/[0.08] bg-white/[0.055] px-2 py-1.5">
                      <p className="truncate text-xs text-zinc-200">{item.title}</p>
                      <p className="text-[10px] text-zinc-600">{item.type} - {item.section}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </PageShell>
  );
}

function AnalyticsPage({ articles, selectedArticle, setSelectedArticleId }) {
  return (
    <PageShell title="Analytics" eyebrow="Performance / Insights" right={<div className="flex gap-2"><Select value={selectedArticle.id} onChange={setSelectedArticleId} options={articles.map((a) => a.id)} className="w-44" /><Button variant="ghost" icon="upload">Import CSV</Button></div>}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon="eye" label="Total views" value="42,284" delta="+18.4%" />
        <Metric icon="people" label="Unique readers" value="29,120" delta="+11.6%" />
        <Metric icon="clock" label="Avg. read time" value="2m 04s" delta="+4.8%" />
        <Metric icon="link" label="Top referrer" value="Google" delta="47%" />
      </div>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <Card className="p-5">
          <h2 className="mb-1 font-medium">Article traffic</h2>
          <p className="mb-5 text-sm text-zinc-500">Selected article: {selectedArticle.title}</p>
          <div className="h-[330px]"><TrafficChart /></div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-1 font-medium">Section performance</h2>
          <p className="mb-5 text-sm text-zinc-500">Share of total newsroom traffic.</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <PieChart>
                <Pie data={sectionData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                  {sectionData.map((_, idx) => <Cell key={idx} fill={["#fafafa", "#d4d4d8", "#a1a1aa", "#71717a", "#52525b"][idx]} />)}
                </Pie>
                <Tooltip content={<TooltipBox />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">{sectionData.map((s) => <div key={s.name} className="flex justify-between text-sm"><span className="text-zinc-400">{s.name}</span><span className="text-zinc-600">{s.value}%</span></div>)}</div>
        </Card>
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-4 font-medium">Author leaderboard</h2>
          {["Sofia Chen", "Marcus Lee", "Ava Patel", "Daniel Wu"].map((name, idx) => <div key={name} className="flex items-center justify-between border-b border-white/[0.06] py-3 last:border-0"><span className="text-sm text-zinc-300">{idx + 1}. {name}</span><span className="text-sm text-zinc-500">{fmt(9000 - idx * 1400)}</span></div>)}
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-medium">Referrers</h2>
          {["Google Search", "Instagram", "Direct", "School Website"].map((name, idx) => <Progress key={name} label={name} value={[47, 23, 16, 9][idx]} />)}
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-medium">Editorial insight</h2>
          <Insight title="Searchable topic" body="The Snapchat article is attracting outside search traffic. Add evergreen context and internal links." />
          <div className="mt-3"><Insight title="Section growth" body="Science & Technology is up 28%, making it the strongest section this week." /></div>
        </Card>
      </section>
    </PageShell>
  );
}

function AdminPage({ setToast }) {
  const [staff, setStaff] = useState(users);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [collapsedRoles, setCollapsedRoles] = useState({});

  const query = adminSearchQuery(search);
  const isSearching = query.length > 0;
  const visibleStaff = useMemo(
    () => staff.filter((user) => adminUserMatches(user, query, roleFilter)),
    [staff, query, roleFilter]
  );
  const groupedStaff = useMemo(() => groupAdminUsersByRole(staff, roleFilter), [staff, roleFilter]);

  const updateUserRole = (userId, nextRole) => {
    const user = staff.find((item) => item.id === userId);
    setStaff((prev) => prev.map((item) => (item.id === userId ? { ...item, role: nextRole } : item)));
    if (user && user.role !== nextRole) {
      setToast(`${user.name} moved to ${nextRole}.`);
    }
  };

  const toggleRole = (roleId) => {
    setCollapsedRoles((prev) => ({ ...prev, [roleId]: !prev[roleId] }));
  };

  return (
    <PageShell
      title="Admin dashboard"
      eyebrow="Workspace / Permissions"
      className="max-w-6xl"
      right={<Button icon="mail" onClick={() => setToast("Invite staff is ready for backend wiring.")}>Invite staff</Button>}
    >
      <section className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 md:flex-row md:items-center md:justify-between">
          <Input value={search} onChange={setSearch} placeholder="Search staff..." className="h-12 md:w-[560px]" />
          <Select value={roleFilter} onChange={setRoleFilter} options={ADMIN_ROLE_FILTER_OPTIONS} className="w-full md:w-36" />
        </div>

        {isSearching ? (
          <AdminSearchResults staff={visibleStaff} onRoleChange={updateUserRole} />
        ) : (
          <div className="space-y-6 pb-20">
            {groupedStaff.map((group) => (
              <AdminRoleGroup
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

function AdminRoleGroup({ group, collapsed, onToggle, onRoleChange }) {
  return (
    <section className="relative">
      <RoleGroupHeader role={group.label} description={group.description} isCollapsed={collapsed} onToggle={onToggle} />

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <AdminColumnHeader />
            {group.users.length ? (
              <div>
                {group.users.map((user) => (
                  <AdminUserRow key={user.id} user={user} onRoleChange={onRoleChange} />
                ))}
              </div>
            ) : (
              <div className="border-t border-white/[0.06] px-4 py-6 text-sm text-zinc-600 sm:px-3">No staff in this role.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function RoleGroupHeader({ role, description, isCollapsed, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={!isCollapsed}
      className="
        relative
        flex w-full items-center justify-between
        overflow-hidden
        rounded-xl
        border border-zinc-900/50
        bg-zinc-950/70
        px-4 py-3
        text-left
        transition
        before:absolute
        before:left-0
        before:top-3
        before:h-[calc(100%-1.5rem)]
        before:w-[2px]
        before:rounded-full
        before:bg-gradient-to-b
        before:from-zinc-500/70
        before:via-zinc-500/40
        before:to-transparent
        hover:border-zinc-800/80
        hover:bg-zinc-950
        hover:before:from-zinc-400/80
        hover:before:via-zinc-400/50
      "
    >
      <div className="min-w-0">
        <div className="flex items-center gap-5">
          <Icon name="chevron" className={cx("h-4 w-4 text-zinc-500 transition-transform duration-200", isCollapsed ? "-rotate-90" : "rotate-0")} />
          <h2 className="text-sm font-semibold text-zinc-50">{role}</h2>
        </div>

        <p className="mt-2 truncate pl-9 text-sm text-zinc-500">{description}</p>
      </div>
    </button>
  );
}

function AdminSearchResults({ staff, onRoleChange }) {
  return (
    <section className="pb-20">
      <AdminColumnHeader />
      {staff.length ? (
        <div>
          {staff.map((user) => (
            <AdminUserRow key={user.id} user={user} onRoleChange={onRoleChange} />
          ))}
        </div>
      ) : (
        <div className="border-t border-white/[0.06] px-4 py-8 text-sm text-zinc-600 sm:px-3">No staff match that name.</div>
      )}
    </section>
  );
}

function AdminColumnHeader() {
  return (
    <div className="mt-3 hidden grid-cols-[minmax(16rem,1fr)_12rem_10rem] px-4 pb-3 text-sm font-medium text-zinc-500 sm:grid sm:px-3">
      <div>User</div>
      <div>Role</div>
      <div>Last seen</div>
    </div>
  );
}

function AdminUserRow({ user, onRoleChange }) {
  return (
    <div className="relative grid gap-4 border-t border-white/[0.045] px-4 py-4 sm:grid-cols-[minmax(16rem,1fr)_12rem_10rem] sm:items-center sm:px-3">
      <div className="min-w-0">
        <div className="truncate text-base font-semibold text-zinc-50">{user.name}</div>
        <div className="mt-1 truncate text-sm text-zinc-600">{user.email}</div>
      </div>
      <div>
        <div className="mb-2 text-sm font-medium text-zinc-600 sm:hidden">Role</div>
        <AdminRoleDropdown value={user.role} onChange={(nextRole) => onRoleChange(user.id, nextRole)} label={`${user.name} role`} />
      </div>
      <div className="text-sm text-zinc-500">
        <div className="mb-2 text-sm font-medium text-zinc-600 sm:hidden">Last seen</div>
        {user.lastSeen}
      </div>
    </div>
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
          className="fixed z-[100] overflow-hidden rounded-xl border border-white/[0.12] bg-zinc-950 p-1 shadow-2xl shadow-black/60 ring-1 ring-black/40"
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
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition",
                option === value ? "bg-white/[0.08] text-zinc-50" : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
              )}
            >
              <span>{option}</span>
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
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 w-32 items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-black/25 px-3 text-sm text-zinc-100 transition hover:border-white/[0.16] hover:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-white/15"
      >
        <span className="truncate">{value}</span>
        <Icon name="chevron" className={cx("h-4 w-4 shrink-0 text-zinc-500 transition", open && "rotate-180")} />
      </button>
      {menu}
    </>
  );
}

function SettingsPage() {
  return (
    <PageShell title="Workspace settings" eyebrow="Configuration / School setup" right={<Button>Save changes</Button>}>
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
          <h2 className="font-medium">Integrations</h2>
          <p className="mt-1 text-sm text-zinc-500">Mock setup state for future backend connections.</p>
          <div className="mt-5 space-y-3">
            <Integration name="SNO / WordPress Import" status="Detected" />
            <Integration name="Google Analytics API" status="Not connected" />
            <Integration name="Google Calendar" status="Not connected" />
            <Integration name="Email notifications" status="Draft mode" />
          </div>
        </Card>
        <Card className="p-5 xl:col-span-2">
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

function Integration({ name, status }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
      <span className="text-sm text-zinc-300">{name}</span>
      <StatusBadge tone={status === "Detected" ? "green" : status === "Draft mode" ? "blue" : "neutral"}>{status}</StatusBadge>
    </div>
  );
}

export default function FalconNewsroomFullInteractiveUI() {
  return <AppShell />;
}
