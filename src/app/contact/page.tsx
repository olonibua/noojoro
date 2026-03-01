"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

const contactInfo = [
  { label: "Email", value: "hello@noojoro.com", href: "mailto:hello@noojoro.com" },
  { label: "Phone", value: "+234 XXX XXX XXXX", href: "tel:+234XXXXXXXXXX" },
  { label: "Location", value: "Lagos, Nigeria", href: null },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen t-bg t-text">
      <Navbar />

      {/* Hero */}
      <section className="section-hero-eco px-6 pb-16 pt-40 text-center">
        <div className="mx-auto max-w-3xl animate-slide-up">
          <div className="badge-eco mb-4 inline-block">Get In Touch</div>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            Let&rsquo;s Talk
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg t-text-muted">
            Have questions about No Ojoro? Want to see a demo? We&rsquo;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="section-alt px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-5">
          {/* Info */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {contactInfo.map((info) => (
              <div key={info.label} className="card-elevated p-6">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider t-text-faint">{info.label}</p>
                {info.href ? (
                  <a href={info.href} className="text-lg font-semibold t-text transition-colors hover:text-eco">
                    {info.value}
                  </a>
                ) : (
                  <p className="text-lg font-semibold">{info.value}</p>
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="card-featured p-8 sm:p-10 lg:col-span-3">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="t-icon-container mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-eco" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mb-2 text-2xl font-bold">Message Sent!</h3>
                <p className="t-text-muted">We&rsquo;ll get back to you within 24 hours.</p>
                <button
                  onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "", message: "" }); }}
                  className="mt-6 text-sm font-semibold text-eco hover:text-eco-dark"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="mb-6 text-2xl font-bold">Send a Message</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-1.5 block text-sm font-medium t-text-secondary">Full Name</label>
                      <input id="name" type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full t-input px-4 py-3 text-sm outline-none" placeholder="Your name" />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-1.5 block text-sm font-medium t-text-secondary">Email</label>
                      <input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full t-input px-4 py-3 text-sm outline-none" placeholder="you@example.com" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="mb-1.5 block text-sm font-medium t-text-secondary">Subject</label>
                    <input id="subject" type="text" required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full t-input px-4 py-3 text-sm outline-none" placeholder="What is this about?" />
                  </div>
                  <div>
                    <label htmlFor="message" className="mb-1.5 block text-sm font-medium t-text-secondary">Message</label>
                    <textarea id="message" required rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full resize-none t-input px-4 py-3 text-sm outline-none" placeholder="Tell us how we can help..." />
                  </div>
                  <button type="submit" className="btn-primary rounded-full py-3.5 font-semibold">
                    Send Message
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA — dark */}
      <section className="section-dark px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-[#F0F3EF] sm:text-3xl">Ready to Get Started?</h2>
          <p className="mx-auto mt-4 max-w-xl text-[#9CA396]">
            Join hundreds of caterers and bar owners already using No Ojoro.
          </p>
          <Link
            href="?auth=register" scroll={false}
            className="glow-green mt-8 inline-flex items-center gap-2 rounded-full bg-eco px-8 py-4 font-bold text-white hover:bg-eco-dark"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
