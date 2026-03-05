"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-eco" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

function ReferralRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const ref = searchParams.get("ref");
    const auth = searchParams.get("auth");
    if (ref && !auth) {
      router.replace(`/?auth=register&ref=${ref}`, { scroll: false });
    }
  }, [searchParams, router]);

  return null;
}

export default function LandingPage() {
  return (
    <div className="min-h-screen t-bg t-text">
      <Suspense fallback={null}>
        <ReferralRedirect />
      </Suspense>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative px-6 pt-28 pb-20 lg:pt-36 lg:pb-28 t-bg mesh-gradient overflow-hidden">
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left: Text */}
            <div className="animate-slide-up-lg">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border t-border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-eco">
                <span className="h-1.5 w-1.5 rounded-full bg-eco animate-pulse" />
                Event &amp; Hospitality Operations
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
                  className="animate-pulse-glow inline-flex items-center justify-center gap-2 rounded-full bg-eco px-8 py-4 text-lg font-bold text-white hover:bg-eco-dark transition-all hover:scale-[1.02]"
                >
                  Get Started Free
                  <ArrowRight />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-full border t-border px-8 py-4 text-lg font-semibold t-text-secondary transition-all hover:text-eco hover:border-eco hover:scale-[1.02]"
                >
                  See How It Works
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-6 text-sm t-text-faint">
                <span className="flex items-center gap-1.5"><Check /> Zero double-servings</span>
                <span className="flex items-center gap-1.5"><Check /> Works on 3G</span>
                <span className="flex items-center gap-1.5"><Check /> Set up in minutes</span>
              </div>

              {/* View Live Event */}
              <div className="mt-12 card-glass p-6">
                <h3 className="mb-3 text-lg font-bold t-text">View Live Event</h3>
                <p className="mb-4 text-sm t-text-muted">
                  Have an event ID? Monitor your event in real-time.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const eventId = formData.get("eventId");
                    if (eventId) {
                      window.location.href = `/live/${eventId}`;
                    }
                  }}
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  <input
                    type="text"
                    name="eventId"
                    placeholder="Enter Event ID"
                    required
                    className="flex-1 t-input px-4 py-3 text-sm outline-none"
                  />
                  <button
                    type="submit"
                    className="btn-primary px-6 py-3 text-sm"
                  >
                    View Live
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Illustration */}
            <div className="flex justify-center lg:justify-end animate-slide-up-lg delay-200">
              <div className="w-full max-w-md lg:max-w-lg overflow-hidden rounded-[24px] border t-border shadow-xl shadow-black/5 animate-float">
                <Image
                  src="/illustrations/dashboard.png"
                  alt="No Ojoro live dashboard"
                  width={560}
                  height={560}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BEFORE / AFTER ═══ */}
      <section className="section-dark-gradient px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">The Problem We Solve</h2>
          <p className="mt-4 text-lg text-neutral-400">
            At every Nigerian event the same story repeats. We built the system to fix it.
          </p>
        </div>
        <div className="mx-auto mt-14 grid max-w-5xl gap-8 sm:grid-cols-2">
          <div className="group rounded-[24px] border border-white/6 bg-white/[0.03] overflow-hidden transition-all hover:border-red-500/20">
            <div className="overflow-hidden">
              <Image src="/illustrations/before-chaos.png" alt="Before: Chaotic event service" width={600} height={400} className="w-full h-auto transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="bg-red-500/8 border-t border-red-500/10 p-4 text-center">
              <p className="text-sm font-bold text-red-400">Before: Chaos &amp; Double-Serving</p>
            </div>
          </div>
          <div className="group rounded-[24px] border border-white/6 bg-white/[0.03] overflow-hidden transition-all hover:border-emerald-500/20">
            <div className="overflow-hidden">
              <Image src="/illustrations/after-noojoro.png" alt="After: Organized with No Ojoro" width={600} height={400} className="w-full h-auto transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="bg-emerald-500/8 border-t border-emerald-500/10 p-4 text-center">
              <p className="text-sm font-bold text-eco-light">After: Organized &amp; Fraud-Proof</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="px-6 py-16 t-bg">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card-elevated p-6 text-center">
              <p className="text-3xl font-bold text-gradient">
                {stat.value}<span className="text-lg">{stat.suffix}</span>
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
      <section id="features" className="section-dark-gradient px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Everything You Need to Eliminate Ojoro
              </h2>
              <p className="mt-4 text-lg text-neutral-400">
                Built for Nigerian events — poor internet, large crowds, and high-pressure serving windows.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature.title} className="group rounded-[20px] border border-white/6 bg-white/[0.03] p-5 transition-all hover:border-emerald-500/20 hover:bg-emerald-500/[0.03]">
                    <h3 className="mb-1.5 text-sm font-bold text-white">{feature.title}</h3>
                    <p className="text-xs leading-relaxed text-neutral-400">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <Image src="/illustrations/phone-ordering.png" alt="Mobile ordering" width={480} height={480} className="rounded-[24px] shadow-2xl shadow-black/30" />
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
              <span className="rounded-full bg-eco px-5 py-1.5 text-sm font-bold text-white">Catering Mode</span>
              <div className="h-px flex-1 t-border border-t" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cateringSteps.map((item) => (
                <div key={item.step} className="card-elevated p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-eco/10 text-lg font-bold text-eco">
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
              <span className="rounded-full border-2 border-eco px-5 py-1.5 text-sm font-bold text-eco">Bar Mode</span>
              <div className="h-px flex-1 t-border border-t" />
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {barSteps.map((item) => (
                <div key={item.step} className="card-elevated p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-eco text-lg font-bold text-eco">
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
      <section className="section-dark-gradient px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Trusted by Real People</h2>
            <p className="mt-4 text-lg text-neutral-400">
              Hear from caterers, bar owners, and event hosts who use No Ojoro.
            </p>
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="flex justify-center">
              <Image src="/illustrations/dashboard.png" alt="No Ojoro dashboard" width={500} height={500} className="rounded-[24px] shadow-2xl shadow-black/30" />
            </div>
            <div className="space-y-5">
              {testimonials.map((t) => (
                <div key={t.name} className="rounded-[20px] border border-white/6 bg-white/[0.03] p-6 transition-all hover:border-white/12">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-neutral-300 italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-eco to-eco-dark text-sm font-bold text-white">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-neutral-500">{t.role}</p>
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
              <div className="absolute right-0 top-0 rounded-bl-[20px] bg-eco px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
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
              <Link href="?auth=register" scroll={false} className="glow-green block rounded-full bg-eco py-3.5 text-center font-semibold text-white hover:bg-eco-dark">
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
              <Link href="?auth=register" scroll={false} className="block rounded-full border-2 border-eco py-3.5 text-center font-semibold text-eco transition-all hover:bg-eco hover:text-white">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA — dark ═══ */}
      <section className="relative px-6 py-28 overflow-hidden" style={{ background: "linear-gradient(135deg, #0A0A0A 0%, #111 40%, #0F1F12 100%)" }}>
        {/* Decorative glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-eco/5 blur-[120px] pointer-events-none" />
        <div className="relative mx-auto max-w-3xl text-center z-10">
          <h2 className="text-3xl font-bold text-white sm:text-5xl">
            Ready to Eliminate Ojoro?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-neutral-400">
            Join caterers and bar owners across Nigeria who are running smarter, fraud-free operations.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="?auth=register" scroll={false}
              className="animate-pulse-glow inline-flex items-center gap-2 rounded-full bg-eco px-10 py-4 text-lg font-bold text-white hover:bg-eco-dark transition-all hover:scale-[1.02]"
            >
              Get Started Now
              <ArrowRight />
            </Link>
            <Link href="/contact" className="rounded-full border border-white/15 px-8 py-4 font-semibold text-white transition-all hover:bg-white/5 hover:border-white/25">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
