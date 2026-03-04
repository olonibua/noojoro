import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ui/ThemeProvider";
import AuthModal from "@/components/ui/AuthModal";

export const metadata: Metadata = {
  title: "No Ojoro - Event & Hospitality Operations",
  description:
    "Token-controlled event and hospitality operations platform for Nigeria",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Lora:ital,wght@0,400;0,700;1,400;1,700&family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <AuthModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
