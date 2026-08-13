import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import React, { useMemo, useState } from 'react';
import './landing-v4.css';

const workflowStages = [
  {
    id: 'pitch',
    label: 'Pitch',
    note: 'Capture the idea, audience, urgency, and first reporting leads so every assignment starts with direction.',
    details: ['Angle and audience', 'Reporting leads'],
  },
  {
    id: 'report',
    label: 'Report',
    note: 'Track ownership, deadlines, source records, interview notes, and editor questions in one shared story workspace.',
    details: ['Sources and notes', 'Draft and deadline'],
  },
  {
    id: 'publish',
    label: 'Publish',
    note: 'Make feedback actionable, resolve the open checks, and carry final metadata from review to the next deadline.',
    details: ['Editor feedback', 'Publish handoff'],
  },
];

const archiveRecords = [
  {
    id: 'congressional-app-challenge',
    title: 'Poolesville seniors secure a win in prestigious Congressional App Challenge',
    author: 'Claire Huang',
    section: 'School News',
    published: 'Apr 7, 2026',
    interviewees: [
      { name: 'Krish Putta', grade: '12', house: 'SMCS' },
      { name: 'Shayaan Wadkar', grade: '12', house: 'SMCS' },
    ],
  },
  {
    id: 'artemis-playlist',
    title: 'A musical mission: NASA reveals Artemis II playlist',
    author: 'Sydney Saeed',
    section: 'Arts & Culture',
    published: 'Apr 21, 2026',
    interviewees: [
      { name: 'Dr. Lena Ortiz', grade: 'Staff', house: 'Science' },
      { name: 'Maya Thompson', grade: '11', house: 'Humanities' },
    ],
  },
  {
    id: 'school-board-calendar',
    title: 'MCPS settles calendar after requesting waiver from Board of Education',
    author: 'Imani Lovelace',
    section: 'Local News',
    published: 'Mar 26, 2026',
    interviewees: [
      { name: 'Lauren Kim', grade: 'Staff', house: 'Administration' },
      { name: 'Marcus Lee', grade: '12', house: 'Humanities' },
      { name: 'Anika Shah', grade: '10', house: 'Global' },
    ],
  },
  {
    id: 'hero-club-letters',
    title: 'HERO Club gives back with staff appreciation letters',
    author: 'Sydney Saeed',
    section: 'School News',
    published: 'Mar 27, 2026',
    interviewees: [
      { name: 'Nora Patel', grade: '11', house: 'Humanities' },
      { name: 'James Walker', grade: 'Staff', house: 'Counseling' },
    ],
  },
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
          {archiveRecords.map((record) => {
            const row = [record.title, record.section, record.author, record.published];
            return <div className="archive-row" key={record.id}>{row.map((cell, j) => <span key={cell} className={j === 0 ? 'primary-cell' : ''}>{cell}</span>)}</div>;
          })}
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
  const [query, setQuery] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState(archiveRecords[0].id);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return archiveRecords;
    return archiveRecords.filter((record) => [
      record.title,
      record.author,
      record.section,
      record.published,
      ...record.interviewees.flatMap((person) => [person.name, person.grade, person.house]),
    ].join(' ').toLowerCase().includes(normalizedQuery));
  }, [query]);
  const selectedRecord = filteredRecords.find((record) => record.id === selectedRecordId) || filteredRecords[0] || null;


  return (
    <main className="landing-page">
      <header className="site-header">
        <nav className="nav-shell" aria-label="Main navigation">
          <a className="brand" href="#top" aria-label="Inscribe home"><img className="brand-logo" src="/app-logo.png" alt=""/><span>Inscribe</span></a>
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
          <motion.p className="hero-subtitle" initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}>Manage everything in one place.</motion.p>
          <motion.div className="hero-actions" initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}><a className="primary-button" href="/signup">Get Inscribe <Icon name="arrow"/></a></motion.div>
        </div>

        <motion.div className="page-width hero-product" initial={reduceMotion ? false : { opacity: 0, y: 42, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.05, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}>
          <img className="hero-dashboard-image" src="/landing/dashboard-hero.webp" alt="Inscribe dashboard for Poolesville Pulse showing John Doe's editorial tasks and recent newsroom activity." fetchPriority="high" decoding="async"/>
        </motion.div>
      </section>



      <section id="workflow" className="section workflow-section">
        <div className="page-width workflow-intro"><Reveal><h2>A workflow built for journalists.</h2></Reveal></div>
        <div className="page-width workflow-grid">
          {workflowStages.map((stage, index) => (
            <Reveal className="workflow-box-reveal" delay={index * 0.08} key={stage.id}>
              <article className="workflow-box">
               <h3>{stage.label}</h3>
                <p>{stage.note}</p>
                <ul className="workflow-box-details">{stage.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="records" className="section archive-section">
        <div className="landing-visual-wide">
          <Reveal className="archive-copy"><h2>Your newspaper records, organized.</h2><p>Find published articles and sources in seconds.</p></Reveal>
        </div>
          <Reveal className="landing-visual-wide records-preview" delay={0.08} amount={0.12}>
            <div className="records-app-header">
              <h3>Articles database</h3>
            </div>
            <div className="records-preview-tools">
              <label className="archive-search"><Icon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, author, section, or tag" aria-label="Search featured article records"/></label>
              <div className="records-section-select" aria-hidden="true"><span>All sections</span><span>⌄</span></div>
            </div>
            <div className="records-browser">
              <div className="records-index">
                <div className="records-list" aria-label="Featured article records">
                  <div className="records-list-header"><span>Title</span><span>Date published ↓</span></div>
                  {filteredRecords.map((record) => {
                    const isSelected = selectedRecord?.id === record.id;
                    return (
                      <button
                        type="button"
                        className={isSelected ? 'record-row selected' : 'record-row'}
                        onClick={() => setSelectedRecordId(record.id)}
                        aria-pressed={isSelected}
                        key={record.id}
                      >
                        <span><strong>{record.title}</strong><small>{record.author}</small></span>
                        <time>{record.published}</time>
                      </button>
                    );
                  })}
                  {filteredRecords.length === 0 && <div className="records-empty">No matching records. Try another title, author, source, or section.</div>}
                </div>
                <div className="records-pagination" aria-hidden="true">
                  <span>Showing <strong>1–4</strong> of <strong>958</strong></span>
                  <div><span className="current">1</span><span>2</span><span>…</span><span>96</span><span>›</span></div>
                </div>
              </div>
              <div className="record-detail-shell">
                <AnimatePresence mode="wait" initial={false}>
                  {selectedRecord ? (
                    <motion.article
                      className="record-detail"
                      key={selectedRecord.id}
                      initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, x: -6 }}
                      transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                      aria-live="polite"
                    >
                      <header>
                        <div>
                          <h3>{selectedRecord.title}</h3>
                          <p>By {selectedRecord.author}</p>
                          <time>{selectedRecord.published}</time>
                        </div>
                      </header>
                      <div className="interviewee-heading"><h4>Interviewees</h4></div>
                      <div className="interviewee-table">
                        <div className="interviewee-table-head"><span>Name</span><span>Grade</span><span>House</span></div>
                        {selectedRecord.interviewees.map((person) => <div className="interviewee-row" key={person.name}><strong>{person.name}</strong><span>{person.grade}</span><span>{person.house}</span></div>)}
                      </div>
                    </motion.article>
                  ) : (
                    <div className="record-detail-empty" role="status"><Icon name="search"/><span>No article selected</span></div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
      </section>
      <section id="analytics" className="section analytics-section">
        <div className="page-width feature-layout analytics-layout">
          <Reveal className="analytics-visual"><AnalyticsFrame/></Reveal>
          <Reveal className="feature-copy" delay={0.08}><h2>Track and analyze article analytics.</h2><p>Track publishing pace, section output, deadline health, and review time without turning the newsroom into a wall of metrics.</p><ul className="feature-points"><li>Compare output across desks and sections</li><li>Spot missed deadlines and review bottlenecks</li><li>Use trends to plan the next coverage cycle</li></ul></Reveal>
        </div>
      </section>
      <section className="section final-section">
        <Reveal className="page-width final-content"><h2>A better newspaper starts with a clearer system.</h2><div className="hero-actions"><a className="primary-button light-button" href="/signup">Start your workspace <Icon name="arrow"/></a></div></Reveal>
      </section>
      <footer className="footer">
        <div className="landing-visual-wide footer-top">
          <div className="footer-brand"><a className="brand" href="#top"><img className="brand-logo" src="/app-logo.png" alt=""/><span>Inscribe</span></a></div>
          <div className="footer-links">
            <div><strong>Product</strong><a href="#workflow">Workflow</a><a href="#records">Records</a><a href="#analytics">Analytics</a></div>
            <div><strong>Legal</strong><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/accessibility">Accessibility</a></div>
            <div><strong>Connect</strong><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://x.com" target="_blank" rel="noreferrer">X ↗</a><a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn ↗</a></div>
          </div>
        </div>
        <div className="landing-visual-wide footer-bottom"><small>© 2026 Inscribe</small></div>
      </footer>    </main>
  );
}
