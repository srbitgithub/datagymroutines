import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TranslationProvider } from "@/core/i18n/TranslationContext";
import { ThemeProvider } from "@/core/theme/ThemeContext";
import { PWAUpdateToast } from "@/components/pwa/PWAUpdateToast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IronMetric | Cuaderno Digital de Fuerza",
  description: "Tecnología invisible para atletas de alto rendimiento.",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IronMetric",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function() {
            try {
              var theme = localStorage.getItem('theme');
              if (theme === 'light') {
                document.documentElement.classList.add('light');
              }
            } catch (e) {}
          })()`
        }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>
          <TranslationProvider>
            {children}
            <PWAUpdateToast />
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
