import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { FinanceProvider } from "@/lib/store";
import Navbar from "@/components/Navbar";
import FinanceChatbot from "@/components/FinanceChatbot";
import AuthGate from "@/components/AuthGate";

export const metadata: Metadata = {
  title: "Your Personal FinTrack",
  description: "Manage Money Better and Wiser, Get Richer Faster! — financial tracker & planner: income, expenses, cash flow, saving, dan investment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <LanguageProvider>
          <AuthProvider>
            <FinanceProvider>
              <div className="app-shell">
                <Navbar />
                <main className="container">
                  <AuthGate>{children}</AuthGate>
                </main>
                <footer className="footer">
                  Made with 💙 by <b>Tania</b> to Manage Money Better and Wiser
                </footer>
                <FinanceChatbot />
              </div>
            </FinanceProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
