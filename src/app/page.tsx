"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

const features = [
  { title: "Fraud-Proof Tokens", description: "Every token is single-use and cryptographically unique. Once burned, it can never be reused." },
  { title: "Real-Time Dashboards", description: "See which tables are served, who is waiting, and what inventory remains — live." },
  { title: "QR + USSD Ordering", description: "Works on any phone — with or without internet. Perfect for Nigerian events." },
  { title: "Staff Traceability", description: "Every delivery is logged with who, when, and where. Full accountability." },
  { title: "VIP Experience", description: "Designate VIP tables with exclusive premium menus that regular guests never see." },
  { title: "Live Inventory Control", description: "Track every plate and bottle in real time. Guests get notified when items run out." },
];

const cateringSteps = [
  { step: "01", title: "Create Your Event", description: "Set up tables, menus, quantities, and assign staff." },
  { step: "02", title: "Activate & Print Tokens", description: "Pay to activate tokens. Print the PDF — 16 per A4 page." },
  { step: "03", title: "Guests Order Seamlessly", description: "Guests scan QR or dial USSD to browse the menu and order." },
  { step: "04", title: "Staff Confirm & You Track", description: "Staff deliver and scan to confirm. You see everything live." },
];

const barSteps = [
  { step: "01", title: "Set Up Your Venue", description: "Create your bar profile, define tables, and build your drink menu." },
  { step: "02", title: "Place QR Codes on Tables", description: "Print and place QR stickers on each table. Customers scan to order." },
  { step: "03", title: "Customers Order & You Fulfill", description: "Customers order from their phones. Staff sees orders in real time." },
];

const stats = [
  { value: "0", label: "Duplicate Servings", suffix: "" },
  { value: "< 2", label: "Second Load Time on 3G", suffix: "s" },
  { value: "10K", label: "Concurrent Users Supported", suffix: "+" },
  { value: "100", label: "Token Burn Speed", suffix: "ms" },
];

const testimonials = [
  { quote: "We used to lose 30% of food to double-serving at weddings. With No Ojoro, every plate is accounted for.", name: "Chef Amaka O.", role: "Caterer, Lagos" },
  { quote: "The bar QR ordering changed our Saturday nights. No more shouting over music.", name: "Mike A.", role: "Bar Owner, Abuja" },
  { quote: "As a celebrant, I could see how my guests were being served in real time. That peace of mind is priceless.", name: "Mrs. Folake T.", role: "Event Host, Port Harcourt" },
];

const Check = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-[#8BC34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen t-bg t-text">
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="section-hero-eco relative overflow-hidden px-6 pt-28 pb-20 lg:pt-32 lg:pb-28">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-[#8BC34A]/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-[#4CAF50]/6 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[#A5D66F]/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Text */}
            <div className="animate-slide-up">
              <div className="t-badge mb-6 inline-flex items-center gap-2 px-4 py-1.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-[#8BC34A]" />
                <span className="text-xs font-semibold uppercase tracking-widest t-text-muted">
                  Event &amp; Hospitality Operations
                </span>
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.08] sm:text-5xl md:text-6xl lg:text-7xl">
                No More{" "}
                <span className="text-gradient">Ojoro</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed t-text-muted sm:text-xl">
                The token-controlled platform that guarantees every guest gets served, every meal is tracked, and every caterer stays in control.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="?auth=register" scroll={false}
                  className="glow-green inline-flex items-center justify-center gap-2 rounded-full bg-[#8BC34A] px-8 py-4 text-lg font-bold text-white hover:bg-[#7CB342] transition-colors"
                >
                  Get Started Free
                  <ArrowRight />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-full border t-border px-8 py-4 text-lg font-semibold t-text-secondary transition-colors hover:text-[#8BC34A] hover:border-[#8BC34A]"
                >
                  See How It Works
                </Link>
              </div>

              {/* Trust markers */}
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm t-text-faint">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-[#8BC34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Zero double-servings</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-[#8BC34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Works on 3G</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-[#8BC34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Set up in minutes</span>
                </div>
              </div>
            </div>

            {/* Right: Illustration + Glass stat card */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Main illustration */}
              <div className="relative w-full max-w-md lg:max-w-lg">
                <div className="card-glass overflow-hidden p-3">
                  <Image
                    src="/illustrations/dashboard.png"
                    alt="No Ojoro live dashboard"
                    width={560}
                    height={560}
                    className="w-full h-auto rounded-2xl"
                    priority
                  />
                </div>

                {/* Floating stat card — top-left */}
                <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 card-glass px-4 py-3 sm:px-5 sm:py-4 animate-fade-in z-10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8BC34A]/15">
                      <svg className="h-5 w-5 text-[#8BC34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-[#8BC34A]">0</p>
                      <p className="text-[11px] font-medium t-text-muted whitespace-nowrap">Duplicate Servings</p>
                    </div>
                  </div>
                </div>

                {/* Floating stat card — bottom-right */}
                <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 card-glass px-4 py-3 sm:px-5 sm:py-4 animate-fade-in z-10" style={{ animationDelay: "0.2s" }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4CAF50]/15">
                      <svg className="h-5 w-5 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-[#4CAF50]">100<span className="text-sm">ms</span></p>
                      <p className="text-[11px] font-medium t-text-muted whitespace-nowrap">Token Burn Speed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BEFORE / AFTER ═══ */}
      <section className="section-alt px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">The Problem We Solve</h2>
          <p className="mt-4 text-lg t-text-muted">
            At every Nigerian event the same story repeats. We built the system to fix it.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-2">
          <div className="card-elevated overflow-hidden">
            <Image src="/illustrations/before-chaos.png" alt="Before: Chaotic event service" width={600} height={400} className="w-full h-auto" />
            <div className="bg-red-50 p-4 text-center">
              <p className="text-sm font-bold text-red-600">Before: Chaos &amp; Double-Serving</p>
            </div>
          </div>
          <div className="card-elevated overflow-hidden">
            <Image src="/illustrations/after-noojoro.png" alt="After: Organized with No Ojoro" width={600} height={400} className="w-full h-auto" />
            <div className="p-4 text-center" style={{ background: "rgba(139, 195, 74, 0.08)" }}>
              <p className="text-sm font-bold text-[#7CB342]">After: Organized &amp; Fraud-Proof</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="t-stat-bar px-6 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={stat.label} className={`text-center ${index < stats.length - 1 ? "sm:border-r t-border" : ""}`}>
              <p className="stat-number text-[#8BC34A]">
                {stat.value}<span className="text-xl">{stat.suffix}</span>
              </p>
              <p className="stat-label mt-2 t-text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ MODE CARDS ═══ */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Two Powerful Modes</h2>
          <p className="mt-4 text-lg t-text-muted">
            Whether you are managing a catered event or running a bar, No Ojoro has you covered.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2">
          <div className="card-featured p-8">
            <div className="badge-eco mb-4 inline-block">
              Most Popular
            </div>
            <h3 className="mb-3 text-2xl font-bold">Catering Mode</h3>
            <p className="mb-6 leading-relaxed t-text-muted">
              Built for owambe parties, weddings, and corporate events. Issue physical tokens to every guest seat.
            </p>
            <ul className="flex flex-col gap-2">
              {["Single-use physical tokens per seat", "QR + USSD dual ordering", "Staff barcode confirmation", "VIP table menus", "Real-time caterer dashboard"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm t-text-muted">
                  <Check /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card-elevated p-8">
            <h3 className="mb-3 text-2xl font-bold">Bar Mode</h3>
            <p className="mb-6 leading-relaxed t-text-muted">
              Modernize your bar or lounge with QR-code ordering. Customers browse and order from their seats.
            </p>
            <ul className="flex flex-col gap-2">
              {["QR per table — scan and order", "Multiple orders per session", "Real-time drink inventory", "Staff order board", "Revenue analytics"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm t-text-muted">
                  <Check /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="section-alt px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Everything You Need to Eliminate Ojoro
              </h2>
              <p className="mt-4 text-lg t-text-muted">
                Built for Nigerian events — poor internet, large crowds, and high-pressure serving windows.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature.title} className="card-elevated p-5">
                    <h3 className="mb-1 text-sm font-bold">{feature.title}</h3>
                    <p className="text-xs leading-relaxed t-text-muted">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <Image src="/illustrations/phone-ordering.png" alt="Mobile ordering" width={480} height={480} className="rounded-[20px]" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg t-text-muted">Get started in minutes.</p>
          </div>

          <div className="mt-14">
            <Image src="/illustrations/how-it-works.png" alt="How it works" width={1200} height={400} className="w-full h-auto rounded-[20px]" />
          </div>

          {/* Catering Steps */}
          <div className="mt-20">
            <div className="mb-8 flex items-center justify-center gap-3">
              <div className="h-px flex-1 t-border border-t" />
              <span className="rounded-full bg-[#8BC34A] px-5 py-1.5 text-sm font-bold text-white">Catering Mode</span>
              <div className="h-px flex-1 t-border border-t" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cateringSteps.map((item) => (
                <div key={item.step} className="card-elevated p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#8BC34A]/10 text-lg font-bold text-[#8BC34A]">
                    {item.step}
                  </div>
                  <h4 className="mb-2 font-bold">{item.title}</h4>
                  <p className="text-sm leading-relaxed t-text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Steps */}
          <div className="mt-16">
            <div className="mb-8 flex items-center justify-center gap-3">
              <div className="h-px flex-1 t-border border-t" />
              <span className="rounded-full border-2 border-[#8BC34A] px-5 py-1.5 text-sm font-bold text-[#8BC34A]">Bar Mode</span>
              <div className="h-px flex-1 t-border border-t" />
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {barSteps.map((item) => (
                <div key={item.step} className="card-elevated p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#8BC34A] text-lg font-bold text-[#8BC34A]">
                    {item.step}
                  </div>
                  <h4 className="mb-2 font-bold">{item.title}</h4>
                  <p className="text-sm leading-relaxed t-text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS — dark section ═══ */}
      <section className="section-dark px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#F0F3EF] sm:text-4xl">Trusted by Real People</h2>
            <p className="mt-4 text-lg text-[#9CA396]">
              Hear from caterers, bar owners, and event hosts who use No Ojoro.
            </p>
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="flex justify-center">
              <Image src="/illustrations/dashboard.png" alt="No Ojoro dashboard" width={500} height={500} className="rounded-[20px]" />
            </div>
            <div className="space-y-5">
              {testimonials.map((t) => (
                <div key={t.name} className="rounded-[20px] border border-white/8 bg-[#252622] p-6">
                  <p className="mb-4 text-sm leading-relaxed text-[#9CA396] italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8BC34A] text-sm font-bold text-white">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#F0F3EF]">{t.name}</p>
                      <p className="text-xs text-[#6B7366]">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg t-text-muted">Pay only for what you use. No hidden fees.</p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            <div className="card-featured relative p-8">
              <div className="absolute right-0 top-0 rounded-bl-[20px] bg-[#8BC34A] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                Pay Per Event
              </div>
              <h3 className="mb-2 text-2xl font-bold">Catering Mode</h3>
              <p className="mb-6 text-sm t-text-muted">Perfect for weddings, birthdays, and corporate events.</p>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-gradient">Per Token</span>
                <p className="mt-2 text-sm t-text-faint">Price based on number of guests.</p>
              </div>
              <ul className="mb-8 flex flex-col gap-3">
                {["Unlimited menu items", "QR + USSD ordering", "Staff confirmation system", "Real-time dashboard", "Celebrant live view", "VIP table support", "Full audit trail", "Print-ready token PDFs"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm t-text-muted">
                    <Check /> {item}
                  </li>
                ))}
              </ul>
              <Link href="?auth=register" scroll={false} className="glow-green block rounded-full bg-[#8BC34A] py-3.5 text-center font-semibold text-white hover:bg-[#7CB342]">
                Start Creating Events
              </Link>
            </div>

            <div className="card-elevated relative p-8">
              <div className="absolute right-0 top-0 rounded-bl-[20px] badge-eco px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                Monthly Plan
              </div>
              <h3 className="mb-2 text-2xl font-bold">Bar Mode</h3>
              <p className="mb-6 text-sm t-text-muted">For bars, lounges, and drink-focused venues.</p>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-gradient">Flexible</span>
                <p className="mt-2 text-sm t-text-faint">Monthly subscription or per-order pricing.</p>
              </div>
              <ul className="mb-8 flex flex-col gap-3">
                {["Unlimited drink menu items", "QR code per table", "Multiple orders per session", "Real-time order board", "Drink inventory tracking", "Revenue analytics", "Staff metrics", "Free table QR stickers"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm t-text-muted">
                    <Check /> {item}
                  </li>
                ))}
              </ul>
              <Link href="?auth=register" scroll={false} className="block rounded-full border-2 border-[#8BC34A] py-3.5 text-center font-semibold text-[#8BC34A] transition-all hover:bg-[#8BC34A] hover:text-white">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA — dark ═══ */}
      <section className="section-dark px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-[#F0F3EF] sm:text-4xl">
            Ready to Eliminate Ojoro?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#9CA396]">
            Join caterers and bar owners across Nigeria who are running smarter, fraud-free operations.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="?auth=register" scroll={false}
              className="glow-green inline-flex items-center gap-2 rounded-full bg-[#8BC34A] px-10 py-4 text-lg font-bold text-white hover:bg-[#7CB342]"
            >
              Get Started Now
              <ArrowRight />
            </Link>
            <Link href="/contact" className="rounded-full border border-white/20 px-8 py-4 font-semibold text-[#F0F3EF] transition-all hover:bg-[#8BC34A] hover:border-[#8BC34A] hover:text-white">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
