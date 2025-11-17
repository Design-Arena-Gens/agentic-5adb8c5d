import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DMSProvider } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DocumentManagement DMS",
  description:
    "21 CFR Part 11 compliant pharmaceutical document management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-slate-50">
      <body className={inter.className}>
        <DMSProvider>
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-slate-200 bg-white">
              <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-primary-700">
                    DocumentManagement
                  </h1>
                  <p className="text-sm text-slate-500">
                    GMP & 21 CFR Part 11 compliant document control
                  </p>
                </div>
                <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
                  <a href="/" className="hover:text-primary-600">
                    Dashboard
                  </a>
                  <a href="/documents" className="hover:text-primary-600">
                    Documents
                  </a>
                  <a href="/workflows" className="hover:text-primary-600">
                    Workflows
                  </a>
                </nav>
              </div>
            </header>
            <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8">
              {children}
            </main>
            <footer className="bg-white border-t border-slate-200">
              <div className="mx-auto max-w-7xl px-6 py-4 text-xs text-slate-500">
                © {new Date().getFullYear()} DocumentManagement DMS. Validated
                for regulated pharmaceutical environments.
              </div>
            </footer>
          </div>
        </DMSProvider>
      </body>
    </html>
  );
}
