"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

const values = [
  {
    title: "Zero Tolerance for Fraud",
    description: "Every token is single-use, every delivery is verified, and every action is logged.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Built for Nigerian Reality",
    description: "We design for poor internet, low-end phones, direct sunlight, and chaotic environments.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Full Transparency",
    description: "Caterers see everything in real time. Celebrants monitor their events live. No black boxes.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: "Hospitality First",
    description: "Technology should enhance the guest experience, not complicate it.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen t-bg t-text">
      <Navbar />

      {/* Hero */}
      <section className="section-hero-eco px-6 pb-20 pt-40 text-center">
        <div className="mx-auto max-w-3xl animate-slide-up">
          <div className="badge-eco mb-4 inline-block">Our Story</div>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
            We&rsquo;re on a Mission to End <span className="text-gradient">Ojoro</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed t-text-muted">
            No Ojoro was born from a simple frustration: watching caterers lose money,
            guests go unserved, and staff get blamed for chaos no one could control.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="section-alt px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-6 text-2xl font-bold sm:text-3xl">The Problem We Saw</h2>
              <p className="mb-4 leading-relaxed t-text-muted">
                At every Nigerian event &mdash; weddings, birthdays, corporate launches &mdash; the same story repeats:
                caterers prepare enough food, but guests complain it ran out.
              </p>
              <p className="mb-4 leading-relaxed t-text-muted">
                Staff serve the same table twice while another waits. The celebrant is stressed,
                the caterer is frustrated, and nobody has data to know what happened.
              </p>
              <p className="leading-relaxed t-text-muted">
                The root cause: <strong className="t-text">there was no system.</strong> No accountability. No visibility. Just chaos.
              </p>
            </div>
            <div className="card-elevated overflow-hidden">
              <Image src="/illustrations/before-chaos.png" alt="Before No Ojoro" width={560} height={380} className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="card-elevated overflow-hidden lg:order-1">
              <Image src="/illustrations/after-noojoro.png" alt="With No Ojoro" width={560} height={380} className="w-full" />
            </div>
            <div className="lg:order-2">
              <h2 className="mb-6 text-2xl font-bold sm:text-3xl">The Solution We Built</h2>
              <p className="mb-4 leading-relaxed t-text-muted">
                No Ojoro replaces guesswork with a real system. Every guest gets a unique token.
                Every order is tracked. Every delivery is verified by scan.
              </p>
              <p className="leading-relaxed t-text-muted">
                The result: <strong className="t-text">happier guests, zero waste, and caterers who can prove their work.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-alt px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">What We Believe</h2>
          <p className="mt-4 text-lg t-text-muted">The principles that guide every feature we build.</p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="card-elevated p-8">
              <div className="t-icon-container mb-4 flex h-12 w-12 items-center justify-center text-eco">
                {v.icon}
              </div>
              <h3 className="mb-2 text-lg font-bold">{v.title}</h3>
              <p className="text-sm leading-relaxed t-text-muted">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vision */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Our Vision</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed t-text-muted">
            We are building event and hospitality execution infrastructure for Africa &mdash;
            the system that makes every meal trackable, every delivery verifiable, and every operation transparent.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="section-dark px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-[#F0F3EF] sm:text-3xl">Join the Movement</h2>
          <p className="mt-4 text-[#9CA396]">
            Whether you&rsquo;re a caterer serving 500 guests or a bar owner running Friday night, No Ojoro is built for you.
          </p>
          <Link
            href="?auth=register" scroll={false}
            className="glow-green mt-8 inline-flex items-center gap-2 rounded-full bg-eco px-8 py-4 font-bold text-white hover:bg-eco-dark"
          >
            Get Started
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
