import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView, useScroll } from 'framer-motion';
import {
  Linkedin,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  BarChart3,
  Zap,
  FileText,
  Users,
  TrendingUp,
  Star,
  Upload,
  Clock,
  Shield,
  Menu,
  X,
} from 'lucide-react';

// ── Dot-grid background ──────────────────────────────────────────────────────
const dotGridStyle: React.CSSProperties = {
  backgroundImage: 'radial-gradient(circle, rgba(10,102,194,0.07) 1px, transparent 1.2px)',
  backgroundSize: '22px 22px',
};

// ── Animation system ─────────────────────────────────────────────────────────
const EASE     = [0.16, 1, 0.3, 1]  as const;
const EASE_STD = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.55, ease: EASE } },
};

const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.45, ease: EASE_STD } },
};

const slideFromRight = {
  hidden:  { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.65, ease: EASE } },
};

function stagger(children = 0.06, delay = 0.05) {
  return {
    hidden:  {},
    visible: { transition: { staggerChildren: children, delayChildren: delay } },
  };
}

// ── Hooks ────────────────────────────────────────────────────────────────────
function useScrolled(threshold = 24) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => scrollY.on('change', (v) => setScrolled(v > threshold)), [scrollY, threshold]);
  return scrolled;
}

const MotionLink = motion(Link);

// ── Data ─────────────────────────────────────────────────────────────────────
const features = [
  {
    icon: CalendarDays,
    title: 'Plan your whole month in one sitting',
    desc: 'Drag and drop your posts onto a visual calendar. See your entire content pipeline at a glance — and never scramble to find something to post again.',
  },
  {
    icon: Zap,
    title: 'Your posts go live on time, every time',
    desc: "Schedule once and step away. LinkedInFlow publishes with 98% reliability — while you're in meetings, with clients, or completely offline.",
  },
  {
    icon: BarChart3,
    title: 'Know exactly what drives your growth',
    desc: 'Track impressions, reach, and follower growth with LinkedIn-specific analytics. Stop guessing which posts work. Start doing more of what does.',
  },
  {
    icon: Upload,
    title: 'Move your entire content library in seconds',
    desc: 'Import hundreds of posts from CSV or Excel instantly. Switch from any other tool with zero content lost and zero manual re-entry.',
  },
  {
    icon: FileText,
    title: 'Capture every idea before it disappears',
    desc: "Save drafts, organise by topic, and polish your content before it goes live. Your best ideas are safe here until you're ready to publish.",
  },
  {
    icon: Shield,
    title: 'Your LinkedIn password never touches our servers',
    desc: "We connect via LinkedIn's official OAuth 2.0. We never see your password, never store it, and never put your account at risk.",
  },
];

const steps = [
  {
    step: '01',
    icon: Linkedin,
    title: 'Connect in 60 seconds',
    desc: "Click connect and authorise via LinkedIn's official OAuth. No passwords shared. No technical knowledge needed. You're live in under a minute.",
  },
  {
    step: '02',
    icon: FileText,
    title: 'Write once. Publish all week.',
    desc: 'Draft your posts in our clean editor, pick your dates and times, and walk away. LinkedInFlow handles every publish automatically.',
  },
  {
    step: '03',
    icon: TrendingUp,
    title: 'Watch the numbers move.',
    desc: "See your reach, impressions, and follower growth in real time. Spot what's working and watch your audience compound week over week.",
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Head of Content, GrowthLabs',
    initials: 'SC',
    rating: 5,
    quote:
      "LinkedInFlow cut my content scheduling time by 80%. I plan the whole week in one Sunday session and the tool handles every publish. My engagement has never been higher — and I've reclaimed my mornings.",
  },
  {
    name: 'Marcus Reid',
    role: 'Founder, TechRecruit Agency',
    initials: 'MR',
    rating: 5,
    quote:
      'The analytics finally showed me which posts actually drive follower growth — not just likes. I went from 1,000 to 8,000 followers in four months. I post the same amount. I just post smarter now.',
  },
  {
    name: 'Priya Nair',
    role: 'B2B Marketing Consultant',
    initials: 'PN',
    rating: 5,
    quote:
      "I've tested three other LinkedIn tools. None of them come close. The bulk import alone saved me four hours migrating my content library. Clean, fast, and it hasn't missed a single scheduled post.",
  },
];

// ── Navbar ────────────────────────────────────────────────────────────────────
const NAV_LINKS = ['Features', 'How it works', 'Testimonials'];

function Navbar() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);

  // Close menu on resize to desktop
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  return (
    <>
      <motion.header
        className="sticky top-0 z-50 w-full border-b bg-[#ffffff]/95 backdrop-blur-sm"
        animate={{
          borderBottomColor: scrolled || open ? 'rgba(10,102,194,0.12)' : 'rgba(224,223,220,1)',
          boxShadow: scrolled ? '0 1px 16px rgba(0,0,0,0.07)' : '0 0px 0px rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.28, ease: EASE_STD }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0a66c2]">
              <Linkedin className="h-5 w-5 text-white" />
            </div>
            <span className="text-[15px] font-bold text-[#191919] tracking-tight">LinkedInFlow</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-[13px] font-medium text-[#595959] hover:text-[#0a66c2] transition-colors duration-150"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:inline-flex h-9 items-center px-4 rounded-full text-[13px] font-semibold text-[#0a66c2] border border-[#0a66c2] hover:bg-[#eef3f8] transition-colors duration-150"
            >
              Sign in
            </Link>
            <MotionLink
              to="/signup"
              className="hidden sm:inline-flex h-9 items-center px-4 rounded-full text-[13px] font-semibold bg-[#0a66c2] text-white"
              whileHover={{ backgroundColor: '#004182', boxShadow: '0 4px 16px rgba(10,102,194,0.36)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              Start free today
            </MotionLink>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen((o) => !o)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-[#595959] hover:bg-[#eef3f8] transition-colors duration-150"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE_STD }}
            className="md:hidden sticky top-16 z-40 bg-white border-b border-[#e0dfdc] px-5 pb-5 pt-2"
          >
            <nav className="flex flex-col">
              {NAV_LINKS.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  onClick={() => setOpen(false)}
                  className="py-3 text-[15px] font-medium text-[#333] hover:text-[#0a66c2] border-b border-[#f0f0ee] last:border-0 transition-colors duration-150"
                >
                  {item}
                </a>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2.5">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="h-11 flex items-center justify-center rounded-full text-[14px] font-semibold text-[#0a66c2] border border-[#0a66c2] hover:bg-[#eef3f8] transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="h-11 flex items-center justify-center rounded-full text-[14px] font-semibold bg-[#0a66c2] text-white hover:bg-[#004182] transition-colors"
              >
                Start free today
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f3f2ee] py-14 sm:py-20 lg:py-28" style={dotGridStyle}>
      {/* Ambient blob */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute right-[-60px] top-[-30px] h-[520px] w-[640px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(10,102,194,0.09) 0%, transparent 70%)',
            filter: 'blur(36px)',
          }}
          animate={{ x: [0, 22, -12, 0], y: [0, -18, 10, 0], scale: [1, 1.06, 0.96, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 lg:px-8">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-14">

          {/* Copy */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            variants={stagger(0.08, 0.1)}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeIn}>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#dce6f1] bg-[#eef3f8] px-3.5 py-1.5 mb-5 sm:mb-6 max-w-full">
                <span className="h-2 w-2 rounded-full bg-[#0a66c2] shrink-0" />
                <span className="text-[11px] sm:text-[12px] font-semibold text-[#0a66c2] text-left">
                  2,400+ creators post consistently with LinkedInFlow
                </span>
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-[32px] sm:text-[44px] lg:text-[56px] font-extrabold text-[#191919] leading-[1.12] tracking-tight"
            >
              Post every day.<br />
              <span className="text-[#0a66c2]">Spend 2 hours a week.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-4 sm:mt-5 text-[15px] sm:text-[17px] text-[#595959] leading-relaxed max-w-[520px] mx-auto lg:mx-0"
            >
              LinkedInFlow schedules your posts, tracks your analytics, and manages your
              entire content pipeline — so you show up on LinkedIn every single day
              without living on it.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-center lg:justify-start"
            >
              <MotionLink
                to="/signup"
                className="inline-flex h-12 items-center justify-center gap-2 px-7 rounded-full text-[14px] font-bold bg-[#0a66c2] text-white shadow-[0_4px_20px_rgba(10,102,194,0.28)]"
                whileHover={{ scale: 1.02, boxShadow: '0 6px 28px rgba(10,102,194,0.42)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              >
                Start posting free
                <ArrowRight className="h-4 w-4" />
              </MotionLink>
              <motion.a
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center gap-2 px-7 rounded-full text-[14px] font-semibold border border-[#e0dfdc] bg-white text-[#191919]"
                whileHover={{ backgroundColor: '#eef3f8', borderColor: '#c8d8ed' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                See how it works
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              className="mt-7 sm:mt-8 flex items-center gap-4 sm:gap-5 justify-center lg:justify-start"
            >
              <div className="text-center lg:text-left">
                <p className="text-[18px] sm:text-[20px] font-bold text-[#191919]">2,400+</p>
                <p className="text-[10px] sm:text-[11px] text-[#86888a]">Creators posting daily</p>
              </div>
              <div className="h-8 w-px bg-[#e0dfdc]" />
              <div className="text-center lg:text-left">
                <p className="text-[18px] sm:text-[20px] font-bold text-[#191919]">98%</p>
                <p className="text-[10px] sm:text-[11px] text-[#86888a]">On-time publish rate</p>
              </div>
              <div className="h-8 w-px bg-[#e0dfdc]" />
              <div className="text-center lg:text-left">
                <p className="text-[18px] sm:text-[20px] font-bold text-[#191919]">4.9★</p>
                <p className="text-[10px] sm:text-[11px] text-[#86888a]">Verified user rating</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Product mockup */}
          <motion.div
            className="flex-1 w-full max-w-[520px] mx-auto lg:max-w-none"
            variants={slideFromRight}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            >
              <div className="relative rounded-2xl overflow-hidden border border-[#1e293b] shadow-[0_20px_60px_rgba(0,0,0,0.36)]">
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 px-4 py-3 bg-[#0f172a] border-b border-[#1e293b]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                  <span className="ml-4 text-[11px] text-[#475569] font-medium">LinkedInFlow — Dashboard</span>
                </div>

                {/* Mock dashboard */}
                <div className="bg-[#0f172a] p-3 sm:p-4 flex gap-3">
                  {/* Sidebar — hidden on mobile, visible from sm up */}
                  <div className="hidden sm:block w-[110px] shrink-0 bg-[#1e293b] rounded-xl p-3 space-y-1.5">
                    {['Dashboard', 'Posts', 'Planner', 'Analytics', 'Settings'].map((item, i) => (
                      <div
                        key={item}
                        className={`h-7 rounded-lg flex items-center px-2.5 text-[10px] font-medium ${
                          i === 0 ? 'bg-[#0a66c2] text-white' : 'text-[#64748b]'
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 space-y-2.5 sm:space-y-3 min-w-0">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Posts',     value: '48',  color: '#0a66c2' },
                        { label: 'Reach',     value: '12K', color: '#10b981' },
                        { label: 'Scheduled', value: '7',   color: '#f59e0b' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-[#1e293b] rounded-xl p-2 sm:p-2.5">
                          <p className="text-[8px] sm:text-[9px] text-[#64748b]">{label}</p>
                          <p className="text-[14px] sm:text-[16px] font-bold mt-0.5" style={{ color }}>{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#1e293b] rounded-xl p-2.5 sm:p-3 h-[80px] sm:h-[90px] flex items-end gap-1 sm:gap-1.5 overflow-hidden">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm"
                          style={{
                            height: `${h}%`,
                            background: i === 10 ? '#0a66c2' : 'rgba(10,102,194,0.25)',
                          }}
                        />
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      {[
                        { status: 'published', text: '5 tips for LinkedIn growth...' },
                        { status: 'scheduled', text: 'How I gained 10K followers...' },
                        { status: 'draft',     text: 'The future of B2B content...' },
                      ].map(({ status, text }) => (
                        <div key={text} className="bg-[#1e293b] rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                          <span
                            className="h-1.5 w-1.5 rounded-full shrink-0"
                            style={{
                              background:
                                status === 'published' ? '#10b981' :
                                status === 'scheduled' ? '#0a66c2' : '#f59e0b',
                            }}
                          />
                          <p className="text-[9px] text-[#94a3b8] truncate">{text}</p>
                          <span
                            className="ml-auto shrink-0 text-[8px] font-medium rounded px-1.5 py-0.5"
                            style={{
                              background:
                                status === 'published' ? 'rgba(16,185,129,0.15)' :
                                status === 'scheduled' ? 'rgba(10,102,194,0.15)' : 'rgba(245,158,11,0.15)',
                              color:
                                status === 'published' ? '#10b981' :
                                status === 'scheduled' ? '#60a5fa' : '#f59e0b',
                            }}
                          >
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// ── Trusted-by marquee ───────────────────────────────────────────────────────
const trustedOrgs = [
  { icon: TrendingUp, label: 'Marketing Professionals' },
  { icon: Zap,        label: 'SaaS Founders'           },
  { icon: Users,      label: 'Recruitment Leaders'     },
  { icon: BarChart3,  label: 'B2B Consultants'         },
  { icon: Star,       label: 'Personal Brand Builders' },
  { icon: FileText,   label: 'Content Agencies'        },
];

const row1 = [...trustedOrgs, ...trustedOrgs];

function Chip({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-white border border-[#e5edf7] rounded-full px-4 py-2.5 shadow-[0_2px_8px_rgba(10,102,194,0.07)] shrink-0 select-none">
      <div className="h-[26px] w-[26px] rounded-lg bg-[#eef3f8] flex items-center justify-center shrink-0">
        <Icon className="h-[13px] w-[13px] text-[#0a66c2]" />
      </div>
      <span className="text-[13px] font-medium text-[#2a2a2a] whitespace-nowrap">{label}</span>
    </div>
  );
}

function TrustedBy() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section
      ref={ref}
      className="py-8 sm:py-10 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f4f8fd 100%)',
        borderTop: '1px solid #e8edf5',
        borderBottom: '1px solid #e0e8f3',
      }}
    >
      <motion.p
        variants={fadeIn}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="text-center text-[11px] font-semibold uppercase tracking-[0.13em] text-[#9aa3b0] mb-6 sm:mb-7 px-5"
      >
        Used daily by professionals who can't afford to disappear on LinkedIn
      </motion.p>

      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%)',
        }}
      >
        <div className="lp-marquee-left flex gap-3">
          {row1.map((org, i) => <Chip key={i} icon={org.icon} label={org.label} />)}
        </div>
      </motion.div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────
function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.06 });

  return (
    <section
      id="features"
      className="py-16 sm:py-20 lg:py-24"
      style={{ background: '#eef3f8', ...dotGridStyle }}
    >
      <div className="mx-auto max-w-6xl px-5 lg:px-8" ref={ref}>
        <motion.div
          variants={stagger(0.07, 0.05)}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-10 sm:mb-12"
        >
          <motion.p variants={fadeIn} className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#0a66c2] mb-3">
            Features
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-[28px] sm:text-[34px] lg:text-[38px] font-bold text-[#191919] leading-tight tracking-tight">
            Stay consistent. Grow faster.<br className="hidden sm:block" /> Without the daily grind.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-3 text-[14px] sm:text-[15px] text-[#595959] max-w-xl mx-auto">
            Everything a serious LinkedIn creator needs to build an audience — without spending all day on social media.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger(0.055, 0.1)}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(10,102,194,0.13)', borderColor: '#c8d8ed' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="group bg-white rounded-2xl border border-[#e0dfdc] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] cursor-default"
            >
              <div className="h-10 w-10 rounded-xl bg-[#eef3f8] flex items-center justify-center mb-4 group-hover:bg-[#0a66c2] transition-colors duration-200">
                <Icon className="h-5 w-5 text-[#0a66c2] group-hover:text-white transition-colors duration-200" />
              </div>
              <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#191919] mb-1.5">{title}</h3>
              <p className="text-[13px] text-[#595959] leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const headerRef = useRef<HTMLDivElement>(null);
  const stepsRef  = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
  const stepsInView  = useInView(stepsRef,  { once: true, amount: 0.12 });

  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-[#f3f2ee]">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <motion.div
          ref={headerRef}
          variants={stagger(0.07, 0.05)}
          initial="hidden"
          animate={headerInView ? 'visible' : 'hidden'}
          className="text-center mb-12 sm:mb-14"
        >
          <motion.p variants={fadeIn} className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#0a66c2] mb-3">
            How it works
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-[28px] sm:text-[34px] lg:text-[38px] font-bold text-[#191919] leading-tight tracking-tight">
            From zero to posting consistently —<br className="hidden sm:block" /> in under 5 minutes
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-3 text-[14px] sm:text-[15px] text-[#595959] max-w-lg mx-auto">
            No complex setup. No long onboarding. Three steps and your LinkedIn is running on autopilot.
          </motion.p>
        </motion.div>

        <div className="relative" ref={stepsRef}>
          {/* Connector line — desktop only */}
          <motion.div
            aria-hidden
            className="hidden lg:block absolute top-[52px] left-[calc(16.67%+40px)] right-[calc(16.67%+40px)] h-px bg-gradient-to-r from-transparent via-[#0a66c2]/25 to-transparent"
            style={{ transformOrigin: '0% 50%' }}
            initial={{ scaleX: 0 }}
            animate={stepsInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
          />

          <motion.div
            variants={stagger(0.10, 0.2)}
            initial="hidden"
            animate={stepsInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-8"
          >
            {steps.map(({ step, icon: Icon, title, desc }) => (
              <motion.div
                key={step}
                variants={fadeUp}
                className="flex sm:flex-col items-start sm:items-center gap-5 sm:gap-4 text-left sm:text-center"
              >
                <motion.div
                  className="relative flex h-[64px] w-[64px] sm:h-[80px] sm:w-[80px] items-center justify-center rounded-2xl bg-[#0a66c2] shadow-[0_4px_20px_rgba(10,102,194,0.28)] shrink-0"
                  whileHover={{ scale: 1.05, boxShadow: '0 8px 28px rgba(10,102,194,0.42)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-[#0a66c2] text-[10px] font-bold text-[#0a66c2]">
                    {step}
                  </span>
                </motion.div>
                <div className="flex-1 sm:flex-none">
                  <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#191919] mb-1.5 sm:mb-2">{title}</h3>
                  <p className="text-[13px] text-[#595959] leading-relaxed sm:max-w-[260px] sm:mx-auto">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.06 });

  return (
    <section
      id="testimonials"
      className="py-16 sm:py-20 lg:py-24"
      style={{ background: '#eef3f8', ...dotGridStyle }}
    >
      <div className="mx-auto max-w-6xl px-5 lg:px-8" ref={ref}>
        <motion.div
          variants={stagger(0.07, 0.05)}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-10 sm:mb-12"
        >
          <motion.p variants={fadeIn} className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#0a66c2] mb-3">
            Testimonials
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-[28px] sm:text-[34px] lg:text-[38px] font-bold text-[#191919] leading-tight tracking-tight">
            Real results from real creators
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-3 text-[14px] sm:text-[15px] text-[#595959] max-w-lg mx-auto">
            Not vague praise. Specific outcomes from LinkedIn professionals who use LinkedInFlow every week.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger(0.08, 0.12)}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5"
        >
          {testimonials.map(({ name, role, initials, rating, quote }) => (
            <motion.div
              key={name}
              variants={fadeUp}
              whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(0,0,0,0.10)' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white rounded-2xl border border-[#e0dfdc] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex flex-col gap-4"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                ))}
              </div>
              <p className="text-[13px] sm:text-[14px] text-[#595959] leading-relaxed flex-1">"{quote}"</p>
              <div className="flex items-center gap-3 pt-1 border-t border-[#e0dfdc]">
                <div className="h-9 w-9 rounded-full bg-[#eef3f8] border border-[#dce6f1] flex items-center justify-center text-[12px] font-bold text-[#0a66c2] shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#191919]">{name}</p>
                  <p className="text-[11px] text-[#86888a]">{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────
function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#0a66c2] relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1.2px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 70%)',
        }}
      />

      <motion.div
        ref={ref}
        variants={stagger(0.07, 0.08)}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="relative mx-auto max-w-3xl px-5 lg:px-8 text-center"
      >
        <motion.div variants={fadeIn}>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 mb-5 sm:mb-6">
            <CheckCircle2 className="h-3.5 w-3.5 text-white shrink-0" />
            <span className="text-[11px] sm:text-[12px] font-semibold text-white">Free to start — no credit card, no commitment</span>
          </div>
        </motion.div>

        <motion.h2 variants={fadeUp} className="text-[28px] sm:text-[38px] lg:text-[44px] font-extrabold text-white leading-tight tracking-tight">
          Your next 1,000 LinkedIn followers<br className="hidden sm:block" /> are closer than you think.
        </motion.h2>

        <motion.p variants={fadeUp} className="mt-4 text-[14px] sm:text-[16px] text-white/80 max-w-xl mx-auto leading-relaxed">
          Join 2,400+ creators who stopped struggling to post consistently and started growing —
          by spending less than 2 hours a week on LinkedIn.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3"
        >
          <MotionLink
            to="/signup"
            className="inline-flex h-12 items-center justify-center gap-2 px-8 rounded-full text-[14px] font-bold bg-white text-[#0a66c2] shadow-[0_4px_20px_rgba(0,0,0,0.18)]"
            whileHover={{ scale: 1.02, boxShadow: '0 6px 28px rgba(0,0,0,0.28)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          >
            Claim your free account
            <ArrowRight className="h-4 w-4" />
          </MotionLink>
          <MotionLink
            to="/login"
            className="inline-flex h-12 items-center justify-center px-8 rounded-full text-[14px] font-semibold border border-white/30 text-white"
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.10)', borderColor: 'rgba(255,255,255,0.5)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            Sign in to your account
          </MotionLink>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-7 sm:mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5"
        >
          {[
            { icon: Clock,  text: 'Live in under 5 minutes' },
            { icon: Shield, text: 'Your password stays private' },
            { icon: Users,  text: '2,400+ creators inside' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-white/70 text-[12px] font-medium">
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {text}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#1b1f23] py-10 sm:py-12">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0a66c2]">
                <Linkedin className="h-5 w-5 text-white" />
              </div>
              <span className="text-[15px] font-bold text-white">LinkedInFlow</span>
            </div>
            <p className="text-[12px] text-[#86888a] max-w-[240px] leading-relaxed">
              Schedule posts, track analytics, and grow your audience — without living on social media.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 sm:gap-x-10 gap-y-2.5">
            {[
              { label: 'Sign in',        href: '/login' },
              { label: 'Get started',    href: '/signup' },
              { label: 'User Agreement', href: '#' },
              { label: 'Privacy Policy', href: '#' },
              { label: 'Cookie Policy',  href: '#' },
              { label: 'Help Center',    href: '#' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                to={href}
                className="text-[12px] text-[#86888a] hover:text-white transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#2d3748] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#4b5563] text-center sm:text-left">
            © {year} LinkedInFlow. Not affiliated with LinkedIn Corporation.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#4b5563]">
            <Shield className="h-3 w-3" />
            Secured with OAuth 2.0
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function Landing() {
  return (
    <div className="min-h-screen bg-[#f3f2ee]">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}
