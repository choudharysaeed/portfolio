import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  useMotionValueEvent,
} from 'motion/react';
import {
  Menu,
  X,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  MapPin,
  Target,
  Briefcase,
  ExternalLink,
  Github,
  Mail,
  Linkedin,
  Clock,
  CheckCircle2,
  FolderGit2,
  Send,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// Screenshot Data
const FAIRSHARE_SCREENSHOTS = [
  { id: '01', src: '/01_fairshare_signin.png', title: 'Sign In / Sign Up' },
  { id: '02', src: '/02_fairshare_groups_home.png', title: 'Your Groups (Home)' },
  { id: '03', src: '/03_fairshare_create_group.png', title: 'Create Group & Invite' },
  { id: '04', src: '/04_fairshare_expense_feed.png', title: 'Group Expense Feed' },
  { id: '05', src: '/05_fairshare_add_expense.png', title: 'Add Expense & Split' },
  { id: '06', src: '/06_fairshare_balances_settle.png', title: 'Balances & Settle Up' },
  { id: '07', src: '/07_fairshare_activity.png', title: 'Activity & History' },
  { id: '08', src: '/08_fairshare_settings_dark.png', title: 'Settings (Dark Mode)' },
];

const STUDYPLANNER_SCREENSHOTS = [
  { id: '09', src: '/09_studyplanner_dashboard.png', title: 'Dashboard & Study Timer' },
  { id: '10', src: '/10_studyplanner_signin.png', title: 'Sign In Page' },
  { id: '11', src: '/11_studyplanner_signup.png', title: 'Create Account Page' },
];

const ALL_SCREENSHOTS = [...FAIRSHARE_SCREENSHOTS, ...STUDYPLANNER_SCREENSHOTS];

export default function App() {
  // Navigation & Scroll State
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'about' | 'skills' | 'projects' | 'milestones' | 'contact'>('about');

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Active Project Mockup Screen Index
  const [activeFairshareIdx, setActiveFairshareIdx] = useState(0);
  const [activeStudyplannerIdx, setActiveStudyplannerIdx] = useState(0);

  // Chat Bubble Rotation
  const [chatMessageIndex, setChatMessageIndex] = useState(0);
  const chatMessages = ["Hi, I'm Saeed!", "Let's build something together."];

  // Scroll-linked Hero -> Floating Corner Avatar Refs & State
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const heroSlotRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isMeasured, setIsMeasured] = useState(false);
  const [isLanded, setIsLanded] = useState(false);
  const [slotMetrics, setSlotMetrics] = useState({
    docTop: 140,
    docLeft: 800,
    width: 360,
    height: 480,
    vw: typeof window !== 'undefined' ? window.innerWidth : 1440,
    vh: typeof window !== 'undefined' ? window.innerHeight : 900,
  });

  // Measure Hero 3:4 slot position in document coordinates synchronously before paint
  useLayoutEffect(() => {
    const updateMetrics = () => {
      const el = heroSlotRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      setSlotMetrics({
        docTop: rect.top + window.scrollY,
        docLeft: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        vw: window.innerWidth,
        vh: window.innerHeight,
      });
      setIsMeasured(true);
    };

    updateMetrics();

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(updateMetrics).catch(() => {});
    }

    const resizeObserver = new ResizeObserver(() => {
      updateMetrics();
    });
    if (heroSlotRef.current) {
      resizeObserver.observe(heroSlotRef.current);
    }
    window.addEventListener('resize', updateMetrics, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateMetrics);
    };
  }, []);

  // Scroll progress: 0 at top of page -> 1 when Hero section has scrolled out of view
  const { scrollYProgress } = useScroll({
    target: heroSectionRef,
    offset: ['start start', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    mass: 0.4,
    restDelta: 0.0005,
  });

  const activeProgress = prefersReducedMotion ? scrollYProgress : smoothProgress;

  useMotionValueEvent(activeProgress, 'change', (latest) => {
    const landed = latest >= 0.96;
    setIsLanded((prev) => (prev !== landed ? landed : prev));
  });

  // Geometry for Hero 3:4 rectangle -> Bottom-Right circular chat avatar
  const isMobileViewport = slotMetrics.vw < 768;
  const targetAvatarSize = isMobileViewport ? 56 : 72;
  const cornerOffset = isMobileViewport ? 16 : 24;

  const startW = slotMetrics.width;
  const startH = slotMetrics.height;
  const startX = slotMetrics.docLeft;
  const startY = slotMetrics.docTop;

  const endScale = startW > 0 ? targetAvatarSize / startW : 0.2;
  const endX = slotMetrics.vw - cornerOffset - targetAvatarSize / 2 - startW / 2;
  const endY = slotMetrics.vh - cornerOffset - targetAvatarSize / 2 - startW / 2;

  const avatarX = useTransform(
    activeProgress,
    prefersReducedMotion ? [0, 0.49, 0.51, 1] : [0, 1],
    prefersReducedMotion ? [startX, startX, endX, endX] : [startX, endX]
  );
  const avatarY = useTransform(
    activeProgress,
    prefersReducedMotion ? [0, 0.49, 0.51, 1] : [0, 1],
    prefersReducedMotion ? [startY, startY, endY, endY] : [startY, endY]
  );
  const avatarHeight = useTransform(
    activeProgress,
    prefersReducedMotion ? [0, 0.49, 0.51, 1] : [0, 1],
    prefersReducedMotion ? [startH, startH, startW, startW] : [startH, startW]
  );
  const avatarScale = useTransform(
    activeProgress,
    prefersReducedMotion ? [0, 0.49, 0.51, 1] : [0, 1],
    prefersReducedMotion ? [1, 1, endScale, endScale] : [1, endScale]
  );
  const avatarRotateY = useTransform(
    activeProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 360]
  );
  // 16px at progress=0 -> startW/2 (exact 50% circle on square container) at progress=1
  const avatarRadius = useTransform(
    activeProgress,
    prefersReducedMotion ? [0, 0.49, 0.51, 1] : [0, 1],
    prefersReducedMotion ? [16, 16, startW / 2, startW / 2] : [16, startW / 2]
  );
  const avatarOpacity = useTransform(
    activeProgress,
    prefersReducedMotion ? [0, 0.4, 0.6, 1] : [0, 1],
    !isMeasured
      ? prefersReducedMotion
        ? [0, 0, 0, 0]
        : [0, 0]
      : prefersReducedMotion
        ? [1, 0, 0, 1]
        : [1, 1]
  );
  const avatarBorderWidth = useTransform(
    activeProgress,
    prefersReducedMotion ? [0, 0.49, 0.51, 1] : [0, 1],
    prefersReducedMotion
      ? [1, 1, 2.5 / endScale, 2.5 / endScale]
      : [1, 2.5 / endScale]
  );
  const avatarBorderColor = useTransform(
    activeProgress,
    [0, 0.7, 1],
    ['rgba(11, 11, 11, 0.1)', 'rgba(203, 170, 94, 0.7)', '#CBAA5E']
  );

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Section Reveal via IntersectionObserver (run once per section)
  const [revealedSections, setRevealedSections] = useState<Record<string, boolean>>({});

  // Floating Chat Interval
  useEffect(() => {
    const timer = setInterval(() => {
      setChatMessageIndex((prev) => (prev + 1) % chatMessages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Sticky Navbar & Active Section Tracking
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sectionIds = ['contact', 'milestones', 'projects', 'skills', 'about'] as const;
      const scrollPosition = window.scrollY + 250;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for scroll-reveal (runs once per section)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id') || entry.target.getAttribute('data-section');
            if (id) {
              setRevealedSections((prev) => ({ ...prev, [id]: true }));
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('[data-section]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Lightbox Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev !== null ? (prev + 1) % ALL_SCREENSHOTS.length : null));
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev !== null ? (prev - 1 + ALL_SCREENSHOTS.length) % ALL_SCREENSHOTS.length : null));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  // Smooth scroll helper
  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Contact Form Submission (Web3Forms API)
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; email?: string; message?: string } = {};

    if (!contactForm.name.trim()) {
      errors.name = 'Please enter your name.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contactForm.email.trim()) {
      errors.email = 'Please enter your email.';
    } else if (!emailRegex.test(contactForm.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!contactForm.message.trim()) {
      errors.message = 'Please enter a message.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: '0b2a2efd-f2b5-426d-9252-ec58d3c4f0e2',
          subject: 'New message from portfolio website',
          from_name: contactForm.name.trim(),
          email: contactForm.email.trim(),
          message: contactForm.message.trim(),
        }),
      });

      const data = await response.json();
      if (data && data.success) {
        setSubmitStatus('success');
        setContactForm({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navLinks: { label: string; id: 'about' | 'skills' | 'projects' | 'milestones' | 'contact' }[] = [
    { label: 'About', id: 'about' },
    { label: 'Skills', id: 'skills' },
    { label: 'Projects', id: 'projects' },
    { label: 'Milestones', id: 'milestones' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <div className="min-h-screen bg-[#F6F1E8] text-[#0B0B0B] font-['Inter',sans-serif] selection:bg-[#CBAA5E]/20 selection:text-[#0B0B0B] overflow-x-hidden">
      {/* =========================================================================
          1. NAVBAR
      ========================================================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F6F1E8]/90 backdrop-blur-md border-b border-[#0B0B0B]/10 py-3.5 shadow-xs'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8 flex items-center justify-between gap-6">
          {/* Logo: logo_mark_SA.png, links to top */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 active:scale-95 transition-transform"
            aria-label="Saeed Ahmad Home"
          >
            <img
              src="/logo_mark_SA.png"
              alt="Saeed Ahmad SA Mark"
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain block bg-transparent"
            />
            <span className="text-base sm:text-lg font-bold tracking-tight text-[#0B0B0B]">
              Saeed <span className="text-[#CBAA5E]">Ahmad</span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#0B0B0B]/75">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className={`transition-colors cursor-pointer py-1 relative ${
                    isActive ? 'text-[#CBAA5E] font-semibold' : 'text-[#0B0B0B]/80 hover:text-[#CBAA5E]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#CBAA5E] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Button: "Let's connect" -> LinkedIn (new tab) */}
          <div className="hidden md:flex items-center">
            <a
              href="https://www.linkedin.com/in/saeed-ahmed-1752bb406"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide text-white bg-[#0B0B0B] hover:bg-[#1f1f1f] hover:border-[#CBAA5E] border border-transparent rounded-xl transition-all duration-200 active:scale-98"
            >
              <span>Let's connect</span>
              <ArrowUpRight className="w-4 h-4 text-[#CBAA5E]" />
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-[#0B0B0B] hover:text-[#CBAA5E] focus:outline-none"
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Full-Screen Overlay Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0B0B0B] text-white flex flex-col justify-between p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <img
              src="/logo_mark_SA.png"
              alt="Saeed Ahmad Logo"
              className="w-10 h-10 object-contain bg-transparent"
            />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-white/80 hover:text-[#CBAA5E] focus:outline-none"
              aria-label="Close mobile menu"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          <nav className="flex flex-col gap-6 text-2xl font-bold">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`text-left transition-colors cursor-pointer ${
                  activeSection === link.id ? 'text-[#CBAA5E]' : 'text-white/80 hover:text-[#CBAA5E]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div>
            <a
              href="https://www.linkedin.com/in/saeed-ahmed-1752bb406"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-white bg-neutral-900 border border-[#CBAA5E] rounded-xl hover:bg-[#CBAA5E] hover:text-[#0B0B0B] transition-colors"
            >
              <span>Let's connect</span>
              <ArrowUpRight className="w-4 h-4 text-[#CBAA5E]" />
            </a>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. HERO
      ========================================================================== */}
      <section
        ref={heroSectionRef}
        id="hero"
        className="relative min-h-[90vh] flex items-center justify-center pt-24 sm:pt-28 pb-12 sm:pb-16 overflow-hidden"
      >
        {/* Faded watermark "SAEED" behind content (decorative, aria-hidden) */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0 overflow-hidden w-full flex justify-center items-center opacity-[0.045]"
        >
          <span className="text-[25vw] font-black tracking-tighter text-[#0B0B0B] uppercase leading-none whitespace-nowrap">
            SAEED
          </span>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Left: Headline & Buttons */}
            <div className="lg:col-span-7 flex flex-col items-start">
              {/* Small label: "Flutter & Dart Developer" */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE7DC] border border-[#0B0B0B]/5 text-xs font-semibold tracking-wider uppercase text-[#0B0B0B]/70 mb-4 sm:mb-6">
                <span className="w-2 h-2 rounded-full bg-[#CBAA5E]" />
                Flutter &amp; Dart Developer
              </div>

              {/* Headline: "Flutter Developer" with "Mobile Apps" in gold italic */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0B0B0B] leading-[1.14] mb-4 sm:mb-6">
                Flutter Developer
                <span className="block mt-1 sm:mt-2 font-normal">
                  Crafting{' '}
                  <span className="font-serif italic font-semibold text-[#CBAA5E]">
                    Mobile Apps
                  </span>
                </span>
              </h1>

              {/* Intro */}
              <p className="text-sm sm:text-lg text-[#0B0B0B]/80 leading-relaxed max-w-xl mb-6 sm:mb-9 font-normal">
                I build clean, user-friendly mobile applications with Flutter and Dart, and web apps with React.
              </p>

              {/* Buttons: "View Projects" (scrolls to #projects) and "Contact Me" (scrolls to #contact) */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  onClick={() => scrollTo('projects')}
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-[#0B0B0B] hover:bg-[#1f1f1f] hover:border-[#CBAA5E] border border-transparent text-white text-sm font-semibold rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-98 cursor-pointer"
                >
                  <span>View Projects</span>
                </button>

                <button
                  onClick={() => scrollTo('contact')}
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-transparent hover:bg-[#EDE7DC] text-[#0B0B0B] text-sm font-semibold rounded-2xl border border-[#0B0B0B]/20 hover:border-[#CBAA5E] transition-all duration-200 active:scale-98 cursor-pointer"
                >
                  <span>Contact Me</span>
                </button>
              </div>
            </div>

            {/* Right: Hero 3:4 Slot (reserves Hero layout space; the single fixed photo starts here) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div
                ref={heroSlotRef}
                aria-hidden="true"
                className="w-[210px] sm:w-[280px] lg:w-[360px] aspect-[3/4] rounded-2xl pointer-events-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. ABOUT ("Hi, I'm Saeed.")
      ========================================================================== */}
      <section
        id="about"
        data-section="about"
        className={`py-20 sm:py-28 transition-all duration-700 ${
          revealedSections['about'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#0B0B0B]/50 block mb-2">
              01 · About
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B0B0B] tracking-tight">
              Hi, I'm{' '}
              <span className="font-serif italic font-normal text-[#CBAA5E]">
                Saeed.
              </span>
            </h2>
          </div>

          {/* Paragraph exactly as required */}
          <div className="max-w-3xl mb-14">
            <p className="text-lg sm:text-xl text-[#0B0B0B]/85 font-normal leading-relaxed">
              I'm a Flutter Developer focused on building clean, user-friendly mobile applications using Flutter and Dart.
              I have hands-on experience with Firebase, Firestore, Provider, and Git/GitHub.
              I'm always looking to learn, improve my skills, and build better mobile applications.
            </p>
          </div>

          {/* Grid: Dark card "Made of experience." + Quick facts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Dark Card: "Made of experience." */}
            <div className="lg:col-span-7 bg-[#0B0B0B] text-white rounded-2xl p-8 sm:p-10 shadow-xl border border-white/5 flex flex-col justify-between hover:-translate-y-1.5 transition-transform duration-300">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-white mb-8 pb-4 border-b border-white/10">
                  Made of <span className="font-serif italic text-[#CBAA5E] font-normal">experience.</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/5">
                    <Clock className="w-5 h-5 text-[#CBAA5E] mb-2" />
                    <div className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
                      5 months
                    </div>
                    <div className="text-xs text-white/60 mt-1.5">
                      Mobile app development internship
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/5">
                    <CheckCircle2 className="w-5 h-5 text-[#CBAA5E] mb-2" />
                    <div className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
                      2
                    </div>
                    <div className="text-xs text-white/60 mt-1.5">
                      Completed projects
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/5">
                    <FolderGit2 className="w-5 h-5 text-[#CBAA5E] mb-2" />
                    <div className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
                      1
                    </div>
                    <div className="text-xs text-white/60 mt-1.5">
                      Project in progress
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 text-xs text-white/50">
                Flutter · Dart · Firebase · Provider
              </div>
            </div>

            {/* Quick facts list */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-8 sm:p-10 border border-[#0B0B0B]/10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1.5 transition-transform duration-300 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#0B0B0B] mb-6">
                  Quick facts
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE7DC] flex items-center justify-center text-[#CBAA5E] shrink-0">
                      <MapPin className="w-5 h-5 text-[#0B0B0B]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-[#0B0B0B]/50">
                        Location
                      </div>
                      <div className="text-base font-semibold text-[#0B0B0B]">
                        Rawalpindi, Pakistan
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE7DC] flex items-center justify-center text-[#CBAA5E] shrink-0">
                      <Target className="w-5 h-5 text-[#0B0B0B]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-[#0B0B0B]/50">
                        Focus
                      </div>
                      <div className="text-base font-semibold text-[#0B0B0B]">
                        Flutter, Dart, Firebase
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE7DC] flex items-center justify-center text-[#CBAA5E] shrink-0">
                      <Briefcase className="w-5 h-5 text-[#0B0B0B]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-[#0B0B0B]/50">
                        Open to
                      </div>
                      <div className="text-base font-semibold text-[#0B0B0B]">
                        Mobile app development roles and internships
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#0B0B0B]/10">
                <button
                  onClick={() => scrollTo('contact')}
                  className="text-xs font-bold text-[#0B0B0B] hover:text-[#CBAA5E] transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Contact for opportunities →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. SKILLS ("The stack, in your pocket.")
      ========================================================================== */}
      <section
        id="skills"
        data-section="skills"
        className={`py-20 sm:py-28 transition-all duration-700 ${
          revealedSections['skills'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="mb-14">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#0B0B0B]/50 block mb-2">
              02 · Skills
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B0B0B] tracking-tight">
              The stack,{' '}
              <span className="font-serif italic font-normal text-[#CBAA5E]">
                in your pocket.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Rounded chips by category */}
            <div className="lg:col-span-7 space-y-8">
              {/* Mobile */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#0B0B0B]/10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1.5 transition-transform duration-300">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0B0B0B]/50 mb-4">
                  Mobile
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {['Flutter', 'Dart', 'Firebase', 'Firestore', 'Provider'].map((skill) => (
                    <span
                      key={skill}
                      className="px-4 py-2 rounded-full text-xs font-semibold bg-[#EDE7DC] text-[#0B0B0B] border border-[#0B0B0B]/5 hover:border-[#CBAA5E] transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Web */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#0B0B0B]/10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1.5 transition-transform duration-300">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0B0B0B]/50 mb-4">
                  Web
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {['React', 'Tailwind CSS', 'Supabase', 'Vite'].map((skill) => (
                    <span
                      key={skill}
                      className="px-4 py-2 rounded-full text-xs font-semibold bg-[#EDE7DC] text-[#0B0B0B] border border-[#0B0B0B]/5 hover:border-[#CBAA5E] transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tools */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#0B0B0B]/10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1.5 transition-transform duration-300">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0B0B0B]/50 mb-4">
                  Tools
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {['Git', 'GitHub', 'Google AI Studio'].map((skill) => (
                    <span
                      key={skill}
                      className="px-4 py-2 rounded-full text-xs font-semibold bg-[#EDE7DC] text-[#0B0B0B] border border-[#0B0B0B]/5 hover:border-[#CBAA5E] transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Phone mockup with 01_fairshare_signin.png */}
            <div className="lg:col-span-5 flex justify-center">
              <div
                onClick={() => setLightboxIndex(0)}
                className="w-full max-w-[280px] phone-tilt cursor-pointer"
                title="Click to view full screenshot"
              >
                {/* Smartphone bezel frame */}
                <div className="relative rounded-[40px] bg-[#0B0B0B] p-3 shadow-2xl border-4 border-neutral-800">
                  {/* Dynamic Island / Notch */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20" />
                  
                  {/* Screen container */}
                  <div className="rounded-[32px] overflow-hidden bg-neutral-900 aspect-[390/844] flex items-center justify-center">
                    <img
                      src="/01_fairshare_signin.png"
                      alt="FairShare Sign In — Flutter & Firebase"
                      loading="lazy"
                      className="w-full h-full object-contain block"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. PROJECTS ("Selected projects")
      ========================================================================== */}
      <section
        id="projects"
        data-section="projects"
        className={`py-20 sm:py-28 transition-all duration-700 ${
          revealedSections['projects'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="mb-14">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#0B0B0B]/50 block mb-2">
              03 · Projects
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B0B0B] tracking-tight">
              <span className="font-serif italic font-normal text-[#CBAA5E]">
                Selected
              </span>{' '}
              projects
            </h2>
          </div>

          <div className="space-y-12">
            {/* a) FairShare: Flutter + Firebase */}
            <div className="bg-white rounded-2xl p-7 sm:p-10 border border-[#0B0B0B]/10 shadow-[0_4px_25px_rgb(0,0,0,0.04)] hover:-translate-y-1.5 transition-transform duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column: Info, Tags, Button */}
                <div className="lg:col-span-6 flex flex-col justify-between h-full order-2 lg:order-1">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B0B0B] tracking-tight mb-3">
                      FairShare:{' '}
                      <span className="font-serif italic font-normal text-[#CBAA5E]">
                        Flutter + Firebase
                      </span>
                    </h3>

                    <p className="text-base text-[#0B0B0B]/80 leading-relaxed mb-6">
                      A group expense-splitting app. Users sign in, create groups, add expenses with equal, exact or share-based splits, see balances, and settle up with the fewest payments. Includes dark mode.
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {['Flutter', 'Dart', 'Firebase', 'Firestore', 'Provider'].map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EDE7DC] text-[#0B0B0B]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Thumbnails list: 01 to 08 */}
                    <div className="mb-8">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#0B0B0B]/50 mb-3">
                        Screenshots ({FAIRSHARE_SCREENSHOTS.length}) — Click to preview in Lightbox
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {FAIRSHARE_SCREENSHOTS.map((screen, idx) => (
                          <button
                            key={screen.id}
                            onClick={() => {
                              setActiveFairshareIdx(idx);
                              setLightboxIndex(idx);
                            }}
                            className={`aspect-[390/844] rounded-lg overflow-hidden border-2 transition-all p-0.5 bg-neutral-900 cursor-pointer ${
                              activeFairshareIdx === idx ? 'border-[#CBAA5E] scale-105' : 'border-transparent hover:border-neutral-400'
                            }`}
                            title={screen.title}
                          >
                            <img
                              src={screen.src}
                              alt={screen.title}
                              loading="lazy"
                              className="w-full h-full object-contain block"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Button: GitHub */}
                  <div>
                    <a
                      href="https://github.com/choudharysaeed/fair_share_app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 bg-[#0B0B0B] hover:bg-[#1f1f1f] hover:border-[#CBAA5E] border border-transparent text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
                    >
                      <Github className="w-4 h-4 text-[#CBAA5E]" />
                      <span>GitHub</span>
                    </a>
                  </div>
                </div>

                {/* Right Column: Phone Mockup Frame */}
                <div className="lg:col-span-6 flex justify-center order-1 lg:order-2">
                  <div
                    onClick={() => setLightboxIndex(activeFairshareIdx)}
                    className="w-full max-w-[270px] phone-tilt cursor-pointer"
                    title="Click to expand screenshot in Lightbox"
                  >
                    <div className="relative rounded-[40px] bg-[#0B0B0B] p-3 shadow-2xl border-4 border-neutral-800">
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20" />
                      <div className="rounded-[32px] overflow-hidden bg-neutral-900 aspect-[390/844] flex items-center justify-center">
                        <img
                          src={FAIRSHARE_SCREENSHOTS[activeFairshareIdx].src}
                          alt={FAIRSHARE_SCREENSHOTS[activeFairshareIdx].title}
                          loading="lazy"
                          className="w-full h-full object-contain block"
                        />
                      </div>
                    </div>
                    <div className="text-center mt-3 text-xs text-[#0B0B0B]/60 font-medium">
                      {FAIRSHARE_SCREENSHOTS[activeFairshareIdx].title} (Click to zoom)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* b) Study Planner: React + Supabase (web) */}
            <div className="bg-white rounded-2xl p-7 sm:p-10 border border-[#0B0B0B]/10 shadow-[0_4px_25px_rgb(0,0,0,0.04)] hover:-translate-y-1.5 transition-transform duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column: Info, Tags, Buttons */}
                <div className="lg:col-span-6 flex flex-col justify-between h-full order-2 lg:order-1">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B0B0B] tracking-tight mb-3">
                      Study Planner:{' '}
                      <span className="font-serif italic font-normal text-[#CBAA5E]">
                        React + Supabase (web)
                      </span>
                    </h3>

                    <p className="text-base text-[#0B0B0B]/80 leading-relaxed mb-6">
                      A study planner for students. Users sign up with email or Google, manage subjects and tasks, use a Pomodoro-style study timer, and track progress on a dashboard.
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {['React', 'Vite', 'Tailwind CSS', 'Supabase'].map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EDE7DC] text-[#0B0B0B]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Thumbnails: 09, 10, 11 */}
                    <div className="mb-8">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#0B0B0B]/50 mb-3">
                        Screenshots ({STUDYPLANNER_SCREENSHOTS.length}) — Click to preview in Lightbox
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {STUDYPLANNER_SCREENSHOTS.map((screen, idx) => {
                          const globalIdx = FAIRSHARE_SCREENSHOTS.length + idx;
                          return (
                            <button
                              key={screen.id}
                              onClick={() => {
                                setActiveStudyplannerIdx(idx);
                                setLightboxIndex(globalIdx);
                              }}
                              className={`aspect-[16/10] rounded-lg overflow-hidden border-2 transition-all p-1 bg-neutral-900 cursor-pointer ${
                                activeStudyplannerIdx === idx ? 'border-[#CBAA5E] scale-105' : 'border-transparent hover:border-neutral-400'
                              }`}
                              title={screen.title}
                            >
                              <img
                                src={screen.src}
                                alt={screen.title}
                                loading="lazy"
                                className="w-full h-full object-contain block"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Buttons: Live Demo and GitHub */}
                  <div className="flex flex-wrap items-center gap-4">
                    <a
                      href="https://study-planner-five-sepia.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 bg-[#0B0B0B] hover:bg-[#1f1f1f] hover:border-[#CBAA5E] border border-transparent text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-4 h-4 text-[#CBAA5E]" />
                    </a>

                    <a
                      href="https://github.com/choudharysaeed/study_planner"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 bg-[#EDE7DC] hover:bg-[#e4dccf] text-[#0B0B0B] text-xs sm:text-sm font-semibold rounded-xl border border-[#0B0B0B]/10 hover:border-[#CBAA5E] transition-colors"
                    >
                      <Github className="w-4 h-4 text-[#CBAA5E]" />
                      <span>GitHub</span>
                    </a>
                  </div>
                </div>

                {/* Right Column: Browser Mockup Frame */}
                <div className="lg:col-span-6 flex justify-center order-1 lg:order-2">
                  <div
                    onClick={() => setLightboxIndex(FAIRSHARE_SCREENSHOTS.length + activeStudyplannerIdx)}
                    className="w-full max-w-lg cursor-pointer hover:-translate-y-1.5 transition-transform duration-300"
                    title="Click to expand screenshot in Lightbox"
                  >
                    <div className="rounded-2xl overflow-hidden bg-white shadow-xl border border-[#0B0B0B]/10 p-3">
                      {/* Browser top chrome */}
                      <div className="flex items-center gap-2 pb-2.5 px-1 border-b border-[#0B0B0B]/10">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                        </div>
                        <div className="flex-1 text-center">
                          <span className="text-[11px] font-mono text-[#0B0B0B]/50 px-3 py-0.5 rounded-md bg-[#EDE7DC]">
                            study-planner-five-sepia.vercel.app
                          </span>
                        </div>
                      </div>

                      {/* Screen content */}
                      <div className="aspect-[16/10] bg-neutral-900 rounded-lg overflow-hidden mt-2 flex items-center justify-center">
                        <img
                          src={STUDYPLANNER_SCREENSHOTS[activeStudyplannerIdx].src}
                          alt={STUDYPLANNER_SCREENSHOTS[activeStudyplannerIdx].title}
                          loading="lazy"
                          className="w-full h-full object-contain block"
                        />
                      </div>
                    </div>
                    <div className="text-center mt-3 text-xs text-[#0B0B0B]/60 font-medium">
                      {STUDYPLANNER_SCREENSHOTS[activeStudyplannerIdx].title} (Click to zoom)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* c) Lucky Archi Studio: Only title and badge */}
            <div className="bg-[#0B0B0B] text-white rounded-2xl p-8 sm:p-10 border border-white/5 shadow-xl hover:-translate-y-1.5 transition-transform duration-300 flex items-center justify-between">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Lucky Archi Studio
              </h3>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#CBAA5E]/20 text-[#CBAA5E] border border-[#CBAA5E]/30">
                <span className="w-2 h-2 rounded-full bg-[#CBAA5E] animate-pulse" />
                In progress
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. MILESTONES ("Small steps, Meaningful milestones.")
      ========================================================================== */}
      <section
        id="milestones"
        data-section="milestones"
        className={`py-20 sm:py-28 transition-all duration-700 ${
          revealedSections['milestones'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="mb-14">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#0B0B0B]/50 block mb-2">
              04 · Milestones
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B0B0B] tracking-tight">
              Small steps,{' '}
              <span className="font-serif italic font-normal text-[#CBAA5E]">
                Meaningful milestones.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Internship */}
            <div className="bg-white rounded-2xl p-8 border border-[#0B0B0B]/10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1.5 transition-transform duration-300 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#CBAA5E] block mb-2">
                  01
                </span>
                <h3 className="text-2xl font-extrabold text-[#0B0B0B] tracking-tight mb-3">
                  Internship
                </h3>
                <p className="text-sm text-[#0B0B0B]/80 leading-relaxed font-normal">
                  5 months of mobile app development experience.
                </p>
              </div>
            </div>

            {/* Card 2: 2 Projects */}
            <div className="bg-white rounded-2xl p-8 border border-[#0B0B0B]/10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1.5 transition-transform duration-300 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#CBAA5E] block mb-2">
                  02
                </span>
                <h3 className="text-2xl font-extrabold text-[#0B0B0B] tracking-tight mb-3">
                  2 Projects
                </h3>
                <p className="text-sm text-[#0B0B0B]/80 leading-relaxed font-normal">
                  Completed and published on GitHub.
                </p>
              </div>
            </div>

            {/* Card 3: Learning */}
            <div className="bg-white rounded-2xl p-8 border border-[#0B0B0B]/10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1.5 transition-transform duration-300 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#CBAA5E] block mb-2">
                  03
                </span>
                <h3 className="text-2xl font-extrabold text-[#0B0B0B] tracking-tight mb-3">
                  Learning
                </h3>
                <p className="text-sm text-[#0B0B0B]/80 leading-relaxed font-normal">
                  Flutter, Dart, Firebase and React, with new projects in progress.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. CONTACT ("Let's build something together.")
      ========================================================================== */}
      <section
        id="contact"
        data-section="contact"
        className={`py-20 sm:py-28 transition-all duration-700 ${
          revealedSections['contact'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="mb-14">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#0B0B0B]/50 block mb-2">
              05 · Contact
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B0B0B] tracking-tight">
              Let's build{' '}
              <span className="font-serif italic font-normal text-[#CBAA5E]">
                something together.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Contact details & links */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl p-7 border border-[#0B0B0B]/10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-4">
                {/* Email */}
                <a
                  href="mailto:saeedrajpoot5050@gmail.com"
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#EDE7DC]/70 hover:bg-[#EDE7DC] hover:border-[#CBAA5E] border border-transparent transition-colors group"
                >
                  <Mail className="w-5 h-5 text-[#CBAA5E] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B0B0B]/50 block">Email</span>
                    <span className="text-sm font-semibold text-[#0B0B0B] group-hover:text-[#CBAA5E] truncate block transition-colors">
                      saeedrajpoot5050@gmail.com
                    </span>
                  </div>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/saeed-ahmed-1752bb406"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-[#EDE7DC]/70 hover:bg-[#EDE7DC] hover:border-[#CBAA5E] border border-transparent transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-5 h-5 text-[#CBAA5E] shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B0B0B]/50 block">LinkedIn</span>
                      <span className="text-sm font-semibold text-[#0B0B0B] group-hover:text-[#CBAA5E] transition-colors">
                        Saeed Ahmed
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#0B0B0B]/40 group-hover:text-[#CBAA5E]" />
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/choudharysaeed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-[#EDE7DC]/70 hover:bg-[#EDE7DC] hover:border-[#CBAA5E] border border-transparent transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Github className="w-5 h-5 text-[#CBAA5E] shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B0B0B]/50 block">GitHub</span>
                      <span className="text-sm font-semibold text-[#0B0B0B] group-hover:text-[#CBAA5E] transition-colors">
                        choudharysaeed
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#0B0B0B]/40 group-hover:text-[#CBAA5E]" />
                </a>

                {/* Location */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#EDE7DC]/70 border border-transparent">
                  <MapPin className="w-5 h-5 text-[#CBAA5E] shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B0B0B]/50 block">Location</span>
                    <span className="text-sm font-semibold text-[#0B0B0B]">Rawalpindi, Pakistan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-7 sm:p-9 border border-[#0B0B0B]/10 shadow-[0_4px_25px_rgb(0,0,0,0.04)]">
              {/* Success Message */}
              {submitStatus === 'success' && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-start gap-3 text-emerald-900 animate-in fade-in"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-950">
                      Thank you! Your message has been sent.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="mb-6 p-4 rounded-xl bg-red-50 border border-red-300 flex items-start gap-3 text-red-900 animate-in fade-in"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-950">
                      Something went wrong. Please try again or email me directly at{' '}
                      <a
                        href="mailto:saeedrajpoot5050@gmail.com"
                        className="underline font-bold text-red-950 hover:text-black"
                      >
                        saeedrajpoot5050@gmail.com
                      </a>.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleContactSubmit} noValidate className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-[#0B0B0B]/70 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={contactForm.name}
                    onChange={(e) => {
                      setContactForm({ ...contactForm, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                    }}
                    className={`w-full px-4 py-3 rounded-xl bg-[#F6F1E8]/70 border text-sm text-[#0B0B0B] placeholder:text-[#0B0B0B]/35 focus:outline-none focus:ring-2 focus:ring-[#CBAA5E] focus:bg-white transition-all ${
                      formErrors.name ? 'border-red-400 bg-red-50/20' : 'border-[#0B0B0B]/10'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#0B0B0B]/70 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={contactForm.email}
                    onChange={(e) => {
                      setContactForm({ ...contactForm, email: e.target.value });
                      if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                    }}
                    className={`w-full px-4 py-3 rounded-xl bg-[#F6F1E8]/70 border text-sm text-[#0B0B0B] placeholder:text-[#0B0B0B]/35 focus:outline-none focus:ring-2 focus:ring-[#CBAA5E] focus:bg-white transition-all ${
                      formErrors.email ? 'border-red-400 bg-red-50/20' : 'border-[#0B0B0B]/10'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-[#0B0B0B]/70 mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Tell me about your project, idea, or role..."
                    value={contactForm.message}
                    onChange={(e) => {
                      setContactForm({ ...contactForm, message: e.target.value });
                      if (formErrors.message) setFormErrors({ ...formErrors, message: undefined });
                    }}
                    className={`w-full px-4 py-3 rounded-xl bg-[#F6F1E8]/70 border text-sm text-[#0B0B0B] placeholder:text-[#0B0B0B]/35 focus:outline-none focus:ring-2 focus:ring-[#CBAA5E] focus:bg-white transition-all resize-none ${
                      formErrors.message ? 'border-red-400 bg-red-50/20' : 'border-[#0B0B0B]/10'
                    }`}
                  />
                  {formErrors.message && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0B0B0B] hover:bg-[#1f1f1f] hover:border-[#CBAA5E] border border-transparent text-white text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 text-[#CBAA5E] animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#CBAA5E]" />
                      <span>Send message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FOOTER
      ========================================================================== */}
      <footer className="bg-[#0B0B0B] text-white pt-16 pb-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-white/10">
            {/* Logo: logo_full_transparent.png (transparent background, no border, no shadow) */}
            <div className="flex items-center">
              <img
                src="/logo_full_transparent.png"
                alt="Saeed Ahmad Full Logo"
                className="h-12 w-auto object-contain block bg-transparent"
              />
            </div>

            {/* Back to top button */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-[#CBAA5E] hover:text-[#0B0B0B] text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#CBAA5E] hover:text-[#0B0B0B]" />
            </button>
          </div>

          <div className="pt-8 text-center text-xs text-white/50">
            © 2026 Saeed Ahmad. Built with Flutter, React and Google AI Studio.
          </div>
        </div>
      </footer>

      {/* =========================================================================
          SINGLE MORPHING AVATAR (Hero 3:4 Photo <-> Bottom-Right Floating Chat Avatar)
          & SPEECH BUBBLE
      ========================================================================== */}
      {/* Speech Bubble — appears next to the landed floating avatar past the Hero section */}
      <motion.button
        type="button"
        onClick={() => scrollTo('contact')}
        initial={false}
        animate={{
          opacity: isLanded ? 1 : 0,
          scale: isLanded ? 1 : 0.92,
          x: isLanded ? 0 : 10,
        }}
        transition={{ duration: prefersReducedMotion ? 0.15 : 0.25, ease: 'easeOut' }}
        style={{ pointerEvents: isLanded ? 'auto' : 'none' }}
        className="fixed bottom-[26px] right-[82px] md:bottom-[42px] md:right-[108px] z-40 bg-white text-[#0B0B0B] text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg border border-[#0B0B0B]/10 select-none cursor-pointer hover:border-[#CBAA5E] transition-colors max-w-[205px] sm:max-w-none"
      >
        <span>{chatMessages[chatMessageIndex]}</span>
      </motion.button>

      {/* Single Fixed Photo Element used for both Hero and Floating Corner states */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: avatarX,
          y: avatarY,
          width: startW,
          height: avatarHeight,
          opacity: avatarOpacity,
          pointerEvents: 'none',
        }}
        className="z-40"
      >
        {/* Parent with perspective: 1000px & transformStyle: preserve-3d + gentle 6px float ONLY after landing */}
        <motion.div
          animate={
            isLanded && !prefersReducedMotion
              ? { y: [0, -6, 0] }
              : { y: 0 }
          }
          transition={
            isLanded && !prefersReducedMotion
              ? { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.25, ease: 'easeOut' }
          }
          style={{
            width: '100%',
            height: '100%',
            perspective: '1000px',
            transformStyle: 'preserve-3d',
          }}
        >
          <motion.div
            onClick={() => {
              if (isLanded) scrollTo('contact');
            }}
            title={isLanded ? 'Chat with Saeed' : undefined}
            style={{
              width: '100%',
              height: '100%',
              scale: avatarScale,
              rotateY: avatarRotateY,
              borderRadius: avatarRadius,
              borderWidth: avatarBorderWidth,
              borderColor: avatarBorderColor,
              borderStyle: 'solid',
              willChange: 'transform',
              pointerEvents: isLanded ? 'auto' : 'none',
            }}
            className={`overflow-hidden bg-[#EDE7DC] shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex items-center justify-center ${
              isLanded ? 'cursor-pointer' : ''
            }`}
          >
            <img
              src="avatar_saeed.jpg"
              alt="Saeed Ahmad"
              style={{ objectFit: 'contain' }}
              className="w-full h-full object-contain block select-none"
              draggable={false}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* =========================================================================
          LIGHTBOX FOR SCREENSHOTS (prev / next / close)
      ========================================================================== */}
      {lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center justify-center"
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between text-white text-xs pb-3 border-b border-white/10 mb-3 px-2">
              <span className="font-semibold text-sm text-[#CBAA5E]">
                {ALL_SCREENSHOTS[lightboxIndex].title}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-white/60 font-mono">
                  {lightboxIndex + 1} / {ALL_SCREENSHOTS.length}
                </span>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Close lightbox"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image Viewport */}
            <div className="relative w-full flex items-center justify-center max-h-[75vh]">
              <img
                src={ALL_SCREENSHOTS[lightboxIndex].src}
                alt={ALL_SCREENSHOTS[lightboxIndex].title}
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
              />

              {/* Prev Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev !== null ? (prev - 1 + ALL_SCREENSHOTS.length) % ALL_SCREENSHOTS.length : null));
                }}
                className="absolute left-2 sm:-left-12 p-3 rounded-full bg-black/70 hover:bg-[#CBAA5E] hover:text-[#0B0B0B] text-white border border-white/20 transition-all cursor-pointer"
                aria-label="Previous screenshot"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev !== null ? (prev + 1) % ALL_SCREENSHOTS.length : null));
                }}
                className="absolute right-2 sm:-right-12 p-3 rounded-full bg-black/70 hover:bg-[#CBAA5E] hover:text-[#0B0B0B] text-white border border-white/20 transition-all cursor-pointer"
                aria-label="Next screenshot"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="text-white/40 text-[11px] mt-3">
              Press Left/Right Arrow to navigate, ESC to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
