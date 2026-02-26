import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import InteractiveGlobe from "../components/InteractiveGlobe";
import {
  Leaf,
  BarChart3,
  FileCheck,
  Clock,
  ArrowRight,
  Play,
  CheckCircle2,
  Globe,
  Zap,
  Shield,
  TrendingDown,
  ChevronRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "../components/animations/ScrollReveal";
import {
  MagneticButton,
  FloatingElement,
} from "../components/animations/MicroInteractions";
import {
  AnimatedCounter,
  TextReveal,
} from "../components/animations/TextAnimations";

const LandingPage = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const features = [
    {
      icon: Clock,
      title: "Real-time Auditing",
      desc: "Monitor scope 1, 2, and 3 emissions as they happen with direct IoT sensor integration and API connectors.",
      link: "Learn more",
    },
    {
      icon: BarChart3,
      title: "Deep Analytics",
      desc: "Uncover trends and actionable insights from your data using our proprietary AI-driven modeling engine.",
      link: "Explore analytics",
    },
    {
      icon: FileCheck,
      title: "Compliance Reporting",
      desc: "One-click generation of regulatory compliant reports for ESRS, CDP, and GRI frameworks.",
      link: "View standards",
    },
  ];

  const stats = [
    { value: 2400, suffix: "+", label: "Facilities Tracked" },
    { value: 98, suffix: "%", label: "Audit Accuracy" },
    { value: 15, suffix: "M", prefix: "", label: "Tons CO₂ Measured" },
    { value: 340, suffix: "+", label: "Enterprise Clients" },
  ];

  const checklistItems = [
    "Live emission tracking across all scopes",
    "Predictive carbon forecasting with AI",
    "Full supply chain visibility & integration",
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      <Navbar />
      <main className="flex-1">
        {/* ========== HERO ========== */}
        <section
          ref={heroRef}
          className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-hero-bg"
        >
          {/* === Deep base layer: photo with heavy overlay === */}
          <motion.div
            style={{ y: heroY, scale: heroScale }}
            className="absolute inset-0 z-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center saturate-[0.3]"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBvkz3TJQ8dJiCOC-3NAI0fGqroUlsPXS5X2aFOQTCaGU6Eq3WMa2chpyGpYJQXa4WneH5DheBNhkMYkxQSdZ5Ahz8sT6PPg9t9irPW7BtWCJnJadIYtuqma1P3aKOJlmZvGWvOIyCXKYGUFrDhoUgUE5EAULab6REkS9h5Z3mMC7rNm3kC6CjioPgcDl_UYdMfFpRiLnvsGBArWRQ4ZVl5sXzIHF6Fn9nuRXJppZ5Xlg9vp_bXDpxJf68V2w36MtsLB-sqNwCC-x0')",
              }}
            />
            <div className="absolute inset-0 bg-hero-bg/85" />
          </motion.div>

          {/* === Animated aurora blobs === */}
          <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
            <motion.div
              animate={{
                x: [0, 80, -40, 0],
                y: [0, -60, 30, 0],
                scale: [1, 1.2, 0.9, 1],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-[20%] -left-[10%] w-[700px] h-[700px] rounded-full opacity-[0.12]"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in srgb, var(--color-primary) 80%, transparent) 0%, transparent 70%)",
              }}
            />
            <motion.div
              animate={{
                x: [0, -60, 50, 0],
                y: [0, 50, -40, 0],
                scale: [1.1, 0.9, 1.15, 1.1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3,
              }}
              className="absolute -bottom-[15%] -right-[5%] w-[600px] h-[600px] rounded-full opacity-[0.10]"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in srgb, var(--color-emerald-accent) 70%, transparent) 0%, transparent 70%)",
              }}
            />
            <motion.div
              animate={{
                x: [0, 40, -30, 0],
                y: [0, -30, 50, 0],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 6,
              }}
              className="absolute top-[30%] right-[15%] w-[450px] h-[450px] rounded-full opacity-[0.07]"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in srgb, var(--color-emerald-accent) 60%, transparent) 0%, transparent 70%)",
              }}
            />
          </div>

          {/* === Perspective grid floor === */}
          <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-[60%] opacity-[0.06]"
              style={{
                backgroundImage: `linear-gradient(color-mix(in srgb, var(--color-primary) 60%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 60%, transparent) 1px, transparent 1px)`,
                backgroundSize: "clamp(40px, 5vw, 80px) clamp(40px, 5vw, 80px)",
                transform: "perspective(500px) rotateX(60deg)",
                transformOrigin: "bottom center",
                maskImage:
                  "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 80%)",
                WebkitMaskImage:
                  "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 80%)",
              }}
            />
          </div>

          {/* === Floating particles (enhanced) === */}
          <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <FloatingElement
                key={i}
                amplitude={8 + (i % 4) * 6}
                duration={4 + i * 0.8}
                delay={i * 0.5}
                className="absolute"
              >
                <motion.div
                  animate={{ opacity: [0.15, 0.5, 0.15] }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3,
                  }}
                  className="rounded-full"
                  style={{
                    width: `${2 + (i % 4) * 1.5}px`,
                    height: `${2 + (i % 4) * 1.5}px`,
                    background:
                      i % 3 === 0
                        ? "var(--color-primary)"
                        : i % 3 === 1
                          ? "var(--color-emerald-accent)"
                          : "var(--color-emerald-light)",
                    boxShadow: `0 0 ${4 + i * 2}px ${i % 3 === 0 ? "color-mix(in srgb, var(--color-primary) 60%, transparent)" : "color-mix(in srgb, var(--color-emerald-accent) 40%, transparent)"}`,
                    position: "absolute",
                    left: `${5 + i * 8}%`,
                    top: `${10 + ((i * 17) % 70)}%`,
                  }}
                />
              </FloatingElement>
            ))}
          </div>

          {/* === Scan line effect === */}
          <motion.div
            animate={{ top: ["-5%", "105%"] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 4,
            }}
            className="absolute left-0 right-0 h-[1px] z-[4] pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-primary) 15%, transparent) 20%, color-mix(in srgb, var(--color-emerald-accent) 25%, transparent) 50%, color-mix(in srgb, var(--color-primary) 15%, transparent) 80%, transparent 100%)",
              boxShadow:
                "0 0 20px color-mix(in srgb, var(--color-primary) 10%, transparent), 0 0 60px color-mix(in srgb, var(--color-primary) 5%, transparent)",
            }}
          />

          {/* === Vignette edges === */}
          <div
            className="absolute inset-0 z-[5] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, color-mix(in srgb, var(--color-hero-bg) 70%, transparent) 100%)",
            }}
          />

          {/* Hero content — split layout */}
          <motion.div
            style={{ opacity: heroOpacity }}
            className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 px-4 md:px-10 py-32 max-w-[1200px] mx-auto w-full"
          >
            {/* Left — Text */}
            <div className="flex-1 flex flex-col gap-6 items-start text-left">
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.2,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/25 backdrop-blur-sm"
              >
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary text-xs font-semibold uppercase tracking-widest">
                  ISO 14064 Compliant
                </span>
              </motion.div>

              <div className="flex flex-col gap-4">
                <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight">
                  <TextReveal text="Precision in Every" delay={0.4} />
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_auto] animate-gradient">
                    <TextReveal text="Carbon Footprint" delay={0.7} />
                  </span>
                </h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 1.1,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className="text-slate-400 text-base md:text-lg leading-relaxed max-w-lg font-normal"
                >
                  The leading Industrial Emission Auditor for modern
                  sustainability analytics. Track, measure, and reduce your
                  emissions with enterprise-grade precision.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 1.4,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="flex flex-col sm:flex-row gap-4 mt-2"
              >
                <MagneticButton strength={0.15}>
                  <button className="group relative flex items-center justify-center gap-2 rounded-xl h-13 px-8 bg-primary text-white text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_40px] hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden">
                    <span className="relative z-10">Start Auditing</span>
                    <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </MagneticButton>

                <MagneticButton strength={0.15}>
                  <button className="group flex items-center justify-center gap-2 rounded-xl h-13 px-8 bg-white/[0.06] border border-white/[0.1] backdrop-blur-sm text-white text-sm font-semibold transition-all duration-300 hover:bg-white/[0.12] hover:border-white/[0.2] hover:-translate-y-0.5 active:translate-y-0">
                    <div className="relative w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
                    </div>
                    Watch Demo
                  </button>
                </MagneticButton>
              </motion.div>

              {/* Trust bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.8 }}
                className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-slate-500 text-xs"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary/70" />
                  No credit card required
                </span>
                <span className="w-px h-3 bg-slate-700" />
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary/70" />
                  14-day free trial
                </span>
                <span className="w-px h-3 bg-slate-700 hidden sm:block" />
                <span className="hidden sm:flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary/70" />
                  SOC 2 certified
                </span>
              </motion.div>
            </div>

            {/* Right — Interactive Globe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1,
                delay: 0.6,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="flex-1 flex items-center justify-center relative"
            >
              <div className="relative">
                {/* Connection lines radiating out */}
                {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                  <motion.div
                    key={deg}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + i * 0.08, duration: 0.6 }}
                    className="absolute top-1/2 left-1/2 w-[140%] h-px origin-left pointer-events-none"
                    style={{
                      transform: `rotate(${deg}deg)`,
                      background: `linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 25%, transparent) 0%, transparent 55%)`,
                    }}
                  />
                ))}

                {/* Floating data points around globe */}
                {[
                  { x: "-12%", y: "18%", delay: 1.4 },
                  { x: "82%", y: "22%", delay: 1.6 },
                  { x: "88%", y: "68%", delay: 1.8 },
                  { x: "-8%", y: "72%", delay: 1.5 },
                ].map((dot, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: dot.delay,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="absolute z-10 pointer-events-none"
                    style={{ left: dot.x, top: dot.y }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
                      transition={{
                        duration: 2 + i * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="size-3 rounded-full bg-primary/40 absolute -inset-1"
                    />
                    <div className="size-1.5 rounded-full bg-primary shadow-[0_0_6px] shadow-primary/60" />
                  </motion.div>
                ))}

                <InteractiveGlobe size={600} dark={true} />
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent z-10" />

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5"
            >
              <motion.div
                animate={{ height: ["20%", "60%", "20%"] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-0.5 bg-white/40 rounded-full"
              />
            </motion.div>
          </motion.div>
        </section>

        {/* ========== STATS BAR ========== */}
        <section className="relative z-20 -mt-16 px-4 md:px-10">
          <ScrollReveal variant="fadeUp" className="max-w-[1100px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden bg-border dark:bg-border-dark border border-border dark:border-border-dark shadow-xl shadow-black/5">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 py-8 px-4 bg-white dark:bg-surface-dark text-center"
                >
                  <span className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tabular-nums">
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                      prefix={stat.prefix}
                      duration={2.5}
                    />
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* ========== FEATURES ========== */}
        <section className="px-4 md:px-10 pt-28 pb-20">
          <div className="max-w-[1100px] mx-auto">
            <div className="flex flex-col gap-4 text-center items-center mb-16">
              <ScrollReveal variant="fadeUp">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                    Core Capabilities
                  </span>
                </div>
              </ScrollReveal>
              <ScrollReveal variant="fadeUp" delay={0.1}>
                <h2 className="text-slate-900 dark:text-white text-3xl md:text-[2.75rem] font-bold leading-tight tracking-tight">
                  Comprehensive Carbon
                  <br className="hidden sm:block" /> Management
                </h2>
              </ScrollReveal>
              <ScrollReveal variant="fadeUp" delay={0.2}>
                <p className="text-slate-500 dark:text-slate-400 text-base max-w-lg leading-relaxed">
                  Empowering industries to meet sustainability goals through
                  automated data collection and rigorous auditing standards.
                </p>
              </ScrollReveal>
            </div>

            <StaggerContainer
              staggerDelay={0.12}
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              {features.map((feature, i) => (
                <StaggerItem key={i}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="group relative flex flex-col gap-5 rounded-2xl border border-border dark:border-border-dark bg-white dark:bg-surface-dark p-8 h-full cursor-pointer overflow-hidden transition-shadow"
                  >
                    {/* Hover gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                    <div className="relative">
                      <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/25">
                        <feature.icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                    </div>

                    <div className="relative flex flex-col gap-2">
                      <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                        {feature.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>

                    <div className="relative mt-auto pt-3 flex items-center text-primary font-semibold text-sm gap-1">
                      <span>{feature.link}</span>
                      <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ========== DASHBOARD PREVIEW ========== */}
        <section className="px-4 md:px-10 py-20 bg-background-light/80 dark:bg-surface-dark/30 border-y border-border dark:border-border-dark">
          <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            <div className="flex-1 flex flex-col gap-6">
              <ScrollReveal variant="fadeUp">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit">
                  <BarChart3 className="w-3.5 h-3.5 text-primary" />
                  <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                    Visual Intelligence
                  </span>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="fadeUp" delay={0.1}>
                <h2 className="text-slate-900 dark:text-white text-3xl md:text-[2.5rem] font-bold leading-tight tracking-tight">
                  See your impact
                  <br />
                  in real-time.
                </h2>
              </ScrollReveal>

              <ScrollReveal variant="fadeUp" delay={0.15}>
                <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed max-w-md">
                  Our dashboard provides a unified view of your environmental
                  performance across all facilities. Identify hotspots instantly
                  and simulate reduction strategies.
                </p>
              </ScrollReveal>

              <StaggerContainer
                staggerDelay={0.1}
                className="flex flex-col gap-3 mt-2"
              >
                {checklistItems.map((item, i) => (
                  <StaggerItem key={i} variant="fadeLeft">
                    <div className="flex items-center gap-3 group">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 text-sm">
                        {item}
                      </span>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>

            <ScrollReveal
              variant="scaleIn"
              delay={0.2}
              className="flex-1 w-full"
            >
              <div className="relative group">
                {/* Glow behind card */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-emerald-400/10 to-primary/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative rounded-2xl overflow-hidden border border-border dark:border-border-dark bg-white dark:bg-background-dark shadow-2xl shadow-black/[0.08]">
                  <div className="aspect-video relative overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03]"
                      style={{
                        backgroundImage:
                          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAVjW5VbZ_0CWKiZh5ookX3GZBo9cMoo6Rx6p8T2z6XD-yp3cLR0kVvNFZsZd79fDYj5zPNZSEzOhgdC2X7Zcz-Rwtj5VjJE08XmWNIjzUntdYYOx3985XnHky7Ni8PaqGvL88GXOIzFb8UsOvV0-Ss7x3VEKJhd0JlnvUpSMhw4GZ6kBKCVkj9IDM0umOH-45AiekBegbN-rgbJZ_2sbBTwkK7NhocIuWMgWJbTAr81-0-HgjI4P8NW3X5muNZi8fRxKgtTfNNVyg')",
                      }}
                    />
                    <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
                  </div>

                  {/* Floating stat card */}
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="absolute bottom-5 left-5 right-5"
                  >
                    <div className="p-4 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl rounded-xl border border-border/80 dark:border-border-dark shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Current Usage
                        </span>
                        <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          -12% vs Last Month
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary dark:bg-border-dark rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "65%" }}
                          viewport={{ once: true }}
                          transition={{
                            delay: 0.8,
                            duration: 1.2,
                            ease: [0.25, 0.1, 0.25, 1],
                          }}
                          className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ========== SDG / MISSION ========== */}
        <section className="relative overflow-hidden py-28 px-4 md:px-10">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-primary/90" />
            {/* Subtle pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          <div className="relative z-10 max-w-[900px] mx-auto flex flex-col items-center text-center gap-8">
            <ScrollReveal variant="scaleIn">
              <div className="size-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 rotate-3 hover:rotate-0 transition-transform duration-300">
                <Globe className="w-8 h-8 text-white" />
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fadeUp" delay={0.1}>
              <h2 className="text-white text-3xl md:text-5xl font-bold leading-tight tracking-tight">
                SDG 13 Climate Action
              </h2>
            </ScrollReveal>

            <ScrollReveal variant="fadeUp" delay={0.2}>
              <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-xl">
                Join the global movement towards net-zero emissions. Our
                platform aligns directly with UN Sustainable Development Goals
                to combat climate change and its impacts.
              </p>
            </ScrollReveal>

            <ScrollReveal variant="fadeUp" delay={0.25}>
              <div className="grid grid-cols-3 gap-8 mt-2">
                {[
                  { value: "180+", label: "Countries" },
                  { value: "15M", label: "Tons CO₂ Tracked" },
                  { value: "99%", label: "Platform Uptime" },
                ].map((metric, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="text-white text-2xl md:text-3xl font-bold tabular-nums">
                      {metric.value}
                    </span>
                    <span className="text-white/60 text-xs font-medium uppercase tracking-wider">
                      {metric.label}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fadeUp" delay={0.3}>
              <MagneticButton strength={0.15}>
                <button className="group flex items-center gap-2 rounded-xl h-12 px-8 bg-white text-primary text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_40px] hover:shadow-white/20 hover:-translate-y-0.5 active:translate-y-0">
                  Learn More about SDG Impact
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </MagneticButton>
            </ScrollReveal>
          </div>
        </section>

        {/* ========== CTA ========== */}
        <section className="py-24 px-4">
          <ScrollReveal
            variant="fadeUp"
            className="max-w-xl mx-auto text-center"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                <Leaf className="w-6 h-6 text-primary" />
              </div>

              <h2 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-bold tracking-tight">
                Ready to reduce
                <br />
                your footprint?
              </h2>

              <p className="text-slate-500 dark:text-slate-400 text-base max-w-md leading-relaxed">
                Get a personalized demo of Carbon-Trace and see how we can help
                your organization reach its sustainability targets.
              </p>

              <div className="flex w-full max-w-md gap-2 mt-2">
                <input
                  className="flex-1 h-12 px-4 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground dark:text-white text-sm outline-none transition-all placeholder:text-muted-foreground"
                  placeholder="Enter your work email"
                  type="email"
                />
                <MagneticButton strength={0.1}>
                  <button className="h-12 px-6 bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 whitespace-nowrap">
                    Get Started
                  </button>
                </MagneticButton>
              </div>

              <p className="text-slate-400 text-xs">
                Free 14-day trial · No credit card required
              </p>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
