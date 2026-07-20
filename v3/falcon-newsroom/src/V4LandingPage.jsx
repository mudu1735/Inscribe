import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './landing-v4.css';

const workflowStages = [
  {
    id: 'pitch',
    label: 'Pitch',
    eyebrow: 'Capture the idea',
    title: 'Student housing costs rise again',
    status: 'Awaiting review',
    owner: 'Maya Chen',
    meta: 'Submitted 14 minutes ago',
    note: 'The pitch records the angle, urgency, audience, and first reporting leads before work begins.',
  },
  {
    id: 'assign',
    label: 'Assign',
    eyebrow: 'Set the reporting plan',
    title: 'Inside the spring musical build',
    status: 'Assigned',
    owner: 'Eli Brooks',
    meta: 'Draft due Friday',
    note: 'Editors set ownership, deadlines, collaborators, and the reporting checklist in one handoff.',
  },
  {
    id: 'report',
    label: 'Report',
    eyebrow: 'Keep context attached',
    title: 'Library redesign: student reactions',
    status: 'Reporting',
    owner: 'Maya Chen',
    meta: '3 sources confirmed',
    note: 'Interview notes, source details, documents, and editor questions stay connected to the story.',
  },
  {
    id: 'review',
    label: 'Review',
    eyebrow: 'Make feedback actionable',
    title: 'Girls tennis reaches regional final',
    status: 'Ready for review',
    owner: 'Jules Park',
    meta: '2 unresolved comments',
    note: 'Editors can see what changed, what still needs verification, and who owns the next decision.',
  },
  {
    id: 'publish',
    label: 'Publish',
    eyebrow: 'Ship with confidence',
    title: 'Board approves new bell schedule',
    status: 'Scheduled',
    owner: 'Avery Cole',
    meta: 'Publishes tomorrow at 7:00 AM',
    note: 'Final metadata, credits, section placement, and publishing status are checked before release.',
  },
];

const archiveRows = [
  ['Board approves new bell schedule', 'News', 'Avery Cole', 'Jul 10, 2026'],
  ['What students want from the new library', 'Features', 'Maya Chen', 'Jul 8, 2026'],
  ['Girls tennis reaches regional final', 'Sports', 'Jules Park', 'Jul 5, 2026'],
  ['The case for later start times', 'Opinion', 'Eli Brooks', 'Jun 28, 2026'],
  ['Behind the spring musical set', 'Arts', 'Nia Patel', 'Jun 21, 2026'],
];

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,

    spark: <><path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z"/><path d="m5 16 .9 2.1L8 19l-2.1.9L5 22l-.9-2.1L2 19l2.1-.9L5 16Z"/></>,
    activity: <><path d="M3 12h4l2.2-5 4.4 10 2.2-5H21"/></>,
    board: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/></>,
    archive: <><path d="M4 7h16"/><path d="M5 7v12h14V7"/><path d="M3 3h18v4H3z"/><path d="M9 11h6"/></>,
    comment: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function Reveal({ children, className = '', delay = 0, amount = 0.2 }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.72, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ProductFrame({ activeView }) {
  const [selectedStory, setSelectedStory] = useState(0);
  const stories = [
    { title: 'New bell schedule approved', label: 'Ready for review', due: 'Today', author: 'Avery Cole' },
    { title: 'Inside the spring musical build', label: 'Reporting', due: 'Fri', author: 'Eli Brooks' },
    { title: 'Library redesign: student reactions', label: 'Editing', due: 'Mon', author: 'Maya Chen' },
  ];

  if (activeView === 'archive') {
    return (
      <div className="product-window archive-window">
        <div className="app-chrome"><span/><span/><span/><div>Articles database</div></div>
        <div className="archive-toolbar"><div className="fake-search"><Icon name="search" size={15}/>Search articles, authors, tags…</div><button>Filter</button><button>Export</button></div>
        <div className="archive-table">
          <div className="archive-header"><span>Article</span><span>Section</span><span>Author</span><span>Published</span></div>
          {archiveRows.slice(0, 4).map((row, i) => <div className="archive-row" key={row[0]}>{row.map((cell, j) => <span key={cell} className={j === 0 ? 'primary-cell' : ''}>{cell}</span>)}</div>)}
        </div>
        <div className="archive-insight"><span className="archive-insight-dot"/><span>Linked reporting context</span><strong>14 related stories · 8 shared interviewees</strong></div>
      </div>
    );
  }

  if (activeView === 'workflow') {
    return (
      <div className="product-window workflow-window">
        <div className="app-chrome"><span/><span/><span/><div>Stories</div></div>
        <div className="kanban-grid">
          {['In progress', 'Ready for review', 'Approved'].map((column, index) => (
            <div className="kanban-column" key={column}>
              <div className="column-heading"><span>{column}</span><small>{index + 2}</small></div>
              {[0, 1].map((item) => (
                <div className="story-card" key={item}>
                  <span className="story-section">{index === 0 ? 'FEATURES' : index === 1 ? 'NEWS' : 'SPORTS'}</span>
                  <strong>{['Inside the spring musical build', 'Board approves new bell schedule', 'Girls tennis reaches regional final'][(index + item) % 3]}</strong>
                  <div className="story-card-footer"><span className="avatar tiny">{['E','A','J'][index]}</span><span>{index === 1 ? '2 comments' : 'Due Friday'}</span></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="product-window dashboard-window">
      <div className="app-chrome"><span/><span/><span/><div>Dashboard</div></div>
      <div className="dashboard-shell">
        <aside className="mini-sidebar">
          <img className="mini-brand-logo" src="/app-logo.png" alt="" />
          {Array.from({ length: 6 }).map((_, i) => <span key={i} className={i === 0 ? 'active' : ''}/>) }
        </aside>
        <div className="dashboard-main">
          <div className="dashboard-topline"><div><small>MONDAY, JULY 13</small><h3>Good morning, Mu.</h3></div><button>New story</button></div>
          <div className="pulse-strip">
            <div><Icon name="spark" size={17}/><span><strong>6 updates</strong><small>since your last visit</small></span></div>
            <div className="pulse-people"><span className="avatar">M</span><span className="avatar">E</span><span className="avatar">J</span><small>8 active today</small></div>
          </div>
          <div className="dashboard-grid">
            <section className="work-list">
              <div className="panel-title"><span>Needs your attention</span><small>3</small></div>
              {stories.map((story, index) => (
                <button className={selectedStory === index ? 'work-row selected' : 'work-row'} onClick={() => setSelectedStory(index)} key={story.title}>
                  <span className="status-dot"/><span className="work-copy"><strong>{story.title}</strong><small>{story.author} · {story.label}</small></span><span>{story.due}</span>
                </button>
              ))}
            </section>
            <section className="activity-panel">
              <div className="panel-title"><span>Recent activity</span><small>Live</small></div>
              <div className="activity-line"><span className="avatar small">M</span><p><strong>Maya</strong> submitted a new pitch<small>8 min ago</small></p></div>
              <div className="activity-line"><span className="avatar small">E</span><p><strong>Eli</strong> resolved 3 comments<small>21 min ago</small></p></div>
              <div className="activity-line"><span className="avatar small">A</span><p><strong>Avery</strong> scheduled a story<small>1 hr ago</small></p></div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsFrame() {
  const sections = [
    { label: 'News', value: 88, stories: 18 },
    { label: 'Features', value: 64, stories: 13 },
    { label: 'Sports', value: 52, stories: 11 },
    { label: 'Opinion', value: 36, stories: 7 },
  ];

  return (
    <div className="analytics-frame" aria-label="Newsroom analytics preview">
      <div className="analytics-toolbar"><span>Publication overview</span><small>Last 30 days</small></div>
      <div className="analytics-summary"><div><small>Published stories</small><strong>49</strong></div><div><small>On-time rate</small><strong>91%</strong></div></div>
      <div className="analytics-chart">
        <div className="analytics-chart-head"><span>Output by section</span><small>Stories published</small></div>
        <div className="analytics-bars">
          {sections.map((section) => <div className="analytics-bar-row" key={section.label}><span>{section.label}</span><div><i style={{ width: `${section.value}%` }}/></div><strong>{section.stories}</strong></div>)}
        </div>
      </div>
      <div className="analytics-note"><span className="analytics-note-mark"/><p><strong>Review time is down 18%.</strong><small>Editors are resolving feedback earlier in the workflow.</small></p></div>
    </div>
  );
}
export default function V4LandingPage() {
  const reduceMotion = useReducedMotion();
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const workflowStepRefs = useRef([]);
  const activeStage = workflowStages[activeStageIndex];

  const filteredRows = useMemo(() => archiveRows.filter((row) => row.join(' ').toLowerCase().includes(query.toLowerCase())), [query]);

  useEffect(() => {
    const steps = workflowStepRefs.current.filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveStageIndex(Number(entry.target.dataset.stageIndex));
      });
    }, { rootMargin: '-34% 0px -48% 0px', threshold: 0 });

    steps.forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, []);


  return (
    <main className="landing-page">
      <header className="site-header">
        <nav className="nav-shell" aria-label="Main navigation">
          <a className="brand" href="#top" aria-label="Falcon Newsroom home"><img className="brand-logo" src="/app-logo.png" alt=""/><span>Falcon Newsroom</span></a>
          <div className="desktop-nav">
            <a href="#workflow">Workflow</a><a href="#records">Records</a><a href="#analytics">Analytics</a>
          </div>
          <div className="nav-actions"><a className="primary-button small-button" href="/login">Sign in <Icon name="arrow" size={15}/></a></div>
          <button className="mobile-toggle" onClick={() => setMobileOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={mobileOpen}><Icon name={mobileOpen ? 'close' : 'menu'}/></button>
        </nav>
        <AnimatePresence>
          {mobileOpen && <motion.div className="mobile-menu" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><a href="#workflow">Workflow</a><a href="#records">Records</a><a href="#analytics">Analytics</a><a href="/login">Sign in</a></motion.div>}
        </AnimatePresence>
      </header>

      <section id="top" className="hero-section">
        <div className="page-width hero-content">
          <motion.h1 initial={reduceMotion ? false : { opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}>The most complete<br/>journalism workflow tool.</motion.h1>
          <motion.p className="hero-subtitle" initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}>Manage pitches, assignments, drafts, reviews, publishing, and records all in one place.</motion.p>
          <motion.div className="hero-actions" initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}><a className="primary-button" href="/signup">Get newsroom <Icon name="arrow"/></a></motion.div>
        </div>

        <motion.div className="page-width hero-product" initial={reduceMotion ? false : { opacity: 0, y: 42, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.05, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}>
          <ProductFrame activeView="overview"/>
        </motion.div>
      </section>



      <section id="workflow" className="section workflow-section">
        <div className="page-width workflow-intro"><Reveal><span className="section-kicker">From idea to publication</span><h2>Follow the story as the work moves forward.</h2><p>Scroll through the newsroom process. The working view updates at each handoff, so ownership, context, and the next decision stay visible.</p></Reveal></div>
        <div className="page-width workflow-scroll">
          <div className="workflow-sticky">
            <div className="workflow-stage-frame">
              <div className="workflow-stage-top"><span>Story workflow</span><small>{String(activeStageIndex + 1).padStart(2, '0')} / {String(workflowStages.length).padStart(2, '0')}</small></div>
              <div className="workflow-progress" aria-hidden="true">{workflowStages.map((stage, index) => <span key={stage.id} className={index < activeStageIndex ? 'complete' : index === activeStageIndex ? 'active' : ''}/>)}</div>
              <motion.div className="workflow-story" key={activeStage.id} initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}>
                <div className="detail-top"><span className="status-pill">{activeStage.status}</span><span className="workflow-stage-name">{activeStage.label}</span></div>
                <h3>{activeStage.title}</h3><p>{activeStage.note}</p>
                <div className="detail-fields"><div><small>Owner</small><span><span className="avatar small">{activeStage.owner[0]}</span>{activeStage.owner}</span></div><div><small>Timeline</small><span>{activeStage.meta}</span></div><div><small>Section</small><span>News</span></div><div><small>Priority</small><span>Normal</span></div></div>
                <div className="detail-comment"><Icon name="comment"/><span><strong>Context stays with the story.</strong><small>Notes, feedback, approvals, and source history remain connected.</small></span></div>
              </motion.div>
            </div>
          </div>
          <div className="workflow-steps">
            {workflowStages.map((stage, index) => <article className={index === activeStageIndex ? 'workflow-step active' : 'workflow-step'} data-stage-index={index} ref={(node) => { workflowStepRefs.current[index] = node; }} key={stage.id} aria-current={index === activeStageIndex ? 'step' : undefined}><span>{String(index + 1).padStart(2, '0')}</span><small>{stage.eyebrow}</small><h3>{stage.label}</h3><p>{stage.note}</p></article>)}
          </div>
        </div>
      </section>

      <section id="records" className="section archive-section">        <div className="page-width archive-layout">
          <Reveal className="archive-copy"><span className="section-kicker">Records and institutional memory</span><h2>Past reporting stays useful.</h2><p>Search published work, source history, interview notes, article links, and the editorial decisions behind each story.</p><ul className="feature-points"><li>Find earlier coverage before reporting starts</li><li>See every story connected to a source</li><li>Carry context into the next school year</li></ul></Reveal>
          <Reveal className="interactive-archive" delay={0.08}>
            <label className="archive-search"><Icon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search newsroom records"/></label>
            <div className="live-table"><div className="live-header"><span>Article</span><span>Section</span><span>Author</span></div>{filteredRows.map((row) => <div className="live-row" key={row[0]}><strong>{row[0]}</strong><span>{row[1]}</span><span>{row[2]}</span></div>)}{filteredRows.length === 0 && <div className="empty-state">No matching records.</div>}</div>
            <small className="search-hint">Try “sports”, “Maya”, or “library”.</small>
          </Reveal>
        </div>
      </section>
      <section id="analytics" className="section analytics-section">
        <div className="page-width feature-layout analytics-layout">
          <Reveal className="analytics-visual"><AnalyticsFrame/></Reveal>
          <Reveal className="feature-copy" delay={0.08}><span className="section-kicker">Newsroom analytics</span><h2>See where the work gets stuck.</h2><p>Track publishing pace, section output, deadline health, and review time without turning the newsroom into a wall of metrics.</p><ul className="feature-points"><li>Compare output across desks and sections</li><li>Spot missed deadlines and review bottlenecks</li><li>Use trends to plan the next coverage cycle</li></ul></Reveal>
        </div>
      </section>
      <section className="section final-section">
        <Reveal className="page-width final-content"><span className="section-kicker">Built for the next deadline</span><h2>A better newsroom starts with a clearer system.</h2><p>Bring pitches, stories, people, publishing, and institutional knowledge into one professional workspace.</p><div className="hero-actions"><a className="primary-button light-button" href="/signup">Start your workspace <Icon name="arrow"/></a></div></Reveal>
      </section>
      <footer className="footer">
        <div className="page-width footer-top">
          <div className="footer-brand"><a className="brand" href="#top"><img className="brand-logo" src="/app-logo.png" alt=""/><span>Falcon Newsroom</span></a><p>Editorial operations for modern student newsrooms.</p></div>
          <div className="footer-links">
            <div><strong>Product</strong><a href="#workflow">Workflow</a><a href="#records">Records</a><a href="#analytics">Analytics</a></div>
            <div><strong>Company</strong><a href="/about">About</a><a href="/contact">Contact</a><a href="/careers">Careers</a></div>
            <div><strong>Legal</strong><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/accessibility">Accessibility</a></div>
            <div><strong>Connect</strong><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://x.com" target="_blank" rel="noreferrer">X ↗</a><a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn ↗</a></div>
          </div>
        </div>
        <div className="page-width footer-bottom"><small>© 2026 Falcon Newsroom</small></div>
      </footer>    </main>
  );
}
