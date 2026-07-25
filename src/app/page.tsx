"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

const portals = [
  {
    title: "Admin Panel",
    description: "Management & Reports",
    href: "/login/admin",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 9h6M9 13h6M9 17h4" />
      </svg>
    ),
  },
  {
    title: "Teacher Portal",
    description: "Classes & Grading",
    href: "/login/teacher",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 3L2 9l10 6 10-6-10-6z" />
        <path d="M2 17l10 6 10-6" />
      </svg>
    ),
  },
  {
    title: "Student Hub",
    description: "Results & Timetable",
    href: "/login/student",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    title: "Parent Connect",
    description: "Attendance & Fees",
    href: "/login/parent",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    title: "HR Portal",
    description: "Employee & Payroll",
    href: "/login/admin?tab=hr",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
        <path d="M1 21h22" />
        <path d="M9 7h6M9 11h6M9 15h2" />
      </svg>
    ),
  },
];

const heroPortals = portals;

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [countersVisible, setCountersVisible] = useState(false);
  const [counterValues, setCounterValues] = useState({ s1: 0, s2: 0, s3: 0, s4: 0 });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSending, setFormSending] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const revealedRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
      const sections = ["hero", "about", "stats", "portals", "contact"];
      let current = "hero";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 80) current = id;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            revealedRef.current.add(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCountersVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!countersVisible) return;
    const targets = { s1: 1200, s2: 80, s3: 95, s4: 30 };
    const duration = 1100;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounterValues({
        s1: Math.round(targets.s1 * ease),
        s2: Math.round(targets.s2 * ease),
        s3: Math.round(targets.s3 * ease),
        s4: Math.round(targets.s4 * ease),
      });
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [countersVisible]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormSending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await fetch("https://formspree.io/f/xlgodwyg", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setFormSubmitted(true);
        form.reset();
        setTimeout(() => setFormSubmitted(false), 4000);
      } else {
        alert("Failed to send. Please try again.");
      }
    } catch {
      alert("Failed to send. Please try again.");
    }
    setFormSending(false);
  };

  return (
    <div className="bg-white text-gray-800">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 text-white px-6 md:px-12 py-4 flex items-center justify-between transition-all duration-300 ${
          scrolled ? "bg-[#0d2a4a] shadow-lg" : "bg-[#0d2a4a]/94"
        }`}
      >
        <a href="#hero" className="flex items-center gap-3">
          <svg className="w-6 h-6 text-[#e8b84b]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M12 3L2 9l10 6 10-6-10-6z" />
            <path d="M2 17l10 6 10-6" />
            <path d="M2 13l10 6 10-6" />
          </svg>
          <span className="brand text-[17px] font-bold tracking-wide">Institution Management System</span>
        </a>

        <div className="hidden md:flex items-center gap-7">
          {["hero", "about", "stats", "portals", "contact"].map((s) => (
            <a key={s} href={`#${s}`} className={`nav-link ${activeSection === s ? "active" : ""}`}>
              {s === "hero" ? "Home" : s.charAt(0).toUpperCase() + s.slice(1)}
            </a>
          ))}
        </div>

        <button
          className="md:hidden flex flex-col gap-[5px] p-2 rounded-lg hover:bg-white/10 transition z-[300] relative"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Open menu"
        >
          <span className={`block w-5 h-[2px] bg-white rounded transition-all duration-300 ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`block w-5 h-[2px] bg-white rounded transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-[2px] bg-white rounded transition-all duration-300 ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </button>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[200] bg-[#0d2a4a]/98 flex flex-col items-center justify-center gap-2">
          <button className="absolute top-5 right-6 text-white/70 hover:text-white p-2" onClick={() => setMobileOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="mb-8 text-center">
            <div className="flex justify-center text-[#e8b84b] mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M12 3L2 9l10 6 10-6-10-6z" />
                <path d="M2 17l10 6 10-6" />
                <path d="M2 13l10 6 10-6" />
              </svg>
            </div>
            <p className="brand text-white text-sm font-semibold opacity-60">Institution Management System</p>
          </div>
          {["hero", "about", "stats", "portals", "contact"].map((s) => (
            <a key={s} href={`#${s}`} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
              {s === "hero" ? "Home" : s.charAt(0).toUpperCase() + s.slice(1)}
            </a>
          ))}
          <div className="mt-8 pt-8 border-t border-white/10 w-full px-10 flex flex-col gap-3">
            <Link href="/login/student" className="btn-primary text-center py-3 px-6 text-sm rounded-lg" onClick={() => setMobileOpen(false)}>
              Student Portal
            </Link>
            <Link href="/login/parent" className="btn-outline text-center py-3 px-6 text-sm rounded-lg" onClick={() => setMobileOpen(false)}>
              Parent Connect
            </Link>
          </div>
        </div>
      )}

      <section className="hero-bg text-white pt-32 pb-20 px-6 md:px-16" id="hero">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-14 items-center">
          <div className="flex-1 max-w-xl">
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] mb-6 fade-up delay-1">
              Shaping<br />Tomorrow&apos;s<br />Leaders
            </h1>
            <p className="text-blue-100 text-[15px] leading-relaxed mb-9 fade-up delay-2 max-w-md">
              A complete management system for Punjab Board-affiliated schools and colleges — connecting students, teachers, parents, and administrators in one seamless platform.
            </p>
            <div className="flex flex-wrap gap-3 fade-up delay-3">
              <Link href="/login/student" className="btn-primary px-7 py-2.5 text-sm">
                Student Portal ›
              </Link>
              <Link href="/login/parent" className="btn-outline px-7 py-2.5 text-sm">
                Parent Connect
              </Link>
            </div>
            <p className="text-white/40 text-xs mt-8 fade-up delay-4 tracking-widest">
              BISE AFFILIATED · PCTB CURRICULUM · ISO CERTIFIED
            </p>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4 fade-up delay-4 w-full max-w-md">
            {heroPortals.map((p) => (
              <Link key={p.title} href={p.href} className="portal-card bg-white/10 rounded-2xl p-5 cursor-pointer block">
                <div className="mb-3 text-[#e8b84b]">{p.icon}</div>
                <p className="font-semibold text-sm text-white">{p.title}</p>
                <p className="text-xs text-white/50 mt-0.5">{p.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 text-center reveal" id="about">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-center text-[#0d2a4a] mb-6">
            <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
              <path d="M12 3L2 9l10 6 10-6-10-6z" />
              <path d="M2 17l10 6 10-6" />
              <path d="M2 13l10 6 10-6" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-2 heading-underline">Institution Management System</h2>
          <div className="ornament mt-6 text-sm text-gray-300">✦</div>
          <p className="text-gray-500 text-[15px] italic leading-relaxed mb-5">
            &quot;Empowering learners through quality education, discipline, and values — preparing students for board exams and a brighter future.&quot;
          </p>
          <p className="text-xs tracking-[0.22em] text-gray-400 uppercase">Est. Year · Punjab, Pakistan · BISE Affiliated</p>
        </div>
      </section>

      <section className="bg-[#0d2a4a] py-16 px-6 reveal" id="stats" ref={statsRef}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          <div>
            <p className="stat-num text-5xl font-bold text-[#e8b84b]">{counterValues.s1.toLocaleString()}+</p>
            <p className="text-[11px] tracking-widest uppercase text-blue-300 mt-2">Students Enrolled</p>
          </div>
          <div>
            <p className="stat-num text-5xl font-bold text-[#e8b84b]">{counterValues.s2}+</p>
            <p className="text-[11px] tracking-widest uppercase text-blue-300 mt-2">Faculty Members</p>
          </div>
          <div>
            <p className="stat-num text-5xl font-bold text-[#e8b84b]">{counterValues.s3}%</p>
            <p className="text-[11px] tracking-widest uppercase text-blue-300 mt-2">Board Pass Rate</p>
          </div>
          <div>
            <p className="stat-num text-5xl font-bold text-[#e8b84b]">{counterValues.s4}+</p>
            <p className="text-[11px] tracking-widest uppercase text-blue-300 mt-2">Board Distinctions</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 reveal" id="portals">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold heading-underline mb-4">Unified Digital Campus</h2>
            <p className="text-gray-500 text-sm mt-6 max-w-md mx-auto">
              One platform for every stakeholder — from classroom to boardroom.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {portals.map((p, i) => (
              <div key={p.title} className={`reveal delay-${i}`}>
                <div className="flex justify-center mb-4">
                  <div className="icon-wrap text-[#0d2a4a]">{p.icon}</div>
                </div>
                <p className="font-semibold text-sm mb-1">{p.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed mb-3">{p.description}</p>
                <Link href={p.href} className="text-[#0d2a4a] text-xs font-semibold hover:underline">
                  Access Portal ›
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-16 px-6" id="contact">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12">
          <div>
            <p className="brand text-xl font-bold mb-3">Institution Management System</p>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Punjab, Pakistan<br />info@institution.edu.pk<br />+92 300 0000000
            </p>
            <div className="flex gap-4 mb-8">
              <a href="#" className="text-gray-500 hover:text-[#e8b84b]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-[#e8b84b]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-[#e8b84b]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
            </div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Quick Links</p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#hero" className="hover:text-[#e8b84b]">Home</a></li>
              <li><a href="#about" className="hover:text-[#e8b84b]">About Us</a></li>
              <li><a href="#stats" className="hover:text-[#e8b84b]">Stats</a></li>
              <li><a href="#portals" className="hover:text-[#e8b84b]">Portals</a></li>
              <li><a href="#contact" className="hover:text-[#e8b84b]">Contact</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-semibold text-lg mb-6">Request Information</h3>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <input type="text" name="name" placeholder="Your Name" className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 border border-gray-700 focus:border-[#e8b84b] transition outline-none" />
                <input type="email" name="email" placeholder="Email Address" className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 border border-gray-700 focus:border-[#e8b84b] transition outline-none" />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <input type="text" name="phone" placeholder="Phone Number" className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 border border-gray-700 focus:border-[#e8b84b] transition outline-none" />
                <select name="role" className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-400 border border-gray-700 focus:border-[#e8b84b] transition outline-none">
                  <option>I am a...</option>
                  <option>Prospective Student</option>
                  <option>Parent / Guardian</option>
                  <option>Institution Administrator</option>
                </select>
              </div>
              <textarea name="message" placeholder="Your Message or Query" rows={4} className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 border border-gray-700 focus:border-[#e8b84b] transition resize-none outline-none" />
              <button type="submit" disabled={formSending} className="w-full bg-[#e8b84b] hover:bg-[#f5d07a] text-[#0d2a4a] font-semibold py-3 rounded-lg text-sm transition disabled:opacity-60">
                {formSending ? "Sending..." : "Send Message"}
              </button>
              {formSubmitted && (
                <p className="text-green-400 text-sm text-center pt-1">✓ Message received — we&apos;ll be in touch shortly.</p>
              )}
            </form>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-gray-800 text-xs text-gray-600 text-center">
          © {new Date().getFullYear()} Institution Management System. All rights reserved. · Punjab, Pakistan · BISE Affiliated
        </div>
      </footer>
    </div>
  );
}
