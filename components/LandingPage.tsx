"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  PenLineIcon,
  UsersIcon,
  SparklesIcon,
  ArrowRightIcon,
  BookOpenIcon,
  MessageSquareIcon,
  TrendingUpIcon,
  StarIcon,
  ChevronDownIcon,
} from "lucide-react";
import { appName, appDescription } from "@/utils/data";
import { cn } from "@/lib/utils";

/* ─── Animated Number Counter ─────────────────────────────────── */
function AnimatedCounter({
  end,
  suffix = "",
  duration = 2000,
}: {
  end: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(ease * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Feature Card ─────────────────────────────────────────────── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "group relative p-6 rounded-2xl border transition-all duration-700",
        "bg-[#161622]/80 border-white/5 hover:border-[#E8293A]/30",
        "hover:bg-[#1e1e2e]/90 hover:shadow-xl hover:shadow-[#E8293A]/5",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "radial-gradient(circle at 0% 0%, rgba(232,41,58,0.08) 0%, transparent 60%)" }}
      />
      <div className="relative z-10">
        <div className="w-11 h-11 rounded-xl bg-[#E8293A]/10 border border-[#E8293A]/20 flex items-center justify-center mb-4 group-hover:bg-[#E8293A]/20 group-hover:border-[#E8293A]/40 transition-all duration-300">
          <Icon className="w-5 h-5 text-[#E8293A]" />
        </div>
        <h3 className="text-[15px] font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-white/40 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ─── Floating particles ───────────────────────────────────────── */
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-[#E8293A]"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.3 + 0.05,
            animation: `float-particle ${Math.random() * 10 + 8}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 8}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Main Landing Page ────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: PenLineIcon,
      title: "Rich Writing Studio",
      description:
        "Markdown-powered editor with AI copilot. Format code, embed media, and craft beautiful long-form content.",
    },
    {
      icon: SparklesIcon,
      title: "AI-Powered Assist",
      description:
        "Stuck on phrasing? Let our intelligent assistant help refine, expand or summarize your ideas instantly.",
    },
    {
      icon: MessageSquareIcon,
      title: "Threaded Discussions",
      description:
        "Every post sparks a conversation. Nested comments keep context clean and debates meaningful.",
    },
    {
      icon: UsersIcon,
      title: "Discover Creators",
      description:
        "Follow writers you admire, explore diverse voices, and build your own readership organically.",
    },
    {
      icon: TrendingUpIcon,
      title: "Trending Feed",
      description:
        "Surface the stories that matter. Curated feed surfaces quality content from across the platform.",
    },
    {
      icon: BookOpenIcon,
      title: "Read Beautifully",
      description:
        "A clean, distraction-free reader. Dark mode, comfortable typography — every post reads like a book.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f18] text-white overflow-x-hidden">
      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(8px); }
          66% { transform: translateY(-8px) translateX(-12px); }
        }
        @keyframes hero-glow-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes slide-up-fade {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes badge-ping {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes ink-drip {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up-fade 0.8s cubic-bezier(0.22,1,0.36,1) forwards; }
        .animate-slide-up-d1 { animation: slide-up-fade 0.8s 0.15s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-slide-up-d2 { animation: slide-up-fade 0.8s 0.3s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-slide-up-d3 { animation: slide-up-fade 0.8s 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .hero-glow { animation: hero-glow-pulse 4s ease-in-out infinite; }
        .badge-ring::after {
          content:''; position:absolute; inset:-4px; border-radius:9999px;
          border: 1px solid rgba(232,41,58,0.5);
          animation: badge-ping 2.5s ease-out infinite;
        }
        .ink-underline { animation: ink-drip 0.8s 0.6s cubic-bezier(0.22,1,0.36,1) both; transform-origin: left; }
      `}</style>

      {/* ── Sticky nav ───────────────────────────────────────────── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[#0f0f18]/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/30"
            : "bg-transparent"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8293A] flex items-center justify-center shadow-lg shadow-[#E8293A]/30">
              <PenLineIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">{appName.toUpperCase()}</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-white/50">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#community" className="hover:text-white transition-colors">Community</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/api/auth/signin" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
              Sign in
            </Link>
            <Link
              href="/api/auth/signin"
              id="landing-nav-get-started"
              className="flex items-center gap-1.5 text-sm font-semibold bg-[#E8293A] hover:bg-[#c0202f] text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-[#E8293A]/20 hover:shadow-[#E8293A]/40 hover:scale-[1.02]"
            >
              Get Started
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="hero-glow absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(232,41,58,0.1) 0%, rgba(232,41,58,0.03) 45%, transparent 70%)" }}
          />
        </div>
        <Particles />

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="flex flex-col gap-6">
            <div className="animate-slide-up inline-flex w-fit items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8293A]/10 border border-[#E8293A]/20 text-xs font-medium text-[#E8293A]">
              <span className="relative badge-ring">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8293A] block" />
              </span>
              Now open to all writers
            </div>

            <h1 className="animate-slide-up-d1 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
              Your{" "}
              <span className="relative inline-block">
                <span className="text-[#E8293A]">ideas</span>
                <span className="ink-underline absolute left-0 -bottom-1 w-full h-[3px] bg-gradient-to-r from-[#E8293A] to-[#c0202f] rounded-full" />
              </span>
              <br />
              deserve a stage.
            </h1>

            <p className="animate-slide-up-d2 text-base text-white/45 leading-relaxed max-w-md">
              {appDescription} Write, share, and connect with a community that reads with purpose.
            </p>

            <div className="animate-slide-up-d3 flex flex-wrap items-center gap-4">
              <Link
                href="/api/auth/signin"
                id="landing-hero-cta"
                className="group flex items-center gap-2 bg-[#E8293A] hover:bg-[#c0202f] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-xl shadow-[#E8293A]/25 hover:shadow-[#E8293A]/45 hover:scale-[1.03]"
              >
                Start Writing Free
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/posts"
                id="landing-browse-posts"
                className="flex items-center gap-2 text-white/60 hover:text-white font-medium px-4 py-3 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 bg-white/5 hover:bg-white/10 text-sm"
              >
                <BookOpenIcon className="w-4 h-4" />
                Browse Posts
              </Link>
            </div>

            <div className="animate-slide-up-d3 flex items-center gap-4 pt-1">
              <div className="flex -space-x-2">
                {["#E8293A", "#c0202f", "#9b1a28", "#7a1520", "#5c1019"].map((color, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-[#0f0f18] flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: color }}
                  >
                    {["V", "A", "M", "K", "S"][i]}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <StarIcon className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-white/60 font-medium">Loved by writers</span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-3xl"
              style={{ background: "radial-gradient(circle at center, rgba(232,41,58,0.12) 0%, transparent 70%)" }}
            />
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border border-white/5 shadow-2xl shadow-black/60">
              <Image
                src="/hero-ink.png"
                alt="Inkwell — where ideas come to life"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-x-4 bottom-4 flex gap-3">
                <div className="flex-1 bg-[#0f0f18]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5">
                  <div className="text-xl font-bold text-white">
                    <AnimatedCounter end={2400} suffix="+" />
                  </div>
                  <div className="text-[11px] text-white/40 mt-0.5">Posts published</div>
                </div>
                <div className="flex-1 bg-[#0f0f18]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5">
                  <div className="text-xl font-bold text-[#E8293A]">
                    <AnimatedCounter end={850} suffix="+" />
                  </div>
                  <div className="text-[11px] text-white/40 mt-0.5">Active writers</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/20 animate-bounce">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ChevronDownIcon className="w-4 h-4" />
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-[#12121c]">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-3 divide-x divide-white/5">
          {[
            { label: "Words written", value: 1200000, suffix: "+" },
            { label: "Stories shared", value: 2400, suffix: "+" },
            { label: "Reader minutes", value: 50000, suffix: "+" },
          ].map(({ label, value, suffix }) => (
            <div key={label} className="text-center px-4">
              <div className="text-2xl md:text-3xl font-extrabold text-white">
                <AnimatedCounter end={value} suffix={suffix} />
              </div>
              <div className="text-[11px] text-white/30 mt-1 uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section id="features" className="py-24 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(232,41,58,0.05) 0%, transparent 60%)" }}
        />
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-[11px] font-semibold text-[#E8293A] tracking-[0.15em] uppercase mb-3">
              Everything you need
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Built for serious writers
            </h2>
            <p className="text-white/35 mt-3 text-sm max-w-lg mx-auto">
              From your first draft to a growing audience — Inkwell has you covered at every step.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY CTA ────────────────────────────────────────── */}
      <section id="community" className="py-24 bg-[#12121c] border-y border-white/5 relative overflow-hidden">
        <div
          className="absolute right-0 top-0 w-96 h-96 opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle at top right, rgba(232,41,58,0.12), transparent 70%)" }}
        />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="inline-block text-[11px] font-semibold text-[#E8293A] tracking-[0.15em] uppercase mb-4">
            Join the community
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-6">
            Words have power.
            <br />
            <span className="text-[#E8293A]">Share yours.</span>
          </h2>
          <p className="text-white/40 text-base max-w-xl mx-auto mb-10 leading-relaxed">
            Join hundreds of writers publishing their thoughts, stories, and expertise on Inkwell.
            Your voice matters — start today, for free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/api/auth/signin"
              id="landing-community-cta"
              className="group flex items-center justify-center gap-2 bg-[#E8293A] hover:bg-[#c0202f] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-2xl shadow-[#E8293A]/30 hover:shadow-[#E8293A]/50 hover:scale-[1.02] text-sm"
            >
              Create your account
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/posts"
              className="flex items-center justify-center gap-2 text-white/50 hover:text-white font-medium px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 text-sm bg-white/5 hover:bg-white/10"
            >
              Explore without signing up
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="py-10 border-t border-white/5 bg-[#0f0f18]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#E8293A] flex items-center justify-center">
              <PenLineIcon className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold text-white/70">{appName.toUpperCase()}</span>
          </div>
          <p className="text-xs text-white/25">© {new Date().getFullYear()} Inkwell. A space for thinkers.</p>
          <div className="flex items-center gap-5 text-xs text-white/30">
            <Link href="/posts" className="hover:text-white/60 transition-colors">Posts</Link>
            <Link href="/profiles" className="hover:text-white/60 transition-colors">People</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
