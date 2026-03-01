"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

const values = [
  { title: "Zero Tolerance for Fraud", description: "Every token is single-use, every delivery is verified, and every action is logged." },
  { title: "Built for Nigerian Reality", description: "We design for poor internet, low-end phones, direct sunlight, and chaotic environments." },
  { title: "Full Transparency", description: "Caterers see everything in real time. Celebrants monitor their events live. No black boxes." },
  { title: "Hospitality First", description: "Technology should enhance the guest experience, not complicate it." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen t-bg t-text">
      <Navbar />

      {/* Hero */}
      <section className="px-6 pb-20 pt-40 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest t-text-muted">Our Story</p>
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
            <div className="overflow-hidden rounded-2xl border t-border">
              <Image src="/illustrations/before-chaos.png" alt="Before No Ojoro" width={560} height={380} className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="overflow-hidden rounded-2xl border t-border lg:order-1">
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

      {/* Values — dark section */}
      <section className="section-dark px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">What We Believe</h2>
          <p className="mt-4 text-lg text-neutral-400">The principles that guide every feature we build.</p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <h3 className="mb-2 text-lg font-bold text-white">{v.title}</h3>
              <p className="text-sm leading-relaxed text-neutral-400">{v.description}</p>
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

      {/* CTA — dark */}
      <section className="section-dark px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Join the Movement</h2>
          <p className="mt-4 text-neutral-400">
            Whether you&rsquo;re a caterer serving 500 guests or a bar owner running Friday night, No Ojoro is built for you.
          </p>
          <Link
            href="?auth=register" scroll={false}
            className="glow-green mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-4 font-bold text-white"
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
