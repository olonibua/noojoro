"use client";

import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

const levels = [
  {
    level: "Level 1",
    label: "Direct Referral",
    rate: "15%",
    description:
      "You earn 15% commission on every payment made by someone you referred directly.",
    example: "You refer Bola. Bola pays 10,000 for tokens. You earn 1,500.",
  },
  {
    level: "Level 2",
    label: "Your Referral\u2019s Referral",
    rate: "3 \u2013 6%",
    description:
      "You earn 3% on payments made by people your direct referrals bring in. Upload event proof photos to boost this to 6%.",
    example:
      "Bola refers Chidi. Chidi pays 10,000. You earn 300 (or 600 with event proof bonus).",
  },
  {
    level: "Level 3",
    label: "Three Levels Deep",
    rate: "2%",
    description:
      "You earn 2% on payments made by people at the third level of your network.",
    example:
      "Chidi refers Dami. Dami pays 10,000. You earn 200.",
  },
];

const steps = [
  {
    step: "1",
    title: "Sign Up & Get Your Code",
    description:
      "Create a free No Ojoro account. You\u2019ll instantly receive a unique referral code (e.g. NJ-A3K9MX2B) and a shareable link.",
  },
  {
    step: "2",
    title: "Share Your Link",
    description:
      "Send your referral link to caterers, event planners, and bar owners. When they sign up using your link, they\u2019re added to your network.",
  },
  {
    step: "3",
    title: "Earn on Every Payment",
    description:
      "Whenever someone in your network (up to 3 levels deep) purchases tokens for their events, you automatically earn a commission.",
  },
  {
    step: "4",
    title: "Withdraw Anytime",
    description:
      "Track your earnings in real time from your dashboard. Request a withdrawal to your bank account whenever you\u2019re ready.",
  },
];

const faqs = [
  {
    q: "Is there a limit to how many people I can refer?",
    a: "No. You can refer as many people as you want. There\u2019s no cap on referrals or earnings.",
  },
  {
    q: "When do I get paid?",
    a: "Commissions are credited instantly to your wallet when a referred user makes a payment. You can request a withdrawal at any time.",
  },
  {
    q: "What is the event proof bonus?",
    a: "If the person making the payment has uploaded photos proving No Ojoro was used at their event (tokens on tables, branding, etc.) and the proof is approved, your Level 2 commission doubles from 3% to 6%.",
  },
  {
    q: "How does withdrawal work?",
    a: "From your referral dashboard, enter the amount you want to withdraw along with your bank details. Our team processes withdrawal requests and sends the funds to your account.",
  },
  {
    q: "Can I see who\u2019s in my network?",
    a: "Yes. Your referral dashboard shows your full 3-level network, including when each person joined and how much commission they\u2019ve generated for you.",
  },
];

export default function ReferralsPage() {
  return (
    <div className="min-h-screen t-bg t-text">
      <Navbar />

      {/* Hero */}
      <section className="section-hero-eco px-6 pb-20 pt-40 text-center">
        <div className="mx-auto max-w-3xl animate-slide-up">
          <div className="badge-eco mb-4 inline-block">Referral Programme</div>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
            Earn Up to <span className="text-gradient">15%</span> on Every Referral
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed t-text-muted">
            Invite caterers, event planners, and bar owners to No Ojoro. Earn commission on their payments &mdash; up to 3 levels deep.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="?auth=register"
              scroll={false}
              className="glow-green rounded-full bg-eco px-8 py-4 font-bold text-white transition-all hover:bg-eco-dark"
            >
              Start Earning
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border t-border px-8 py-4 font-bold t-text-secondary transition-colors hover:text-eco hover:border-eco"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Commission Structure */}
      <section className="section-alt px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Commission Structure</h2>
            <p className="mt-4 text-lg t-text-muted">
              Three levels of earnings. The more your network grows, the more you earn.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {levels.map((l) => (
              <div key={l.level} className="card-elevated rounded-2xl p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-eco/10">
                  <span className="text-xl font-extrabold text-eco">{l.rate}</span>
                </div>
                <h3 className="text-lg font-bold t-text">{l.level}</h3>
                <p className="mt-1 text-sm font-medium text-eco">{l.label}</p>
                <p className="mt-3 text-sm leading-relaxed t-text-muted">{l.description}</p>
                <div className="mt-4 rounded-xl bg-eco/5 px-4 py-3">
                  <p className="text-xs leading-relaxed t-text-muted">
                    <span className="font-semibold t-text">Example:</span> {l.example}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg t-text-muted">Four simple steps to start earning.</p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {steps.map((s) => (
              <div key={s.step} className="flex gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-eco font-bold text-white shadow-md shadow-eco/20">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-base font-bold t-text">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed t-text-muted">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Proof Bonus */}
      <section className="section-alt px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="card-elevated rounded-2xl border-l-4 border-eco p-8 sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-eco/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-eco" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold t-text">Event Proof Bonus</h3>
                <p className="mt-2 text-base leading-relaxed t-text-muted">
                  Double your Level 2 commission from <strong className="t-text">3% to 6%</strong> by
                  uploading photos that prove No Ojoro was used at your events &mdash; tokens on
                  the table, branded materials, or any visible proof.
                </p>
                <p className="mt-3 text-sm t-text-muted">
                  Once your proof is approved by our team, the bonus rate applies automatically to
                  all Level 2 payments tied to that event.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Example Scenario */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">See the Earnings Add Up</h2>
            <p className="mt-4 text-lg t-text-muted">
              Here&rsquo;s what a growing network could look like.
            </p>
          </div>

          <div className="mt-12 card-elevated rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b t-border bg-eco/5">
                    <th className="px-6 py-4 font-semibold t-text">Scenario</th>
                    <th className="px-6 py-4 font-semibold t-text text-right">Payment</th>
                    <th className="px-6 py-4 font-semibold t-text text-right">Your Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y t-border">
                  <tr>
                    <td className="px-6 py-4 t-text-muted">Your direct referral buys tokens</td>
                    <td className="px-6 py-4 text-right t-text font-medium">50,000</td>
                    <td className="px-6 py-4 text-right text-eco font-bold">7,500</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 t-text-muted">Their referral buys tokens</td>
                    <td className="px-6 py-4 text-right t-text font-medium">50,000</td>
                    <td className="px-6 py-4 text-right text-eco font-bold">1,500</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 t-text-muted">Their referral buys tokens (L3)</td>
                    <td className="px-6 py-4 text-right t-text font-medium">50,000</td>
                    <td className="px-6 py-4 text-right text-eco font-bold">1,000</td>
                  </tr>
                  <tr className="bg-eco/5">
                    <td className="px-6 py-4 font-bold t-text">Total from 3 payments</td>
                    <td className="px-6 py-4 text-right t-text font-bold">150,000</td>
                    <td className="px-6 py-4 text-right text-eco font-extrabold">10,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-4 text-center text-sm t-text-faint">
            Now imagine 10, 50, or 100 active users in your network &mdash; each running events every month.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-alt px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h2>
          </div>
          <div className="mt-12 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="card-elevated rounded-2xl p-6">
                <h3 className="font-bold t-text">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed t-text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-dark px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-[#F0F3EF] sm:text-3xl">
            Ready to Start Earning?
          </h2>
          <p className="mt-4 text-[#9CA396]">
            Sign up, grab your referral link, and start building your network today.
          </p>
          <Link
            href="?auth=register"
            scroll={false}
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
