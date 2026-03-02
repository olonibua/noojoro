import Link from "next/link";

export default function Footer() {
  return (
    <footer className="section-alt border-t t-border">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-eco shadow-md shadow-eco/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xl font-bold t-text">
                No <span className="text-eco">Ojoro</span>
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed t-text-muted">
              Token-controlled event and hospitality operations platform built for Nigeria.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider t-text-faint">Product</h4>
            <ul className="flex flex-col gap-3">
              {[
                { href: "/#features", label: "Features" },
                { href: "/#how-it-works", label: "How It Works" },
                { href: "/#pricing", label: "Pricing" },
                { href: "/referrals", label: "My Network" },
                { href: "/about", label: "About" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm t-text-muted transition-colors hover:text-eco">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider t-text-faint">Solutions</h4>
            <ul className="flex flex-col gap-3">
              {[
                { href: "/register", label: "For Caterers" },
                { href: "/register", label: "For Bars & Lounges" },
                { href: "/celebrant", label: "For Event Owners" },
                { href: "/staff", label: "For Staff" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm t-text-muted transition-colors hover:text-eco">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider t-text-faint">Support</h4>
            <ul className="flex flex-col gap-3">
              {[
                { href: "/contact", label: "Contact Us" },
                { href: "/contact", label: "Help Center" },
                { href: "/contact", label: "Privacy Policy" },
                { href: "/contact", label: "Terms of Service" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm t-text-muted transition-colors hover:text-eco">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t t-border pt-8 sm:flex-row">
          <p className="text-xs t-text-faint">&copy; {new Date().getFullYear()} No Ojoro. All rights reserved.</p>
          <p className="text-xs t-text-ghost">Built for Nigeria.</p>
        </div>
      </div>
    </footer>
  );
}
